import { useState, type SyntheticEvent } from "react";
import { Plus } from "lucide-react";
import { TITLE_MAX_LENGTH, type Repeat } from "../types/todo";
import { DateTimePicker } from "./common/DateTimePicker";
import { RepeatSelect } from "./common/RepeatSelect";

interface TodoFormProps {
  onAdd: (title: string, dueAt: number, repeat: Repeat | null) => Promise<void>;
  disabled?: boolean;
}

export function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState<number | null>(null);
  const [repeat, setRepeat] = useState<Repeat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = title.trim();
  const isEmpty = trimmed.length === 0;
  // A data virou obrigatória: numa tela que é um dia, tarefa sem data não teria
  // onde ser desenhada. Melhor barrar na entrada do que aceitar e sumir com ela.
  const isSubmitDisabled = disabled || isEmpty || due === null || isSubmitting;

  // Tirar a data derruba a repetição junto. Deixar "toda semana" preso num campo
  // travado seria uma escolha invisível que o usuário não consegue mais desfazer.
  function handleDueChange(value: number | null) {
    setDue(value);
    if (value === null) {
      setRepeat(null);
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitDisabled || due === null) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(trimmed, due, repeat);
      setTitle("");
      setDue(null);
      setRepeat(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Adicionar nova tarefa"
      className="flex w-full flex-col gap-3 rounded-card border border-field-border bg-card p-3.5 shadow-card transition focus-within:border-accent focus-within:shadow-lift"
    >
      <div className="flex items-center gap-2.5">
        <label htmlFor="new-todo" className="sr-only">
          Nova tarefa
        </label>
        {/* O input não tem moldura própria: o cartão inteiro é o campo, e é ele
            que reage ao foco. Uma borda dentro de outra borda vira ruído. */}
        <input
          id="new-todo"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value.slice(0, TITLE_MAX_LENGTH))}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="No que você vai trabalhar?"
          disabled={disabled || isSubmitting}
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent px-1.5 py-2 text-base font-semibold text-fg placeholder:font-normal placeholder:text-placeholder focus:outline-none disabled:opacity-60 sm:text-lg"
        />

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex shrink-0 items-center gap-2 rounded-full bg-linear-to-br from-accent to-tangerine px-5 py-2.5 font-display font-semibold text-white shadow-pop transition hover:-translate-y-0.5 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />
          <span>Adicionar</span>
        </button>
      </div>

      <DateTimePicker
        value={due}
        onChange={handleDueChange}
        label="Lembrete da nova tarefa"
        disabled={disabled || isSubmitting}
      />

      <RepeatSelect
        value={repeat}
        onChange={setRepeat}
        disabled={due === null || disabled || isSubmitting}
      />

      {/* O botão desabilitado sozinho não explica nada. A dica só aparece depois
          que há um título — antes disso o formulário está vazio, e cobrar data de
          um campo em branco seria ranzinza. */}
      {!isEmpty && due === null && (
        <p className="text-xs font-semibold text-muted">
          Escolha uma data: toda tarefa mora num dia da agenda.
        </p>
      )}
    </form>
  );
}
