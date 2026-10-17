# PHASE 2 (v2) SPEC — Navigation redesign

You are the Phase 2 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 2. Current state: `app/components/TopNav.tsx` is one flat busy link row (Deck, Play, Vault, Graph, Stories, Compare + 6 inline culture links). Rework it per the brief.

## Target structure (exact)
**Primary nav (desktop, in this order):**
1. **Religions** — dropdown/mega-menu listing all six pantheons (Japanese, Greek, Norse, Egyptian, Slavic, Mesopotamian) with their custom icons, linking to `/culture/<id>`.
2. **Relics** → `/artifacts`
3. **Cards** → `/cards`
4. **Search icon** → existing `SearchTrigger` behavior
5. **More** — dropdown with everything else, grouped logically:
   - *Play*: Play (`/play`), How to Play (`/how-to-play`), Dueling Mat (`/how-to-play/board`)
   - *Explore*: Graph (`/graph`), Stories (`/stories`), Compare (`/compare`), Vault (`/artifacts` if Relics label differs — pick ONE canonical label for /artifacts: "Relics"; remove duplicate)
   - *About*: About (`/about`)
   (Adjust groups to the real page list in `app/` — verify with `ls app/`; every route must remain reachable in ≤2 clicks.)

**Active-page highlight:** the top-level item whose section contains the current route is highlighted (e.g. `/deity/egy-amun` highlights Religions; `/cards/gre-chaos` highlights Cards). Use `usePathname()` client-side.

## Custom SVG icon set
New file `app/components/icons.tsx`: one shared `Icon` style — 24×24 viewBox, `stroke="currentColor"`, `fill="none"`, `stroke-width="1.75"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, consistent line style, no fills, no external deps. Icons needed:
- **Religions** (recognizable mythic symbol per pantheon): Japanese = torii gate; Greek = meander/Greek-key column capital or lightning bolt; Norse = Mjölnir silhouette in line style; Egyptian = ankh; Slavic = six-petal rosette/fern flower; Mesopotamian = cuneiform star / ziggurat steps.
- **Nav actions:** Relics = gauntlet/hand holding orb or simple artifact amphora; Cards = two overlapping card rectangles; Play = crossed swords; Graph = node-link cluster; Stories = open scroll/book; Compare = balance scales; Vault = arched vault door; Search = magnifier (match existing SearchTrigger or replace consistently); More = three dots or chevron; Menu = hamburger; Close = X.
Use them in nav, dropdowns, and the mobile bar. Keep each icon ≤ ~15 path nodes — simple line glyphs.

## Mobile (design 380px first)
- Compact header: brand (icon+wordmark), search icon, hamburger. No horizontal overflow at 380px.
- **Bottom tab bar** (fixed, safe-area padded, ≥44px targets): Home, Religions, Relics, Cards, More. "More" opens a slide-up sheet listing the grouped More items + the six religions quick links. Active tab highlighted (icon + label, accent color).
- Dropdowns on desktop: open on click (and keyboard Enter/Space), close on Escape / outside click / route change; `aria-expanded`, `aria-haspopup`, focus returns to trigger. Menus animate with transform/opacity, disabled under `prefers-reduced-motion`.
- Desktop dropdowns must be keyboard navigable (arrow keys optional, Tab order must be sane).

## Constraints
- Static export: client component for interactive nav (it already is — keep `'use client'`), no `searchParams`, hydration-safe (no window reads during render).
- No new npm dependencies. Pure React + CSS in `app/globals.css` (append `.nav-*` / `.tabbar-*` / `.sheet-*` blocks; remove/replace dead `.links` styles carefully — grep for usages first).
- Keep the existing search overlay working (`SearchTrigger`/`SearchOverlay` untouched except icon swap if needed).
- Do NOT touch card components, pages' content, or data files. Only: `TopNav.tsx`, new `icons.tsx`, `globals.css`, and `layout.tsx` ONLY if the tab bar needs a body class/spacer.
- z-index discipline: tab bar and dropdowns must not fight `CardDetailOverlay` or search overlay (check existing z-index scale in globals.css; keep overlays above nav).

## Gates you MUST run and pass
`npx tsc --noEmit && npm run build && npm run validate`
Then a quick self-check with `python3 -m http.server` is NOT required (orchestrator does Playwright), but DO verify in built HTML: every nav icon renders as inline `<svg>` (grep `out/index.html`), no `<img>` icon fonts, and `out/index.html` contains the six culture hrefs inside the Religions menu markup.

Print: files changed, icon list, gate statuses. Do NOT run `git add` or `git commit`.
