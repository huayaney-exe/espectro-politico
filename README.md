# Espectro

**No eres un punto en una línea. Eres un vector.**

Herramienta de auto-mapeo político conversacional que reemplaza el binario
izquierda/derecha por un vector de **12 dimensiones** calibrado para América
Latina. El usuario conversa, un modelo interpreta sus respuestas y ubica su
posición real en 12 ejes; luego la compara con políticos reales y muestra la
**frontera de no-representación** (por qué ningún político lo representa del todo).

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
    resultado/page.tsx    Resultado: radar + mapa 2D + políticos + reveal
    metodologia/page.tsx  Metodología abierta
    api/score/route.ts    POST respuestas → vector (server-side, provider)
  lib/
    axes.ts               Los 12 ejes (definición, poles, clusters)
    projection.ts         Matriz fija 12→3 (X económico, Y cultural, Z territorio)
    distance.ts           Distancia euclidiana ponderada + frontera no-representación
    encoding.ts           Vector ↔ hash de URL (persistencia sin servidor)
    describe.ts           Descriptor estructural (no ideológico) + texto para compartir
    probes.ts             Banco de preguntas conversacionales
    politicians.ts        Datasets de políticos (PE, AR)
    providers/            Adaptador LLM: types · mock · anthropic · index
  components/
    Chat.tsx              Conduce la conversación, llama a /api/score
    Radar.tsx             Radar SVG de 12 ejes
    SpectrumMap.tsx       Scatter 2D (usuario + políticos proyectados)
    AxisBars.tsx          12 barras con confianza por eje
    PoliticianMatch.tsx   Ranking de cercanía + frontera de no-representación
data/seed/
    probes.json           13 probes que cubren los 12 ejes
    politicians.pe.json   8 figuras (Perú)
    politicians.ar.json   6 figuras (Argentina)
docs/
    THEORY.md             Grounding en literatura politológica
    DECISIONS.md          Fuente de verdad de arquitectura (leer primero)
    PRD.md                Product Requirements Document
    PRD-AUDIT.md          Auditoría del PRD contra el objetivo
```

### Flujo de datos

1. `Chat.tsx` recorre `probes.json`, muestra cada pregunta y recoge texto libre.
2. Al terminar, `POST /api/score` con `{ answers: [{probeId, answer}] }`.
3. La route enriquece cada respuesta con la metadata del probe (server-side) y
   llama a `provider.scoreConversation()` → `{ vector, confidence, rationale }`.
4. El vector se codifica en el hash de la URL (`#p=...`) y se navega a
   `/resultado`. Datos ricos (confianza, autoetiqueta) van en `sessionStorage`;
   un link compartido lleva solo el vector (funciona para cualquiera, sin exponer nada).
5. `/resultado` proyecta a 2D, calcula el político más cercano y la frontera.

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

- Perfiles de políticos: **ilustrativos**, derivados de posiciones públicas
  documentadas, requieren validación experta (ver `disclaimer` en cada dataset).
- El `MockProvider` no entiende matices; es un floor. El valor real llega con el LLM.
- Las preguntas pueden tener sesgos de redacción a corregir con pilotaje.
- No reemplaza análisis ni organización política: es auto-observación.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · SVG a mano (sin
libs de charts). Deploy target: Vercel / Cloudflare Pages. Costo estimado <$20/mes.
