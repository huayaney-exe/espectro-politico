// AnthropicProvider — scorer con LLM real. LISTO pero inactivo por defecto.
// Se activa con LLM_PROVIDER=anthropic + ANTHROPIC_API_KEY (ver .env.example).
// Usa fetch directo a la Messages API (sin SDK) + tool use para salida estructurada.
// Rúbrica separada, temperatura 0, null cuando no hay evidencia (mitiga sicofancia).

import { AXES, AXIS_IDS, AxisId, Confidence, Vector, neutralVector, sanitizeVector } from "../axes";
import { LLMProvider, ScoreResult, Turn } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function rubric(): string {
  return AXES.map(
    (a) =>
      `- ${a.id} (${a.name}): 0 = ${a.poleLow}; 10 = ${a.poleHigh}.`
  ).join("\n");
}

function buildTranscript(turns: Turn[]): string {
  return turns
    .map(
      (t, i) =>
        `P${i + 1} [ejes ${t.axes.join(",")}]: ${t.question}\nRESPUESTA: ${t.answer}`
    )
    .join("\n\n");
}

const SCORE_TOOL = {
  name: "report_scores",
  description:
    "Reporta el puntaje 0–10, confianza 0–1 y una justificación breve para cada uno de los 12 ejes.",
  input_schema: {
    type: "object",
    properties: {
      scores: {
        type: "array",
        items: {
          type: "object",
          properties: {
            axis: { type: "string", enum: AXIS_IDS },
            score: { type: "number", description: "0–10, o 5 si no hay evidencia" },
            confidence: { type: "number", description: "0–1; usa <0.2 si no hay evidencia" },
            rationale: { type: "string" },
          },
          required: ["axis", "score", "confidence"],
        },
      },
    },
    required: ["scores"],
  },
} as const;

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "claude-sonnet-4-6";
  }

  async scoreConversation(turns: Turn[]): Promise<ScoreResult> {
    const system = `Eres un politólogo que puntúa posiciones políticas de forma neutral y basada en evidencia. Analiza la conversación y asigna a la persona un puntaje 0–10 en CADA uno de estos 12 ejes latinoamericanos:\n\n${rubric()}\n\nReglas:\n1. Basa cada puntaje SOLO en lo que la persona efectivamente dijo. Si no hay evidencia para un eje, pon score=5 y confidence<0.2.\n2. No infieras de estereotipos ni "completes" posiciones. No premies ni castigues ninguna postura.\n3. Reporta los 12 ejes vía la herramienta report_scores.`;

    const user = `Conversación:\n\n${buildTranscript(turns)}\n\nPuntúa los 12 ejes.`;

    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1500,
        temperature: 0,
        system,
        tools: [SCORE_TOOL],
        tool_choice: { type: "tool", name: "report_scores" },
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const toolUse = (data.content || []).find(
      (c: any) => c.type === "tool_use" && c.name === "report_scores"
    );
    if (!toolUse) throw new Error("Anthropic: no tool_use en la respuesta");

    const vector = neutralVector();
    const confidence = Object.fromEntries(
      AXIS_IDS.map((id) => [id, 0.1])
    ) as Confidence;
    const rationale: Partial<Record<AxisId, string>> = {};

    for (const s of toolUse.input.scores || []) {
      const axis = s.axis as AxisId;
      if (!AXIS_IDS.includes(axis)) continue;
      vector[axis] = Math.max(0, Math.min(10, Number(s.score)));
      confidence[axis] = Math.max(0, Math.min(1, Number(s.confidence)));
      if (s.rationale) rationale[axis] = String(s.rationale);
    }

    return {
      vector: sanitizeVector(vector),
      confidence,
      rationale,
      provider: this.name,
    };
  }
}
