'use client';
// RelationshipGraph — custom SVG graph (no external dep):
//   RING mode (centerId given — deity/culture pages): ring layout around a
//   focus entity, typed/colored edges, pan/zoom, category filter chips, focus
//   actions, legend, and a linear text fallback. Unchanged behavior.
//   FULL-ATLAS mode (no centerId — the /graph Relationships tab, Phase 2):
//   deterministic force-directed, culture-clustered layout with search,
//   selection + detail panel, touch pinch-zoom and pointer-anchored wheel zoom.
import { useMemo, useRef, useState, useEffect, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraphData, Relationship, Entity, EdgeCategory,
  CATEGORY_COLORS, categoryOf, CULTURE_NAMES, CULTURE_ACCENTS,
} from '../lib/types';

const CATS: EdgeCategory[] = ['family', 'marriage', 'creation', 'conflict', 'alliance', 'association', 'artifact'];
const CAT_LABELS: Record<EdgeCategory, string> = {
  family: 'Family', marriage: 'Marriage', creation: 'Creation',
  conflict: 'Conflict', alliance: 'Alliance', association: 'Domain & Rule',
  artifact: 'Artifacts',
};
type Focus = 'all' | 'ancestors' | 'descendants' | 'enemies' | 'myths';

type Node = { id: string; x: number; y: number; name: string; classification: string; img?: string; href?: string };
type Edge = { from: string; to: string; rel: Relationship; cat: EdgeCategory; bidir: boolean };
type ClusterLabel = { x: number; y: number; text: string; culture: string };
type Pt = { x: number; y: number };

// Round layout math before rendering: Math.cos/sin can differ by 1 ulp between
// the Node (SSR) and browser (hydration) builds, which React flags as a
// hydration mismatch. 1/100 SVG-unit precision is far below sub-pixel.
const r2 = (n: number) => Math.round(n * 100) / 100;
const r4 = (n: number) => Math.round(n * 10000) / 10000;
const clampK = (k: number) => Math.min(4, Math.max(0.3, k));
const cultureLabel = (c: string) => CULTURE_NAMES[c] || c;

// Best-image URL per entity (hero first, else first linked artwork with a direct image).
// Preloaded at build time: SVG <image> can't lazy-load, so nodes without a
// resolved URL fall back to the plain seal (initials) — never a broken image.
function entityImageMap(data: GraphData): Record<string, string> {
  const artById = new Map(data.artworks.map((a) => [a.id, a]));
  const out: Record<string, string> = {};
  for (const e of data.entities) {
    const cands = [e.hero_artwork, ...(e.artworks || [])].filter(Boolean) as string[];
    for (const aid of cands) {
      const u = artById.get(aid)?.image_url;
      if (u) { out[e.id] = u; break; }
    }
  }
  // Artifacts: keyed by artifact id (node id = artifact id; the node carries
  // an explicit href to its /artifacts/<slug> page).
  for (const a of data.artifacts) {
    if (a.artwork.image_url) out[a.id] = a.artwork.image_url;
  }
  return out;
}

// Dispatcher — centered graphs get the (unchanged) ring component; the full
// atlas gets the Phase-2 force layout. No hooks here, so the branch is safe.
export function RelationshipGraph({ data, centerId }: { data: GraphData; centerId?: string }) {
  const center = centerId ? data.entities.find((e) => e.id === centerId) : undefined;
  if (center) return <RingGraph data={data} center={center} />;
  return <FullAtlasGraph data={data} />;
}

// ============================================================
// RING MODE — centered graph used on deity / culture pages.
// ============================================================
function RingGraph({ data, center }: { data: GraphData; center: Entity }) {
  const centerId = center.id;
  const router = useRouter();
  const clipId = useId().replace(/:/g, '');
  const [cats, setCats] = useState<Set<EdgeCategory>>(new Set(CATS));
  const [focus, setFocus] = useState<Focus>('all');
  const [hover, setHover] = useState<Edge | null>(null);
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  // entity id -> best image URL (artwork linked to that entity)
  const imgMap = useMemo(() => entityImageMap(data), [data]);

  // ---- subgraph selection + layout (ring along BFS depth) ----
  const { nodes, edges, clusterLabels } = useMemo(() => {
    // which edges survive filters?
    let pool = data.relationships.filter((r) => cats.has(categoryOf(r.type)));
    const ids = new Set<string>([centerId]);
    if (focus === 'ancestors' || focus === 'descendants' || focus === 'enemies') {
      pool = data.relationships; // recompute by traversal below
      const keep = new Set<string>();
      if (focus === 'ancestors') walkUp(keep, centerId, data.relationships);
      if (focus === 'descendants') walkDown(keep, centerId, data.relationships);
      if (focus === 'enemies') {
        for (const r of data.relationships) {
          if ((r.from === centerId && (r.type === 'ENEMY_OF' || r.type === 'FOUGHT' || r.type === 'KILLED')) ||
              (r.to === centerId && (r.type === 'ENEMY_OF' || r.type === 'FOUGHT' || r.type === 'KILLED'))) {
            keep.add(r.from); keep.add(r.to);
          }
        }
      }
      keep.forEach((x) => ids.add(x));
      pool = data.relationships.filter((r) => ids.has(r.from) && ids.has(r.to));
    } else if (focus === 'myths') {
      // all entities sharing a myth with center
      const mythIds = new Set(center.major_myths || []);
      for (const m of data.myths) if (m.participants.includes(centerId)) mythIds.add(m.id);
      const keep = new Set<string>([centerId]);
      for (const m of data.myths) if (mythIds.has(m.id)) m.participants.forEach((p) => keep.add(p));
      keep.forEach((x) => ids.add(x));
      pool = data.relationships.filter((r) => ids.has(r.from) && ids.has(r.to));
    } else {
      // 'all': center + full neighborhood (both directions, 2 rings)
      const seen = new Set<string>([centerId]);
      let frontier = [centerId];
      for (let d = 0; d < 2; d++) {
        const next: string[] = [];
        for (const n of frontier) for (const r of pool) {
          if (r.from === n && !seen.has(r.to)) { seen.add(r.to); next.push(r.to); }
          if (r.to === n && !seen.has(r.from)) { seen.add(r.from); next.push(r.from); }
        }
        frontier = next;
      }
      seen.forEach((x) => ids.add(x));
      pool = pool.filter((r) => ids.has(r.from) && ids.has(r.to));
    }

    // ---- ring layout by BFS depth from center ----
    const depth = new Map<string, number>([[centerId, 0]]);
    let frontier = [centerId];
    for (let d = 1; d < 5 && frontier.length; d++) {
      const next: string[] = [];
      for (const n of frontier) for (const r of pool) {
        let other = null;
        if (r.from === n) other = r.to;
        if (r.to === n) other = r.from;
        if (other && !depth.has(other)) { depth.set(other, d); next.push(other); }
      }
      frontier = next;
    }
    const rings: Record<number, string[]> = {};
    for (const [id, d] of depth) (rings[d] ||= []).push(id);
    // Resolve a node label/classification from either an entity OR an artifact
    // (artifact edges introduce artifact ids into the neighborhood).
    const artById = new Map(data.artifacts.map((x) => [x.id, x]));
    const resolve = (id: string): { name: string; classification: string; href?: string } | null => {
      const e = data.entities.find((x) => x.id === id);
      if (e) return { name: e.name, classification: e.classification };
      const art = artById.get(id);
      if (art) return { name: art.name, classification: 'object', href: `/artifacts/${art.slug}` };
      return null;
    };
    const CX = 400, CY = 260;
    const c0 = resolve(centerId);
    const nodeMap: Record<string, Node> = {
      [centerId]: { id: centerId, x: CX, y: CY, name: c0?.name || center.name, classification: c0?.classification || center.classification, img: imgMap[centerId] },
    };
    for (let d = 1; d <= 4; d++) {
      const ring = rings[d] || [];
      if (!ring.length) continue;
      const R = 110 * d;
      ring.forEach((id, i) => {
        const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
        const r = resolve(id);
        if (!r) return; // unknown id — skip, never crash
        nodeMap[id] = { id, x: r2(CX + R * Math.cos(a)), y: r2(CY + R * Math.sin(a) * 0.72), name: r.name, classification: r.classification, img: imgMap[id], href: r.href };
      });
    }
    const edgeList: Edge[] = pool
      .filter((r) => nodeMap[r.from] && nodeMap[r.to] && r.from !== r.to)
      .map((r) => ({ from: r.from, to: r.to, rel: r, cat: categoryOf(r.type), bidir: isSym(r.type) }));
    return { nodes: Object.values(nodeMap), edges: edgeList, clusterLabels: [] as ClusterLabel[] };
  }, [data, center, centerId, cats, focus, imgMap]);

  // View transform: identity for a centered graph.
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });

  const byId = useMemo(() => new Map(data.entities.map((e) => [e.id, e])), [data]);
  const artById = useMemo(() => new Map(data.artifacts.map((a) => [a.id, a])), [data]);
  // Resolve an endpoint id to {name, href} — entities go to /deity, artifacts to /artifacts.
  const endpoint = (id: string): { name: string; href: string } => {
    const e = byId.get(id);
    if (e) return { name: e.name, href: `/deity/${e.id}` };
    const a = artById.get(id);
    if (a) return { name: a.name, href: `/artifacts/${a.slug}` };
    return { name: id, href: '#' };
  };

  // ---- pan & zoom ----
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    setView((v) => ({ ...v, x: drag.current!.ox + dx, y: drag.current!.oy + dy }));
  };
  const onPointerUp = () => { drag.current = null; };
  const zoom = useCallback((f: number) => setView((v) => {
    const k = Math.min(3, Math.max(0.4, v.k * f));
    return { ...v, k };
  }), []);

  // keyboard nav: arrow keys zoom/pan
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === '+' || e.key === '=') zoom(1.15);
      if (e.key === '-') zoom(0.87);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const toggleCat = (c: EdgeCategory) => setCats((prev) => {
    const n = new Set(prev);
    if (n.has(c)) { if (n.size > 1) n.delete(c); } else n.add(c);
    return n;
  });

  const FOCUS_LABELS: Record<Focus, string> = {
    all: 'Entire pantheon', ancestors: 'Ancestors', descendants: 'Descendants',
    enemies: 'Enemies & conflicts', myths: 'Myths',
  };

  const strokeFor = (e: Edge) => CATEGORY_COLORS[e.cat];
  const dashFor = (r: Relationship) => r.confidence === 'disputed' ? '6 5' : r.confidence === 'reconstructed' ? '2 4' : undefined;

  return (
    <div>
      {/* controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {CATS.map((c) => (
          <button key={c} className={`chip-btn ${cats.has(c) ? 'active' : ''}`} onClick={() => toggleCat(c)}
            aria-pressed={cats.has(c)}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c], marginRight: 6 }} />
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        {(Object.keys(FOCUS_LABELS) as Focus[]).map((f) => (
          <button key={f} className={`chip-btn ${focus === f ? 'active' : ''}`} onClick={() => setFocus(f)}>
            {FOCUS_LABELS[f]}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="chip-btn" onClick={() => zoom(1.25)} aria-label="Zoom in">+</button>
          <button className="chip-btn" onClick={() => zoom(0.8)} aria-label="Zoom out">−</button>
          <button className="chip-btn" onClick={() => setView({ x: 0, y: 0, k: 1 })}>Reset</button>
        </span>
      </div>

      {/* canvas */}
      <div style={{ position: 'relative', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
        <svg ref={svgRef} viewBox="0 0 800 520" role="group"
          aria-label={`Relationship graph centered on ${center.name}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab', touchAction: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.12 : 0.89)}>
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`} style={{ transformOrigin: '400px 260px' }}>
            {clusterLabels.map((l) => (
              <text key={l.culture} x={l.x} y={l.y} textAnchor="middle"
                fill={CULTURE_ACCENTS[l.culture] || 'var(--gold)'} opacity={0.9}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2 }}>
                {l.text}
              </text>
            ))}
            {edges.map((e, i) => {
              const a = nodes.find((n) => n.id === e.from)!;
              const b = nodes.find((n) => n.id === e.to)!;
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
              const edgeLabel = `${CAT_LABELS[e.cat]}${e.rel.confidence !== 'attested' ? ` (${e.rel.confidence})` : ''}: ${endpoint(e.from).name} — ${endpoint(e.to).name}`;
              return (
                <g key={i}
                  role="img" aria-label={edgeLabel}
                  onMouseEnter={() => setHover(e)} onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={strokeFor(e)} strokeWidth={hover === e ? 2.4 : 1.3}
                    strokeDasharray={dashFor(e.rel)} opacity={hover === e ? 1 : 0.65} />
                  <circle cx={mid.x} cy={mid.y} r={4.5} fill={strokeFor(e)}
                    opacity={hover === e ? 1 : 0.8} />
                  {/* wide invisible hit area */}
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={12} />
                </g>
              );
            })}
            {/* clip defs for artwork portraits */}
            <defs>
              {nodes.map((n) => (
                <clipPath key={n.id} id={clipId + n.id}>
                  <circle cx={n.x} cy={n.y} r={n.id === centerId ? 34 : 26} />
                </clipPath>
              ))}
            </defs>
            {nodes.map((n) => {
              const isCenter = n.id === centerId;
              const r = isCenter ? 34 : 26;
              const showImg = !!n.img && !imgFailed.has(n.id);
              return (
                <g key={n.id}
                  onClick={() => { if (!drag.current?.moved) router.push(n.href || `/deity/${n.id}`); }}
                  onMouseEnter={() => (document.body.style.cursor = 'pointer')}
                  onMouseLeave={() => (document.body.style.cursor = 'grab')}
                  style={{ cursor: 'pointer' }}>
                  <circle cx={n.x} cy={n.y} r={r}
                    fill={isCenter ? 'color-mix(in srgb, var(--accent) 22%, var(--bg-2))' : 'var(--bg-2)'}
                    stroke={isCenter ? 'var(--accent)' : 'var(--line)'} strokeWidth={isCenter ? 2 : 1.2} />
                  {showImg && (
                    <image href={n.img} x={n.x - r} y={n.y - r} width={r * 2} height={r * 2}
                      preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId}${n.id})`}
                      opacity={0.92}
                      onError={() => setImgFailed((p) => new Set(p).add(n.id))} />
                  )}
                  {showImg ? (
                    <>
                      <rect x={n.x - 26} y={n.y + r - 14} width={52} height={11} rx={3}
                        fill="var(--bg-0)" opacity={0.78} />
                      <text x={n.x} y={n.y + r - 5.5} textAnchor="middle" fill="var(--ink-1)"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 6.5, letterSpacing: 0.5 }}>
                        {n.classification.toUpperCase()}
                      </text>
                    </>
                  ) : (
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fill="var(--ink-2)"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: 0.6 }}>
                      {n.classification.toUpperCase()}
                    </text>
                  )}
                  <text x={n.x} y={n.y - (isCenter ? 34 : 34)} textAnchor="middle"
                    fill={isCenter ? 'var(--accent)' : 'var(--ink-0)'}
                    style={{ fontFamily: 'var(--font-display)', fontSize: isCenter ? 17 : 13.5, fontWeight: 600 }}>
                    {n.name}
                  </text>
                </g>
              );
            })}
          </g>
          {/* hover tooltip (screen coords approx) */}
          {hover && edges.some((e) => e.from === hover.from && e.to === hover.to) && (
            <foreignObject x="12" y="12" width="330" height="90">
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--ink-0)' }}>
                <div style={{ color: CATEGORY_COLORS[hover.cat], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                  {hover.rel.type}{hover.rel.confidence !== 'attested' && ` · ${hover.rel.confidence}`}
                </div>
                <div>{hover.rel.note}</div>
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* legend — exposed to assistive tech (DES-004) */}
      <div className="mono" style={{ marginTop: 12 }}>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: 0, padding: 0, listStyle: 'none' }} aria-label="Edge types shown in the graph">
          {CATS.map((c) => (
            <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-1)', fontSize: '0.62rem' }}>
              <span style={{ width: 18, height: 0, borderTop: `2px solid ${CATEGORY_COLORS[c]}` }} /> {CAT_LABELS[c]}
            </li>
          ))}
          <li style={{ color: 'var(--ink-2)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 0, borderTop: '2px dashed var(--ink-2)' }} /> disputed
          </li>
          <li style={{ color: 'var(--ink-2)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 0, borderTop: '2px dotted var(--ink-2)' }} /> reconstructed
          </li>
        </ul>
      </div>

      {/* screen-reader / linear fallback */}
      <details style={{ marginTop: 16 }}>
        <summary className="mono" style={{ cursor: 'pointer', color: 'var(--ink-2)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Text list of shown relationships ({edges.length})
        </summary>
        <div className="rel-list" style={{ marginTop: 12 }}>
          {edges.map((e, i) => (
            <div key={i} className="rel-item">
              <span className={`rel-type conf-${e.rel.confidence}`} style={{ color: strokeFor(e) }}>{e.rel.type}</span>
              <span className="rel-note">
                <a href={endpoint(e.from).href}>{endpoint(e.from).name}</a> → <a href={endpoint(e.to).href}>{endpoint(e.to).name}</a> — {e.rel.note}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ============================================================
// FULL-ATLAS MODE (Phase 2) — deterministic force layout.
// ============================================================
type AtlasNode = {
  id: string; x: number; y: number; name: string; classification: string;
  culture: string; img?: string; href: string; artifact: boolean;
  degree: number; domains: string[];
};
type SearchHit = { id: string; label: string; sub: string; kind: 'entity' | 'artifact' };

function FullAtlasGraph({ data }: { data: GraphData }) {
  const router = useRouter();
  const [cats, setCats] = useState<Set<EdgeCategory>>(new Set(CATS));
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<Edge | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [sheetDy, setSheetDy] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef(view);
  const pointers = useRef<Map<number, Pt>>(new Map());
  const panRef = useRef<{ start: Pt; origin: Pt } | null>(null);
  const pinchRef = useRef<{ dist: number; mid: Pt; k: number; view: Pt } | null>(null);
  const drag = useRef<{ moved: boolean; pointerId?: number } | null>(null);
  const sheetDrag = useRef<{ startY: number } | null>(null);

  useEffect(() => { viewRef.current = view; }, [view]);

  // pointer devices only (spec: hover is a pointer affordance)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover)');
    setHoverCapable(mq.matches);
    const on = () => setHoverCapable(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const imgMap = useMemo(() => entityImageMap(data), [data]);

  // ---- deterministic culture-clustered force layout (pure fn of data + cats) ----
  const { nodes, edges, clusterLabels } = useMemo(() => atlasLayout(data, cats, imgMap), [data, cats, imgMap]);
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Fit on mount and whenever the node set changes (category filters).
  useEffect(() => { setView(fitToView(nodes, clusterLabels)); }, [nodes, clusterLabels]);

  // Drop a selection whose node disappeared (culture filter upstream).
  useEffect(() => {
    if (selectedId && !nodeById.has(selectedId)) setSelectedId(null);
  }, [selectedId, nodeById]);

  const selected = selectedId ? nodeById.get(selectedId) : undefined;

  // Esc clears selection.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  // +/- zoom about the canvas centre (buttons cover the rest)
  const zoomBy = useCallback((f: number) => setView((v) => {
    const k = clampK(v.k * f);
    const cx = 400, cy = 260;
    const wx = (cx - v.x) / v.k, wy = (cy - v.y) / v.k;
    return { x: r4(cx - k * wx), y: r4(cy - k * wy), k: r4(k) };
  }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '+' || e.key === '=') zoomBy(1.15);
      if (e.key === '-') zoomBy(0.87);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomBy]);

  const toggleCat = (c: EdgeCategory) => setCats((prev) => {
    const n = new Set(prev);
    if (n.has(c)) { if (n.size > 1) n.delete(c); } else n.add(c);
    return n;
  });

  // ---- pointer → viewBox coords ----
  const toSvg = useCallback((clientX: number, clientY: number): Pt => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint();
    p.x = clientX; p.y = clientY;
    const t = p.matrixTransform(m.inverse());
    return { x: t.x, y: t.y };
  }, []);

  // wheel zoom about the cursor (non-passive so we can prevent page scroll)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toSvg(e.clientX, e.clientY);
      setView((v) => {
        const k = clampK(v.k * (e.deltaY < 0 ? 1.12 : 0.89));
        const wx = (p.x - v.x) / v.k, wy = (p.y - v.y) / v.k;
        return { x: r4(p.x - k * wx), y: r4(p.y - k * wy), k: r4(k) };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [toSvg]);

  const onPointerDown = (e: React.PointerEvent) => {
    const p = toSvg(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);
    // NB: do NOT setPointerCapture here — capturing on the SVG retargets the
    // subsequent click to the SVG and node clicks never fire. Capture lazily
    // once a drag actually starts (see onPointerMove).
    if (pointers.current.size === 1) {
      panRef.current = { start: p, origin: { x: viewRef.current.x, y: viewRef.current.y } };
      drag.current = { moved: false, pointerId: e.pointerId };
    } else if (pointers.current.size === 2) {
      panRef.current = null;
      const [a, b] = [...pointers.current.values()];
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        k: viewRef.current.k,
        view: { x: viewRef.current.x, y: viewRef.current.y },
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = toSvg(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const pr = pinchRef.current;
      const k = clampK(pr.k * (dist / pr.dist));
      const wx = (pr.mid.x - pr.view.x) / pr.k, wy = (pr.mid.y - pr.view.y) / pr.k;
      setView({ x: r4(mid.x - k * wx), y: r4(mid.y - k * wy), k: r4(k) });
      if (drag.current) drag.current.moved = true;
    } else if (panRef.current) {
      const dx = p.x - panRef.current.start.x, dy = p.y - panRef.current.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 3 && drag.current) {
        if (!drag.current.moved && drag.current.pointerId !== undefined) {
          // drag genuinely started: capture now so panning continues outside the SVG
          (e.currentTarget as Element).setPointerCapture?.(drag.current.pointerId);
        }
        drag.current.moved = true;
      }
      setView((v) => ({ ...v, x: r4(panRef.current!.origin.x + dx), y: r4(panRef.current!.origin.y + dy) }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) panRef.current = null;
  };

  // select + centre a node in the viewport
  const selectNode = useCallback((id: string) => {
    const n = nodeById.get(id);
    setSelectedId(id);
    setSearchOpen(false);
    setQ('');
    setSheetDy(0);
    if (n) setView((v) => ({ x: r4(400 - v.k * n.x), y: r4(260 - v.k * n.y), k: v.k }));
  }, [nodeById]);

  const resetView = () => { setView(fitToView(nodes, clusterLabels)); setSelectedId(null); };

  // ---- search ----
  const hits = useMemo<SearchHit[]>(() => {
    const qn = q.toLowerCase().trim();
    if (!qn) return [];
    const out: SearchHit[] = [];
    for (const e of data.entities) {
      const hay = [e.name, e.native_name, ...(e.alternative_names || []), ...(e.domains || [])].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(qn)) out.push({ id: e.id, label: e.name, sub: `${e.classification} · ${cultureLabel(e.culture)}`, kind: 'entity' });
    }
    for (const a of data.artifacts) {
      const hay = [a.name, a.native_name, ...(a.alternative_names || []), ...(a.domains || [])].filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(qn)) out.push({ id: a.id, label: a.name, sub: `${a.artifact_type} · ${cultureLabel(a.culture)}`, kind: 'artifact' });
    }
    return out.slice(0, 8);
  }, [q, data]);

  useEffect(() => { setActive(0); }, [q]);
  const pickHit = (h: SearchHit) => selectNode(h.id);

  const neighbors = useMemo(() => {
    if (!selectedId) return null;
    const s = new Set<string>([selectedId]);
    for (const e of edges) {
      if (e.from === selectedId) s.add(e.to);
      if (e.to === selectedId) s.add(e.from);
    }
    return s;
  }, [selectedId, edges]);

  const nodeOpacity = (id: string) => (!selectedId ? 1 : neighbors!.has(id) ? 1 : 0.12);
  const edgeOpacity = (e: Edge) => {
    if (hover === e) return 0.9;
    if (!selectedId) return 0.35;
    return e.from === selectedId || e.to === selectedId ? 0.9 : 0.12;
  };

  const strokeFor = (e: Edge) => CATEGORY_COLORS[e.cat];
  const dashFor = (r: Relationship) => r.confidence === 'disputed' ? '6 5' : r.confidence === 'reconstructed' ? '2 4' : undefined;
  const edgeLabel = (e: Edge) => `${CAT_LABELS[e.cat]}${e.rel.confidence !== 'attested' ? ` (${e.rel.confidence})` : ''}: ${nodeById.get(e.from)?.name ?? e.from} — ${nodeById.get(e.to)?.name ?? e.to}`;

  // ---- detail panel drag-down-to-close ----
  const onSheetDown = (e: React.PointerEvent) => {
    sheetDrag.current = { startY: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onSheetMove = (e: React.PointerEvent) => {
    if (!sheetDrag.current) return;
    setSheetDy(Math.max(0, e.clientY - sheetDrag.current.startY));
  };
  const onSheetUp = () => {
    if (sheetDy > 80) { setSelectedId(null); }
    setSheetDy(0);
    sheetDrag.current = null;
  };

  const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div>
      {/* category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {CATS.map((c) => (
          <button key={c} className={`chip-btn ${cats.has(c) ? 'active' : ''}`} onClick={() => toggleCat(c)}
            aria-pressed={cats.has(c)}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c], marginRight: 6 }} />
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* search + zoom controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div className="graph-search-wrap" style={{ position: 'relative' }}>
          <input
            className="select-ctl graph-search-input"
            value={q}
            onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === 'Enter') { if (hits[active]) { e.preventDefault(); pickHit(hits[active]); } }
              else if (e.key === 'Escape') { e.preventDefault(); setSearchOpen(false); setQ(''); }
            }}
            placeholder="Find a god or relic…"
            aria-label="Find a god or relic"
            role="combobox"
            aria-expanded={searchOpen && hits.length > 0}
            aria-controls="graph-search-results"
            autoComplete="off"
          />
          {searchOpen && hits.length > 0 && (
            <div className="graph-search-dd" id="graph-search-results" role="listbox">
              {hits.map((h, i) => (
                <button key={h.id} type="button" role="option" aria-selected={i === active}
                  className={`graph-search-item ${i === active ? 'active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); pickHit(h); }}
                  onMouseEnter={() => setActive(i)}>
                  <span className={`search-kind kind-${h.kind}`}>{h.kind}</span>
                  <span>{h.label}</span>
                  <span className="faint" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{h.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="chip-btn" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
          <button className="chip-btn" onClick={() => zoomBy(0.8)} aria-label="Zoom out">−</button>
          <button className="chip-btn" onClick={resetView}>Reset</button>
        </span>
      </div>

      {/* canvas */}
      <div style={{ position: 'relative', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
        <svg ref={svgRef} viewBox="0 0 800 520" role="group"
          aria-label={`Cross-culture relationship graph, ${nodes.length} entities and relics across ${clusterLabels.length} traditions`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab', touchAction: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onClick={(e) => { if (e.target === e.currentTarget && !drag.current?.moved) setSelectedId(null); }}>
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            {/* culture cluster labels */}
            {clusterLabels.map((l) => (
              <text key={l.culture} x={l.x} y={l.y} textAnchor="middle"
                fill={CULTURE_ACCENTS[l.culture] || 'var(--gold)'} opacity={0.75}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2 }}>
                {l.text}
              </text>
            ))}
            {/* edges */}
            {edges.map((e, i) => {
              const a = nodeById.get(e.from)!;
              const b = nodeById.get(e.to)!;
              return (
                <g key={i} className="graph-fade" role="img" aria-label={edgeLabel(e)}
                  onMouseEnter={hoverCapable ? () => setHover(e) : undefined}
                  onMouseLeave={hoverCapable ? () => setHover(null) : undefined}
                  opacity={edgeOpacity(e)}
                  style={{ cursor: 'pointer' }}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={strokeFor(e)} strokeWidth={hover === e ? 2.4 : 1.3}
                    strokeDasharray={dashFor(e.rel)} />
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={12} />
                </g>
              );
            })}
            {/* nodes */}
            {nodes.map((n) => {
              const r = Math.min(26, Math.max(10, 10 + 2.2 * Math.sqrt(n.degree)));
              const color = CULTURE_ACCENTS[n.culture] || 'var(--gold)';
              const showLabel = n.degree >= 4 || view.k >= 1.2 || hoverNode === n.id || selectedId === n.id;
              return (
                <g key={n.id} className="graph-node graph-fade"
                  role="link" tabIndex={0}
                  aria-label={`${n.name}, ${cultureLabel(n.culture)}`}
                  opacity={nodeOpacity(n.id)}
                  style={{ cursor: 'pointer' }}
                  onClick={(ev) => { ev.stopPropagation(); if (!drag.current?.moved) selectNode(n.id); }}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectNode(n.id); } }}
                  onMouseEnter={hoverCapable ? () => setHoverNode(n.id) : undefined}
                  onMouseLeave={hoverCapable ? () => setHoverNode((cur) => (cur === n.id ? null : cur)) : undefined}>
                  {n.artifact ? (
                    <rect x={n.x - r} y={n.y - r} width={r * 2} height={r * 2} rx={6}
                      fill={color} stroke="var(--bg-0)" strokeWidth={1.5} />
                  ) : (
                    <circle cx={n.x} cy={n.y} r={r} fill={color} stroke="var(--bg-0)" strokeWidth={1.5} />
                  )}
                  {selectedId === n.id && (
                    <circle cx={n.x} cy={n.y} r={r + 3.5} fill="none" stroke={color} strokeWidth={1.2} opacity={0.9} />
                  )}
                  {showLabel && (
                    <text x={n.x} y={n.y + r + 11} textAnchor="middle" fill="var(--ink-1)"
                      stroke="var(--bg-0)" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: n.degree >= 8 ? 11 : 9 }}>
                      {n.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          {/* edge hover tooltip */}
          {hover && edges.some((e) => e.from === hover.from && e.to === hover.to) && (
            <foreignObject x="12" y="12" width="330" height="90">
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--ink-0)' }}>
                <div style={{ color: CATEGORY_COLORS[hover.cat], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                  {hover.rel.type}{hover.rel.confidence !== 'attested' && ` · ${hover.rel.confidence}`}
                </div>
                <div>{hover.rel.note}</div>
              </div>
            </foreignObject>
          )}
        </svg>

        {/* detail panel */}
        {selected && (
          <aside className="graph-detail" aria-label={`Details for ${selected.name}`}
            style={sheetDy ? { transform: `translateY(${sheetDy}px)` } : undefined}>
            <div className="graph-detail-grip" onPointerDown={onSheetDown} onPointerMove={onSheetMove}
              onPointerUp={onSheetUp} onPointerCancel={onSheetUp} aria-hidden="true" />
            <button className="chip-btn graph-detail-close" onClick={() => setSelectedId(null)} aria-label="Close details">×</button>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {selected.img && !imgFailed.has(selected.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="graph-detail-portrait" src={selected.img} alt=""
                  onError={() => setImgFailed((p) => new Set(p).add(selected.id))} />
              ) : (
                <div className="graph-detail-seal" style={{ color: CULTURE_ACCENTS[selected.culture] || 'var(--gold)' }}>
                  {initials(selected.name)}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.1 }}>
                  {selected.name}
                </div>
                <span className="graph-detail-badge" style={{ background: CULTURE_ACCENTS[selected.culture] || 'var(--gold)', marginTop: 6 }}>
                  {cultureLabel(selected.culture)}
                </span>
                <div className="mono" style={{ marginTop: 6, color: 'var(--ink-2)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {selected.classification}
                </div>
              </div>
            </div>
            {selected.domains.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {selected.domains.slice(0, 4).map((d) => (
                  <span key={d} className="chip" style={{ margin: 0 }}>{d}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              <a className="btn" href={selected.href}>Open profile</a>
              <button className="btn" onClick={() => router.push('/graph?from=' + selected.id)}>Center on this</button>
            </div>
          </aside>
        )}
      </div>

      {/* legend */}
      <div className="mono" style={{ marginTop: 12 }}>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: 0, padding: 0, listStyle: 'none' }} aria-label="Edge types shown in the graph">
          {CATS.map((c) => (
            <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-1)', fontSize: '0.62rem' }}>
              <span style={{ width: 18, height: 0, borderTop: `2px solid ${CATEGORY_COLORS[c]}` }} /> {CAT_LABELS[c]}
            </li>
          ))}
          <li style={{ color: 'var(--ink-2)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 0, borderTop: '2px dashed var(--ink-2)' }} /> disputed
          </li>
          <li style={{ color: 'var(--ink-2)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 0, borderTop: '2px dotted var(--ink-2)' }} /> reconstructed
          </li>
          {clusterLabels.length > 0 && (
            <li style={{ color: 'var(--ink-2)', fontSize: '0.62rem' }}>· each cluster is one tradition</li>
          )}
        </ul>
      </div>

      {/* screen-reader / linear fallback */}
      <details style={{ marginTop: 16 }}>
        <summary className="mono" style={{ cursor: 'pointer', color: 'var(--ink-2)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Text list of shown relationships ({edges.length})
        </summary>
        <div className="rel-list" style={{ marginTop: 12 }}>
          {edges.map((e, i) => {
            const a = nodeById.get(e.from)!;
            const b = nodeById.get(e.to)!;
            return (
              <div key={i} className="rel-item">
                <span className={`rel-type conf-${e.rel.confidence}`} style={{ color: strokeFor(e) }}>{e.rel.type}</span>
                <span className="rel-note">
                  <a href={a.href}>{a.name}</a> → <a href={b.href}>{b.name}</a> — {e.rel.note}
                </span>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}

// Symmetric relations render undirected (no arrowhead implied).
const isSym = (t: string) => ['SIBLING_OF', 'PARTNER_OF', 'ALLY_OF', 'ENEMY_OF', 'FOUGHT', 'ASSOCIATED_WITH'].includes(t);

// ---- full-atlas deterministic layout ----
/**
 * Culture-clustered force-directed layout (Fruchterman-Reingold style).
 * Pure and deterministic: seeded by data order (no Math.random), Math.cos/sin
 * positions rounded through r2() every iteration so SSR and the browser agree
 * bit-for-bit. Anchors sit on a circle of radius 300 around (400, 260);
 * within each cluster nodes start on a golden-angle spiral.
 */
function atlasLayout(
  data: GraphData,
  cats: Set<EdgeCategory>,
  imgMap: Record<string, string>,
): { nodes: AtlasNode[]; edges: Edge[]; clusterLabels: ClusterLabel[] } {
  // 1. visible nodes = every entity + artifact, tagged for shape/href.
  type Seed = { id: string; name: string; classification: string; culture: string; img?: string; href: string; artifact: boolean; domains: string[] };
  const seeds: Seed[] = [];
  for (const e of data.entities) {
    seeds.push({ id: e.id, name: e.name, classification: e.classification, culture: e.culture, img: imgMap[e.id], href: `/deity/${e.id}`, artifact: false, domains: e.domains || [] });
  }
  for (const a of data.artifacts) {
    seeds.push({ id: a.id, name: a.name, classification: a.artifact_type || 'object', culture: a.culture, img: imgMap[a.id], href: `/artifacts/${a.slug}`, artifact: true, domains: a.domains || [] });
  }

  // 2. cluster membership + culture anchors (ordered by culture display name).
  const byCulture = new Map<string, string[]>();
  for (const s of seeds) { const arr = byCulture.get(s.culture) || []; arr.push(s.id); byCulture.set(s.culture, arr); }
  const cultures = [...byCulture.keys()].sort((a, b) => cultureLabel(a).localeCompare(cultureLabel(b)));
  const CX = 400, CY = 260, AR = 300;
  const anchor = new Map<string, Pt>();
  cultures.forEach((c, i) => {
    const a = (i / cultures.length) * Math.PI * 2 - Math.PI / 2;
    anchor.set(c, { x: r2(CX + AR * Math.cos(a)), y: r2(CY + AR * Math.sin(a)) });
  });

  // 3. golden-angle spiral seed positions.
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const pos = new Map<string, Pt>();
  for (const c of cultures) {
    const list = byCulture.get(c)!;
    const a = anchor.get(c)!;
    list.forEach((id, j) => {
      const rad = 13 * Math.sqrt(j + 1);
      const ang = j * GOLDEN;
      pos.set(id, { x: r2(a.x + rad * Math.cos(ang)), y: r2(a.y + rad * Math.sin(ang)) });
    });
  }

  // 4. visible edges + degree.
  const pool = data.relationships.filter((r) => cats.has(categoryOf(r.type)));
  const edgeList: Edge[] = pool
    .filter((r) => pos.has(r.from) && pos.has(r.to) && r.from !== r.to)
    .map((r) => ({ from: r.from, to: r.to, rel: r, cat: categoryOf(r.type), bidir: isSym(r.type) }));
  const degree = new Map<string, number>();
  for (const e of edgeList) {
    degree.set(e.from, (degree.get(e.from) || 0) + 1);
    degree.set(e.to, (degree.get(e.to) || 0) + 1);
  }

  // 5. force sim (120 iterations, cooling temperature).
  const ids = seeds.map((s) => s.id);
  const n = ids.length;
  const idx = new Map(ids.map((id, i) => [id, i]));
  const px = new Float64Array(n), py = new Float64Array(n);
  const cul = new Array<string>(n);
  seeds.forEach((s, i) => { cul[i] = s.culture; const p = pos.get(s.id)!; px[i] = p.x; py[i] = p.y; });

  const ITER = 120;
  const AREA = 1600 * 1100;
  const k = Math.sqrt(AREA / Math.max(1, n));
  let temp = 20;
  const cool = temp / (ITER + 1);
  const dx = new Float64Array(n), dy = new Float64Array(n);
  for (let it = 0; it < ITER; it++) {
    for (let i = 0; i < n; i++) { dx[i] = 0; dy[i] = 0; }
    // repulsion (O(n²) is fine at ~180 nodes)
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let ddx = px[i] - px[j], ddy = py[i] - py[j];
      let d2 = ddx * ddx + ddy * ddy;
      if (d2 < 1e-4) { ddx = 0.01 + i * 0.0001; ddy = 0.01; d2 = ddx * ddx + ddy * ddy; }
      const d = Math.sqrt(d2);
      const f = ((k * k) / d) * 0.04;
      const ux = ddx / d, uy = ddy / d;
      dx[i] += f * ux; dy[i] += f * uy;
      dx[j] -= f * ux; dy[j] -= f * uy;
    }
    // spring attraction along edges (rest length 60, cross-culture weaker)
    for (const e of edgeList) {
      const i = idx.get(e.from)!, j = idx.get(e.to)!;
      const ddx = px[i] - px[j], ddy = py[i] - py[j];
      const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1e-4;
      const w = cul[i] === cul[j] ? 1 : 0.4;
      const f = (d - 60) * 0.3 * w;
      const ux = ddx / d, uy = ddy / d;
      dx[i] -= f * ux; dy[i] -= f * uy;
      dx[j] += f * ux; dy[j] += f * uy;
    }
    // weak pull toward the culture anchor so clusters stay separated
    for (let i = 0; i < n; i++) {
      const a = anchor.get(cul[i])!;
      dx[i] += (a.x - px[i]) * 0.8;
      dy[i] += (a.y - py[i]) * 0.8;
    }
    // displace, limited by the cooling temperature; round every pass (SSR==client)
    for (let i = 0; i < n; i++) {
      const dl = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 1;
      const lim = Math.min(dl, temp);
      px[i] = r2(px[i] + (dx[i] / dl) * lim);
      py[i] = r2(py[i] + (dy[i] / dl) * lim);
    }
    temp -= cool;
  }

  const nodes: AtlasNode[] = seeds.map((s) => {
    const i = idx.get(s.id)!;
    return { ...s, x: px[i], y: py[i], degree: degree.get(s.id) || 0 };
  });

  // cluster labels above each culture's settled block
  const clusterLabels: ClusterLabel[] = [];
  for (const c of cultures) {
    const list = byCulture.get(c)!;
    let sumX = 0, minY = Infinity;
    for (const id of list) { const i = idx.get(id)!; sumX += px[i]; minY = Math.min(minY, py[i]); }
    clusterLabels.push({ x: r2(sumX / list.length), y: r2(minY - 20), text: cultureLabel(c).toUpperCase(), culture: c });
  }

  return { nodes, edges: edgeList, clusterLabels };
}

/** Scale/translate so the node bounding box fits the 800×520 viewBox. */
function fitToView(nodes: AtlasNode[], labels: ClusterLabel[]): { x: number; y: number; k: number } {
  if (!nodes.length) return { x: 0, y: 0, k: 1 };
  const pad = 48, W = 800, H = 520;
  const minX = Math.min(...nodes.map((p) => p.x), ...labels.map((l) => l.x)) - pad;
  const maxX = Math.max(...nodes.map((p) => p.x), ...labels.map((l) => l.x)) + pad;
  const minY = Math.min(...nodes.map((p) => p.y), ...labels.map((l) => l.y)) - pad;
  const maxY = Math.max(...nodes.map((p) => p.y)) + pad;
  const k = r4(Math.min(W / (maxX - minX), H / (maxY - minY), 1.15));
  return { x: r4(W / 2 - k * (minX + (maxX - minX) / 2)), y: r4(H / 2 - k * (minY + (maxY - minY) / 2)), k };
}

function walkUp(keep: Set<string>, id: string, rels: Relationship[]) {
  let frontier = [id];
  for (let d = 0; d < 6; d++) {
    const next: string[] = [];
    for (const n of frontier) for (const r of rels) {
      if (r.type === 'PARENT_OF' && r.to === n && !keep.has(r.from)) { keep.add(r.from); next.push(r.from); }
    }
    if (!next.length) break;
    frontier = next;
  }
}
function walkDown(keep: Set<string>, id: string, rels: Relationship[]) {
  let frontier = [id];
  for (let d = 0; d < 6; d++) {
    const next: string[] = [];
    for (const n of frontier) for (const r of rels) {
      if (r.type === 'PARENT_OF' && r.from === n && !keep.has(r.to)) { keep.add(r.to); next.push(r.to); }
    }
    if (!next.length) break;
    frontier = next;
  }
}
