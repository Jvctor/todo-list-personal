interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
      <p className="text-base font-medium text-text-primary">{title}</p>
      {description && <p className="text-sm text-text-muted">{description}</p>}
    </div>
  );
}
