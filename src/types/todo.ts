export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  // Timestamp (ms) do lembrete. `null` = tarefa sem prazo, que nunca notifica.
  dueAt: number | null;
}

export type Filter = "all" | "active" | "completed";

export const TITLE_MAX_LENGTH = 150;
