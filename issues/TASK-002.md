---
id: TASK-002
title: Story mode (/myths/[id])
type: STORY
status: READY
priority: high
owner: pi
severity:
created: 2026-09-13
updated: 2026-09-13
source: docs/03-requirements/requirements.md
implements: [REQ-007]
depends_on: []
blocks: []
evidence: [data/greek/myths.json]
qa_result:
---

## Description
Scrollytelling myth pages from `myths.json` (chapters structure already
present). This is the "stories" experience the IA doc defines: narrative
mode, not an encyclopedic entry.

## Acceptance Criteria
- [ ] `/myths/[id]` renders chapters in order with display-type headings
- [ ] Entity names inline as chips linking to deity profiles
- [ ] Variant accordions where `myth.variants` exists (both versions visible)
- [ ] Per-chapter source footnotes ([S#] → culture bibliography)
- [ ] `uncertainty_notes` surfaced as a reader-facing callout
- [ ] Illustrated chapters show artwork figures with alt text (TECH-005)
- [ ] Works for all 44 myths across 6 cultures (spot-check ≥2 per culture)

## Implementation Reference
{commit + files, filled by engineer}

## QA Notes
{filled by QA}
