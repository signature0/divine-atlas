# HANDOFF-011 - Design Critique (TASK-011)

Date: 2026-09-14
From: critic (Hermes, adversarial mode)
To: PO (Gate 7), then Pi + Brand, then QA re-sweep

## What happened
Critique pass vs live prod :3002 (post-QA build). 12 findings: 4 CRITICAL, 4 MAJOR, 4 MINOR.
Full report: docs/09-design-review/design-review-2026-09-14.md
Issues: issues/DES-001 ... issues/DES-012 (CRITICAL/MAJOR = READY, MINOR = medium priority)

## Blocking (Gate 7)
- DES-001 CRITICAL: all 159 /deity pages overflow 1002px at 390px (mobile). Fix verified: minmax(0,1fr).
- DES-002 CRITICAL: no visible search trigger in top nav (IA requires it; only hidden cmd+K works).
- DES-003 CRITICAL: nav missing Stories + Compare vs IA; mobile orphan row (6+2 wrap).
- DES-004 CRITICAL: /graph legend is aria-hidden (violates a11y contract).
- DES-005 MAJOR: culture accent text fails AA (33 contrast fails; worst 3.28:1). Owner: brand.
- DES-006 MAJOR: no skip link. DES-007 MAJOR: home hero pushes H1 below fold at 390px.
- DES-008 MAJOR: 404 misses approved Duat theme; top-heavy void.

## Routing after PO decision
- Pi: DES-001, 002, 003, 004, 006, 007, 008 (all small, DES-001 fix already proven)
- Brand: DES-005 (accent-text tokens)
- QA: re-sweep 159 deity pages @390 + contrast re-audit + /graph axe check
- Critic: retest after fixes; Gate 7 passes at zero CRITICAL/MAJOR open

## Lesson from BUG-001/002 (carried forward)
QA sampled routes did not include a deity page at 390px, so this mobile break passed the
QA gate. Future QA sweeps must include the /deity template at mobile width in baselines.
