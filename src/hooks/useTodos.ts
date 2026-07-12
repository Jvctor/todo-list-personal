import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  onValue,
  push,
  ref,
  remove,
  update,
  type DataSnapshot,
} from "firebase/database";
import type { Repeat, Todo } from "../types/todo";
import { getDb } from "../lib/firebase";
import { addDays, startOfDay } from "../utils/dates";
import { getErrorMessage } from "../utils/errors";
import { generateId } from "../utils/id";
import { getHorizonRange, occurrencesInRange } from "../utils/recurrence";

type Status = "loading" | "ready" | "error";

interface UseTodosResult {
  todos: Todo[];
  // Só as tarefas do dia navegado. A lista deixou de ser filtrada para ser
  // percorrida: quem manda no que aparece é a data, não um estado de filtro.
  visibleTodos: Todo[];
  selectedDay: number;
  status: Status;
  errorMessage: string;
  dayDoneCount: number;
  dayTotalCount: number;
  goToDay: (dayStart: number) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  addTodo: (title: string, dueAt: number, repeat: Repeat | null) => Promise<void>;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  setDueAt: (id: string, dueAt: number) => void;
  removeTodo: (id: string) => void;
}

// Campos gravados no nó da tarefa. As regras do banco só aceitam os campos
// declarados aqui — qualquer outro é rejeitado.
interface TodoPayload {
  title: string;
  done: boolean;
  createdAt: number;
  dueAt: number;
  repeat?: Repeat;
  seriesId?: string;
  seriesStartAt?: number;
}

// Uma ocorrência com todos os campos da série já garantidos. Existe para o resto
// do arquivo poder confiar nos tipos sem espalhar checagem de null.
interface SeriesOccurrence {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  dueAt: number;
  repeat: Repeat;
  seriesId: string;
  seriesStartAt: number;
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

function asOptionalString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}

function asRepeat(value: unknown): Repeat | null {
  if (value === "daily" || value === "weekly" || value === "monthly") {
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
    repeat: asRepeat(data?.repeat),
    seriesId: asOptionalString(data?.seriesId),
    seriesStartAt: asOptionalNumber(data?.seriesStartAt),
  };
}

// Uma tarefa só conta como ocorrência de série se tiver TODOS os campos. Um nó
// meio preenchido (dado velho, escrita interrompida) é tratado como avulso, e não
// como uma série quebrada que a manutenção tentaria consertar.
function asSeriesOccurrence(todo: Todo): SeriesOccurrence | null {
  if (
    todo.repeat === null ||
    todo.seriesId === null ||
    todo.seriesStartAt === null ||
    todo.dueAt === null
  ) {
    return null;
  }
  return {
    id: todo.id,
    title: todo.title,
    done: todo.done,
    createdAt: todo.createdAt,
    dueAt: todo.dueAt,
    repeat: todo.repeat,
    seriesId: todo.seriesId,
    seriesStartAt: todo.seriesStartAt,
  };
}

function groupBySeries(todos: Todo[]): Map<string, SeriesOccurrence[]> {
  const groups = new Map<string, SeriesOccurrence[]>();
  todos.forEach((todo) => {
    const occurrence = asSeriesOccurrence(todo);
    if (occurrence === null) {
      return;
    }
    const current = groups.get(occurrence.seriesId) ?? [];
    current.push(occurrence);
    groups.set(occurrence.seriesId, current);
  });
  return groups;
}

function todosPath(uid: string): string {
  return `users/${uid}/todos`;
}

// Dentro de um dia a ordem é a hora. Duas tarefas no mesmo horário caem para o
// título, que é estável — sem isso a lista trocaria de ordem a cada render.
function compareByTime(a: Todo, b: Todo): number {
  const timeA = a.dueAt ?? 0;
  const timeB = b.dueAt ?? 0;
  if (timeA !== timeB) {
    return timeA - timeB;
  }
  return a.title.localeCompare(b.title);
}

export function useTodos(uid: string): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(() =>
    startOfDay(Date.now()),
  );
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Keep the latest list in a ref so the write callbacks stay stable (they only
  // depend on `uid`) while still reading fresh state.
  const todosRef = useRef<Todo[]>([]);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  // A manutenção roda uma vez por abertura. Sem essa trava ela reagiria à própria
  // escrita (o onValue dispara de novo) e ficaria conversando com o banco à toa.
  const hasRunMaintenanceRef = useRef(false);

  const handleWriteError = useCallback((err: unknown) => {
    setErrorMessage(getErrorMessage(err, "Erro ao salvar a alteração."));
    setStatus("error");
  }, []);

  const newTodoKey = useCallback((): string | null => {
    return push(ref(getDb(), todosPath(uid))).key;
  }, [uid]);

  // Estende a agenda de cada série até o horizonte, para o Worker sempre ter data
  // futura para avisar. Nada é apagado aqui: a ocorrência vencida — feita ou não —
  // é justamente o histórico que a navegação por dia existe para mostrar.
  //
  // A regra não é "criar toda data faltante", é "criar só o que vem DEPOIS da
  // última ocorrência que existe". A diferença importa: quem apagou uma ocorrência
  // de propósito não quer vê-la renascer na próxima abertura.
  const buildMaintenanceUpdates = useCallback(
    (list: Todo[], now: number): Record<string, TodoPayload> => {
      const updates: Record<string, TodoPayload> = {};
      const { from, to } = getHorizonRange(now);

      groupBySeries(list).forEach((occurrences, seriesId) => {
        // O DNA da série (regra, âncora, título) sai de qualquer ocorrência,
        // inclusive das antigas: é o que permite ressuscitar a agenda de quem
        // ficou mais de um horizonte inteiro sem abrir o app.
        const dna = occurrences[0];

        let cutoff = from;
        const latest = Math.max(...occurrences.map((item) => item.dueAt));
        if (latest >= cutoff) {
          cutoff = latest + 1;
        }

        occurrencesInRange(dna.seriesStartAt, dna.repeat, cutoff, to).forEach(
          (dueAt) => {
            const key = newTodoKey();
            if (key === null) {
              return;
            }
            updates[`${todosPath(uid)}/${key}`] = {
              title: dna.title,
              done: false,
              createdAt: dna.createdAt,
              dueAt,
              repeat: dna.repeat,
              seriesId,
              seriesStartAt: dna.seriesStartAt,
            };
          },
        );
      });

      return updates;
    },
    [uid, newTodoKey],
  );

  const runMaintenance = useCallback(
    (list: Todo[]) => {
      const updates = buildMaintenanceUpdates(list, Date.now());
      if (Object.keys(updates).length === 0) {
        return;
      }
      update(ref(getDb()), updates).catch(handleWriteError);
    },
    [buildMaintenanceUpdates, handleWriteError],
  );

  useEffect(() => {
    setStatus("loading");
    hasRunMaintenanceRef.current = false;
    const listRef = ref(getDb(), todosPath(uid));
    const unsubscribe = onValue(
      listRef,
      (snapshot) => {
        const list: Todo[] = [];
        snapshot.forEach((child) => {
          list.push(childToTodo(child));
        });
        setTodos(list);
        setStatus("ready");

        if (!hasRunMaintenanceRef.current) {
          hasRunMaintenanceRef.current = true;
          runMaintenance(list);
        }
      },
      (err) => {
        setErrorMessage(getErrorMessage(err, "Erro ao carregar tarefas."));
        setStatus("error");
      },
    );
    return unsubscribe;
  }, [uid, runMaintenance]);

  const goToDay = useCallback((dayStart: number) => {
    setSelectedDay(startOfDay(dayStart));
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDay((current) => addDays(current, -1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDay((current) => addDays(current, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDay(startOfDay(Date.now()));
  }, []);

  // Uma tarefa recorrente nasce com a agenda inteira já gravada (até o horizonte),
  // não só com a primeira data: o Worker não sabe calcular a regra, ele só avisa
  // o que encontra no banco.
  const addTodo = useCallback(
    async (title: string, dueAt: number, repeat: Repeat | null) => {
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return;
      }

      if (repeat === null) {
        try {
          await push(ref(getDb(), todosPath(uid)), {
            title: trimmed,
            done: false,
            createdAt: Date.now(),
            dueAt,
          });
        } catch (err) {
          handleWriteError(err);
        }
        return;
      }

      const now = Date.now();
      const seriesId = generateId();
      const { to } = getHorizonRange(now);
      const updates: Record<string, TodoPayload> = {};

      occurrencesInRange(dueAt, repeat, dueAt, to).forEach((occurrenceDueAt) => {
        const key = newTodoKey();
        if (key === null) {
          return;
        }
        updates[`${todosPath(uid)}/${key}`] = {
          title: trimmed,
          done: false,
          createdAt: now,
          dueAt: occurrenceDueAt,
          repeat,
          seriesId,
          seriesStartAt: dueAt,
        };
      });

      try {
        await update(ref(getDb()), updates);
      } catch (err) {
        handleWriteError(err);
      }
    },
    [uid, handleWriteError, newTodoKey],
  );

  // Trocar o prazo também zera o `reminderSentAt` gravado pelo Worker, senão ele
  // consideraria o lembrete já enviado e não avisaria na nova data.
  //
  // Ocorrência de série não passa por aqui: quem manda na data é a regra da série,
  // e mexer numa data solta brigaria com a reposição. A UI nem oferece o campo;
  // esta guarda é a rede embaixo.
  const setDueAt = useCallback(
    (id: string, dueAt: number) => {
      const target = todosRef.current.find((todo) => todo.id === id);
      if (!target || target.repeat !== null) {
        return;
      }
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

  // Renomear uma ocorrência renomeia a série toda. O contrário deixaria "Academia"
  // na terça e "Academia (novo nome)" na quinta, sem o usuário ter pedido isso.
  const editTodo = useCallback(
    (id: string, title: string) => {
      const trimmed = title.trim();
      if (trimmed.length === 0) {
        return;
      }
      const target = todosRef.current.find((todo) => todo.id === id);
      if (!target) {
        return;
      }

      if (target.seriesId === null) {
        update(ref(getDb(), `${todosPath(uid)}/${id}`), {
          title: trimmed,
        }).catch(handleWriteError);
        return;
      }

      const updates: Record<string, string> = {};
      todosRef.current.forEach((todo) => {
        if (todo.seriesId === target.seriesId) {
          updates[`${todosPath(uid)}/${todo.id}/title`] = trimmed;
        }
      });
      update(ref(getDb()), updates).catch(handleWriteError);
    },
    [uid, handleWriteError],
  );

  // Apagar uma ocorrência apaga a série inteira, passado incluído. Não é escolha
  // de gosto: apagar só uma data futura faria a manutenção recriá-la na próxima
  // abertura, e o usuário veria voltar sozinha a tarefa que ele deletou.
  const removeTodo = useCallback(
    (id: string) => {
      const target = todosRef.current.find((todo) => todo.id === id);
      if (!target) {
        return;
      }

      if (target.seriesId === null) {
        remove(ref(getDb(), `${todosPath(uid)}/${id}`)).catch(handleWriteError);
        return;
      }

      const updates: Record<string, null> = {};
      todosRef.current.forEach((todo) => {
        if (todo.seriesId === target.seriesId) {
          updates[`${todosPath(uid)}/${todo.id}`] = null;
        }
      });
      update(ref(getDb()), updates).catch(handleWriteError);
    },
    [uid, handleWriteError],
  );

  // A tarefa antiga sem `dueAt` (de antes da agenda) não pertence a dia nenhum e
  // por isso não aparece. Ela continua no banco, intacta — só não tem onde ser
  // desenhada numa tela que é, por definição, um dia.
  const visibleTodos = useMemo(() => {
    const nextDay = addDays(selectedDay, 1);
    return todos
      .filter((todo) => {
        if (todo.dueAt === null) {
          return false;
        }
        return todo.dueAt >= selectedDay && todo.dueAt < nextDay;
      })
      .sort(compareByTime);
  }, [todos, selectedDay]);

  const dayDoneCount = useMemo(
    () => visibleTodos.filter((todo) => todo.done).length,
    [visibleTodos],
  );

  return {
    todos,
    visibleTodos,
    selectedDay,
    status,
    errorMessage,
    dayDoneCount,
    dayTotalCount: visibleTodos.length,
    goToDay,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    addTodo,
    toggleTodo,
    editTodo,
    setDueAt,
    removeTodo,
  };
}
