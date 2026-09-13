# Requirements — Divine Artifacts / Relics System (addendum)

> Owner: PM (Hermes, orchestrator) · Status: proposed → Gate 2 addendum (PO)
> Updated: 2026-09-13 · Source: PO direction (Divine Vault brief) + ADR-002.

## Functional requirements

### REQ-017 — Artifact collection page `/artifacts` (BACKLOG)
ONE main collection/gallery page — "The Divine Vault". All mythology
artifacts in one responsive card grid; NO per-category landing pages.
- Card: dominant IMAGE (image honesty label visible), NAME (+ native name),
  CULTURE, TYPE, OWNER, ATLAS RANK, a short "strongest abilities" tease.
  Do not overload the card — full info lives on the detail page.
- Primary filter (top, instant, no reload, fast+animated):
  ALL · JAPANESE · NORSE · GREEK · EGYPTIAN · SLAVIC · MESOPOTAMIAN.
- Secondary filters architecturally supported (data model + UI hooks),
  not all exposed in V1: TYPE, POWER, RANK, OWNER. V1 exposes at least TYPE.
- Search within the collection: name/native/alt, culture, type, owner,
  domain, power — immediate results.
- Sort: V1 = FEATURED · A–Z · RANK. Architecture supports Culture, Power,
  Historical significance later.
- URL-persistent filters: `/artifacts?culture=japanese&type=weapon&rank=S&q=…`.
- Hover (desktop only): image subtly enlarges, title emphasized, short power
  info + rank revealed, subtle light/parallax. Mobile: nothing hover-dependent.
- Card visual: luxury trading card / museum label / codex — one coherent
  system with a subtle per-culture accent (Japanese washi/vermilion, Norse
  iron/rune, Greek marble/bronze, Egyptian sandstone/lapis, Slavic
  wood/forest, Mesopotamian clay/lapis). Restrained motion; no cheap-game UI.

### REQ-018 — Artifact detail page `/artifacts/[slug]` (BACKLOG)
Scholarly deep page. Sections: OVERVIEW, ORIGIN, CREATOR, OWNER, PHYSICAL
DESCRIPTION, ABILITIES (named ability cards w/ certainty), LIMITATIONS,
ATLAS POWER PROFILE (bars + per-value notes), ATLAS CLASSIFICATION (tier +
letter, labeled interpretive), MYTHS, RELATED GODS/HEROES/MONSTERS, RELATED
ARTIFACTS, HISTORICAL SOURCES, HISTORICAL ARTWORKS (with image-type labels),
SOURCE CONFIDENCE indicator. Hero image + image honesty note.
Data-driven: adding an artifact = adding JSON, not a new component.

### REQ-019 — Artifact graph integration (BACKLOG)
Artifacts are graph nodes. Edges: OWNS, CREATED, FORGED, FOUND, STOLE,
GIFTED, INHERITED, USED, DESTROYED, SEALED, CONTAINS, PROTECTS, UNLOCKS,
CONTROLS (confidence + sources like all edges). /graph, deity pages, and
artifact pages all show artifact connections both directions.

### REQ-020 — Artifact compare (BACKLOG)
Compare 2–4 artifacts side-by-side: culture, owner, type, origin, primary
function, destructive/defensive capability, magic, range, durability,
special abilities, major myth, source confidence, Atlas rank. Must carry the
"interpretive visualization, not objective historical power" disclaimer.

### REQ-021 — Reveal a Relic (BACKLOG)
`/relic` — random artifact reveal: image, name, owner, culture, type, rank,
one power, one unusual fact → "Explore Relic" link. (HYPOTHESIS EV-xxx)

### REQ-022 — Artifact↔entity cross-links (BACKLOG)
Deity pages show "ARTIFACTS ASSOCIATED WITH <GOD>". Artifact pages show
every god/hero/monster/myth connected. Myths list artifacts involved.

### REQ-023 — Artifact source confidence (BACKLOG, data-level)
Every artifact: HIGH/MEDIUM/LOW + one-line explanation, displayed on card
detail. Critical for Slavic (reconstructed) material.

### REQ-024 — Special collections (LATER)
Curated collections (Weapons of the Gods, Divine Jewelry, Objects of
Creation/Death, Lost Relics, Royal Regalia, Divine Vehicles, Cursed Objects,
The Three Sacred Treasures of Japan, …). V2+; data model must support a
`collections: string[]` tag per artifact from day one.

## Non-functional
- NFR-ART-001: Image honesty — a reconstruction is never shown as an ancient
  depiction; every image carries image_type + label. (PO: "critical.")
- NFR-ART-002: Interpretive labels — power profile & rank are always labeled
  ATLAS (not mythological) statements.
- NFR-ART-003: `validate.mjs` extended for artifacts (ids, [S#], image
  honesty, power 0–10, rank enums) and stays green in CI/dev/build.

## Prototype scope (PO: "first ten exceptionally polished, then expand")
V1 ships 10–15 artifacts: Mjölnir, Gungnir, Brísingamen, Zeus' Thunderbolt,
Aegis, Hades' Helmet, Kusanagi-no-Tsurugi, Yata no Kagami, Yasakani no
Magatama, Tablets of Destiny (+ Draupnir, Gjallarhorn, Skíðblaðnir,
Ame-no-Nuboko, Pandora's jar, Golden Fleece as the research batch allows).
