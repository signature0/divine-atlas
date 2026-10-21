# V2 PHASE 11 SPEC — PO brief 2026-10-21: relic-card unification, glass UI, full-screen heroes, tag filtering

Repo: current folder (Divine Atlas v2, Next.js **static export** — `output:'export'`, no server runtime; client components + query-string state only). Board items: TASK-024, TASK-026, TASK-027, TASK-028, TASK-029, TASK-030 (partial). Work directly, do NOT run git add/commit.

Ground rules:
- Do NOT touch `public/cards/`, `public/banners/`, `art-generated/`, `data/` JSON content, print PDF pipeline (`scripts/make-pdfs.py`, `scripts/verify-pdfs.py`), or the pantheon duel engine.
- Hydration safety: no `window`/`localStorage`/`URLSearchParams` during initial render — read query state in `useEffect` (this is a static export; prerendered HTML must not depend on it).
- Keep reduced-motion support (`prefers-reduced-motion`) for anything animated.
- All new CSS goes in `app/globals.css` using the existing token system (`:root` custom properties).

## E1 — Relic cards unified with god cards (TASK-024)
`app/components/RelicCard.tsx` currently renders its own "RELIC band" frame; `app/components/DeityCard.tsx` (`.tc*` classes) is the reference design.
- Make relic tiles share the god-card visual system: same outer frame (`.tc` 2.5:3.5 ratio, border, radius, shadow), same art box treatment (`object-fit: cover`, full-bleed), same info-strip layout/typography (name line, native/sub line, culture chip, stat row). Relic-specific bits (type line, rarity) keep their data but adopt the god-card typography and spacing scale.
- Reuse, don't duplicate: extract the shared tile skeleton from DeityCard into a small internal component or shared class set (e.g. `CardTile` shell used by both, or DeityCard's markup with a variant prop — your call, but the two components must share the frame/skeleton code path so future changes stay in sync). Relic accent color may differ per culture, structure must not.
- Detail views: relic detail callout keeps its content but header/typography matches `CardDetailOverlay` conventions.
- Grid density: `/cards` and `/artifacts` grids must render identical tile silhouettes at the same column widths.

## E2 — Full-screen hero banners (TASK-026)
Current `HeroBanner` sits under the fixed top nav (copy gets covered) and centers its copy over the art.
- Every section page's first view = full-screen hero: `min-height: 100svh` (fallback `100vh`), banner art as background (existing WebP resolver), offset below the nav via top padding equal to nav height (or `padding-block-start: env(safe-area-inset-top)` + nav height) so nothing is covered.
- Copy block: LEFT-aligned, max-width 42% of the hero at ≥1024px (clamp with a min readable width ~320px), vertically centered; behind it a soft gradient scrim (linear-gradient from the dark base color at ~85% opacity on the left to transparent at ~55% width) for guaranteed contrast (text ≥ 4.5:1 against the scrim).
- Scroll cue: small animated chevron/cue at bottom center (fade/bounce, disabled under reduced motion), linking to the first content section below.
- Mobile (<768px): copy block becomes full-width with the scrim strengthened to a bottom-up gradient; hero stays 100svh; art must remain visible above the copy.
- Subtle parallax on the banner art (translateY on scroll, max ~40px, `will-change: transform`, disabled under reduced motion) + fade-in-up of the copy on load (~400ms).
- Apply to ALL hero slots: home carousel slides keep their current height (carousel is not a hero) but every page-level hero (culture pages, /cards, /artifacts, /play, /graph, /stories, /compare, /about, /print) becomes full-screen.

## E3 — Apple-style glass buttons (TASK-027)
- Define `.btn` base + `.btn-primary` / `.btn-secondary` in globals.css: translucent background (`color-mix`/`rgba` over the accent for primary, over surface for secondary), `backdrop-filter: blur(14px) saturate(1.4)`, 1px light border (`rgba(255,255,255,.18)` top-lit), soft layered shadow, radius ~14px, comfortable padding, `font-weight` per existing scale.
- States: hover (brighter + lift 1px), pressed (`transform: translateY(1px) scale(.99)`, shadow reduced), focus-visible (2px accent ring, offset 2px). Primary text contrast ≥ 4.5:1 on any banner; secondary ≥ 4.5:1 on surfaces.
- Migrate existing buttons/CTAs site-wide to the two classes (grep for current button classes: hero CTAs, search overlay, filter chips-as-buttons, print page actions, duel play buttons, carousel controls). Chips/toggles may keep their shape but must not look like legacy flat buttons next to the new ones.

## E4 — Glass top nav (TASK-027 cont.)
- `TopNav`: `position: sticky; top: 0`, `backdrop-filter: blur(18px) saturate(1.5)`, semi-transparent bg, 1px bottom border `rgba(255,255,255,.08)`; on scroll >8px add a `.scrolled` class with a slightly more opaque bg + subtle shadow (tiny scroll listener in a client component, passive, no layout thrash).
- Compact: reduce vertical padding so the bar is ≤56px on mobile, ≤60px desktop. Expose nav height as a `--nav-h` token and use it for hero offsets (E2) and `scroll-margin-top` on section anchors.
- Mobile menu sheet: same glass treatment (blur + translucency + border), full-width under the bar. Tab bar (bottom) keeps its current behavior but gets the same blur treatment for consistency.

## E5 — Slavic icon: thunder sign (TASK-028)
PO rejected both the hexagram AND the six-petal rosette. Replace `RosetteIcon` paths in `app/components/icons.tsx` with a **six-spoke Kolovrat-style thunder sign**: six bent spokes (each a short line from an inner ring bending ~60° at the tip, like a stylized sun wheel), inner circle r≈2.2, spokes ending at r≈8.5, stroke-based, viewBox 24, same stroke width as siblings. Rename nothing (keep `RosetteIcon` export name to avoid call-site churn) but add a code comment `<!-- Slavic thunder sign (Kolovrat-style) per PO 2026-10-21 -->`. Must read clearly at 16px and be distinct from `CuneiformStarIcon` (8-point star) and `ThorHammerIcon`.

## E6 — Tag filtering (TASK-029)
Deities have `domains[]`, `symbols[]`, `weapons[]` (see `app/lib/types.ts`, rendered as chips in `CardDetailOverlay`). Treat these as tags.
- Make those chips clickable links to `/cards?tag=<slug>` (URL-encoded). On `/cards`, read `?tag=` in `useEffect` (hydration-safe), filter the deck to deities whose domains/symbols/weapons contain the tag (case-insensitive), show:
  - an active-tag chip with a clear "×" (removes the param, back to full deck),
  - a result count line ("23 gods of thunder" style: `N gods · tag`),
  - empty state with a reset link if nothing matches.
- The tag view must be shareable: opening `/cards?tag=thunder` directly (cold load, prerendered static page) must apply the filter after hydration without a 404 and without hydration mismatch.
- Combine with the existing search box on /cards (search AND tag).
- Add the same tag links from the deity detail overlay's chips (they already exist there) — clicking a chip closes the overlay and navigates.
- Culture accent: when a tag view is active, tint the active chip with the current culture accent if derivable, else gold.

## E7 — Relic ↔ god cross-links (TASK-030 partial)
Artifact JSON has `associated_deities[]` (all 26 relics). In the relic detail callout, render owner names as links to the deity card (`/cards/<id>` opens the overlay — check how existing deity links deep-link). In the deity detail overlay, add a "Relics" section listing artifacts whose `associated_deities` include this deity (build the reverse index in `app/lib/` at build time; static export friendly), each linking to `/artifacts/<slug>`.

## Gates (run them all, fix failures; put outputs in your summary)
1. `npx tsc --noEmit`
2. `npm run build` (expect ~727 pages, export 2/2)
3. `npm run validate`
4. `python3 scripts/verify-pdfs.py` → 29/29 (PDF pipeline untouched)
5. `npm run check:art` → PASS (art gate, art untouched)
6. Headless check (write `scripts/qa-phase11.mjs`, Playwright, chromium executable `/home/mazen/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`, serve `out/` with `npx serve out -l 8903 -s` in background):
   - `/`, `/cards`, `/artifacts`, `/culture/slavic`, `/play` at 1440×900 and 380×780: 0 console errors, 0 failed requests, hero copy block does not intersect the nav bar (bounding-box check), hero min-height ≥ 90% viewport on desktop,
   - `/cards?tag=thunder` cold load: after hydration the result count line is present and the grid is filtered (Zeus/Perun/Indra-style results), clicking × restores full count,
   - relic tile and deity tile on `/cards` share identical computed `aspect-ratio` and `border-radius` (sample two tiles),
   - screenshots to `/tmp/p11-<page>-<w>.png` for every page above.

## Deliverable (final summary)
Per-E: files changed + what; E2 issue→fix notes per page; E6 tag slug list actually used; gate outputs verbatim tail; screenshot paths; known gaps honestly listed.
