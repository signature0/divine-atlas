// STORY MODE — /myths/[id] (REQ-007, TASK-002)
// Scrollytelling page per the IA doc: single reading column, display-type
// chapter headings, inline entity chips, variant accordions, per-chapter
// [S#] source footnotes, uncertainty callout, full-bleed artwork figures
// (alt text + attribution via ArtworkFigure — TECH-005).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { globalData, loadCulture } from '../../lib/data';
import type { Artwork, Entity, Myth } from '../../lib/types';
import { ArtworkFigure } from '../../components/ArtworkFigure';
import { FramingBanner } from '../../components/FramingBanner';
import { SourceFootnote } from '../../components/SourceFootnote';
import { StoryProse } from '../../components/StoryProse';

function findMyth(id: string): Myth | undefined {
  return globalData().myths.find((m) => m.id === id);
}

/** Spread `arts` across `chapters` slots. The myth data carries artwork ids at
 *  myth level (no per-chapter mapping in the v1 schema), so figures are
 *  distributed evenly: art[i] lands after chapter round(i·(C−1)/(N−1)),
 *  collisions shifted forward. One figure per chapter at most. */
function distribute(arts: Artwork[], chapters: number): (Artwork | null)[] {
  const out: (Artwork | null)[] = new Array(Math.max(0, chapters)).fill(null);
  if (!arts.length || chapters <= 0) return out;
  const positions = arts.map((_, i) =>
    arts.length === 1
      ? Math.floor((chapters - 1) / 2)
      : Math.min(chapters - 1, Math.round((i * (chapters - 1)) / (arts.length - 1)))
  );
  const used = new Set<number>();
  positions.forEach((p, i) => {
    let q = Math.max(0, Math.min(chapters - 1, p));
    while (used.has(q) && q < chapters - 1) q++;
    used.add(q);
    out[q] = arts[i];
  });
  return out;
}

export function generateStaticParams() {
  return globalData().myths.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = findMyth(id);
  if (!m) return { title: 'Not found' };
  const d = loadCulture(m.culture);
  const clean = (m.summary || '').replace(/\[S\d+\]/g, '').trim();
  return { title: `${m.title} — ${d.meta.name}`, description: clean };
}

export default async function MythPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = findMyth(id);
  if (!m) notFound();
  const d = loadCulture(m.culture);
  const artById = new Map(d.artworks.map((a) => [a.id, a]));
  const localById = new Map(d.entities.map((e) => [e.id, e]));

  const chapters: { heading: string; body: string }[] = m.chapters?.length
    ? m.chapters
    : [{ heading: '', body: m.summary }];
  const arts = (m.art || []).map((aid) => artById.get(aid)).filter((a): a is Artwork => !!a);
  const hero = arts[0];
  const afterChapter = distribute(arts.slice(1), chapters.length);
  const cast = m.participants.map((pid) => localById.get(pid)).filter((e): e is Entity => !!e);

  const idx = d.myths.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? d.myths[idx - 1] : undefined;
  const next = idx >= 0 && idx < d.myths.length - 1 ? d.myths[idx + 1] : undefined;

  return (
    <div data-culture={d.culture}>
      {/* header */}
      <header
        style={{
          padding: '64px 0 0',
          borderBottom: '1px solid var(--line)',
          background: `linear-gradient(180deg, ${d.meta.palette.surface} 0%, var(--bg-0) 100%)`,
        }}
      >
        <div className="container">
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <span className="eyebrow">
              Story · {d.meta.name} · {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
            </span>
            <h1 className="display-xl" style={{ marginTop: 12 }}>{m.title}</h1>
            <p className="story-lead" style={{ marginTop: 20, marginBottom: 0 }}>
              <StoryProse text={m.summary} culture={d.culture} sources={d.sources} />
            </p>
            {cast.length ? (
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: '0.58rem', letterSpacing: '0.16em', color: 'var(--ink-2)' }}>
                  CAST
                </span>
                {cast.map((e) => (
                  <Link key={e.id} href={`/deity/${e.id}`} className="entity-chip">
                    {e.name}
                  </Link>
                ))}
              </div>
            ) : null}
            <div style={{ marginTop: 30, marginBottom: 44 }}>
              <FramingBanner culture={d.meta} />
            </div>
          </div>
        </div>
      </header>

      {/* hero plate (illustrated myths) */}
      {hero ? (
        <div className="container" style={{ paddingTop: 36 }}>
          <ArtworkFigure art={hero} hero />
        </div>
      ) : null}

      {/* the story */}
      <main className="section" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div className="container">
          <div className="story-col">
            {/* uncertainty — reader-facing callout */}
            {m.uncertainty_notes ? (
              <div className="uncertainty-callout" style={{ marginBottom: 64 }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>
                  ⚠ Scholars disagree
                </span>
                <p className="small" style={{ margin: 0, color: 'var(--ink-1)', lineHeight: 1.75 }}>
                  <StoryProse text={m.uncertainty_notes} culture={d.culture} sources={d.sources} />
                </p>
              </div>
            ) : null}

            {/* chapters, in order */}
            {chapters.map((ch, i) => {
              const refs = [...new Set(ch.body.match(/\[S\d+\]/g) || [])];
              return (
                <section key={i} className="chapter" aria-label={ch.heading || `Chapter ${i + 1}`}>
                  <span className="mono" style={{ color: 'var(--ink-2)', fontSize: '0.62rem', letterSpacing: '0.2em' }}>
                    CHAPTER {String(i + 1).padStart(2, '0')}
                  </span>
                  {ch.heading ? (
                    <h2 className="display-l" style={{ marginTop: 8 }}>{ch.heading}</h2>
                  ) : null}
                  <div style={{ marginTop: 18, color: 'var(--ink-0)', fontSize: '1.05rem', lineHeight: 1.85 }}>
                    <StoryProse text={ch.body} culture={d.culture} sources={d.sources} />
                  </div>
                  {/* per-chapter source footnotes → culture bibliography */}
                  {refs.length ? (
                    <div className="chapter-src">
                      <span className="lbl">Sources</span>
                      <SourceFootnote text={refs.join(' ')} sources={d.sources} />
                    </div>
                  ) : null}
                  {/* illustrated chapters: artwork figure with alt text + attribution */}
                  {afterChapter[i] ? (
                    <div className="story-figure">
                      <ArtworkFigure art={afterChapter[i]} />
                    </div>
                  ) : null}
                </section>
              );
            })}

            {/* variant accordions — all versions visible, none truncated */}
            {m.variants?.length ? (
              <details className="variant-acc" open>
                <summary>Variants of this story ({m.variants.length})</summary>
                {m.variants.map((v, i) => (
                  <div key={i} className="variant-item">
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.08rem', color: 'var(--ink-0)' }}>
                      {v.name}
                    </strong>
                    <p className="small" style={{ margin: '6px 0 0', color: 'var(--ink-1)', lineHeight: 1.75 }}>
                      <StoryProse text={v.description} culture={d.culture} sources={d.sources} />
                    </p>
                  </div>
                ))}
              </details>
            ) : null}

            {/* footer: primary sources + prev/next story */}
            <div style={{ marginTop: 64, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
              <div className="chapter-src" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
                <span className="lbl">Primary sources</span>
                <SourceFootnote text={m.primary_sources.map((s) => `[${s}]`).join(' ')} sources={d.sources} />
              </div>
              <div
                style={{
                  marginTop: 28,
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link className="btn" href={`/culture/${d.culture}`}>← {d.meta.name}</Link>
                  {prev ? <Link className="btn" href={`/myths/${prev.id}`}>← {prev.title}</Link> : null}
                </div>
                {next ? <Link className="btn" href={`/myths/${next.id}`}>{next.title} →</Link> : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
