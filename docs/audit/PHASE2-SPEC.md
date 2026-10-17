# Phase 2 spec — Relationship graph redesign (Divine Atlas)

You are implementing Phase 2 of a plan. Rewrite the FULL-ATLAS mode of `app/components/RelationshipGraph.tsx` (the component used at `/graph` when no `centerId` is given, in the "Relationships" tab of `app/graph/GraphExplorer.tsx`). Keep the centered-ring mode (used on deity pages) working exactly as today. Keep `GenealogyGraph.tsx` untouched.

## Hard constraints
- Next.js 15 **static export** (`output: export`). The component is `'use client'`. SSR/hydration must not mismatch: any layout math using Math.cos/sin MUST be rounded with the existing `r2()` helper (1/100 precision) so Node and browser agree bit-for-bit. Do NOT use `Math.random()` — use the existing seeded PRNG pattern or a deterministic hash of the node id for jitter.
- No new npm dependencies. No canvas — keep SVG (existing artwork `<image>` portraits inside clipped circles must keep working).
- Mobile-first: the graph must be usable at 380px wide. Touch: one-finger drag pans, two-finger pinch zooms (implement with pointer events + `touch-action: none`, tracking two active pointers; zoom about the midpoint). Wheel zoom must zoom about the cursor position (adjust x/y so the point under the cursor stays fixed), not about a fixed origin.
- Respect `prefers-reduced-motion`: skip animated transitions when set.
- Accessibility: SVG keeps `role="group"` + aria-label; every node `<g>` gets `role="link"` `aria-label="<name>, <culture>"` `tabIndex={0}` and Enter/Space activates it; focus ring visible (`outline` via CSS class, not inline).

## Layout algorithm (full-atlas mode) — replace the current grid-of-rings
Deterministic force-directed layout computed in a `useMemo` (pure function of `data` + `cats`), so SSR and client agree:
1. Nodes = all visible entities + artifacts (artifacts get a square-ish node, see visuals).
2. Initial positions: place each culture's nodes in a cluster around a culture anchor. Culture anchors on a circle of radius 300 around (400, 260) in a 800×520 viewBox, ordered by culture name; within a cluster, golden-angle spiral placement (deterministic).
3. Run 120 iterations of a simple force sim (Fruchterman-Reingold style): repulsion between all node pairs (O(n²) is fine at ~180 nodes), spring attraction along visible edges (rest length 60, weaker for cross-culture edges), plus a weak pull (0.02) of each node toward its culture anchor so clusters stay separated. Temperature cools linearly. Round final positions with `r2()`.
4. If `cats` filter changes, recompute (memo dep).

## Visuals
- **Node fill = culture color** (`CULTURE_ACCENTS[culture]`), stroke = `var(--bg-0)` 1.5px. Artifact nodes: same culture color but rendered as a rounded square (rect rx=6) instead of circle, so relics read differently.
- **Node size by importance**: r = 10 + 2.2·sqrt(degree), clamped 10..26 (degree = number of visible edges). Center node in ring mode keeps its current size.
- **Labels**: entity name below node, `font-size` 9 (11 for degree≥8), fill `var(--ink-1)`, with a 3px `var(--bg-0)` stroke halo (`paintOrder: stroke`) for readability over edges. Show labels for degree≥4 OR when zoom k≥1.2 OR when node is hovered/selected — at low zoom the hairball stays readable.
- **Edges**: keep existing category colors/dash patterns. Default opacity 0.35 (was 0.65) so the web reads as background; highlighted edges 0.9.
- **Selection (tap/click a node)**: selected node + its direct neighbors stay full opacity; everything else drops to 0.12 opacity (CSS transition 150ms, skipped under reduced motion). A **detail panel** slides up (bottom sheet on mobile: fixed, max-height 45vh, rounded top corners, drag-down-to-close via pointer; on desktop ≥720px: right-side card, width 280px, absolute inside the canvas container). Panel shows: portrait (artwork image if available, else initials seal), name, culture badge (culture color), classification, domains (first 4), and two buttons: "Open profile" (link to `/deity/<id>` or `/artifacts/<slug>`) and "Center on this" (switches the explorer to centered mode via `router.push('/graph?from='+id)`). Close button (×) and Escape key close it and clear selection.
- **Hover** (pointer devices only, guard with `matchMedia('(hover: hover)')`): highlight incident edges like today.

## Controls (above the canvas)
- Keep the existing category chips.
- Add a **search input** (plain `<input>` styled like `.select-ctl`, placeholder "Find a god or relic…") with a small results dropdown (max 8, same haystack as SearchOverlay: name, native_name, alternative_names, domains). Selecting a result = select+center that node (same as tapping it). Keyboard: ArrowDown/Up move, Enter selects, Escape closes.
- Keep +/−/Reset buttons; Reset re-fits.
- **Fit-to-view**: keep existing `fitToView` behavior on mount and when filters change.
- Zoom clamp 0.3..4.

## What to keep working
- Deity-page inset usage: `<RelationshipGraph data={...} centerId={...} />` ring mode unchanged (including focus chips ancestors/descendants/enemies/myths).
- `GraphExplorer.tsx` culture filter passes filtered data down — unchanged API.
- Edge hover tooltip (the `hover` state + edge label) — keep.
- The linear text fallback for no-JS/`<noscript>` if one exists — keep.

## Verification (you must run these and fix failures)
1. `npx tsc --noEmit` → zero errors.
2. `npm run build` → succeeds (static export).
3. `npm run validate` → no errors.
Do NOT commit. Do NOT touch data/*.json, GenealogyGraph.tsx, or any page outside app/components/RelationshipGraph.tsx (you may add small CSS classes to app/globals.css under a `/* graph v2 */` section).
