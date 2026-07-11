interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-card border border-accent/40 bg-accent/10 px-6 py-10 text-center"
    >
      <p className="max-w-md text-sm text-accent">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-field border border-accent/60 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
