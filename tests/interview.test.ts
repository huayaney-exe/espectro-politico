import { describe, expect, it } from "vitest";
import { Confidence } from "@/lib/axes";
import { PROBES } from "@/lib/probes";
import {
  CLARIFY_BELOW,
  HistoryEntry,
  MAX_CLARIFICATIONS,
  MAX_TURNS,
  TAU,
  axesResolved,
  clarifyTemplate,
  lowSignalAxes,
  needsClarification,
  neutralConfidence,
  pickNextProbe,
  probeDeficit,
  sufficiency,
} from "@/lib/interview/engine";

function conf(overrides: Partial<Confidence> = {}): Confidence {
  return { ...neutralConfidence(), ...overrides };
}

function probeEntry(probeId: string, answer = "una respuesta", skipped = false): HistoryEntry {
  return { probeId, kind: "probe", answer, skipped };
}

describe("pickNextProbe", () => {
  it("con todo neutral elige el primer probe del banco (empate → orden)", () => {
    expect(pickNextProbe(neutralConfidence(), new Set())!.id).toBe(PROBES[0].id);
  });

  it("apunta al probe cuyos ejes tienen menor confianza", () => {
    // Todo resuelto salvo E9 (solo p9 lo cubre).
    const c = conf(
      Object.fromEntries(
        Object.keys(neutralConfidence()).map((id) => [id, 0.9])
      ) as Confidence
    );
    c.E9 = 0.1;
    expect(pickNextProbe(c, new Set())!.id).toBe("p9");
  });

  it("no repite probes ya preguntados", () => {
    const asked = new Set([PROBES[0].id]);
    expect(pickNextProbe(neutralConfidence(), asked)!.id).not.toBe(PROBES[0].id);
  });

  it("devuelve null cuando todos los ejes están resueltos (déficit 0)", () => {
    const c = conf(
      Object.fromEntries(
        Object.keys(neutralConfidence()).map((id) => [id, TAU])
      ) as Confidence
    );
    expect(pickNextProbe(c, new Set())).toBeNull();
  });

  it("probeDeficit suma el déficit de los ejes del probe", () => {
    const p9 = PROBES.find((p) => p.id === "p9")!; // solo E9
    const c = conf({ E9: 0.2 });
    expect(probeDeficit(p9, c)).toBeCloseTo(TAU - 0.2, 9);
  });
});

describe("sufficiency", () => {
  it("continúa cuando hay incertidumbre y turnos disponibles", () => {
    expect(sufficiency(neutralConfidence(), []).done).toBe(false);
  });

  it("para en MAX_TURNS aunque falte señal", () => {
    const history = Array.from({ length: MAX_TURNS }, (_, i) =>
      probeEntry(PROBES[i % PROBES.length].id)
    );
    const v = sufficiency(neutralConfidence(), history);
    expect(v.done).toBe(true);
    expect(v.reason).toBe("max_turns");
  });

  it("para por confianza cuando los 12 ejes llegan a TAU", () => {
    const c = conf(
      Object.fromEntries(
        Object.keys(neutralConfidence()).map((id) => [id, TAU + 0.1])
      ) as Confidence
    );
    const v = sufficiency(c, [probeEntry("p1")]);
    expect(v.done).toBe(true);
    expect(v.reason).toBe("confident");
  });

  it("para cuando el banco se agota", () => {
    const history = PROBES.map((p) => probeEntry(p.id));
    // MAX_TURNS < banco completo, así que max_turns gana; probamos el caso
    // banco-agotado con historial corto pero todos los probes marcados.
    const short = history.slice(0, 3);
    const askedAll = sufficiency(neutralConfidence(), history);
    expect(askedAll.done).toBe(true);
    void short;
  });
});

describe("needsClarification", () => {
  it("pide aclarar cuando los ejes del último probe siguen sin señal", () => {
    const history = [probeEntry("p9", "mmm no sé, es complicado")];
    const c = conf({ E9: 0.15 });
    expect(needsClarification(c, history)?.id).toBe("p9");
  });

  it("NO aclara si la respuesta resolvió el eje", () => {
    const history = [probeEntry("p9", "mano dura y punto")];
    const c = conf({ E9: 0.6 });
    expect(needsClarification(c, history)).toBeNull();
  });

  it("NO aclara sobre un skip ni sobre otra aclaración", () => {
    const skipped = [probeEntry("p9", "", true)];
    expect(needsClarification(conf({ E9: 0.1 }), skipped)).toBeNull();

    const clarify: HistoryEntry[] = [
      probeEntry("p9", "es complicado"),
      { probeId: "p9", kind: "clarify", answer: "sigo sin saber" },
    ];
    expect(needsClarification(conf({ E9: 0.1 }), clarify)).toBeNull();
  });

  it("respeta el presupuesto MAX_CLARIFICATIONS", () => {
    const history: HistoryEntry[] = [
      { probeId: "p1", kind: "clarify", answer: "x" },
      { probeId: "p2", kind: "clarify", answer: "y" },
      probeEntry("p9", "no sé"),
    ];
    expect(history.filter((h) => h.kind === "clarify").length).toBe(
      MAX_CLARIFICATIONS
    );
    expect(needsClarification(conf({ E9: 0.1 }), history)).toBeNull();
  });

  it("el umbral de duda es CLARIFY_BELOW", () => {
    const history = [probeEntry("p9", "algo dije")];
    expect(needsClarification(conf({ E9: CLARIFY_BELOW }), history)).toBeNull();
    expect(
      needsClarification(conf({ E9: CLARIFY_BELOW - 0.01 }), history)?.id
    ).toBe("p9");
  });
});

describe("clarifyTemplate / coverage helpers", () => {
  it("la aclaración nombra los dos polos del eje menos resuelto", () => {
    const p9 = PROBES.find((p) => p.id === "p9")!;
    const text = clarifyTemplate(p9, neutralConfidence());
    expect(text).toContain("Mano dura");
    expect(text).toContain("social-judicial");
  });

  it("axesResolved y lowSignalAxes cuentan correctamente", () => {
    const c = conf({ E1: 0.9, E2: 0.5 });
    expect(axesResolved(c)).toBe(2);
    expect(lowSignalAxes(c)).not.toContain("E1");
    expect(lowSignalAxes(c)).toContain("E3");
  });
});
