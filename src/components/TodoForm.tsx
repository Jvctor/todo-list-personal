import { useState, type SyntheticEvent } from "react";
import { Plus } from "lucide-react";
import { TITLE_MAX_LENGTH } from "../types/todo";
import { fromDateTimeLocalValue } from "../utils/dates";

interface TodoFormProps {
  onAdd: (title: string, dueAt: number | null) => Promise<void>;
  disabled?: boolean;
}

export function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = title.trim();
  const isEmpty = trimmed.length === 0;
  const isSubmitDisabled = disabled || isEmpty || isSubmitting;

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(trimmed, fromDateTimeLocalValue(due));
      setTitle("");
      setDue("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3"
      aria-label="Adicionar nova tarefa"
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <label htmlFor="new-todo" className="sr-only">
          Nova tarefa
        </label>
        <input
          id="new-todo"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX_LENGTH))}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Digite sua tarefa aqui..."
          disabled={disabled || isSubmitting}
          autoComplete="off"
          className="flex-1 rounded-field border border-field-border bg-field px-4 py-3 text-base text-fg shadow-card placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-fg/15 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:text-lg"
        />
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex items-center justify-center gap-2 rounded-field bg-btn px-6 py-3 text-base font-bold text-btn-fg shadow-card transition hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>Adicionar</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-todo-due" className="text-sm font-medium text-muted">
          Lembrete (opcional)
        </label>
        <input
          id="new-todo-due"
          type="datetime-local"
          value={due}
          onChange={(event) => setDue(event.target.value)}
          disabled={disabled || isSubmitting}
          className="w-full rounded-field border border-field-border bg-field px-4 py-2.5 text-base text-fg focus:outline-none focus:ring-2 focus:ring-fg/15 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs"
        />
      </div>
    </form>
  );
}
