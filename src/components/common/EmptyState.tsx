interface EmptyStateProps {
  title: string;
  description?: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
}

export function EmptyState({
  title,
  description,
  illustrationSrc,
  illustrationAlt = "",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
      {illustrationSrc && (
        <img
          src={illustrationSrc}
          alt={illustrationAlt}
          className="w-44 max-w-full sm:w-56"
        />
      )}
      <p className="max-w-md text-lg font-medium italic text-fg sm:text-xl">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
