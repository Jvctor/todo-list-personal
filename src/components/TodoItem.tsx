import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Check, Clock, Pencil, Repeat as RepeatIcon, Trash2, X } from "lucide-react";
import { REPEAT_LABELS, TITLE_MAX_LENGTH, type Repeat, type Todo } from "../types/todo";
import { DateTimePicker } from "./common/DateTimePicker";
import { celebrate } from "../utils/confetti";
import { formatDueLabel, isOverdue } from "../utils/dates";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onSetDueAt: (id: string, dueAt: number) => void;
  onRemove: (id: string) => void;
}

function getTitleClasses(done: boolean): string {
  const base = "strike-grow break-words text-left text-base font-semibold sm:text-lg";
  if (done) {
    return `${base} text-muted`;
  }
  return `${base} text-fg`;
}

function getToggleClasses(done: boolean): string {
  const base =
    "grid h-7 w-7 shrink-0 place-items-center rounded-xl border-[2.5px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25";
  if (done) {
    return `${base} border-transparent bg-mint text-white`;
  }
  return `${base} border-field-border bg-field text-transparent hover:scale-110 hover:border-mint`;
}

function getToggleLabel(todo: Todo): string {
  if (todo.done) {
    return `Reabrir "${todo.title}"`;
  }
  return `Concluir "${todo.title}"`;
}

// Apagar uma ocorrência apaga a série inteira (senão a reposição a recriaria). O
// rótulo precisa dizer isso — o usuário não pode descobrir depois do clique.
function getRemoveLabel(todo: Todo): string {
  if (todo.repeat !== null) {
    return `Remover "${todo.title}" e todas as repetições`;
  }
  return `Remover "${todo.title}"`;
}

// Em edição o card sobe para `z-20` e PERDE o `hover:-translate-y-0.5`. Os dois
// detalhes resolvem o mesmo bug: o `transform` do hover cria um contexto de
// empilhamento, que prendia o `z-30` do calendário dentro do próprio card — e aí
// as tarefas seguintes desenhavam por cima dele, deixando o popover "transparente".
function getItemClasses(isEditing: boolean): string {
  const base =
    "group rounded-card border border-field-border bg-card px-4 py-4 shadow-card transition sm:px-5";
  if (isEditing) {
    return `${base} relative z-20`;
  }
  return `${base} hover:-translate-y-0.5 hover:shadow-lift`;
}

interface DueChipProps {
  dueAt: number;
  done: boolean;
}

function DueChip({ dueAt, done }: DueChipProps) {
  const late = isOverdue(dueAt, Date.now()) && !done;

  function getClasses(): string {
    const base = "flex w-fit items-center gap-1.5 text-xs font-bold";
    if (late) {
      return `${base} text-accent`;
    }
    return `${base} text-muted`;
  }

  return (
    <p className={getClasses()}>
      {late && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent"
        />
      )}
      {!late && <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span className="sr-only">{late && "Lembrete atrasado:"}</span>
      <span>{formatDueLabel(dueAt)}</span>
    </p>
  );
}

interface RepeatChipProps {
  repeat: Repeat;
}

function RepeatChip({ repeat }: RepeatChipProps) {
  return (
    <p className="flex w-fit items-center gap-1.5 text-xs font-bold text-muted">
      <RepeatIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{REPEAT_LABELS[repeat]}</span>
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
  const [dueDraft, setDueDraft] = useState<number | null>(todo.dueAt);
  const [isPopping, setIsPopping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // O confete sai do próprio checkbox, não do centro da tela: a comemoração
  // acontece onde o dedo bateu.
  function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    if (!todo.done) {
      celebrate(event.currentTarget.getBoundingClientRect());
      setIsPopping(true);
    }
    onToggle(todo.id);
  }

  function startEditing() {
    setDraft(todo.title);
    setDueDraft(todo.dueAt);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setDraft(todo.title);
    setDueDraft(todo.dueAt);
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
    // Limpar a data não é mais uma opção: a tarefa precisa de um dia para existir
    // na agenda. Apagar o campo simplesmente mantém a data que já estava.
    if (dueDraft !== null && dueDraft !== todo.dueAt) {
      onSetDueAt(todo.id, dueDraft);
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

  function getToggleAnimation(): string {
    if (isPopping) {
      return " animate-check-pop";
    }
    return "";
  }

  return (
    <li className={getItemClasses(isEditing)}>
      {!isEditing && (
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={todo.done}
            onClick={handleToggle}
            onAnimationEnd={() => setIsPopping(false)}
            aria-label={getToggleLabel(todo)}
            className={`${getToggleClasses(todo.done)}${getToggleAnimation()}`}
          >
            <Check className="h-4 w-4" strokeWidth={3.4} aria-hidden="true" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={getTitleClasses(todo.done)} data-done={todo.done}>
              {todo.title}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {todo.dueAt !== null && (
                <DueChip dueAt={todo.dueAt} done={todo.done} />
              )}
              {todo.repeat !== null && <RepeatChip repeat={todo.repeat} />}
            </div>
          </div>

          {/* No desktop as ações só aparecem no hover, deixando a linha limpa em
              repouso. No celular ficam sempre visíveis — lá não existe hover, e
              escondê-las tornaria editar e remover inalcançáveis. */}
          <div className="flex shrink-0 gap-1 transition lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={startEditing}
              aria-label={`Editar "${todo.title}"`}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:scale-110 hover:bg-sunken hover:text-fg focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-fg/25"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onRemove(todo.id)}
              aria-label={getRemoveLabel(todo)}
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:scale-110 hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div onBlur={handleBlur} onKeyDown={handleKeyDown} className="flex flex-col gap-3">
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
              className="flex-1 rounded-field border border-field-border bg-sunken px-3 py-2 text-base font-semibold text-fg focus:border-accent focus:outline-none sm:text-lg"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={saveEditing}
              aria-label="Salvar edição"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-sunken hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25"
            >
              <Check className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={cancelEditing}
              aria-label="Cancelar edição"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-sunken hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/25"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Numa ocorrência de série a data não se edita: quem manda é a regra da
              repetição. Se o usuário mudasse a data de uma ocorrência solta, a
              reposição a recriaria na data certa na próxima abertura, e ele veria
              a tarefa duplicada. Renomear, sim — vale para a série inteira. */}
          {todo.repeat === null && (
            <DateTimePicker
              value={dueDraft}
              onChange={setDueDraft}
              label={`Lembrete da tarefa "${todo.title}"`}
            />
          )}

          {todo.repeat !== null && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <RepeatIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                A data vem da repetição ({REPEAT_LABELS[todo.repeat].toLowerCase()}).
                Renomear aqui vale para todas as repetições.
              </span>
            </p>
          )}
        </div>
      )}
    </li>
  );
}
