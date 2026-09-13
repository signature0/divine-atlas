'use client';
// Explorer chrome for /graph — tradition (culture) filter + "center on" entity
// picker, wrapped around the shared RelationshipGraph component. The culture
// filter is applied by passing a filtered dataset down; the component itself
// stays dataset-agnostic.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RelationshipGraph } from '../components/RelationshipGraph';
import { GraphData, CULTURE_NAMES } from '../lib/types';

export default function GraphExplorer({ data, fromId }: { data: GraphData; fromId?: string }) {
  const router = useRouter();
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

  return (
    <div>
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
            onChange={(e) => router.push(e.target.value ? `/graph?from=${e.target.value}` : '/graph')}
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

      <RelationshipGraph data={filtered} centerId={fromId} />
    </div>
  );
}
