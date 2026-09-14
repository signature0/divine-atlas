# HANDOFF-013 — Gate 7 batch 2: four MINOR design fixes to Pi

**Date:** 2026-09-14 · **From:** Hermes (orchestrator) · **To:** Pi (engineer)
**Context:** Batch 1 (DES-001/2/3/4/6/7/8 + DES-005) is **DONE** — QA passed on prod :3002
(gate7-resweep 2026-09-14T07:09Z, 11/11, evidence `qa/evidence/GATE7-resweep-2026-09-14T07-09-18-533Z.json`).
This is the remaining minor batch from the same design review.

## Your issues (in this order, one at a time)
1. **DES-009 (MINOR)** — home "Coming soon" expansion section breaks the in-world voice on the
   front door. Implementation reference: move it to /about; keep at most a one-line in-world
   mention on home.
2. **DES-010 (MINOR)** — Vault (/artifacts) header leaves a large void before the filter bar at
   desktop. Reduce header padding; consider merging the disclaimer line into the filter bar.
3. **DES-011 (MINOR)** — deity relationship lists repeat identical notes (reads as filler).
   Group same-type + same-note rows together, or enrich the notes in the relevant
   `data/<culture>/relationships.json` — prefer grouping over inventing content.
4. **DES-012 (MINOR)** — Vault rank badge colors read as a random rainbow; 7/19 remote images
   failed. One gold/neutral badge color for rank (token, not hardcoded); make
   `.vault-card-seal` fallback robust on image error (letter-seal must always render).

## Rules
- Read `issues/DES-00x.md` before each. Use design tokens (docs/DESIGN-SYSTEM.md) — never new
  hardcoded colors. Do NOT touch the `-text`/`-badge-text` token values or their current usages
  (DES-005 is closed and AA-verified).
- Commit per issue: `DES-00x: <summary>`; set issue frontmatter `status: REVIEW` with evidence paths.
- Run `npx tsc --noEmit` before each commit.
- :3002 serves the prod build — verify on a dev port (`npx next dev -p 3100`), do NOT rebuild
  :3002 yourself; the orchestrator rebuilds once after the batch, then runs the QA sweep
  (`node scripts/gate7-resweep.mjs` + `node scripts/qa-sweep-light.mjs`).
