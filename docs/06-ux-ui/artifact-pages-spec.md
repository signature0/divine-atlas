# UX/UI Spec — Divine Artifacts (The Divine Vault)

> Owner: UX (Hermes, orchestrator) · 2026-09-13 · Implements REQ-017…023, ADR-002.
> Design language: existing DESIGN-SYSTEM.md (dark museum, Cormorant Garamond
> display, Inter body, JetBrains Mono for data/labels, CSS variables from
> `docs/05-brand/tokens.css`). Artifacts must feel like the SAME museum, one
> more wing — "collectible without cheap-game".

## Global rules
- Interpretive content (power profile, rank) is ALWAYS labeled with the mono
  eyebrow "ATLAS POWER PROFILE" / "ATLAS CLASSIFICATION" and a one-line
  "interpretive, not a historical statement" hint on the detail page.
- Image honesty: the detail page shows the artwork's `image_type` badge +
  `image.label` as the figure caption; the card shows a small corner badge
  (e.g. "HISTORICAL ART · c. 950 CE") so a reconstruction is never mistaken
  for an ancient depiction.
- No hover-only information: every hover reveal also exists in the card's
  resting state (on mobile) or is reachable by tap.
- Motion: card filter/sort = CSS grid item fade+rise (150–200ms), image zoom
  on hover max 1.05, no parallax storms. Respect `prefers-reduced-motion`.

## /artifacts — The Divine Vault (REQ-017)
Layout top→bottom:
| # | Section | Purpose |
|---|---|---|
| 1 | Masthead | "The Divine Vault" display title + count ("N relics catalogued") + framing line: objects of the gods, heroes and monsters across six traditions. |
| 2 | Filter bar (sticky) | Primary: culture chips ALL · JAPANESE · NORSE · GREEK · EGYPTIAN · SLAVIC · MESOPOTAMIAN (instant, animated, URL-synced). Secondary row (V1): TYPE select (All types, weapon, armor, jewelry, clothing, sacred object, tool, regalia, vehicle, container, instrument, magical object) + RANK select (All, C…EX) + sort select (FEATURED / A–Z / RANK) + search input (debounce 150ms). |
| 3 | Active-filter line | "Showing 7 of 24 · Japanese · Weapon · Rank S · ×" — chips with clear buttons; empty state = "No relics match — clear filters". |
| 4 | Card grid | Responsive: 1 col (390) → 2 (768) → 3 (1280) → 4 (1920). |

Card anatomy (image-dominant, ~3:4 image area):
```
[ image (lazy)          corner: rank badge (mono, e.g. S)
  bottom gradient: culture accent sliver ]
NAME (display font)          [image-type badge: e.g. ARCHAEOLOGICAL]
native name (small, dim)
JAPANESE · DIVINE SWORD      (mono eyebrow line)
Associated: Susanoo / Amaterasu   (owner line, small)
— one-line ability tease (dim, italic) —
VIEW ARTIFACT →
```
Hover (desktop): image scale 1.05, name brightens, rank badge glows, the
ability tease swaps to the top-2 power attributes as mini bars. Nothing
hidden depends on hover.
Card = `<Link href="/artifacts/[slug]">`. Rank badge colors reuse culture
palette accent (not a rainbow): one neutral gold for S/SS/EX, dim for lower.

URL state (REQ-017): `?culture=&type=&rank=&q=&sort=` — read on mount (server
component can pre-filter for SSR; client re-filters on change without reload).
Implementation note: the page is a server component that renders the FULL
dataset as a compact JSON prop to a client grid component (same pattern as
SearchOverlay) — filtering/sorting/search happen client-side; URL updates via
`router.replace(..., {scroll:false})`.

## /artifacts/[slug] — detail (REQ-018)
Two-column on desktop (sticky attribute rail left ~300px, content right),
single column mobile.
| # | Section | Purpose |
|---|---|---|
| 1 | Hero | Full-bleed image (honesty caption = image.label + image_type badge), name, native name, alt names, culture chip, type, owner, rank badge + tier name, source_confidence badge (HIGH/MEDIUM/LOW with one-line reason). |
| 2 | Attribute rail (sticky) | Culture · Type · Owner (link) · Creator (link) · Period · Material · Status in myth · Rank (tier+letter) · Source confidence. "ATLAS CLASSIFICATION — interpretive" footnote. |
| 3 | Overview | description_short (with [S#] footnotes). |
| 4 | Physical description | `appearance` + `material`, [S#]. |
| 5 | Origin & creation | creation_story + origin_story, creator line. |
| 6 | Abilities | Named ability cards: name · type · description · certainty badge (ATTESTED solid, LIKELY, LATER TRADITION dashed, MODERN INTERPRETATION italic, UNCERTAIN dotted) · [S#]. |
| 7 | Limitations | list, [S#]. |
| 8 | ATLAS POWER PROFILE | Bars (0–10) + per-value `note` under each bar (the "why this number" line). Labeled interpretive. |
| 9 | ATLAS CLASSIFICATION | tier + letter + one paragraph WHY (from rank rationale / uncertainty_notes) + link to methodology. |
| 10 | Myths | linked myth cards (from major_myths + relationships). |
| 11 | Related gods / heroes / monsters | entity chips (from associated_* + graph edges OWNS/CREATED/USED…). |
| 12 | Related artifacts | same-culture + cross-culture artifact chips (shared graph edges or same type). |
| 13 | Historical sources | primary_sources + historical_sources table with [S#]. |
| 14 | Historical artworks | all `artworks` as ArtworkFigure (reuse existing component) with image_type captions. |
| 15 | Uncertainties | uncertainty_notes (dashed-border list, same style as deity pages). |

## /relic — Reveal a Relic (REQ-021)
Server picks a random artifact per request (`?n=` seed optional). One
centered "card reveal": image (fade/scale in), name, owner, culture, type,
rank, ONE power attribute (random from profile), ONE unusual fact
(random from interesting_facts/uncertainty_notes/limitations — whichever
exists). Button: "EXPLORE RELIC →" (link to detail) + "Reveal another"
(re-navigate). No hover dependency.

## Compare (REQ-020)
Extend the existing /compare with an artifact mode (or
`/compare?type=artifact&a=..&b=..`). Table rows: Culture, Owner, Type,
Origin/Creator, Primary function (first ability), Destruction, Defense, Magic,
Range, Durability, Special abilities (names), Major myth, Source confidence,
Atlas rank. Header disclaimer (mono, small): "ATLAS comparison — an
interpretive visualization, not objective historical power levels."

## Deity-page integration (REQ-022)
On `/deity/[id]`, after the relationships section add:
"ARTIFACTS ASSOCIATED WITH <NAME>" — chips (image thumb 40px + name + rank
badge) for artifacts where the entity appears in owner/creator/associated_*
or in OWNS/CREATED/USED/… edges. If none: omit the section (don't show
"none").

## Search (REQ-017/009)
⌘K overlay gains artifact results (kind `relic`, accent-colored): match on
name, native_name, alternative_names, culture, type, category, owner name,
domains/symbols, power labels. Link to `/artifacts/[slug]`.

## Graph (REQ-019)
/graph includes artifact nodes (different node style: square/plate with
image, gold rank glyph). New edge types render with the existing confidence
styling; legend lists the 14 edge types grouped (possession / transfer /
action).
