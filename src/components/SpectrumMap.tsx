"use client";

import { useState } from "react";
import { Vector } from "@/lib/axes";
import { project, AXIS_LABELS_2D } from "@/lib/projection";
import { PoliticianVec } from "@/lib/distance";

interface Props {
  vector: Vector;
  politicians: PoliticianVec[];
  size?: number;
}

// Mapea coord [-1,1] a pixel dentro del lienzo con padding.
function toPx(v: number, size: number, pad: number) {
  const usable = size - pad * 2;
  return pad + ((v + 1) / 2) * usable;
}

export default function SpectrumMap({ vector, politicians, size = 380 }: Props) {
  const pad = 40;
  const [hover, setHover] = useState<string | null>(null);

  const user = project(vector);
  const ux = toPx(user.x, size, pad);
  const uy = toPx(-user.y, size, pad); // Y invertida: arriba = progresista

  return (
    <div style={{ maxWidth: size }} className="w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        style={{ height: "auto" }}
        role="img"
        aria-label="Mapa 2D: económico/estructural vs cultural/libertades"
      >
        {/* Cuadrícula */}
        <rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          fill="#0d0d10"
          stroke="#2a2a31"
        />
        <line
          x1={size / 2}
          y1={pad}
          x2={size / 2}
          y2={size - pad}
          stroke="#1f1f25"
        />
        <line
          x1={pad}
          y1={size / 2}
          x2={size - pad}
          y2={size / 2}
          stroke="#1f1f25"
        />

        {/* Ejes etiquetas */}
        <text x={size / 2} y={pad - 12} fontSize={9.5} fill="#7dd3c0" textAnchor="middle">
          ↑ {AXIS_LABELS_2D.yHigh}
        </text>
        <text x={size / 2} y={size - pad + 20} fontSize={9.5} fill="#a1a1ab" textAnchor="middle">
          {AXIS_LABELS_2D.yLow} ↓
        </text>
        <text x={pad - 6} y={size / 2 - 6} fontSize={9.5} fill="#a1a1ab" textAnchor="start">
          ← {AXIS_LABELS_2D.xLow}
        </text>
        <text x={size - pad + 6} y={size / 2 - 6} fontSize={9.5} fill="#7dd3c0" textAnchor="end">
          {AXIS_LABELS_2D.xHigh} →
        </text>

        {/* Políticos */}
        {politicians.map((p) => {
          const pr = project(p.vector);
          const px = toPx(pr.x, size, pad);
          const py = toPx(-pr.y, size, pad);
          const active = hover === p.id;
          return (
            <g
              key={p.id}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "default" }}
            >
              <circle cx={px} cy={py} r={active ? 6 : 4} fill="#6b6b76" />
              <text
                x={px + 7}
                y={py + 3}
                fontSize={active ? 11 : 9}
                fill={active ? "#ededec" : "#6b6b76"}
              >
                {p.name}
              </text>
            </g>
          );
        })}

        {/* Usuario */}
        <circle cx={ux} cy={uy} r={9} fill="none" stroke="#a78bfa" strokeWidth={2}>
          <animate attributeName="r" values="9;13;9" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={ux} cy={uy} r={5} fill="#a78bfa" />
        <text x={ux + 12} y={uy - 8} fontSize={11} fill="#ededec" fontWeight={700}>
          Tú
        </text>
      </svg>
      <p className="mt-2 text-xs" style={{ color: "var(--color-ink-faint)" }}>
        Proyección determinista de tus 12 ejes a 2 dimensiones interpretables.
        La distancia real se calcula sobre los 12 ejes, no sobre este plano.
      </p>
    </div>
  );
}
