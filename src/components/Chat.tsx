"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PROBES } from "@/lib/probes";
import { encodeVector } from "@/lib/encoding";
import { ScoreResult } from "@/lib/providers/types";

type Msg = { from: "bot" | "user"; text: string };

const SELF_LABELS = ["Izquierda", "Centro", "Derecha", "Ninguna / no sé"];

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text:
        "Hola. No voy a preguntarte si eres de izquierda o de derecha — esa pregunta comprime demasiado. Te voy a hacer unas preguntas concretas y, al final, ubicaré tu posición en 12 dimensiones. Hablemos.",
    },
  ]);
  const [phase, setPhase] = useState<"label" | "probes" | "scoring">("label");
  const [selfLabel, setSelfLabel] = useState<string | null>(null);
  const [probeIdx, setProbeIdx] = useState(-1);
  const [answers, setAnswers] = useState<{ probeId: string; answer: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { from: "bot", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
  }

  function startProbes(label: string) {
    setSelfLabel(label);
    pushUser(label);
    setPhase("probes");
    setProbeIdx(0);
    setTimeout(() => pushBot(PROBES[0].prompt_es), 350);
  }

  async function submitAnswer() {
    const text = draft.trim();
    if (!text || probeIdx < 0) return;
    const probe = PROBES[probeIdx];
    pushUser(text);
    const nextAnswers = [...answers, { probeId: probe.id, answer: text }];
    setAnswers(nextAnswers);
    setDraft("");

    const next = probeIdx + 1;
    if (next < PROBES.length) {
      setProbeIdx(next);
      setTimeout(() => pushBot(PROBES[next].prompt_es), 350);
    } else {
      setProbeIdx(-1);
      setPhase("scoring");
      pushBot("Gracias. Estoy ubicando tu posición en las 12 dimensiones…");
      await score(nextAnswers);
    }
  }

  async function score(finalAnswers: { probeId: string; answer: string }[]) {
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Error ${res.status}`);
      }
      const result: ScoreResult = await res.json();
      const code = encodeVector(result.vector);
      // Datos ricos (confianza, rationale, autoetiqueta) en sessionStorage;
      // la URL solo lleva el vector para que un link compartido funcione.
      try {
        sessionStorage.setItem(
          `espectro:${code}`,
          JSON.stringify({ ...result, selfLabel })
        );
      } catch {}
      router.push(`/resultado#p=${code}`);
    } catch (err: any) {
      // Importante: NO volvemos a la fase de preguntas — re-preguntar
      // duplicaría la respuesta del mismo probe. Se reintenta el score
      // con las respuestas ya registradas.
      setError(err?.message || "Algo falló");
    }
  }

  const progress =
    phase === "probes" && probeIdx >= 0
      ? Math.round((probeIdx / PROBES.length) * 100)
      : phase === "scoring"
      ? 100
      : 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col" style={{ height: "80vh" }}>
      <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "var(--color-bg-soft)" }}>
        <div className="spectrum-bar h-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`fade-in max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
              m.from === "bot" ? "self-start" : "self-end"
            }`}
            style={
              m.from === "bot"
                ? { background: "var(--color-panel)", border: "1px solid var(--color-border)" }
                : { background: "var(--color-ink)", color: "var(--color-bg)" }
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="mt-4">
        {error && (
          <p className="text-sm mb-2" style={{ color: "var(--color-accent-3)" }}>
            {error}
          </p>
        )}

        {phase === "label" && (
          <div className="flex flex-wrap gap-2">
            {SELF_LABELS.map((l) => (
              <button key={l} className="btn btn-ghost" onClick={() => startProbes(l)}>
                {l}
              </button>
            ))}
          </div>
        )}

        {phase === "probes" && probeIdx >= 0 && (
          <div className="flex gap-2 items-end">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer();
              }}
              rows={2}
              placeholder="Responde con tus palabras… (⌘/Ctrl + Enter para enviar)"
              className="field flex-1 resize-none px-4 py-3 rounded-xl text-[15px] outline-none"
              style={{
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                color: "var(--color-ink)",
              }}
            />
            <button className="btn btn-primary" onClick={submitAnswer} disabled={!draft.trim()}>
              Enviar
            </button>
          </div>
        )}

        {phase === "scoring" &&
          (error ? (
            <button className="btn btn-primary" onClick={() => score(answers)}>
              Reintentar
            </button>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
              Calculando tu vector…
            </p>
          ))}
      </div>
    </div>
  );
}
