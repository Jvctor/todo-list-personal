import { useState, type SyntheticEvent } from "react";
import { Plus } from "lucide-react";
import { TITLE_MAX_LENGTH } from "../types/todo";

interface TodoFormProps {
  onAdd: (title: string) => void;
  disabled?: boolean;
}

export function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState("");

  const trimmed = title.trim();
  const isEmpty = trimmed.length === 0;
  const isSubmitDisabled = disabled || isEmpty;

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }
    onAdd(trimmed);
    setTitle("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row"
      aria-label="Adicionar nova tarefa"
    >
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
        disabled={disabled}
        autoComplete="off"
        className="flex-1 rounded-field border border-field-border bg-field px-5 py-3 text-lg text-fg shadow-card placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-fg/15 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="flex items-center justify-center gap-2 rounded-field bg-btn px-6 py-3 text-lg font-bold text-btn-fg shadow-card transition hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        <span>Adicionar</span>
      </button>
    </form>
  );
}
