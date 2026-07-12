import type { Todo } from "../types/todo";
import { EmptyState } from "./common/EmptyState";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  totalCount: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onSetDueAt: (id: string, dueAt: number | null) => void;
  onRemove: (id: string) => void;
}

export function TodoList({
  todos,
  totalCount,
  onToggle,
  onEdit,
  onSetDueAt,
  onRemove,
}: TodoListProps) {
  if (todos.length === 0 && totalCount === 0) {
    return (
      <EmptyState
        title="Nada por aqui ainda"
        description="Escreva sua primeira tarefa ali em cima."
      />
    );
  }

  if (todos.length === 0) {
    return (
      <EmptyState
        title="Nada neste filtro"
        description="Troque o filtro para ver as outras."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2.5" aria-label="Lista de tarefas">
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
