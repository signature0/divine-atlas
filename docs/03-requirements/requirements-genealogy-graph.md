# Requirements — Graph Redesign: Genealogy Mode (addendum)

> Owner: PM · Status: proposed → PO directive ratified 2026-09-13 (the "REDESIGN
> THE DIVINE ATLAS GRAPH" message). ADR-003 is the technical contract.
> Scope: /graph explorer only. Relationship/network graph preserved verbatim.

## REQ-GL-001 — Two view modes (MVP, blocker)
- A prominent **VIEW switch: GENEALOGY | RELATIONSHIPS** on /graph.
- **GENEALOGY is the default.** RELATIONSHIPS renders the existing
  RelationshipGraph component, unchanged.
- The user never has to choose relationship filters before seeing the genealogy.
- Acceptance: switching modes swaps the canvas; relationship-mode output is
  byte-identical to pre-redesign behavior (same component, same props).

## REQ-GL-002 — Hierarchical layout (MVP, blocker)
- Top-to-bottom layout; vertical = generation (older at top). No circles, no
  force-directed positioning.
- Layered DAG algorithm (dagre). Multi-parent and cross-links handled.
- Back-edges (cycles) broken and marked "variant", never dropped.
- Acceptance: for each of the 6 traditions, every node's y-position is non-
  decreasing along every forward PARENT_OF edge; zero overlapping node boxes at
  the default fit-to-view zoom.

## REQ-GL-003 — Partner unions (MVP, blocker)
- PARTNER_OF pairs sit horizontally at the same generation.
- Shared children fan out from the union (one child-edge from the bond midpoint),
  not two duplicate parent lines.
- Acceptance: for a union (e.g. CRONUS–RHEA), children ZEUS/HERA/POSEIDON have
  edges whose origin is the bond midpoint; no child edge originates from both
  parents separately.

## REQ-GL-004 — Independent tradition territories (MVP, blocker)
- Each tradition lays out as its own tree. ALL view = six territories on one
  pannable canvas, clearly separated, each with a tradition header.
- No edges between traditions (enforced: layout per culture in isolation).
- Acceptance: in ALL view, zero rendered edges cross a territory boundary.

## REQ-GL-005 — Honest generations (MVP, blocker)
- Generation bands derived from data, never invented. Traditions without real
  genealogy (Slavic: 1/13 parent edges) render a single band + fragmentary caption.
- Acceptance: Slavic view is a single-row pantheon with the honesty caption; no
  fake multi-level tree.

## REQ-GL-006 — Node design + semantic zoom (MVP)
- Node = portrait image + name + entity type. Sized so name is readable at the
  default zoom (min ~11px at 1440px width).
- Zoom tiers: FAR (portrait + major names), MEDIUM (portrait + all names),
  CLOSE (+domain, classification, relationship info).
- Acceptance: at each tier no two visible labels overlap; far zoom shows no
  minor-entity labels.

## REQ-GL-007 — Relationship overlays (MVP)
- Default overlays: PARENTAGE on, MARRIAGE on.
- Optional overlays: CREATION, CONFLICT, ALLIANCE, DOMAIN & RULE, ARTIFACTS.
- Overlays add edges only; they NEVER change node positions.
- Acceptance: node coordinates are identical with and with-each-overlay-on (test
  compares layout coordinates across toggle states).

## REQ-GL-008 — Artifact satellites (MVP)
- Artifacts never occupy a generation row. When ARTIFACTS overlay is on, each
  artifact is a small satellite node attached to its owner deity, side-offset,
  short stub link.
- Acceptance: toggling ARTIFACTS changes only the set of satellite nodes + stubs;
  deity coordinates unchanged.

## REQ-GL-009 — Focus mode (MVP)
- Click a deity → "FOCUS ON THIS DEITY" with options: FULL PANTHEON (default),
  ANCESTORS, DESCENDANTS, SIBLINGS, PARTNERS.
- Focus re-lays-out the subgraph; partners stay horizontally bonded.
- Acceptance: focus on ZEUS shows CRONUS–RHEA bonded above, ZEUS center, children
  below; each option yields an overlap-free layout.

## REQ-GL-010 — Visual quality (MVP, Gate-6 visual regression)
- No overlapping labels, no node collisions, clear hierarchy, readable reading
  order, artifacts visually subordinate to gods, ≤2 relationship categories on by
  default.
- Acceptance: Playwright bbox-overlap audit across all 6 single views + ALL view +
  3 focus states = 0 intersections; screenshots vision-verified.

## UX-GL-01 — No data loss
- The existing RelationshipGraph file and its behavior must not be modified.
  Verification: `git diff` on app/components/RelationshipGraph.tsx = empty.
