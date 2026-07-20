// Carga del banco de probes conversacionales (data/seed/probes.json).

import probesData from "../../data/seed/probes.json";
import { AxisId } from "./axes";

export interface ProbeOption {
  /** Texto corto del chip en la UI. */
  label: string;
  /** Postura canónica que se envía como respuesta al scorer. */
  answer: string;
}

export interface Probe {
  id: string;
  axes: AxisId[];
  prompt_es: string;
  why: string;
  signal_hints: { low: string; high: string };
  /** Respuestas rápidas (2 polos + matiz). El texto libre sigue disponible. */
  options?: ProbeOption[];
}

export interface ProbeBank {
  version: string;
  language: string;
  probes: Probe[];
}

export const PROBE_BANK = probesData as ProbeBank;
export const PROBES: Probe[] = PROBE_BANK.probes;

export function probeById(id: string): Probe | undefined {
  return PROBES.find((p) => p.id === id);
}
