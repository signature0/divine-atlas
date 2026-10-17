import type { Metadata } from 'next';
import { globalData } from '../lib/data';
import GraphExplorer from './GraphExplorer';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

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
      <HeroBanner
        as="h1"
        slot="page-graph"
        culture="graph"
        eyebrow="The atlas · all traditions"
        title="The relationship explorer"
        tagline={`${data.entities.length} entities and ${data.relationships.length} typed relationships across ${cultureCount} traditions, on one canvas.`}
        imageSlot={resolveBannerSlot('page-graph')}
      />

      <div className="container section-sm" style={{ paddingBottom: 96 }}>
        <p className="small muted" style={{ marginTop: 0, marginBottom: 20, maxWidth: 720 }}>
          Hover an edge for its note and confidence — solid is attested, dashed is disputed,
          dotted is reconstructed. Click any node to open its profile.
        </p>
        <GraphExplorer data={data} />
      </div>
    </div>
  );
}
