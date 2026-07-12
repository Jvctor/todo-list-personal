import { Bell, Loader2, Share } from "lucide-react";

export type PromptMode = "enable" | "install";

interface NotificationPromptProps {
  mode: PromptMode;
  isEnabling: boolean;
  errorMessage: string;
  onEnable: () => void;
}

const CARD_CLASSES =
  "flex flex-col gap-3 rounded-card border border-tangerine/35 bg-linear-to-br from-lemon/20 to-tangerine/15 p-4 sm:flex-row sm:items-center sm:gap-4";

const ICON_CLASSES =
  "grid h-11 w-11 shrink-0 place-items-center rounded-field bg-card text-tangerine shadow-card";

// No iPhone não existe botão para pedir permissão: o Safari só libera Web Push
// depois que o site vira app na Tela de Início. Então o card aqui não tem ação —
// tem receita. Esconder o card (era o que acontecia antes) deixava o usuário sem
// entender por que nunca chegava lembrete.
//
// A receita insiste no Safari de propósito: Chrome e Firefox no iPhone usam o
// mesmo motor por baixo, mas o "Adicionar à Tela de Início" deles é menos
// previsível. Mandar direto para o Safari evita o usuário procurar um item de
// menu que talvez não esteja lá.
function InstallPrompt() {
  return (
    <section aria-label="Instalar o app" className={CARD_CLASSES}>
      <span className={`${ICON_CLASSES} animate-bell-ring`}>
        <Share className="h-5 w-5" aria-hidden="true" />
      </span>

      <div className="flex-1">
        <p className="font-display text-base font-semibold text-fg">
          Instale para receber lembretes
        </p>
        <p className="text-sm text-muted">
          No iPhone, as notificações só chegam para apps na Tela de Início. Abra
          este site no <strong className="font-bold text-fg">Safari</strong>,
          toque em <strong className="font-bold text-fg">Compartilhar</strong> e
          depois em{" "}
          <strong className="font-bold text-fg">
            Adicionar à Tela de Início
          </strong>
          . Abra o app pelo ícone e o botão de ativar aparece aqui.
        </p>
      </div>
    </section>
  );
}

interface EnablePromptProps {
  isEnabling: boolean;
  errorMessage: string;
  onEnable: () => void;
}

function EnablePrompt({
  isEnabling,
  errorMessage,
  onEnable,
}: EnablePromptProps) {
  return (
    <section aria-label="Ativar notificações" className={CARD_CLASSES}>
      <span className={`${ICON_CLASSES} animate-bell-ring`}>
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

export function NotificationPrompt({
  mode,
  isEnabling,
  errorMessage,
  onEnable,
}: NotificationPromptProps) {
  if (mode === "install") {
    return <InstallPrompt />;
  }
  return (
    <EnablePrompt
      isEnabling={isEnabling}
      errorMessage={errorMessage}
      onEnable={onEnable}
    />
  );
}
