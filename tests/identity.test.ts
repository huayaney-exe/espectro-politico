import { describe, expect, it } from "vitest";
import { AXIS_IDS, AxisId, neutralVector, sanitizeVector } from "@/lib/axes";
import {
  DIMENSIONS,
  dimensionScores,
  identityProfile,
  shareIdentityText,
} from "@/lib/identity";

function vec(overrides: Partial<Record<AxisId, number>> = {}) {
  return sanitizeVector({ ...neutralVector(), ...overrides });
}

describe("DIMENSIONS — integridad del mapeo", () => {
  it("cada eje E1..E12 aparece EXACTAMENTE una vez (sin doble conteo, fix I2)", () => {
    const seen = new Map<string, number>();
    for (const d of DIMENSIONS) {
      for (const axis of Object.keys(d.weights)) {
        seen.set(axis, (seen.get(axis) ?? 0) + 1);
      }
    }
    for (const id of AXIS_IDS) {
      expect(seen.get(id), `eje ${id}`).toBe(1);
    }
    expect(seen.size).toBe(AXIS_IDS.length);
  });

  it("todas las dimensiones citan su marco de referencia", () => {
    for (const d of DIMENSIONS) {
      expect(d.source.length, d.id).toBeGreaterThan(10);
      expect(d.phrases.low && d.phrases.mid && d.phrases.high).toBeTruthy();
    }
  });
});

describe("dimensionScores", () => {
  it("vector neutral → 5 en las cinco dimensiones, tier mid", () => {
    for (const s of dimensionScores(neutralVector())) {
      expect(s.score).toBe(5);
      expect(s.tier).toBe("mid");
      expect(s.phrase).toBe(s.dimension.phrases.mid);
    }
  });

  it("agrega con pesos: económica = media de E1 y E11", () => {
    const scores = dimensionScores(vec({ E1: 10, E11: 6 }));
    const econ = scores.find((s) => s.dimension.id === "econ")!;
    expect(econ.score).toBe(8);
    expect(econ.tier).toBe("high");
  });

  it("propaga la confianza ponderada y detecta señal baja", () => {
    const conf = Object.fromEntries(AXIS_IDS.map((id) => [id, 0.1]));
    const scores = dimensionScores(neutralVector(), conf as any);
    for (const s of scores) expect(s.confidence).toBeCloseTo(0.1, 5);
  });
});

describe("identityProfile — arquetipo", () => {
  it("igualitario + progresista + libertario (ejemplo del brief)", () => {
    const p = identityProfile(
      vec({ E1: 8, E11: 8, E8: 9, E9: 8, E10: 8 })
    );
    expect(p.archetype).toContain("Igualitario progresista");
    expect(p.archetype).toContain("libertario");
    expect(p.family).toContain("socialdemocracia");
  });

  it("pro-mercado + conservador + de orden", () => {
    const p = identityProfile(
      vec({ E1: 1, E11: 2, E8: 2, E9: 1, E10: 2 })
    );
    expect(p.archetype).toContain("Conservador pro-mercado");
    expect(p.archetype).toContain("de orden");
  });

  it("centro puro → Centrista plural, sin modificadores", () => {
    const p = identityProfile(neutralVector());
    expect(p.archetype).toBe("Centrista plural");
    expect(p.emergentLean).toBe("centro");
  });

  it("máximo 2 modificadores aunque haya 3 dimensiones marcadas", () => {
    const p = identityProfile(
      vec({ E9: 9, E10: 9, E7: 9, E2: 9, E3: 9, E4: 9, E5: 9, E6: 9, E12: 9 })
    );
    const mods = ["libertario", "soberanista", "comunitario"].filter((m) =>
      p.archetype.includes(m)
    );
    expect(mods.length).toBe(2);
  });

  it("es determinista", () => {
    const v = vec({ E1: 7, E8: 3, E9: 2 });
    expect(identityProfile(v)).toEqual(identityProfile(v));
  });
});

describe("identityProfile — narrativa y lean", () => {
  it("la narrativa nombra la tensión igualdad económica + conservadurismo cultural", () => {
    const p = identityProfile(vec({ E1: 9, E11: 9, E8: 1 }));
    expect(p.narrative).toContain("conservadurismo cultural");
    expect(p.emergentLean).toBe("híbrido");
  });

  it("la narrativa reporta señal baja honestamente", () => {
    const conf = Object.fromEntries(AXIS_IDS.map((id) => [id, 0.9]));
    (conf as any).E8 = 0.1; // sociocultural sin señal
    const p = identityProfile(neutralVector(), conf as any);
    expect(p.narrative.toLowerCase()).toContain("sociocultural");
    expect(p.narrative).toContain("tentativa");
  });

  it("todo alto → lean izquierda; todo bajo → derecha", () => {
    const all = (n: number) =>
      sanitizeVector(Object.fromEntries(AXIS_IDS.map((id) => [id, n])));
    expect(identityProfile(all(10)).emergentLean).toBe("izquierda");
    expect(identityProfile(all(0)).emergentLean).toBe("derecha");
  });

  it("la narrativa NUNCA menciona políticos", () => {
    for (const v of [vec({ E1: 9 }), vec({ E1: 1, E8: 9 }), neutralVector()]) {
      const p = identityProfile(v);
      for (const nombre of ["Castillo", "Fujimori", "Boluarte", "Milei"]) {
        expect(p.narrative).not.toContain(nombre);
        expect(p.archetype).not.toContain(nombre);
      }
    }
  });
});

describe("shareIdentityText", () => {
  it("incluye arquetipo, URL y hashtag; sin políticos", () => {
    const p = identityProfile(vec({ E1: 8, E11: 8 }));
    const text = shareIdentityText(p, "https://x.test/r");
    expect(text).toContain(p.archetype);
    expect(text).toContain("https://x.test/r");
    expect(text).toContain("#NoHayEtiqueta");
  });
});
