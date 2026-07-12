import { Check, Loader2 } from "lucide-react";
import type { Theme } from "../hooks/useTheme";
import { ThemeToggle } from "./ThemeToggle";

interface AuthScreenProps {
  isSubmitting: boolean;
  errorMessage: string;
  isConfigured: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onGoogle: () => void;
}

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function AuthScreen({
  isSubmitting,
  errorMessage,
  isConfigured,
  theme,
  onToggleTheme,
  onGoogle,
}: AuthScreenProps) {
  const isButtonDisabled = isSubmitting || !isConfigured;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-10">
      <div className="fixed right-4 top-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <main className="w-full max-w-sm">
        <header className="mb-8 flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-accent to-tangerine text-white shadow-pop"
          >
            <Check className="h-7 w-7" strokeWidth={3} />
          </span>
          <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
            Minhas tarefas
          </h1>
          <p className="mt-1 text-sm text-muted">
            Entre com sua conta Google para organizar suas tarefas.
          </p>
        </header>

        <section
          aria-label="Entrar"
          className="flex flex-col gap-4 rounded-card border border-field-border bg-card p-6 shadow-card sm:p-8"
        >
          <h2 className="font-display text-xl font-semibold text-fg">Entrar</h2>

          {errorMessage && (
            <p role="alert" className="text-sm text-accent">
              {errorMessage}
            </p>
          )}

          {!isConfigured && (
            <p role="status" className="text-sm text-muted">
              Firebase ainda não configurado — preencha o arquivo{" "}
              <code>.env</code> para ativar o login.
            </p>
          )}

          <button
            type="button"
            onClick={onGoogle}
            disabled={isButtonDisabled}
            className="flex items-center justify-center gap-3 rounded-full border border-field-border bg-sunken px-6 py-3 text-base font-bold text-fg transition hover:-translate-y-0.5 hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            )}
            {!isSubmitting && <GoogleIcon />}
            <span>Entrar com Google</span>
          </button>
        </section>

        <p className="mt-6 text-center text-sm text-muted">
          Suas tarefas ficam salvas na sua conta.
        </p>
      </main>
    </div>
  );
}
