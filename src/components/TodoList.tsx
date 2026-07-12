import type { Todo } from "../types/todo";
import { EmptyState } from "./common/EmptyState";
import { TodoItem } from "./TodoItem";
import emptyIllustration from "../assets/empty-illustration.png";

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
        title="Vazio como minha motivação numa segunda 😅. Bora adicionar tarefas!"
        illustrationSrc={emptyIllustration}
        illustrationAlt="Ilustração de uma pessoa animada tirando uma selfie"
      />
    );
  }

  if (todos.length === 0) {
    return (
      <EmptyState
        title="Nada por aqui"
        description="Nenhuma tarefa corresponde ao filtro selecionado."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Lista de tarefas">
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
