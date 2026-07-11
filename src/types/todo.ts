export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export type Filter = "all" | "active" | "completed";

export const TITLE_MAX_LENGTH = 150;
