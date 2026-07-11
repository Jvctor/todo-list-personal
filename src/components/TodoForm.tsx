import { useState, type FormEvent } from "react";
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      className="flex w-full flex-col gap-2 sm:flex-row"
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
        placeholder="O que precisa ser feito?"
        disabled={disabled}
        autoComplete="off"
        className="flex-1 rounded-input border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="rounded-input bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        Adicionar
      </button>
    </form>
  );
}
