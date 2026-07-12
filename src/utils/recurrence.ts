// Matemática da recorrência. Nada aqui toca o banco: são funções puras que dizem
// QUAIS datas uma série deveria ter. Quem grava é o useTodos.
//
// Toda ocorrência é calculada a partir da âncora (`seriesStartAt`), nunca a partir
// da ocorrência anterior. Encadear geraria dois bugs silenciosos: o mensal perderia
// o dia 31 para sempre (31/jan → 28/fev → 28/mar) e o diário acumularia o erro do
// horário de verão. Ancorado, cada data é independente e sempre reproduzível.

import type { Repeat } from "../types/todo";
import { DAY_MS, addDays, startOfDay } from "./dates";

// Quantos dias de ocorrências ficam gravados à frente. O Worker só avisa o que
// existe no banco, então este número é, na prática, "por quantos dias o app pode
// ficar fechado sem parar de lembrar".
export const HORIZON_DAYS = 30;

// Trava de segurança: se algum cálculo escapar, o laço para em vez de travar a aba.
const MAX_OCCURRENCES = 400;

// `setMonth` sozinho estoura: 31/jan + 1 mês vira 3/mar, porque fevereiro não tem
// 31. Fixamos o dia 1, andamos os meses e só então trazemos o dia de volta, preso
// ao último dia daquele mês.
function addMonthsClamped(timestamp: number, amount: number): number {
  const start = new Date(timestamp);
  const target = new Date(
    start.getFullYear(),
    start.getMonth() + amount,
    1,
    start.getHours(),
    start.getMinutes(),
    0,
    0,
  );
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(start.getDate(), lastDayOfTargetMonth));
  return target.getTime();
}

// A enésima ocorrência da série, contada a partir da âncora (índice 0 = a âncora).
export function occurrenceAt(
  startAt: number,
  repeat: Repeat,
  index: number,
): number {
  if (repeat === "daily") {
    return addDays(startAt, index);
  }
  if (repeat === "weekly") {
    return addDays(startAt, index * 7);
  }
  return addMonthsClamped(startAt, index);
}

// Estimativa do índice para não varrer dia a dia uma série antiga (uma diária de
// um ano atrás teria 365 iterações inúteis). A conta por milissegundo pode errar
// por causa do horário de verão e dos meses de tamanhos diferentes, então ela só
// aproxima — `firstIndexOnOrAfter` corrige o resto no passo a passo.
function estimateIndex(startAt: number, repeat: Repeat, target: number): number {
  const elapsed = target - startAt;
  if (elapsed <= 0) {
    return 0;
  }
  if (repeat === "daily") {
    return Math.floor(elapsed / DAY_MS);
  }
  if (repeat === "weekly") {
    return Math.floor(elapsed / (7 * DAY_MS));
  }
  const start = new Date(startAt);
  const end = new Date(target);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

function firstIndexOnOrAfter(
  startAt: number,
  repeat: Repeat,
  from: number,
): number {
  // Recua alguns passos antes de corrigir para a frente: assim um erro da
  // estimativa para qualquer lado é absorvido sem pular uma ocorrência.
  let index = Math.max(0, estimateIndex(startAt, repeat, from) - 2);
  let guard = 0;
  while (occurrenceAt(startAt, repeat, index) < from && guard < MAX_OCCURRENCES) {
    index += 1;
    guard += 1;
  }
  return index;
}

// Todas as datas da série dentro da janela [from, to]. É a única fonte da verdade
// sobre o que deveria existir no banco.
export function occurrencesInRange(
  startAt: number,
  repeat: Repeat,
  from: number,
  to: number,
): number[] {
  const dates: number[] = [];
  let index = firstIndexOnOrAfter(startAt, repeat, from);

  while (dates.length < MAX_OCCURRENCES) {
    const timestamp = occurrenceAt(startAt, repeat, index);
    if (timestamp > to) {
      break;
    }
    dates.push(timestamp);
    index += 1;
  }
  return dates;
}

// A janela que o banco precisa cobrir: de hoje (meia-noite) até o horizonte.
export function getHorizonRange(now: number): { from: number; to: number } {
  return {
    from: startOfDay(now),
    to: addDays(now, HORIZON_DAYS),
  };
}
