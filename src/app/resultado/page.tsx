"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Vector, Confidence } from "@/lib/axes";
import { decodeVector, encodeVector } from "@/lib/encoding";
import { describeProfile, shareText } from "@/lib/describe";
import { getDataset, COUNTRIES, CountryCode } from "@/lib/politicians";
import Radar from "@/components/Radar";
import SpectrumMap from "@/components/SpectrumMap";
import AxisBars from "@/components/AxisBars";
import PoliticianMatch from "@/components/PoliticianMatch";

interface Rich {
  vector: Vector;
  confidence?: Confidence;
  selfLabel?: string;
  provider?: string;
}

export default function ResultadoPage() {
  const [vector, setVector] = useState<Vector | null>(null);
  const [rich, setRich] = useState<Rich | null>(null);
  const [country, setCountry] = useState<CountryCode>("PE");
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

  const profile = describeProfile(vector);
  const dataset = getDataset(country);
  const selfLabelNorm = (rich?.selfLabel || "").toLowerCase();
  const contrast =
    selfLabelNorm &&
    !selfLabelNorm.includes("ninguna") &&
    !selfLabelNorm.includes(profile.emergentLean);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = shareText(vector!, url);
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

        {/* Encabezado / reveal */}
        <section className="mb-10">
          <div className="spectrum-bar h-1.5 w-24 rounded-full mb-5" />
          <p className="text-sm mb-2" style={{ color: "var(--color-ink-faint)" }}>
            Tu posición no es una etiqueta. Es esto:
          </p>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-4 capitalize">
            {profile.label}
          </h1>
          {contrast && (
            <div className="panel p-4 max-w-2xl">
              <p style={{ color: "var(--color-ink-soft)" }}>
                Al empezar te identificaste como{" "}
                <strong style={{ color: "var(--color-ink)" }}>{rich?.selfLabel}</strong>.
                Tus respuestas dibujan un perfil{" "}
                <strong className="spectrum-text">{profile.emergentLean}</strong>. Esa
                distancia entre tu etiqueta y tu vector es exactamente lo que el
                binario izquierda/derecha esconde.
              </p>
            </div>
          )}
          {rich?.provider === "mock" && (
            <p className="text-[11px] mt-3" style={{ color: "var(--color-ink-faint)" }}>
              Perfil calculado con el scorer heurístico local (sin modelo de IA).
              Con una API key conectada, la lectura conversacional es mucho más fina.
            </p>
          )}
        </section>

        {/* Grid principal */}
        <section className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="panel p-6 flex flex-col items-center">
            <h2 className="font-display text-xl mb-4 self-start">Tu radar de 12 ejes</h2>
            <Radar vector={vector} />
          </div>
          <div className="panel p-6">
            <h2 className="font-display text-xl mb-4">Tu mapa</h2>
            <SpectrumMap vector={vector} politicians={dataset.politicians} />
          </div>
        </section>

        {/* Comparación con políticos */}
        <section className="panel p-6 mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-display text-xl">Frente a los políticos</h2>
            <div className="flex gap-1 p-1 rounded-full" style={{ background: "var(--color-bg-soft)" }}>
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  className="px-4 py-1.5 rounded-full text-sm transition"
                  style={
                    country === c.code
                      ? { background: "var(--color-ink)", color: "var(--color-bg)" }
                      : { color: "var(--color-ink-soft)" }
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <PoliticianMatch
            vector={vector}
            politicians={dataset.politicians}
            disclaimer={dataset.disclaimer}
          />
        </section>

        {/* Detalle por eje */}
        <section className="panel p-6 mb-10">
          <h2 className="font-display text-xl mb-6">Dimensión por dimensión</h2>
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
