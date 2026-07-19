// Carga de los vectores de referencia de políticos (data/seed/politicians.*.json).

import peData from "../../data/seed/politicians.pe.json";
import arData from "../../data/seed/politicians.ar.json";
import { PoliticianVec } from "./distance";
import { sanitizeVector } from "./axes";

export type CountryCode = "PE" | "AR";

export interface PoliticianDataset {
  country: CountryCode;
  version: string;
  disclaimer: string;
  politicians: PoliticianVec[];
}

function normalize(raw: any, country: CountryCode): PoliticianDataset {
  return {
    country,
    version: raw.version ?? "0.1",
    disclaimer: raw.disclaimer ?? "",
    politicians: (raw.politicians ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      period: p.period,
      vector: sanitizeVector(p.vector),
      confidence: p.confidence,
      basis: p.basis,
      sources: p.sources,
    })),
  };
}

export const DATASETS: Record<CountryCode, PoliticianDataset> = {
  PE: normalize(peData, "PE"),
  AR: normalize(arData, "AR"),
};

export const COUNTRIES: { code: CountryCode; label: string }[] = [
  { code: "PE", label: "Perú" },
  { code: "AR", label: "Argentina" },
];

export function getDataset(country: CountryCode): PoliticianDataset {
  return DATASETS[country] ?? DATASETS.PE;
}
