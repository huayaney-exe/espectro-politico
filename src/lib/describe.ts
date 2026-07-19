// Descriptor ESTRUCTURAL (no ideológico) del vector, para el "reveal" y el share.
// No dice "eres de izquierda"; nombra posiciones ("redistribucionista soberanista
// con reservas culturales").

import { AxisId, Vector, AXIS_BY_ID } from "./axes";

function avg(v: Vector, ids: AxisId[]): number {
  return ids.reduce((a, id) => a + v[id], 0) / ids.length;
}

export interface Profile {
  economic: number; // 0 mercado ↔ 10 estatista
  cultural: number; // 0 conservador ↔ 10 progresista
  sovereignty: number; // 0 aperturista ↔ 10 soberanista
  extraction: number; // 0 extractivista ↔ 10 post-extractivista
  label: string;
  emergentLean: "izquierda" | "centro" | "derecha" | "híbrido";
}

function tier(x: number, low: string, mid: string, high: string): string {
  if (x <= 3.5) return low;
  if (x >= 6.5) return high;
  return mid;
}

export function describeProfile(v: Vector): Profile {
  const economic = avg(v, ["E1", "E11", "E3", "E6"]);
  const cultural = avg(v, ["E8", "E9", "E10"]);
  const sovereignty = avg(v, ["E3", "E4", "E5", "E6", "E12"]);
  const extraction = avg(v, ["E2", "E7"]);

  const parts: string[] = [];
  parts.push(tier(economic, "pro-mercado", "economía mixta", "redistribucionista"));
  parts.push(tier(sovereignty, "aperturista", "", "soberanista"));
  parts.push(tier(cultural, "conservador en lo cultural", "", "progresista en derechos"));
  parts.push(tier(extraction, "extractivista", "", "post-extractivista"));

  const label = parts.filter(Boolean).join(", ");

  // Lean emergente aproximado (solo para contrastar con la autoetiqueta).
  const leftish = (economic + cultural + extraction) / 3;
  let emergentLean: Profile["emergentLean"];
  const spread = Math.max(economic, cultural, extraction) - Math.min(economic, cultural, extraction);
  if (spread >= 4) emergentLean = "híbrido";
  else if (leftish >= 6) emergentLean = "izquierda";
  else if (leftish <= 4) emergentLean = "derecha";
  else emergentLean = "centro";

  return { economic, cultural, sovereignty, extraction, label, emergentLean };
}

export function topAxes(v: Vector, n = 3): { id: AxisId; name: string; score: number }[] {
  return (Object.keys(v) as AxisId[])
    .map((id) => ({ id, name: AXIS_BY_ID[id].name, score: v[id] }))
    .sort((a, b) => Math.abs(b.score - 5) - Math.abs(a.score - 5))
    .slice(0, n);
}

export function shareText(v: Vector, url: string): string {
  const top = topAxes(v, 4)
    .map((t) => `${t.name} ${t.score}`)
    .join(" · ");
  return `#NoHayEtiqueta — mi perfil político no cabe en izquierda/derecha: ${top}. Encuentra el tuyo en ${url}`;
}
