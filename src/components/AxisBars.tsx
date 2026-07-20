"use client";

import { AXES, Vector, Confidence } from "@/lib/axes";

interface Props {
  vector: Vector;
  confidence?: Confidence;
}

// Cada eje es BIPOLAR: 0 y 10 son polos con significado y 5 es neutral.
// Por eso no se dibuja una barra "desde cero" (implicaría más = mejor), sino
// un marcador sobre el continuo, divergiendo desde el centro.
export default function AxisBars({ vector, confidence }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {AXES.map((ax) => {
        const v = vector[ax.id];
        const conf = confidence?.[ax.id] ?? 1;
        const lowConf = conf < 0.3;
        const pct = (v / 10) * 100;
        const from = Math.min(50, pct);
        const width = Math.abs(pct - 50);
        return (
          <div key={ax.id} className="fade-in">
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="font-display" style={{ color: "var(--color-ink)" }}>
                {ax.name}
              </span>
              <span
                className="tabular-nums"
                style={{ color: lowConf ? "var(--color-ink-faint)" : "var(--color-ink)" }}
              >
                {v.toFixed(0)}/10
                {lowConf && (
                  <span title="Poca evidencia en tu conversación"> · señal baja</span>
                )}
              </span>
            </div>

            <div className="relative h-2" style={{ opacity: lowConf ? 0.55 : 1 }}>
              {/* Continuo del eje (espectro tenue de polo a polo) */}
              <div
                className="spectrum-bar absolute inset-0 rounded-full"
                style={{ opacity: 0.16 }}
              />
              {/* Marca del centro neutral (5) */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 2,
                  height: 10,
                  borderRadius: 1,
                  background: "var(--color-border)",
                }}
              />
              {/* Desviación desde el centro hacia el valor */}
              {width > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${from}%`,
                    width: `${width}%`,
                    height: 4,
                    background: "var(--color-ink-soft)",
                    opacity: 0.7,
                  }}
                />
              )}
              {/* Marcador de posición — hueco si la señal es baja */}
              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${pct}%`,
                  width: 11,
                  height: 11,
                  background: lowConf ? "var(--color-panel)" : "var(--color-ink)",
                  border: lowConf
                    ? "1.5px solid var(--color-ink-faint)"
                    : "1.5px solid var(--color-bg)",
                }}
              />
            </div>

            <div
              className="flex justify-between text-[10px] mt-1"
              style={{ color: "var(--color-ink-faint)" }}
            >
              <span>{ax.poleLow}</span>
              <span>{ax.poleHigh}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
