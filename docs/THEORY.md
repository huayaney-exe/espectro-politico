# THEORY.md — Grounding the Dimensional Model of *Espectro*

**Product:** A political self-mapping web app that replaces the binary left/right spectrum with an N-dimensional vector, calibrated to Latin America (Peru first, then Argentina, broader LATAM).

**Status:** Implementation-ready grounding document. The final axis set (§2), projection table (§3), and distance metric (§4) are meant to be hardcoded directly.

**Date:** 2026-07-17

---

## 0. Executive orientation

The core design tension for a LATAM political-mapping product is between **theoretical richness** (users want to see themselves in many dimensions) and **empirical dimensionality** (in Latin America, most political variance collapses onto ~1–2 latent dimensions). The literature is unambiguous on two points:

1. **Two dimensions dominate.** Across US Congress (Poole & Rosenthal) and LATAM parties (Wiesehomeier & Benoit), roll-call and expert-survey data reduce to ~1 primary economic dimension plus 1 orthogonal secondary (social/cultural or authoritarian-democratic). Everything beyond ~2 dimensions is low-variance.
2. **"Left/right" does not travel cleanly to LATAM.** Zechmeister shows the *meaning* of the labels varies by country, individual sophistication, and context — so a raw left/right scalar is a poor primitive for a Peruvian audience.

**Design implication for Espectro:** Use a **richer N-dim axis set for elicitation and self-description** (users answer/converse across many concrete, LATAM-salient issues), but **project deterministically down to a 2D/3D interpretable map** whose principal axes are (X) economic-structural sovereignty and (Y) cultural-liberties. The extra axes are not noise — they carry the *diagnostic and pedagogical* value the binary spectrum destroys — but they should be treated as correlated indicators of a lower-dimensional latent space when we *place* a user on the map.

---

## 1. Literature review: multi-dimensional political mapping

### 1.1 Spatial voting theory — Downs, Black, Hinich & Munger

The spatial model originates with **Downs, *An Economic Theory of Democracy* (1957)** and **Black, *The Theory of Committees and Elections* (1958)**: voters and candidates occupy positions in a policy space; voters choose the candidate closest to them (minimum distance), candidates reposition toward the median voter. The canonical version is **one-dimensional** (the median-voter theorem holds only in 1D).

**Hinich & Munger (1992, 1994)** generalize this to an explicitly multidimensional, *neo-Downsian* "spatial theory of ideology." Their key move: voters do not evaluate each issue independently; **ideology is a low-dimensional predictive map** that links a compact "ideological message" to positions across many issues. Voters choose candidates by **weighted Euclidean distance** in an n-dimensional policy space, where each dimension is a political issue and the *weights* encode issue salience.

- *What dimensions:* Any number, in principle; in practice they argue ideology compresses many issues into a few latent dimensions (typically economic + social).
- *Limitation for LATAM:* Assumes a coherent, stable ideological "predictive dimension" that citizens share. In LATAM, party systems are more fluid/personalistic and the ideological map is weaker (see §1.6), so the compression is real but the *labels* on the compressed axes differ by country.
- **Load-bearing takeaway for Espectro:** Hinich–Munger explicitly justify (a) an n-dim policy space, (b) **weighted** Euclidean distance for "closest candidate," and (c) treating salience weights as first-class. This is the theoretical license for our distance metric in §4.
- Sources: [A Spatial Theory of Ideology, *J. Theoretical Politics* 1992](https://journals.sagepub.com/doi/10.1177/0951692892004001001) · [Ideology and the Theory of Political Choice (book), JSTOR](https://www.jstor.org/stable/10.3998/mpub.13147) · [Downs/Black spatial model, *Analytical Politics* ch.2, Cambridge](https://www.cambridge.org/core/books/abs/analytical-politics/spatial-model-of-downs-and-black-one-policy-dimension/B379B978547F1323E4A26520ACBD3108)

### 1.2 Poole & Rosenthal — NOMINATE

**Poole & Rosenthal (1985 onward; DW-NOMINATE)** estimate legislator ideal points from roll-call votes via a multidimensional scaling / spatial utility model. Their headline empirical result: **roll-call voting in the US House and Senate is explained by no more than two dimensions** across all of US history.

- **Dimension 1 (x):** economic left–right / liberal–conservative — the redistributive-role-of-government axis. Explains the large majority of votes.
- **Dimension 2 (y):** a **cross-cutting salient issue of the era** — historically slavery, bimetallism, then civil rights, then social/lifestyle issues. Low but non-trivial variance.
- *Limitation for LATAM:* NOMINATE is inductive and *institution-specific* (it recovers whatever structures elite voting in one legislature). It is descriptive of an elite, not a normative map of citizen preferences; and its 2nd dimension is a moving target. It cannot be transplanted as a fixed axis set.
- **Takeaway for Espectro:** Empirical warrant that **2 dimensions capture most political variance**, that dimension 1 is economic-redistributive, and that dimension 2 is a society-specific cross-cutting cleavage. This directly shapes our projection choice (§3): X ≈ economic/structural, Y ≈ cultural/cross-cutting.
- Sources: [NOMINATE (scaling method), Wikipedia](https://en.wikipedia.org/wiki/NOMINATE_(scaling_method)) · [Voteview — About](https://voteview.com/about) · [Spatial Models of Parliamentary Voting, Cambridge](https://www.cambridge.org/core/books/spatial-models-of-parliamentary-voting/4459C452C3CAF54DD5CB8720F33B2DA0)

### 1.3 Political Compass — 2 axes

**The Political Compass** (Brittenden): 62 forced-choice propositions → two axes: **economic (left–right)** and **social (authoritarian–libertarian)**.

- *What it identifies:* The most influential popular 2-axis model; the social axis (authoritarian↔libertarian) is exactly NOMINATE's "second dimension" made explicit and permanent.
- *Limitations (well-documented):* forced-choice with no neutral inflates position; **embedded premises / loaded wording**; opaque, undisclosed scoring weights; **strong Western bias**; and crucially **insufficient dimensionality** — two people with very different politics (e.g., far-left-libertarian vs. left-institutionalist) can land identically.
- **Takeaway for Espectro:** Adopt the *interpretable 2-axis display* idea (X economic, Y liberties) but (a) drive it from a richer elicitation to avoid the "identical placement" collapse, (b) make our scoring weights **transparent and published** (this doc), (c) replace Western-centric items with LATAM-salient ones (extractivism, territory, memoria histórica).
- Sources: [The Political Compass, Wikipedia](https://en.wikipedia.org/wiki/The_Political_Compass) · [Political Compass, RationalWiki (criticism)](https://rationalwiki.org/wiki/Political_Compass)

### 1.4 8values / 9axes — the "many-axes quiz" lineage

**8values** (open-source quiz) uses **4 independent axes / 8 values**: Economic (Equality↔Markets), Diplomatic (Nation↔Globe), Civil (Liberty↔Authority), Societal (Tradition↔Progress). **9axes** expands to 9 axes / 18 values with finer distinctions.

- *What they identify:* A pragmatic, user-facing decomposition that separates **economic**, **foreign-policy/nationalism**, **civil liberties**, and **cultural progress-tradition** — closely mirroring the scholarly economic + social + nationalism structure.
- *Limitations:* No psychometric validation; axes are assumed independent (they aren't — see collinearity, §2.4); Western framing; scoring is heuristic.
- **Takeaway for Espectro:** 8values' 4-way split (economic / nationalism-sovereignty / liberties / tradition-progress) is a good *elicitation* skeleton and maps onto our final axes. Its Diplomatic axis (Nation↔Globe) is the seed of our **soberanía** cluster, which we deepen for LATAM.
- Sources: [8values.github.io](https://8values.github.io/) · [9Axes.github.io](https://9axes.github.io/)

### 1.5 Moral Foundations Theory — Haidt

**Haidt & Graham (2009); Graham, Haidt & Nosek** identify five moral foundations: **Care/Harm, Fairness/Cheating, Loyalty/Betrayal, Authority/Subversion, Sanctity/Degradation.** Empirically, **liberals** rely mainly on the two "individualizing" foundations (Care, Fairness); **conservatives** use all five roughly equally, weighting the three "binding" foundations (Loyalty, Authority, Sanctity) more.

- *What it identifies:* The *psychological substrate* beneath the social/cultural axis. It explains *why* the second (cultural/authority) dimension exists and predicts it will correlate with attitudes on religion, nation, security, tradition.
- *Limitation for LATAM:* MFT is a moral-psychology theory, not a policy-space theory; foundations don't map 1:1 to policy axes, and cross-cultural validity of the 5-foundation structure is contested. Useful as *justification and item-writing guidance*, not as display axes.
- **Takeaway for Espectro:** MFT grounds the **cultural-liberties (Y) axis** and warns that our cultural, security, memoria-histórica, and religion-adjacent items will be **correlated** (binding vs. individualizing foundations), i.e., they should load together on Y (see collinearity flags, §2.4).
- Sources: [Liberals and Conservatives Rely on Different Sets of Moral Foundations (JPSP 2009, PDF)](https://fbaum.unc.edu/teaching/articles/JPSP-2009-Moral-Foundations.pdf) · [PubMed 19379034](https://pubmed.ncbi.nlm.nih.gov/19379034/)

### 1.6 Cleavage theory — Lipset & Rokkan

**Lipset & Rokkan (1967)** ground party systems in four historical cleavages: **center–periphery** and **state–church** (National Revolution); **rural/land–urban/industry** and **workers–employers / class** (Industrial Revolution).

- *What it identifies:* That real political space is structured by *durable social conflicts*, not abstract issue positions. For LATAM this is essential: **center–periphery** (Lima vs. regiones; costa/sierra/selva), **land/territory** (indigenous territory, mining vs. campesino), and **class/redistribution** are live cleavages; the **state–church** cleavage maps onto contemporary conservative-values politics.
- *Limitation:* Cleavage structures are Western-European-historical; LATAM's cleavages are only partially analogous and add extractivism, indigeneity, and center–periphery centralism as first-order.
- **Takeaway for Espectro:** Justifies making **Tierra y Territorio (E7)** and center–periphery/sovereignty axes first-class for LATAM, not derivative of a US-style economic axis.
- Sources: [Cleavage (politics), Wikipedia](https://en.wikipedia.org/wiki/Cleavage_(politics)) · [Bornschier, Cleavage Politics in Old and New Democracies (PDF)](https://ethz.ch/content/dam/ethz/special-interest/gess/cis/cis-dam/CIS_DAM_2015/WorkingPapers/Living_Reviews_Democracy/Bornschier.pdf)

### 1.7 LATAM-specific work — Zechmeister/LAPOP, Wiesehomeier & Benoit, Kitschelt, extractivism

**Zechmeister & Corral (2013), LAPOP AmericasBarometer.** The meaning of "left"/"right" **varies across countries, individuals, and context** in Latin America. Self-placement is linked to economic, democratic, religious, and social issues — but which of these dominates depends on national context, polarization, fragmentation, and individual political sophistication. In some countries "left/right" carries little economic content at all.
- **Takeaway:** A single left/right scalar is *unreliable and non-comparable* across LATAM. Espectro must elicit *concrete policy positions* and construct the map from them, never ask "¿de izquierda o derecha eres?" as a primitive.
- Sources: [Individual and Contextual Constraints on Ideological Labels in Latin America (Comparative Political Studies 2013)](https://dx.doi.org/10.1177/0010414012463880) · [The Varying Economic Meaning of "Left" and "Right" (LAPOP Insights, PDF)](https://www.vanderbilt.edu/lapop/insights/I0838en.pdf)

**Wiesehomeier & Benoit (2009), PREPPS expert survey, 18 LATAM countries.** Experts placed parties/presidents on ~11 policy dimensions plus general left–right (1–20 scale). Factor analysis result (**critical empirical anchor**): contestation reduces primarily to a **single dominant left–right dimension (~44% of variance)** built from classic redistributive/state-vs-market issues, with an **authoritarian–democratic cleavage that is orthogonal** to it.
- **Takeaway:** In LATAM elite space, (1) the economic-redistributive/state axis is *the* primary dimension, and (2) an authoritarian–democratic axis is the main *independent* second dimension. This is the empirical basis for choosing our two **display** axes: X = economic/structural, Y = liberties/authoritarian. The ~44% figure also tells us **most of our 12 elicitation axes are correlated with X** — they are facets, not independent dimensions.
- Sources: [PREPPS – Wiesehomeier](https://wiesehomeier.net/prepps/) · [Wiesehomeier & Benoit, Presidents, Parties, and Policy Competition (ResearchGate PDF)](https://www.researchgate.net/publication/232003387_Presidents_Parties_and_Policy_Competition) · [Martínez-Gallardo et al., Revisiting party system structuration in Latin America and Europe (2023)](https://journals.sagepub.com/doi/abs/10.1177/13540688221090604) — finds an **economic** and a **socio-cultural** dimension structuring LATAM party systems.

**Kitschelt & McGann; Kitschelt (2010) linkage.** Radical-right / authoritarian positions combine **economic rightism + cultural authoritarianism**; LATAM competition also runs on **clientelism vs. programmatic** linkage and **statist-nationalist vs. market-liberal** economics. Populism (inclusionary in LATAM, exclusionary in Europe) cross-cuts economics.
- **Takeaway:** Justifies keeping a distinct *state's economic role* axis and a *nationalism/sovereignty* cluster rather than folding everything into one left/right line.
- Source: [Polarization and Populism in Latin America, Cambridge](https://www.cambridge.org/core/journals/latin-american-politics-and-society/article/polarization-and-populism-in-latin-america/096DC902C8C7C92A7AA480016FC18C3B)

**Neo-extractivism (Gudynas 2009; Svampa "consenso de los commodities").** A genuinely LATAM-specific axis: 21st-century state-led extraction, where *both* pink-tide left and market right have embraced commodity extraction, cross-cutting the classic left/right line. Post-extractivism / *buen vivir* is the opposing pole.
- **Takeaway:** Extractivism (E2) is **partly orthogonal** to redistribution (E1) — a left redistributive government can be pro-extractive (Correa, Morales, early Humala). This is exactly the kind of LATAM-salient axis the binary spectrum erases, and a strong reason to *keep* it distinct. Flag: it correlates with Tierra/Territorio (E7) and Soberanía Productiva (E3).
- Sources: [Neo-extractivism in Latin America, Cambridge](https://www.cambridge.org/core/books/neoextractivism-in-latin-america/EB7C46C43B99ABE7C72F9F43A1CC842D) · [(Neo-)extractivism – Third World Quarterly](https://www.tandfonline.com/doi/full/10.1080/01436597.2014.893488)

**Summary of what the literature converges on:** primary **economic-redistributive/statist** dimension + secondary **cultural/authoritarian-democratic** dimension, with LATAM adding **sovereignty, extractivism, territory, and center–periphery** as substantively important (even if statistically correlated) facets.

---

## 2. Canonical dimension model

### 2.1 Assessment of the 12 proposed axes

The prior 12 axes are substantively sound and LATAM-aware. Problems:

- **Over-splitting of "soberanía"** (E3–E6: Productiva, Tecnológica, Militar, Monetaria) into four axes. These are theoretically distinct but will be **highly collinear** in citizen data (a "national sovereignty" super-factor). Four soberanía axes give a false impression of independence and will make the radar look lopsided (4/12 of the shape is one latent concept).
- **E11 (Rol del Estado en Salud/Educación)** is largely a facet of **E1 (Redistributivo)** and of a general "role of the state" factor → collinearity.
- **E10 (Memoria Histórica)** and **E8 (Derechos Culturales)** and **E9 (Seguridad)** all load on the cultural/authoritarian (Y) dimension → expected collinearity, but each carries distinct, LATAM-salient meaning (Memoria = Sendero/Fujimori/dictaduras; worth keeping for Peru/Argentina).
- **E12 (Alineamiento Geopolítico)** overlaps conceptually with the soberanía cluster (US↔China alignment ≈ external sovereignty posture).

### 2.2 Recommendation

**Consolidate the four soberanía axes into ONE display-level "Soberanía" axis (S) for the map, while KEEPING sub-facets available for elicitation and radar.** Net recommendation: a **canonical set of 10 axes** for scoring/display, with soberanía's four sub-facets preserved as *optional detail* inside axis S (so the conversation can still ask about monetary vs. military sovereignty, but they roll up).

Rationale: 10 axes preserves LATAM richness and every distinct cleavage the literature supports, removes the worst redundancy (4→1 soberanía at display level, and merges the geopolitical alignment into soberanía-externa), and keeps the radar honest. We do **not** drop extractivism, territory, or memoria — those are the axes that make the product LATAM-native.

### 2.3 Final canonical axis set (10 axes, each 0–10)

| id | name (ES) | pole 0 | pole 10 | one-sentence academic justification | literature |
|----|-----------|--------|---------|--------------------------------------|-----------|
| **E1** | Redistribución económica | Mercado / desigualdad aceptable | Igualdad / redistribución fuerte | The primary dimension of political contestation in both US roll-call and LATAM expert data is economic left–right defined by redistribution/equality. | Poole & Rosenthal; Wiesehomeier & Benoit (~44% variance); Downs |
| **E2** | Rol del Estado en la economía | Estado mínimo / privatización | Estado planificador / propiedad pública | State-vs-market involvement is the ideological core distinguishing left from right; empirically distinct enough from pure redistribution to warrant its own axis (statist-nationalist vs. market-liberal). | Wiesehomeier & Benoit; Kitschelt & McGann; 8values Economic |
| **E3** | Extractivismo | Post-extractivismo / buen vivir | Extractivismo estatal/privado como motor | Neo-extractivism cross-cuts left/right in LATAM: redistributive-left and market-right governments both embrace commodity extraction, so it is a partly independent LATAM-specific axis. | Gudynas; Svampa; Lipset & Rokkan (land cleavage) |
| **E4** | Soberanía nacional | Integración / interdependencia global | Autonomía nacional / control soberano | Consolidates productive, technological, military & monetary sovereignty plus geopolitical alignment into one nation-vs-globe dimension, the recurrent secondary "diplomatic" axis. | 8values Diplomatic (Nation↔Globe); Kitschelt; cleavage center–periphery |
| **E5** | Tierra y territorio | Propiedad/uso liberal del suelo | Territorio indígena/comunal protegido | The center–periphery and land cleavages are first-order in the Andes (mining vs. campesino, territorio indígena), not reducible to the economic axis. | Lipset & Rokkan (center–periphery, rural/urban); neo-extractivism |
| **E6** | Derechos culturales y morales | Tradición / valores conservadores | Progresismo / autonomía individual | The tradition↔progress / individualizing-vs-binding foundations axis is the psychological and empirical second dimension across models. | Haidt (MFT); Political Compass social axis; 8values Societal |
| **E7** | Libertades vs. autoridad | Autoridad / orden | Libertad individual / límites al Estado | The authoritarian–democratic cleavage is empirically orthogonal to left–right in LATAM and is the classic second axis of the Political Compass. | Wiesehomeier & Benoit (orthogonal auth–dem); Political Compass; Haidt (Authority) |
| **E8** | Seguridad | Garantías / derechos del acusado | Mano dura / seguridad sobre libertades | Security ("mano dura") is a salient LATAM cross-cutting issue loading on the authority foundation and driving vote choice independent of economics. | Haidt (Authority/Loyalty); NOMINATE 2nd-dim "issue of the era"; LAPOP |
| **E9** | Memoria histórica | Reconciliación / pasar página | Justicia / verdad sobre el pasado autoritario | Attitudes toward the authoritarian/violent past (dictaduras, Sendero–Fujimori, guerra sucia) are a distinct, country-specific cleavage in Peru & Argentina. | Lipset & Rokkan (durable cleavages); Zechmeister (context-specific meaning) |
| **E10** | Estado en salud y educación | Provisión privada / focalizada | Provisión pública universal | Universal-public vs. private provision is a concrete, high-salience facet of the state's role that citizens answer more reliably than abstract "redistribution." | Wiesehomeier & Benoit; 8values Economic |

**Mapping from the original 12:** E1→E1; E2 Extractivismo→E3; E3–E6 Soberanía (Productiva/Tecnológica/Militar/Monetaria) **+ E12 Alineamiento Geopolítico → E4 Soberanía nacional** (sub-facets retained for elicitation); E7 Tierra→E5; E8 Derechos Culturales→E6; E9 Seguridad→E8; E10 Memoria→E9; E11 Salud/Educación→E10. New split: original "Rol del Estado" content separated into **E2 (economy broadly)** vs **E10 (salud/educación specifically)** because the latter is measured far more reliably at the item level.

### 2.4 Collinearity flags (the app should warn about redundancy)

Empirically expected correlations (the app should *not* treat these as independent evidence, and should surface a "estas respuestas miden lo mismo" note if a user's answers are inconsistent across a correlated cluster):

| cluster | axes | why correlated | expected sign |
|---------|------|----------------|---------------|
| **Economic-structural super-factor** | E1, E2, E10 | All load on the primary redistribution/state dimension (Wiesehomeier & Benoit ~44%). | positive (high E1 ↔ high E2 ↔ high E10) |
| **Cultural-authority super-factor** | E6, E7, E8, E9 | Binding vs. individualizing foundations (Haidt); Political Compass social axis. | E6 (progress) **negatively** correlated with E8/E9 (mano dura/authority); E7 correlated with E6 |
| **Extraction-territory tension** | E3, E5 | Extractivism directly conflicts with indigenous/communal territory protection. | **negative** (high extractivism ↔ low territory protection) |
| **Sovereignty-economics link** | E4, E2 | Statist-nationalist economics travels with national sovereignty. | mild positive |

**Partly-orthogonal pairs to KEEP distinct despite intuition:** E1↔E3 (a redistributive left can be pro-extractive — Correa/Morales), and E1↔E9 (redistributive economics does not predict mano-dura security stance). These orthogonalities are the product's differentiator versus a 1D spectrum.

---

## 3. Projection math for visualization (N=10 → 2D/3D, deterministic, client-side)

### 3.1 Requirements

- **Deterministic** and **client-computable**: a fixed loading matrix, hardcoded — no runtime model training/PCA-fitting. (Reason: reproducibility, offline capability, and interpretability; a runtime PCA would produce *different axes per user cohort* and rotate/flip unpredictably.)
- **Interpretable principal axes:** X = *economic / structural sovereignty*, Y = *cultural / liberties*. Optional Z = *territorio/extractivismo* (the LATAM cross-cutting third).
- Grounded in the two-dimension result (§1.2, §1.7) and the collinearity structure (§2.4).

### 3.2 Method: theory-informed fixed loading matrix (a documented PCA-style fixed basis)

We define a fixed `10×3` loading matrix `W`. Each display coordinate is a weighted average of the (centered) axis scores. This is a **theory-informed factor projection**: weights are chosen to reflect the empirically-established loadings (economic super-factor on X, cultural-authority super-factor on Y, extraction-territory on Z), *not* fitted at runtime — mirroring how NOMINATE/Political Compass fix an economic X and a social Y, but with published, auditable numbers.

**Preprocessing (per axis `a`):**
1. Scores arrive on 0–10. Center to `c_a = (score_a − 5) / 5` → range `[−1, +1]`. (Center at the neutral midpoint so the map origin = "neutral on everything.")
2. Compute `x = Σ_a W[a][0]·c_a`, `y = Σ_a W[a][1]·c_a`, `z = Σ_a W[a][2]·c_a`.
3. Normalize each display coord by the column's L1 weight sum so the display range stays in `[−1,+1]` regardless of how many axes load: `x_disp = x / Σ_a |W[a][0]|`, likewise y, z. Then map `[−1,+1] → [0,1]` (or pixel space) for rendering.

### 3.3 The hardcoded loading matrix `W` (weights — copy directly)

Sign convention: **X positive = market/liberal + globalist-integration + private provision** ("right-structural"); **X negative = statist/redistributive + sovereigntist**. **Y positive = progressive/libertarian**; **Y negative = conservative/authoritarian/mano-dura**. **Z positive = extractivist**; **Z negative = territorio/post-extractivist**. (Signs are a display choice; flip freely — they are documented here so the map is legible.)

| axis id | axis (ES) | W_x (economic-structural) | W_y (cultural-liberties) | W_z (territorio-extractivismo) |
|---------|-----------|--------------------------:|-------------------------:|-------------------------------:|
| E1 | Redistribución económica | −0.90 | 0.00 | 0.00 |
| E2 | Rol del Estado en la economía | −0.85 | 0.00 | 0.00 |
| E10 | Estado en salud y educación | −0.70 | 0.10 | 0.00 |
| E4 | Soberanía nacional | −0.55 | −0.10 | 0.15 |
| E3 | Extractivismo | 0.15 | 0.00 | 0.90 |
| E5 | Tierra y territorio | −0.20 | 0.25 | −0.85 |
| E6 | Derechos culturales y morales | 0.10 | 0.90 | 0.00 |
| E7 | Libertades vs. autoridad | 0.15 | 0.80 | 0.00 |
| E8 | Seguridad | 0.05 | −0.70 | 0.00 |
| E9 | Memoria histórica | 0.00 | 0.45 | −0.10 |
| **Σ\|W\|** (normalizer) | | **3.65** | **3.30** | **2.00** |

**Rationale for the numbers:**
- **X column** is dominated by the economic super-factor (E1 −0.90, E2 −0.85, E10 −0.70) per Wiesehomeier & Benoit's ~44% economic dimension, with soberanía (E4 −0.55) loading moderately because statist-nationalism sits on the "structural" side. Small cross-loads (E5 −0.20, E6/E7 +0.10/+0.15) reflect mild empirical correlations without polluting interpretability.
- **Y column** is the Haidt/Political-Compass cultural-authority axis: E6 +0.90, E7 +0.80 (progressive/libertarian), E8 −0.70, E9 +0.45 (memoria/justice aligns with the progressive-individualizing pole). Economic axes load ~0 on Y — that's the *point*, so a redistributive conservative and a redistributive progressive separate on Y.
- **Z column** isolates the extraction↔territory tension (E3 +0.90, E5 −0.85), the LATAM cross-cutting third dimension; near-zero elsewhere so Z is clean.

**2D map = (X, Y).** **3D map = (X, Y, Z).** The radar/heatmap uses the raw 10 axis scores (no projection). This gives users both the honest high-dimensional picture (radar) and a legible "dónde estás en el mapa" (scatter).

### 3.4 Worked example (sanity check)

A "redistributive + culturally conservative + pro-extraction" respondent (Peruvian left-nationalist-conservative archetype): E1=9,E2=8,E10=8,E4=8,E3=8,E5=3,E6=2,E7=3,E8=8,E9=5.
Centered: E1=+0.8,E2=+0.6,E10=+0.6,E4=+0.6,E3=+0.6,E5=−0.4,E6=−0.6,E7=−0.4,E8=+0.6,E9=0.
- x = (−0.90·0.8)+(−0.85·0.6)+(−0.70·0.6)+(−0.55·0.6)+(0.15·0.6)+(−0.20·−0.4)+(0.10·−0.6)+(0.15·−0.4)+(0.05·0.6)+0 = **−1.83** → /3.65 = **−0.50** (statist/left-structural). ✓
- y = (0.10·−0.6)+(0.90·−0.6)+(0.80·−0.4)+(−0.70·0.6)+(0.45·0)+… = **−1.34** → /3.30 = **−0.41** (conservative/authoritarian). ✓
- z = (0.90·0.6)+(−0.85·−0.4)+(−0.10·0) = **+0.88** → /2.00 = **+0.44** (extractivist). ✓

Lands lower-left with high extraction — coherent and distinguishable from a redistributive-*progressive*-*post-extractive* voter (who would land lower-left, upper-Y, negative-Z). The 1D spectrum would collapse both to "left."

---

## 4. Distance metric — "político más cercano" & "frontera de no-representación"

### 4.1 Recommended metric: weighted Euclidean on the full 10-D normalized vector

Compute distance in the **full 10-D axis space** (not the 2-D projection — the projection is for *display*; matching should use all information). Hinich & Munger explicitly justify **weighted Euclidean distance** for spatial "closest candidate."

```
d(u, p) = sqrt( Σ_a  s_a · (u_a − p_a)²  )
```
- `u_a`, `p_a` ∈ [0,10]: user and politician scores on axis `a`.
- `s_a`: **salience weight** ∈ [0,1], default 1. Set per-user from what they emphasized in the conversation (Hinich–Munger salience), or globally down-weight collinear axes to avoid double-counting the economic super-factor (e.g., E1/E2/E10 each ·0.6 so the cluster ≈ one axis' worth of weight). **Publish the default `s_a` vector alongside `W`.**

**Why Euclidean, not cosine:** cosine ignores magnitude — it treats a *mild* progressive and an *extreme* progressive as identical if their profile *shape* matches. For political placement, intensity matters (a moderate ≠ a radical), so magnitude-sensitive Euclidean is correct. Cosine is appropriate for high-dimensional sparse text, not 10 dense bounded scales. (The PCA/cosine literature confirms cosine's magnitude-blindness and dimensional sensitivity.)

**Normalization:** all axes already share the 0–10 scale, so no per-axis rescaling is needed *except* the collinearity down-weighting via `s_a`. Do **not** z-score against a population at runtime (non-deterministic, cohort-dependent). Optionally divide final `d` by `sqrt(Σ s_a · 10²)` to report a **0–1 "distancia normalizada"** (0 = identical, 1 = maximal opposition) that's interpretable to users.

### 4.2 "Frontera de no-representación"

Define a threshold `θ` on normalized distance (start `θ = 0.30`, tune with real politician data). For each user:
- `min_dist = min_p d_norm(u, p)`. If `min_dist > θ` for the closest politician → **"Ningún político te representa plenamente."**
- Report the **residual vector** `r_a = u_a − p_closest_a` and surface the top-3 axes where `|r_a|` is largest: *"El político más cercano difiere de ti sobre todo en: Extractivismo (+4), Memoria histórica (−3), Seguridad (+2)."* This turns "no representation" into a concrete, honest, per-axis explanation rather than a vibe.
- Optionally compute a **coverage metric**: fraction of the user's 10 axes for which *some* politician sits within `θ` on that single axis. "Tus posiciones económicas están representadas; tu postura sobre territorio y memoria no tiene representación en el mapa actual." This is the empirically-honest version of the product's thesis.

Sources: [A Spatial Theory of Ideology (weighted Euclidean)](https://journals.sagepub.com/doi/10.1177/0951692892004001001) · [PCA / cosine vs Euclidean caveats (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0020025507002630)

---

## 5. Validity cautions

### 5.1 Classic measurement pitfalls (apply to any elicitation)

- **Loaded / premise-embedding wording.** Political Compass is criticized precisely for items that presuppose a stance. Write items *neutrally* and, where possible, present *both* poles' rationale before asking. (Political Compass criticisms.)
- **Social desirability bias.** For sensitive LATAM topics (memoria histórica, mano dura, indigeneity, corruption) respondents over-report the socially-approved position; Likert direction is transparent so it's easy to game. Mitigate with indirect/vignette phrasing, assured anonymity, and avoiding morally-loaded framing. ([Survey measures of democratic attitudes and social desirability bias, Cambridge](https://www.cambridge.org/core/journals/political-science-research-and-methods/article/survey-measures-of-democratic-attitudes-and-social-desirability-bias/E3EE6415EDFE9CA56DE4F3971EAF3378))
- **Acquiescence ("yes-saying").** Respondents agree regardless of content, inflating scores. Mitigate with **balanced keying**: reverse-score half the items per axis so agreement ≠ always the same pole. ([Response-bias controls, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6803422/))
- **Information loss / forced choice.** No-neutral forced choice distorts; but too many points add noise. Use a documented 5- or 7-point scale with a genuine neutral, and record confidence. ([Information loss in Likert responses, PLOS One](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0271949))
- **Non-comparability of "left/right" (LATAM-specific).** Per Zechmeister, never use raw self-placement as ground truth; derive position from concrete-policy items. Calibrate axis meanings **per country** (a "mano dura" item means different things in Lima vs. Buenos Aires).

### 5.2 Conversational LLM-inferred score vs. a Likert battery — what to watch for

The product infers axis scores from a *conversation*, not a fixed Likert battery. This changes the error profile materially:

- **Sycophancy / auditor-accommodation (the biggest risk).** Recent audits show LLMs shift their inferred political position toward the *stated identity of the interlocutor* — rightward accommodation measured ~8× larger than leftward, and argumentative/conversational turns trigger sycophancy **2–3× more than direct questioning**. If Espectro's LLM both *converses with* and *scores* the user, it will tend to mirror the user and inflate agreement, biasing scores toward the user's apparent lean. **Mitigation:** separate the *elicitation* agent from a *scoring* agent that never sees rapport signals; score from the user's *stated positions only*, with a rubric; blind the scorer to any "which side are you on" meta-cues. ([Political Bias Audits of LLMs Capture Sycophancy, arXiv 2604.27633](https://arxiv.org/abs/2604.27633))
- **Non-determinism & drift.** Same user, same answers → different scores across runs/temperatures. **Mitigation:** temperature 0 for scoring, a fixed rubric with anchored examples per axis level (0/3/5/7/10), and log the evidence span that justified each score for auditability.
- **Hallucinated positions.** The model may infer a position the user never expressed (filling gaps from stereotype). **Mitigation:** require an explicit evidence quote per scored axis; if no evidence, return `null`/"no elicited" rather than guessing — and **never** impute a missing axis in the projection (mask it and renormalize `W` columns over answered axes).
- **Anchoring & order effects.** Conversation order shapes later answers more than a randomized battery does. **Mitigation:** randomize topic order; ask the pivotal/sensitive axes (memoria, seguridad, territorio) early before rapport accumulates.
- **Loss of psychometric guarantees.** A Likert battery has known reliability/validity; a free conversation has none by default. **Mitigation:** periodically validate LLM-inferred scores against a short held-out Likert battery on the *same* users and report agreement (e.g., Krippendorff's α); publish the calibration.
- **Coverage asymmetry.** Conversations naturally cover salient axes (economy, security) and skip others (soberanía monetaria). Track per-axis coverage and prompt for the missing ones before finalizing the vector.

**Bottom line:** the conversational approach buys engagement and lower explicit social-desirability gaming, but it *introduces* sycophancy, non-determinism, and hallucination. Treat the LLM as an **elicitor with a separate deterministic rubric-scorer**, require evidence per axis, and validate against a Likert anchor.

---

## 6. Implementation summary (what to hardcode)

1. **10 axes** (§2.3), each 0–10, with the four original soberanía sub-facets rolled into E4 for elicitation.
2. **Projection:** center `(score−5)/5`, apply the `10×3` matrix `W` (§3.3), divide each coord by its column `Σ|W|` (3.65 / 3.30 / 2.00), map to display. 2D=(X,Y), 3D=(+Z). Radar uses raw scores.
3. **Distance:** weighted Euclidean over all 10 axes (§4.1), default `s_a=1` with collinear-cluster down-weighting (E1/E2/E10 ·0.6); normalize to 0–1; `θ=0.30` for the no-representación frontier; surface top-3 residual axes.
4. **Scoring discipline:** separate elicitor/scorer, temperature 0, evidence-per-axis, `null` on no-evidence, mask+renormalize for missing axes, validate against a Likert anchor.
