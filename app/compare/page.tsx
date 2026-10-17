import type { Metadata } from 'next';
import { CompareWidget } from './CompareWidget';
import { ALL_CULTURES, loadCulture } from '../lib/data';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = { title: 'The Comparator' };

export default function ComparePage() {
  const all = ALL_CULTURES.flatMap((c) => {
    const data = loadCulture(c);
    return data.entities.map((entity) => ({ entity, data }));
  });
  return (
    <div>
      <HeroBanner
        as="h1"
        slot="page-compare"
        culture="compare"
        eyebrow="Cross-cultural comparator"
        title="Compare the gods"
        tagline="Pick two deities from any cultures: attribute-by-attribute overlap, with structural connections stated apart from attested ones."
        imageSlot={resolveBannerSlot('page-compare')}
      />
      <div className="container section">
        <CompareWidget all={all} />
      </div>
    </div>
  );
}
