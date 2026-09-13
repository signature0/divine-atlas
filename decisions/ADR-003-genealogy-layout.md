# ADR-003 — Genealogy layout engine (hierarchical view)

> Status: ACCEPTED (2026-09-13) · Owner: PM/Orchestrator · PO directive: "REDESIGN THE
> DIVINE ATLAS GRAPH" — two graph modes, genealogy as default.
> Supersedes: nothing. Complements: ADR-001 (static JSON content model), ADR-002
> (artifact system). The existing relationship/network graph (RelationshipGraph.tsx)
> is PRESERVED untouched — this adds a second, independent layout system over the
> same relationship data.

## Context
The /graph explorer is a single force/ring-directed SVG graph. For a museum-quality
genealogy it is chaotic: circular layout, label collisions, no reading order,
artifacts competing with gods. PO wants a **top-to-bottom hierarchical genealogy**
as the DEFAULT view, with the old graph demoted to a secondary "RELATIONSHIPS"
view.

## Data findings that constrain the design (measured 2026-09-13)
| culture | ents | PARENT_OF | PARTNER_OF | roots | multi-parent | max-depth | cycles |
|---|---|---|---|---|---|---|---|
| japanese | 21 | 14 | 5 | 14 | 6 | 3 | 0 |
| greek | 41 | 34 | 15 | 23 | 12 | 4 | 1 (Heracles↔Zeus) |
| norse | 40 | 32 | 9 | 21 | 11 | 4 | 0 |
| egyptian | 25 | 15 | 4 | 18 | 7 | 3 | 0 |
| slavic | 13 | 1 | 1 | 12 | 0 | 1 | 0 |
| mesopotamian | 19 | 11 | 8 | 12 | 4 | 3 | 0 |

Consequences:
1. **Cycles exist** (Greek). A layered layout cannot render a cycle. → Break back-edges,
   mark them visually (dashed + "variant" label), never silently drop.
2. **Multi-parent is common** (11-12 per tradition). → Children attach to a *union*
   of their parents, not a single parent, to avoid duplicate ugly parent lines.
3. **Slavic is nearly flat** (12/13 roots). → Must render as an honest single-generation
   pantheon row, NOT a fabricated tree. "Do not force traditions into generations."
4. **Many roots** per tradition (14-23). Roots are not all the same "primordial"
   tier — they are entities with no recorded parent (often because the source is
   fragmentary). They are grouped by *classification* (primordial / deity / …) into
   generation bands, never merged across traditions.
5. Entity `classification` values in data are richer than the TS union
   (mortal, giant, creature, trickster). → Render raw strings; do not type-narrow.

## Decision
Add a **hierarchical (layered/Sugiyama) genealogy layout** as the default view,
implemented with **`@dagrejs/dagre`** (pure-JS, runs client-side, no server/SSR
layout needed).

### Why dagre (and not the alternatives)
- **ELK** — heavier, needs a layouter bootstrap, overkill for ~159 nodes; dagre
  gives the same layered result with zero config ceremony.
- **d3-hierarchy** — wrong tool: it lays out strict single-parent trees (a node has
  exactly one parent). Mythology is a DAG (multi-parent, cross-links). dagre is a
  general DAG layerer.
- **d3-force / current ring** — rejected by PO: circular, chaotic, no hierarchy.
- **dagre** — purpose-built layered DAG layout: assigns each node a layer (rank),
  orders within a layer to minimize edge crossings, positions with spacing. It
  handles multi-parent and back-edges (via `acyclicize`). Small, MIT-licensed.

### Layout model
- **Vertical axis = generation (layer).** Rank 0 = oldest (primordial) at top,
  increasing downward. Rank is derived from the PARENT_OF DAG (longest-path from a
  root), so a node with two parents sits one generation below its *deeper* parent.
- **Horizontal = position within a generation.** dagre orders siblings; partner
  pairs are *adjacently ordered* (see below) so unions read left-to-right.
- **Independent territories per tradition.** When ALL is selected, each culture's
  genealogy is laid out as its OWN dagre instance, then the six trees are arranged
  on one large pannable canvas in a clean grid, separated by generous gutters and a
  tradition header. **No edges ever cross between traditions** — this is enforced by
  laying each culture out in isolation.
- **Partners (unions).** A `PARTNER_OF` pair is rendered as a HORIZONTAL bond at the
  same generation. Their shared children attach to the *union* (a single child-edge
  fans out from the midpoint of the partner bond, not two separate lines from each
  parent). This is the core visual rule the PO specified.
- **Artifacts = satellites, NOT in the hierarchy.** An artifact never occupies a
  generation row. When the ARTIFACTS overlay is on, each artifact renders as a small
  satellite node hanging off its owner deity (offset to the side), linked by a short
  stub. Toggling artifacts changes nothing about deity positions.
- **Overlays never move nodes.** Node positions come ONLY from the genealogy DAG.
  CONFLICT / ALLIANCE / CREATION / DOMAIN overlays are drawn as additional edges on
  top of the stable layout. Toggling them never re-runs the layout.

### Semantic zoom (3 tiers, driven by the current zoom scale k)
- **FAR (k < ~0.9):** portrait disc + name only for "major" deities (classification
  primordial/deity); minor/monster/hero/realm shown as small unlabeled discs.
- **MEDIUM (~0.9–1.6):** portrait + name for all entities.
- **CLOSE (> 1.6):** portrait + name + classification pill + domain line + small
  relationship count.
Thresholds are computed so labels fade in smoothly; no labels overlap at any tier
because node boxes are sized to the CLOSE tier (the largest) — zooming out only
*removes* detail, it never packs nodes closer.

### Focus mode
Clicking a deity in genealogy mode offers **FOCUS ON THIS DEITY**, which re-lays-out
a subgraph (fresh dagre run) containing the deity plus a chosen relation set:
ANCESTORS / DESCENDANTS / SIBLINGS / PARTNERS / FULL PANTHEON. Partners stay
horizontally bonded. The full-pantheon option is the default tree; the others are
traversals over the PARENT_OF / PARTNER_OF / SIBLING_OF edges.

### Uncertainty & variants
- Confidence is preserved: `attested` = solid edge, `disputed` = dashed,
  `reconstructed` = dotted (same convention as the network graph).
- A back-edge (cycle) is rendered dashed + labelled "variant" — it is shown, never
  hidden.
- Traditions with no real genealogy (Slavic) render a single honest generation band
  with a caption "Genealogy is fragmentary in this tradition — shown as a pantheon,
  not a family tree." (honesty, not a gap.)

## Consequences
- **Positive:** readable top-to-bottom reading order; unions read correctly;
  artifacts stop competing with gods; each tradition is self-contained; the old
  network graph is preserved as the expert view; layout is deterministic (dagre is
  pure) so it is SSR-stable and testable.
- **Negative:** two layout code paths to maintain; a new dependency (dagre, MIT).
- **Hydration:** dagre runs client-side only (useMemo in the component) to avoid
  Node/browser numeric drift — same pattern as the existing RelationshipGraph.
  The initial render is a fit-to-view placeholder until the layout computes.

## Verification plan (evidence)
- `node scripts/validate.mjs` clean.
- `tsc --noEmit` clean.
- `next build` green.
- Headless Playwright: (a) genealogy default renders with **zero overlapping node
  boxes** (bbox intersection check) for each of the 6 single-tradition views and the
  ALL view; (b) GENEALOGY|RELATIONSHIPS switch swaps without data loss; (c) focus
  mode re-lays-out and stays overlap-free; (d) overlays toggle without moving nodes
  (node coords identical before/after); (e) semantic-zoom label tiers switch at the
  defined scales; (f) no console errors; (g) Slavic renders a single honest band.
- Screenshots of each tradition @1440px, vision-verified.
