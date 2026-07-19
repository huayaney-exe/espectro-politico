// OpenAIProvider — scorer con LLM real vía API compatible con OpenAI.
// Se activa con LLM_PROVIDER=openai + OPENAI_API_KEY (ver .env.example).
// Compatible con OpenAI, OpenRouter, Groq, Together, etc. vía OPENAI_BASE_URL.
// Usa /chat/completions + function calling para salida estructurada.
// Rúbrica separada, temperatura 0, score=5/confianza baja cuando no hay evidencia
// (mitiga sicofancia — ver docs/DECISIONS.md D2/D3).

import { AXES, AXIS_IDS, AxisId, Confidence, neutralVector, sanitizeVector } from "../axes";
import { LLMProvider, ScoreResult, Turn } from "./types";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function rubric(): string {
  return AXES.map(
    (a) => `- ${a.id} (${a.name}): 0 = ${a.poleLow}; 10 = ${a.poleHigh}.`
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
  type: "function",
  function: {
    name: "report_scores",
    description:
      "Reporta el puntaje 0–10, confianza 0–1 y una justificación breve para cada uno de los 12 ejes.",
    parameters: {
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
  },
} as const;

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model || "gpt-4o-mini";
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  async scoreConversation(turns: Turn[]): Promise<ScoreResult> {
    const system = `Eres un politólogo que puntúa posiciones políticas de forma neutral y basada en evidencia. Analiza la conversación y asigna a la persona un puntaje 0–10 en CADA uno de estos 12 ejes latinoamericanos:\n\n${rubric()}\n\nReglas:\n1. Basa cada puntaje SOLO en lo que la persona efectivamente dijo. Si no hay evidencia para un eje, pon score=5 y confidence<0.2.\n2. No infieras de estereotipos ni "completes" posiciones. No premies ni castigues ninguna postura.\n3. Reporta los 12 ejes vía la función report_scores.`;

    const user = `Conversación:\n\n${buildTranscript(turns)}\n\nPuntúa los 12 ejes.`;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0,
        max_tokens: 1500,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [SCORE_TOOL],
        tool_choice: { type: "function", function: { name: "report_scores" } },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI API ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const call = data.choices?.[0]?.message?.tool_calls?.find(
      (c: any) => c.function?.name === "report_scores"
    );
    if (!call) throw new Error("OpenAI: no tool_call en la respuesta");

    let args: any;
    try {
      args = JSON.parse(call.function.arguments);
    } catch {
      throw new Error("OpenAI: argumentos de report_scores no son JSON válido");
    }

    const vector = neutralVector();
    const confidence = Object.fromEntries(
      AXIS_IDS.map((id) => [id, 0.1])
    ) as Confidence;
    const rationale: Partial<Record<AxisId, string>> = {};

    for (const s of args.scores || []) {
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
