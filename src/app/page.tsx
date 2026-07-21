import Link from "next/link";
import { AXES } from "@/lib/axes";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="spectrum-bar h-1.5 w-32 rounded-full mb-8" />
        <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] mb-6">
          No eres un punto en una línea.
          <br />
          Eres un <span className="spectrum-text">vector</span>.
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mb-10" style={{ color: "var(--color-ink-soft)" }}>
          El binario izquierda/derecha es una compresión con pérdida: colapsa
          decenas de posiciones distintas en una sola etiqueta. Espectro te hace
          unas preguntas concretas, en una conversación, y ubica tu posición real
          en <strong style={{ color: "var(--color-ink)" }}>12 dimensiones</strong>{" "}
          calibradas para América Latina.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/test" className="btn btn-primary">
            Encontrar mi espectro →
          </Link>
          <Link href="/metodologia" className="btn btn-ghost">
            Ver la metodología
          </Link>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              n: "01",
              t: "Conversas",
              d: "Nada de encuestas rígidas. Respondes con tus palabras a preguntas sobre temas concretos: minería, dolarización, universidades gratuitas, 5G, memoria.",
            },
            {
              n: "02",
              t: "Te leemos",
              d: "Un modelo interpreta tus respuestas, profundiza donde hay dudas y arma tu perfil con la confianza de cada dimensión. Sin etiqueta.",
            },
            {
              n: "03",
              t: "Ves tu huella",
              d: "Tu arquetipo, tus prioridades y tus tensiones internas: la forma de tu identidad política en 5 dimensiones. Eso es lo que el binario esconde.",
            },
          ].map((s) => (
            <div key={s.n} className="panel p-5">
              <div className="spectrum-text font-display text-2xl mb-2">{s.n}</div>
              <h3 className="font-display text-lg mb-1">{s.t}</h3>
              <p className="text-sm" style={{ color: "var(--color-ink-soft)" }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Los 12 ejes */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="font-display text-2xl mb-1">Las 12 dimensiones</h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-ink-faint)" }}>
          Cada una es un continuo de 0 a 10 — no un sí/no.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {AXES.map((ax) => (
            <div key={ax.id} className="flex items-baseline gap-3 border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
              <span className="spectrum-text font-display text-sm w-8">{ax.id}</span>
              <span className="font-display">{ax.name}</span>
              <span className="text-xs ml-auto text-right" style={{ color: "var(--color-ink-faint)" }}>
                {ax.poleLow} ↔ {ax.poleHigh}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-6 py-16">
        <div className="spectrum-bar h-1 w-full rounded-full mb-6 opacity-40" />
        <p className="text-sm" style={{ color: "var(--color-ink-faint)" }}>
          Metodología abierta · Código abierto · Sin datos en servidor propio ·
          Calibrado para América Latina. Herramienta educativa e ilustrativa —
          no es un instrumento psicométrico validado.
        </p>
      </footer>
    </main>
  );
}
