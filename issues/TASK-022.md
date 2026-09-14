---
id: TASK-022
title: Mobile nav strip: add edge-fade + scroll affordance so the overflow reads as intentional
type: TASK
status: BACKLOG
priority: low
owner: orchestrator
severity: 
created: 2026-09-14
updated: 2026-09-14
source: 2026-09-14 mobile audit (iPhone 14, 390x844) — nav strip is a designed scrollable row (BUG-002/DES-003), not clipped, but with no fade/hint a user may not realize it scrolls ("NORSE" reads as cut off)
implements: [REQ-007]
---

# TASK-022: mobile nav strip scroll affordance

## Context
The 2026-09-14 mobile audit (iPhone 14 @ 390x844) confirmed the top nav is a
working horizontal scroll strip — content 570px in a 342px track,
`overflow-x: auto`, doc does NOT overflow (390=390), and scrolling reveals
MESOPOTAMIAN fully. However the initial state shows "…NOR" at the right edge
with **no fade or hint**, so it can read as a broken/cut-off label.

## Acceptance criteria
- [ ] Right-edge fade on `.topnav .links` at 390px (CSS mask or gradient
      overlay) that disappears when scrolled to the end.
- [ ] Optional: subtle "→" or drag-hint on first visit (disappears after first
      scroll).
- [ ] Re-run mobile check (scripts/mobile-check.mjs) — still 0 overflow, no
      new console errors.
- [ ] No desktop regression (fade only in the ≤768px media query).

## Notes
- File: `app/globals.css` (~line 207 media query) + possibly a small
  `onScroll` in `TopNav.tsx` to toggle a class.
- Not a v1.0.0 blocker — polish item; the site is fully usable as-is.
