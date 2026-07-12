import { Repeat as RepeatIcon } from "lucide-react";
import { REPEAT_LABELS, type Repeat } from "../../types/todo";

interface RepeatSelectProps {
  value: Repeat | null;
  onChange: (value: Repeat | null) => void;
  // Repetir sem data não existe: é a data escolhida que define o dia da semana,
  // o dia do mês e a hora do lembrete. Sem ela o seletor fica travado, e o texto
  // ao lado diz por quê — travar sem explicar seria só um botão quebrado.
  disabled: boolean;
}

// `null` é uma opção de verdade aqui ("não repete"), então ela entra na lista em
// vez de virar um caso especial no meio do render.
//
// Só "todo dia" é oferecido: quatro pílulas disputavam atenção num cartão que já
// tem título, data e botão. O motor de "toda semana" e "todo mês" continua inteiro
// em `recurrence.ts` (e testado) — voltar a oferecê-los é acrescentar uma linha
// aqui, e nada mais.
const OPTIONS: Array<{ value: Repeat | null; label: string }> = [
  { value: null, label: "Não repete" },
  { value: "daily", label: REPEAT_LABELS.daily },
];

function getOptionClasses(isSelected: boolean): string {
  const base =
    "rounded-full px-3 py-1.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed";
  if (isSelected) {
    return `${base} bg-accent text-white shadow-pop`;
  }
  return `${base} bg-field text-muted hover:bg-sunken hover:text-fg`;
}

export function RepeatSelect({ value, onChange, disabled }: RepeatSelectProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
        <RepeatIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Repetir</span>
      </span>

      <div
        role="radiogroup"
        aria-label="Repetição da tarefa"
        className="flex flex-wrap gap-1.5"
      >
        {OPTIONS.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`${getOptionClasses(isSelected)} disabled:opacity-45`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {disabled && (
        <span className="text-xs text-muted">Escolha uma data para repetir.</span>
      )}
    </div>
  );
}
