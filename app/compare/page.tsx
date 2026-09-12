import type { Metadata } from 'next';
import { CompareWidget } from './CompareWidget';
import { ALL_CULTURES, loadCulture } from '../lib/data';

export const metadata: Metadata = { title: 'The Comparator' };

export default function ComparePage() {
  const all = ALL_CULTURES.flatMap((c) => {
    const data = loadCulture(c);
    return data.entities.map((entity) => ({ entity, data }));
  });
  return (
    <div>
      <header style={{ padding: '64px 0 32px', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow">Cross-cultural comparator</span>
          <h1 className="display-l" style={{ marginTop: 10 }}>Compare the gods</h1>
          <hr className="mat-band" style={{ width: 140 }} />
          <p className="muted small" style={{ maxWidth: 680, marginTop: 14 }}>
            Pick two deities from any cultures. The comparator shows attribute-by-attribute overlap
            and states explicitly when a connection is structural (ours to note) versus attested
            (in the sources).
          </p>
        </div>
      </header>
      <div className="container section">
        <CompareWidget all={all} />
      </div>
    </div>
  );
}
