interface ProgressCardProps {
  doneCount: number;
  totalCount: number;
}

// `pluralize` não serve aqui: ele já embute o número, e o total é renderizado
// separado para poder ter tamanho e peso próprios.
function getDoneWord(totalCount: number): string {
  if (totalCount === 1) {
    return "feita";
  }
  return "feitas";
}

function getCheer(doneCount: number, totalCount: number): string {
  if (doneCount === totalCount) {
    return "Tudo feito!";
  }
  if (doneCount === 0) {
    return "Bora começar";
  }
  return "Tá indo bem!";
}

function getSegmentClasses(isDone: boolean): string {
  const base = "h-3 flex-1 rounded-full transition duration-300";
  if (isDone) {
    return `${base} scale-y-110 bg-mint`;
  }
  return `${base} bg-sunken`;
}

// Resumo antes do detalhe: quantas tarefas já foram, num relance, sem precisar
// contar a lista. As barras são uma por tarefa — a lista é curta por natureza.
export function ProgressCard({ doneCount, totalCount }: ProgressCardProps) {
  const segments = Array.from({ length: totalCount }, (_, index) => index);

  return (
    <section
      aria-label="Progresso"
      className="flex flex-wrap items-center gap-4 rounded-card border border-field-border bg-card px-5 py-4 shadow-card sm:gap-5"
    >
      <p className="font-display text-3xl leading-none tabular-nums text-fg">
        {doneCount}
        <span className="font-sans text-base font-semibold text-muted">
          /{totalCount} {getDoneWord(totalCount)}
        </span>
      </p>

      <div aria-hidden="true" className="flex min-w-32 flex-1 gap-1.5">
        {segments.map((index) => (
          <span key={index} className={getSegmentClasses(index < doneCount)} />
        ))}
      </div>

      <p className="text-sm font-bold text-mint">{getCheer(doneCount, totalCount)}</p>
    </section>
  );
}
