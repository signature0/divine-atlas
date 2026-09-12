import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'How this is built' };

export default function About() {
  return (
    <div>
      <header style={{ padding: '72px 0 40px', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow">Method</span>
          <h1 className="display-l" style={{ marginTop: 10 }}>How the Atlas is built</h1>
          <hr className="mat-band" style={{ width: 140 }} />
        </div>
      </header>
      <div className="container section" style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, color: 'var(--ink-0)', lineHeight: 1.75 }}>
          <section>
            <h2>The standard: no invented claims</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              Every nontrivial claim in this Atlas carries a source marker like <span className="src" style={{ cursor: 'default' }}>[S1]</span> that
              resolves to a real, named source — a translated primary text, a museum object page, an
              academic monograph, or an archaeological record. Where a claim is a scholarly
              <em> reconstruction</em> rather than an attestation, it is badged as such (dotted lines in the
              graph, an evidence badge on profiles). This is enforced at build time by a validation
              script, not by good intentions.
            </p>
          </section>
          <section>
            <h2>The graph, not the family tree</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              Mythology is modeled as a typed graph: 12 relationship types (parent, partner, creation,
              killing, alliance, rule, succession…) with per-edge confidence. The familiar “family
              tree” is just one filter over that graph. That is why, for example, Marduk appears
              connected to Tiamat by <em>three</em> distinct edges — fought, killed, and created the
              world from her body — and why Slavic Perun’s links to a storm-serpent are dotted
              (reconstructed), while Greek Zeus’s are solid (attested).
            </p>
          </section>
          <section>
            <h2>Variants are data</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              When scholars disagree, the Atlas shows the disagreement. Egyptian creation is presented
              as three parallel traditions (Heliopolitan, Memphite, Hermopolitan) rather than one
              invented genealogy. Greek parentage disputes (Eos vs. Thetis as Aphrodite’s mother) are
              stored as competing edges with an explanation of each position.
            </p>
          </section>
          <section>
            <h2>Living traditions are not fiction</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              Japanese Shinto is a living religious tradition. It is framed as such on every page:
              the narratives are the tradition’s own mythic heritage, the historical layers (Kojiki
              712 CE, Nihon Shoki 720 CE, shrine engi) are made visible, and modern state-Shinto and
              pop-culture readings are labeled separately from the primary texts.
            </p>
          </section>
          <section>
            <h2>Artwork licensing</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              All 71 artworks are public domain or openly licensed, drawn from museum open-access
              programs (Met, Rijksmuseum) and Wikimedia Commons. Every URL was fetched and verified
              live. Attribution (title, artist, date, museum, license) is always visible. Nothing is
              scraped; no copyrighted contemporary art is used.
            </p>
          </section>
          <section>
            <h2>The expansion path</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              The architecture is built so that a new culture is a new data folder plus one registry
              entry — no migrations, no schema changes. Celtic, Chinese, Hindu, Aztec, Maya,
              Polynesian, Roman, Finnish, Persian, West African, and Arabian traditions are on the
              roadmap and appear as “coming soon” in the registry.
            </p>
          </section>
          <div>
            <Link href="/" className="btn">← Back to the galleries</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
