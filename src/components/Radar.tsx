"use client";

// Radar genérico ("huella" de identidad). SVG a mano, sin librerías:
// coherente con el stack (cero deps), control total de tokens y a11y.
// Nota perceptual: el orden de los ejes es fijo y documentado (D10) porque
// los radares sugieren relación entre ejes adyacentes; el detalle honesto
// por dimensión vive en las barras divergentes, no aquí.

export interface RadarPoint {
  label: string;
  value: number; // 0–max
}

interface Props {
  points: RadarPoint[];
  size?: number;
  max?: number;
  /** Etiqueta accesible del gráfico. */
  ariaLabel?: string;
}

export default function Radar({
  points,
  size = 360,
  max = 10,
  ariaLabel = "Radar de dimensiones",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 58;
  const n = points.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointFor = (i: number, value: number) => {
    const a = angleFor(i);
    const rad = (value / max) * r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad] as const;
  };

  const polygon = points
    .map((p, i) => pointFor(i, Math.max(0, Math.min(max, p.value))).join(","))
    .join(" ");

  const rings = [max * 0.25, max * 0.5, max * 0.75, max];
  const neutral = max / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size, height: "auto" }}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" />
          <stop offset="50%" stopColor="var(--color-accent-2)" />
          <stop offset="100%" stopColor="var(--color-accent-3)" />
        </linearGradient>
      </defs>

      {/* Anillos de referencia — el neutral (centro de la escala) enfatizado */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={points.map((_, i) => pointFor(i, ring).join(",")).join(" ")}
          fill="none"
          stroke={ring === neutral ? "var(--color-border)" : "var(--color-grid)"}
          strokeWidth={1}
          strokeDasharray={ring === neutral ? "3 3" : undefined}
        />
      ))}

      {/* Escala: marca el anillo neutral y el máximo */}
      {[neutral, max].map((ring) => (
        <text
          key={ring}
          x={cx + 4}
          y={cy - (ring / max) * r + (ring === max ? 10 : -3)}
          fontSize={8}
          fill="var(--color-ink-faint)"
        >
          {ring}
        </text>
      ))}

      {/* Radios + etiquetas */}
      {points.map((p, i) => {
        const [x, y] = pointFor(i, max);
        const [lx, ly] = pointFor(i, max * 1.24);
        const anchor =
          Math.abs(lx - cx) < 12 ? "middle" : lx > cx ? "start" : "end";
        return (
          <g key={p.label}>
            <line
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="var(--color-grid)"
              strokeWidth={1}
            />
            <text
              x={lx}
              y={ly}
              fontSize={11}
              fill="var(--color-ink-soft)"
              textAnchor={anchor as "start" | "middle" | "end"}
              dominantBaseline="middle"
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Huella del usuario */}
      <g className="radar-in">
        <polygon
          points={polygon}
          fill="url(#radarFill)"
          fillOpacity={0.28}
          stroke="url(#radarFill)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {points.map((p, i) => {
          const [x, y] = pointFor(i, Math.max(0, Math.min(max, p.value)));
          return <circle key={p.label} cx={x} cy={y} r={3} fill="var(--color-ink)" />;
        })}
      </g>
    </svg>
  );
}
