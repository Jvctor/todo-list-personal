import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { TimeField } from "./TimeField";
import {
  DEFAULT_DUE_TIME,
  WEEKDAY_INITIALS,
  addMonths,
  combineDateAndTime,
  extractTime,
  formatDueLabel,
  formatFullDate,
  formatMonthYear,
  getMonthCells,
  isSameDay,
  startOfMonth,
} from "../../utils/dates";

interface DateTimePickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
  disabled?: boolean;
}

function getInitialMonth(value: number | null): Date {
  if (value === null) {
    return startOfMonth(new Date());
  }
  return startOfMonth(new Date(value));
}

function getInitialTime(value: number | null): string {
  if (value === null) {
    return DEFAULT_DUE_TIME;
  }
  return extractTime(value);
}

function getTriggerLabel(value: number | null): string {
  if (value === null) {
    return "Adicionar lembrete";
  }
  return formatDueLabel(value);
}

// Vazio = contorno tracejado (um convite). Preenchido = pílula tangerina sólida
// (um fato). A forma já conta o estado antes de o texto ser lido.
function getTriggerClasses(value: number | null): string {
  const base =
    "flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60";
  if (value === null) {
    return `${base} border-dashed border-field-border bg-sunken text-muted hover:border-accent hover:text-accent`;
  }
  return `${base} border-transparent bg-tangerine/15 text-tangerine`;
}

interface DayCellProps {
  date: Date;
  value: number | null;
  onPick: (date: Date) => void;
}

function DayCell({ date, value, onPick }: DayCellProps) {
  const selected = value !== null && isSameDay(date, value);
  const today = isSameDay(date, Date.now());

  function getClasses(): string {
    const base =
      "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
    if (selected) {
      return `${base} bg-linear-to-br from-accent to-tangerine text-white shadow-pop`;
    }
    if (today) {
      return `${base} font-bold text-accent hover:scale-110 hover:bg-sunken`;
    }
    return `${base} text-fg hover:scale-110 hover:bg-sunken`;
  }

  return (
    <button
      type="button"
      onClick={() => onPick(date)}
      aria-pressed={selected}
      aria-label={formatFullDate(date)}
      className={getClasses()}
    >
      {date.getDate()}
    </button>
  );
}

export function DateTimePicker({
  value,
  onChange,
  label,
  disabled = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => getInitialMonth(value));
  const [time, setTime] = useState(() => getInitialTime(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const dialogId = useId();

  // Reabrir o picker deve mostrar o mês e a hora do valor atual, não o de antes.
  function open() {
    setViewMonth(getInitialMonth(value));
    setTime(getInitialTime(value));
    setIsOpen(true);
  }

  function toggle() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    open();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  function pickDay(date: Date) {
    onChange(combineDateAndTime(date, time));
  }

  // Trocar o horário sem ter escolhido um dia só guarda a escolha: ela é aplicada
  // quando o dia for clicado. Sem isso, mexer na hora criaria um lembrete "hoje"
  // que o usuário não pediu.
  function changeTime(nextTime: string) {
    setTime(nextTime);

    if (value !== null) {
      onChange(combineDateAndTime(new Date(value), nextTime));
      return;
    }

    // Sem dia escolhido, mexer no horário não fazia NADA — era preciso adivinhar
    // que o dia vinha primeiro. Agora a hora sozinha já vale: assume hoje, ou
    // amanhã se o horário de hoje já passou (um lembrete no passado não serve).
    const today = combineDateAndTime(new Date(), nextTime);
    if (today > Date.now()) {
      onChange(today);
      return;
    }

    // `setDate(+1)` em vez de somar 24h em ms: no dia da virada do horário de
    // verão o dia não tem 24h, e a hora escolhida escorregaria.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onChange(combineDateAndTime(tomorrow, nextTime));
  }

  function clear() {
    onChange(null);
    setTime(DEFAULT_DUE_TIME);
    setIsOpen(false);
  }

  // O picker vive dentro de um <form> e dentro do modo de edição da tarefa, que
  // já escutam Enter e Escape. Sem parar a propagação, Escape aqui cancelaria a
  // edição inteira em vez de só fechar o calendário.
  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.stopPropagation();
    }
  }

  const cells = getMonthCells(viewMonth);

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className="relative w-fit">
      <span id={triggerId} className="sr-only">
        {label}
      </span>

      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-labelledby={triggerId}
        className={getTriggerClasses(value)}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} aria-hidden="true" />
        <span>{getTriggerLabel(value)}</span>
      </button>

      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-[calc(100%+0.625rem)] z-30 w-76 rounded-card border border-field-border bg-card p-4 shadow-lift"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              aria-label="Mês anterior"
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-sunken hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <p aria-live="polite" className="font-display text-base font-semibold text-fg">
              {formatMonthYear(viewMonth)}
            </p>

            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              aria-label="Próximo mês"
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-sunken hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* As iniciais são redundantes para leitor de tela: cada dia já anuncia
              a data por extenso no aria-label. */}
          <div
            aria-hidden="true"
            className="grid grid-cols-7 justify-items-center gap-y-1"
          >
            {WEEKDAY_INITIALS.map((initial, index) => (
              <span
                key={`${initial}-${index}`}
                className="grid h-6 w-9 place-items-center text-xs font-bold text-subtle"
              >
                {initial}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 justify-items-center gap-y-1">
            {cells.map((date, index) => {
              if (date === null) {
                return <span key={`blank-${index}`} className="h-9 w-9" />;
              }
              return (
                <DayCell
                  key={date.getTime()}
                  date={date}
                  value={value}
                  onPick={pickDay}
                />
              );
            })}
          </div>

          <div className="mt-3.5 flex items-center gap-2.5 border-t border-divider pt-3.5">
            <span className="text-sm font-bold text-muted">Horário</span>
            <TimeField value={time} onChange={changeTime} />
          </div>

          {value !== null && (
            <button
              type="button"
              onClick={clear}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted transition hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Remover lembrete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
