// Distancia ponderada + político más cercano + frontera de no-representación
// (ver docs/DECISIONS.md D5).

import { AXIS_IDS, AxisId, Vector, AXIS_BY_ID } from "./axes";

// Salience por eje: down-weight de clusters colineales para no sobrecontar.
const CLUSTER_WEIGHT: Record<string, number> = {
  economico: 0.7,   // E1, E11 (+E3,E6 marcados soberania pero económicos)
  soberania: 0.8,
  cultural: 0.8,
  extraccion: 0.8,
  otro: 1.0,
};

// Ajuste fino: E3 y E6 son económico-estructurales aunque etiquetados soberanía.
const SALIENCE: Record<AxisId, number> = (() => {
  const s = {} as Record<AxisId, number>;
  for (const id of AXIS_IDS) {
    s[id] = CLUSTER_WEIGHT[AXIS_BY_ID[id].cluster] ?? 1.0;
  }
  s.E3 = 0.7;
  s.E6 = 0.7;
  return s;
})();

const SUM_W = AXIS_IDS.reduce((acc, id) => acc + SALIENCE[id], 0);

/** Distancia normalizada [0,1] entre dos vectores de 12 ejes. */
export function weightedDistance(a: Vector, b: Vector): number {
  let acc = 0;
  for (const id of AXIS_IDS) {
    const ca = (a[id] - 5) / 5;
    const cb = (b[id] - 5) / 5;
    const d = ca - cb;
    acc += SALIENCE[id] * d * d;
  }
  // Máx teórico: cada eje difiere en 2 (de -1 a 1) → d^2 = 4.
  const max = SUM_W * 4;
  return Math.sqrt(acc / max);
}

export interface PoliticianVec {
  id: string;
  name: string;
  period?: string;
  vector: Vector;
  confidence?: string;
  basis?: string[];
  sources?: string[];
}

export interface Match {
  politician: PoliticianVec;
  distance: number; // 0 = idéntico, 1 = opuesto
  similarity: number; // 1 - distance
}

/** Ordena políticos por cercanía al vector del usuario. */
export function rankPoliticians(user: Vector, pols: PoliticianVec[]): Match[] {
  return pols
    .map((p) => {
      const distance = weightedDistance(user, p.vector);
      return { politician: p, distance, similarity: 1 - distance };
    })
    .sort((a, b) => a.distance - b.distance);
}

export interface AxisResidual {
  axis: AxisId;
  name: string;
  userScore: number;
  polScore: number;
  gap: number;
}

export interface RepresentationVerdict {
  closest: Match;
  represented: boolean; // false = ningún político te representa (min_dist > θ)
  theta: number;
  topResiduals: AxisResidual[]; // 3 ejes donde el más cercano más te falla
}

export const NON_REPRESENTATION_THETA = 0.3;

/** Diagnóstico de la "frontera de no-representación". */
export function representationVerdict(
  user: Vector,
  pols: PoliticianVec[]
): RepresentationVerdict {
  const ranked = rankPoliticians(user, pols);
  const closest = ranked[0];
  const residuals: AxisResidual[] = AXIS_IDS.map((id) => ({
    axis: id,
    name: AXIS_BY_ID[id].name,
    userScore: user[id],
    polScore: closest.politician.vector[id],
    gap: Math.abs(user[id] - closest.politician.vector[id]),
  }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  return {
    closest,
    represented: closest.distance <= NON_REPRESENTATION_THETA,
    theta: NON_REPRESENTATION_THETA,
    topResiduals: residuals,
  };
}
