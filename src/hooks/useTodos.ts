import { useCallback, useEffect, useMemo, useState } from "react";
import type { Filter, Todo } from "../types/todo";
import { getErrorMessage } from "../utils/errors";
import { generateId } from "../utils/id";

const STORAGE_KEY = "todo-list-personal:todos";

type Status = "loading" | "ready" | "error";

interface UseTodosResult {
  todos: Todo[];
  visibleTodos: Todo[];
  filter: Filter;
  status: Status;
  errorMessage: string;
  activeCount: number;
  completedCount: number;
  setFilter: (filter: Filter) => void;
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
}

function readFromStorage(): Todo[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Formato inválido no armazenamento local.");
  }
  return parsed as Todo[];
}

function writeToStorage(todos: Todo[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    try {
      const loaded = readFromStorage();
      setTodos(loaded);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Erro ao carregar tarefas."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }
    try {
      writeToStorage(todos);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Erro ao salvar tarefas."));
      setStatus("error");
    }
  }, [todos, status]);

  const addTodo = useCallback((title: string) => {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return;
    }
    const next: Todo = {
      id: generateId(),
      title: trimmed,
      done: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [next, ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }
        return { ...todo, done: !todo.done };
      }),
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.done));
  }, []);

  const visibleTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.done);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.done);
    }
    return todos;
  }, [todos, filter]);

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.done).length,
    [todos],
  );
  const completedCount = todos.length - activeCount;

  return {
    todos,
    visibleTodos,
    filter,
    status,
    errorMessage,
    activeCount,
    completedCount,
    setFilter,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
  };
}
