'use client';
// Explorer chrome for /graph — the VIEW switch (GENEALOGY | RELATIONSHIPS),
// tradition filter, and "center on" picker.
//
// Two DISTINCT layout systems share the same underlying dataset (ADR-003):
//   GENEALOGY     — GenealogyGraph: hierarchical/layered (dagre). The default.
//   RELATIONSHIPS — RelationshipGraph: the original force/ring network view,
//                   preserved untouched as the secondary/expert view.
// The culture filter applies to both by passing a filtered dataset down.
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RelationshipGraph } from '../components/RelationshipGraph';
import { GenealogyGraph } from '../components/GenealogyGraph';
import { GraphData, CULTURE_NAMES } from '../lib/types';

type ViewMode = 'genealogy' | 'relationships';

export default function GraphExplorer({ data }: { data: GraphData }) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('genealogy');
  // Static export (Cloudflare Pages): the ?from= deep-link param is read
  // client-side on mount instead of via server-side searchParams.
  const [fromId, setFromId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('from');
    if (f) setFromId(f);
  }, []);
  const cultures = useMemo(() => {
    const s: string[] = [];
    const seen = new Set<string>();
    for (const e of data.entities) if (!seen.has(e.culture)) { seen.add(e.culture); s.push(e.culture); }
    return s;
  }, [data]);

  const [sel, setSel] = useState<Set<string>>(() => new Set(cultures));
  const centerEntity = useMemo(
    () => (fromId ? data.entities.find((e) => e.id === fromId) : undefined),
    [data, fromId],
  );
  // The centered entity's tradition is always visible.
  const effective = useMemo(() => {
    const s = new Set(sel);
    if (centerEntity) s.add(centerEntity.culture);
    return s;
  }, [sel, centerEntity]);

  const filtered = useMemo<GraphData>(() => {
    const ids = new Set<string>();
    const entities = data.entities.filter((e) => {
      if (!effective.has(e.culture)) return false;
      ids.add(e.id);
      return true;
    });
    // Artifact node ids per visible culture (artifact graph edges reference them).
    const artIds = new Set<string>();
    const artifacts = data.artifacts.filter((a) => {
      if (!effective.has(a.culture)) return false;
      artIds.add(a.id);
      return true;
    });
    const ok = (id: string) => ids.has(id) || artIds.has(id);
    return {
      entities,
      relationships: data.relationships.filter((r) => ok(r.from) && ok(r.to)),
      myths: data.myths.filter((m) => effective.has(m.culture)),
      artworks: data.artworks.filter((a) => effective.has(a.culture)),
      artifacts,
    };
  }, [data, effective]);

  const toggle = (c: string) => setSel((prev) => {
    const n = new Set(prev);
    if (n.has(c)) { if (n.size > 1) n.delete(c); } else n.add(c);
    return n;
  });

  const switchView = (v: ViewMode) => {
    setView(v);
    // Re-centering is a genealogy concept; keep the ?from param so the
    // relationship view can still honor a centered entity if one was chosen.
  };

  return (
    <div>
      {/* VIEW switch — the primary navigation between the two layout systems */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 4 }}>
          View
        </span>
        <div role="tablist" aria-label="Graph view mode"
          style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden' }}>
          <button role="tab" aria-selected={view === 'genealogy'} onClick={() => switchView('genealogy')}
            className="mono"
            style={{
              padding: '8px 18px', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              border: 'none',
              background: view === 'genealogy' ? 'var(--accent)' : 'var(--surface)',
              color: view === 'genealogy' ? 'var(--bg-0)' : 'var(--ink-1)',
              fontWeight: 600,
            }}>
            Genealogy
          </button>
          <button role="tab" aria-selected={view === 'relationships'} onClick={() => switchView('relationships')}
            className="mono"
            style={{
              padding: '8px 18px', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              border: 'none', borderLeft: '1px solid var(--line)',
              background: view === 'relationships' ? 'var(--accent)' : 'var(--surface)',
              color: view === 'relationships' ? 'var(--bg-0)' : 'var(--ink-1)',
              fontWeight: 600,
            }}>
            Relationships
          </button>
        </div>
        <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', marginLeft: 4 }}>
          {view === 'genealogy'
            ? 'hierarchical — generations top → bottom, partners side by side'
            : 'relationship network — the full web of divine relationships'}
        </span>
      </div>

      {/* tradition filter + center picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 2 }}>
          Tradition
        </span>
        <button className={`chip-btn ${sel.size === cultures.length ? 'active' : ''}`}
          onClick={() => setSel(new Set(cultures))} aria-pressed={sel.size === cultures.length}>
          All
        </button>
        {cultures.map((c) => (
          <button key={c} className={`chip-btn ${effective.has(c) ? 'active' : ''}`} onClick={() => toggle(c)}
            aria-pressed={effective.has(c)}
            title={centerEntity?.culture === c ? 'Kept visible — the explorer is centered on an entity of this tradition' : undefined}>
            {CULTURE_NAMES[c] || c}
          </button>
        ))}
        <span style={{ marginLeft: 'auto' }}>
          <label className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 8 }}>
            <span style={{ position: 'absolute', clip: 'rect(0 0 0 0)' }}>Center the explorer on an entity</span>
            Center on
          </label>
          <select className="select-ctl" value={fromId || ''}
            onChange={(e) => { const v = e.target.value || undefined; setFromId(v); router.push(v ? `/graph?from=${v}` : '/graph'); }}
            aria-label="Center the explorer on an entity">
            <option value="">Full atlas</option>
            {cultures.map((c) => (
              <optgroup key={c} label={CULTURE_NAMES[c] || c}>
                {data.entities.filter((e) => e.culture === c).map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </span>
      </div>

      {centerEntity ? (
        <p className="small" style={{ marginTop: 10 }}>
          Centered on{' '}
          <a href={`/deity/${centerEntity.id}`} style={{ color: 'var(--accent-text)' }}>{centerEntity.name}</a>
          <span className="faint"> ({CULTURE_NAMES[centerEntity.culture] || centerEntity.culture})</span>
          <span style={{ margin: '0 10px', color: 'var(--line)' }}>·</span>
          <Link href="/graph" style={{ color: 'var(--accent-text)' }}>return to the full atlas →</Link>
        </p>
      ) : null}

      {view === 'genealogy'
        ? <GenealogyGraph data={filtered} centerId={fromId} />
        : <RelationshipGraph data={filtered} centerId={fromId} />}
    </div>
  );
}
