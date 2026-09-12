'use client';
// RelationshipGraph — custom SVG graph (no external dep):
// ring layout around a focus entity, typed/colored edges, pan/zoom,
// category filter chips, focus actions, legend, and a linear text fallback.
import { useMemo, useRef, useState, useEffect, useCallback, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CultureData, Relationship, Entity, EdgeCategory,
  CATEGORY_TYPES, CATEGORY_COLORS, categoryOf,
} from '../lib/types';
import { SourceRef } from '../lib/types';

const CATS: EdgeCategory[] = ['family', 'marriage', 'creation', 'conflict', 'alliance', 'association'];
const CAT_LABELS: Record<EdgeCategory, string> = {
  family: 'Family', marriage: 'Marriage', creation: 'Creation',
  conflict: 'Conflict', alliance: 'Alliance', association: 'Domain & Rule',
};
type Focus = 'all' | 'ancestors' | 'descendants' | 'enemies' | 'myths';

type Node = { id: string; x: number; y: number; name: string; classification: string; img?: string };
type Edge = { from: string; to: string; rel: Relationship; cat: EdgeCategory; bidir: boolean };

// Best-image URL per entity (hero first, else first linked artwork with a direct image).
// Preloaded at build time: SVG <image> can't lazy-load, so nodes without a
// resolved URL fall back to the plain seal (initials) — never a broken image.
function entityImageMap(data: CultureData): Record<string, string> {
  const artById = new Map(data.artworks.map((a) => [a.id, a]));
  const out: Record<string, string> = {};
  for (const e of data.entities) {
    const cands = [e.hero_artwork, ...(e.artworks || [])].filter(Boolean) as string[];
    for (const aid of cands) {
      const u = artById.get(aid)?.image_url;
      if (u) { out[e.id] = u; break; }
    }
  }
  return out;
}

export function RelationshipGraph({ data, centerId }: { data: CultureData; centerId: string }) {
  const router = useRouter();
  const clipId = useId().replace(/:/g, '');
  const [cats, setCats] = useState<Set<EdgeCategory>>(new Set(CATS));
  const [focus, setFocus] = useState<Focus>('all');
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<Edge | null>(null);
  const [imgLoaded, setImgLoaded] = useState<Set<string>>(new Set());
  const [imgFailed, setImgFailed] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  // entity id -> best image URL (artwork linked to that entity)
  const imgMap = useMemo(() => entityImageMap(data), [data]);

  // ---- subgraph selection ----
  const { nodes, edges } = useMemo(() => {
    const center = data.entities.find((e) => e.id === centerId);
    if (!center) return { nodes: [] as Node[], edges: [] as Edge[] };

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
    const CX = 400, CY = 260;
    const nodeMap: Record<string, Node> = {
      [centerId]: { id: centerId, x: CX, y: CY, name: center.name, classification: center.classification, img: imgMap[centerId] },
    };
    for (let d = 1; d <= 4; d++) {
      const ring = rings[d] || [];
      if (!ring.length) continue;
      const R = 110 * d;
      ring.forEach((id, i) => {
        const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
        const e = data.entities.find((x) => x.id === id)!;
        nodeMap[id] = { id, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) * 0.72, name: e.name, classification: e.classification, img: imgMap[id] };
      });
    }
    const isSym = (t: string) => ['SIBLING_OF', 'PARTNER_OF', 'ALLY_OF', 'ENEMY_OF', 'FOUGHT', 'ASSOCIATED_WITH'].includes(t);
    const edgeList: Edge[] = pool
      .filter((r) => nodeMap[r.from] && nodeMap[r.to] && r.from !== r.to)
      .map((r) => ({ from: r.from, to: r.to, rel: r, cat: categoryOf(r.type), bidir: isSym(r.type) }));
    return { nodes: Object.values(nodeMap), edges: edgeList };
  }, [data, centerId, cats, focus, imgMap]);

  const byId = useMemo(() => new Map(data.entities.map((e) => [e.id, e])), [data]);

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
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
        <svg ref={svgRef} viewBox="0 0 800 520" role="img"
          aria-label={`Relationship graph centered on ${byId.get(centerId)?.name}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab', touchAction: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.12 : 0.89)}>
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`} style={{ transformOrigin: '400px 260px' }}>
            {edges.map((e, i) => {
              const a = nodes.find((n) => n.id === e.from)!;
              const b = nodes.find((n) => n.id === e.to)!;
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
              return (
                <g key={i}
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
                  onClick={() => { if (!drag.current?.moved) router.push(`/deity/${n.id}`); }}
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
          {hover && (
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

      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12 }} className="mono" aria-hidden>
        {CATS.map((c) => (
          <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-1)', fontSize: '0.62rem' }}>
            <span style={{ width: 18, height: 0, borderTop: `2px solid ${CATEGORY_COLORS[c]}` }} /> {CAT_LABELS[c]}
          </span>
        ))}
        <span style={{ color: 'var(--ink-2)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 0, borderTop: '2px dashed var(--ink-2)' }} /> disputed
        </span>
        <span style={{ color: 'var(--ink-2)', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 0, borderTop: '2px dotted var(--ink-2)' }} /> reconstructed
        </span>
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
                <a href={`/deity/${e.from}`}>{byId.get(e.from)?.name || e.from}</a> → <a href={`/deity/${e.to}`}>{byId.get(e.to)?.name || e.to}</a> — {e.rel.note}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
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
