interface EmptyStateProps {
  title: string;
  description?: string;
}

const BALLOON_COLORS = ["bg-accent", "bg-tangerine", "bg-lemon", "bg-mint"];

// Os balões substituem a ilustração antiga: carregam a mesma leveza sem custar
// 168 KB de PNG, e a cor deles é a própria paleta do app.
function Balloons() {
  return (
    <div aria-hidden="true" className="flex gap-1.5">
      {BALLOON_COLORS.map((color, index) => (
        <span
          key={color}
          className={`h-3.5 w-3.5 animate-balloon-float rounded-full ${color}`}
          style={{ animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-field-border bg-card px-5 py-11 text-center">
      <Balloons />
      <p className="font-display text-xl font-semibold text-fg">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
