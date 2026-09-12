# Requirements — The Divine Atlas

> Owner: PM · Status: draft (retro-derived from shipped behavior) · Updated: 2026-09-13
> Ratification = Gate 2 (PO). Statuses: SHIPPED (code exists) / BACKLOG.

## Functional requirements (REQ)

### REQ-001 — Home page (SHIPPED)
Hero, culture/pantheon cards, DIVINE ARCHETYPES chips, coming-soon culture
list, CTAs. Data: `cultures.json` + derived archetype index.
Evidence: `app/page.tsx`, commit `95b2ebe`.

### REQ-002 — Culture landing (SHIPPED)
Per-culture page with framing banner (living tradition vs historical),
cosmology map, pantheon overview, key myths, sources.
Evidence: `app/culture/[culture]/page.tsx`.

### REQ-003 — Deity profile (SHIPPED)
Cinematic profile for any entity of any culture: description, attributes,
relationship graph inset (2-hop), linked myths, artworks with [S#] footnotes,
uncertainty callouts.
Evidence: `app/deity/[id]/page.tsx`; sample verified in Obsidian milestone log.

### REQ-004 — Pantheon grid + filters (BACKLOG, partial)
Full entity grid per culture, filterable by class/domain. Currently embedded
in the culture landing only.

### REQ-005 — Genealogy + cosmology sub-views (BACKLOG, partial)
Dedicated `/cultures/[id]/genealogy` (layered tree; Egyptian = parallel
traditions) and `/cultures/[id]/cosmology` (clickable realms → entities).
CosmologyMap component exists; dedicated routes do not.

### REQ-006 — Relationship graph explorer (BACKLOG)
`/graph` global, cross-culture. Filters by edge type; actions: show
ancestors/descendants/enemies/myths/entire pantheon; hover = edge explanation;
nodes render entity artwork portraits (done on deity-page inset — `bef08be`).
Component `app/components/RelationshipGraph.tsx` exists; route missing.

### REQ-007 — Story mode (BACKLOG)
`/myths/[id]` scrollytelling: chapters, inline entity chips, variant
accordions, per-chapter source footer. Data ready (`myths.json` chapters).

### REQ-008 — Global timeline (BACKLOG)
Merged `timeline.json` across cultures, era bands, "written ≠ originated"
callout. Data ready (32 events).

### REQ-009 — Global search (BACKLOG, partial)
Command-palette overlay (⌘K) over names/alt-names/domains/symbols.
`app/components/SearchOverlay.tsx` exists; full inverted index per
DATA-SCHEMA "Derived indexes" pending.

### REQ-010 — Sources + methodology (BACKLOG)
`/sources` master bibliography (all [S#] rendered), `/methodology` how
variants/uncertainty/living traditions are handled. Data ready
(`sources.md` × 6).

### REQ-011 — World map (BACKLOG)
Historical-region SVG map → culture links. Data ready (`cultures.json` regions).

### REQ-012 — "Reveal a God" (BACKLOG)
Random entity spotlight weighted by profile completeness. HYPOTHESIS EV-001.

### REQ-013 — Comparator (SHIPPED, basic)
Side-by-side attribute table for 2–4 entities with verdicts
(similarity/difference/connection). No "thunder-god equation": shared domain
≠ shared identity. Evidence: `app/compare/`, `app/components/CompareWidget.tsx`.

### REQ-014 — Domain pages (SHIPPED)
`/domain/[domain]` — cross-culture listing for a domain (e.g. thunder).
Evidence: `app/domain/[domain]/page.tsx`.

### REQ-015 — Variant preservation (SHIPPED, data-level)
Conflicting sources never silently merged: `uncertainties.json`, edge
`confidence` + `explanation`, entity `uncertainty_notes`, Egyptian parallel
creation traditions. Evidence: `research/MYTHOLOGY-MODEL.md` §2.

### REQ-016 — Cultural framing (SHIPPED)
`framing` field drives banner text: Japanese = living religious tradition,
Slavic = reconstructed tradition, etc. Evidence: `cultures.json`,
`app/components/FramingBanner.tsx`.

## Technical requirements (TECH)

### TECH-001 — Content pipeline (SHIPPED)
`research/<c>/*.json` → `integrate.mjs` → `data/<c>/*.json`. Research dir is
the permanent audit trail, never deleted. Evidence: `scripts/integrate.mjs`,
commit `e8e633b`.

### TECH-002 — Data validation gate (SHIPPED)
`node scripts/validate.mjs`: JSON parses, relationship endpoints exist, every
[S#] resolves in that culture's `sources.md`, artwork licenses recorded,
id uniqueness. Currently GREEN (ran 2026-09-13, "✓ no errors").

### TECH-003 — Accessibility + responsive (BACKLOG)
WCAG 2.1 AA target: axe audit, keyboard nav, focus management, reduced-motion.
Responsive already partial (mobile top bar per IA doc).

### TECH-004 — Per-culture theming (SHIPPED)
CSS variables per culture (palette + native-script font), "one museum, many
galleries": chrome identical, palette/texture change. Evidence:
`docs/DESIGN-SYSTEM.md`, `cultures.json` palettes.

### TECH-005 — Artwork licensing integrity (SHIPPED)
Every artwork: license field, source_url (verified), copyright_notes, alt text.
Local mirroring only when licensing ambiguous; never scraping. Evidence:
DATA-SCHEMA artwork schema, `6e99aad` backfill.

### TECH-006 — Build & run (SHIPPED)
Next.js 15 App Router, React 19, TypeScript, port 3002, static JSON (no DB).
Evidence: `package.json`, ADR-001.

## UX requirements (UX)

### UX-001 — Museum-editorial aesthetic (SHIPPED)
Dark archival look, Cormorant Garamond display / Inter body / JetBrains Mono
for citations. NOT a fantasy game, NOT Wikipedia. Evidence: DESIGN-SYSTEM.md.

### UX-002 — Consistency over novelty (SHIPPED)
Identical grid/type scale/nav anatomy everywhere; only palette + texture
accents change per culture. Evidence: DESIGN-SYSTEM.md §"Two hard rules".

### UX-003 — Restraint in motion (SHIPPED)
Motion for wayfinding and reveal only, never decoration. Evidence:
DESIGN-SYSTEM.md.

### UX-004 — Citation legibility (SHIPPED)
[S#] rendered as mono catalogue-style footnotes resolving per culture
bibliography. Evidence: `app/components/SourceFootnote.tsx`.

### UX-005 — Confidence visualization (SHIPPED)
Edge rendering by confidence: attested = solid, disputed = dashed + ⚠,
reconstructed = dotted + badge. Evidence: DATA-SCHEMA edge semantics.
