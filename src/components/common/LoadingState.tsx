interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Carregando..." }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted"
    >
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
