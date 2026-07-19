// Persistencia del perfil en la URL (hash), sin datos en servidor
// (ver docs/DECISIONS.md D6). 12 valores 0–10 → string compacto reversible.

import { AXIS_IDS, Vector, sanitizeVector } from "./axes";

/**
 * Codifica el vector como 12 dígitos en base 11 (0..a) → string corto.
 * Los valores se redondean a entero 0–10 para compartir.
 * Ej: "8a3009250049" (cada char = un eje E1..E12).
 */
const DIGITS = "0123456789a"; // 0..10

export function encodeVector(v: Vector): string {
  return AXIS_IDS.map((id) => {
    const n = Math.max(0, Math.min(10, Math.round(v[id])));
    return DIGITS[n];
  }).join("");
}

export function decodeVector(code: string | null | undefined): Vector | null {
  if (!code || code.length !== AXIS_IDS.length) return null;
  const partial: Record<string, number> = {};
  for (let i = 0; i < AXIS_IDS.length; i++) {
    const idx = DIGITS.indexOf(code[i].toLowerCase());
    if (idx < 0) return null;
    partial[AXIS_IDS[i]] = idx;
  }
  return sanitizeVector(partial as Partial<Record<(typeof AXIS_IDS)[number], number>>);
}

/** Lee el vector desde el hash de la URL (#p=CODE). */
export function readVectorFromHash(): Vector | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return decodeVector(params.get("p"));
}

export function vectorHash(v: Vector): string {
  return `#p=${encodeVector(v)}`;
}
