// POST /api/interview — un turno del motor adaptativo (D9). STATELESS:
// el cliente manda todo el historial; aquí se estima la señal, se decide
// (parar / aclarar / siguiente tema) y se redacta la pregunta. Nada se
// persiste server-side (privacidad D6).

import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { Turn } from "@/lib/providers/types";
import { probeById } from "@/lib/probes";
import { AXIS_BY_ID } from "@/lib/axes";
import {
  HistoryEntry,
  MAX_TURNS,
  askedProbeIds,
  axesResolved,
  clarifyTemplate,
  lowSignalAxes,
  needsClarification,
  neutralConfidence,
  pickNextProbe,
  sufficiency,
} from "@/lib/interview/engine";
import { weaveQuestion } from "@/lib/interview/converser";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_ANSWER_CHARS = 2_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30; // ~1 request por turno; margen para reintentos
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const prev = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (prev.length >= RATE_MAX_REQUESTS) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  if (hits.size > 10_000) hits.clear();
  return false;
}

function parseHistory(raw: unknown): HistoryEntry[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_TURNS + 4) return null;
  const out: HistoryEntry[] = [];
  for (const e of raw) {
    if (typeof e !== "object" || e === null) return null;
    const { probeId, kind, question, answer, skipped } = e as Record<string, unknown>;
    if (typeof probeId !== "string" || !probeById(probeId)) return null;
    if (kind !== "probe" && kind !== "clarify") return null;
    if (typeof answer !== "string" || answer.length > MAX_ANSWER_CHARS) return null;
    out.push({
      probeId,
      kind,
      question:
        typeof question === "string" ? question.slice(0, 600) : undefined,
      answer,
      skipped: skipped === true,
    });
  }
  return out;
}

/** Turnos para el Estimator (solo respuestas reales, enriquecidas server-side). */
function estimatorTurns(history: HistoryEntry[]): Turn[] {
  const turns: Turn[] = [];
  for (const h of history) {
    if (h.skipped || !h.answer.trim()) continue;
    const probe = probeById(h.probeId)!;
    turns.push({
      probeId: probe.id,
      // Para clarify usamos la pregunta efectivamente hecha (más contexto);
      // para probe, siempre la canónica (no confiamos en el cliente).
      question:
        h.kind === "clarify" && h.question ? h.question : probe.prompt_es,
      axes: probe.axes,
      answer: h.answer,
      hints: probe.signal_hints,
    });
  }
  return turns;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes; intenta en un minuto" },
      { status: 429 }
    );
  }

  let body: { history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const history = parseHistory(body.history ?? []);
  if (history === null) {
    return NextResponse.json({ error: "Historial inválido" }, { status: 400 });
  }

  try {
    // 1. Estimar señal acumulada (Estimator; nunca ve la autoetiqueta).
    const turns = estimatorTurns(history);
    const result =
      turns.length > 0
        ? await getProvider().scoreConversation(turns)
        : null;
    const confidence = result?.confidence ?? neutralConfidence();

    // 2. ¿Suficiente información? (Engine, determinista)
    const verdict = sufficiency(confidence, history);
    if (verdict.done) {
      if (!result) {
        return NextResponse.json(
          { error: "Sin respuestas no hay señal para ubicarte" },
          { status: 422 }
        );
      }
      return NextResponse.json({
        done: true,
        reason: verdict.reason,
        result,
        resolved: axesResolved(confidence),
        lowSignalAxes: lowSignalAxes(confidence).map(
          (id) => AXIS_BY_ID[id].name
        ),
      });
    }

    // 3. ¿El modelo quedó con dudas? → aclarar sobre el mismo tema.
    const doubtProbe = needsClarification(confidence, history);
    if (doubtProbe) {
      const question = await weaveQuestion({
        history,
        probe: doubtProbe,
        mode: "clarify",
        confidence,
      });
      return NextResponse.json({
        done: false,
        next: {
          kind: "clarify",
          probeId: doubtProbe.id,
          question: question || clarifyTemplate(doubtProbe, confidence),
        },
        resolved: axesResolved(confidence),
      });
    }

    // 4. Siguiente tema: el que más incertidumbre reduce, tejido con contexto.
    const probe = pickNextProbe(confidence, askedProbeIds(history))!;
    const question = await weaveQuestion({
      history,
      probe,
      mode: "probe",
      confidence,
    });
    return NextResponse.json({
      done: false,
      next: { kind: "probe", probeId: probe.id, question },
      resolved: axesResolved(confidence),
    });
  } catch (err: any) {
    console.error(`[espectro] interview error: ${err?.message || err}`);
    return NextResponse.json(
      { error: "La entrevista falló; puedes reintentar" },
      { status: 502 }
    );
  }
}
