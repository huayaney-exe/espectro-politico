# Espectro — LLM/OpenRouter readiness + arquitectura de chat

> Doc de análisis. Complementa `DECISIONS.md` (D2, D3). No cambia decisiones
> tomadas; propone las siguientes. Fecha: 2026-07.

## 0. TL;DR

1. **OpenRouter ya funciona hoy** con nuestro `OpenAIProvider` vía `OPENAI_BASE_URL`
   — es una API OpenAI-compatible. Faltan detalles de _readiness_ (headers de
   atribución, structured outputs, ruteo de modelos, manejo de errores), no una
   reescritura.
2. **Brecha D2 ↔ código**: D2 dice "un LLM teje las probes de forma natural".
   El `Chat.tsx` actual es **scripteado** (dispara `PROBES[i]` en orden, sin LLM
   en el loop). El LLM solo puntúa al final. La app cumple el MVP (D7) pero no la
   visión conversacional (D2).
3. **Para scoring: cambiar de `tools`/`tool_choice` a `response_format:
   json_schema`** (structured outputs). Estamos abusando de tool-calling para
   obtener salida estructurada; en OpenRouter, structured outputs es lo
   semánticamente correcto y más portable entre modelos.
4. **Vercel: la pieza correcta es el _AI SDK_, no "AgentKit"** (ver §4). Y para
   ESTE producto **no necesitamos un framework de agentes** — no hay ejecución de
   herramientas ni loop multi-paso. Sí conviene el AI SDK si hacemos el intake
   conversacional/streaming de D2.

---

## 1. Estado actual (qué hay hoy)

| Pieza | Estado | Nota |
|---|---|---|
| `providers/types.ts` `LLMProvider` | ✅ | Contrato limpio: `scoreConversation(turns) → ScoreResult`. |
| `providers/mock.ts` | ✅ | Default, corre sin token. |
| `providers/anthropic.ts` | ✅ | Messages API + tool use, temp 0, fallback a 5/baja confianza. |
| `providers/openai.ts` | ✅ | Chat Completions + function calling, `OPENAI_BASE_URL` configurable → **OpenRouter/Groq/Together**. |
| `api/score/route.ts` | ✅ | Enriquece server-side desde el banco de probes (no confía en el cliente). Key vive server-side. |
| `components/Chat.tsx` | ⚠️ | **Scripteado**, no conversacional. Sin streaming. Batch de respuestas → 1 sola llamada a `/api/score`. |

**Arquitectura de datos hoy:** intake determinista (probes fijas) → 1 llamada
estructurada al LLM → vector 12D → resultado. El scorer YA está separado del
conversador (D2/D3) — porque de hecho no hay "conversador" LLM todavía.

---

## 2. Auditoría de readiness para OpenRouter

### 2.1 Lo que ya está bien
- API OpenAI-compatible → nuestro `OpenAIProvider` la consume sin cambios
  (`OPENAI_BASE_URL=https://openrouter.ai/api/v1`, `OPENAI_API_KEY=<key OR>`).
- Key server-side en API route. Sin exposición al cliente.
- Temp 0 + rúbrica separada + fallback neutral: alineado con D2/D3.

### 2.2 Gaps / riesgos (accionables)

**G1 — Headers de atribución OpenRouter (bajo esfuerzo).**
OpenRouter recomienda dos headers opcionales para ranking/analytics de la app:
- `HTTP-Referer: <site url>`
- `X-Title: <site name>`

No afectan la funcionalidad, pero crean la página de app y las métricas. Nuestro
`openai.ts` no los envía. Agregar (opt-in por env `OPENROUTER_SITE_URL` /
`OPENROUTER_SITE_NAME`) cuando `base_url` sea de OpenRouter.

**G2 — Tool-calling vs Structured Outputs (correctness + portabilidad).**
Usamos `tools` + `tool_choice: {function: report_scores}` solo para forzar salida
estructurada. Nunca ejecutamos una herramienta. En OpenRouter:
- El soporte de **tool-calling varía por modelo** (`?supported_parameters=tools`).
  Modelos baratos/open fallan o lo hacen inconsistente.
- **Structured outputs** (`response_format:{type:"json_schema", json_schema:{
  name, strict:true, schema}}`) es el mecanismo correcto para "devuélveme ESTE
  JSON". Soportado por OpenAI (GPT-4o+), Gemini, Anthropic (Sonnet 4.5/Opus 4.1+)
  y la mayoría de open-source; verificable con `?supported_parameters=
  structured_outputs` y `require_parameters:true` en provider preferences.

→ **Recomendación:** migrar el scorer a `response_format: json_schema`. Mantener
tool-calling solo si más adelante hacemos herramientas reales. Guardar un
_fallback_: si el modelo no soporta json_schema, degradar a "prompt + parse".

**G3 — Ruteo/selección de modelo y costo.**
`OPENAI_MODEL` es un string suelto. En OpenRouter el id es `vendor/modelo`
(`openai/gpt-4o-mini`, `anthropic/claude-3.5-sonnet`, `meta-llama/...`). Definir:
- Modelo default barato y con json_schema (p. ej. `openai/gpt-4o-mini` o
  `google/gemini-flash`).
- `require_parameters:true` para no rutear a un provider sin structured outputs.
- Opcional: `models: [...]` (lista de fallback) y `provider.order` para control.

**G4 — Manejo de errores y resiliencia.**
Hoy un fallo del scorer → 500 y el chat vuelve a la última probe. Falta:
- Timeout + 1 reintento con backoff (los gateways a veces dan 429/502).
- Validación del JSON devuelto (aunque `strict:true` ayuda) antes de proyectar.
- Rate-limit básico en `/api/score` (evitar abuso de la key).

**G5 — Observabilidad.**
Sin logging de latencia/tokens/costo ni del modelo efectivamente usado
(OpenRouter lo devuelve en la respuesta). Loguear `model`, `usage`, `provider`
server-side para tunear costo/calidad.

**G6 — Privacidad / data policy.**
Respuestas políticas del usuario salen al proveedor. OpenRouter permite política
de datos por request (`transforms`, y opción de excluir entrenamiento). Documentar
qué se envía y, si importa, fijar providers que no entrenen sobre el prompt.

---

## 3. La decisión de chat: ¿scripteado o conversacional?

D2 promete un intake donde el LLM "teje las probes de forma natural" e interpreta
texto libre. Hoy no lo hacemos. Tres caminos:

### Opción A — Mantener scripteado (status quo, mejorado)
Probes fijas en orden; LLM solo puntúa al final.
- ✅ Determinista, barato (1 llamada), cero riesgo de sicofancia en el intake,
  fácil de testear. Ya cumple D7.
- ❌ No es la experiencia de D2. No hay seguimiento adaptativo ("¿a qué te refieres
  con…?"). Se siente formulario.

### Opción B — Intake conversacional con LLM (cumple D2) ← recomendado
El LLM conversa: hace la siguiente probe, pide aclaración cuando la respuesta es
ambigua, y decide cuándo tiene señal suficiente. **El scorer sigue separado**
(D2/D3): el conversador NO puntúa; al cerrar, se corre el scorer sobre la
transcripción. Esto exige streaming (UX) → AI SDK encaja.
- ✅ Cumple D2. Mejor señal (aclaraciones) → mejor vector. UX moderna (streaming).
- ❌ Más llamadas (costo), latencia, y **riesgo de sesgo del conversador**
  (que empuje al usuario). Mitigación: system prompt neutral estricto + banco de
  probes como guía + separar conversador de scorer (ya es decisión D2).

### Opción C — Agente con herramientas (over-engineering hoy)
Loop agéntico con tools (`select_next_probe`, `finalize`). No aporta sobre B:
no hay side-effects reales ni recuperación de datos externos. **No** ahora.

**Recomendación:** B, en fases. Empezar por A-mejorado (structured outputs +
readiness OpenRouter), luego introducir el conversador como capa opt-in detrás de
un flag, manteniendo el scorer intacto.

---

## 4. Vercel: AI SDK (no "AgentKit")

Aclaración de nombres para evitar confusión:
- **Vercel** ofrece el **AI SDK** (`ai` + providers) y **AI Gateway**. No tiene un
  producto llamado "AgentKit".
- **"AgentKit"** es de **Inngest** (orquestación de agentes en TS). OpenAI también
  lanzó algo llamado "AgentKit". Ninguno es de Vercel.

Lo que el AI SDK aporta a ESTE proyecto:
- **`streamText` / `generateText`** con providers intercambiables. Existe
  **`@openrouter/ai-sdk-provider`** oficial (`createOpenRouter({apiKey})` →
  `openrouter(modelId)`), con acceso a 300+ modelos.
- **Salida estructurada** vía `experimental_output` / `generateObject` con esquema
  **Zod** — encaja perfecto con el scorer (validación en el borde, sin parseo a
  mano). Reemplazaría la parte frágil de `openai.ts`.
- **Streaming de UI** para la Opción B (el chat se siente vivo).
- Para agentes: AI SDK 5 tiene `stopWhen`/`prepareStep` (loop de tools); AI SDK 6
  añade `Agent`/`ToolLoopAgent`. **No lo necesitamos** salvo que vayamos a C.

**Trade-off de adoptar el AI SDK:** +2 dependencias (`ai`, `@openrouter/ai-sdk-
provider`, `zod`) y acoplar el provider a su abstracción. A cambio: structured
output con Zod, streaming, y multi-provider "gratis". Alternativa: quedarnos con
`fetch` propio (cero deps, control total) y solo migrar a `response_format`.

- **Si nos quedamos en Opción A/B mínima:** no hace falta el AI SDK — basta migrar
  `openai.ts` a `response_format: json_schema` con `fetch` (G2). Menos deps.
- **Si vamos por B con streaming de verdad:** el AI SDK vale la pena (streaming +
  `generateObject`/Zod + `@openrouter/ai-sdk-provider`). Es la mejor relación
  esfuerzo/resultado para la experiencia de D2.

---

## 5. Plan por fases (propuesto)

**Fase 1 — Readiness OpenRouter (sin cambiar UX).** Zero-risk.
- G1 headers de atribución (opt-in por env).
- G2 migrar scorer a `response_format: json_schema` con fallback a tool-calling.
- G3 default de modelo OpenRouter + `require_parameters:true`.
- G4 timeout + 1 reintento + validación del JSON.
- G5 loguear `model`/`usage`.

**Fase 2 — Intake conversacional (D2), detrás de flag.**
- Adoptar AI SDK + `@openrouter/ai-sdk-provider`.
- `ConverserProvider` (streaming, system prompt neutral, banco de probes como
  guía, decide cuándo cierra). **Scorer sin tocar.**
- UI de chat con streaming; A/B contra el scripteado.

**Fase 3 — Calidad y confianza.**
- Evals del scorer (dataset de transcripciones etiquetadas → estabilidad del
  vector, sesgo por auto-etiqueta).
- Monitoreo de costo/latencia por modelo; elegir default por país.

---

## 6. Preguntas abiertas (para decidir)
1. ¿Adoptamos el AI SDK ahora (Fase 2) o hacemos Fase 1 con `fetch` propio primero?
2. ¿Modelo default en OpenRouter? (costo vs calidad del scoring en español LATAM).
3. ¿Data policy: forzamos providers que no entrenen sobre el prompt político?
4. ¿El conversador adaptativo vale el riesgo de sesgo, o el scripteado es "lo
   suficientemente bueno" para el MVP público?
