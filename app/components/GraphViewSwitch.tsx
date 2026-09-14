'use client';
// GraphViewSwitch — the GENEALOGY | RELATIONSHIPS view switch (ADR-003),
// extracted from /graph so every page that embeds a graph can offer both
// layout systems on the same data:
//   GENEALOGY     — GenealogyGraph: hierarchical/layered (dagre). The default.
//   RELATIONSHIPS — RelationshipGraph: the original relationship network view.
import { useState } from 'react';
import { RelationshipGraph } from './RelationshipGraph';
import { GenealogyGraph } from './GenealogyGraph';
import { GraphData } from '../lib/types';

type ViewMode = 'genealogy' | 'relationships';

export function GraphViewSwitch({
  data,
  centerId,
  genealogyCenterId,
  defaultView = 'genealogy',
}: {
  data: GraphData;
  /** Center for the RELATIONSHIPS network view (and genealogy, when no explicit one is given). */
  centerId?: string;
  /** Center for the GENEALOGY view — when set, it enters focus mode on that entity.
   *  Omitted: falls back to `centerId`. Explicit `null`: no focus — show the
   *  whole tradition (e.g. culture pages). */
  genealogyCenterId?: string | null;
  defaultView?: ViewMode;
}) {
  const [view, setView] = useState<ViewMode>(defaultView);

  return (
    <div>
      {/* VIEW switch — primary navigation between the two layout systems */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--ink-2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 4 }}>
          View
        </span>
        <div role="tablist" aria-label="Graph view mode"
          style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden' }}>
          <button role="tab" aria-selected={view === 'genealogy'} onClick={() => setView('genealogy')}
            className="mono"
            style={{
              padding: '8px 18px', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              border: 'none',
              background: view === 'genealogy' ? 'var(--accent)' : 'var(--surface)',
              color: view === 'genealogy' ? 'var(--accent-badge-text)' : 'var(--ink-1)',
              fontWeight: 600,
            }}>
            Genealogy
          </button>
          <button role="tab" aria-selected={view === 'relationships'} onClick={() => setView('relationships')}
            className="mono"
            style={{
              padding: '8px 18px', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              border: 'none', borderLeft: '1px solid var(--line)',
              background: view === 'relationships' ? 'var(--accent)' : 'var(--surface)',
              color: view === 'relationships' ? 'var(--accent-badge-text)' : 'var(--ink-1)',
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

      {view === 'genealogy'
        ? <GenealogyGraph data={data} centerId={genealogyCenterId === undefined ? centerId : genealogyCenterId || undefined} />
        : <RelationshipGraph data={data} centerId={centerId} />}
    </div>
  );
}
