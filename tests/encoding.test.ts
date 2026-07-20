import { describe, expect, it } from "vitest";
import { AXIS_IDS, neutralVector, sanitizeVector } from "@/lib/axes";
import { decodeVector, encodeVector, vectorHash } from "@/lib/encoding";

describe("encoding", () => {
  it("round-trip: decode(encode(v)) devuelve v para enteros", () => {
    const v = sanitizeVector({
      E1: 8, E2: 10, E3: 3, E4: 0, E5: 0, E6: 9,
      E7: 2, E8: 5, E9: 0, E10: 0, E11: 4, E12: 9,
    });
    expect(decodeVector(encodeVector(v))).toEqual(v);
  });

  it("redondea valores fraccionarios al codificar", () => {
    const v = sanitizeVector({ ...neutralVector(), E1: 7.6, E2: 2.4 });
    const decoded = decodeVector(encodeVector(v))!;
    expect(decoded.E1).toBe(8);
    expect(decoded.E2).toBe(2);
  });

  it("el valor 10 se codifica como 'a'", () => {
    const v = sanitizeVector({ ...neutralVector(), E1: 10 });
    expect(encodeVector(v)[0]).toBe("a");
  });

  it("rechaza códigos inválidos", () => {
    expect(decodeVector(null)).toBeNull();
    expect(decodeVector("")).toBeNull();
    expect(decodeVector("55555555555")).toBeNull(); // 11 chars
    expect(decodeVector("5555555555555")).toBeNull(); // 13 chars
    expect(decodeVector("z55555555555")).toBeNull(); // char fuera de base 11
  });

  it("acepta mayúsculas (case-insensitive en 'a')", () => {
    const code = "A".concat("5".repeat(AXIS_IDS.length - 1));
    expect(decodeVector(code)!.E1).toBe(10);
  });

  it("vectorHash produce #p=CODE", () => {
    expect(vectorHash(neutralVector())).toBe(`#p=${"5".repeat(12)}`);
  });
});
