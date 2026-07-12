import { Fragment } from "react";
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

function getButtonClasses(isSelected: boolean): string {
  const base =
    "rounded px-1 text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25 sm:text-lg";
  if (isSelected) {
    return `${base} font-bold text-fg`;
  }
  return `${base} text-muted hover:text-fg`;
}

export function FilterBar({ filter, activeCount, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-col items-center gap-3 border-t border-divider pt-5 sm:flex-row sm:justify-between">
      <div
        role="group"
        aria-label="Filtrar tarefas"
        className="flex items-center gap-3"
      >
        {FILTER_OPTIONS.map((option, index) => {
          const isSelected = option.value === filter;
          return (
            <Fragment key={option.value}>
              {index > 0 && (
                <span aria-hidden="true" className="text-muted">
                  |
                </span>
              )}
              <button
                type="button"
                onClick={() => onFilterChange(option.value)}
                aria-pressed={isSelected}
                className={getButtonClasses(isSelected)}
              >
                {option.label}
              </button>
            </Fragment>
          );
        })}
      </div>

      <p className="text-sm text-muted sm:text-base" aria-live="polite">
        {pluralize(activeCount, "tarefa restante", "tarefas restantes")}
      </p>
    </div>
  );
}
