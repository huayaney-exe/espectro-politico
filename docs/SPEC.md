# SPEC — Espectro (contrato técnico)

Spec del producto implementado. Fuente de verdad de arquitectura: `DECISIONS.md`.
Grounding teórico: `THEORY.md`. Requisitos: `PRD.md`.

## 1. Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict).
- **Tailwind v4** (CSS-first, `@tailwindcss/postcss`).
- Sin dependencias de UI/charts: visualización SVG hand-rolled.
- Sin base de datos. Sin backend de estado. Persistencia = hash de URL.
- Node 20+ (probado en 24).

## 2. Modelo de datos

```ts
type AxisId = "E1".."E12";
type Vector = Record<AxisId, number>;        // cada eje 0–10
type Confidence = Record<AxisId, number>;     // 0–1 por eje
```

- 12 ejes definidos en `src/lib/axes.ts` (nombre, polos, cluster).
- Probes: `data/seed/probes.json` (13 probes, cubren los 12 ejes).
- Políticos: `data/seed/politicians.{pe,ar}.json` (vectores 0–10, disclaimer, basis, sources).

## 3. Contrato del scorer (adaptador LLM)

`src/lib/providers/types.ts`:
```ts
interface Turn { probeId; question; axes: AxisId[]; answer; hints?: {low,high} }
interface ScoreResult { vector: Vector; confidence: Confidence; rationale; provider }
interface LLMProvider { name; scoreConversation(turns: Turn[]): Promise<ScoreResult> }
```
- `MockProvider` (default): heurística determinista (similitud con hints + léxico ES). Corre sin token.
- `AnthropicProvider`: Messages API + tool `report_scores`, temperatura 0, rúbrica separada, `confidence<0.2` si no hay evidencia. Activado por `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`.
- Selección: `getProvider()` en `src/lib/providers/index.ts`. Fallback a mock si falta key.

## 4. API

`POST /api/score`
```json
// request
{ "answers": [ { "probeId": "p1", "answer": "texto libre" } ] }
// response
{ "vector": {E1..E12}, "confidence": {E1..E12}, "rationale": {..}, "provider": "mock" }
```
- Enriquecimiento server-side desde `probes.json` (no se confía en metadata del cliente).
- Errores: 400 (input inválido), 500 (fallo del scorer).

## 5. Matemática (determinista, client-side)
- **Proyección 12→3** (`src/lib/projection.ts`): matriz fija `W` (12×3), score centrado `(s-5)/5`, coord normalizada por L1 de columna. X=económico/estructural, Y=cultural/libertades, Z=territorio.
- **Distancia** (`src/lib/distance.ts`): euclidiana ponderada sobre 12 ejes centrados, down-weight de clusters colineales, normalizada [0,1].
- **Frontera de no-representación**: `min_dist > 0.30` ⇒ ningún político representa; top-3 ejes de mayor residuo.
- **Descriptor** (`src/lib/describe.ts`): etiqueta estructural (no ideológica) + lean emergente para el contraste con autoetiqueta.

## 6. Persistencia y privacidad
- Vector → 12 chars base-11 (`src/lib/encoding.ts`), en `#p=CODE`.
- Datos ricos (confianza, rationale, autoetiqueta) en `sessionStorage`, no en URL ni servidor.
- Un link compartido reconstruye el vector; nunca expone identidad.

## 7. Rutas
| Ruta | Tipo | Función |
|---|---|---|
| `/` | static | Landing: tesis + 12 ejes + cómo funciona |
| `/test` | client | Chat conversacional → `/api/score` → `/resultado#p=` |
| `/resultado` | client | Radar + mapa 2D + match políticos + frontera + reveal + share |
| `/metodologia` | static | Origen del binario, ejes, proyección, distancia, privacidad, límites |
| `/api/score` | node fn | Scorer |

## 8. Verificación ejecutada
- `tsc --noEmit`: sin errores.
- `next build`: 8 rutas OK.
- `POST /api/score`: pro-mercado → E1/E11=1; redistributivo → E1/E11=10 (discrimina).
- Pipeline de resultado (decode→project→describe→distance) validado vía bundler real:
  vector derecha → López Aliaga 81%; izquierda → Verónika Mendoza 79%; híbrido → Castillo 68% + frontera activada.

## 9. Pendiente para activar IA (dejar listo, no bloqueante)
1. `cp .env.example .env.local`, `LLM_PROVIDER=anthropic`, poner `ANTHROPIC_API_KEY`.
2. (Opcional) que el `AnthropicProvider` conduzca también la conversación adaptativa, no solo el scoring (hoy la conversación es client-driven desde `probes.json`).
3. Validar el scorer LLM contra un ancla Likert (ver `THEORY.md` §validez).

## 10. Roadmap fuera de MVP
- Generación de imagen OG (Satori / edge) para la tarjeta compartible.
- Histograma agregado anónimo (opt-in) sin romper privacidad.
- Embed iframe para medios.
- Más países (cada uno = un `politicians.<cc>.json` + calibración).
- Pilotaje de wording de probes con análisis inter-item.
