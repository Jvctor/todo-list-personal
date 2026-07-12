import type { Todo } from "../types/todo";
import { EmptyState } from "./common/EmptyState";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onSetDueAt: (id: string, dueAt: number) => void;
  onRemove: (id: string) => void;
}

export function TodoList({
  todos,
  onToggle,
  onEdit,
  onSetDueAt,
  onRemove,
}: TodoListProps) {
  // Um dia vazio não é mais "lista vazia": pode ser um dia tranquilo no meio de
  // uma agenda cheia. O texto fala do dia, não da vida.
  if (todos.length === 0) {
    return (
      <EmptyState
        title="Nada nesse dia"
        description="Marque uma tarefa ali em cima ou vire para outro dia."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2.5" aria-label="Tarefas do dia">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onSetDueAt={onSetDueAt}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
