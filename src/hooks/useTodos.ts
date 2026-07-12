import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  onValue,
  push,
  ref,
  remove,
  update,
  type DataSnapshot,
} from "firebase/database";
import type { Filter, Todo } from "../types/todo";
import { getDb } from "../lib/firebase";
import { getErrorMessage } from "../utils/errors";

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
  addTodo: (title: string, dueAt: number | null) => Promise<void>;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  setDueAt: (id: string, dueAt: number | null) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
}

// Campos gravados no nó da tarefa. `dueAt` é opcional: as regras do banco só
// aceitam os campos declarados aqui, qualquer outro é rejeitado.
interface TodoPayload {
  title: string;
  done: boolean;
  createdAt: number;
  dueAt?: number;
}

function asString(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    return value;
  }
  return fallback;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  return 0;
}

function asOptionalNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return value;
  }
  return null;
}

function childToTodo(child: DataSnapshot): Todo {
  const data = child.val();
  return {
    id: child.key ?? "",
    title: asString(data?.title, ""),
    done: data?.done === true,
    createdAt: asNumber(data?.createdAt),
    dueAt: asOptionalNumber(data?.dueAt),
  };
}

function todosPath(uid: string): string {
  return `users/${uid}/todos`;
}

export function useTodos(uid: string): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Keep the latest list in a ref so the write callbacks stay stable (they only
  // depend on `uid`) while still reading fresh state.
  const todosRef = useRef<Todo[]>([]);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  const handleWriteError = useCallback((err: unknown) => {
    setErrorMessage(getErrorMessage(err, "Erro ao salvar a alteração."));
    setStatus("error");
  }, []);

  useEffect(() => {
    setStatus("loading");
    const listRef = ref(getDb(), todosPath(uid));
    const unsubscribe = onValue(
      listRef,
      (snapshot) => {
        const list: Todo[] = [];
        snapshot.forEach((child) => {
          list.push(childToTodo(child));
        });
        // Newest first (Realtime Database returns children in key order).
        list.sort((a, b) => b.createdAt - a.createdAt);
        setTodos(list);
        setStatus("ready");
      },
      (err) => {
        setErrorMessage(getErrorMessage(err, "Erro ao carregar tarefas."));
        setStatus("error");
      },
    );
    return unsubscribe;
  }, [uid]);

  const addTodo = useCallback(
    async (title: string, dueAt: number | null) => {
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return;
      }
      const payload: TodoPayload = {
        title: trimmed,
        done: false,
        createdAt: Date.now(),
      };
      if (dueAt !== null) {
        payload.dueAt = dueAt;
      }
      try {
        await push(ref(getDb(), todosPath(uid)), payload);
      } catch (err) {
        handleWriteError(err);
      }
    },
    [uid, handleWriteError],
  );

  // Trocar o prazo também zera o `reminderSentAt` gravado pelo Worker, senão ele
  // consideraria o lembrete já enviado e não avisaria na nova data.
  const setDueAt = useCallback(
    (id: string, dueAt: number | null) => {
      const updates: Record<string, number | null> = {
        dueAt,
        reminderSentAt: null,
      };
      update(ref(getDb(), `${todosPath(uid)}/${id}`), updates).catch(
        handleWriteError,
      );
    },
    [uid, handleWriteError],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      const target = todosRef.current.find((todo) => todo.id === id);
      if (!target) {
        return;
      }
      update(ref(getDb(), `${todosPath(uid)}/${id}`), {
        done: !target.done,
      }).catch(handleWriteError);
    },
    [uid, handleWriteError],
  );

  const editTodo = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return;
      }
      update(ref(getDb(), `${todosPath(uid)}/${id}`), {
        title: trimmed,
      }).catch(handleWriteError);
    },
    [uid, handleWriteError],
  );

  const removeTodo = useCallback(
    (id: string) => {
      remove(ref(getDb(), `${todosPath(uid)}/${id}`)).catch(handleWriteError);
    },
    [uid, handleWriteError],
  );

  const clearCompleted = useCallback(() => {
    const completed = todosRef.current.filter((todo) => todo.done);
    if (completed.length === 0) {
      return;
    }
    // Multi-path update: setting each completed node to null deletes it in one op.
    const updates: Record<string, null> = {};
    completed.forEach((todo) => {
      updates[`${todosPath(uid)}/${todo.id}`] = null;
    });
    update(ref(getDb()), updates).catch(handleWriteError);
  }, [uid, handleWriteError]);

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
    editTodo,
    setDueAt,
    removeTodo,
    clearCompleted,
  };
}
