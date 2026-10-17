import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = { title: 'How this is built' };

export default function About() {
  return (
    <div>
      <HeroBanner
        as="h1"
        slot="page-about"
        culture="about"
        eyebrow="Method"
        title="How the Atlas is built"
        tagline="Every nontrivial claim carries a real, named source — enforced at build time, not by good intentions."
        imageSlot={resolveBannerSlot('page-about')}
      />
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
            <p className="about-credit" style={{ marginTop: 10 }}>
              Card art labelled “generated reconstruction · The Divine Atlas” is an interpretive,
              machine-generated reconstruction composed from each figure’s sourced attributes — not
              archival artwork, and it claims no museum provenance. Where a card uses a museum image
              instead, that object’s own credit is shown in the card’s detail view.
            </p>
          </section>
          <section>
            <h2>The expansion path</h2>
            <p style={{ marginTop: 12, color: 'var(--ink-1)' }}>
              The architecture is built so that a new culture is a new data folder plus one registry
              entry — no migrations, no schema changes. Eleven more traditions are already named in
              the registry; their galleries open as the sources are verified.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {['Celtic', 'Chinese', 'Hindu', 'Aztec', 'Maya', 'Polynesian', 'Roman', 'Finnish', 'Persian / Zoroastrian', 'West African', 'Arabian (pre-Islamic)'].map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
          </section>
          <div>
            <Link href="/" className="btn">← Back to the galleries</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
