import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { formatTimeValue, parseTimeValue } from "../../utils/dates";

interface TimeFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTION_STEP_MINUTES = 30;

// Nem `<input type="time">` nem `<select>`: os dois são desenhados pelo navegador,
// mudam de cara em cada um e não aceitam os tokens do app. Este campo é texto puro
// (dá para digitar) com uma lista nossa (dá para escolher) — o navegador sai da
// jogada por completo.
function buildOptions(): string[] {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += OPTION_STEP_MINUTES) {
    options.push(formatTimeValue(Math.floor(minutes / 60), minutes % 60));
  }
  return options;
}

const OPTIONS = buildOptions();

// Digitação: só os dígitos importam. "930" vira "09:30" sozinho, e o usuário
// nunca precisa digitar os dois-pontos.
function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isComplete(draft: string): boolean {
  return /^\d{2}:\d{2}$/.test(draft);
}

function isWithinRange(draft: string): boolean {
  const [rawHour, rawMinute] = draft.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function TimeField({ value, onChange }: TimeFieldProps) {
  const [draft, setDraft] = useState(value);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // O horário pode mudar por fora (ao abrir o picker numa tarefa já com lembrete).
  useEffect(() => {
    setDraft(value);
    setIsInvalid(false);
  }, [value]);

  useEffect(() => {
    if (!isListOpen) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      if (wrapperRef.current?.contains(event.target as Node)) {
        return;
      }
      setIsListOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isListOpen]);

  function handleType(raw: string) {
    const masked = maskTime(raw);
    setDraft(masked);

    if (!isComplete(masked)) {
      setIsInvalid(false);
      return;
    }
    if (!isWithinRange(masked)) {
      // "99:99" fica na tela marcado como inválido em vez de virar outro horário
      // pelas costas do usuário.
      setIsInvalid(true);
      return;
    }
    setIsInvalid(false);
    onChange(masked);
  }

  // Sair do campo com algo incompleto ("9", "12:") desfaz: o valor volta a ser o
  // último horário válido, em vez de o app adivinhar o que faltava.
  function handleBlur() {
    if (isComplete(draft) && isWithinRange(draft)) {
      return;
    }
    setDraft(value);
    setIsInvalid(false);
  }

  function pick(option: string) {
    setDraft(option);
    setIsInvalid(false);
    setIsListOpen(false);
    onChange(option);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isListOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsListOpen(false);
    }
  }

  function getFieldClasses(): string {
    const base =
      "w-full rounded-field border bg-sunken py-2 pl-3 pr-9 text-base font-bold tabular-nums text-fg transition placeholder:font-normal placeholder:text-placeholder focus:outline-none";
    if (isInvalid) {
      return `${base} border-accent`;
    }
    return `${base} border-field-border hover:border-accent focus:border-accent`;
  }

  function getOptionClasses(option: string): string {
    const base =
      "w-full rounded-lg px-3 py-1.5 text-left text-sm font-bold tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
    if (option === value) {
      return `${base} bg-accent text-white`;
    }
    return `${base} text-fg hover:bg-sunken`;
  }

  const { hour, minute } = parseTimeValue(value);

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown} className="relative flex-1">
      <label htmlFor="due-time" className="sr-only">
        Horário do lembrete
      </label>

      <input
        id="due-time"
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(event) => handleType(event.target.value)}
        onBlur={handleBlur}
        maxLength={5}
        placeholder="00:00"
        autoComplete="off"
        aria-invalid={isInvalid}
        aria-describedby="due-time-hint"
        className={getFieldClasses()}
      />

      <button
        type="button"
        onClick={() => setIsListOpen((open) => !open)}
        aria-label="Escolher horário de uma lista"
        aria-expanded={isListOpen}
        className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-card hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      <p id="due-time-hint" className="sr-only">
        Digite as horas e os minutos, ou escolha na lista. Meia-noite é 00:00.
      </p>

      {isInvalid && (
        <p role="alert" className="mt-1 text-xs font-bold text-accent">
          Use de 00:00 a 23:59.
        </p>
      )}

      {isListOpen && (
        <ul
          aria-label="Horários"
          className="absolute bottom-[calc(100%+0.375rem)] left-0 z-40 max-h-56 w-full overflow-y-auto rounded-field border border-field-border bg-card p-1 shadow-lift"
        >
          {OPTIONS.map((option) => {
            const parts = parseTimeValue(option);
            const isCurrentHour = parts.hour === hour && parts.minute === minute;
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => pick(option)}
                  aria-current={isCurrentHour}
                  className={getOptionClasses(option)}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
