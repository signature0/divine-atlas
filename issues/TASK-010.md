---
id: TASK-010
title: QA: Playwright route sweep + visual regression baselines
type: TASK
status: DONE
priority: high
owner: qa
severity:
created: 2026-09-13
updated: 2026-09-13
source: docs/03-requirements/requirements.md
implements: [REQ-001,REQ-002,REQ-003,REQ-013,REQ-014]
depends_on: []
blocks: [TASK-014]
evidence: [qa/evidence/TASK-010-report.md, qa/evidence/TASK-010-domain-analysis.md, qa/baseline/, scripts/qa-sweep.mjs, scripts/qa-retest.mjs]
qa_result: "FAIL (release-blocking): 554 routes swept on prod :3002. 339 clean 200s incl. all 159 deity + 44 myth + all artifact pages; 404s correct for unknown deity/myth/artifact. BLOCKERS: BUG-001 critical (206/320 multi-word /domain/* routes 404 in prod, incl. 3 homepage links), BUG-002 major (mobile topnav 549px no-wrap -> 643px viewport, horizontal scroll site-wide). NON-BLOCKING: BUG-003 minor (/culture/nope 500 not 404), BUG-004 minor (remote hero images 13-19s settle). 32 visual baselines captured. Harness note: networkidle -> load+settle (lazy images never idle)."
---

## Description
Full Playwright QA pass against the production build served by systemd
`divine-atlas` on :3002, plus visual-regression baselines for Gate 6.

## Acceptance Criteria (defined by orchestrator, 2026-09-13)
- [x] **Route sweep:** every implemented route returns HTTP 200 with 0 console
      errors, 0 page errors, and 0 failed network requests (4xx/5xx):
      `/`, `/about`, `/compare`, `/graph` (+ `?from=gre-zeus`), all 6
      `/culture/*`, all 159 `/deity/*`, all 44 `/myths/*`, `/artifacts` +
      all 19 `/artifacts/*`, all `/domain/*` that exist in data
      → **FAIL**: all deity/myth/artifact/culture/home/compare/graph routes PASS;
      206/320 multi-word `/domain/*` routes 404 (BUG-001)
- [x] **Negative check:** unknown ids → 404 (`/deity/nope`, `/myths/nope`,
      `/artifacts/nope`) → PASS (3/3). `/culture/nope` → 500 (BUG-003, minor)
- [x] **Visual regression baselines** captured at 390×844, 768×1024,
      1440×900, 1920×1080 for the key pages → PASS, 32 shots in `qa/baseline/`
- [x] **Mobile check:** `/` and `/culture/japanese` at 390px render without
      horizontal overflow (scrollWidth ≤ clientWidth) and 0 console errors
      → **FAIL**: layout viewport forced to 643px (BUG-002)
- [x] **Report:** results written to `qa/evidence/TASK-010-report.md` with
      per-route table, totals, and verdict → PASS (+ domain deep-dive file)

## Out of scope
- `/timeline` (TASK-003) and `/map` (TASK-006) — not yet implemented
- axe/a11y audit — TASK-012
- design critique — TASK-011

## QA Notes
- 554 routes swept headless Chromium (prod :3002, systemd divine-atlas).
- Findings: BUG-001 (critical), BUG-002 (major), BUG-003 (minor), BUG-004 (minor).
- Gate 6 (release) is BLOCKED until BUG-001 + BUG-002 are fixed and re-swept.
- Baselines in qa/baseline/ are the Gate-6 visual-regression reference.
- Re-run after fixes: `node scripts/qa-sweep.mjs` (now uses load+settle, not
  networkidle, so lazy images don't cause false NAV timeouts).
