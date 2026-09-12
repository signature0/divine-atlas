# THE DIVINE ATLAS — DESIGN SYSTEM
Phase 4 document. One museum, many galleries. Consistent system, per-culture identity.

## Design intent
A dark, archival, museum-editorial interface. Think: British Museum high-end
exhibition + ancient manuscript + modern data-viz codex. NOT a fantasy game.
NOT Wikipedia. Subtle, cinematic motion.

Two hard rules:
1. **Consistency over novelty.** Grid, type scale, nav, and component anatomy are
   identical everywhere. Only palette + texture accents change per culture.
2. **Restraint.** Motion is for wayfinding and reveal, never decoration-for-its-own-sake.

## Type system
- **Display (headlines, deity names):** a high-contrast serif with an editorial,
  almost epigraphic feel. Default: `Cormorant Garamond` (or `Fraunces`).
- **Body / UI:** a clean humanist sans. Default: `Inter` / `Instrument Sans`.
- **Native script:** `Noto Serif` (Greek/Coptic/Slavic), `Noto Sans JP` (Japanese),
  `Noto Sans` fallback. Always load the script a culture actually uses.
- **Mono (dates, source refs, [S#]):** `JetBrains Mono` — gives the "catalogue
  accession number" feel to citations.

Type scale (rem, fluid via `clamp`):
- Display XL 4.5–7rem (hero, deity name)
- Display L 2.5–3.5rem
- H1 2–2.5rem
- H2 1.5rem
- H3 1.125rem
- Body 1rem / 1.0625rem
- Small 0.875rem
- Caption/mono 0.75rem

## Global color tokens (dark base)
```
--bg-0:   #0b0b0e   /* page */
--bg-1:   #111116   /* raised */
--bg-2:   #17171e   /* card */
--ink-0:  #ece7dd   /* primary text (warm off-white, not pure white) */
--ink-1:  #b7b2a6   /* secondary */
--ink-2:  #7c7869   /* muted */
--line:   #26262e   /* hairlines */
--accent: per-culture (below)
--accent-2: per-culture
--gold:   #c8a24a   /* the universal "divine" highlight, used sparingly */
```
Base is a warm near-black, not a cool blue-black — reads as aged paper in the dark.
Hairline borders (1px `--line`) do most of the structure; we avoid heavy shadows.

## Per-culture palettes (the "gallery" accents)
Each culture sets `--accent`, `--accent-2`, a surface tint, and a texture motif.
Chosen to be *distinct* but all sit comfortably on the same dark base.

| Culture | accent | accent-2 | surface tint | material / texture motif |
|---|---|---|---|---|
| Greek | `#c9a227` bronze-gold | `#7d8ca3` marble-blue-grey | `#14151a` | marble, bronze, black-figure pottery band |
| Norse | `#5b8db8` iron-blue | `#b5654a` ember | `#12141a` | runic, iron, snow, fire; carved-timber grain |
| Japanese | `#c0392b` vermilion | `#c9a227` gold-leaf | `#131114` | washi, sumi ink, gold leaf; ukiyo-e wave |
| Egyptian | `#c8a24a` gold | `#2f7f7a` lapis/turquoise | `#14130f` | sandstone, papyrus, lapis, turquoise |
| Slavic | `#8a9a5b` forest-olive | `#b5654a` hearth-fire | `#12140f` | dark forest, wood-carving, embroidery band, fire |
| Mesopotamian | `#3f7ca6` lapis | `#b08d57` clay | `#131312` | clay, cuneiform, lapis, stone relief |

Texture application (subtle, low-opacity, background only):
- A faint full-bleed texture per culture (e.g. Japanese = washi grain; Egyptian =
  papyrus fiber; Norse = timber grain; Greek = marble veining) at ~4–7% opacity.
- A thin "material band" divider under section headers (e.g. Greek black-figure
  meander, Slavic embroidery stripe, Mesopotamian cuneiform ticks) — 6–10px tall.
These are CSS/SVG, generated or hand-authored, never photographic noise.

## Grid & layout
- Container max-width 1280px, fluid gutters.
- 12-column baseline grid; deity profile uses a 12-col with a sticky 4-col
  "attribute rail" on desktop.
- Section rhythm: generous vertical spacing (96–160px between major sections).
- Cards: 1px hairline border, 4–6px radius (sharp, archival — NOT the 24px app look),
  bg `--bg-2`, no heavy shadow. Hover: 1px accent border + subtle lift (2px).

## Component inventory
1. **CultureCard** — name, native label, framing tag, accent band, "Explore →".
2. **EntityCard** — small art thumb (or monogram seal), name, native name, class chip,
   1-line domain, hover → short description.
3. **AttributeRail** (profile) — Culture / Group / Domains / Symbols / Weapons /
   Sacred objects / Realms as labeled rows with mono captions.
4. **RelationshipGraph** — React Flow canvas; node = entity (art or seal),
   edge = typed relationship (color + dash by `confidence`). Legend panel.
   Controls: type filter chips (Family/Marriage/Creation/Conflict/Alliance/Domain/
   Myth), "Show ancestors / descendants / enemies / myths / entire pantheon",
   zoom/pan, click node → profile.
5. **GenealogyTree** — layered (primordial → … → current), horizontal scroll on
   desktop; Egyptian = tabbed parallel traditions.
6. **CosmologyMap** — positioned realm boxes over a canvas; click realm →
   associated entities; hover → description.
7. **StoryReader** (story mode) — full-bleed art, chapter headings, inline entity
   chips (clickable), variant accordions, per-chapter source footnote.
8. **CompareGrid** — 2–4 entity columns; attribute rows; verdict badges
   (SIMILARITY / DIFFERENCE / HISTORICAL CONNECTION / NO KNOWN CONNECTION).
9. **WorldMap** — SVG map with historical region overlays (not modern borders);
   click region → culture.
10. **Timeline** — horizontal scroll, era bands, kind-coded markers, the
    "written ≠ originated" callout.
11. **SearchOverlay** (⌘K) — command palette; faceted results.
12. **RandomGod** — flip card; art, name, culture, one fact, "Reveal another".
13. **SourceFootnote** — renders `[S#]` as a hoverable citation → source card.
14. **FramingBanner** — the living-tradition / reconstruction notice.
15. **VariantCallout** — "Scholars disagree" panel listing positions.

## Relationship edge styling (consistent everywhere)
- Family: `--gold` solid.
- Marriage/Partner: `#c084a8` solid.
- Creation: `#7fae8b` solid.
- Conflict (KILLED/FOUGHT): `#c0574a` solid.
- Alliance: `#6f9fc0` solid.
- Association/Rules/Successor: `#8a8577` solid.
- `confidence: disputed` → dashed. `reconstructed` → dotted + "reconstructed" label.
Direction shown by a subtle arrowhead; symmetric relations (sibling/partner/ally)
render as undirected.

## Motion
- Page transitions: 200ms fade + 8px rise on route change.
- Deity profile hero: slow 6% Ken Burns on the artwork (disabled in reduced-motion).
- Graph: nodes ease into place (300ms), edges draw on.
- Scroll reveals: 16px rise + fade, once, IntersectionObserver.
- "Reveal a God": 500ms 3D flip.
- All motion gated behind `prefers-reduced-motion: reduce`.
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) for reveals.

## Imagery & licensing
- Prefer public-domain / open-access originals from museum open-access programs.
- Remote `image_url` when licensing is clear (Met Open Access CDN, Rijks CC0);
  otherwise link `source_url`.
- `loading="lazy"`, `decoding="async"`, explicit width/height to avoid CLS.
- Every image: descriptive `alt` from data; attribution caption (title, artist,
  date, museum, license) always visible on hover and in an a11y caption.
- NO copyrighted contemporary art. NO scraped images.

## Accessibility (summary; full targets in INFORMATION-ARCHITECTURE.md)
- AA contrast (warm off-white on near-black clears 7:1 for body).
- Color never the sole signal: edge types have icons + dash patterns + labels.
- Full keyboard graph navigation (arrow keys + Enter) with a visible focus ring.
- Skip link; landmarks (nav/main/aside); focus-visible accent outline.
- Reduced-motion honored globally.
- Graph + map provide a text/list fallback (linear, back/next) for screen readers.

## Tailwind / tokens
Design tokens live in `tailwind.config` + a `globals.css` that maps the per-culture
palette into CSS variables scoped by a `[data-culture="japanese"]` attribute on
`<html>`. Components reference `var(--accent)` etc., never hardcode hex, so the
per-culture theming is a one-line data attribute swap. This is the mechanism that
keeps six cultures from becoming "six different websites."
