# THE DIVINE ATLAS — MYTHOLOGY MODEL
Phase 1 deliverable. How mythology is modeled, and how we reached each structural
conclusion. This document is the "show your work" file: the reasoning behind the
data model, the entity coverage decisions, and the variant-handling rules.

## 1. Mythology is a graph, not a tree
**Decision**: relationships are first-class edges in a directed graph; entities are
nodes. Family is one edge category among many.
**Why**: a family-tree UI cannot express "Kagutsuchi's birth-killing of Izanami,"
"Susanoo KILLED Yamata-no-Orochi," or "Ninigi SUCCESSOR_OF Ōkuninushi." Those are
the stories users actually want to explore. Trees also break on real data: deities
have multiple parents across traditions, non-biological parentage (Athena from
Zeus's head), and partner relationships that are not parentage.
**Consequence**: the data model (docs/DATA-SCHEMA.md) defines 14 edge types
(PARENT_OF, CHILD_OF, SIBLING_OF, PARTNER_OF, CREATED_BY, CREATED, KILLED, FOUGHT,
ALLY_OF, ENEMY_OF, RULES, ASSOCIATED_WITH, SUCCESSOR_OF, and DEIFIED_AS for
later deification links). The explorer (Phase 6) renders this graph with React
Flow and filters by edge category.

## 2. Variants are data, not footnotes
**Decision**: where texts disagree, BOTH versions are stored and the disagreement
is surfaced in the UI.
**Why**: the brief explicitly forbids silently choosing one version, and the real
corpus is full of disagreements (Kojiki vs Nihon Shoki birth order; Heliopolite vs
Memphite vs Hermopolitan creation; Orphic vs Hesiodic cosmogony).
**Implementation**:
- `uncertainties.json` per culture holds named variant issues (id, question,
  versions[], sources, how_we_present_it).
- Relationships carry `confidence` + optional `explanation` describing the variant.
- Entities carry `uncertainty_notes[]`.
- Egyptian genealogy is modeled as *parallel creation traditions* (the cosmology
  object holds multiple, selectable creation sequences), because merging them would
  fabricate a genealogy that never existed.

## 3. Evidence tiers drive confidence labels
**Decision**: every factual claim traces to a source with a tier and a confidence.
**Tiers** (see SOURCES.md): T1 translated primary text / archaeological, T2 museum/
archive institution, T3 scholarly monograph, T4 discovery-only.
**Confidence labels on relationships**:
- `attested` — named in a primary text (e.g. "Susanoo slays Orochi" — Kojiki 1.5).
- `variant` — two or more primary texts disagree (both stored).
- `reconstructed` — modern scholarly inference from fragments (used heavily for
  Slavic; labeled as such everywhere).
- `uncertain` — weak, single, or late source.
**Why**: the brief's core quality bar is "no invented mythology, no invented
relationships, no AI-generated historical claims." The tier+confidence system is the
mechanism that enforces that: an edge labeled `reconstructed` cannot be presented
as `attested`.

## 4. Entity coverage policy (per culture)
**Decision**: depth over breadth, but every culture gets the *same structural
coverage* so the site feels consistent:
- cosmology + creation (with variants where they exist)
- primordial / first-generation beings
- the major gods (the "big names" a visitor would search)
- a representative sample of lesser gods & nature spirits
- monsters
- heroes (where the tradition has them)
- sacred locations & divine realms
- important objects (weapons, regalia, tokens)
- major myths (the 5–10 signature narratives)
- sources & timeline (source-dated, belief-dated)
**Why**: the brief wants Version 1 to be excellent, not exhaustive. A complete,
well-sourced core that the graph can traverse beats a sparse dump of 200 deities
with three fields each. Adding more entities to a culture later is a pure data
extension (append to `entities.json` + relationships) — no schema change.

## 5. Separation of fact / interpretation / later tradition / pop culture
**Decision**: four content lanes, visually distinct in the UI:
1. **Fact (attested)** — what primary sources say.
2. **Interpretation** — scholarly reading of what it might mean (labeled
   "scholarly interpretation").
3. **Later tradition** — medieval/early-modern or 19th-c. developments (e.g.
   19th-c. Shinbutsu-shūgō syncretism; Romantic Slavic mythography).
4. **Modern pop culture** — Marvel/Anime/games. Only in a clearly separated
   "Modern echoes" box on profile pages, never in the main description.
**Why**: the brief calls this out explicitly (avoid presenting Marvel as
historical mythology; separate fact from interpretation).

## 6. Cultural identity without fragmentation
**Decision**: one design system (docs/DESIGN-SYSTEM.md) with per-culture palette/
texture accents. Same grid, typography, components; different material skins.
**Why**: the brief forbids "six unrelated websites" but requires each mythology to
have its own visual identity. The system handles this via CSS custom properties
per culture (color, texture overlay, accent material, native-script typeface for
headings).

## 7. Comparison without false equivalence
**Decision**: the comparator (Phase 9) shows side-by-side attributes and a
structured verdict: SIMILARITY / DIFFERENCE / HISTORICAL CONNECTION (if known) /
NO KNOWN CONNECTION.
**Why**: the brief forbids claiming two gods are "the same deity" because they
share a domain (the old "thunder-god equation" fallacy). Zeus/Thor/Perun/Susanoo
share the *thunder/storm* domain; there is no attested historical connection
between Norse and Slavic or Japanese traditions. The comparator states exactly
that: shared domain ≠ shared identity, and notes the one real historical
connection where it exists (e.g. Marduk–Bel syncretism within Mesopotamia;
Inanna–Ishtar as a linguistic name merger).

## 8. Source-dating vs belief-dating (the timeline)
**Decision**: the timeline shows two dates per item where possible: when the
*belief/practice* is attested archaeologically (approx., flagged) and when the
*surviving text* was written (exact).
**Why**: the brief calls this out explicitly ("WHEN a source was written is not
WHEN a myth originated"). E.g. the Norse creation myth: belief pre-1000 AD
(archaeological: ship burials, place-names), text 1220–1270 (Snorri, Codex
Regius). We show both, and the gap is the point.

## 9. Adding a new tradition = pure data
**Decision**: a new culture (e.g. Hindu, Celtic, Polynesian) requires only:
- a `/research/<culture>/` dataset in the documented schema
- a culture config entry (palette, native script, creation-tradition list)
- no code changes to components, graph, comparator, search, or timeline.
**Why**: the brief requires the architecture to make this easy. The research
pipeline (this phase) is exactly the per-culture work; the app consumes the
schema generically. The 15 future traditions listed in the brief are drop-in.

## 10. Reference implementation: Japanese first
**Decision**: Japanese is the first culture built end-to-end (Phase 5) because:
- it has a small, well-bounded primary corpus (Kojiki + Nihon Shoki + engi),
  which exercises the variant system (the two texts genuinely disagree),
- its cosmology (Takamagahara / Ashihara / Yomi) is a clean three-tier graph,
- its art record is rich in public-domain ukiyo-e and Met scrolls,
- it has a live-religion dimension, exercising the "religious tradition" labeling
  requirement.
If the system handles Japanese's Kojiki/Nihon Shoki disagreements cleanly, it
handles Egyptian's five creation traditions.

## Status (as of Phase 1 completion)
All six Version-1 datasets are built, validated, and artwork-verified:
- Japanese: 21 entities / 44 relationships / 7 myths / 11 artworks
- Greek: 41 entities / 80 relationships / 11 myths / 20 artworks
- Norse: 40 entities / 71 relationships / 7 myths / 12 artworks
- Egyptian: 25 entities / 44 relationships / 8 myths / 16 artworks
- Slavic: 13 entities / 16 relationships / 5 myths / 5 artworks
- Mesopotamian: 19 entities / 31 relationships / 6 myths / 7 artworks
Total: 169 entities, 256 typed relationships, 44 myths, 71 verified artworks.
Every artwork URL was fetched and confirmed live (HTTP 200) on 2026-09-12;
Wikimedia 429 rate-limits during bulk checks were re-verified individually via
the Commons API (file existence) + direct byte-fetch.
- Slavic is intentionally the smallest and most heavily labeled `reconstructed`
  — that is a feature (honesty), not a gap. It includes real 9th–10th c.
  archaeological objects (the "Oak of Perun" display, Kyiv History Museum) as
  its anchor artifacts, since painted iconography of Slavic gods is a
  19th-century revival, not historical.
- No database yet: static JSON + build-time indexing. Revisit only if content
  outgrows it (it won't for Version 1).
