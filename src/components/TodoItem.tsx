import type { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function getTitleClasses(done: boolean): string {
  const base = "flex-1 break-words text-left text-sm sm:text-base";
  if (done) {
    return `${base} text-text-subtle line-through`;
  }
  return `${base} text-text-primary`;
}

export function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 transition hover:border-primary/40">
      <input
        id={`todo-${todo.id}`}
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={`Marcar tarefa "${todo.title}" como concluída`}
        className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
      />
      <label htmlFor={`todo-${todo.id}`} className={getTitleClasses(todo.done)}>
        {todo.title}
      </label>
      <button
        type="button"
        onClick={() => onRemove(todo.id)}
        aria-label={`Remover tarefa "${todo.title}"`}
        className="shrink-0 rounded-input border border-transparent px-2 py-1 text-text-muted transition hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}
