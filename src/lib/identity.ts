// Identidad política del usuario (ver docs/DECISIONS.md D10).
// Reemplaza el matching con políticos: el resultado es un PERFIL PROPIO —
// arquetipo + posición por dimensión + narrativa — sin comparar con nadie.
//
// CAPAS: los 12 ejes E1..E12 (axes.ts) son el INSTRUMENTO de medición
// (calibrado LATAM, D1); aquí se agregan a 5 DIMENSIONES de identidad,
// cada una anclada en un marco reconocido de la ciencia política:
//
//  1. ECONÓMICA (Estado ↔ mercado). El eje económico clásico del espacio
//     político (Downs 1957, "An Economic Theory of Democracy"; eje LRECON
//     del Chapel Hill Expert Survey, Jolly et al. 2022). Anclado en la
//     actitud hacia la IGUALDAD como criterio izquierda/derecha
//     (Bobbio 1994, "Destra e sinistra").
//  2. SOCIOCULTURAL (tradicional ↔ progresista). Polo GAL del eje GAL–TAN
//     (Hooghe, Marks & Wilson 2002; eje GALTAN del CHES) y eje
//     tradicional ↔ secular-racional del mapa cultural Inglehart–Welzel
//     (World Values Survey).
//  3. AUTORIDAD (autoritario ↔ libertario). Polo TAN (autoridad/orden) del
//     GAL–TAN; literatura de autoritarismo (Adorno et al. 1950; Altemeyer
//     1981; Stenner 2005, "The Authoritarian Dynamic").
//  4. COMUNIDAD (individualista ↔ comunitario). Debate comunitarismo vs
//     individualismo liberal (Taylor 1989; Etzioni 1993); resuena con el
//     eje supervivencia ↔ autoexpresión de Inglehart–Welzel.
//  5. SOBERANÍA (integración ↔ autonomía nacional). Tradición
//     centro–periferia y dependencia latinoamericana (Prebisch/CEPAL 1949;
//     Cardoso & Faletto 1969); análogo funcional al eje de integración
//     supranacional del CHES. Es el diferenciador LATAM de este proyecto.
//
// NOTA: el Political Compass NO se usa como fuente (algoritmo no publicado
// ni validado). Esta herramienta es educativa/ilustrativa, no un
// instrumento psicométrico validado — el aviso es visible en la UI.

import { AxisId, Confidence, Vector } from "./axes";

export type DimensionId = "econ" | "cult" | "auth" | "comm" | "sob";

export interface Dimension {
  id: DimensionId;
  name: string;
  /** Qué significa 0. */
  poleLow: string;
  /** Qué significa 10. */
  poleHigh: string;
  /** Marco(s) de referencia — también en el comentario de cabecera. */
  source: string;
  /** Ejes de medición que agregan a esta dimensión, con peso. */
  weights: Partial<Record<AxisId, number>>;
  /** Frase corta por tercio: qué significa estar ahí. */
  phrases: { low: string; mid: string; high: string };
}

// Cada eje E1..E12 aparece EXACTAMENTE UNA VEZ en todo el mapeo (sin doble
// conteo — corrige el hallazgo I2 del audit). Hay un test que lo verifica.
export const DIMENSIONS: Dimension[] = [
  {
    id: "econ",
    name: "Económica",
    poleLow: "Mercado",
    poleHigh: "Estado e igualdad",
    source: "Bobbio (1994); CHES LRECON; Downs (1957)",
    weights: { E1: 1, E11: 1 },
    phrases: {
      low: "priorizas el mercado y la iniciativa privada sobre la redistribución",
      mid: "combinas mercado con un Estado que corrige y provee lo básico",
      high: "priorizas la igualdad: redistribución y servicios públicos universales",
    },
  },
  {
    id: "cult",
    name: "Sociocultural",
    poleLow: "Tradicional",
    poleHigh: "Progresista",
    source: "GAL–TAN (Hooghe, Marks & Wilson 2002); Inglehart–Welzel (WVS)",
    weights: { E8: 1 },
    phrases: {
      low: "defiendes valores tradicionales en familia e identidad",
      mid: "convives con el cambio cultural sin militar en él",
      high: "amplías derechos y libertades de identidad plenamente",
    },
  },
  {
    id: "auth",
    name: "Autoridad",
    poleLow: "Orden y mano dura",
    poleHigh: "Garantías y libertades",
    source: "Polo TAN del GAL–TAN; Stenner (2005); Altemeyer (1981)",
    weights: { E9: 1, E10: 0.8 },
    phrases: {
      low: "ante el conflicto priorizas orden, autoridad y sanción",
      mid: "equilibras firmeza con garantías según el caso",
      high: "priorizas garantías, debido proceso y atacar causas antes que castigar",
    },
  },
  {
    id: "comm",
    name: "Comunidad",
    poleLow: "Individual y propiedad",
    poleHigh: "Comunitario y territorio",
    source: "Comunitarismo (Taylor 1989; Etzioni 1993); Inglehart–Welzel",
    weights: { E7: 1, E2: 0.8 },
    phrases: {
      low: "priorizas la propiedad individual y el aprovechamiento de recursos",
      mid: "balanceas desarrollo con derechos colectivos según el caso",
      high: "priorizas lo colectivo: territorio, comunidad y ambiente sobre la extracción",
    },
  },
  {
    id: "sob",
    name: "Soberanía",
    poleLow: "Integración global",
    poleHigh: "Autonomía nacional",
    source: "CEPAL (Prebisch 1949); Cardoso & Faletto (1969); análogo CHES-integración",
    weights: { E3: 1, E4: 1, E5: 1, E6: 1, E12: 1 },
    phrases: {
      low: "apuestas por integrarte al mundo: comercio, alianzas y proveedores globales",
      mid: "pragmatismo: apertura donde conviene, autonomía donde importa",
      high: "priorizas capacidad propia: industria, tecnología y no alineamiento",
    },
  },
];

export interface DimensionScore {
  dimension: Dimension;
  /** 0–10 (promedio ponderado de sus ejes). */
  score: number;
  /** Confianza agregada 0–1 (promedio ponderado). */
  confidence: number;
  tier: "low" | "mid" | "high";
  /** Frase corta que explica qué significa la posición. */
  phrase: string;
}

export interface IdentityProfile {
  dimensions: DimensionScore[];
  /** Arquetipo compuesto, p. ej. "Socioliberal libertario". */
  archetype: string;
  /** Familia política cercana (von Beyme 1985), si hay una clara. */
  family: string | null;
  /** 2–4 frases: prioridades y tensiones, sin comparar con nadie. */
  narrative: string;
  /** "Sombra 1D" (Bobbio): solo para contrastar con la autoetiqueta. */
  emergentLean: "izquierda" | "centro" | "derecha" | "híbrido";
}

function tierOf(score: number): "low" | "mid" | "high" {
  if (score <= 3.5) return "low";
  if (score >= 6.5) return "high";
  return "mid";
}

/** Agrega el vector de 12 ejes a las 5 dimensiones de identidad. */
export function dimensionScores(
  vector: Vector,
  confidence?: Confidence
): DimensionScore[] {
  return DIMENSIONS.map((d) => {
    let sum = 0;
    let confSum = 0;
    let wTotal = 0;
    for (const [axis, w] of Object.entries(d.weights) as [AxisId, number][]) {
      sum += vector[axis] * w;
      confSum += (confidence?.[axis] ?? 1) * w;
      wTotal += w;
    }
    const score = sum / wTotal;
    const tier = tierOf(score);
    return {
      dimension: d,
      score,
      confidence: confSum / wTotal,
      tier,
      phrase: d.phrases[tier],
    };
  });
}

// ---------------------------------------------------------------------------
// Arquetipo: compuesto descriptivo sobre el plano económico × cultural
// (el espacio bidimensional maestro de la política comparada, Kitschelt 1994)
// más modificadores cuando las otras dimensiones están marcadas.
// Nombres descriptivos, no "graciosos": cada término es vocabulario estándar.
// ---------------------------------------------------------------------------

const BASE_ARCHETYPE: Record<string, string> = {
  // econ tier | cult tier
  "high|high": "Igualitario progresista",
  "high|mid": "Igualitario moderado",
  "high|low": "Igualitario conservador",
  "mid|high": "Socioliberal",
  "mid|mid": "Centrista plural",
  "mid|low": "Conservador moderado",
  "low|high": "Liberal pro-mercado",
  "low|mid": "Pro-mercado pragmático",
  "low|low": "Conservador pro-mercado",
};

// Familias políticas clásicas (von Beyme 1985, "familles spirituelles"),
// como referencia conceptual — no partidos ni personas.
const FAMILY: Record<string, string> = {
  "high|high": "socialdemocracia / izquierda democrática",
  "high|low": "izquierda social-conservadora (nacional-popular)",
  "mid|high": "socioliberalismo",
  "low|high": "liberalismo clásico",
  "low|low": "liberal-conservadurismo",
  "mid|low": "conservadurismo social",
};

function modifiers(scores: DimensionScore[]): string[] {
  const by = (id: DimensionId) => scores.find((s) => s.dimension.id === id)!;
  const mods: { label: string; intensity: number }[] = [];

  const auth = by("auth");
  if (auth.tier === "high") mods.push({ label: "libertario", intensity: auth.score - 5 });
  if (auth.tier === "low") mods.push({ label: "de orden", intensity: 5 - auth.score });

  const sob = by("sob");
  if (sob.tier === "high") mods.push({ label: "soberanista", intensity: sob.score - 5 });
  if (sob.tier === "low") mods.push({ label: "aperturista", intensity: 5 - sob.score });

  const comm = by("comm");
  if (comm.tier === "high") mods.push({ label: "comunitario", intensity: comm.score - 5 });
  if (comm.tier === "low") mods.push({ label: "individualista", intensity: 5 - comm.score });

  // Máximo 2 modificadores, los más marcados primero (legibilidad).
  return mods
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 2)
    .map((m) => m.label);
}

// ---------------------------------------------------------------------------
// Narrativa: prioridades (dimensiones más marcadas), tensiones internas
// (presiones cruzadas, Kitschelt) y honestidad sobre la señal baja.
// Determinista: funciona igual con mock o LLM.
// ---------------------------------------------------------------------------

function narrativeOf(scores: DimensionScore[]): string {
  const by = (id: DimensionId) => scores.find((s) => s.dimension.id === id)!;
  const parts: string[] = [];

  // 1. Prioridades: las 2 dimensiones más alejadas del centro.
  const marked = [...scores]
    .filter((s) => s.tier !== "mid")
    .sort((a, b) => Math.abs(b.score - 5) - Math.abs(a.score - 5))
    .slice(0, 2);
  if (marked.length > 0) {
    parts.push(
      "En lo que más te define: " +
        marked.map((s) => s.phrase).join("; ") +
        "."
    );
  } else {
    parts.push(
      "Tu perfil se mueve cerca del centro en todas las dimensiones: más pragmático que doctrinario."
    );
  }

  // 2. Tensiones (presiones cruzadas entre dimensiones).
  const tensions: string[] = [];
  const econ = by("econ");
  const cult = by("cult");
  const auth = by("auth");
  const sob = by("sob");
  if (econ.tier === "high" && cult.tier === "low") {
    tensions.push(
      "combinas igualdad económica con conservadurismo cultural — la combinación que el binario izquierda/derecha no sabe nombrar"
    );
  }
  if (econ.tier === "low" && cult.tier === "high") {
    tensions.push(
      "combinas mercado en lo económico con apertura en lo cultural — liberal en ambos sentidos, que el binario también parte en dos"
    );
  }
  if (auth.tier === "low" && cult.tier === "high") {
    tensions.push(
      "pides orden y mano firme mientras amplías libertades culturales: ahí conviven dos impulsos en tensión"
    );
  }
  if (sob.tier === "high" && econ.tier === "low") {
    tensions.push(
      "quieres autonomía nacional con economía de mercado: la tensión entre abrirse y protegerse te cruza"
    );
  }
  if (tensions.length > 0) {
    parts.push("Tu tensión interna: " + tensions.slice(0, 2).join("; ") + ".");
  }

  // 3. Señal baja (honestidad).
  const weak = scores.filter((s) => s.confidence < 0.3);
  if (weak.length > 0) {
    parts.push(
      `En ${weak.map((s) => s.dimension.name.toLowerCase()).join(" y ")} diste poca señal: esa parte del perfil es tentativa.`
    );
  }

  return parts.join(" ");
}

/** Perfil completo de identidad a partir del vector de 12 ejes. */
export function identityProfile(
  vector: Vector,
  confidence?: Confidence
): IdentityProfile {
  const scores = dimensionScores(vector, confidence);
  const by = (id: DimensionId) => scores.find((s) => s.dimension.id === id)!;

  const key = `${by("econ").tier}|${by("cult").tier}`;
  const base = BASE_ARCHETYPE[key];
  const mods = modifiers(scores);
  const archetype = [base, ...mods].join(" ");

  // Sombra 1D (Bobbio: igualdad como criterio) — SOLO para el contraste con
  // la autoetiqueta; el producto no reduce el perfil a esto.
  const econ = by("econ").score;
  const cult = by("cult").score;
  const oneD = (econ + cult) / 2;
  let emergentLean: IdentityProfile["emergentLean"];
  if (Math.abs(econ - cult) >= 3.5) emergentLean = "híbrido";
  else if (oneD >= 6) emergentLean = "izquierda";
  else if (oneD <= 4) emergentLean = "derecha";
  else emergentLean = "centro";

  return {
    dimensions: scores,
    archetype,
    family: FAMILY[key] ?? null,
    narrative: narrativeOf(scores),
    emergentLean,
  };
}

/** Texto para compartir: arquetipo + dimensiones marcadas. Sin políticos. */
export function shareIdentityText(profile: IdentityProfile, url: string): string {
  const marked = profile.dimensions
    .filter((s) => s.tier !== "mid")
    .map((s) => `${s.dimension.name} ${s.score.toFixed(0)}`)
    .join(" · ");
  const dims = marked || "perfil de centro plural";
  return `#NoHayEtiqueta — mi identidad política: ${profile.archetype}. ${dims}. Encuentra tu huella en ${url}`;
}
