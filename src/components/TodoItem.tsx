import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, Pencil, Square, SquareCheck, Trash2, X } from "lucide-react";
import { TITLE_MAX_LENGTH, type Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

function getTitleClasses(done: boolean): string {
  const base = "flex-1 break-words text-left text-lg";
  if (done) {
    return `${base} text-muted line-through`;
  }
  return `${base} text-fg`;
}

function getToggleLabel(todo: Todo): string {
  if (todo.done) {
    return `Marcar "${todo.title}" como pendente`;
  }
  return `Marcar "${todo.title}" como concluída`;
}

interface ToggleIconProps {
  done: boolean;
}

function ToggleIcon({ done }: ToggleIconProps) {
  if (done) {
    return <SquareCheck className="h-6 w-6 text-accent" aria-hidden="true" />;
  }
  return <Square className="h-6 w-6 text-muted" aria-hidden="true" />;
}

export function TodoItem({ todo, onToggle, onEdit, onRemove }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraft(todo.title);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setDraft(todo.title);
  }

  function saveEditing() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      cancelEditing();
      return;
    }
    onEdit(todo.id, trimmed);
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEditing();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-card bg-card px-5 py-4 shadow-card">
      {!isEditing && (
        <>
          <button
            type="button"
            role="checkbox"
            aria-checked={todo.done}
            onClick={() => onToggle(todo.id)}
            aria-label={getToggleLabel(todo)}
            className="grid shrink-0 place-items-center rounded transition hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25"
          >
            <ToggleIcon done={todo.done} />
          </button>

          <span className={getTitleClasses(todo.done)}>{todo.title}</span>

          <button
            type="button"
            onClick={startEditing}
            aria-label={`Editar tarefa "${todo.title}"`}
            className="shrink-0 rounded p-1.5 text-muted transition hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25"
          >
            <Pencil className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onRemove(todo.id)}
            aria-label={`Remover tarefa "${todo.title}"`}
            className="shrink-0 rounded p-1.5 text-muted transition hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      {isEditing && (
        <>
          <label htmlFor={`edit-${todo.id}`} className="sr-only">
            Editar tarefa
          </label>
          <input
            id={`edit-${todo.id}`}
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, TITLE_MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            onBlur={saveEditing}
            maxLength={TITLE_MAX_LENGTH}
            autoComplete="off"
            className="flex-1 rounded-field border border-field-border bg-field px-3 py-1.5 text-lg text-fg focus:outline-none focus:ring-2 focus:ring-fg/20"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={saveEditing}
            aria-label="Salvar edição"
            className="shrink-0 rounded p-1.5 text-muted transition hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25"
          >
            <Check className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={cancelEditing}
            aria-label="Cancelar edição"
            className="shrink-0 rounded p-1.5 text-muted transition hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}
    </li>
  );
}
