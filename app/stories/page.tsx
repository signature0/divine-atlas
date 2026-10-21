import type { Metadata } from 'next';
import { ALL_CULTURES, loadCulture } from '../lib/data';
import { SourceFootnote } from '../components/SourceFootnote';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = { title: 'The stories' };

export default function StoriesPage() {
  const cultures = ALL_CULTURES.map((c) => loadCulture(c));
  const totalM = cultures.reduce((s, d) => s + d.myths.length, 0);

  return (
    <div>
      <HeroBanner
        as="h1"
        slot="page-stories"
        culture="stories"
        eyebrow="Story mode"
        title="The stories"
        tagline={`${totalM} myths across ${cultures.length} cultures — each told chapter by chapter with its sources, its participants, and its surviving variants.`}
        imageSlot={resolveBannerSlot('page-stories')}
      />

      {cultures.map((d) => (
        <section key={d.culture} className="section">
          <div className="container">
            <span className="eyebrow">{d.meta.name}</span>
            <h2 style={{ marginTop: 8, marginBottom: 24 }}>{d.myths.length} {d.myths.length === 1 ? 'story' : 'stories'}</h2>
            <div className="grid-3">
              {d.myths.map((m) => (
                <div key={m.id} className="card" style={{ display: 'block', padding: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>
                    <a href={`/myths/${m.id}`} style={{ color: 'var(--ink-0)', textDecoration: 'none' }}>{m.title}</a>
                  </h3>
                  <p className="small muted" style={{ margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <SourceFootnote text={m.summary} sources={d.sources} />
                  </p>
                  <div style={{ marginTop: 12 }} className="mono">
                    <a href={`/myths/${m.id}`} style={{ color: 'var(--accent-text)', fontSize: '0.62rem', letterSpacing: '0.1em', textDecoration: 'none' }}>
                      {m.participants.length} PARTICIPANTS · READ STORY →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="container" style={{ paddingBottom: 64 }}>
        <div style={{ paddingTop: 32, borderTop: '1px solid var(--line)' }}>
          <a href="/" className="btn btn-secondary">← All galleries</a>
        </div>
      </div>
    </div>
  );
}
