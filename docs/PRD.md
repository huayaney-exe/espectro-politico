# PRD: Espectro — Political Self-Mapping for Latin America

## 1. Document Metadata

- **Version:** 0.1 (Draft)
- **Status:** In Progress
- **Last Updated:** 2026-07-17
- **Author:** Product — Luis Huayaney
- **Target Audience:** Politically-curious Latin American adults; journalists as secondary distributors
- **Stakeholders:** Product (Luis), open-source contributors, academic validators, journalist partners
- **Source-of-truth documents:** `DECISIONS.md`, `THEORY.md`, `suficiencia-espectro-politico.md`

---

## 2. Context and Problem Statement

### The Problem

The left/right binary is a lossy compression and, in LATAM, a "device of management" (dispositivo de gestión). It collapses a citizen's real 12-dimensional position into a single scalar, hiding the structural consensus that exists across parties on extractivism, technological dependency, monetary sovereignty, and productive structure. The result: voters are polarized in identities without distinguishing actual positions; a culturally-conservative, economically-redistributive citizen has no label that represents them and is forced to choose between parties that each abandon half of their real position.

No existing tool fixes this for LATAM. Political Compass uses 2 axes and is Anglo-centric. iSideWith is US-bipartisan. 8values has 8 generic axes with no LATAM-specific constructs (no technological sovereignty, no extractivism, no memoria histórica). None expose a politician-comparison or non-representation frontier.

### The Evidence

Per `suficiencia-espectro-politico.md` (Part B, §VIII) and `THEORY.md` (§0, §1.7):

- Zechmeister and Corral (2013, LAPOP): left/right self-placement is unreliable and non-comparable across LATAM countries. In some countries it carries little economic content at all.
- Wiesehomeier and Benoit (2009, PREPPS, 18 LATAM countries): elite-level contestation reduces primarily to a single dominant left/right dimension (~44% of variance) built from redistributive/state-vs-market issues, with an orthogonal authoritarian-democratic second axis. The economic super-factor dominates, confirming that a 1D spectrum destroys orthogonal cultural, sovereignty, and territorial information.
- Gudynas (2009), Svampa ("consenso de los commodities"): extractivism is partly orthogonal to redistribution. A redistributive-left government can be fully pro-extractive (Correa, Morales, early Humala). This orthogonality is invisible in a 1D spectrum.
- Hinich and Munger (1992, 1994): weighted Euclidean distance over N-dimensional policy space is the theoretically-grounded mechanism for "closest candidate" calculation.

Quantitative baseline: 🔴 [TBD - REQUIRES DEFINITION] — no pre-launch baseline for LATAM political quiz completions or share rates exists; targets in Section 3 are drawn from the vision document's stated goals.

### Current State

Users either:
1. Self-assign a left/right label (high cognitive ease, zero precision).
2. Take Political Compass or 8values (better but Anglo-centric, no LATAM politician reference, no non-representation logic).
3. Vote without a tool that maps their full position against candidates.

### Desired State

A person opens Espectro, has a natural conversation in Spanish, and in 3–8 minutes holds a 12-dimensional vector that places them on a radar and a 2D map. They see their closest politician and the axes where even that closest match fails them. They receive a label-free shareable artifact. They understand, viscerally, what a spectrum is.

---

## 3. Goals and Non-Goals

### Goals

1. Ship a functional MVP that runs on localhost with MockProvider, Peru dataset, no API key, and delivers the full user journey end-to-end.
2. Dissolve the binary left/right frame by making every user's position a 12-dimensional vector, not a label.
3. Expose the non-representation frontier: show concretely which axes a user's closest politician fails them on.
4. Produce a shareable, auditable artifact that travels without a server.
5. Be capture-resistant: open methodology, open code, open data.

### Non-Goals

- Replacing political organizing or institutional pressure.
- Inventing candidates for unrepresented vectors.
- Gamifying or ranking users relative to each other.
- Monetizing user data or political profiles.
- Providing real-time news or dynamic politician data.

### Success Metrics

| Metric Type | Metric | Target (Year 1) | Measurement Method |
|:---|:---|:---|:---|
| Primary | Tests completed | 50,000 | Server-side anonymous 1-px opt-in counter |
| Primary | "OH SHIT" contrast rate (autoadscription vs. emergent profile diverges meaningfully) | >30% of completions | End-of-session confirmation prompt |
| Secondary | Share rate | >5% of completions | Share-button click event |
| Secondary | Journalist iframe embeds | 10 media outlets | iframe embed tracker |
| Secondary | Average session duration | >2 minutes | Timestamp delta, client-side |
| Guardrail | Infrastructure cost | <$20/month | Hosting invoice |
| Guardrail | p95 time-to-first-result | <4 seconds (MockProvider); <12 seconds (AnthropicProvider) | Client performance timing |
| Guardrail | No PII stored server-side | 0 user records on server | Architecture audit |
| Future | Aggregate histogram published in academic venue | 1 co-authored publication | Collaboration with political scientist |
| Future | Politicians who respond publicly to Espectro | 5 | Mention tracking |

---

## 4. Personas

### P1 — Ciudadano Curioso (Primary)

**Profile:** 24–45-year-old LATAM urban dweller, university-educated, politically engaged but disillusioned with existing parties. Uses Twitter/Instagram. Has a gut sense of their political identity ("me considero de izquierda") but struggles to articulate why.

**Pain point:** Every election cycle they are forced to choose between candidates that each betray some core position of theirs. The binary frame makes this invisible — "just vote for the lesser evil."

**Goal with Espectro:** Understand their real position across multiple dimensions, see concretely which politicians fail them and where, and share a label-free artifact that communicates their position without the binary.

**Success signal:** The user completes the conversation, looks at the non-representation frontier, and says "OH SHIT — I'm pro-redistribution but I'm also pro-mano-dura on security, and no party represents that combination."

### P2 — Periodista / Embedder (Distribution Vector)

**Profile:** Digital journalist or political commentator at a LATAM outlet. Writes analytical pieces about polarization, elections, or political identity. Has an audience of 10,000–500,000 readers.

**Pain point:** Articles about political complexity are hard to make interactive. Surveys are server-heavy, require auth, and generate privacy concerns. Existing embeds (iSideWith, Political Compass) are Anglo-centric and not credible for a LATAM audience.

**Goal with Espectro:** Embed a fully interactive political self-mapping tool inside their article. Let readers do it inline without leaving. Get the aggregate data story as a follow-up.

**Success signal:** The journalist embeds the iframe, the piece drives 500+ completions from that embed, and they write a follow-up story using aggregate histogram data.

**Key requirements from this persona:** iframe embed path, no login/auth friction, methodology page they can link and cite.

### P3 — Esceptico / Auditor (Trust Vector)

**Profile:** Political scientist, data journalist, or politically-sophisticated citizen who distrusts "quizzes" as biased instruments. Familiar with Political Compass criticisms (loaded wording, opaque scoring, Western bias).

**Pain point:** Most political quizzes have undisclosed scoring logic and Western-biased item wording. No existing LATAM tool publishes its projection matrix or politician source methodology.

**Goal with Espectro:** Audit the methodology. Verify that axis weights and politician profiles are sourced and documented. Fork the repo and adjust for their own country.

**Success signal:** The skeptic reads the open-methodology page, finds the projection matrix `W`, reads the politician source citations, and concludes the tool is defensible — or forks it and files a pull request correcting a weight.

---

## 5. User Journeys

### Journey 1 — First-Time Conversational Flow (Primary)

1. User lands on homepage (`/`). Sees a single-sentence thesis: "El izquierda/derecha es compresión con pérdida. Encontremos tu posición real."
2. User clicks "Comenzar." A chat interface opens. The LLM conversational agent (MockProvider or AnthropicProvider) greets them neutrally and begins asking probes drawn from `probes.json`, one natural question at a time.
3. The conversation covers 8–13 probes over 3–8 minutes, touching all 12 axes. The elicitor agent never scores; it only asks and records free-text answers.
4. When coverage is sufficient (all 12 axes have at least one probe response, or the conversation reaches the max-probe threshold), the elicitor hands off the transcript to the scorer agent (temperature 0, rubric-based, returns `null` on no evidence per axis).
5. The scorer produces a 12-dimensional vector with per-axis confidence scores and evidence quotations.
6. Before showing the result, the app asks: "Antes de este test, ¿cómo te describías políticamente? (izquierda / derecha / centro / ninguno)" — this records the autoadscription.
7. The result screen renders: (a) a 12-axis radar chart, (b) a 2D scatter map (X = economic/structural, Y = cultural/liberties) with the user's position and politician reference points, (c) the closest politician and normalized distance, (d) the non-representation frontier if `min_dist > 0.30` showing the top-3 diverging axes, (e) the autoadscription vs. emergent-profile contrast reveal.
8. User shares, copies URL hash, or embeds.

### Journey 2 — Result Exploration

1. User is on the result screen. They hover/tap each axis on the radar to see the axis definition, their score, the evidence quote from their conversation, and the axis confidence level.
2. They click a politician's node on the 2D map to see that politician's 12-axis vector with source citations.
3. They toggle the 2D/radar view.
4. They click "metodología" to open the open-methodology page explaining the projection matrix, collinearity flags, and distance metric.

### Journey 3 — Share

1. User clicks "Compartir mi espectro."
2. The app generates a URL with the 12-axis vector base64-encoded in the URL hash. No server request is made. The vector lives entirely in the URL.
3. The app also generates a ready-to-paste text string: "#NoHayEtiqueta — [axes summary]. Encuentra el tuyo en [URL]."
4. 🔴 [TBD - REQUIRES DEFINITION] OG image generation: whether to use a Vercel Edge Function / Cloudflare Worker + Satori at MVP or defer to a static template. Deferred to post-MVP per D7.

### Journey 4 — Journalist Embed

1. Journalist navigates to `/embed` documentation page.
2. They copy a one-line `<iframe>` snippet with the embed URL and a recommended 600×800px frame.
3. They paste it into their CMS. The embedded experience runs the full conversational flow inside the iframe.
4. On completion, the user can click through to the full-page result. The journalist's embed origin is recorded in the anonymous counter for the media-embed KPI.

---

## 6. Functional Requirements

### Priority Legend

- **P0:** Must have for MVP launch (blocking)
- **P1:** Should have (high value, not blocking MVP)
- **P2:** Nice to have (can defer to post-MVP)

---

| ID | Feature | User Story | Acceptance Criteria | Priority |
|:---|:---|:---|:---|:---|
| FR-01 | Conversational intake | As a curious voter, I want to answer political questions through a natural conversation so I am not filling out a survey form. | **Given** the user opens the chat interface **When** they type a response to a probe **Then** the LLM elicitor acknowledges it neutrally and presents the next probe from `probes.json` without revealing a score or axis name; **And** all 12 axes receive at least one probe before the conversation ends. | P0 |
| FR-02 | LLM provider adapter — MockProvider | As a developer, I want the app to run with zero API key so I can develop and demo locally without cost. | **Given** `LLM_PROVIDER` env var is unset or equals `mock` **When** a chat session starts **Then** `MockProvider` handles all elicitor and scorer calls; the scorer returns a deterministic 12-axis vector from heuristic rules; the full result screen renders correctly; no external API call is made. | P0 |
| FR-03 | LLM provider adapter — AnthropicProvider | As a product owner, I want to activate real LLM scoring with a single env var change so I can ship a higher-quality experience to real users. | **Given** `ANTHROPIC_API_KEY` is set and `LLM_PROVIDER=anthropic` **When** the scorer is invoked **Then** it calls Anthropic structured-output API at temperature 0 with the rubric prompt; returns a valid 12-axis JSON object with per-axis confidence and evidence quote fields; null is returned for axes with no evidence rather than guessing. | P0 |
| FR-04 | Elicitor / scorer separation | As a product owner, I want the scorer to be architecturally separate from the elicitor so LLM sycophancy cannot bias the vector toward the user's apparent identity. | **Given** a completed conversation transcript **When** the scorer runs **Then** it receives only the raw transcript (no system-level identity signals); it scores using only stated positions; it cites an evidence span per axis; it returns `null` for axes with no elicited evidence; it never interprets tone or apparent political identity as scoring signal. | P0 |
| FR-05 | 12-axis vector output | As a user, I want to receive a precise 12-dimensional position vector so I can see my real political position beyond a label. | **Given** the scorer completes **When** the vector is produced **Then** it contains exactly 12 axis scores each in [0,10], 12 confidence values each in [0,1], and 12 evidence quotes (or null); missing axes are masked and the projection matrix `W` columns renormalized over answered axes only. | P0 |
| FR-06 | Radar chart visualization | As a user, I want to see my position as a 12-axis radar so I can understand the shape of my full political profile. | **Given** a 12-axis vector **When** the result screen renders **Then** an SVG radar chart displays all 12 axes at their scored value; hovering/tapping an axis shows the axis name, definition, the user's score, and the evidence quote; axes with null score are visually marked as "no elicited." | P0 |
| FR-07 | 2D scatter map | As a user, I want to see my position on a 2D map so I can understand how I relate to politician reference points. | **Given** a 12-axis vector and the politician JSON dataset **When** the result screen renders **Then** an SVG scatter plot shows X (economic/structural) and Y (cultural/liberties) axes; the user's projected point is rendered; each politician's projected point is rendered with their name label; the projection uses the deterministic `W` matrix from `DECISIONS.md` D4. | P0 |
| FR-08 | Closest-politician calculation | As a user, I want to know which politician is closest to my position so I can understand my electoral landscape. | **Given** a user vector and the politician reference JSON **When** distances are computed **Then** the app uses weighted Euclidean distance over all 12 normalized axes with collinearity down-weights per `DECISIONS.md` D5; the closest politician and normalized distance (0–1) are displayed; if `min_dist > 0.30` the non-representation frontier is triggered. | P0 |
| FR-09 | Non-representation frontier | As a user, I want to know if no politician fully represents me and exactly where they diverge so I can understand the structural gaps in representation. | **Given** `min_dist > 0.30` for the closest politician **When** the frontier is shown **Then** the UI displays "Ningún político te representa plenamente" and lists the top-3 axes with the largest residual, the direction of divergence, and the numeric gap (e.g., "Extractivismo: +4.2 — el político más cercano es más extractivista que tú"). | P0 |
| FR-10 | Autoadscription vs. emergent profile reveal | As a user, I want to compare my pre-test self-label against my computed profile so I can see whether the binary frame actually captures my position. | **Given** the user answered the autoadscription question before seeing results **When** the result screen renders **Then** the UI shows their self-label side-by-side with their emergent vector; if the profile diverges from the typical profile of politicians aligned with their stated label on 2+ axes, the contrast is highlighted and flagged as a meaningful divergence. | P0 |
| FR-11 | URL-hash persistence | As a user, I want my result to be shareable via a URL so I can send my profile to others without creating an account. | **Given** a 12-axis vector is produced **When** the user shares **Then** the full vector is base64-encoded and embedded in the URL hash fragment; loading that URL client-side decodes the hash and renders the result screen directly; no server read/write is performed for persistence. | P0 |
| FR-12 | Shareable card | As a user, I want a ready-to-paste text card with my profile summary so I can share on social media without friction. | **Given** a completed result **When** the user clicks "Compartir" **Then** the app generates a plain-text card with the user's axis summary and the app URL with hash; a copy-to-clipboard action is available; the text does not include any political label. | P0 |
| FR-13 | Journalist iframe embed | As a journalist, I want to embed Espectro in an article so my readers can self-map without leaving the article. | **Given** a journalist adds the Espectro iframe snippet to their CMS **When** a reader visits the article **Then** the full conversational flow runs inside the iframe (min 600px height); on completion the user can click through to the full result page; the embed origin URL is logged in the anonymous counter (no PII). | P1 |
| FR-14 | Open-methodology page | As a skeptic or journalist, I want to read the full methodology so I can audit the scoring logic and cite it in my reporting. | **Given** the user navigates to `/metodologia` **Then** the page documents: the 12 axes with poles and academic justification, the projection matrix `W` with column normalizers, the collinearity clusters and down-weights, the distance formula, the `θ = 0.30` threshold rationale, the probe bank design principles, the politician source methodology, and a link to the open-source repository. | P1 |
| FR-15 | Aggregate histogram (stubbed MVP) | As a user or researcher, I want to see the distribution of all completed profiles so I can see where my position sits relative to others. | **Given** the aggregate histogram feature is active **When** the user views their result **Then** the app shows per-axis distribution histograms of all opted-in completions; for MVP this may be a static stub with illustrative data; the live backend is a post-MVP feature. | P2 |
| FR-16 | Probes.json instrument | As a developer, I want a structured probe bank so the conversational agent can draw natural, neutral, LATAM-calibrated questions for each axis. | **Given** `probes.json` is loaded **When** the elicitor selects probes **Then** it draws from a bank of at least 2 probes per axis (24 total), each with: axis id, probe text in Spanish, neutral framing per THEORY.md §5.1 guidelines, balanced keying flag, and country scope (Peru / Argentina / universal); order is randomized per session. | P0 |
| FR-17 | Politician reference dataset (Peru) | As a user, I want to see Peruvian politicians on the map so my results are locally meaningful. | **Given** the Peru politician JSON is loaded **When** the result screen renders **Then** at least 5 Peruvian political figures appear as reference points on the 2D map; each figure's vector is flagged with a confidence score, source citations, and data date; the dataset methodology is documented on the open-methodology page. | P0 |
| FR-18 | Coverage prompt | As a user, I want the conversation to ensure all axes are covered before finalizing so my vector is not missing critical dimensions. | **Given** the elicitor tracks per-axis coverage **When** coverage for any axis is zero after the standard probe sequence **Then** the elicitor explicitly prompts for the uncovered axis before ending the session; a coverage summary is included in the scorer input. | P1 |
| FR-19 | Collinearity notice | As a user, I want to be informed when two of my answers measure the same underlying construct so I understand the limits of apparent precision. | **Given** the user's scored vector shows inconsistency within a collinear cluster (e.g., high E1/Redistributivo but low E11/Salud-Educación) **When** the result renders **Then** a soft notice explains "estas dos posiciones miden aspectos del mismo eje; la discrepancia puede reflejar matiz real o incertidumbre de medición." | P2 |

---

## 7. Non-Functional Requirements

### Privacy (Critical)

- No server-side storage of any user response, conversation transcript, or axis vector.
- Vector lives in the URL hash fragment (client-side only). The server serves only static assets and API routes.
- The ANTHROPIC_API_KEY is read server-side in a Next.js API route; it is never sent to the client.
- The scorer API route receives a conversation transcript, calls the LLM, and returns a vector; no transcript is logged or persisted.
- The journalist embed counter records only the origin domain and a completion event count — no session identifiers, no IP addresses.
- Opt-in aggregate telemetry (for the histogram) must be opt-in, anonymous, and documented.

### Cost

- Target: <$20/month at steady-state including hosting, edge functions, and LLM API cost.
- MockProvider: $0 LLM cost. AnthropicProvider at 50,000 completions/year at ~1,500 tokens per session: approximately 75M tokens/year; at claude-3-haiku pricing this is approximately $1.50–$7.50/month depending on model tier. 🔴 [TBD - REQUIRES DEFINITION] Exact model tier and token budget must be defined before activating AnthropicProvider at scale.
- Hosting: Vercel free tier or Cloudflare Pages free tier is sufficient for expected traffic.

### Performance

- Time-to-interactive (homepage): <2 seconds on a 4G mobile connection.
- MockProvider response per probe: <500ms p95.
- AnthropicProvider response per probe: <6 seconds p95 (acceptable for conversational context).
- Result screen render (radar + scatter): <1 second after vector is received.
- URL-hash decode and result render for a shared link: <2 seconds p95.

### Availability

- 🔴 [TBD - REQUIRES DEFINITION] No formal SLA defined for MVP. Target: Vercel/Cloudflare inherent availability (typically >99.9%). Downtime is acceptable at MVP scale as long as data loss is impossible (there is no server-side data to lose).

### Security

- No authentication required. No accounts.
- The scorer API route must validate that the incoming transcript does not exceed a defined token limit to prevent prompt injection abuse.
- The `ANTHROPIC_API_KEY` must never appear in client-side bundles; Next.js server-only API route enforces this.
- Politician JSON is static and served as a public asset; no admin interface.
- Rate limiting on the `/api/score` route: 🔴 [TBD - REQUIRES DEFINITION] limit (e.g., 10 requests/minute per IP) to prevent API key exhaustion.

### Accessibility

- WCAG 2.1 AA compliance for all interactive elements.
- Radar and scatter charts must have text alternatives (per-axis scores as a structured list) for screen reader users.
- Color palette must pass AA contrast ratio for both chart types.
- The conversational interface must be keyboard-navigable.
- Mobile-first responsive layout; all interactions must work on iOS 15+ Safari and Android 11+ Chrome.

### Internationalization

- Primary locale: `es-PE` (Peruvian Spanish).
- All UI strings in i18n-ready message files from the start; hard-coding of Spanish strings directly in components is not permitted.
- Argentina dataset ships with the same UI in `es-AR` locale adjustments for axis wording calibration.
- English localization is out of scope for MVP.

### Open-Source and Auditability

- Repository is public on GitHub from day one.
- `probes.json`, `politicians/peru.json`, `politicians/argentina.json`, and the projection matrix constants are all in the public repo.
- The methodology page (`/metodologia`) is a rendered version of `THEORY.md` and `DECISIONS.md` — not a separate document.
- Scoring rubric (the LLM prompt used for scoring) is published in the repo.

### Neutrality Safeguards

- All probe wording must pass a neutrality review against the criteria in THEORY.md §5.1 (no loaded premises, no morally-charged framing, both poles' rationale implicit in the question).
- The app never displays a left/right label for the user, only axis scores.
- The "structural archetype" labels (Cosmopolita Extractivista, Soberano Autonomista, etc.) from the vision doc are post-MVP optional features, not MVP output; they require a separate naming review before activation.
- Politician profiles include source citation, confidence score, and data date; unverifiable positions are left null.

---

## 8. Data Requirements

### DR-1 — probes.json Instrument

**Structure per probe:**

```json
{
  "id": "P-E1-01",
  "axis": "E1",
  "axis_name": "Redistributivo",
  "text": "¿Crees que el gobierno debería cobrar más impuestos a los más ricos para subsidiar alimentos básicos a los más pobres?",
  "framing": "neutral",
  "balanced_key": false,
  "country_scope": ["PE", "AR", "universal"],
  "pole_0_label": "no redistribución",
  "pole_10_label": "redistribución radical"
}
```

**Minimum bank:** 2 probes per axis × 12 axes = 24 probes. Target: 3 per axis = 36.

**Wording constraints per THEORY.md §5.1:**
- No embedded premises.
- Both poles' rationale must be inferable from neutral wording.
- Sensitive axes (memoria, seguridad, territorio) use vignette-style phrasing where possible.
- ~50% of probes per axis should have `balanced_key: true` (agreement maps to the lower pole) to mitigate acquiescence bias.

**Validation gate:** Before MVP launch, each probe must be tested with at least 5 readers of different self-reported political identities to verify wording does not signal a preferred answer. 🔴 [TBD - REQUIRES DEFINITION] Formal inter-rater reliability target (e.g., Krippendorff's alpha > 0.6 for probe neutrality ratings).

### DR-2 — Politician Reference Vectors

**Structure per politician entry (politicians/peru.json):**

```json
{
  "id": "pedro-castillo",
  "name": "Pedro Castillo",
  "country": "PE",
  "data_date": "2021-07-28",
  "axes": {
    "E1": { "score": 8.5, "confidence": 0.80, "sources": ["https://..."] },
    "E2": { "score": 7.0, "confidence": 0.70, "sources": ["https://..."] },
    ...
    "E12": { "score": null, "confidence": null, "sources": [] }
  },
  "methodology_note": "Scores derived from: (1) legislative votes where available, (2) signed decrees, (3) campaign platform statements, (4) documented public declarations. Confidence = fraction of axes with >=2 independent sources."
}
```

**MVP dataset — Peru:** Minimum 5 figures. 🔴 [TBD - REQUIRES DEFINITION] Exact politicians and source research is a 6–8 week research task per the vision document estimate. Placeholder/illustrative vectors may be used for internal testing but must be flagged `"illustrative": true` and must not appear in production builds without sourced data.

**MVP dataset — Argentina:** Minimum 5 figures. Same structure. Shipped as a second dataset alongside Peru at MVP per DECISIONS.md D7.

**Data update policy:** 🔴 [TBD - REQUIRES DEFINITION] Politician vectors are static JSON; there is no live update pipeline at MVP. A versioned update process (pull request with source citations) must be defined before public launch to prevent stale profiles causing credibility damage.

### DR-3 — Projection Matrix Constants

The projection matrix `W` (12×3) and L1 normalizers are hardcoded as TypeScript constants per DECISIONS.md D4. They must be co-located with the methodology page content and the open-source repo — not buried in application code.

**Source of truth:** DECISIONS.md D4 (matrix) and THEORY.md §3.3 (THEORY.md version uses 10-axis reconciled matrix; DECISIONS.md uses original 12-axis matrix).

**Reconciliation note:** DECISIONS.md D1 explicitly rejects the THEORY.md recommendation to consolidate to 10 axes. The 12-axis matrix in DECISIONS.md D4 is the authoritative implementation target. THEORY.md's 10-axis analysis is retained as theoretical grounding and collinearity documentation. This discrepancy must be resolved via an explicit product decision and recorded in DECISIONS.md before the scorer rubric is finalized. 🔴 [TBD - REQUIRES DEFINITION] Axis count reconciliation decision pending: confirm whether implementation uses 12 axes (DECISIONS.md D1) with the D4 projection matrix, or 10 axes (THEORY.md §2.3) with the THEORY.md §3.3 matrix.

### DR-4 — Scorer Rubric

The LLM scorer prompt must include:
- The 12 axis definitions with pole labels.
- Anchored examples for each axis at levels 0, 3, 5, 7, 10.
- Instruction to return structured JSON with `score`, `confidence`, `evidence_quote`, and `null` on no evidence.
- Instruction to score from stated positions only, not from inferred identity.
- Temperature locked to 0.

The rubric prompt is a versioned artifact in the repository. Any change to the rubric is a versioned change requiring a note in the changelog.

---

## 9. UX and System Design

### Happy Path Flow

1. User lands on `/`. Reads one-sentence thesis. Clicks "Comenzar."
2. Chat interface renders. First probe appears in the chat bubble.
3. User types a response. LLM elicitor generates the next probe.
4. After 8–13 exchanges, the elicitor signals session end. Autoadscription question appears.
5. User answers autoadscription. A loading state appears ("Calculando tu espectro...").
6. The transcript is posted to `/api/score`. The scorer returns the 12-axis vector.
7. The result screen renders: radar + 2D map + closest politician + non-representation frontier + autoadscription contrast.
8. User clicks "Compartir." URL hash is generated. Text card appears. User copies and shares.

### Error States and Edge Cases

| Scenario | Expected Behavior | User Message |
|:---|:---|:---|
| AnthropicProvider API timeout (>15s) | Fallback to MockProvider for that session; log the timeout server-side | "Estamos teniendo problemas con el servidor. Usaremos el modo básico para calcular tu resultado." |
| AnthropicProvider rate limit | Fallback to MockProvider | Same as above |
| Scorer returns all null axes (no evidence extracted) | Block result generation; prompt user to retry with more specific answers | "No pudimos interpretar tus respuestas con suficiente precisión. ¿Podemos intentarlo de nuevo con ejemplos más concretos?" |
| Scorer returns >4 null axes | Render partial result with a clear warning; null axes shown as "no elicited" on radar | "Tu perfil está incompleto en [N] ejes. Los resultados son indicativos." |
| URL hash is malformed or truncated | Render a "perfil no encontrado" state | "El enlace que recibiste parece incompleto. Realiza el test de nuevo para obtener tu perfil." |
| User closes browser mid-conversation | No data is persisted. Fresh session on return. | (No message needed — no state to recover) |
| Politician JSON fails to load | Render radar only; suppress 2D map and closest-politician panel | "No pudimos cargar los perfiles de políticos. El mapa comparativo no está disponible." |
| iframe blocked by CMS Content Security Policy | Show graceful fallback link to full-page experience | "Tu perfil está listo. [Ver resultado completo]" |

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                               │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │             Next.js 15 App (Static + Client)              │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌───────────────┐  ┌────────────────┐  │   │
│  │  │  Chat UI    │  │  Result Screen │  │  Embed /       │   │
│  │  │ (elicitor   │  │  radar + map   │  │  Metodologia   │   │
│  │  │  turn loop) │  │  + frontier   │  │  pages         │   │
│  │  └──────┬──────┘  └───────┬───────┘  └────────────────┘  │   │
│  │         │ transcript      │ vector (from hash or API)     │   │
│  └─────────┼─────────────────┼───────────────────────────────┘   │
│            │ POST /api/score │ vector in URL hash                 │
│            ▼                 ▼                                     │
└────────────┼─────────────────┼───────────────────────────────────┘
             │                 │
             ▼                 │
┌────────────────────────┐     │
│   Next.js API Route    │     │
│   /api/score           │     │
│                        │     │
│  ┌──────────────────┐  │     │
│  │  LLMProvider     │  │     │
│  │  interface       │  │     │
│  │  ┌────────────┐  │  │     │
│  │  │MockProvider│  │  │     │
│  │  │(default)   │  │  │     │
│  │  └────────────┘  │  │     │
│  │  ┌────────────┐  │  │     │
│  │  │Anthropic   │  │  │     │
│  │  │Provider    │  │  │     │
│  │  │(key-gated) │  │  │     │
│  │  └─────┬──────┘  │  │     │
│  └────────┼─────────┘  │     │
└───────────┼────────────┘     │
            │                  │
            ▼                  │
┌─────────────────────┐        │
│  Anthropic API      │        │
│  (external, HTTPS)  │        │
│  temperature=0      │        │
│  structured output  │        │
└─────────────────────┘        │
                                │
┌──────────────────────────────┼────────────────────────────────┐
│           STATIC ASSETS (served from CDN)                      │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐  ┌──────────────┐  │
│  │  probes.json    │   │ politicians/     │  │ W matrix     │  │
│  │  (probe bank)   │   │ peru.json        │  │ constants.ts │  │
│  │                 │   │ argentina.json   │  │              │  │
│  └─────────────────┘   └─────────────────┘  └──────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key architectural invariants:**
- The server never stores a transcript, vector, or any user-identifiable data.
- The API route receives a transcript, calls the LLM (or Mock), returns a vector JSON, and terminates. Stateless.
- All persistence is in the URL hash. The server has no database.
- `ANTHROPIC_API_KEY` is a server-side environment variable only. It never reaches the client bundle.
- The 2D projection, radar, and distance calculations all run client-side from the vector + static JSON.

---

## 10. Risks and Dependencies

### Dependencies

| Dependency | Owner | Status | Impact if Delayed |
|:---|:---|:---|:---|
| Anthropic API — structured output endpoint | Anthropic (external) | Available now; MVP uses Mock so not blocking | AnthropicProvider cannot activate; MockProvider is the fallback |
| Politician reference data — Peru (sourced, cited) | Product / researcher | Not started; estimated 6–8 weeks research effort | MVP can ship with illustrative/flagged data; production credibility requires real data |
| Politician reference data — Argentina | Product / researcher | Not started | Argentina dataset ships at MVP per D7; may need to cut to post-MVP if research is not complete |
| probes.json neutrality pilot (20 readers) | Product | Not started | probes.json can ship with draft wording; formal neutrality validation is a pre-launch gate |
| Axis count reconciliation (12 vs 10) | Product + Theory review | Open question (see DR-3) | Scorer rubric, projection matrix, and radar chart cannot be finalized until resolved |

### Risks

| Risk | Probability | Impact | Mitigation Strategy |
|:---|:---|:---|:---|
| Biased adoption — only "alternative" audiences take the test, creating a self-selected histogram that misrepresents the population | High | Medium | Journalist iframe embed is the primary distribution channel; neutral framing of the product thesis; explicit methodology transparency reduces perceived ideological agenda |
| Politician profile objectivity — profiles become contested or legally challenged by politicians | Medium | High | All scores are sourced, dated, and confidence-rated; null on insufficient evidence; methodology is public and auditable; a correction-request process must be documented pre-launch |
| Loaded probe wording — specific question phrasing carries implicit ideological premise | High (first draft) | High | Mandatory neutrality pilot with 20 readers of different self-IDs before launch; THEORY.md §5.1 criteria as checklist; reject any probe that produces <10% variance in a politically-diverse pilot group |
| Political capture — a political actor claims the methodology favors their opponents | Medium | High | Open source from day one; methodology page cites peer-reviewed literature; scoring weights are published and fixed; no operator can change results without a public fork |
| Hyper-individualization — the tool promotes self-discovery at the expense of collective action | Low | Low | Aggregate histogram (even if stubbed at MVP) counters atomization; the product explicitly shows "many people share your unrepresented vector"; this is documented in the product narrative |
| LLM sycophancy — the scorer mirrors the user's apparent political lean | High (without mitigation) | High | Elicitor / scorer are architecturally separated (FR-04); scorer operates at temperature 0 on raw transcript only; rubric explicitly instructs score-from-stated-positions-only; evidence quote required per axis (THEORY.md §5.2) |
| LLM non-determinism — same conversation produces different vectors on retries | Medium | Medium | Temperature 0 for scorer; fixed rubric version; evidence quotes logged for auditability; periodic Krippendorff's alpha validation against a held-out Likert battery (THEORY.md §5.2) |
| Axis count disagreement (12 vs 10) creates implementation inconsistency | High (currently open) | High | Must be resolved as a formal decision in DECISIONS.md before scorer rubric is written; both options are documented in this PRD and source documents |
| Data staleness — politician profiles become outdated as politicians change positions | Medium (ongoing) | Medium | Profiles carry a `data_date` field; a versioned update process (PR with sources) must be defined; the UI displays the data date on the politician panel |

---

## 11. MVP Scope vs. Later Phases

### MVP — Runs on localhost, Peru + Argentina datasets, MockProvider

| Feature | MVP | Post-MVP |
|:---|:---|:---|
| Conversational intake (MockProvider) | Yes | — |
| AnthropicProvider (real LLM) | Ready but inactive; activated by env var | Activated for production |
| 12-axis vector + radar | Yes | — |
| 2D scatter map with politicians | Yes | — |
| Closest politician + non-representation frontier | Yes | — |
| Autoadscription vs. emergent profile reveal | Yes | — |
| Shareable URL hash + text card | Yes | — |
| Peru politician dataset (sourced) | Yes (may ship with illustrative data flagged) | Fully sourced |
| Argentina politician dataset | Yes (per D7) | — |
| Open-methodology page | Yes | — |
| Journalist iframe embed | Yes | — |
| OG image generation (Satori edge function) | No | Phase 2 |
| Aggregate histogram (live backend) | Stubbed with static illustrative data | Phase 2 |
| Additional countries (Brazil, Chile, Mexico) | No | Phase 3 |
| Structural archetype labels | No | Phase 2 (requires naming review) |
| Likert anchor validation (Krippendorff's alpha) | No | Phase 2 |
| Mobile swipe UX | Basic responsive | Phase 2 polish |

### Phase 2 (post-MVP)

- Activate AnthropicProvider for production with rate limiting and cost monitoring.
- OG image generation for social sharing via Cloudflare Worker + Satori.
- Aggregate histogram with a privacy-preserving opt-in backend (Cloudflare D1 or similar, no PII).
- Structural archetype labels after naming review.
- Probe neutrality formal validation (Krippendorff's alpha).
- Mobile UX polish (swipeable axes, haptic feedback).

### Phase 3 (country expansion)

- Brazil dataset (Portuguese locale).
- Chile, Mexico, Colombia datasets.
- Legislative vote API integration (Brazil Camera dos Deputados API, Argentina Hacienda diputados) to automate politician profile updates.

---

## 12. Open Questions

- [ ] **Axis count: 12 (DECISIONS.md D1) or 10 (THEORY.md §2.3)?** This is the single most blocking open question. The scorer rubric, projection matrix constants, and radar chart all depend on the answer. Both are documented; a formal decision must be recorded in DECISIONS.md.
- [ ] **Which 5+ Peruvian politicians ship at MVP?** Must be defined, researched, and sourced. If full sourcing is not complete before launch, the decision to ship with illustrative-flagged data vs. delay launch needs to be explicit.
- [ ] **Rate limiting strategy for `/api/score`**: What is the per-IP or per-session limit to prevent API key exhaustion in production?
- [ ] **OG image generation timing**: Is the Satori/Edge function approach deferred to Phase 2, or can a simpler static template approach ship at MVP (text-only share card at MVP, image at Phase 2)?
- [ ] **Aggregate counter backend**: Does MVP ship with a minimal privacy-preserving counter (Cloudflare Analytics Engine, no PII) or pure client-side with no aggregate data at all?
- [ ] **Correction-request process for politician profiles**: Before public launch, a documented process for disputed profiles (e.g., a politician's team submits a correction) is required. Who adjudicates? What is the evidence standard?
- [ ] **Axis reconciliation: do the four soberanía sub-facets (E3–E6 in the original 12-axis model) appear separately in the conversation and radar, or are they presented as a single "Soberanía" axis with sub-facet detail?** DECISIONS.md D1 keeps 12 axes; THEORY.md §2.2 recommends collapsing to 10 for display. A hybrid (12 for elicitation, 10 for radar display) would satisfy both concerns but adds implementation complexity.
- [ ] **Embargo on structural archetype labels at MVP**: Confirm that the archetype label system (Cosmopolita Extractivista, Soberano Autonomista, etc.) is out of scope for MVP to avoid premature labeling that reintroduces the binary it intends to dissolve.
- [ ] **Academic collaboration for histogram publication**: Is there a named political scientist or academic partner for the aggregate data publication KPI? Without a named partner this metric has no clear path.

---

## 13. Appendix

### A. Axis Reference Table (12-axis model per DECISIONS.md D1)

| ID | Name | Pole 0 | Pole 10 |
|:---|:---|:---|:---|
| E1 | Redistributivo | No redistribución / mercado | Redistribución radical |
| E2 | Extractivismo | Profundizar extracción | Restringir radicalmente |
| E3 | Soberanía Productiva | Importar / apertura | Industrializar / autonomía |
| E4 | Soberanía Tecnológica | Dependencia / proveedores externos | Autonomía tecnológica total |
| E5 | Soberanía Militar | Alineación con EE.UU. | Neutralidad / autonomía |
| E6 | Soberanía Monetaria | Dolarización | Soberanía emisora |
| E7 | Tierra y Territorio | Status quo concentrado | Reforma agraria radical |
| E8 | Derechos Culturales | Restrictivo / tradición | Progresismo / autonomía individual |
| E9 | Seguridad | Militarización / mano dura | Enfoque policial-judicial social |
| E10 | Memoria Histórica | Amnistía / pasar página | Juicio y memoria completa |
| E11 | Estado Salud/Educación | Provisión privada | Provisión pública integral |
| E12 | Alineamiento Geopolítico | Alineamiento EE.UU./Occidente | Multipolar / no alineado |

### B. Collinearity Clusters (from THEORY.md §2.4)

| Cluster | Axes | Expected Correlation |
|:---|:---|:---|
| Economic-structural super-factor | E1, E11, (E3, E6 partially) | Positive: high redistribution typically co-occurs with public health/education |
| Cultural-authority super-factor | E8 (Derechos), E9 (Seguridad), E10 (Memoria) | E8 negatively correlated with E9/E10; E8 and E10 positively |
| Extraction-territory tension | E2, E7 | Negative: high extractivism co-occurs with low territory protection |
| Sovereignty cluster | E3, E4, E5, E6, E12 | Positive: sovereigntist positions tend to co-occur across sub-axes |

### C. Comparable Products

| Product | Axes | LATAM Politicians | Conversational | Open Methodology | Non-Representation |
|:---|:---|:---|:---|:---|:---|
| Political Compass | 2 | No | No | No | No |
| 8values | 8 | No | No | Partial | No |
| iSideWith | ~25 | No (US only) | No | No | Partial |
| Espectro (this PRD) | 12 | Yes (PE, AR) | Yes | Yes | Yes |

### D. Source Documents

- `experiments/espectro-politico/docs/DECISIONS.md` — Architecture decisions, projection matrix, stack, MVP scope.
- `experiments/espectro-politico/docs/THEORY.md` — Dimensional model, literature review, projection math (10-axis version), distance metric, validity cautions.
- `.context/suficiencia-espectro-politico.md` — Product vision, Part B: design rationale, probe bank sketch, risk register, metrics, comparables, 8-week timeline.

### E. Key Literature

- Hinich and Munger (1992, 1994) — weighted Euclidean distance for spatial ideology.
- Poole and Rosenthal (DW-NOMINATE) — empirical 2-dimension result for legislative voting.
- Wiesehomeier and Benoit (2009, PREPPS) — LATAM expert survey; economic dimension ~44% variance.
- Zechmeister and Corral (2013, LAPOP) — unreliability of left/right self-placement in LATAM.
- Gudynas (2009) / Svampa — neo-extractivism as partly orthogonal to redistribution.
- Haidt and Graham (2009, MFT) — binding vs. individualizing foundations ground the cultural-authority axis.
- arXiv 2604.27633 — LLM political sycophancy audit; justifies elicitor/scorer separation.
