import type { Todo } from "../types/todo";
import { EmptyState } from "./common/EmptyState";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  totalCount: number;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function getEmptyContent(totalCount: number) {
  if (totalCount === 0) {
    return {
      title: "Sua lista está vazia",
      description: "Adicione sua primeira tarefa acima para começar.",
    };
  }
  return {
    title: "Nada por aqui",
    description: "Nenhuma tarefa corresponde ao filtro selecionado.",
  };
}

export function TodoList({ todos, totalCount, onToggle, onRemove }: TodoListProps) {
  if (todos.length === 0) {
    const empty = getEmptyContent(totalCount);
    return <EmptyState title={empty.title} description={empty.description} />;
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Lista de tarefas">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
