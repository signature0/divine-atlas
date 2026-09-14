import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_CULTURES, loadCulture } from '../../lib/data';
import { FramingBanner } from '../../components/FramingBanner';
import { CosmologyMap } from '../../components/CosmologyMap';
import { GraphViewSwitch } from '../../components/GraphViewSwitch';
import { ArtworkFigure } from '../../components/ArtworkFigure';
import { SourceFootnote } from '../../components/SourceFootnote';

export function generateStaticParams() {
  return ALL_CULTURES.map((c) => ({ culture: c }));
}

export async function generateMetadata({ params }: { params: Promise<{ culture: string }> }): Promise<Metadata> {
  const { culture } = await params;
  const d = loadCulture(culture);
  return { title: d.meta.name, description: d.meta.framing_note };
}

export default async function CulturePage({ params }: { params: Promise<{ culture: string }> }) {
  const { culture } = await params;
  const d = loadCulture(culture);
  if (!ALL_CULTURES.includes(d.culture as never)) notFound();
  const meta = d.meta;

  // pick the most-connected entity as the graph default center
  const degree = new Map<string, number>();
  for (const r of d.relationships) {
    degree.set(r.from, (degree.get(r.from) || 0) + 1);
    degree.set(r.to, (degree.get(r.to) || 0) + 1);
  }
  const centerId = [...degree.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || d.entities[0]?.id;

  return (
    <div data-culture={d.culture}>
      {/* header */}
      <header style={{ padding: '72px 0 40px', background: `linear-gradient(180deg, ${meta.palette.surface} 0%, var(--bg-0) 100%)`, borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow">Gallery · {meta.period}</span>
          <h1 className="display-xl" style={{ marginTop: 12 }}>{meta.name}</h1>
          {meta.native_label && <div className="native" style={{ fontSize: '1.3rem', color: 'var(--ink-1)', marginTop: 6 }}>{meta.native_label}</div>}
          <div className="mono" style={{ color: 'var(--ink-2)', marginTop: 14, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <span>{d.entities.length} entities</span>
            <span>{d.relationships.length} relationships</span>
            <span>{d.myths.length} myths</span>
            <span>{d.artworks.length} artworks</span>
          </div>
          <div style={{ marginTop: 26, maxWidth: 820 }}>
            <FramingBanner culture={meta} />
          </div>
        </div>
      </header>

      {/* cosmology */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">01 — Cosmology</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>The shape of the world</h2>
          <hr className="mat-band" style={{ width: 140 }} />
          <div style={{ marginTop: 28 }}>
            <CosmologyMap cosmology={d.cosmology} entities={d.entities} sources={d.sources} />
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* relationship graph */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">02 — The relationship graph</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>How the divine world is wired</h2>
          <hr className="mat-band" style={{ width: 140 }} />
          <p className="small muted" style={{ maxWidth: 700, marginBottom: 24 }}>
            Two ways to read the same data: the <strong>genealogy</strong> view layers generations
            top → bottom (partners side by side, children fanning from the union), while the{' '}
            <strong>relationships</strong> view shows the full web of typed relationships — filter by
            category, or click any node to open its profile. Line style encodes confidence:
            solid = attested, dashed = disputed, dotted = scholarly reconstruction.
          </p>
          <GraphViewSwitch data={d} centerId={centerId} genealogyCenterId={null} />
        </div>
      </section>

      <hr className="divider" />

      {/* myths */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">03 — Major myths</span>
          <h2 style={{ marginTop: 8, marginBottom: 28 }}>The stories</h2>
          <div className="grid-3">
            {d.myths.map((m) => (
              <div key={m.id} className="card" id={`myth-card-${m.id}`} style={{ display: 'block', padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>
                  <a href={`#myth-${m.id}`} style={{ color: 'var(--ink-0)', textDecoration: 'none' }}>{m.title}</a>
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

          {/* full myth readers */}
          {d.myths.map((m) => (
            <article key={m.id} id={`myth-${m.id}`} style={{ marginTop: 56, scrollMarginTop: 80 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem' }}>{m.title}</h2>
              <hr className="mat-band" style={{ width: 100, marginBottom: 16 }} />
              {(m.chapters || [{ heading: '', body: m.summary }]).map((ch, i) => (
                <div key={i} style={{ marginBottom: 18, maxWidth: 760 }}>
                  {ch.heading && <h3 style={{ marginBottom: 6 }}>{ch.heading}</h3>}
                  <p className="small" style={{ margin: 0, lineHeight: 1.75, color: 'var(--ink-0)' }}>
                    <SourceFootnote text={ch.body} sources={d.sources} />
                  </p>
                </div>
              ))}
              {m.variants?.length ? (
                <details style={{ marginTop: 14, maxWidth: 760, borderLeft: '2px solid var(--accent)', paddingLeft: 14 }}>
                  <summary className="mono" style={{ cursor: 'pointer', color: 'var(--accent-text)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Variant traditions ({m.variants.length})
                  </summary>
                  {m.variants.map((v, i) => (
                    <div key={i} style={{ marginTop: 10 }}>
                      <strong style={{ fontFamily: 'var(--font-display)' }}>{v.name}</strong>
                      <p className="small muted" style={{ margin: '4px 0 0' }}><SourceFootnote text={v.description} sources={d.sources} /></p>
                    </div>
                  ))}
                </details>
              ) : null}
              <div style={{ marginTop: 12 }} className="mono" >
                <span style={{ color: 'var(--ink-2)', fontSize: '0.66rem' }}>
                  Sources: {m.primary_sources.map((s) => `[${s}]`).join(' ')}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* timeline */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">04 — Sources & archaeology</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>When it was written, not when it began</h2>
          <hr className="mat-band" style={{ width: 140 }} />
          <div className="small" style={{ color: 'var(--gold)', marginTop: 10, marginBottom: 24, maxWidth: 640 }}>
            ⚠ The date of a source is not the date of the myth it preserves.
          </div>
          <div className="timeline">
            {[...d.timeline].sort((a, b) => a.sort_year - b.sort_year).map((t, i) => (
              <div key={i} className="tl-item">
                <div className="tl-year">{t.year_label}</div>
                <div className="tl-kind">{t.kind}</div>
                <div className="tl-label">{t.label}</div>
                <div className="tl-desc"><SourceFootnote text={t.description} sources={d.sources} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* artworks */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">05 — Historical artworks</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>The visual record</h2>
          <hr className="mat-band" style={{ width: 140 }} />
          <p className="small muted" style={{ maxWidth: 700, marginTop: 10, marginBottom: 28 }}>
            {d.artworks.length} pieces, all from open-license or public-domain collections. Attribution
            is always visible; nothing is scraped.
          </p>
          <div className="grid-3">
            {d.artworks.map((a) => (
              <figure key={a.id} style={{ margin: 0 }}>
                <ArtworkFigure art={a} />
                <figcaption className="small muted" style={{ marginTop: 8, lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--ink-0)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{a.title}</strong>
                  <br />{a.subject}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* uncertainties */}
      <section className="section" style={{ paddingBottom: 96 }}>
        <div className="container">
          <span className="eyebrow">06 — Where scholars disagree</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>Honest uncertainties</h2>
          <hr className="mat-band" style={{ width: 140 }} />
          <p className="small muted" style={{ maxWidth: 680, marginTop: 10, marginBottom: 24 }}>
            We preserve disagreement rather than inventing answers. Each entry lists the competing
            positions and how this Atlas presents them.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {d.uncertainties.map((u, i) => (
              <div key={i} className="card" style={{ padding: 20, borderLeft: '3px solid var(--accent)' }}>
                <h3 style={{ marginBottom: 6 }}>{u.topic || u.question}</h3>
                <p className="small muted" style={{ margin: '0 0 12px' }}>{u.description}</p>
                {u.positions?.length ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {u.positions.map((p, j) => (
                      <div key={j} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 12 }}>
                        <div className="mono" style={{ color: 'var(--accent-2-text)', fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{p.name}</div>
                        <div className="small" style={{ color: 'var(--ink-0)' }}><SourceFootnote text={p.description} sources={d.sources} /></div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {u.how_we_present_it && (
                  <p className="mono" style={{ marginTop: 12, marginBottom: 0, color: 'var(--ink-2)', fontSize: '0.68rem' }}>
                    PRESENTED AS: {u.how_we_present_it}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
