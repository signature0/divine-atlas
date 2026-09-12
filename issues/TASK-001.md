---
id: TASK-001
title: Relationship graph explorer route (/graph)
type: STORY
status: READY
priority: high
owner: pi
severity:
created: 2026-09-13
updated: 2026-09-13
source: docs/03-requirements/requirements.md
implements: [REQ-006]
depends_on: []
blocks: []
evidence: [app/components/RelationshipGraph.tsx, app/deity/[id]/page.tsx]
qa_result:
---

## Description
Global, cross-culture relationship explorer at `/graph`, with `/graph?from=<id>`
seeding at an entity. The graph component exists and already renders artwork-
portrait nodes (verified on deity-page insets, `bef08be`); this issue is the
route + explorer chrome around it.

## Acceptance Criteria
- [ ] `/graph` loads the full cross-culture graph without console errors
- [ ] Filter controls: relationship type (kinship/conflict/creation/alliance/rule/association), culture
- [ ] Per-node actions: show ancestors / descendants / enemies / myths / entire pantheon
- [ ] Hover on edge shows the one-line `note` + confidence badge (attested/disputed/reconstructed per UX-005)
- [ ] Click node → deity profile page
- [ ] Legend for edge types + confidence styling
- [ ] `validate.mjs` still green; no new console errors on any culture

## Implementation Reference
{commit + files, filled by engineer}

## QA Notes
{filled by QA}
