// Helpers para o prazo (`dueAt`) da tarefa. O `<input type="datetime-local">`
// trabalha com a string "AAAA-MM-DDTHH:MM" no fuso LOCAL, enquanto o banco guarda
// um timestamp em ms — estas funções fazem a ponte entre os dois.

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateTimeLocalValue(timestamp: number): string {
  const date = new Date(timestamp);
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${day}T${time}`;
}

// Devolve `null` quando o campo está vazio ou a data é inválida, para o chamador
// tratar "sem prazo" e "prazo inválido" do mesmo jeito: não grava nada.
export function fromDateTimeLocalValue(value: string): number | null {
  if (value.length === 0) {
    return null;
  }
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return null;
  }
  return timestamp;
}

export function formatDueLabel(timestamp: number): string {
  return DATE_TIME_FORMATTER.format(new Date(timestamp));
}

export function isOverdue(timestamp: number, now: number): boolean {
  return timestamp < now;
}
