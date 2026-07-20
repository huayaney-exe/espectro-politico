"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AXIS_IDS } from "@/lib/axes";
import { PROBES } from "@/lib/probes";
import { encodeVector } from "@/lib/encoding";
import { ScoreResult } from "@/lib/providers/types";
import {
  HistoryEntry,
  MAX_TURNS,
  NextQuestion,
  askedProbeIds,
  neutralConfidence,
  pickNextProbe,
} from "@/lib/interview/engine";

type Msg = { from: "bot" | "user"; text: string };

// La autoetiqueta se pregunta AL FINAL (D8): no contradice la promesa de
// apertura y no ancla las respuestas. El contraste del reveal funciona igual.
const SELF_LABELS = ["Izquierda", "Centro", "Derecha", "Ninguna me representa"];

interface ApiNext {
  done: boolean;
  next?: NextQuestion;
  resolved?: number;
  reason?: string;
  result?: ScoreResult;
  lowSignalAxes?: string[];
  error?: string;
}

// Primera pregunta: determinista y local (mismo engine que el servidor),
// cero latencia de arranque.
const FIRST = pickNextProbe(neutralConfidence(), new Set())!;

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text:
        "Hola. Nada de etiquetas: conversemos sobre temas concretos. Respondo a lo que digas — si algo no queda claro, te repregunto. Al final ubico tu posición en 12 dimensiones.",
    },
    { from: "bot", text: FIRST.prompt_es },
  ]);
  const [phase, setPhase] = useState<"probes" | "label" | "scoring">("probes");
  const [current, setCurrent] = useState<NextQuestion>({
    kind: "probe",
    probeId: FIRST.id,
    question: FIRST.prompt_es,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [resolved, setResolved] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, phase]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { from: "bot", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { from: "user", text }]);
  }

  async function step(nextHistory: HistoryEntry[]) {
    setThinking(true);
    setError(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history: nextHistory }),
      });
      const data: ApiNext = await res.json().catch(() => ({ done: false }));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      if (typeof data.resolved === "number") setResolved(data.resolved);

      if (data.done && data.result) {
        setResult(data.result);
        setPhase("label");
        const low = data.lowSignalAxes ?? [];
        const closing =
          low.length > 0
            ? `Listo — tengo señal suficiente. En ${low.join(", ").toLowerCase()} no te leí con claridad: tu resultado lo marcará como señal baja, honestamente.`
            : "Listo — tengo señal clara en las 12 dimensiones.";
        pushBot(closing);
        setTimeout(
          () =>
            pushBot(
              "Última, por curiosidad: si tuvieras que usar la etiqueta clásica, ¿cuál dirías que eres? (No afecta tu resultado — luego te muestro el contraste.)"
            ),
          500
        );
      } else if (data.next) {
        setCurrent(data.next);
        pushBot(data.next.question);
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (err: any) {
      setError(err?.message || "Algo falló");
    } finally {
      setThinking(false);
    }
  }

  function submit(answer: string, skipped = false) {
    if (phase !== "probes" || thinking) return;
    pushUser(skipped ? "(paso este tema)" : answer);
    const entry: HistoryEntry = {
      probeId: current.probeId,
      kind: current.kind,
      question: current.question,
      answer: skipped ? "" : answer,
      skipped,
    };
    const nextHistory = [...history, entry];
    setHistory(nextHistory);
    setDraft("");
    void step(nextHistory);
  }

  function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    submit(text);
  }

  function finishWithLabel(label: string) {
    if (!result) return;
    pushUser(label);
    setPhase("scoring");
    const code = encodeVector(result.vector);
    try {
      sessionStorage.setItem(
        `espectro:${code}`,
        JSON.stringify({ ...result, selfLabel: label })
      );
    } catch {}
    router.push(`/resultado#p=${code}`);
  }

  const turnNumber = history.length + 1;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col" style={{ height: "80vh" }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-1 flex-1 rounded-full overflow-hidden"
          style={{ background: "var(--color-bg-soft)" }}
        >
          <div
            className="spectrum-bar h-full transition-all duration-700"
            style={{ width: `${(resolved / AXIS_IDS.length) * 100}%` }}
          />
        </div>
        <span
          className="text-xs tabular-nums shrink-0"
          style={{ color: "var(--color-ink-faint)" }}
          title="Dimensiones con señal suficiente"
        >
          {phase === "probes"
            ? `${resolved}/12 dimensiones · pregunta ${Math.min(turnNumber, MAX_TURNS)} de máx. ${MAX_TURNS}`
            : `${resolved}/12 dimensiones`}
        </span>
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
        {thinking && (
          <div
            className="fade-in self-start px-4 py-3 rounded-2xl typing"
            style={{ background: "var(--color-panel)", border: "1px solid var(--color-border)" }}
            aria-label="Pensando"
          >
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="mt-4">
        {error && (
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm" style={{ color: "var(--color-accent-3)" }}>
              {error}
            </p>
            <button className="btn btn-ghost" onClick={() => void step(history)}>
              Reintentar
            </button>
          </div>
        )}

        {phase === "probes" && !thinking && !error && (
          <div>
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
                maxLength={2000}
                placeholder="Con tus palabras… (Enter para enviar)"
                className="field flex-1 resize-none px-4 py-3 rounded-xl text-[15px] outline-none"
                style={{
                  background: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-ink)",
                }}
              />
              <button
                className="btn btn-primary"
                onClick={submitDraft}
                disabled={!draft.trim()}
              >
                Enviar
              </button>
            </div>
            <button
              className="text-sm mt-2 cursor-pointer bg-transparent border-0 p-0"
              style={{ color: "var(--color-ink-faint)" }}
              onClick={() => submit("", true)}
              title="Sin respuesta, este tema queda con señal baja en tu perfil"
            >
              Pasar este tema →
            </button>
          </div>
        )}

        {phase === "label" && !thinking && (
          <div className="fade-in flex flex-wrap gap-2">
            {SELF_LABELS.map((l) => (
              <button key={l} className="btn btn-ghost" onClick={() => finishWithLabel(l)}>
                {l}
              </button>
            ))}
          </div>
        )}

        {phase === "scoring" && (
          <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
            Abriendo tu espectro…
          </p>
        )}
      </div>
    </div>
  );
}
