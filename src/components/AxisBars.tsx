"use client";

import { AXES, Vector, Confidence } from "@/lib/axes";

interface Props {
  vector: Vector;
  confidence?: Confidence;
}

export default function AxisBars({ vector, confidence }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {AXES.map((ax) => {
        const v = vector[ax.id];
        const conf = confidence?.[ax.id] ?? 1;
        const lowConf = conf < 0.3;
        return (
          <div key={ax.id} className="fade-in">
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span style={{ color: "var(--color-ink-soft)" }}>
                <span className="font-display" style={{ color: "var(--color-ink)" }}>
                  {ax.name}
                </span>
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
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-bg-soft)" }}
            >
              <div
                className="spectrum-bar h-full rounded-full"
                style={{ width: `${(v / 10) * 100}%`, opacity: lowConf ? 0.4 : 1 }}
              />
            </div>
            <div
              className="flex justify-between text-[10px] mt-0.5"
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
