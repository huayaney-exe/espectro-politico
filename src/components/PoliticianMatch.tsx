"use client";

import { Vector } from "@/lib/axes";
import { PoliticianVec, representationVerdict, rankPoliticians } from "@/lib/distance";

interface Props {
  vector: Vector;
  politicians: PoliticianVec[];
  disclaimer: string;
}

export default function PoliticianMatch({ vector, politicians, disclaimer }: Props) {
  if (politicians.length === 0) return null;
  const verdict = representationVerdict(vector, politicians);
  const ranked = rankPoliticians(vector, politicians).slice(0, 5);
  const pct = (m: number) => Math.round(m * 100);
  // Apellido del más cercano, para las filas de residuos.
  const closestSurname = verdict.closest.politician.name.split(" ").slice(-1)[0];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-xl mb-1">Frontera de no-representación</h3>
        {verdict.represented ? (
          <p style={{ color: "var(--color-ink-soft)" }}>
            El político más cercano a ti es{" "}
            <strong style={{ color: "var(--color-ink)" }}>
              {verdict.closest.politician.name}
            </strong>{" "}
            ({pct(verdict.closest.similarity)}% de cercanía), y aun así no coincide
            contigo del todo.
          </p>
        ) : (
          <p style={{ color: "var(--color-ink-soft)" }}>
            <strong className="spectrum-text">Ningún político te representa.</strong>{" "}
            El más cercano es{" "}
            <strong style={{ color: "var(--color-ink)" }}>
              {verdict.closest.politician.name}
            </strong>
            , pero solo a un {pct(verdict.closest.similarity)}%. Eso es lo que el
            binario izquierda/derecha esconde.
          </p>
        )}
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-ink-faint)" }}>
          Donde ni el más cercano te representa:
        </p>
        <div className="flex flex-col gap-2">
          {verdict.topResiduals.map((r) => (
            <div
              key={r.axis}
              className="flex items-center justify-between text-sm panel px-3 py-2"
            >
              <span style={{ color: "var(--color-ink-soft)" }}>{r.name}</span>
              <span className="tabular-nums" style={{ color: "var(--color-ink-faint)" }}>
                tú {r.userScore} · {closestSurname} {r.polScore}{" "}
                <span style={{ color: "var(--color-accent-3)" }}>
                  (Δ{r.gap})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-ink-faint)" }}>
          Ranking de cercanía:
        </p>
        <div className="flex flex-col gap-1.5">
          {ranked.map((m, i) => (
            <div key={m.politician.id} className="flex items-center gap-3 text-sm">
              <span
                className="tabular-nums w-4 text-right"
                style={{ color: "var(--color-ink-faint)" }}
              >
                {i + 1}
              </span>
              <span className="w-40 truncate" style={{ color: "var(--color-ink)" }}>
                {m.politician.name}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-bg-soft)" }}
              >
                <div
                  className="spectrum-bar h-full"
                  style={{ width: `${pct(m.similarity)}%` }}
                />
              </div>
              <span
                className="tabular-nums w-10 text-right text-xs"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {pct(m.similarity)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-ink-faint)" }}>
        {disclaimer}
      </p>
    </div>
  );
}
