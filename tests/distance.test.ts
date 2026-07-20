import { describe, expect, it } from "vitest";
import { AXIS_IDS, neutralVector, sanitizeVector, Vector } from "@/lib/axes";
import {
  NON_REPRESENTATION_THETA,
  rankPoliticians,
  representationVerdict,
  weightedDistance,
} from "@/lib/distance";

function all(value: number): Vector {
  return sanitizeVector(Object.fromEntries(AXIS_IDS.map((id) => [id, value])));
}

describe("weightedDistance", () => {
  it("distancia a sí mismo es 0", () => {
    const v = all(7);
    expect(weightedDistance(v, v)).toBe(0);
  });

  it("vectores opuestos extremos distan exactamente 1", () => {
    expect(weightedDistance(all(0), all(10))).toBeCloseTo(1, 9);
  });

  it("es simétrica", () => {
    const a = sanitizeVector({ E1: 9, E8: 2, E12: 7 });
    const b = sanitizeVector({ E1: 1, E8: 9, E12: 4 });
    expect(weightedDistance(a, b)).toBeCloseTo(weightedDistance(b, a), 12);
  });

  it("está acotada en [0, 1]", () => {
    const a = all(0);
    for (const v of [all(3), all(5), all(10)]) {
      const d = weightedDistance(a, v);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    }
  });
});

describe("rankPoliticians / representationVerdict", () => {
  const pols = [
    { id: "cerca", name: "Cerca", vector: all(6) },
    { id: "lejos", name: "Lejos", vector: all(0) },
  ];

  it("ordena por cercanía ascendente y similarity = 1 - distance", () => {
    const ranked = rankPoliticians(all(6), pols);
    expect(ranked[0].politician.id).toBe("cerca");
    expect(ranked[0].distance).toBe(0);
    expect(ranked[0].similarity).toBe(1);
    expect(ranked[1].distance).toBeGreaterThan(ranked[0].distance);
  });

  it("declara no-representación cuando el más cercano supera θ", () => {
    const verdict = representationVerdict(all(10), [
      { id: "lejos", name: "Lejos", vector: all(0) },
    ]);
    expect(verdict.represented).toBe(false);
    expect(verdict.theta).toBe(NON_REPRESENTATION_THETA);
    expect(verdict.topResiduals).toHaveLength(3);
    expect(verdict.topResiduals[0].gap).toBe(10);
  });

  it("declara representación con un político idéntico", () => {
    const me = neutralVector();
    const verdict = representationVerdict(me, [
      { id: "yo", name: "Yo", vector: me },
    ]);
    expect(verdict.represented).toBe(true);
    expect(verdict.closest.distance).toBe(0);
  });
});
