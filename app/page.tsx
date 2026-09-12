import Link from 'next/link';
import { ALL_CULTURES, loadCulture } from './lib/data';
import { SourceRef } from './lib/types';
void ({} as SourceRef);

export default function Home() {
  const cultures = ALL_CULTURES.map((c) => loadCulture(c));

  // divine archetypes: most-populated domains across all cultures
  const domainCount = new Map<string, { count: number; ids: string[] }>();
  for (const d of cultures) for (const e of d.entities) {
    for (const dom of e.domains) {
      const v = domainCount.get(dom) || { count: 0, ids: [] };
      v.count++; v.ids.push(e.id);
      domainCount.set(dom, v);
    }
  }
  const archetypes = [...domainCount.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 9);

  const totalE = cultures.reduce((s, d) => s + d.entities.length, 0);
  const totalR = cultures.reduce((s, d) => s + d.relationships.length, 0);
  const totalM = cultures.reduce((s, d) => s + d.myths.length, 0);

  return (
    <>
      {/* HERO */}
      <section style={{ padding: '120px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.05, background:
          'radial-gradient(1200px 500px at 20% 0%, var(--accent), transparent 60%), radial-gradient(900px 500px at 80% 100%, var(--accent-2), transparent 60%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="eyebrow">A museum of the world&apos;s divine imagination</span>
          <h1 className="display-xl" style={{ marginTop: 18, maxWidth: 900 }}>
            The Divine Atlas
          </h1>
          <p className="muted" style={{ maxWidth: 640, marginTop: 22, fontSize: '1.1rem' }}>
            An interactive codex of {cultures.length} mythologies — Japanese, Greek, Norse, Egyptian,
            Slavic, and Mesopotamian. {totalE} entities, {totalR} typed relationships, {totalM} myths,
            and {cultures.reduce((s, d) => s + d.artworks.length, 0)} verified artworks, each claim
            carried by its sources.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/culture/japanese" className="btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              Enter the Japanese gallery →
            </Link>
            <Link href="/about" className="btn">How this is built</Link>
          </div>
        </div>
      </section>

      {/* GALLERIES */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <span className="eyebrow">The galleries</span>
          <h2 style={{ marginTop: 8, marginBottom: 32 }}>Six mythologies, one system</h2>
          <div className="grid-3">
            {cultures.map((d) => (
              <Link key={d.culture} href={`/culture/${d.culture}`}
                className="card culture-card"
                style={{ ['--card-accent' as string]: d.meta.palette.accent }}>
                <div>
                  <div className="c-name">{d.meta.name}</div>
                  {d.meta.native_label && <div className="c-native native">{d.meta.native_label}</div>}
                </div>
                <div className="c-period">{d.meta.period}</div>
                <div className="small muted" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {d.meta.framing_note}
                </div>
                <div className="c-stats">{d.entities.length} entities · {d.relationships.length} relations · {d.myths.length} myths · {d.artworks.length} artworks</div>
                <span className="c-cta">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ARCHETYPES */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">Divine archetypes</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>Where the gods overlap</h2>
          <p className="small muted" style={{ maxWidth: 680, marginBottom: 28 }}>
            Domains that recur across more than one culture — a first taste of the comparator.
            Click a domain to see every deity who bears it.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {archetypes.map(([dom, v]) => (
              <Link key={dom} href={`/domain/${encodeURIComponent(dom)}`}
                className="chip" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{dom}</strong>
                <span className="faint" style={{ marginLeft: 8 }}>{v.count} deities</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="section-sm" style={{ paddingBottom: 96 }}>
        <div className="container">
          <span className="eyebrow">Expansion path</span>
          <h2 style={{ marginTop: 8, marginBottom: 20 }}>Coming soon to the Atlas</h2>
          <p className="small muted" style={{ maxWidth: 680, marginBottom: 24 }}>
            The architecture is built for it: a new culture is a new data folder plus one registry
            entry. No migrations, no schema changes.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Celtic', 'Chinese', 'Hindu', 'Aztec', 'Maya', 'Polynesian', 'Roman', 'Finnish', 'Persian / Zoroastrian', 'West African', 'Arabian (pre-Islamic)'].map((c) => (
              <span key={c} className="chip">coming soon — {c}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
