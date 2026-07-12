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
      className="flex flex-col gap-3 rounded-card border border-tangerine/35 bg-linear-to-br from-lemon/20 to-tangerine/15 p-4 sm:flex-row sm:items-center sm:gap-4"
    >
      <span className="grid h-11 w-11 shrink-0 animate-bell-ring place-items-center rounded-field bg-card text-tangerine shadow-card">
        <Bell className="h-5 w-5" aria-hidden="true" />
      </span>

      <div className="flex-1">
        <p className="font-display text-base font-semibold text-fg">
          Avisamos você na hora certa
        </p>
        <p className="text-sm text-muted">
          Ative as notificações e o lembrete chega mesmo com o site fechado.
        </p>
        {errorMessage && (
          <p role="alert" className="mt-1 text-sm font-bold text-accent">
            {errorMessage}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onEnable}
        disabled={isEnabling}
        className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-btn px-5 py-2.5 text-sm font-bold text-btn-fg transition hover:-translate-y-0.5 hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isEnabling && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        <span>Ativar</span>
      </button>
    </section>
  );
}
