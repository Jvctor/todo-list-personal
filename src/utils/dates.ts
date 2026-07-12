// Helpers para o prazo (`dueAt`) da tarefa. O banco guarda um timestamp em ms;
// a UI trabalha com dia + hora separados. Estas funções fazem a ponte.

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const DAY_MS = 24 * 60 * 60 * 1000;

// Hora usada quando o usuário escolhe um dia sem ter mexido no horário.
export const DEFAULT_DUE_TIME = "09:00";

export const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDueLabel(timestamp: number): string {
  return DATE_TIME_FORMATTER.format(new Date(timestamp));
}

export function formatFullDate(date: Date): string {
  return FULL_DATE_FORMATTER.format(date);
}

export function formatMonthYear(date: Date): string {
  const label = MONTH_YEAR_FORMATTER.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isOverdue(timestamp: number, now: number): boolean {
  return timestamp < now;
}

export interface TimeParts {
  hour: number;
  minute: number;
}

export function extractTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

// `Number("")` é 0, não NaN — então uma hora vazia viraria meia-noite em silêncio.
// Por isso a validação testa a string, não só o resultado da conversão.
export function parseTimeValue(time: string): TimeParts {
  const [rawHour, rawMinute] = time.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  const isValid =
    rawHour !== undefined &&
    rawHour.length > 0 &&
    rawMinute !== undefined &&
    rawMinute.length > 0 &&
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59;

  if (isValid) {
    return { hour, minute };
  }
  const [defaultHour, defaultMinute] = DEFAULT_DUE_TIME.split(":");
  return { hour: Number(defaultHour), minute: Number(defaultMinute) };
}

// Junta o dia escolhido no calendário com a hora escolhida. Meia-noite (00:00) é
// um horário legítimo e precisa sobreviver a essa combinação.
export function combineDateAndTime(date: Date, time: string): number {
  const { hour, minute } = parseTimeValue(time);
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result.getTime();
}

// Meia-noite do dia do timestamp. É o corte usado pela recorrência: uma ocorrência
// vencida só some na virada do dia, não na hora — senão a tarefa das 09:00
// desapareceria às 09:01 e o usuário nunca a veria.
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// Andar de dia pela data, não somando 24h em milissegundos: no dia da virada do
// horário de verão o dia tem 23 ou 25 horas, e a conta por ms cairia no dia errado.
export function addDays(timestamp: number, amount: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + amount);
  return date.getTime();
}

export function formatDayLabel(dayStart: number): string {
  const label = DAY_MONTH_FORMATTER.format(new Date(dayStart));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// "Hoje" e "Ontem" pesam mais do que a data: é assim que a pessoa pensa no dia.
// Quem está longe dessa janela lê a data mesmo, que aí é o que identifica.
export function getRelativeDayName(dayStart: number, now: number): string | null {
  const distance = Math.round((dayStart - startOfDay(now)) / DAY_MS);
  if (distance === 0) {
    return "Hoje";
  }
  if (distance === 1) {
    return "Amanhã";
  }
  if (distance === -1) {
    return "Ontem";
  }
  return null;
}

export function isSameDay(date: Date, timestamp: number): boolean {
  const other = new Date(timestamp);
  return (
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  );
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

// Células do calendário: `null` são os espaços vazios antes do dia 1, para que a
// primeira semana comece na coluna certa.
export function getMonthCells(view: Date): Array<Date | null> {
  const year = view.getFullYear();
  const month = view.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let index = 0; index < leadingBlanks; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}
