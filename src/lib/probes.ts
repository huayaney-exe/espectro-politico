// Carga del banco de probes conversacionales (data/seed/probes.json).

import probesData from "../../data/seed/probes.json";
import { AxisId } from "./axes";

export interface Probe {
  id: string;
  axes: AxisId[];
  prompt_es: string;
  why: string;
  signal_hints: { low: string; high: string };
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
