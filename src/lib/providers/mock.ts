// MockProvider — scorer determinista que corre SIN token (default).
// Heurística: similitud de tokens entre la respuesta y los signal_hints
// (low/high) de cada probe, más un léxico compacto de señal en español.
// NO pretende igualar a un LLM; es un fallback funcional y reproducible.

import { AXIS_IDS, AxisId, Confidence, Vector, neutralVector } from "../axes";
import { LLMProvider, ScoreResult, Turn } from "./types";

// Nota: "no" y "ni" NO son stopwords aquí — son negadores que el scorer necesita.
const STOPWORDS = new Set(
  "el la los las un una unos unas de del a y o u que se su sus en con por para es son al lo le les mas más pero si como cuando donde porque muy ya se me te nos les esto eso esa ese esta este estos estas hay ser estar tener hacer todo toda todos todas mi tu su nuestro vos yo el ella ellos".split(
    /\s+/
  )
);

// Negadores: se definen antes de norm() para que sobrevivan al filtro de longitud.
const NEG = new Set([
  "no", "ni", "nunca", "jamas", "nada", "tampoco",
  "contra", "sin", "rechazo", "rechazar", "niego", "opongo", "oponer",
]);

function norm(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/s$/, "")) // stemming-lite plural
    .filter((w) => (w.length > 2 || NEG.has(w)) && !STOPWORDS.has(w));
}

// Léxico de señal: palabras que empujan hacia el polo ALTO vs BAJO (genérico).
const HIGH_LEX = new Set(
  norm(
    "gratuito universal derecho redistribuir impuesto ricos soberania estado publico indigena consulta memoria juicio igualitario aborto trans reforma proteger industrializar nacional autonomia neutral multipolar restringir ambiente agua comunidad social prevencion rehabilitacion"
  )
);
const LOW_LEX = new Set(
  norm(
    "mercado privado inversion esfuerzo empresa empleo orden manodura militar dolarizar importar libre comercio eeuu occidente amnistia olvido tradicion familia seguridad extraer mineria exportar competitividad merito"
  )
);

function jaccardish(answerTokens: string[], hintTokens: string[]): number {
  if (answerTokens.length === 0 || hintTokens.length === 0) return 0;
  const hintSet = new Set(hintTokens);
  let inter = 0;
  const seen = new Set<string>();
  for (const t of answerTokens) {
    if (hintSet.has(t) && !seen.has(t)) {
      inter++;
      seen.add(t);
    }
  }
  return inter / Math.sqrt(hintSet.size);
}

// Léxico con conciencia de negación: una negación invierte el signo de las
// siguientes palabras de señal dentro de una ventana corta (maneja "no estoy
// de acuerdo con el matrimonio igualitario" → cuenta como bajo, no alto).
function lexiconLean(tokens: string[]): number {
  let hi = 0,
    lo = 0;
  let negWindow = 0;
  for (const t of tokens) {
    if (NEG.has(t)) {
      negWindow = 4; // afecta las próximas ~4 palabras de contenido
      continue;
    }
    const isHigh = HIGH_LEX.has(t);
    const isLow = LOW_LEX.has(t);
    if (isHigh || isLow) {
      let dir = isHigh ? 1 : -1;
      if (negWindow > 0) dir = -dir; // negación invierte
      if (dir > 0) hi++;
      else lo++;
    }
    if (negWindow > 0) negWindow--;
  }
  const total = hi + lo;
  if (total === 0) return 0;
  return (hi - lo) / total; // [-1,1]
}

export class MockProvider implements LLMProvider {
  name = "mock";

  async scoreConversation(turns: Turn[]): Promise<ScoreResult> {
    const vector = neutralVector();
    const confidence = Object.fromEntries(
      AXIS_IDS.map((id) => [id, 0.1])
    ) as Confidence;
    const rationale: Partial<Record<AxisId, string>> = {};

    // Acumula señal por eje (varias probes pueden tocar el mismo eje).
    const acc: Record<AxisId, { sum: number; w: number }> = Object.fromEntries(
      AXIS_IDS.map((id) => [id, { sum: 0, w: 0 }])
    ) as Record<AxisId, { sum: number; w: number }>;

    for (const turn of turns) {
      const ans = norm(turn.answer);
      if (ans.length === 0) continue;

      const hints = turn.hints;
      const simHigh = hints ? jaccardish(ans, norm(hints.high)) : 0;
      const simLow = hints ? jaccardish(ans, norm(hints.low)) : 0;
      const lex = lexiconLean(ans);

      // Señal combinada en [-1,1]: overlap de hints (topic) + léxico (stance).
      // El overlap detecta el TEMA pero no la polaridad; el léxico con negación
      // sí. Si discrepan y el léxico tiene señal clara, el léxico manda.
      const hintSignal = Math.max(-1, Math.min(1, (simHigh - simLow) * 2.5));
      let signal: number;
      const disagree = lex !== 0 && Math.sign(lex) !== Math.sign(hintSignal);
      if (disagree && Math.abs(lex) >= 0.2) {
        signal = 0.7 * lex + 0.3 * hintSignal;
      } else {
        signal = 0.55 * hintSignal + 0.45 * lex;
      }
      signal = Math.max(-1, Math.min(1, signal));

      // Fuerza de la señal → peso/confianza.
      const strength = Math.min(
        1,
        Math.abs(hintSignal) * 2 + Math.abs(lex) * 0.5 + ans.length / 40
      );

      for (const axis of turn.axes) {
        acc[axis].sum += signal * strength;
        acc[axis].w += strength;
        if (!rationale[axis] && Math.abs(signal) > 0.15) {
          rationale[axis] =
            signal > 0
              ? `Respuesta con lenguaje cercano al polo alto: "${turn.answer.slice(0, 60)}"`
              : `Respuesta con lenguaje cercano al polo bajo: "${turn.answer.slice(0, 60)}"`;
        }
      }
    }

    for (const id of AXIS_IDS) {
      const { sum, w } = acc[id];
      if (w > 0) {
        const mean = sum / w; // [-1,1]
        vector[id] = Math.max(0, Math.min(10, Math.round((mean + 1) * 5)));
        confidence[id] = Math.max(0.1, Math.min(0.9, w / (w + 1)));
      }
    }

    return { vector, confidence, rationale, provider: this.name };
  }
}
