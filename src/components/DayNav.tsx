import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDayLabel, getRelativeDayName, startOfDay } from "../utils/dates";
import { pluralize } from "../utils/pluralize";

interface DayNavProps {
  selectedDay: number;
  remainingCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

const ARROW_CLASSES =
  "grid h-10 w-10 shrink-0 place-items-center rounded-field border border-field-border bg-card text-fg shadow-card transition hover:-translate-y-0.5 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function DayNav({
  selectedDay,
  remainingCount,
  onPrevious,
  onNext,
  onToday,
}: DayNavProps) {
  const now = Date.now();
  const relativeName = getRelativeDayName(selectedDay, now);
  const isToday = selectedDay === startOfDay(now);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Dia anterior"
          className={ARROW_CLASSES}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* `aria-live` porque a lista abaixo troca de conteúdo sem a página mudar:
            quem usa leitor de tela precisa ouvir para qual dia foi. */}
        <p
          aria-live="polite"
          className="flex min-w-0 flex-1 flex-col items-center text-center"
        >
          {relativeName !== null && (
            <span className="font-display text-base font-bold text-fg">
              {relativeName}
            </span>
          )}
          <span className="truncate text-sm font-semibold text-muted">
            {formatDayLabel(selectedDay)}
          </span>
        </p>

        <button
          type="button"
          onClick={onNext}
          aria-label="Próximo dia"
          className={ARROW_CLASSES}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* O atalho só existe quando serve para algo. Em "hoje" ele seria um botão
            que não faz nada — pior do que não ter botão. */}
        {!isToday && (
          <button
            type="button"
            onClick={onToday}
            className="flex items-center gap-1.5 rounded-full border border-field-border bg-card px-3 py-1.5 text-xs font-bold text-muted transition hover:-translate-y-0.5 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Voltar para hoje</span>
          </button>
        )}

        <p className="ml-auto text-sm font-semibold text-muted" aria-live="polite">
          {pluralize(remainingCount, "restante", "restantes")}
        </p>
      </div>
    </div>
  );
}
