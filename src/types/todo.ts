// "daily" é a "fixa": todo dia. As outras seguem o dia da semana / do mês da
// primeira ocorrência.
export type Repeat = "daily" | "weekly" | "monthly";

export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  // Timestamp (ms) do lembrete. `null` = tarefa sem prazo, que nunca notifica.
  dueAt: number | null;
  // Recorrência. Cada data é uma tarefa própria no banco (uma "ocorrência") —
  // é isso que deixa o Worker avisar em cada uma sem precisar entender a regra.
  repeat: Repeat | null;
  // Liga as ocorrências da mesma série. `null` = tarefa avulsa.
  seriesId: string | null;
  // Data da PRIMEIRA ocorrência, e âncora de todo o cálculo. Gerar "mais um mês"
  // a partir da ocorrência anterior faria 31/jan virar 28/fev e depois 28/mar —
  // o dia 31 se perderia para sempre. Ancorado na origem, 31/jan → 28/fev → 31/mar.
  seriesStartAt: number | null;
}

export const TITLE_MAX_LENGTH = 150;

export const REPEAT_LABELS: Record<Repeat, string> = {
  daily: "Todo dia",
  weekly: "Toda semana",
  monthly: "Todo mês",
};
