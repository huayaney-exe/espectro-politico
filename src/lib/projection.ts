// Proyección determinista 12→3 (ver docs/DECISIONS.md D4).
// Matriz fija, interpretable, sin entrenamiento en runtime.
// X = económico/estructural-soberanista · Y = cultural/libertades · Z = territorio/extractivismo

import { AXIS_IDS, AxisId, Vector } from "./axes";

type Row = { X: number; Y: number; Z: number };

export const W: Record<AxisId, Row> = {
  E1: { X: 0.9, Y: 0.2, Z: 0.1 },
  E2: { X: 0.2, Y: 0.1, Z: 0.95 },
  E3: { X: 0.8, Y: 0.0, Z: -0.1 },
  E4: { X: 0.7, Y: 0.0, Z: 0.0 },
  E5: { X: 0.5, Y: 0.1, Z: 0.0 },
  E6: { X: 0.8, Y: 0.0, Z: 0.0 },
  E7: { X: 0.4, Y: 0.3, Z: 0.85 },
  E8: { X: 0.0, Y: 0.95, Z: 0.1 },
  E9: { X: 0.1, Y: 0.7, Z: 0.0 },
  E10: { X: 0.2, Y: 0.7, Z: 0.2 },
  E11: { X: 0.9, Y: 0.2, Z: 0.0 },
  E12: { X: 0.6, Y: 0.2, Z: 0.2 },
};

// L1 de cada columna (suma de |peso|) para normalizar coords a ~[-1,1].
export const L1 = { X: 6.1, Y: 3.45, Z: 2.6 };

export interface Projection3D {
  x: number; // [-1,1] económico/estructural
  y: number; // [-1,1] cultural/libertades
  z: number; // [-1,1] territorio/extractivismo
}

/** Centra un score 0–10 a [-1,1]. */
function center(s: number): number {
  return (s - 5) / 5;
}

/** Proyecta un vector de 12 ejes a coordenadas 3D interpretables. */
export function project(v: Vector): Projection3D {
  let x = 0, y = 0, z = 0;
  for (const id of AXIS_IDS) {
    const c = center(v[id]);
    x += c * W[id].X;
    y += c * W[id].Y;
    z += c * W[id].Z;
  }
  return { x: x / L1.X, y: y / L1.Y, z: z / L1.Z };
}

export const AXIS_LABELS_2D = {
  xLow: "Mercado / dependencia",
  xHigh: "Estado / soberanía",
  yLow: "Autoridad / conservador",
  yHigh: "Libertades / progresista",
  zLow: "Pro-extracción",
  zHigh: "Territorio / ambiente",
};
