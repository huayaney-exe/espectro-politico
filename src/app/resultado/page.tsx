"use client";

// Resultado = perfil de identidad política PROPIA (D10): arquetipo,
// narrativa, huella de 5 dimensiones y detalle del instrumento de 12 ejes.
// Sin comparación con políticos ni partidos.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Vector, Confidence } from "@/lib/axes";
import { decodeVector } from "@/lib/encoding";
import { identityProfile, shareIdentityText } from "@/lib/identity";
import Radar from "@/components/Radar";
import AxisBars from "@/components/AxisBars";

interface Rich {
  vector: Vector;
  confidence?: Confidence;
  selfLabel?: string;
  provider?: string;
}

export default function ResultadoPage() {
  const [vector, setVector] = useState<Vector | null>(null);
  const [rich, setRich] = useState<Rich | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = hash.get("p");
    const v = decodeVector(code);
    setVector(v);
    if (code) {
      try {
        const raw = sessionStorage.getItem(`espectro:${code}`);
        if (raw) setRich(JSON.parse(raw));
      } catch {}
    }
    setReady(true);
  }, []);

  if (ready && !vector) {
    return (
      <main className="min-h-screen px-6 py-24 max-w-xl mx-auto text-center">
        <h1 className="font-display text-3xl mb-4">Perfil no encontrado</h1>
        <p className="mb-8" style={{ color: "var(--color-ink-soft)" }}>
          El enlace no contiene un perfil válido.
        </p>
        <Link href="/test" className="btn btn-primary">
          Hacer el test
        </Link>
      </main>
    );
  }

  if (!vector) return <main className="min-h-screen" />;

  const profile = identityProfile(vector, rich?.confidence);
  const selfLabelNorm = (rich?.selfLabel || "").toLowerCase();
  const contrast =
    selfLabelNorm &&
    !selfLabelNorm.includes("ninguna") &&
    !selfLabelNorm.includes(profile.emergentLean);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = shareIdentityText(profile, url);
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  }

  const tierLabel = (t: "low" | "mid" | "high", low: string, high: string) =>
    t === "low" ? low : t === "high" ? high : "mixto";

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="font-display text-lg spectrum-text">
            Espectro
          </Link>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={share}>
              {copied ? "Copiado ✓" : "Compartir"}
            </button>
            <Link href="/test" className="btn btn-primary">
              Rehacer
            </Link>
          </div>
        </div>

        {/* Reveal: arquetipo + narrativa */}
        <section className="mb-10">
          <div className="spectrum-bar h-1.5 w-24 rounded-full mb-5" />
          <p className="text-sm mb-2" style={{ color: "var(--color-ink-faint)" }}>
            Tu identidad política no es una etiqueta. Es esta huella:
          </p>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-3 sentence-case">
            {profile.archetype}
          </h1>
          {profile.family && (
            <p className="text-sm mb-4" style={{ color: "var(--color-ink-faint)" }}>
              Familia política cercana: {profile.family}
            </p>
          )}
          <p
            className="max-w-2xl text-[15px] leading-relaxed mb-4"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {profile.narrative}
          </p>

          {contrast && (
            <div className="panel p-4 max-w-2xl mb-4">
              <p style={{ color: "var(--color-ink-soft)" }}>
                Al final te identificaste como{" "}
                <strong style={{ color: "var(--color-ink)" }}>{rich?.selfLabel}</strong>.
                Tu huella dibuja un perfil{" "}
                <strong className="spectrum-text">{profile.emergentLean}</strong>. Esa
                distancia entre la etiqueta y la forma real es exactamente lo que
                el binario izquierda/derecha esconde.
              </p>
            </div>
          )}

          {rich?.provider === "mock" && (
            <p className="text-[11px] mb-2" style={{ color: "var(--color-ink-faint)" }}>
              Perfil calculado con el scorer heurístico local (sin modelo de IA).
              Con una API key conectada, la lectura conversacional es mucho más fina.
            </p>
          )}
          <p className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
            ⚠ Herramienta educativa e ilustrativa: no es un instrumento
            psicométrico validado ni un diagnóstico. Marcos de referencia en la{" "}
            <Link href="/metodologia" className="underline underline-offset-2">
              metodología
            </Link>
            .
          </p>
        </section>

        {/* Huella + dimensiones */}
        <section className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="panel p-6 flex flex-col items-center">
            <h2 className="font-display text-xl mb-4 self-start">Tu huella</h2>
            <Radar
              size={400}
              ariaLabel="Huella de identidad en 5 dimensiones"
              points={profile.dimensions.map((d) => ({
                label: d.dimension.name,
                value: d.score,
              }))}
            />
            <p className="text-xs mt-2 self-start" style={{ color: "var(--color-ink-faint)" }}>
              5 dimensiones ancladas en marcos de ciencia política (GAL–TAN,
              Inglehart–Welzel, Bobbio, CEPAL). El anillo punteado es el centro.
            </p>
          </div>

          <div className="panel p-6">
            <h2 className="font-display text-xl mb-5">Dimensión por dimensión</h2>
            <div className="flex flex-col gap-5">
              {profile.dimensions.map((d) => (
                <div key={d.dimension.id}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-display" style={{ color: "var(--color-ink)" }}>
                      {d.dimension.name}
                    </span>
                    <span
                      className="text-xs tabular-nums"
                      style={{
                        color:
                          d.confidence < 0.3
                            ? "var(--color-ink-faint)"
                            : "var(--color-ink-soft)",
                      }}
                    >
                      {tierLabel(d.tier, d.dimension.poleLow, d.dimension.poleHigh)} ·{" "}
                      {d.score.toFixed(1)}/10
                      {d.confidence < 0.3 && " · señal baja"}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                    {d.phrase.charAt(0).toUpperCase() + d.phrase.slice(1)}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instrumento: los 12 ejes de medición */}
        <section className="panel p-6 mb-10">
          <h2 className="font-display text-xl mb-1">Bajo el capó: los 12 ejes</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-ink-soft)" }}>
            Las 5 dimensiones se miden con 12 ejes calibrados para América
            Latina. Este es tu detalle crudo, con la confianza de cada lectura.
          </p>
          <AxisBars vector={vector} confidence={rich?.confidence} />
        </section>

        <footer className="text-center py-8">
          <p className="text-sm mb-4" style={{ color: "var(--color-ink-soft)" }}>
            El binario comprime con pérdida. El espectro quita la compresión.
          </p>
          <Link href="/metodologia" className="btn btn-ghost">
            Cómo se calcula esto
          </Link>
        </footer>
      </div>
    </main>
  );
}
