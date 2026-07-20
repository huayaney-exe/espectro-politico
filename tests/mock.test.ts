import { describe, expect, it } from "vitest";
import { MockProvider } from "@/lib/providers/mock";
import { Turn } from "@/lib/providers/types";

const E8_TURN = (answer: string): Turn => ({
  probeId: "p8",
  question:
    "Sobre el matrimonio igualitario y que una persona trans pueda cambiar su nombre en el DNI: ¿estás a favor o en contra?",
  axes: ["E8"],
  answer,
  hints: {
    low: "En contra por valores, la familia es hombre y mujer, se oponen o incomodan con temas trans/LGBT.",
    high: "A favor pleno de matrimonio igualitario y derechos trans, lo ven como igualdad y libertad.",
  },
});

describe("MockProvider", () => {
  const provider = new MockProvider();

  it("respuestas vacías → vector neutral con confianza baja", async () => {
    const r = await provider.scoreConversation([E8_TURN("")]);
    expect(r.vector.E8).toBe(5);
    expect(r.confidence.E8).toBeLessThanOrEqual(0.1);
  });

  it("postura a favor empuja el eje por encima de 5", async () => {
    const r = await provider.scoreConversation([
      E8_TURN(
        "Estoy totalmente a favor del matrimonio igualitario y de los derechos trans, es cuestión de igualdad y libertad"
      ),
    ]);
    expect(r.vector.E8).toBeGreaterThan(5);
    expect(r.confidence.E8).toBeGreaterThan(0.1);
  });

  it("la negación invierte la señal: 'no estoy de acuerdo con el matrimonio igualitario' → polo bajo", async () => {
    // Este es el caso trampa: la respuesta MENCIONA términos del polo alto
    // (matrimonio igualitario) pero la postura es contraria.
    const r = await provider.scoreConversation([
      E8_TURN("No estoy de acuerdo con el matrimonio igualitario"),
    ]);
    expect(r.vector.E8).toBeLessThan(5);
  });

  it("ejes sin probe quedan neutrales", async () => {
    const r = await provider.scoreConversation([E8_TURN("A favor de todo")]);
    expect(r.vector.E1).toBe(5);
    expect(r.confidence.E1).toBeLessThanOrEqual(0.1);
  });

  it("es determinista: mismo input → mismo output", async () => {
    const turn = E8_TURN("A favor del matrimonio igualitario");
    const a = await provider.scoreConversation([turn]);
    const b = await provider.scoreConversation([turn]);
    expect(a.vector).toEqual(b.vector);
    expect(a.confidence).toEqual(b.confidence);
  });
});
