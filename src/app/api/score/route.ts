// POST /api/score — recibe respuestas del chat, enriquece con el banco de probes
// y devuelve el vector de 12 ejes vía el proveedor configurado (mock por default).

import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { Turn } from "@/lib/providers/types";
import { probeById } from "@/lib/probes";

export const runtime = "nodejs";

interface Answer {
  probeId: string;
  answer: string;
}

export async function POST(req: NextRequest) {
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

  // Enriquecer server-side (no confiamos en metadata del cliente).
  const turns: Turn[] = [];
  for (const a of answers) {
    const probe = probeById(a.probeId);
    if (!probe) continue;
    turns.push({
      probeId: probe.id,
      question: probe.prompt_es,
      axes: probe.axes,
      answer: typeof a.answer === "string" ? a.answer : "",
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
    return NextResponse.json(
      { error: `Fallo del scorer: ${err?.message || String(err)}` },
      { status: 500 }
    );
  }
}
