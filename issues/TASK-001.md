---
id: TASK-001
title: Relationship graph explorer route (/graph)
type: STORY
status: DONE
priority: high
owner: pi
severity:
created: 2026-09-13
updated: 2026-09-13
source: docs/03-requirements/requirements.md
implements: [REQ-006]
depends_on: []
blocks: []
evidence: |
  commit b978f63. Files: app/graph/page.tsx, app/graph/GraphExplorer.tsx, app/components/RelationshipGraph.tsx
  (global mode + focus actions gated on centerId + coordinate rounding), app/lib/data.ts (globalData),
  app/lib/types.ts (GraphData, CULTURE_NAMES, CULTURE_ACCENTS), app/globals.css (.select-ctl),
  app/components/TopNav.tsx (Graph link).
  validate: `node scripts/validate.mjs` -> "✓ no errors" (159 entities / 286 relationships / 44 myths / 175 artworks).
  tsc: `npx tsc --noEmit` clean.
  Playwright (chromium 143.0.7499.2) against dev server :3003 — 0 console errors / 0 page errors on all checks:
  - /graph: 6 culture clusters w/ correct counts (JAPANESE·21, GREEK·41, NORSE·40, EGYPTIAN·25, SLAVIC·13,
    MESOPOTAMIAN·19), 604 svg shapes (159 nodes x2 + 286 edge dots), 572 edge lines, legend, no focus buttons.
  - /graph?from=gre-zeus: 137 nodes / 142 edges, all 5 focus actions, "Centered on Zeus · GREEK" header,
    "return to the full atlas →" link works.
  - /graph?from=slv-perun: 33 nodes / 26 edges (pantheon + allies scope), focus buttons present.
  - /graph?from=does-not-exist: falls back to full atlas, no crash.
  - mobile 390x844 /graph: same content, no errors.
  - interactions: Slavic chip off -> 5 clusters; All chip -> 6; select -> seeds ?from=gre-zeus; Ancestors focus
    142 -> 30 edges; edge hover tooltip shows type + note (+ confidence when not attested); node click ->
    /deity/gre-cronus ("Cronus · The Divine Atlas"); 0 console/page errors across the whole run.
  - regression: /, all 6 /culture/*, /compare, /domain/creation, /about, /deity/jpn-amaterasu, /deity/gre-zeus
    render with 0 console errors and show the new Graph nav link.
  - screenshots: /tmp/atlas-graph-qa/{graph,graph-zeus,graph-perun,graph-badid,graph-mobile,amaterasu,zeus,greek,slavic}.png
  - note: /graph?from reuses the deity-page ring layout (same component). Data has 0 cross-culture
    relationships, so the full atlas legitimately renders as 6 separate culture clusters; no data changed.
  - note: verified in dev mode on :3003. :3002 serves the pre-TASK-001 production build (next start) and was
    left untouched; `next build` was deliberately NOT run so as not to clobber the .next that :3002 serves —
    rebuild + restart before Gate 6 if desired.
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


status REVIEW -> DONE (2026-09-13) — Orchestrator verified: commit b978f63, validate.mjs green, tsc clean, /graph live on prod :3002 (877KB, HTTP 200), Playwright evidence in issue frontmatter
