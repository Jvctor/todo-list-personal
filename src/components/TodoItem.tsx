import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Check, Clock, Pencil, Square, SquareCheck, Trash2, X } from "lucide-react";
import { TITLE_MAX_LENGTH, type Todo } from "../types/todo";
import {
  formatDueLabel,
  fromDateTimeLocalValue,
  isOverdue,
  toDateTimeLocalValue,
} from "../utils/dates";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onSetDueAt: (id: string, dueAt: number | null) => void;
  onRemove: (id: string) => void;
}

function getTitleClasses(done: boolean): string {
  const base = "flex-1 break-words text-left text-base sm:text-lg";
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

function toDueDraft(dueAt: number | null): string {
  if (dueAt === null) {
    return "";
  }
  return toDateTimeLocalValue(dueAt);
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

interface DueBadgeProps {
  dueAt: number;
  done: boolean;
}

function DueBadge({ dueAt, done }: DueBadgeProps) {
  const label = formatDueLabel(dueAt);
  const late = isOverdue(dueAt, Date.now()) && !done;

  function getClasses(): string {
    const base = "flex items-center gap-1.5 pl-9 text-sm sm:pl-10";
    if (late) {
      return `${base} font-medium text-accent`;
    }
    return `${base} text-muted`;
  }

  function getScreenReaderPrefix(): string {
    if (late) {
      return "Lembrete atrasado:";
    }
    return "Lembrete:";
  }

  return (
    <p className={getClasses()}>
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{getScreenReaderPrefix()}</span>
      <span>{label}</span>
    </p>
  );
}

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onSetDueAt,
  onRemove,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [dueDraft, setDueDraft] = useState(toDueDraft(todo.dueAt));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraft(todo.title);
    setDueDraft(toDueDraft(todo.dueAt));
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setDraft(todo.title);
    setDueDraft(toDueDraft(todo.dueAt));
  }

  function saveEditing() {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      cancelEditing();
      return;
    }
    if (trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    }
    const nextDueAt = fromDateTimeLocalValue(dueDraft);
    if (nextDueAt !== todo.dueAt) {
      onSetDueAt(todo.id, nextDueAt);
    }
    setIsEditing(false);
  }

  // O modo de edição tem dois campos (título e lembrete). Salvar só quando o foco
  // sai do bloco inteiro evita fechar a edição ao pular de um campo para o outro.
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    saveEditing();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
    <li className="flex flex-col gap-2 rounded-card bg-card px-3 py-3 shadow-card sm:px-5 sm:py-4">
      {!isEditing && (
        <>
          <div className="flex items-center gap-2 sm:gap-3">
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
          </div>

          {todo.dueAt !== null && (
            <DueBadge dueAt={todo.dueAt} done={todo.done} />
          )}
        </>
      )}

      {isEditing && (
        <div
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <label htmlFor={`edit-${todo.id}`} className="sr-only">
              Editar tarefa
            </label>
            <input
              id={`edit-${todo.id}`}
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, TITLE_MAX_LENGTH))}
              maxLength={TITLE_MAX_LENGTH}
              autoComplete="off"
              className="flex-1 rounded-field border border-field-border bg-field px-3 py-1.5 text-base text-fg focus:outline-none focus:ring-2 focus:ring-fg/20 sm:text-lg"
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
          </div>

          <label htmlFor={`edit-due-${todo.id}`} className="sr-only">
            Lembrete da tarefa
          </label>
          <input
            id={`edit-due-${todo.id}`}
            type="datetime-local"
            value={dueDraft}
            onChange={(event) => setDueDraft(event.target.value)}
            className="rounded-field border border-field-border bg-field px-3 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-fg/20 sm:max-w-xs"
          />
        </div>
      )}
    </li>
  );
}
