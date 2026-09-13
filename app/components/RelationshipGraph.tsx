'use client';
// RelationshipGraph — custom SVG graph (no external dep):
// ring layout around a focus entity, typed/colored edges, pan/zoom,
// category filter chips, focus actions, legend, and a linear text fallback.
import { useMemo, useRef, useState, useEffect, useCallback, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraphData, Relationship, Entity, EdgeCategory, Artifact,
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

// Round layout math before rendering: Math.cos/sin can differ by 1 ulp between
// the Node (SSR) and browser (hydration) builds, which React flags as a
// hydration mismatch. 1/100 SVG-unit precision is far below sub-pixel.
const r2 = (n: number) => Math.round(n * 100) / 100;
const r4 = (n: number) => Math.round(n * 10000) / 10000;

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

export function RelationshipGraph({ data, centerId }: { data: GraphData; centerId?: string }) {
  const router = useRouter();
  const clipId = useId().replace(/:/g, '');
  const [cats, setCats] = useState<Set<EdgeCategory>>(new Set(CATS));
  const [focus, setFocus] = useState<Focus>('all');
  const [hover, setHover] = useState<Edge | null>(null);
  const [imgLoaded, setImgLoaded] = useState<Set<string>>(new Set());
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  // entity id -> best image URL (artwork linked to that entity)
  const imgMap = useMemo(() => entityImageMap(data), [data]);

  // ---- subgraph selection + layout ----
  // With a center: ring layout around it (the deity-page inset behavior).
  // Without one (the /graph full atlas): one ring per culture, clusters in a grid.
  const center = centerId ? data.entities.find((e) => e.id === centerId) : undefined;
  const { nodes, edges, clusterLabels } = useMemo(() => {
    if (!center) return layoutGlobal(data, cats, imgMap);

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
  }, [data, center, cats, focus, imgMap]);

  // View transform: identity for a centered graph, fitted to the clusters for
  // the full atlas. Re-fits whenever the node set changes (filter/focus/seed).
  const [view, setView] = useState(() => (center ? { x: 0, y: 0, k: 1 } : fitToView(nodes, clusterLabels)));
  useEffect(() => {
    setView(center ? { x: 0, y: 0, k: 1 } : fitToView(nodes, clusterLabels));
  }, [nodes, clusterLabels, center]);

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
        {center && (Object.keys(FOCUS_LABELS) as Focus[]).map((f) => (
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
          aria-label={center
            ? `Relationship graph centered on ${center.name}`
            : `Cross-culture relationship graph, ${nodes.length} entities in ${clusterLabels.length} tradition clusters`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab', touchAction: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.12 : 0.89)}>
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`} style={{ transformOrigin: '400px 260px' }}>
            {/* cluster labels (full-atlas mode) */}
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

// Symmetric relations render undirected (no arrowhead implied).
const isSym = (t: string) => ['SIBLING_OF', 'PARTNER_OF', 'ALLY_OF', 'ENEMY_OF', 'FOUGHT', 'ASSOCIATED_WITH'].includes(t);

// ---- full-atlas (no center) layout ----
type ClusterLabel = { x: number; y: number; text: string; culture: string };

/**
 * One ring per culture; culture clusters arranged in a grid around the origin.
 * Coordinates are abstract units — the component fits the resulting bounding
 * box into the viewBox, so the layout scales to any number of traditions.
 */
function layoutGlobal(
  data: GraphData,
  cats: Set<EdgeCategory>,
  imgMap: Record<string, string>,
): { nodes: Node[]; edges: Edge[]; clusterLabels: ClusterLabel[] } {
  const groups: { culture: string; ents: Entity[] }[] = [];
  const gmap = new Map<string, { culture: string; ents: Entity[] }>();
  for (const e of data.entities) {
    let g = gmap.get(e.culture);
    if (!g) { g = { culture: e.culture, ents: [] }; gmap.set(e.culture, g); groups.push(g); }
    g.ents.push(e);
  }
  // Artifacts per culture — rendered as an outer ring around each cluster.
  const artsByCulture = new Map<string, Artifact[]>();
  for (const a of data.artifacts) {
    const arr = artsByCulture.get(a.culture) || [];
    arr.push(a);
    artsByCulture.set(a.culture, arr);
  }
  const n = groups.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const rows = Math.max(1, Math.ceil(n / cols));
  const SX = 380, SY = 320; // cluster spacing (abstract units)
  const nodeMap: Record<string, Node> = {};
  const clusterLabels: ClusterLabel[] = [];
  groups.forEach((g, i) => {
    const cx = (i % cols - (cols - 1) / 2) * SX;
    const cy = (Math.floor(i / cols) - (rows - 1) / 2) * SY;
    const r = Math.min(150, Math.max(60, 12 + g.ents.length * 3.6));
    g.ents.forEach((e, j) => {
      const a = (j / g.ents.length) * Math.PI * 2 - Math.PI / 2;
      nodeMap[e.id] = {
        id: e.id, x: r2(cx + r * Math.cos(a)), y: r2(cy + r * Math.sin(a) * 0.78),
        name: e.name, classification: e.classification, img: imgMap[e.id],
      };
    });
    const label = CULTURE_NAMES[g.culture] || g.culture;
    clusterLabels.push({ x: r2(cx), y: r2(cy - r * 0.78 - 26), text: `${label.toUpperCase()} · ${g.ents.length}`, culture: g.culture });
    // Outer ring of artifact nodes around this cluster.
    const arts = artsByCulture.get(g.culture) || [];
    if (arts.length) {
      const ra = r + 44;
      arts.forEach((a, j) => {
        const ang = (j / arts.length) * Math.PI * 2 - Math.PI / 2 + 0.4;
        nodeMap[a.id] = {
          id: a.id, x: r2(cx + ra * Math.cos(ang)), y: r2(cy + ra * Math.sin(ang) * 0.78),
          name: a.name, classification: 'object', img: imgMap[a.id], href: `/artifacts/${a.slug}`,
        };
      });
    }
  });
  const pool = data.relationships.filter((r) => cats.has(categoryOf(r.type)));
  const edges: Edge[] = pool
    .filter((r) => nodeMap[r.from] && nodeMap[r.to] && r.from !== r.to)
    .map((r) => ({ from: r.from, to: r.to, rel: r, cat: categoryOf(r.type), bidir: isSym(r.type) }));
  return { nodes: Object.values(nodeMap), edges, clusterLabels };
}

/** Scale/translate so the node bounding box fits the 800×520 viewBox. */
function fitToView(nodes: Node[], labels: ClusterLabel[]): { x: number; y: number; k: number } {
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
