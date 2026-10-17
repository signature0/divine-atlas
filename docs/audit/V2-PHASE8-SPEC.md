# PHASE 8 (v2) SPEC — Footer

You are the Phase 8 worker (branch `atlas-v2-2026-10`). Tiny, precise scope. Read `docs/PLAN.md` §3 Phase 8.

## Deliverable
Site-wide footer in `app/layout.tsx` (renders on EVERY page — verify it's in the root layout, not a page):
- Line 1: **"Design by Mazen Pasha"** (display font, gold accent on the name).
- Line 2: clickable `mailto:maz.basha@gmail.com` (proper `<a href="mailto:…">`, visible email text, not hidden behind an icon-only link).
- Keep/move any existing footer content (the "generated reconstruction" note added in Phase 5 belongs here too if it currently lives only in /about — keep BOTH: detail overlay + footer).
- Style: clean, readable at 380px (≥13px text, centered or stacked), top border matching site line color, generous padding, respects safe-area on mobile (but must NOT sit behind the bottom tab bar — add bottom padding/margin equal to the tab bar height on mobile breakpoints so content is reachable).
- Print CSS: footer hidden or minimal in print (`@media print`).
- No new routes, no JS needed (server-rendered static markup).

## Gates
`npx tsc --noEmit && npm run build && npm run validate`
Verify: `grep -c 'maz.basha@gmail.com' out/index.html out/cards.html out/deity/egy-amun.html` ≥ 1 each; footer present in built HTML of a culture page and the print sheet page too.
Print: diff + gate statuses. Do NOT run `git add` or `git commit`.
