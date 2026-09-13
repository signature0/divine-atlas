'use client';
// GenealogyGraph — hierarchical (top-to-bottom) genealogy view (ADR-003).
//
// A SECOND layout system, independent of RelationshipGraph (which is preserved
// as the RELATIONSHIPS view). Node positions come ONLY from the genealogy DAG,
// layered with @dagrejs/dagre:
//   - vertical = generation (oldest/primordial at the top, next generations below)
//   - partners = horizontal union bonds; shared children fan out from the bond
//   - artifacts = satellites beside their owner, never in a generation row
//   - other relationships = overlays drawn on top; they never move nodes
//   - each tradition lays out in its own territory (no cross-tradition edges)
//   - semantic zoom (map-style): far = primordials+names, medium = all names,
//     close = +domain +classification +relationship count
//   - focus mode re-lays-out a subgraph (ancestors/descendants/siblings/...)
//   - well-known entities (many legends/relations) render BIGGER + highlighted
//
// View model (native scroll): the SVG's pixel size = content×zoom, so the wall
// is a natively scrollable surface (pan by scroll/drag; zoom via buttons/wheel).
// A portrait disc of content radius r renders at r*zoom px — 1 SVG unit = 1 px.
// On a narrow phone the initial zoom is raised above the contain-fit so a disc
// is at least MIN_DISC_PX wide (this is the "photos disappear" fix: the contain-
// fit was shrinking 6-culture photos to ~3px). Labels are constant SCREEN size
// (px) so names stay readable at every zoom.
//
// Layout runs client-side only (deterministic dagre) to stay SSR/hydration-safe.

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dagre from '@dagrejs/dagre';
import {
  GraphData, Entity, Relationship, Artifact, EdgeCategory,
  CATEGORY_COLORS, CATEGORY_TYPES, CULTURE_NAMES, CULTURE_ACCENTS,
} from '../lib/types';
import {
  buildTraditionGenealogy, buildFocusedGenealogy,
  GeneNode, GeneSatellite, Union, GeneEdge, FocusKind,
} from '../lib/genealogy';

// ---- geometry constants (abstract content units; the canvas fits to content) ----
const NODE_W = 132, NODE_H = 128;     // deity node box reserved for layout
const DISC_R = 32;                    // portrait disc radius (content units)
const DISC_R_MAJOR = DISC_R * 1.3;    // well-known entities render bigger
const SAT_W = 72, SAT_H = 58;         // artifact satellite box
const RANK_SEP = 70;                  // vertical gap between generations
const NODE_SEP = 22, EDGE_SEP = 10;   // horizontal gaps (dagre)
const T_GAP_X = 110, T_GAP_Y = 130;   // gutter between tradition territories
const HEADER_H = 46;                  // reserved header space above each territory
const MIN_DISC_PX = 40;               // on narrow screens, start zoomed so a disc is ≥ this px

// Within-row ordering so each generation reads logically left→right:
// primordials/elders first, then major gods, then monsters/heroes/mortals.
const CLASS_ORDER: Record<string, number> = {
  primordial: 0, deity: 1, trickster: 1, giant: 2, realm: 2, monster: 3, hero: 4, mortal: 5,
};
const classRank = (c: string) => CLASS_ORDER[c] ?? 6;

// Overlay definitions (parentage + marriage are always on in genealogy mode).
type OverlayKey = 'creation' | 'conflict' | 'alliance' | 'association' | 'artifact';
const OVERLAYS: { key: OverlayKey; label: string }[] = [
  { key: 'creation', label: 'Creation' },
  { key: 'conflict', label: 'Conflict' },
  { key: 'alliance', label: 'Alliance' },
  { key: 'association', label: 'Domain & Rule' },
  { key: 'artifact', label: 'Artifacts' },
];
// relationship types that render as an OVERLAY edge (everything except the
// genealogy backbone: PARENT_OF/CHILD_OF position nodes; PARTNER_OF is the bond).
const OVERLAY_TYPES = new Set<string>([...CATEGORY_TYPES.creation, ...CATEGORY_TYPES.conflict,
  ...CATEGORY_TYPES.alliance, ...CATEGORY_TYPES.association]);
const SYMMETRIC = new Set(['SIBLING_OF', 'PARTNER_OF', 'ALLY_OF', 'ENEMY_OF', 'FOUGHT', 'ASSOCIATED_WITH']);

// ---- layout types ----
type PlacedNode = {
  id: string; name: string; classification: string; domain?: string;
  x: number; y: number; img?: string; href: string;
  uncertain: boolean; rank: number; relCount: number; culture: string;
  major: boolean;            // well-known entity: bigger disc + highlighted ring
  score: number;             // prominence score (myths+relations+children+artifacts)
};
type Sat = { id: string; name: string; x: number; y: number; owner: string; side: string; href: string; img?: string };
type Bond = { x1: number; y1: number; x2: number; y2: number; mx: number; my: number };
type GEdge = {
  d: string; cat: string; conf: string; label?: string;
  a: { x: number; y: number }; b: { x: number; y: number }; rel?: Relationship;
};
type Territory = {
  culture: string; label: string; count: number;
  x: number; y: number; w: number; h: number;
  nodes: PlacedNode[]; sats: Sat[]; bonds: Bond[]; edges: GEdge[];
  fragmentary: boolean;
};
type Layout = {
  territories: Territory[];
  pos: Map<string, PlacedNode>;          // id -> placed node (for overlay routing)
  content: { minX: number; minY: number; maxX: number; maxY: number };
  focused?: { id: string; name: string; culture: string };
};

// ---- deterministic per-tradition layout (pure) ----
function layoutTradition(
  culture: string, ents: Entity[], rels: Relationship[], arts: Artifact[],
  imgMap: Record<string, string>, tx: number, ty: number,
): { terr: Territory; pos: Map<string, PlacedNode> } {
  const g = buildTraditionGenealogy(culture, ents, rels, arts);
  const gr = new dagre.graphlib.Graph();
  gr.setGraph({ rankdir: 'TB', ranksep: RANK_SEP, nodesep: NODE_SEP, edgesep: EDGE_SEP, marginx: 10, marginy: 10 });
  gr.setDefaultEdgeLabel(() => ({}));
  const relCount = new Map<string, number>();
  for (const r of rels) { relCount.set(r.from, (relCount.get(r.from) || 0) + 1); relCount.set(r.to, (relCount.get(r.to) || 0) + 1); }
  // Prominence (the "well-known gods" set): total relationship weight, plus
  // weight for each major myth they feature in, each child and each artwork.
  // Per-tradition top ~40% (min 3) are rendered as MAJOR (bigger + highlighted).
  const scores = ents.map((e) => ({
    id: e.id,
    score: (relCount.get(e.id) || 0) + 4 * (e.major_myths?.length || 0)
      + 2 * (e.children?.length || 0) + 2 * (e.artworks?.length || 0),
  }));
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const topN = Math.max(3, Math.ceil(ents.length * 0.4));
  const cutoff = sorted[Math.min(topN, sorted.length) - 1]?.score ?? 0;
  const scoreById = new Map(scores.map((s) => [s.id, s.score]));
  const pos = new Map<string, PlacedNode>();
  // Within each generation (rank), hint dagre's left→right order so rows read
  // logically: well-known (major) entities first, then by class seniority
  // (primordial → deity → monster → hero → mortal), then by name.
  const entById = new Map(ents.map((e) => [e.id, e]));
  const byRank = new Map<number, typeof g.nodes>();
  for (const n of g.nodes) {
    if (!byRank.has(n.rank)) byRank.set(n.rank, []);
    byRank.get(n.rank)!.push(n);
  }
  for (const list of byRank.values()) {
    list.sort((a, b) => {
      const sa = scoreById.get(a.id) || 0, sb = scoreById.get(b.id) || 0;
      const ma = sa >= cutoff, mb = sb >= cutoff;
      if (ma !== mb) return ma ? -1 : 1;
      if (sa !== sb) return sb - sa;
      const ca = classRank(entById.get(a.id)?.classification || ''), cb = classRank(entById.get(b.id)?.classification || '');
      if (ca !== cb) return ca - cb;
      return a.id.localeCompare(b.id);
    });
  }
  for (const [rank, list] of byRank) {
    list.forEach((n, i) => gr.setNode(n.id, { width: NODE_W, height: NODE_H, rank, order: i }));
  }
  for (const e of g.edges) if (e.confidence !== 'variant') gr.setEdge(e.parent, e.child, { minlen: 1 });
  dagre.layout(gr);

  const nodes: PlacedNode[] = g.nodes.map((n: GeneNode) => {
    const p = gr.node(n.id);
    const score = scoreById.get(n.id) || 0;
    const pl: PlacedNode = {
      id: n.id, name: n.name, classification: n.classification, domain: n.domain,
      x: tx + p.x, y: ty + p.y, img: imgMap[n.id], href: `/deity/${n.id}`,
      uncertain: n.uncertain, rank: n.rank,
      relCount: relCount.get(n.id) || 0, culture,
      major: score >= cutoff, score,
    };
    pos.set(n.id, pl);
    return pl;
  });

  // artifact satellites: beside the owner, alternating sides (precomputed in lib).
  const sats: Sat[] = g.satellites.map((s: GeneSatellite) => {
    const o = pos.get(s.owner);
    if (!o) return null;
    const dx = s.side === 'right' ? NODE_W / 2 + SAT_W / 2 + 20 : -(NODE_W / 2 + SAT_W / 2 + 20);
    return { id: s.id, name: s.name, x: o.x + dx, y: o.y, owner: s.owner, side: s.side, href: s.href, img: s.img } as Sat;
  }).filter(Boolean) as Sat[];

  // union bonds + parentage edge paths.
  const bonds: Bond[] = [];
  const edges: GEdge[] = [];
  const midOf = (u: Union) => {
    const a = pos.get(u.members[0])!, b = pos.get(u.members[1])!;
    return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, a, b };
  };
  const bondFor = new Map<string, ReturnType<typeof midOf>>();
  for (const u of g.unions) {
    if (!pos.has(u.members[0]) || !pos.has(u.members[1])) continue;
    const m = midOf(u); bondFor.set(u.id, m);
    bonds.push({ x1: m.a.x, y1: m.a.y, x2: m.b.x, y2: m.b.y, mx: m.mx, my: m.my });
  }
  const curve = (x1: number, y1: number, x2: number, y2: number): string => {
    const dy = (y2 - y1) * 0.5;
    return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  };
  const byChild = new Map<string, GeneEdge[]>();
  for (const e of g.edges) {
    if (!pos.has(e.child) || !pos.has(e.parent)) continue;
    if (!byChild.has(e.child)) byChild.set(e.child, []);
    byChild.get(e.child)!.push(e);
  }
  for (const [child, es] of byChild) {
    const c = pos.get(child)!;
    if (es.length >= 2 && es.every((e) => e.sharedUnion)) {
      const u = bondFor.get(es[0].sharedUnion!);
      if (u) { edges.push({ d: curve(u.mx, u.my, c.x, c.y - NODE_H / 2), cat: 'family', conf: es[0].confidence, a: { x: u.mx, y: u.my }, b: { x: c.x, y: c.y - NODE_H / 2 } }); continue; }
    }
    for (const e of es) {
      const p = pos.get(e.parent)!;
      const topOfParent = p.y - NODE_H / 2;
      if (e.confidence === 'variant') {
        const mx = (p.x + c.x) / 2, my = Math.min(p.y, c.y) - 50;
        edges.push({ d: `M ${c.x} ${c.y - NODE_H / 2} C ${mx} ${my}, ${mx} ${my}, ${p.x} ${topOfParent}`, cat: 'family', conf: 'variant', label: 'variant', a: { x: c.x, y: c.y }, b: { x: p.x, y: p.y } });
      } else {
        edges.push({ d: curve(p.x, topOfParent, c.x, c.y - NODE_H / 2), cat: 'family', conf: e.confidence, a: { x: p.x, y: topOfParent }, b: { x: c.x, y: c.y - NODE_H / 2 } });
      }
    }
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const grow = (x: number, y: number, w: number, h: number) => {
    minX = Math.min(minX, x - w / 2); maxX = Math.max(maxX, x + w / 2);
    minY = Math.min(minY, y - h / 2); maxY = Math.max(maxY, y + h / 2);
  };
  for (const n of nodes) grow(n.x, n.y, NODE_W, NODE_H);
  for (const s of sats) grow(s.x, s.y, SAT_W, SAT_H);
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 100; maxY = 100; }
  minY -= HEADER_H;
  const terr: Territory = {
    culture, label: CULTURE_NAMES[culture] || culture, count: nodes.length,
    x: minX, y: minY, w: maxX - minX, h: maxY - minY, nodes, sats, bonds, edges,
    fragmentary: g.fragmentary,
  };
  return { terr, pos };
}

export function GenealogyGraph({ data, centerId }: { data: GraphData; centerId?: string }) {
  const router = useRouter();
  const [overlays, setOverlays] = useState<Set<OverlayKey>>(new Set());
  const [focusKind, setFocusKind] = useState<FocusKind>('full');
  const [selectedId, setSelectedId] = useState<string | null>(centerId ?? null);
  const [hover, setHover] = useState<GEdge | null>(null);
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set());
  const imgAttempts = useRef<Record<string, number>>({});
  const [full, setFull] = useState(false);
  // View state: a single zoom scale (px per content unit). Pan is NATIVE scroll.
  const [zk, setZk] = useState(1);
  const [canvasPx, setCanvasPx] = useState({ w: 1000, h: 600 });
  const contRef = useRef<HTMLDivElement>(null);      // the scroll container (measured)
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef({ x: 0, y: 0 });
  const scrollInit = useRef(false);

  // Image errors: retry up to 2× (transient network / slow hotlink) before
  // hiding the photo — one flaky load must not permanently kill a portrait.
  const markImgFailed = useCallback((id: string) => {
    const n = (imgAttempts.current[id] || 0) + 1;
    imgAttempts.current[id] = n;
    if (n < 3) {
      setTimeout(() => setImgFailed((p) => { const q = new Set(p); q.delete(id); return q; }), 1200 * n);
    } else {
      setImgFailed((p) => new Set(p).add(id));
    }
  }, []);
  const cultures = useMemo(() => {
    const s: string[] = []; const seen = new Set<string>();
    for (const e of data.entities) if (!seen.has(e.culture)) { seen.add(e.culture); s.push(e.culture); }
    return s;
  }, [data]);
  const imgMap = useMemo(() => {
    const artById = new Map(data.artworks.map((a) => [a.id, a]));
    const out: Record<string, string> = {};
    for (const e of data.entities) {
      const cands = [e.hero_artwork, ...(e.artworks || [])].filter(Boolean) as string[];
      for (const aid of cands) { const u = artById.get(aid)?.image_url; if (u) { out[e.id] = u; break; } }
    }
    for (const a of data.artifacts) if (a.artwork.image_url) out[a.id] = a.artwork.image_url;
    return out;
  }, [data]);

  // ---- the layout. Recomputed ONLY when the node set changes — overlays are NOT
  //      inputs, so toggling an overlay can never move a node. ----
  const layout = useMemo<Layout>(() => {
    const selected = selectedId ? data.entities.find((e) => e.id === selectedId) : undefined;
    if (selected) {
      const focusedGenealogy = buildFocusedGenealogy(selected.culture, focusKind, selected.id,
        data.entities.filter((e) => e.culture === selected.culture), data.relationships, data.artifacts);
      const ents = data.entities.filter((e) => e.culture === selected.culture && focusedGenealogy.nodes.some((n) => n.id === e.id));
      const { terr, pos } = layoutTradition(selected.culture, ents, data.relationships,
        data.artifacts.filter((a) => focusedGenealogy.satellites.some((s) => s.id === a.id)), imgMap, 0, HEADER_H);
      const pad = 20;
      return {
        territories: [terr], pos,
        content: { minX: terr.x - pad, minY: terr.y - pad, maxX: terr.x + terr.w + pad, maxY: terr.y + terr.h + pad },
        focused: { id: selected.id, name: selected.name, culture: selected.culture },
      };
    }
    // Full mode: one territory per culture, arranged in a clean GRID.
    const parts = cultures.map((c) => layoutTradition(c,
      data.entities.filter((e) => e.culture === c), data.relationships,
      data.artifacts.filter((a) => a.culture === c), imgMap, 0, 0));
    const n = parts.length;
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const colW = new Array(cols).fill(0), rowH = new Array(rows).fill(0);
    parts.forEach((p, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      colW[col] = Math.max(colW[col], p.terr.w);
      rowH[row] = Math.max(rowH[row], p.terr.h);
    });
    const colX: number[] = [], rowY: number[] = [];
    let cx = 0, cy = 0;
    for (let c = 0; c < cols; c++) { colX[c] = cx; cx += colW[c] + T_GAP_X; }
    for (let r = 0; r < rows; r++) { rowY[r] = cy; cy += rowH[r] + T_GAP_Y; }
    const placed = parts.map((p, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = colX[col] + (colW[col] - p.terr.w) / 2;
      const y = rowY[row] + (rowH[row] - p.terr.h) / 2;
      return { p, x, y };
    });
    const terrs: Territory[] = [];
    const pos = new Map<string, PlacedNode>();
    let maxX = 0, maxY = 0;
    for (const { p, x, y } of placed) {
      const terr: Territory = { ...p.terr, x: p.terr.x + x, y: p.terr.y + y };
      terr.nodes = p.terr.nodes.map((nd) => ({ ...nd, x: nd.x + x, y: nd.y + y }));
      terr.sats = p.terr.sats.map((s) => ({ ...s, x: s.x + x, y: s.y + y }));
      terr.bonds = p.terr.bonds.map((b) => ({ x1: b.x1 + x, y1: b.y1 + y, x2: b.x2 + x, y2: b.y2 + y, mx: b.mx + x, my: b.my + y }));
      terr.edges = p.terr.edges.map((e) => ({ ...e, a: { x: e.a.x + x, y: e.a.y + y }, b: { x: e.b.x + x, y: e.b.y + y } }));
      for (const e of terr.edges) if (e.d.startsWith('M')) {
        const { a, b } = e; const dy = (b.y - a.y) * 0.5;
        e.d = `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
      }
      terrs.push(terr);
      for (const [id, nd] of p.pos) pos.set(id, { ...nd, x: nd.x + x, y: nd.y + y });
      maxX = Math.max(maxX, x + p.terr.w); maxY = Math.max(maxY, y + p.terr.h);
    }
    return { territories: terrs, pos, content: { minX: 0, minY: 0, maxX, maxY } };
  }, [data, cultures, imgMap, selectedId, focusKind]);

  const selected = selectedId ? data.entities.find((e) => e.id === selectedId) : undefined;

  // content bounds (padded) — the SVG viewBox.
  const vb = useMemo(() => {
    const c = layout.content, pad = 30;
    const x = c.minX - pad, y = c.minY - pad;
    return { x, y, w: (c.maxX - c.minX) + pad * 2, h: (c.maxY - c.minY) + pad * 2 };
  }, [layout]);
  const layoutKey = layout.focused ? `${layout.focused.id}:${focusKind}` : 'atlas:' + layout.territories.length;

  // Visible container size (measure the container, not the self-sizing SVG).
  useEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setCanvasPx({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);

  // FIT scale = the "contain" scale: whole content bounds inside the viewport.
  const fitK = useMemo(() => {
    if (!vb.w || !vb.h) return 1;
    return Math.max(1e-6, Math.min(canvasPx.w / vb.w, canvasPx.h / vb.h));
  }, [vb, canvasPx]);

  // Initial zoom: fitted overview, EXCEPT on narrow canvases where the contain-
  // fit would shrink portrait discs to a few px — then zoom in so a disc is at
  // least MIN_DISC_PX on screen. (The "photos disappear on my phone" fix.)
  const initialK = useCallback(() => {
    const f = fitK;
    const discPx = 2 * DISC_R * f;
    if (canvasPx.w >= 700 || discPx >= MIN_DISC_PX) return f;
    return Math.max(f, MIN_DISC_PX / (2 * DISC_R));
  }, [fitK, canvasPx]);

  const setScrollBoth = (x: number, y: number) => {
    const el = contRef.current; if (!el) return;
    el.scrollLeft = Math.max(0, x); el.scrollTop = Math.max(0, y);
    scrollRef.current = { x: el.scrollLeft, y: el.scrollTop };
  };
  const centerContent = useCallback((k: number) => {
    // start at the TOP-LEFT of the content (the first panel) — the natural
    // reading position; the user scrolls/zooms to explore.
    setScrollBoth(0, 0);
  }, [vb, canvasPx]);

  // On a new layout: pick the initial zoom, then center once the size is known.
  useEffect(() => { setZk(initialK()); scrollInit.current = false; }, [layoutKey, initialK]);
  useEffect(() => {
    if (scrollInit.current || !vb.w) return;
    centerContent(zk);
    scrollInit.current = true;
  }, [layoutKey, zk, canvasPx, vb, centerContent]);

  const onScroll = useCallback(() => {
    const el = contRef.current; if (!el) return;
    scrollRef.current = { x: el.scrollLeft, y: el.scrollTop };
  }, []);

  // content coords of a screen point (the SVG's on-screen rect already reflects scroll).
  const contentAt = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 };
    return { x: vb.x + (clientX - rect.left) / zk, y: vb.y + (clientY - rect.top) / zk };
  };
  // Zoom keeping `anchor` (content coords) fixed under the cursor.
  // Bounds are absolute-aware: on the wide atlas the fit scale is tiny, so a
  // relative-only cap would never reach "readable portrait" zoom.
  const zoom = useCallback((f: number, anchor?: { x: number; y: number }) => {
    const maxK = Math.max(fitK * 14, 0.8);
    const minK = Math.max(fitK * 0.5, 1e-6);
    const k = Math.min(maxK, Math.max(minK, zk * f));
    const el = contRef.current; if (!el) { setZk(k); return; }
    const r = el.getBoundingClientRect();
    const a = anchor ?? contentAt(r.left + r.width / 2, r.top + r.height / 2);
    // screen point of `a` right now = its offset within the viewport + current scroll
    const px = (a.x - vb.x) * zk - scrollRef.current.x;
    const py = (a.y - vb.y) * zk - scrollRef.current.y;
    setScrollBoth((a.x - vb.x) * k - px, (a.y - vb.y) * k - py);
    setZk(k);
  }, [fitK, zk, vb, contentAt]);
  const doFit = useCallback(() => { setZk(fitK); centerContent(fitK); }, [fitK, centerContent]);

  // Wheel = zoom (non-passive so we can stop the native scroll too).
  useEffect(() => {
    const el = contRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = contentAt(e.clientX, e.clientY);
      zoom(e.deltaY < 0 ? 1.12 : 0.89, p);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, contentAt]);

  // Fullscreen: Esc exits.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [full]);

  // Semantic-zoom tiers relative to the fitted scale.
  const tier: 'far' | 'medium' | 'close' = zk < fitK * 1.3 ? 'far' : zk < fitK * 2.4 ? 'medium' : 'close';
  const showAll = tier !== 'far';
  // Constant SCREEN-size labels (content units = px / zoom).
  const pxFont = (px: number) => px / zk;

  // ---- overlay edges (raw relationships; never affect layout) ----
  const overlayEdges = useMemo(() => {
    if (!overlays.size) return [] as GEdge[];
    const out: GEdge[] = [];
    const seen = new Set();
    for (const r of data.relationships) {
      if (!OVERLAY_TYPES.has(r.type)) continue;
      const cat: EdgeCategory = (Object.entries(CATEGORY_TYPES).find(([, t]) => t.includes(r.type))?.[0] as EdgeCategory) || 'association';
      if (!overlays.has(cat as OverlayKey)) continue;
      const key = SYMMETRIC.has(r.type) ? [r.from, r.to].sort().join('|') : `${r.from}|${r.to}`;
      if (seen.has(key)) continue; seen.add(key);
      const a = layout.pos.get(r.from), b = layout.pos.get(r.to);
      if (!a || !b || a.culture !== b.culture || r.from === r.to) continue;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const d = `M ${a.x} ${a.y} Q ${mid.x} ${mid.y - 46}, ${b.x} ${b.y}`;
      out.push({ d, cat, conf: r.confidence, a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, rel: r });
    }
    return out;
  }, [data, overlays, layout]);

  const toggleOverlay = (k: OverlayKey) => setOverlays((prev) => {
    const s = new Set(prev); if (s.has(k)) s.delete(k); else s.add(k); return s;
  });
  const focusLabels: Record<FocusKind, string> = {
    full: 'Full pantheon', ancestors: 'Ancestors', descendants: 'Descendants',
    siblings: 'Siblings', partners: 'Partners',
  };

  return (
    <div>
      {/* controls: overlays + zoom */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 2 }}>Overlays</span>
        {OVERLAYS.map((o) => (
          <button key={o.key} className={`chip-btn ${overlays.has(o.key) ? 'active' : ''}`} onClick={() => toggleOverlay(o.key)} aria-pressed={overlays.has(o.key)}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[o.key as EdgeCategory], marginRight: 6 }} />
            {o.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="chip-btn" onClick={() => zoom(1.25)} aria-label="Zoom in">+</button>
          <button className="chip-btn" onClick={() => zoom(0.8)} aria-label="Zoom out">−</button>
          <button className="chip-btn" onClick={doFit}>Fit</button>
          <button className="chip-btn" onClick={() => setFull((f) => !f)} aria-label="Toggle fullscreen"
            title="Full-screen the graph (Esc exits)">⛶</button>
        </span>
      </div>

      {/* focus banner */}
      {selected && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center',
          border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px', background: 'var(--surface)' }}>
          <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Focus</span>
          <span className="display-l" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent)' }}>{selected.name}</span>
          <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--ink-2)' }}>{CULTURE_NAMES[selected.culture] || selected.culture}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(Object.keys(focusLabels) as FocusKind[]).map((f) => (
              <button key={f} className={`chip-btn ${focusKind === f ? 'active' : ''}`} onClick={() => setFocusKind(f)}>{focusLabels[f]}</button>
            ))}
            <button className="chip-btn" onClick={() => { setSelectedId(null); setFocusKind('full'); }} aria-label="Exit focus mode">✕ Full atlas</button>
          </span>
        </div>
      )}

      {/* canvas — a natively scrollable surface; full mode pins over the viewport */}
      <div style={full
        ? { position: 'fixed', inset: 0, zIndex: 1000, overflow: 'hidden',
            background: 'radial-gradient(1200px 500px at 50% 0%, color-mix(in srgb, var(--gold) 6%, var(--surface)), var(--surface))' }
        : { position: 'relative', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden',
            background: 'radial-gradient(1200px 500px at 50% 0%, color-mix(in srgb, var(--gold) 6%, var(--surface)), var(--surface))',
            height: 'min(74vh, 800px)', minHeight: 420 }}>
        <div ref={contRef} onScroll={onScroll} style={{ width: '100%', height: '100%', overflow: 'auto' }}>
          <svg ref={svgRef} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} role="img"
            aria-label={layout.focused
              ? `Genealogy focused on ${layout.focused.name}, showing ${focusLabels[focusKind]}`
              : `Hierarchical genealogy of ${layout.territories.length} traditions`}
            style={{ width: vb.w * zk, height: vb.h * zk, display: 'block' }}>
            <defs>
              {layout.territories.flatMap((t) => t.nodes).map((n) => {
                const rr = n.major ? DISC_R_MAJOR : DISC_R;
                return <clipPath key={n.id} id={`ggclip-${n.id}`}><circle cx={n.x} cy={n.y} r={rr} /></clipPath>;
              })}
            </defs>
            {layout.territories.map((t) => (
              <TerritoryView key={t.culture} t={t} tier={tier} showAll={showAll} k={zk} pxFont={pxFont} imgFailed={imgFailed}
                setImgFailed={markImgFailed}
                onNodeClick={(id) => setSelectedId(id)}
                onSatClick={(href) => router.push(href)}
                onEdgeHover={setHover} hover={hover} />
            ))}
            {/* overlays on top of every territory (never move nodes) */}
            <g>
              {overlayEdges.map((e, i) => (
                <g key={`ov${i}`} onMouseEnter={() => setHover(e)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
                  <path d={e.d} fill="none" stroke={CATEGORY_COLORS[e.cat as EdgeCategory]} strokeWidth={hover === e ? 2.6 : 1.3}
                    strokeDasharray={e.conf === 'disputed' ? '6 5' : e.conf === 'reconstructed' ? '2 4' : undefined}
                    opacity={hover === e ? 1 : 0.55} />
                  <path d={e.d} fill="none" stroke="transparent" strokeWidth={14} />
                </g>
              ))}
            </g>
          </svg>
        </div>
        {/* zoom tier indicator */}
        <div className="mono" style={{ position: 'absolute', right: 10, bottom: 8, fontSize: '0.58rem', color: 'var(--ink-2)',
          background: 'color-mix(in srgb, var(--bg-0) 70%, transparent)', padding: '2px 6px', borderRadius: 3 }}>
          zoom {(zk / fitK).toFixed(2)}× · {tier}
        </div>
        {full && (
          <button className="chip-btn" onClick={() => setFull(false)}
            style={{ position: 'absolute', right: 10, top: 10 }} aria-label="Exit fullscreen"
            title="Exit full screen (Esc)">✕ Exit</button>
        )}
      </div>

      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }} className="mono" aria-hidden>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-1)', fontSize: '0.62rem' }}>
          <span style={{ width: 18, borderTop: `2px solid ${CATEGORY_COLORS.family}` }} /> parentage
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-1)', fontSize: '0.62rem' }}>
          <span style={{ width: 18, borderTop: `2px solid ${CATEGORY_COLORS.marriage}` }} /> marriage ♥
        </span>
        {OVERLAYS.filter((o) => overlays.has(o.key)).map((o) => (
          <span key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-1)', fontSize: '0.62rem' }}>
            <span style={{ width: 18, borderTop: `2px solid ${CATEGORY_COLORS[o.key as EdgeCategory]}` }} /> {o.label}
          </span>
        ))}
        <span style={{ color: 'var(--ink-2)', fontSize: '0.6rem' }}>far = primordials · medium = all · close = detail — scroll/pan, click a deity to focus</span>
      </div>
    </div>
  );
}

// ---- per-territory render ----
function TerritoryView({ t, tier, showAll, k, pxFont, imgFailed, setImgFailed, onNodeClick, onSatClick, onEdgeHover, hover }: {
  t: Territory; tier: 'far' | 'medium' | 'close'; showAll: boolean; k: number;
  pxFont: (px: number) => number;   // target screen px → content units (constant-size labels)
  imgFailed: Set<string>; setImgFailed: (id: string) => void;
  onNodeClick: (id: string) => void; onSatClick: (href: string) => void;
  onEdgeHover: (e: GEdge | null) => void; hover: GEdge | null;
}) {
  const accent = CULTURE_ACCENTS[t.culture] || 'var(--gold)';
  // Labels are constant screen-size, so their on-screen width budget is the
  // layout's own node width in px (NODE_W*k) — scales with zoom, no overlap.
  const nameFor = (name: string, fontPx: number, boxPx: number) => {
    const maxChars = Math.max(4, Math.round(boxPx / (0.55 * fontPx)));
    return name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name;
  };
  return (
    <g>
      {/* territory frame + header */}
      <rect x={t.x - 8} y={t.y - 8} width={t.w + 16} height={t.h + 16} rx={10}
        fill="color-mix(in srgb, var(--bg-0) 35%, transparent)" stroke="var(--line)" strokeDasharray="4 6" opacity={0.85} />
      <text x={t.x + 14} y={t.y + 10} fill={accent} style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(11), letterSpacing: 2, fontWeight: 600 }}>
        {t.label.toUpperCase()} · {t.count}
      </text>
      {t.fragmentary && (
        <text x={t.x + 14} y={t.y + 26} fill="var(--ink-2)" style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(8.5) }}>
          fragmentary record — no firm parentage
        </text>
      )}

      {/* parentage edges */}
      {t.edges.map((e, i) => (
        <g key={`ed${i}`} onMouseEnter={() => onEdgeHover(e)} onMouseLeave={() => onEdgeHover(null)}>
          <path d={e.d} fill="none"
            stroke={e.conf === 'variant' ? 'var(--ink-2)' : e.conf === 'disputed' ? 'var(--ink-2)' : CATEGORY_COLORS.family}
            strokeWidth={1.6} strokeDasharray={e.conf === 'variant' ? '3 4' : e.conf === 'disputed' ? '6 5' : e.conf === 'reconstructed' ? '2 4' : undefined}
            opacity={e.conf === 'variant' ? 0.5 : 0.7} />
          {e.label && <text x={(e.a.x + e.b.x) / 2} y={(e.a.y + e.b.y) / 2 - 8} textAnchor="middle"
            fill={CATEGORY_COLORS.conflict} style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(8.5) }}>{e.label}</text>}
        </g>
      ))}

      {/* marriage/partner bonds (horizontal) */}
      {t.bonds.map((b, i) => (
        <g key={`bn${i}`}>
          <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={CATEGORY_COLORS.marriage} strokeWidth={1.6} opacity={0.85} />
          <text x={b.mx} y={b.my - 5} textAnchor="middle" fill={CATEGORY_COLORS.marriage}
            style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(11) }}>♥</text>
        </g>
      ))}

      {/* artifact satellites */}
      {showAll && t.sats.map((s) => {
        const o = t.nodes.find((n) => n.id === s.owner);
        if (!o) return null;
        return (
          <g key={s.id} onClick={() => onSatClick(s.href)} style={{ cursor: 'pointer' }}>
            <line x1={o.x + (s.side === 'right' ? -NODE_W / 2 : NODE_W / 2)} y1={o.y}
              x2={s.x - (s.side === 'right' ? -SAT_W / 2 : SAT_W / 2)} y2={s.y}
              stroke={CATEGORY_COLORS.artifact} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            <rect x={s.x - SAT_W / 2} y={s.y - SAT_H / 2} width={SAT_W} height={SAT_H} rx={5}
              fill="var(--bg-2)" stroke={CATEGORY_COLORS.artifact} strokeWidth={1} opacity={0.95} />
            {s.img && !imgFailed.has(s.id) && (
              <image href={s.img} x={s.x - 16} y={s.y - 16} width={32} height={32} preserveAspectRatio="xMidYMid slice"
                opacity={0.9} onError={() => setImgFailed(s.id)} />
            )}
            <text x={s.x} y={s.y + SAT_H / 2 - 6} textAnchor="middle" fill="var(--ink-1)"
              style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(8) }}>{nameFor(s.name, 8, SAT_W * k)}</text>
          </g>
        );
      })}

      {/* nodes */}
      {t.nodes.map((n) => {
        const rr = n.major ? DISC_R_MAJOR : DISC_R;
        const showImg = !!n.img && !imgFailed.has(n.id);
        // FAR tier: top two generations = portrait+name; deeper = small dots.
        if (tier === 'far' && n.rank >= 2) {
          return <circle key={n.id} cx={n.x} cy={n.y} r={n.major ? 9 : 6}
            fill={n.major ? accent : 'var(--ink-2)'} opacity={n.major ? 0.85 : 0.5} />;
        }
        return (
          <g key={n.id} onClick={() => onNodeClick(n.id)} style={{ cursor: 'pointer' }}>
            {/* major (well-known) nodes: bigger disc + highlighted double ring + halo */}
            {n.major && (
              <circle cx={n.x} cy={n.y} r={rr + 12} fill={accent} opacity={0.09} />
            )}
            {n.major && (
              <circle cx={n.x} cy={n.y} r={rr + 7} fill="none" stroke={accent}
                strokeWidth={1} opacity={0.55} strokeDasharray="2 4" />
            )}
            <circle cx={n.x} cy={n.y} r={rr + 3} fill="none" stroke={n.uncertain ? CATEGORY_COLORS.conflict : accent}
              strokeWidth={n.major ? 2.4 : 1.2} strokeDasharray={n.uncertain ? '4 3' : undefined}
              opacity={n.major ? 1 : 0.7} />
            {showImg
              ? <image href={n.img} x={n.x - rr} y={n.y - rr} width={rr * 2} height={rr * 2}
                  clipPath={`url(#ggclip-${n.id})`} preserveAspectRatio="xMidYMid slice" onError={() => setImgFailed(n.id)} />
              : <circle cx={n.x} cy={n.y} r={rr} fill="color-mix(in srgb, var(--gold) 14%, var(--bg-2))" stroke={accent} strokeWidth={n.major ? 1.6 : 1} />}
            <text x={n.x} y={n.y + rr + pxFont(16)} textAnchor="middle"
              fill={n.major ? 'var(--ink-0)' : 'var(--ink-1)'}
              style={{ fontFamily: 'var(--font-display)', fontSize: pxFont(n.major ? 14 : 12), fontWeight: n.major ? 700 : 600,
                paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: pxFont(3) }}>
              {nameFor(n.name, n.major ? 14 : 12, NODE_W * k)}
            </text>
            {tier === 'close' && (
              <>
                <text x={n.x} y={n.y + rr + pxFont(28)} textAnchor="middle" fill={accent}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(8.5), textTransform: 'uppercase', letterSpacing: 1,
                    paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: pxFont(3) }}>
                  {n.classification}
                </text>
                {n.domain && <text x={n.x} y={n.y + rr + pxFont(40)} textAnchor="middle" fill="var(--ink-1)"
                  style={{ fontFamily: 'var(--font-body)', fontSize: pxFont(8.5) }}>{nameFor(n.domain, 8.5, NODE_W * 1.6 * k)}</text>}
                <text x={n.x} y={n.y + rr + pxFont(52)} textAnchor="middle" fill="var(--ink-2)"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: pxFont(7.5) }}>{n.relCount} relations</text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
