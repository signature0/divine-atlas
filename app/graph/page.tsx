import type { Metadata } from 'next';
import { globalData } from '../lib/data';
import GraphExplorer from './GraphExplorer';

export const metadata: Metadata = {
  title: 'Relationship Explorer',
  description:
    'The full cross-culture relationship graph: every entity, every typed edge, every confidence — six traditions on one canvas.',
};

export default function GraphPage() {
  const data = globalData();
  const cultureCount = new Set(data.entities.map((e) => e.culture)).size;

  return (
    <div>
      <header style={{ padding: '56px 0 32px', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow">The atlas · all traditions</span>
          <h1 className="display-l" style={{ marginTop: 10 }}>The relationship explorer</h1>
          <hr className="mat-band" style={{ width: 140 }} />
          <p className="small muted" style={{ marginTop: 14, maxWidth: 720 }}>
            {data.entities.length} entities and {data.relationships.length} typed relationships across {cultureCount}{' '}
            traditions, on one canvas. Hover an edge for its note and confidence — solid is attested, dashed is disputed,
            dotted is reconstructed. Click any node to open its profile.
          </p>
        </div>
      </header>

      <div className="container section-sm" style={{ paddingBottom: 96 }}>
        <GraphExplorer data={data} />
      </div>
    </div>
  );
}
