# ADR-002 — Artifact system: data model & integration

- **Status:** Proposed → (ratified at Gate 2 addendum with the PO)
- **Date:** 2026-09-13
- **Deciders:** Orchestrator (Hermes), ratification PO (Mazen)
- **Context:** The PO commissioned a DIVINE ARTIFACTS / RELICS section (the "Divine
  Vault") covering sacred objects across all six cultures: weapons, regalia,
  jewelry, vehicles, ritual objects, etc. The existing architecture (ADR-001)
  is static JSON per culture, graph-first, sourced by default. Artifacts must
  extend that system, not fork it.

## Decision
Artifacts are a **new node type in the same graph**, stored per culture in
`data/<culture>/artifacts.json` + `artifact_artworks.json`, following ADR-001
(static JSON, no DB/CMS).

### Storage layout
```
data/<culture>/
  artifacts.json          # Artifact[] (new)
  artifact_artworks.json  # Artwork[] reusing the Artwork schema (new)
  sources.md              # [S#] refs extended to cover artifact sources
```
A culture with no artifacts yet simply omits the files; `loadCulture` treats
both as optional (empty arrays). No other data file changes shape.

### Artifact node type
- Artifact ids reuse the culture-prefixed id convention (`nor-mjolnir`) and are
  **global graph nodes**: they appear in the /graph explorer, /search, and
  cross-link with entities.
- The `Relationship` type gains edge types: OWNS, CREATED (already exists —
  reused for "dwarf forged hammer"), FORGED (alias of CREATED for clarity in
  UI), FOUND, STOLE, GIFTED, INHERITED, USED, DESTROYED, SEALED, CONTAINS,
  PROTECTS, UNLOCKS, CONTROLS. `confidence` + `sources` semantics unchanged.
- Entity↔artifact links live in `relationships.json` (same file as god edges),
  e.g. `nor-thor OWNS nor-mjolnir` (attested). This makes "view Thor → see
  Mjölnir" and "view Mjölnir → see Thor" the same query in both directions.

### Interpretive fields (the "Atlas layer")
The PO's power profiles, ranks, and ability cards are **editorial
interpretations**, not source data. They are stored on the artifact
(`power_profile[]`, `rank{tier,letter}`, `abilities[]`) and the UI must always
label them "ATLAS POWER PROFILE" / "ATLAS CLASSIFICATION" — never as statements
from the myths. Methodology:
`docs/07-development/artifact-ranking-methodology.md`.
Every ability carries `certainty` (ATTESTED | LIKELY | LATER TRADITION |
MODERN INTERPRETATION | UNCERTAIN). Every artifact carries
`source_confidence` (HIGH | MEDIUM | LOW).

### Image honesty
Each artifact has exactly one `hero_artwork` (card image) + `image{image_type,
label, honesty_note}`. `image_type` ∈ ARCHAEOLOGICAL | HISTORICAL ART |
SCULPTURE | MANUSCRIPT | MODERN RECONSTRUCTION | MODERN ART. The label is
rendered on the card detail ("what you are actually looking at") — a modern
reconstruction is never presented as an ancient depiction.

## Consequences
- `app/lib/types.ts` gains `Artifact`, `PowerAttribute`, `AbilityCard`.
- `app/lib/data.ts` gains artifact loaders/indexes (by slug, by owner, by
  type, by rank) — same lazy-memo pattern as entities.
- `scripts/validate.mjs` gains artifact checks: unique slugs, owner/creator/
  associated ids exist, [S#] resolves, image honesty fields present, power
  values 0–10 integers, rank letter/tier in allowed sets.
- New routes: `/artifacts` (collection), `/artifacts/[slug]` (detail),
  `/relic` (Reveal a Relic). Nav + search + graph + deity pages + compare
  integrate artifacts.
- Adding an artifact = adding one JSON object (+ optionally a relationship
  edge). No code. (PO requirement: "adding a new artifact should require
  adding data, NOT redesigning the site.")

## Alternatives considered
1. **Artifacts as `classification: "object"` entities** — rejected: the
   existing `object` classification is reserved for conceptual objects, and
   artifacts need a much richer schema (power profile, rank, image honesty,
  provenance) that would bloat every entity.
2. **Separate artifact database/endpoint** — rejected by ADR-001 (no DB).
3. **One global artifacts.json** — rejected: breaks the per-culture folder
   convention and makes per-culture source resolution awkward.
