# Espectro — Decisiones de arquitectura (fuente de verdad)

## D1 — Modelo dimensional: 12 ejes (no 10)
Se mantienen los **12 ejes** del diseño original. La consolidación a 10 propuesta por el análisis teórico (fusionar las cuatro soberanías) se **rechaza**: la granularidad de soberanía Productiva/Tecnológica/Militar/Monetaria es el diferenciador LATAM frente a 8values/Political Compass. Se adopta del análisis teórico su *metodología* (proyección determinista, distancia euclidiana ponderada, avisos de colinealidad, cautelas de validez), no su reducción de ejes.

Ejes (0–10):
- E1 Redistributivo · E2 Extractivismo · E3 Soberanía Productiva · E4 Soberanía Tecnológica · E5 Soberanía Militar · E6 Soberanía Monetaria · E7 Tierra y Territorio · E8 Derechos Culturales · E9 Seguridad · E10 Memoria Histórica · E11 Estado Salud/Educación · E12 Alineamiento Geopolítico

## D2 — Intake conversacional, no encuesta rígida
El usuario chatea. Un LLM teje ~8–13 probes (banco `probes.json`) de forma natural, interpreta texto libre, y produce un vector de 12 ejes + confianza por eje + rationale. El scorer es **separado** del conversador (rúbrica, temperatura 0, `null` cuando no hay evidencia) para mitigar sicofancia/sesgo del LLM.

## D3 — Adaptador LLM provider-agnóstico, corre SIN token
Interface `LLMProvider`. Implementaciones: `MockProvider` (heurístico determinista, default, corre en localhost sin API key) y `AnthropicProvider` (lee `ANTHROPIC_API_KEY`, structured output, listo pero inactivo). Selección por env var `LLM_PROVIDER` (default `mock`). La key vive server-side en una API route.

## D4 — Proyección determinista 12→3 (matriz fija, no entrenada)
Ejes de display interpretables: **X = económico/estructural-soberanista**, **Y = cultural/libertades**, **Z = territorio/extractivismo**.
Score centrado: `c_a = (s_a − 5) / 5 ∈ [−1,1]`. Coord = `Σ_a c_a · W[a]`, normalizada por L1 de la columna.

Matriz `W` (filas E1..E12 → columnas X,Y,Z):

| Eje | X | Y | Z |
|-----|-----|-----|-----|
| E1 Redistributivo      | 0.90 | 0.20 | 0.10 |
| E2 Extractivismo       | 0.20 | 0.10 | 0.95 |
| E3 Sob. Productiva     | 0.80 | 0.00 | -0.10 |
| E4 Sob. Tecnológica    | 0.70 | 0.00 | 0.00 |
| E5 Sob. Militar        | 0.50 | 0.10 | 0.00 |
| E6 Sob. Monetaria      | 0.80 | 0.00 | 0.00 |
| E7 Tierra y Territorio | 0.40 | 0.30 | 0.85 |
| E8 Derechos Culturales | 0.00 | 0.95 | 0.10 |
| E9 Seguridad           | 0.10 | 0.70 | 0.00 |
| E10 Memoria Histórica  | 0.20 | 0.70 | 0.20 |
| E11 Estado Salud/Educ  | 0.90 | 0.20 | 0.00 |
| E12 Alineamiento Geo   | 0.60 | 0.20 | 0.20 |

L1 normalizadores por columna: X = 6.10, Y = 3.45, Z = 2.50 (suma de |peso|; corregido de 2.60 en la auditoría 2026-07).

## D5 — Distancia (político más cercano + frontera de no-representación)
Euclidiana ponderada sobre los 12 ejes centrados (no sobre la proyección 2D). Down-weight de clusters colineales:
- Económico {E1,E3,E6,E11} ·0.7 · Soberanía {E4,E5,E12} ·0.8 · Cultural {E8,E9,E10} ·0.8 · Extracción/territorio {E2,E7} ·0.8. Resto salience 1.0.
`dist = sqrt(Σ w_a (c_user,a − c_pol,a)^2) / sqrt(Σ w_a · 4)` → normalizada [0,1].
Frontera de no-representación: si `min_dist > θ (=0.30)`, ningún político te representa; se reportan los 3 ejes de mayor residuo.

## D6 — Stack
Next.js 15 (App Router) + TypeScript + Tailwind + framer-motion. Viz SVG hand-rolled (radar 12 ejes + scatter 2D). Persistencia: hash en URL (base64 del vector), sin datos en servidor. Datos de políticos: JSON estático. Deploy target: Vercel/Cloudflare. Corre en `localhost:3000` con `npm run dev`.

## D8 — Fricción sobre pureza conversacional (2026-07)
El flujo 100% texto-libre (13 preguntas × redactar prosa ≈ 10-15 min) producía abandono — validado con el propio fundador abandonando en la pregunta 4. Cambios:
1. **Chips de postura por probe** (`options` en `probes.json`): 2 polos + 1 matiz, tocables, con auto-avance. Cada chip envía al scorer una *postura canónica completa* (no el label), así el scoring no pierde señal. El texto libre sigue disponible por pregunta ("Prefiero escribirlo con mis palabras") — D2 no se abandona, se hace opcional.
2. **"Pasar →" por pregunta**: sin respuesta → el eje queda neutral con confianza baja (honesto, ya soportado por el modelo de confianza).
3. **Autoetiqueta movida AL FINAL**: abrir prometiendo "no te preguntaré izquierda/derecha" y preguntarlo de inmediato era una contradicción y confundía (además la audiencia objetivo es justo la que no se identifica con esas etiquetas). Preguntarla después de las respuestas elimina la contradicción, reduce fricción de entrada y evita anclar las respuestas; el contraste del reveal funciona igual. Opción "Ninguna me representa".
4. **Progreso numérico** ("4 / 13") junto a la barra.
Tiempo estimado de completar: de 10-15 min a ~2-3 min. Trade-off aceptado: los chips anclan hacia 3 posturas por tema; el matiz fino vive en el texto libre opcional.

## D7 — Alcance MVP (sin token)
Funcional en localhost con MockProvider: chat → vector 12 ejes → radar + mapa 2D → político más cercano + frontera → tarjeta compartible (URL hash). AnthropicProvider listo para activar con key. País inicial: Perú (Argentina incluida como segundo dataset).
