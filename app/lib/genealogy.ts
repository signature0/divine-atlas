// THE DIVINE ATLAS — genealogy layout engine (ADR-003).
// Pure functions only: turn the mythology relationship data into a deterministic
// layered (hierarchical) structure that the GenealogyGraph component renders.
//
// Rules implemented (see ADR-003 + docs/03-requirements/requirements-genealogy-graph.md):
//  - Vertical axis = generation. Rank 0 (top) = oldest / primordial.
//  - Rank = longest path from a root through PARENT_OF edges (so a child of two
//    parents sits below its DEEPER parent).
//  - Cycles (e.g. Greek Heracles↔Zeus) are broken: the back-edge is kept and
//    marked `variant` (rendered dashed), never dropped.
//  - Partners (PARTNER_OF) are grouped into UNIONS; shared children attach to the
//    union midpoint (one fan-out, not two duplicate parent lines).
//  - Artifacts are SATELLITES of their owner — they never occupy a generation row.
//  - Traditions are independent: each is laid out in isolation (no cross-tradition
//    edges), then positioned side-by-side by the component.
//  - Uncertainty is preserved: confidence (attested/disputed/reconstructed) and
//    variant back-edges are carried into the output for the renderer to style.
//  - NO data is invented. A tradition with no real genealogy (Slavic: 1 parent
//    edge) comes out as a single honest generation band.

import type { Entity, Relationship, Artifact } from './types';
import { CATEGORY_TYPES } from './types';

export type GenealogyConfidence = 'attested' | 'disputed' | 'reconstructed' | 'variant';

/** A single entity node in one tradition's genealogy tree. */
export type GeneNode = {
  id: string;
  culture: string;
  name: string;
  classification: string;
  domain?: string;          // first domain, for the CLOSE zoom tier
  rank: number;             // generation (0 = oldest)
  parents: string[];        // entity ids
  partners: string[];       // entity ids
  unionId?: string;         // set when the node is part of a partner union
  uncertain: boolean;       // true if any genealogical edge touching it is not attested
};

/** An artifact satellite — rendered beside its owner, never in a generation row. */
export type GeneSatellite = {
  id: string;               // artifact id
  name: string;
  owner: string;            // entity id the satellite hangs off
  side: 'left' | 'right';   // which side of the owner (assigned to avoid collisions)
  href: string;             // /artifacts/<slug>
  img?: string;
};

/** A partner union (horizontal bond) — children fan out from its midpoint. */
export type Union = {
  id: string;
  members: [string, string]; // the two partner entity ids
};

/** A single parentage edge in the tree (child → parent), with confidence for styling. */
export type GeneEdge = {
  child: string;
  parent: string;
  viaUnion?: string;        // union id when the edge fans out from a partner bond
  sharedUnion?: string;     // union id when ALL of the child's parents are this union's
                            // members → the child originates from the union (single fan-out,
                            // not one line per parent — the PO's "no duplicate parent lines" rule)
  confidence: GenealogyConfidence;
};

/** A single tradition's fully resolved genealogy structure (positions are added
 *  later by the component via dagre). Pure + deterministic. */
export type TraditionGenealogy = {
  culture: string;
  nodes: GeneNode[];
  edges: GeneEdge[];
  unions: Union[];
  satellites: GeneSatellite[];
  maxRank: number;
  /** true when the tradition has little/no real genealogy → render an honest
   *  single band + caption instead of implying a multi-level tree. */
  fragmentary: boolean;
  /** true when a parentage cycle was found and broken (marked variant). */
  hasCycle: boolean;
};

// ---- edge-type sets (derived from the single source of truth in types.ts) ----
const PARENT_TYPES = new Set<string>(CATEGORY_TYPES.family.filter((t) => t === 'PARENT_OF' || t === 'CHILD_OF'));
const PARTNER_TYPES = new Set<string>(['PARTNER_OF']);

// ---------------------------------------------------------------------------
// Ranking (longest-path layering) with cycle detection + back-edge marking
// ---------------------------------------------------------------------------

type EdgeConf = { conf: GenealogyConfidence; variant: boolean };

/**
 * Build the parentage edge map for one tradition: child -> [{parent, conf, variant}].
 * Direction is normalized to (child, parent) regardless of whether the source uses
 * PARENT_OF (parent→child) or CHILD_OF (child→parent). Cycles are detected and the
 * offending edge is flagged `variant` (it is kept, but excluded from ranking).
 */
export function buildParentEdges(
  culture: string,
  entities: Entity[],
  relationships: Relationship[],
): { childToParents: Map<string, { parent: string; conf: GenealogyConfidence; variant: boolean }[]>; hasCycle: boolean } {
  const ids = new Set(entities.map((e) => e.id));
  const childToParents = new Map<string, { parent: string; conf: GenealogyConfidence; variant: boolean }[]>();
  const push = (child: string, parent: string, r: Relationship) => {
    if (!ids.has(child) || !ids.has(parent) || child === parent) return;
    if (!childToParents.has(child)) childToParents.set(child, []);
    childToParents.get(child)!.push({ parent, conf: r.confidence, variant: false });
  };

  for (const r of relationships) {
    if (!ids.has(r.from) || !ids.has(r.to)) continue;
    if (r.type === 'PARENT_OF') push(r.to, r.from, r);       // parent→child
    else if (r.type === 'CHILD_OF') push(r.from, r.to, r);   // child→parent
  }

  // Detect back-edges via DFS on the (parent → children) graph.
  const parentToChildren = new Map<string, string[]>();
  for (const [child, ps] of childToParents) for (const p of ps) {
    if (!parentToChildren.has(p.parent)) parentToChildren.set(p.parent, []);
    parentToChildren.get(p.parent)!.push(child);
  }
  const color = new Map<string, number>(); // 0 unvisited, 1 in-stack, 2 done
  let hasCycle = false;
  const backEdges = new Set<string>();     // "child|parent" strings to mark variant
  const dfs = (u: string): void => {
    color.set(u, 1);
    for (const v of parentToChildren.get(u) || []) {
      const c = color.get(v) || 0;
      if (c === 1) { hasCycle = true; backEdges.add(`${v}|${u}`); } // v already in stack → cycle
      else if (c === 0) dfs(v);
    }
    color.set(u, 2);
  };
  for (const e of entities) if ((color.get(e.id) || 0) === 0) dfs(e.id);

  for (const [child, ps] of childToParents) {
    ps.forEach((p) => { if (backEdges.has(`${child}|${p.parent}`)) p.variant = true; });
  }
  void culture;
  return { childToParents, hasCycle };
}

/**
 * Longest-path ranking. rank(node) = 0 if no (non-variant) parent, else
 * 1 + max(rank(parent)). Back-edges (variant) are excluded from the ranking, so
 * the remaining parent graph is acyclic — a plain memoized post-order DFS is safe
 * (no visiting guard, which would otherwise poison the memo mid-traversal).
 */
export function computeRanks(
  ids: string[],
  childToParents: Map<string, { parent: string; conf: GenealogyConfidence; variant: boolean }[]>,
): Map<string, number> {
  const memo = new Map<string, number>();
  const rankOf = (id: string): number => {
    const hit = memo.get(id);
    if (hit !== undefined) return hit;
    let r = 0;
    for (const p of childToParents.get(id) || []) {
      if (p.variant) continue; // back-edge: excluded from ranking
      r = Math.max(r, rankOf(p.parent) + 1);
    }
    memo.set(id, r);
    return r;
  };
  for (const id of ids) rankOf(id);
  return memo;
}

// ---------------------------------------------------------------------------
// Partner unions
// ---------------------------------------------------------------------------

/**
 * Group PARTNER_OF edges into unions (pairs). A node can appear in at most one
 * union (first wins) — mythology data is pair-wise and we render bonds, not a
 * partner-clique. Returns union list + node→unionId map.
 */
export function buildUnions(
  entities: Entity[],
  relationships: Relationship[],
): { unions: Union[]; nodeToUnion: Map<string, string> } {
  const ids = new Set(entities.map((e) => e.id));
  const unions: Union[] = [];
  const nodeToUnion = new Map<string, string>();
  let n = 0;
  for (const r of relationships) {
    if (!PARTNER_TYPES.has(r.type)) continue;
    if (!ids.has(r.from) || !ids.has(r.to) || r.from === r.to) continue;
    if (nodeToUnion.has(r.from) || nodeToUnion.has(r.to)) continue; // already in a union
    const id = `union-${n++}`;
    unions.push({ id, members: [r.from, r.to] });
    nodeToUnion.set(r.from, id);
    nodeToUnion.set(r.to, id);
  }
  return { unions, nodeToUnion };
}

// ---------------------------------------------------------------------------
// Assembling one tradition's genealogy
// ---------------------------------------------------------------------------

/**
 * Resolve the full genealogy structure for one tradition. Deterministic:
 * nodes/edges/unions/satellites are all ordered (by rank, then id) so the output
 * is stable across runs (SSR/hydration-safe, testable).
 */
export function buildTraditionGenealogy(
  culture: string,
  entities: Entity[],
  relationships: Relationship[],
  artifacts: Artifact[],
): TraditionGenealogy {
  const ids = entities.map((e) => e.id);
  const { childToParents, hasCycle } = buildParentEdges(culture, entities, relationships);
  const rank = computeRanks(ids, childToParents);
  const { unions, nodeToUnion } = buildUnions(entities, relationships);

  // confidence: weakest on the node's parentage edges (attested < reconstructed < disputed)
  const confRank: Record<GenealogyConfidence, number> = { attested: 0, reconstructed: 1, disputed: 2, variant: 3 };
  const worst = (a?: GenealogyConfidence, b?: GenealogyConfidence): GenealogyConfidence =>
    !a ? b! : !b ? a : (confRank[a] >= confRank[b] ? a : b);

  const nodes: GeneNode[] = entities.map((e) => {
    const ps = childToParents.get(e.id) || [];
    const partners = relationships
      .filter((r) => PARTNER_TYPES.has(r.type) && ((r.from === e.id && ids.includes(r.to)) || (r.to === e.id && ids.includes(r.from))))
      .map((r) => (r.from === e.id ? r.to : r.from));
    return {
      id: e.id,
      culture,
      name: e.name,
      classification: e.classification,
      domain: e.domains?.[0],
      rank: rank.get(e.id) || 0,
      parents: ps.map((p) => p.parent),
      partners,
      unionId: nodeToUnion.get(e.id),
      uncertain: ps.some((p) => p.variant || p.conf !== 'attested'),
    };
  });

  // Edges: each child → each parent. If the child's parents are EXACTLY the two
  // members of a union, every edge is tagged sharedUnion → the renderer fans the
  // child out from the bond midpoint once (single origin, not duplicate lines).
  // A single edge from a partnered parent also carries viaUnion (cosmetic join).
  const edges: GeneEdge[] = [];
  for (const e of nodes) {
    const ps = childToParents.get(e.id) || [];
    // does the child's full parent set equal exactly one union's members?
    let shared: string | undefined;
    for (const u of unions) {
      const [m1, m2] = u.members;
      const hasBoth = ps.some((p) => p.parent === m1) && ps.some((p) => p.parent === m2);
      const onlyThose = ps.every((p) => p.parent === m1 || p.parent === m2);
      if (hasBoth && onlyThose) { shared = u.id; break; }
    }
    for (const p of ps) {
      let viaUnion: string | undefined;
      const cu = nodeToUnion.get(e.id);
      if (cu && nodeToUnion.get(p.parent) === cu) viaUnion = cu;
      edges.push({ child: e.id, parent: p.parent, viaUnion, sharedUnion: shared, confidence: p.variant ? 'variant' : p.conf });
    }
  }

  // Artifact satellites: owner = artifact.owner if it's a known entity, else first
  // associated deity/hero. Side alternates to avoid stacking on one side.
  const idSet = new Set(ids);
  const ownerCount = new Map<string, number>();
  const satellites: GeneSatellite[] = [];
  for (const a of artifacts) {
    const owner = (a.owner && idSet.has(a.owner)) ? a.owner
      : (a.associated_deities?.find((d) => idSet.has(d)) || a.associated_heroes?.find((h) => idSet.has(h)));
    if (!owner) continue; // free-text owner with no entity → not rendered as a satellite
    const n = ownerCount.get(owner) || 0;
    ownerCount.set(owner, n + 1);
    satellites.push({
      id: a.id,
      name: a.name,
      owner,
      side: n % 2 === 0 ? 'right' : 'left',
      href: `/artifacts/${a.slug}`,
      img: a.artwork.image_url || undefined,
    });
  }

  const maxRank = Math.max(0, ...nodes.map((n) => n.rank));
  // Fragmentary: very few parentage edges relative to entity count → honest band.
  const edgeCount = (childToParents.size);
  const fragmentary = entities.length > 0 && edgeCount / entities.length < 0.25;

  // Deterministic ordering.
  const byRankThenId = (a: { rank: number; id: string }, b: { rank: number; id: string }) =>
    a.rank - b.rank || a.id.localeCompare(b.id);
  nodes.sort(byRankThenId);
  edges.sort((a, b) => a.child.localeCompare(b.child) || a.parent.localeCompare(b.parent));
  satellites.sort((a, b) => a.owner.localeCompare(b.owner) || a.id.localeCompare(b.id));

  return { culture, nodes, edges, unions, satellites, maxRank, fragmentary, hasCycle };
}

// ---------------------------------------------------------------------------
// Focus-mode traversals (subgraph node sets, all rooted at a deity)
// ---------------------------------------------------------------------------

export type FocusKind = 'full' | 'ancestors' | 'descendants' | 'siblings' | 'partners';

/**
 * The set of entity ids to include when FOCUS-ing on `center`.
 *  - full:        everything in the tradition
 *  - ancestors:   center + all PARENT_OF ancestors (upward)
 *  - descendants: center + all PARENT_OF descendants (downward)
 *  - siblings:    center + siblings (shared parents) + center's parents & partners
 *  - partners:    center + its partners + their shared children
 * Partners of included nodes are always pulled in (so a focused union renders).
 */
export function focusNodeSet(
  kind: FocusKind,
  centerId: string,
  entities: Entity[],
  childToParents: Map<string, { parent: string; conf: GenealogyConfidence; variant: boolean }[]>,
  relationships: Relationship[],
): Set<string> {
  const ids = new Set(entities.map((e) => e.id));
  const parentToChildren = new Map<string, string[]>();
  for (const [child, ps] of childToParents) for (const p of ps) {
    if (!parentToChildren.has(p.parent)) parentToChildren.set(p.parent, []);
    parentToChildren.get(p.parent)!.push(child);
  }
  const partnersOf = (id: string): string[] =>
    relationships.filter((r) => PARTNER_TYPES.has(r.type) && ((r.from === id) || (r.to === id)))
      .map((r) => (r.from === id ? r.to : r.from)).filter((x) => ids.has(x));

  const keep = new Set<string>([centerId]);
  if (kind === 'full') {
    for (const e of entities) keep.add(e.id);
  } else if (kind === 'ancestors') {
    let frontier = [centerId];
    for (let d = 0; d < 12 && frontier.length; d++) {
      const next: string[] = [];
      for (const n of frontier) for (const p of childToParents.get(n) || []) {
        if (!keep.has(p.parent)) { keep.add(p.parent); next.push(p.parent); }
      }
      frontier = next;
    }
  } else if (kind === 'descendants') {
    let frontier = [centerId];
    for (let d = 0; d < 12 && frontier.length; d++) {
      const next: string[] = [];
      for (const n of frontier) for (const c of parentToChildren.get(n) || []) {
        if (!keep.has(c)) { keep.add(c); next.push(c); }
      }
      frontier = next;
    }
  } else if (kind === 'siblings') {
    const centerParents = (childToParents.get(centerId) || []).map((p) => p.parent);
    for (const p of centerParents) for (const c of parentToChildren.get(p) || []) keep.add(c);
    for (const p of centerParents) keep.add(p);
  } else if (kind === 'partners') {
    for (const p of partnersOf(centerId)) keep.add(p);
    // shared children of center + partners
    const partnerSet = new Set(partnersOf(centerId));
    for (const r of relationships) if (r.type === 'PARENT_OF' && (partnerSet.has(r.from) || partnerSet.has(r.to))) keep.add(r.to);
  }
  // Always pull in partners of every kept node (unions render whole).
  const pull = [...keep];
  for (const n of pull) for (const p of partnersOf(n)) keep.add(p);
  return keep;
}

/** Build a TraditionGenealogy for a FOCUSED subset (same rules, fewer nodes). */
export function buildFocusedGenealogy(
  culture: string,
  kind: FocusKind,
  centerId: string,
  entities: Entity[],
  relationships: Relationship[],
  artifacts: Artifact[],
): TraditionGenealogy | null {
  const { childToParents } = buildParentEdges(culture, entities, relationships);
  const keep = focusNodeSet(kind, centerId, entities, childToParents, relationships);
  if (!keep.has(centerId)) return null;
  const subEnts = entities.filter((e) => keep.has(e.id));
  const subArts = artifacts.filter((a) => (a.owner && keep.has(a.owner)) || a.associated_deities?.some((d) => keep.has(d)) || a.associated_heroes?.some((h) => keep.has(h)));
  const g = buildTraditionGenealogy(culture, subEnts, relationships, subArts);
  // Re-root ranks so the focused set reads top-to-bottom from its own oldest.
  const minRank = Math.min(...g.nodes.map((n) => n.rank));
  g.nodes.forEach((n) => { n.rank -= minRank; });
  g.maxRank = Math.max(0, ...g.nodes.map((n) => n.rank));
  return g;
}
