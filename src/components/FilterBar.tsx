import type { Filter } from "../types/todo";
import { pluralize } from "../utils/pluralize";

interface FilterBarProps {
  filter: Filter;
  activeCount: number;
  completedCount: number;
  onFilterChange: (filter: Filter) => void;
  onClearCompleted: () => void;
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

function getButtonClasses(isSelected: boolean): string {
  const base =
    "rounded-input px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-soft";
  if (isSelected) {
    return `${base} bg-primary-soft text-primary`;
  }
  return `${base} text-text-muted hover:text-text-primary`;
}

export function FilterBar({
  filter,
  activeCount,
  completedCount,
  onFilterChange,
  onClearCompleted,
}: FilterBarProps) {
  const hasCompleted = completedCount > 0;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
      <p className="text-xs text-text-muted">{pluralize(activeCount, "pendente", "pendentes")}</p>

      <div
        role="group"
        aria-label="Filtrar tarefas"
        className="flex items-center gap-1"
      >
        {FILTER_OPTIONS.map((option) => {
          const isSelected = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              aria-pressed={isSelected}
              className={getButtonClasses(isSelected)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClearCompleted}
        disabled={!hasCompleted}
        className="text-xs font-medium text-text-muted transition hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-text-muted"
      >
        Limpar concluídas
      </button>
    </div>
  );
}
