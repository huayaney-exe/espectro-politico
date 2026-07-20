// POST /api/score — recibe respuestas del chat, enriquece con el banco de probes
// y devuelve el vector de 12 ejes vía el proveedor configurado (mock por default).
// Con un provider LLM real, esta ruta gasta dinero → rate-limit + caps de input.

import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { Turn } from "@/lib/providers/types";
import { probeById } from "@/lib/probes";

export const runtime = "nodejs";

// Caps de input: 13 probes hoy; margen para variantes futuras, no para abuso.
const MAX_ANSWERS = 30;
const MAX_ANSWER_CHARS = 2_000;

// Rate-limit in-memory por IP (ventana deslizante). Suficiente para una
// instancia; con múltiples réplicas serverless cada una tiene su ventana —
// para tráfico serio, mover a KV/Upstash.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 6;
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
  // Evita crecimiento sin límite del mapa.
  if (hits.size > 10_000) hits.clear();
  return false;
}

interface Answer {
  probeId: string;
  answer: string;
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

  let body: { answers?: Answer[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const answers = body.answers;
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json(
      { error: "Se requiere 'answers' no vacío" },
      { status: 400 }
    );
  }
  if (answers.length > MAX_ANSWERS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_ANSWERS} respuestas` },
      { status: 413 }
    );
  }

  // Enriquecer server-side (no confiamos en metadata del cliente).
  // Solo la primera respuesta por probe cuenta (evita doble conteo de un eje).
  const turns: Turn[] = [];
  const seen = new Set<string>();
  for (const a of answers) {
    const probe = probeById(a.probeId);
    if (!probe || seen.has(probe.id)) continue;
    seen.add(probe.id);
    const answer = typeof a.answer === "string" ? a.answer : "";
    if (answer.length > MAX_ANSWER_CHARS) {
      return NextResponse.json(
        { error: `Respuesta demasiado larga (máx ${MAX_ANSWER_CHARS} caracteres)` },
        { status: 413 }
      );
    }
    turns.push({
      probeId: probe.id,
      question: probe.prompt_es,
      axes: probe.axes,
      answer,
      hints: probe.signal_hints,
    });
  }

  if (turns.length === 0) {
    return NextResponse.json(
      { error: "Ninguna respuesta coincide con un probe válido" },
      { status: 400 }
    );
  }

  try {
    const provider = getProvider();
    const result = await provider.scoreConversation(turns);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[espectro] scorer error: ${err?.message || err}`);
    return NextResponse.json(
      { error: "El scorer falló; puedes reintentar" },
      { status: 502 }
    );
  }
}
