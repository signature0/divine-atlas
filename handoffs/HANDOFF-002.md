---
from: orchestrator
to: pi
date: 2026-09-13
stage: IMPLEMENTATION
---

# HANDOFF-002: Orchestrator → Pi (TASK-002)

## Completed since HANDOFF-001
- TASK-001 `/graph` route accepted → DONE (verified: validate green, tsc clean, live on prod :3002)
- GenealogyGraph: native-scroll view model committed (75b2ed8) — do not revert; build on it

## Issues you own
- **TASK-002: Story mode (`/myths/[id]`)** — chapters data is ready (see docs/DATA-SCHEMA.md,
  app/lib/data.ts). One issue at a time; commit per issue: `TASK-002: story mode route`.
  Keep `node scripts/validate.mjs` + `npx tsc --noEmit` green; record evidence on the issue.

## SHIPPED invariants your code must keep true (REQ-015/016/UX-001…005)
- variants surfaced, framing banners, mono `[S#]` footnotes, confidence edge styling,
  dark museum aesthetic, restraint in motion

## Next action
Implement TASK-002. Read issues/TASK-002.md acceptance criteria first. On completion:
update the issue frontmatter (evidence block, status → REVIEW) and stop.
