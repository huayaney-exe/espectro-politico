import { describe, expect, it } from "vitest";
import { AXIS_IDS, neutralVector, sanitizeVector } from "@/lib/axes";
import { describeProfile, shareText, topAxes } from "@/lib/describe";

describe("describeProfile", () => {
  it("vector neutral → economía mixta, lean centro", () => {
    const p = describeProfile(neutralVector());
    expect(p.label).toContain("economía mixta");
    expect(p.emergentLean).toBe("centro");
  });

  it("todo-10 → redistribucionista soberanista progresista post-extractivista, lean izquierda", () => {
    const v = sanitizeVector(
      Object.fromEntries(AXIS_IDS.map((id) => [id, 10]))
    );
    const p = describeProfile(v);
    expect(p.label).toContain("redistribucionista");
    expect(p.label).toContain("soberanista");
    expect(p.label).toContain("progresista");
    expect(p.label).toContain("post-extractivista");
    expect(p.emergentLean).toBe("izquierda");
  });

  it("todo-0 → pro-mercado conservador extractivista, lean derecha", () => {
    const v = sanitizeVector(Object.fromEntries(AXIS_IDS.map((id) => [id, 0])));
    const p = describeProfile(v);
    expect(p.label).toContain("pro-mercado");
    expect(p.emergentLean).toBe("derecha");
  });

  it("perfil económicamente alto + culturalmente bajo → híbrido (spread ≥ 4)", () => {
    const v = sanitizeVector({
      ...neutralVector(),
      E1: 9, E11: 9, E3: 9, E6: 9, // económico alto
      E8: 1, E9: 1, E10: 1, // cultural bajo
    });
    expect(describeProfile(v).emergentLean).toBe("híbrido");
  });
});

describe("topAxes / shareText", () => {
  it("topAxes devuelve los ejes más alejados del centro", () => {
    const v = sanitizeVector({ ...neutralVector(), E2: 10, E8: 0, E9: 4 });
    const top = topAxes(v, 2).map((t) => t.id);
    expect(top).toContain("E2");
    expect(top).toContain("E8");
  });

  it("shareText incluye la URL y el hashtag", () => {
    const text = shareText(neutralVector(), "https://x.test/r");
    expect(text).toContain("https://x.test/r");
    expect(text).toContain("#NoHayEtiqueta");
  });
});
