# V2 PHASE 10 SPEC — poker-ratio card tiles, desktop pass, Slavic icon, temp banners

Repo: current folder (Divine Atlas v2, Next.js static export). Work directly, do NOT run git add/commit.

## D1 — Card tiles at standard playing-card size (poker 2.5:3.5)
This site will become a real card game; on-screen tiles must read as poker cards (63.5×88.9 mm = 2.5:3.5, same trim the print PDFs already use in scripts/make-pdfs.py).

- In app/globals.css the tile `.tc` (app/components/CardTile.tsx) currently sizes itself by content: `.tc-art` is a 5:7 art box with a text strip below, so the whole tile is TALLER than 2.5:3.5. Make the WHOLE tile exactly `aspect-ratio: 2.5 / 3.5` (the existing `--tc-ratio` token) with `overflow: hidden`, and lay out inside it: art box on top (flex-grow, object-fit cover, min-height 0), compact info strip below (name, native name, culture chip, PWR/GRD stats) that must fit without clipping at the smallest rendered size (2-col grid at 380px ≈ 170px wide). Reduce paddings/font-sizes inside the tile as needed (em-based sizes already scale with .tc-sm/.tc-md/.tc-lg).
- Apply the same 2.5:3.5 outer ratio to relic tiles `.rc` (app/components/RelicCard.tsx) so all game-card grids share one silhouette.
- Grids: on /cards and /artifacts grids, cap column width (e.g. `grid-template-columns: repeat(auto-fill, minmax(150px, 190px))` or equivalent to the existing grid classes) so cards never render as oversized posters on desktop — a card should look roughly credit-card-like, not billboard-like.
- Do NOT touch: print PDF pipeline (scripts/make-pdfs.py), card detail overlay (.cd-hero), card backs (.tc-back), How-to-Play.
- Keep hydration-safety (no window/localStorage during render) and existing focus/hover states.

## D2 — Desktop (1440px) UI pass
Audit the built pages at 1440px and FIX concrete problems you find (evidence in your final summary: page → issue → fix):
- container widths / max-width consistency between pages (home vs /cards vs /print vs culture pages should share the same content measure)
- hero banner text block placement and vertical rhythm at desktop
- grid alignment: consistent gutters, no orphan last-row stretches, cards page vs artifacts page density
- TopNav + footer alignment with content container; tab-bar hidden at desktop
- /print page list layout at desktop (two-column where sensible)
- any horizontal overflow at 1440 and at 1024
Fix CSS in app/globals.css (and component classNames only where needed). No redesign — alignment/consistency only.

## D3 — Slavic icon replacement
app/components/icons.tsx `RosetteIcon` (used as the Slavic culture icon via cultureIcons.slavic) is currently TWO OVERLAPPING TRIANGLES — it reads as a hexagram/Star-of-David, which is wrong for Slavic. Replace its paths with a proper six-petal rosette (fern-flower motif): six ellipse-petals arranged around center (rotate each 60° via transform in the path data or <g transform>), plus a small center circle. Keep the component name RosetteIcon, keep IconProps/Base usage, keep stroke style consistent with sibling icons (viewBox 24, stroke-based). It must be visually distinct from CuneiformStarIcon (8-point star) at 16px. Verify it renders in TopNav, culture pages, HeroBanner backdrop (they all consume cultureIcons.slavic — no call-site changes needed unless a call-site hardcodes the old triangles).

## D4 — Temporary hero banners (all 19 slots)
HeroBanner falls back to a CSS backdrop because public/banners/ is empty. Create `scripts/make-temp-banners.py` (Pillow — already installed) that generates ALL slots as 2016×864 PNGs into public/banners/:
- slots: page-greek, page-norse, page-egyptian, page-slavic, page-japanese, page-mesopotamian, page-cards, page-relics, page-play, page-graph, page-stories, page-compare, page-about, page-print, home-slide-cards, home-slide-relics, home-slide-game, home-slide-graph, home-slide-stories
- style: intentional "art-directed placeholder", NOT flat color. Recipe: near-black base (#0b0e14), diagonal accent gradient using the section's palette (mirror BANNER_VARIANTS accents in app/components/HeroBanner.tsx), a large low-opacity geometric motif per culture (e.g. greek: meander band; norse: knotwork-ish interlace lines; egyptian: horizon disk + rays; slavic: six-petal rosettes tiled; japanese: overlapping arcs/seigaiha; mesopotamian: cuneiform-ish wedge grid; section pages: their glyph shapes), subtle film grain, strong vignette, and a thin bottom rule in the accent. Keep it abstract — NO text, NO faces (real art comes later; these are temporary but must look good).
- Deterministic (fixed seed), idempotent, <2 MB per file, PNG.
- After generation, `resolveBannerSlot()` picks them up at build time automatically — do not change banner-slot.ts.

## Gates (all must pass; run them, fix failures)
1. `npx tsc --noEmit`
2. `npm run build` (727 pages, export 2/2)
3. `npm run validate`
4. `python3 scripts/make-temp-banners.py` then `ls public/banners/*.png | wc -l` = 19 and every file < 2 MB
5. `python3 scripts/verify-pdfs.py` (must stay 29/29 — D1 must not touch PDFs)

## Deliverable (final summary)
Per-D: what changed (files), D2 issue→fix list, D3 before/after icon path description, D4 file list + sizes, gate outputs. Known gaps honestly listed.
