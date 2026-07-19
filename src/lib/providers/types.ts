// Contrato del adaptador LLM. El scorer está SEPARADO del conversador
// (mitiga sicofancia). Ver docs/DECISIONS.md D2/D3.

import { AxisId, Vector, Confidence } from "../axes";

export interface Turn {
  probeId: string;
  question: string;
  axes: AxisId[];
  answer: string;
  hints?: { low: string; high: string };
}

export interface ScoreResult {
  vector: Vector; // 12 ejes 0–10
  confidence: Confidence; // 0–1 por eje
  rationale: Partial<Record<AxisId, string>>; // por qué de los ejes con señal
  provider: string; // "mock" | "anthropic"
}

export interface LLMProvider {
  name: string;
  /**
   * Infiere el vector de 12 ejes a partir de la conversación.
   * Debe devolver un vector completo (los ejes sin evidencia → 5, confianza baja).
   */
  scoreConversation(turns: Turn[]): Promise<ScoreResult>;
}
