// Motor de entrevista adaptativa (ver docs/DECISIONS.md D9).
// Control DETERMINISTA: el LLM redacta preguntas y extrae señal, pero qué
// tema preguntar, cuándo pedir aclaración y cuándo parar se decide aquí,
// en código puro y testeable. Tres roles separados (anti-sicofancia D2/D3):
//   - Estimator (LLM): transcripción → scores + confianza. No genera UI.
//   - Converser (LLM): transcripción + tema → pregunta. Nunca ve los scores.
//   - Engine (esto): confianza → selección de tema + parada. Sin LLM.

import { AXIS_BY_ID, AXIS_IDS, AxisId, Confidence } from "../axes";
import { Probe, PROBES } from "../probes";

/** Confianza objetivo por eje: con esto el eje se considera "resuelto". */
export const TAU = 0.45;
/** Techo duro de turnos (probes + aclaraciones) — control de longitud. */
export const MAX_TURNS = 9;
/** Máximo de aclaraciones en toda la entrevista. */
export const MAX_CLARIFICATIONS = 2;
/** Si tras responder un probe sus ejes siguen bajo esto, el modelo "duda". */
export const CLARIFY_BELOW = 0.25;

export interface HistoryEntry {
  probeId: string;
  kind: "probe" | "clarify";
  /** Pregunta efectivamente mostrada (para clarify, la generada). */
  question?: string;
  answer: string;
  skipped?: boolean;
}

export interface NextQuestion {
  kind: "probe" | "clarify";
  probeId: string;
  question: string;
}

export function neutralConfidence(): Confidence {
  return Object.fromEntries(AXIS_IDS.map((id) => [id, 0.1])) as Confidence;
}

export function askedProbeIds(history: HistoryEntry[]): Set<string> {
  return new Set(history.filter((h) => h.kind === "probe").map((h) => h.probeId));
}

export function clarificationsUsed(history: HistoryEntry[]): number {
  return history.filter((h) => h.kind === "clarify").length;
}

/** Cuántos ejes ya tienen señal suficiente. */
export function axesResolved(confidence: Confidence): number {
  return AXIS_IDS.filter((id) => (confidence[id] ?? 0) >= TAU).length;
}

/** Ejes que quedaron con señal baja (para el cierre honesto y la UI). */
export function lowSignalAxes(confidence: Confidence): AxisId[] {
  return AXIS_IDS.filter((id) => (confidence[id] ?? 0) < 0.3);
}

/** Cuánta incertidumbre reduciría este probe (suma de déficit de sus ejes). */
export function probeDeficit(probe: Probe, confidence: Confidence): number {
  return probe.axes.reduce(
    (acc, a) => acc + Math.max(0, TAU - (confidence[a] ?? 0)),
    0
  );
}

/**
 * Elige el probe no preguntado que más incertidumbre reduce.
 * null → ningún probe aporta (todo resuelto o banco agotado).
 */
export function pickNextProbe(
  confidence: Confidence,
  asked: Set<string>
): Probe | null {
  let best: Probe | null = null;
  let bestDeficit = 1e-9;
  for (const p of PROBES) {
    if (asked.has(p.id)) continue;
    const d = probeDeficit(p, confidence);
    if (d > bestDeficit) {
      best = p;
      bestDeficit = d;
    }
  }
  return best;
}

export interface Sufficiency {
  done: boolean;
  reason: "max_turns" | "confident" | "bank_exhausted" | "continue";
}

/** Criterio de "suficiente información". */
export function sufficiency(
  confidence: Confidence,
  history: HistoryEntry[]
): Sufficiency {
  if (history.length >= MAX_TURNS) return { done: true, reason: "max_turns" };
  if (axesResolved(confidence) === AXIS_IDS.length)
    return { done: true, reason: "confident" };
  if (!pickNextProbe(confidence, askedProbeIds(history)))
    return { done: true, reason: "bank_exhausted" };
  return { done: false, reason: "continue" };
}

/**
 * ¿El modelo se quedó con dudas tras la última respuesta?
 * Solo aplica si: fue un probe respondido (no skip, no clarify), sus ejes
 * siguen bajo CLARIFY_BELOW, y queda presupuesto de aclaraciones.
 */
export function needsClarification(
  confidence: Confidence,
  history: HistoryEntry[]
): Probe | null {
  const last = history[history.length - 1];
  if (!last || last.kind !== "probe" || last.skipped || !last.answer.trim())
    return null;
  if (clarificationsUsed(history) >= MAX_CLARIFICATIONS) return null;
  const probe = PROBES.find((p) => p.id === last.probeId);
  if (!probe) return null;
  const unresolved = probe.axes.every(
    (a) => (confidence[a] ?? 0) < CLARIFY_BELOW
  );
  return unresolved ? probe : null;
}

/**
 * Aclaración determinista (fallback sin LLM y modo mock): nombra el eje
 * menos resuelto del probe y ofrece sus dos polos.
 */
export function clarifyTemplate(probe: Probe, confidence: Confidence): string {
  const axis = [...probe.axes].sort(
    (a, b) => (confidence[a] ?? 0) - (confidence[b] ?? 0)
  )[0];
  const def = AXIS_BY_ID[axis];
  return `No me quedó del todo claro. En ${def.name.toLowerCase()}, ¿te inclinas más hacia «${def.poleLow}» o hacia «${def.poleHigh}»? ¿Por qué?`;
}
