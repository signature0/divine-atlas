import type { Metadata } from 'next';
import Link from 'next/link';
import { globalData, entityById } from '../lib/data';
import { CULTURE_NAMES } from '../lib/types';
import GraphExplorer from './GraphExplorer';

export const metadata: Metadata = {
  title: 'Relationship Explorer',
  description:
    'The full cross-culture relationship graph: every entity, every typed edge, every confidence — six traditions on one canvas.',
};

export default async function GraphPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const seeded = from ? entityById(from) : undefined; // unknown id → full atlas, not an error
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
          {seeded ? (
            <p className="small" style={{ marginTop: 12 }}>
              Centered on{' '}
              <a href={`/deity/${seeded.id}`} style={{ color: 'var(--accent-text)' }}>{seeded.name}</a>
              <span className="faint"> ({CULTURE_NAMES[seeded.culture] || seeded.culture})</span>
              <span style={{ margin: '0 10px', color: 'var(--line)' }}>·</span>
              <Link href="/graph" style={{ color: 'var(--accent-text)' }}>return to the full atlas →</Link>
            </p>
          ) : null}
        </div>
      </header>

      <div className="container section-sm" style={{ paddingBottom: 96 }}>
        <GraphExplorer data={data} fromId={seeded?.id} />
      </div>
    </div>
  );
}
