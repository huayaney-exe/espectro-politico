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

// El eje Z (extracción ↔ territorio) se codifica como color del punto,
// interpolando entre los dos acentos de la paleta: ámbar (pro-extracción)
// y teal (territorio/ambiente). Así el mapa no pierde la 3ª dimensión.
const Z_LOW = [251, 191, 119]; // --color-accent-3 (ámbar)
const Z_HIGH = [125, 211, 192]; // --color-accent (teal)

function zColor(z: number): string {
  const t = (z + 1) / 2; // [-1,1] → [0,1]
  const c = Z_LOW.map((lo, i) => Math.round(lo + (Z_HIGH[i] - lo) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
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
        aria-label="Mapa 2D: económico/estructural vs cultural/libertades; el color de cada punto indica la posición extractivismo-territorio"
      >
        {/* Lienzo */}
        <rect
          x={pad}
          y={pad}
          width={size - pad * 2}
          height={size - pad * 2}
          rx={6}
          fill="var(--color-well)"
          stroke="var(--color-border)"
        />
        <line
          x1={size / 2}
          y1={pad}
          x2={size / 2}
          y2={size - pad}
          stroke="var(--color-grid)"
        />
        <line
          x1={pad}
          y1={size / 2}
          x2={size - pad}
          y2={size / 2}
          stroke="var(--color-grid)"
        />

        {/* Etiquetas de polos — mismo color en los cuatro: el mapa no
            privilegia visualmente ningún lado del espectro. */}
        <text x={size / 2} y={pad - 12} fontSize={9.5} fill="var(--color-ink-soft)" textAnchor="middle">
          ↑ {AXIS_LABELS_2D.yHigh}
        </text>
        <text x={size / 2} y={size - pad + 20} fontSize={9.5} fill="var(--color-ink-soft)" textAnchor="middle">
          {AXIS_LABELS_2D.yLow} ↓
        </text>
        <text x={pad - 6} y={size / 2 - 6} fontSize={9.5} fill="var(--color-ink-soft)" textAnchor="start">
          ← {AXIS_LABELS_2D.xLow}
        </text>
        <text x={size - pad + 6} y={size / 2 - 6} fontSize={9.5} fill="var(--color-ink-soft)" textAnchor="end">
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
              <title>
                {p.name}
                {p.period ? ` (${p.period})` : ""}
              </title>
              <circle
                cx={px}
                cy={py}
                r={active ? 6 : 4.5}
                fill={zColor(pr.z)}
                fillOpacity={active ? 1 : 0.85}
                stroke="var(--color-bg)"
                strokeWidth={1.5}
              />
              <text
                x={px + 8}
                y={py + 3}
                fontSize={active ? 11 : 9}
                fill={active ? "var(--color-ink)" : "var(--color-ink-faint)"}
              >
                {p.name}
              </text>
            </g>
          );
        })}

        {/* Usuario */}
        <circle cx={ux} cy={uy} r={9} fill="none" stroke="var(--color-accent-2)" strokeWidth={2}>
          <animate attributeName="r" values="9;13;9" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={ux} cy={uy} r={5} fill="var(--color-accent-2)" stroke="var(--color-bg)" strokeWidth={1.5} />
        <text x={ux + 12} y={uy - 8} fontSize={11} fill="var(--color-ink)" fontWeight={700}>
          Tú
        </text>
      </svg>

      {/* Leyenda del eje Z (color) */}
      <div className="mt-2 flex items-center gap-2 text-[10px]" style={{ color: "var(--color-ink-faint)" }}>
        <span>{AXIS_LABELS_2D.zLow}</span>
        <span
          className="h-1.5 flex-1 rounded-full"
          style={{
            maxWidth: 120,
            background: `linear-gradient(90deg, rgb(${Z_LOW.join(",")}), rgb(${Z_HIGH.join(",")}))`,
          }}
        />
        <span>{AXIS_LABELS_2D.zHigh}</span>
      </div>
      <p className="mt-2 text-xs" style={{ color: "var(--color-ink-faint)" }}>
        Proyección determinista de tus 12 ejes: posición = ejes económico y
        cultural; color del punto = eje territorio/extracción. La distancia real
        se calcula sobre los 12 ejes, no sobre este plano.
      </p>
    </div>
  );
}
