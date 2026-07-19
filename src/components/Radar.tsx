"use client";

import { AXES, Vector } from "@/lib/axes";

interface Props {
  vector: Vector;
  compare?: { vector: Vector; label: string; color: string } | null;
  size?: number;
}

export default function Radar({ vector, compare, size = 360 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 54;
  const n = AXES.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointFor = (i: number, value: number) => {
    const a = angleFor(i);
    const rad = (value / 10) * r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad] as const;
  };

  const polygon = (v: Vector) =>
    AXES.map((ax, i) => pointFor(i, v[ax.id]).join(",")).join(" ");

  const rings = [2.5, 5, 7.5, 10];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size, height: "auto" }}
      role="img"
      aria-label="Radar de 12 ejes políticos"
    >
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3c0" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#fbbf77" />
        </linearGradient>
      </defs>

      {/* Anillos de referencia */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={AXES.map((_, i) => pointFor(i, ring).join(",")).join(" ")}
          fill="none"
          stroke="#2a2a31"
          strokeWidth={1}
        />
      ))}

      {/* Radios + etiquetas */}
      {AXES.map((ax, i) => {
        const [x, y] = pointFor(i, 10);
        const [lx, ly] = pointFor(i, 12.1);
        const anchor =
          Math.abs(lx - cx) < 12 ? "middle" : lx > cx ? "start" : "end";
        return (
          <g key={ax.id}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#1f1f25" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              fontSize={9.5}
              fill="#a1a1ab"
              textAnchor={anchor as "start" | "middle" | "end"}
              dominantBaseline="middle"
            >
              {ax.short}
            </text>
          </g>
        );
      })}

      {/* Polígono de comparación (político) */}
      {compare && (
        <polygon
          points={polygon(compare.vector)}
          fill={compare.color}
          fillOpacity={0.12}
          stroke={compare.color}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}

      {/* Polígono del usuario */}
      <polygon
        points={polygon(vector)}
        fill="url(#radarFill)"
        fillOpacity={0.28}
        stroke="url(#radarFill)"
        strokeWidth={2}
      />
      {AXES.map((ax, i) => {
        const [x, y] = pointFor(i, vector[ax.id]);
        return <circle key={ax.id} cx={x} cy={y} r={2.6} fill="#ededec" />;
      })}
    </svg>
  );
}
