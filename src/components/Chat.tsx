"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PROBES } from "@/lib/probes";
import { encodeVector } from "@/lib/encoding";
import { ScoreResult } from "@/lib/providers/types";

type Msg = { from: "bot" | "user"; text: string };

// La autoetiqueta se pregunta AL FINAL (no al inicio): el producto abre
// prometiendo no preguntar izquierda/derecha, y el contraste del reveal
// funciona igual preguntándola después de las respuestas — sin contradecirse
// y sin sesgar las respuestas con la etiqueta previa.
const SELF_LABELS = ["Izquierda", "Centro", "Derecha", "Ninguna me representa"];

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text:
        "Hola. Nada de etiquetas: te voy a hacer preguntas sobre temas concretos. Toca la opción más cercana a lo que piensas — o escríbelo con tus palabras si prefieres. Al final ubico tu posición en 12 dimensiones.",
    },
    { from: "bot", text: PROBES[0].prompt_es },
  ]);
  const [phase, setPhase] = useState<"probes" | "label" | "scoring">("probes");
  const [probeIdx, setProbeIdx] = useState(0);
  const [selfLabel, setSelfLabel] = useState("");
  const [answers, setAnswers] = useState<{ probeId: string; answer: string }[]>([]);
  const [writeMode, setWriteMode] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase, writeMode]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { from: "bot", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
  }

  function advance() {
    const next = probeIdx + 1;
    setWriteMode(false);
    setDraft("");
    if (next < PROBES.length) {
      setProbeIdx(next);
      setTimeout(() => pushBot(PROBES[next].prompt_es), 350);
    } else {
      setPhase("label");
      setTimeout(
        () =>
          pushBot(
            "Última, por curiosidad: si tuvieras que usar la etiqueta clásica, ¿cuál dirías que eres? (Esto no afecta tu resultado — luego te muestro el contraste.)"
          ),
        350
      );
    }
  }

  function answerWith(text: string, display?: string) {
    if (phase !== "probes") return;
    const probe = PROBES[probeIdx];
    pushUser(display ?? text);
    setAnswers((a) => [...a, { probeId: probe.id, answer: text }]);
    advance();
  }

  function skip() {
    if (phase !== "probes") return;
    pushUser("(paso esta pregunta)");
    advance();
  }

  function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    answerWith(text);
  }

  async function finishWithLabel(label: string) {
    pushUser(label);
    setSelfLabel(label);
    setPhase("scoring");
    if (answers.length === 0) {
      pushBot(
        "No respondiste ninguna pregunta, así que no tengo señal para ubicarte. Vuelve a intentarlo respondiendo al menos unas cuantas."
      );
      return;
    }
    pushBot("Gracias. Estoy ubicando tu posición en las 12 dimensiones…");
    await score(answers, label);
  }

  async function score(
    finalAnswers: { probeId: string; answer: string }[],
    label: string
  ) {
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
          JSON.stringify({ ...result, selfLabel: label })
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

  const probe = phase === "probes" ? PROBES[probeIdx] : null;
  const progress =
    phase === "probes"
      ? Math.round((probeIdx / PROBES.length) * 100)
      : 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col" style={{ height: "80vh" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: "var(--color-bg-soft)" }}>
          <div className="spectrum-bar h-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {phase === "probes" && (
          <span className="text-xs tabular-nums shrink-0" style={{ color: "var(--color-ink-faint)" }}>
            {probeIdx + 1} / {PROBES.length}
          </span>
        )}
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

        {phase === "probes" && probe && !writeMode && (
          <div className="fade-in flex flex-col gap-2" key={probe.id}>
            {(probe.options ?? []).map((opt) => (
              <button
                key={opt.label}
                className="btn btn-ghost justify-start text-left"
                style={{ fontWeight: 500 }}
                onClick={() => answerWith(opt.answer, opt.label)}
              >
                {opt.label}
              </button>
            ))}
            <div className="flex items-center justify-between mt-1">
              <button
                className="text-sm underline underline-offset-4 cursor-pointer bg-transparent border-0 p-0"
                style={{ color: "var(--color-ink-soft)" }}
                onClick={() => setWriteMode(true)}
              >
                Prefiero escribirlo con mis palabras
              </button>
              <button
                className="text-sm cursor-pointer bg-transparent border-0 p-0"
                style={{ color: "var(--color-ink-faint)" }}
                onClick={skip}
                title="Sin respuesta, este tema queda con señal baja en tu perfil"
              >
                Pasar →
              </button>
            </div>
          </div>
        )}

        {phase === "probes" && probe && writeMode && (
          <div className="fade-in">
            <div className="flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitDraft();
                  }
                }}
                rows={2}
                autoFocus
                placeholder="Tu postura con tus palabras… (Enter para enviar)"
                className="field flex-1 resize-none px-4 py-3 rounded-xl text-[15px] outline-none"
                style={{
                  background: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-ink)",
                }}
              />
              <button className="btn btn-primary" onClick={submitDraft} disabled={!draft.trim()}>
                Enviar
              </button>
            </div>
            <button
              className="text-sm mt-2 underline underline-offset-4 cursor-pointer bg-transparent border-0 p-0"
              style={{ color: "var(--color-ink-faint)" }}
              onClick={() => setWriteMode(false)}
            >
              ← Volver a las opciones
            </button>
          </div>
        )}

        {phase === "label" && (
          <div className="fade-in flex flex-wrap gap-2">
            {SELF_LABELS.map((l) => (
              <button key={l} className="btn btn-ghost" onClick={() => finishWithLabel(l)}>
                {l}
              </button>
            ))}
          </div>
        )}

        {phase === "scoring" &&
          (error ? (
            <button className="btn btn-primary" onClick={() => score(answers, selfLabel)}>
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
