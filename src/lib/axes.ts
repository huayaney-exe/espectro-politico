// Los 12 ejes del Espectro (ver docs/DECISIONS.md D1). Cada eje 0–10.

export type AxisId =
  | "E1" | "E2" | "E3" | "E4" | "E5" | "E6"
  | "E7" | "E8" | "E9" | "E10" | "E11" | "E12";

export type Vector = Record<AxisId, number>;

/** Confianza por eje (0–1) que acompaña a un vector inferido. */
export type Confidence = Record<AxisId, number>;

export type Cluster = "economico" | "soberania" | "cultural" | "extraccion" | "otro";

export interface Axis {
  id: AxisId;
  n: number; // orden 1..12
  name: string;
  short: string;
  poleLow: string; // qué significa 0
  poleHigh: string; // qué significa 10
  cluster: Cluster;
}

export const AXES: Axis[] = [
  { id: "E1", n: 1, name: "Redistributivo", short: "Redistribución", poleLow: "Mercado, bajos impuestos", poleHigh: "Redistribución radical", cluster: "economico" },
  { id: "E2", n: 2, name: "Extractivismo", short: "Extractivismo", poleLow: "Profundizar extracción", poleHigh: "Restringir extracción", cluster: "extraccion" },
  { id: "E3", n: 3, name: "Soberanía Productiva", short: "Sob. Productiva", poleLow: "Importar / libre comercio", poleHigh: "Industrializar / proteger", cluster: "soberania" },
  { id: "E4", n: 4, name: "Soberanía Tecnológica", short: "Sob. Tecnológica", poleLow: "Dependencia externa", poleHigh: "Autonomía tecnológica", cluster: "soberania" },
  { id: "E5", n: 5, name: "Soberanía Militar", short: "Sob. Militar", poleLow: "Alineación con EE.UU.", poleHigh: "Neutralidad / autonomía", cluster: "soberania" },
  { id: "E6", n: 6, name: "Soberanía Monetaria", short: "Sob. Monetaria", poleLow: "Dolarizar", poleHigh: "Soberanía emisora", cluster: "soberania" },
  { id: "E7", n: 7, name: "Tierra y Territorio", short: "Tierra", poleLow: "Status quo concentrado", poleHigh: "Reforma / veto indígena", cluster: "extraccion" },
  { id: "E8", n: 8, name: "Derechos Culturales", short: "D. Culturales", poleLow: "Restrictivo", poleHigh: "Ampliar plenamente", cluster: "cultural" },
  { id: "E9", n: 9, name: "Seguridad", short: "Seguridad", poleLow: "Mano dura / militarización", poleHigh: "Enfoque social-judicial", cluster: "cultural" },
  { id: "E10", n: 10, name: "Memoria Histórica", short: "Memoria", poleLow: "Amnistía / olvido", poleHigh: "Juicio y memoria", cluster: "cultural" },
  { id: "E11", n: 11, name: "Estado en Salud/Educación", short: "Estado Social", poleLow: "Privado", poleHigh: "Público integral", cluster: "economico" },
  { id: "E12", n: 12, name: "Alineamiento Geopolítico", short: "Geopolítica", poleLow: "Alineado con Occidente", poleHigh: "Multipolar / no alineado", cluster: "soberania" },
];

export const AXIS_IDS: AxisId[] = AXES.map((a) => a.id);

export const AXIS_BY_ID: Record<AxisId, Axis> = Object.fromEntries(
  AXES.map((a) => [a.id, a])
) as Record<AxisId, Axis>;

/** Vector neutral (todo en 5) — punto de partida y fallback. */
export function neutralVector(): Vector {
  return Object.fromEntries(AXIS_IDS.map((id) => [id, 5])) as Vector;
}

/** Valida y clampa un vector a enteros/valores en [0,10] sobre los 12 ejes. */
export function sanitizeVector(input: Partial<Record<AxisId, number>>): Vector {
  const v = neutralVector();
  for (const id of AXIS_IDS) {
    const raw = input[id];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      v[id] = Math.max(0, Math.min(10, raw));
    }
  }
  return v;
}
