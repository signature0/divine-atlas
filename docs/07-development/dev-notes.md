# Dev Notes

Engineering decisions and deviations that are worth recording. Newest first.

## 2026-09-13 — TASK-002: story mode (`/myths/[id]`)

### Entity name chips — matching approach
`app/components/StoryProse.tsx` renders narrative prose with entity names as
chips linking to `/deity/[id]`. Matching is per culture, case-sensitive, built
once from `entities.json` **primary `name` fields only** (plus a hyphenated
variant, e.g. "Yamata no Orochi" → "Yamata-no-Orochi"). Boundaries:
`(?<![\p{L}\p{N}-])(name)(?![\p{L}\p{N}])` — a name never chips inside a
longer word, and never as the tail of a hyphenated compound ("Orochi" in
"Yamata-no-Orochi"); possessives ("Izanami's") still chip the name.
Longest names are tried first so "Horus the Elder" wins over "Horus".
`alternative_names` (e.g. "the Sun Goddess", "Jupiter (Roman)") are
deliberately NOT matched — they read as description, not name, and would
produce odd chips.

### Artwork placement (schema gap, not a bug)
The v1 myth schema carries artwork ids at myth level (`Myth.art: string[]`),
with no per-chapter mapping. Story mode distributes figures evenly: the first
artwork is the hero plate under the header (Ken Burns + caption, as on deity
profiles), the rest land after chapter `round(i·(C−1)/(N−1))`, collisions
shifted forward, max one figure per chapter. If per-chapter art ever becomes
a requirement, add `chapters[].art` to the schema rather than heuristics.

### Data fix found while implementing
`data/egyptian/myths.json` (1 myth) and `data/mesopotamian/myths.json` (3
myths) used `{label, text}` for variants instead of the schema's
`{name, description}` (docs/DATA-SCHEMA.md, MythVariant). Their accordions
rendered empty. Fixed the data to match the schema (commit 037df80) rather
than adding a code fallback. Note: 6 of 44 myths have `variants: []` (empty
array, not missing) — accordions are rendered only when non-empty.

### Discoverability (1-line changes, noted for QA)
- Culture page myth cards: CTA now "READ STORY →" linking to `/myths/[id]`
  (previously in-page `#myth-…` anchor; the in-page reader section remains).
- Deity page myth cards: "READ THE STORY →" linking to `/myths/[id]`.

### Verified
`node scripts/validate.mjs` ✓, `npx tsc --noEmit` ✓, `next build` ✓ (all 44
`/myths/[id]` SSG), prod :3002 restarted, DOM-only checks on all 44 pages:
display-type chapter headings, 520 entity chips → correct `/deity/[id]` hrefs,
variant accordions on all 13 myths with variants, per-chapter `[S#]` footnote
chips, uncertainty callout on all 38 myths with `uncertainty_notes`, framing
banners, artwork figures + alt text on the 3 illustrated Japanese myths,
404 for unknown ids.

### BUG-001 — /domain/[domain] routes now use slugs (2026-09-13)
The route param is the domain SLUG (lowercase, hyphenated) via the shared util
`app/lib/domain.ts::domainSlug` — raw strings contain spaces/parens/apostrophes
that prod static-file lookup can't match. `generateStaticParams` emits slugs;
the page resolves the exact raw string back (`domainFromSlug`) so matching stays
`e.domains.includes(raw)`. Slug uniqueness verified 1:1 over the full 320-domain
set (no collisions). Side effect fixed: mixed-case raw domains (e.g. "Izumo")
now resolve — the old lowercase-the-param matching silently 404'd them
(TASK-010's "114 single-word → 200" actually included one such 404).
`scripts/qa-sweep.mjs` now builds `/domain/` routes from slugs with the same
inline slug function — it MUST stay in sync with `app/lib/domain.ts` (the .mjs
sweep can't import the TS util directly).
Build gotcha observed: the first build after this change wrote 207 `__next_error__`
404 shells for multi-slug routes (pattern exactly matching the OLD page logic
applied to new slugs — suspected stale `.next/cache` of the page module). Moving
`.next` aside (`.next-stale-*`) and rebuilding from clean produced 320/320 real
pages. If a future build shows `__next_error__` shells under
`.next/server/app/domain/`, clean-rebuild before debugging the code.
