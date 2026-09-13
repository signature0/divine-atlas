# HANDOFF-012 — Gate 7 approved: design fix batch to Pi

**Date:** 2026-09-14 · **From:** Hermes (orchestrator) · **To:** Pi (engineer)
**PO decision:** Gate 7 option 1 — approve critique, route ALL fixes (0 CRITICAL/MAJOR open required before Gate 7 passes).

## Done already (do NOT redo)
- **DES-005 (Brand, REVIEW)**: `--accent-text` / `--accent-2-text` AA tokens added in `app/globals.css`
  (`:root` + all 6 `[data-culture]` palettes) and `data/cultures.json` (`palette.accentText` / `palette.accent2Text`);
  every small-text `var(--accent)`/`var(--accent-2)` usage switched to the `-text` variant;
  `--ink-2` bumped `#7c7869 → #868171`; `.cert-modern_interpretation → #b96e55`,
  `.rel-type.conf-disputed → #c56559`. Docs updated in `docs/DESIGN-SYSTEM.md`.
  **Do not change any `-text` token values or re-route these classes.**

## Your issues (in this order, one at a time)
1. **DES-001 (CRITICAL)** — profile-grid mobile overflow. The verified fix is in the issue's
   Implementation Reference: `@media (max-width:1000px){ .profile-grid{ grid-template-columns: minmax(0,1fr);} }`
   (globals.css:106 currently uses plain `1fr`) + `min-width:0` on grid children. Apply, commit, verify.
2. **DES-002 (CRITICAL)** — add visible search trigger to TopNav (icon + "Search ⌘K" label) opening the
   existing SearchOverlay; focusable, labeled, present in the mobile top bar.
3. **DES-003 (CRITICAL)** — nav per IA: add Compare + Stories to persistent nav; kill the orphan 6+2
   mobile wrap row (compact overflow ≤560px OK); no dead BACKLOG labels (Map/Timeline stay hidden).
4. **DES-004 (CRITICAL)** — /graph legend: remove `aria-hidden` (GenealogyGraph.tsx ~:563), real list
   semantics, edge-category names in edge path aria-labels.
5. **DES-006 (MAJOR)** — skip link in `app/layout.tsx` (CSS `.skip-link` already exists in globals.css —
   just add the anchor to #main).
6. **DES-007 (MAJOR)** — hero: collapse top padding at ≤560px so H1 + lede are above the fold @390x844.
7. **DES-008 (MAJOR)** — 404 in-world rewrite ("lost tablet in the Duat"): no "Version 1:",
   1–2 in-world cues (tablet/inscription motif, ankh/djed, ochre undertone), footer grounded.

## Rules
- Read `issues/DES-00x.md` before each; use tokens (never new hardcoded colors — if you need accent
  text use `var(--accent-text)`; non-text uses keep `var(--accent)`).
- Commit per issue: `DES-00x: <summary>`; set frontmatter status REVIEW with evidence paths.
- Run `npx tsc --noEmit` + `npm run lint` before each commit.
- The site is served from :3002 (prod build) — do NOT rebuild :3002 yourself; orchestrator rebuilds
  once after the batch, then QA sweeps.
