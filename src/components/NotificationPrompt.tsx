import { Bell, Loader2 } from "lucide-react";

interface NotificationPromptProps {
  isEnabling: boolean;
  errorMessage: string;
  onEnable: () => void;
}

export function NotificationPrompt({
  isEnabling,
  errorMessage,
  onEnable,
}: NotificationPromptProps) {
  return (
    <section
      aria-label="Ativar notificações"
      className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:p-5"
    >
      <Bell className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" />

      <div className="flex-1">
        <p className="text-base font-medium text-fg">
          Quer ser lembrado das suas tarefas?
        </p>
        <p className="text-sm text-muted">
          Ative as notificações e avisamos na hora marcada, mesmo com o site
          fechado.
        </p>
        {errorMessage && (
          <p role="alert" className="mt-1 text-sm text-accent">
            {errorMessage}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onEnable}
        disabled={isEnabling}
        className="flex shrink-0 items-center justify-center gap-2 rounded-field bg-btn px-5 py-2.5 text-base font-bold text-btn-fg shadow-card transition hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isEnabling && (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        )}
        <span>Ativar</span>
      </button>
    </section>
  );
}
