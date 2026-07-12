import type { Filter } from "../types/todo";
import { pluralize } from "../utils/pluralize";

interface FilterBarProps {
  filter: Filter;
  activeCount: number;
  onFilterChange: (filter: Filter) => void;
}

interface FilterOption {
  value: Filter;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "completed", label: "Concluídas" },
];

function getPillClasses(isSelected: boolean): string {
  const base =
    "rounded-full border px-4 py-1.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  if (isSelected) {
    return `${base} border-fg bg-fg text-page`;
  }
  return `${base} border-field-border bg-card text-muted hover:-translate-y-0.5 hover:text-fg`;
}

export function FilterBar({ filter, activeCount, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Filtrar tarefas" className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isSelected = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              aria-pressed={isSelected}
              className={getPillClasses(isSelected)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="ml-auto text-sm font-semibold text-muted" aria-live="polite">
        {pluralize(activeCount, "restante", "restantes")}
      </p>
    </div>
  );
}
