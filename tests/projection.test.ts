import { describe, expect, it } from "vitest";
import { AXIS_IDS, neutralVector, sanitizeVector } from "@/lib/axes";
import { L1, W, project } from "@/lib/projection";

describe("projection", () => {
  it("los normalizadores L1 son exactamente la suma de |peso| de cada columna de W", () => {
    // Este test habría atrapado el bug L1.Z=2.6 (real: 2.5).
    let x = 0,
      y = 0,
      z = 0;
    for (const id of AXIS_IDS) {
      x += Math.abs(W[id].X);
      y += Math.abs(W[id].Y);
      z += Math.abs(W[id].Z);
    }
    expect(L1.X).toBeCloseTo(x, 9);
    expect(L1.Y).toBeCloseTo(y, 9);
    expect(L1.Z).toBeCloseTo(z, 9);
  });

  it("el vector neutral proyecta al origen", () => {
    const p = project(neutralVector());
    expect(p.x).toBeCloseTo(0, 9);
    expect(p.y).toBeCloseTo(0, 9);
    expect(p.z).toBeCloseTo(0, 9);
  });

  it("todo-10 satura X e Y en 1 (pesos no negativos) y Z en 0.92 (E3 pesa negativo)", () => {
    const all10 = sanitizeVector(
      Object.fromEntries(AXIS_IDS.map((id) => [id, 10]))
    );
    const p = project(all10);
    expect(p.x).toBeCloseTo(1, 9);
    expect(p.y).toBeCloseTo(1, 9);
    expect(p.z).toBeCloseTo(2.3 / 2.5, 9);
  });

  it("todas las coordenadas quedan en [-1, 1] para vectores extremos", () => {
    for (const extreme of [0, 10]) {
      const v = sanitizeVector(
        Object.fromEntries(AXIS_IDS.map((id) => [id, extreme]))
      );
      const p = project(v);
      for (const c of [p.x, p.y, p.z]) {
        expect(c).toBeGreaterThanOrEqual(-1);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
  });

  it("subir un eje con peso X positivo mueve X a la derecha (monotonicidad)", () => {
    const base = neutralVector();
    const up = { ...base, E1: 9 };
    expect(project(up).x).toBeGreaterThan(project(base).x);
  });
});
