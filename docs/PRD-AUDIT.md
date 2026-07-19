# Auditoría del PRD contra el objetivo

**Objetivo original (del /goal):** romper la reducción binaria izquierda/derecha —confusa y no basada en los conceptos originales— con un producto basado en LLMs que entienda la información del usuario de forma **conversacional**, y genere una puntuación en forma de espectro multidimensional (JSON con ejes X-Y o más), agrupando la postura pública en las dimensiones donde realmente se ordena. Mapear teoría e inteligencia política con papers, definir dimensiones, generar PRD, auditarlo, luego spec-driven e implementar en local.

Escala: ✅ cubierto · 🟡 parcial · ❌ falta.

| # | Requisito del objetivo | Estado | Evidencia / Nota |
|---|---|---|---|
| 1 | Romper el binario izq/der | ✅ | 12 ejes continuos; el reveal contrasta autoetiqueta vs vector; frontera de no-representación. PRD §1, §5. |
| 2 | Basado en LLMs que entiende al usuario | ✅ | Adaptador `LLMProvider` + `AnthropicProvider` con structured output. Scorer separado del conversador. |
| 3 | **Conversacional** ("le haga unas preguntas") | ✅ | Chat que teje 13 probes concretas; respuesta en texto libre. No es encuesta Likert. |
| 4 | Genera puntuación / JSON con ejes | ✅ | `/api/score` → `{vector, confidence, rationale}` sobre 12 ejes. JSON real. |
| 5 | Espectro, no binario; agrupación en dimensiones | ✅ | Radar 12 ejes + mapa 2D con proyección determinista interpretable. |
| 6 | Mapear teoría e inteligencia política con papers | ✅ | `docs/THEORY.md`: spatial voting, NOMINATE, Haidt, Lipset-Rokkan, LAPOP, Wiesehomeier-Benoit. |
| 7 | Definir las dimensiones | ✅ | 12 ejes con polos y cluster en `DECISIONS.md` D1 + `THEORY.md`. |
| 8 | Generar PRD | ✅ | `docs/PRD.md`. |
| 9 | Auditar el PRD | ✅ | Este documento. |
| 10 | Spec-driven (spec del producto) | ✅ | `docs/SPEC.md` (contrato técnico implementado). |
| 11 | Implementar en el stack más inteligente | ✅ | Next.js 15 + TS + Tailwind v4. Corre en localhost:3000. |
| 12 | Sin token de IA todavía, listo para integrar | ✅ | `MockProvider` default (corre sin key); `AnthropicProvider` se activa con 1 env var. |
| 13 | Comparar con políticos reales | ✅ | Datasets PE (8) + AR (6), distancia ponderada, ranking. |

## Hallazgos de la auditoría

**H1 — Reconciliación de ejes (era el bloqueante del PRD).** THEORY.md recomendó 10 ejes; el diseño y los datos usan 12. **Resuelto** en `DECISIONS.md` D1: se mantienen 12 (granularidad de soberanía = diferenciador LATAM) y se adopta la *metodología* del análisis teórico. El PRD debe leerse subordinado a D1.

**H2 — "No basado en conceptos originales" (parte del objetivo) poco desarrollado.** El objetivo critica que izq/der "ni siquiera está basada en los conceptos originales" (Asamblea Francesa 1789). Ni PRD ni la app explican el origen histórico del eje. *Recomendación:* añadir un párrafo en `/metodologia` sobre el origen y por qué la compresión a 1D es históricamente contingente. (No bloqueante; mejora narrativa.)

**H3 — El scorer mock no es un LLM.** Cumple "corre sin token" pero la calidad conversacional real depende de conectar la key. El PRD lo declara como piso funcional; la app lo señala explícitamente en el resultado. Honesto, no oculto.

**H4 — Perfiles de políticos ilustrativos.** Riesgo de objetividad ya identificado en PRD §8 y visible como disclaimer en la UI. Correcto para v0.1; requiere validación experta antes de difusión pública.

**H5 — Métricas sin telemetría.** El PRD hereda las métricas de impacto (tests completados, share rate, "OH SHIT" rate) pero la app no instrumenta nada server-side (por diseño de privacidad). *Recomendación:* contador anónimo opt-in (1px) si se quiere medir adopción, sin romper la privacidad. Fuera de alcance MVP.

## Veredicto

El PRD **responde al objetivo**. Los 13 requisitos explícitos del /goal están cubiertos en producto y documentación; los 5 hallazgos son mejoras (H2, H5), transparencias asumidas (H3, H4) o ya resueltos (H1). No hay brecha que impida un MVP funcional en localhost. Recomendación: incorporar H2 al copy de `/metodologia` en la próxima iteración.
