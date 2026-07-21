# Espectro

**No eres un punto en una línea. Eres una huella.**

Herramienta de **autoconocimiento político** conversacional. Reemplaza el
binario izquierda/derecha por un perfil de identidad propio: una entrevista
adaptativa mide 12 ejes calibrados para América Latina, que agregan a **5
dimensiones ancladas en marcos de ciencia política** (Bobbio, GAL–TAN,
Inglehart–Welzel, CEPAL). El resultado es tu arquetipo, tu posición por
dimensión, tus tensiones internas y tu huella en radar — **sin compararte con
ningún político ni partido**. Herramienta educativa, no un instrumento
psicométrico validado.

Producto derivado del set analítico sobre geopolítica y desinformación en LATAM
(ver `../../.context/`). Este es el "mantra 0": membrana de adopción.

---

## Correr en localhost (sin token de IA)

```bash
npm install
npm run dev
# http://localhost:3000
```

La app **corre sin ninguna API key** usando el `MockProvider`: un scorer
heurístico determinista (similitud de tokens con las señales de cada pregunta +
léxico de stance con manejo de negación). No es un LLM, es un piso funcional y
reproducible.

## Activar el LLM real (recomendado: OpenRouter)

```bash
cp .env.example .env.local
# edita .env.local:
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...        # https://openrouter.ai/keys
OPENROUTER_MODEL=openai/gpt-4o-mini # opcional; debe soportar structured outputs
OPENROUTER_SITE_URL=                # opcional: atribución en rankings de OpenRouter
OPENROUTER_SITE_NAME=Espectro       # opcional
```

Reinicia `npm run dev`. El `OpenRouterProvider`
(`src/lib/providers/openrouter.ts`) hace el scoring con **structured outputs**
(`response_format: json_schema` estricto — no tool-calling), `temperature: 0`,
`require_parameters` (solo rutea a providers que soportan el schema), timeout +
reintento ante 429/5xx, y respuestas del usuario delimitadas como datos
(anti-inyección). La key vive **solo server-side**, en la API route. Si falta la
key, cae a mock con un aviso.

También hay providers para Anthropic directo (`LLM_PROVIDER=anthropic`) y
cualquier API OpenAI-compatible (`LLM_PROVIDER=openai` + `OPENAI_BASE_URL`).
Para agregar otro, implementa la interfaz `LLMProvider`
(`src/lib/providers/types.ts`) y regístralo en `src/lib/providers/index.ts`.

---

## Arquitectura

```
src/
  app/
    page.tsx              Landing (thesis + 12 ejes)
    test/page.tsx         Chat conversacional
    resultado/page.tsx    Resultado: arquetipo + narrativa + huella 5D + 12 ejes
    metodologia/page.tsx  Metodología abierta (marcos citados)
    api/interview/route.ts POST turno de entrevista adaptativa (stateless)
    api/score/route.ts    POST respuestas → vector (compat)
  lib/
    axes.ts               Los 12 ejes de medición (definición, poles, clusters)
    identity.ts           5 dimensiones (marcos citados) + arquetipo + narrativa
    encoding.ts           Vector ↔ hash de URL (persistencia sin servidor)
    probes.ts             Banco de preguntas conversacionales
    interview/            Motor adaptativo: engine (puro) + converser (LLM)
    providers/            Adaptador LLM: types · mock · anthropic · openai · openrouter
  components/
    Chat.tsx              Entrevista adaptativa, llama a /api/interview
    Radar.tsx             Radar SVG genérico (huella de 5 dimensiones)
    AxisBars.tsx          12 barras divergentes con confianza por eje
data/seed/
    probes.json           13 probes que cubren los 12 ejes
docs/
    THEORY.md             Grounding en literatura politológica
    DECISIONS.md          Fuente de verdad de arquitectura (leer primero; D10 = pivot identidad)
    PRD.md                Product Requirements Document
    PRD-AUDIT.md          Auditoría del PRD contra el objetivo
```

### Flujo de datos (entrevista adaptativa, D9)

1. `Chat.tsx` abre con la primera pregunta (elegida por el engine, local) y
   recoge texto libre. Tras cada respuesta, `POST /api/interview` con TODO el
   historial (stateless: nada se guarda server-side).
2. La route corre el **Estimator** (`provider.scoreConversation`) sobre la
   transcripción → vector + confianza por eje; el **Engine**
   (`lib/interview/engine.ts`, código puro) decide: ¿parar (12 ejes con señal,
   o 9 turnos)? ¿aclarar una duda (ejes del último probe sin resolver, máx 2)?
   ¿o pasar al tema que más incertidumbre reduce?
3. El **Converser** (`lib/interview/converser.ts`) redacta la pregunta tejida
   con lo que el usuario ya dijo (nunca ve los scores; sin key degrada al
   texto canónico del banco).
4. Al parar, la misma respuesta trae el `ScoreResult` final. Se pregunta la
   autoetiqueta (al final, para no anclar), el vector se codifica en el hash
   (`#p=...`) y se navega a `/resultado`. Datos ricos van en `sessionStorage`.
5. `/resultado` agrega los 12 ejes a las 5 dimensiones (`lib/identity.ts`) y
   muestra arquetipo, narrativa, huella en radar y detalle por eje.

## Privacidad

Cero datos en servidor. El perfil vive en el hash de la URL. Compartir no expone
identidad ni queda registrado.

## Scripts

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servir build
npm run typecheck  # tsc --noEmit
npm test           # vitest (38 tests: projection, distance, encoding, describe, mock, openrouter)
```

## Límites honestos

- **Herramienta educativa e ilustrativa** — no es un instrumento psicométrico
  validado ni un diagnóstico. El aviso es visible en la UI.
- El `MockProvider` no entiende matices; es un floor. El valor real llega con el LLM.
- Las preguntas pueden tener sesgos de redacción a corregir con pilotaje.
- No reemplaza análisis ni organización política: es auto-observación.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · SVG a mano (sin
libs de charts). Deploy target: Vercel / Cloudflare Pages. Costo estimado <$20/mes.
