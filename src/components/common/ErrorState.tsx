interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-card border border-danger/40 bg-danger/10 px-6 py-10 text-center"
    >
      <p className="max-w-md text-sm text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-input border border-danger/60 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/20"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
