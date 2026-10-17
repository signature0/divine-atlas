import Link from 'next/link';
import { ALL_CULTURES, loadCulture, allCards } from './lib/data';
import { domainSlug } from './lib/domain';
import { SourceRef } from './lib/types';
import { DeityCard } from './components/DeityCard';
import { HomeCarousel, type CarouselSlide } from './components/HomeCarousel';
import { firstSentence } from './components/HeroBanner';
import { resolveBannerSlot } from './lib/banner-slot';
void ({} as SourceRef);

export default function Home() {
  const cultures = ALL_CULTURES.map((c) => loadCulture(c));

  // The Deck teaser: one representative card per culture — the highest-essence
  // card (the biggest god in each pantheon). Derived, never a hardcoded list.
  const cards = allCards();
  const deckTeaser = ALL_CULTURES.map((c) => {
    const list = cards.filter((x) => x.culture === c);
    return list.reduce((best, x) => (x.stats.essence > best.stats.essence ? x : best), list[0]);
  }).filter(Boolean);

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
  const totalA = cultures.reduce((s, d) => s + d.artworks.length, 0);

  // Home hero carousel (v2 Phase 3): every content category, each reusing the
  // unique interim backdrop of its own page banner. Banner art slots resolve at
  // build time on the server; the client carousel only receives paths/null.
  const slides: CarouselSlide[] = [
    ...ALL_CULTURES.map((c) => {
      const d = loadCulture(c);
      return {
        key: c,
        href: `/culture/${c}`,
        eyebrow: 'Pantheon',
        title: d.meta.name,
        tagline: firstSentence(d.meta.framing_note),
        variant: c,
        imageSlot: resolveBannerSlot(`home-slide-${c}`),
      };
    }),
    {
      key: 'relics', href: '/artifacts', eyebrow: 'The Vault', title: 'The Relics',
      tagline: 'Hammers and mirrors, crowns and tablets — the objects gods made, wielded, and lost.',
      variant: 'relics', imageSlot: resolveBannerSlot('home-slide-relics'),
    },
    {
      key: 'cards', href: '/cards', eyebrow: 'The Deck', title: 'Every god, as a card',
      tagline: 'The whole Atlas as a collectible deck, each card derived from its god\u2019s verified profile.',
      variant: 'cards', imageSlot: resolveBannerSlot('home-slide-cards'),
    },
    {
      key: 'game', href: '/play', eyebrow: 'The Game', title: 'The duel table',
      tagline: 'A two-player hot-seat duel on real Atlas data — channel essence and topple the Cosmic Pillar.',
      variant: 'play', imageSlot: resolveBannerSlot('home-slide-game'),
    },
    {
      key: 'graph', href: '/graph', eyebrow: 'The Graph', title: 'The relationship explorer',
      tagline: 'Every entity, every typed relationship, every confidence — across six traditions on one canvas.',
      variant: 'graph', imageSlot: resolveBannerSlot('home-slide-graph'),
    },
    {
      key: 'stories', href: '/stories', eyebrow: 'Story mode', title: 'The stories',
      tagline: 'Every myth told chapter by chapter, with its sources, participants, and surviving variants.',
      variant: 'stories', imageSlot: resolveBannerSlot('home-slide-stories'),
    },
  ];

  return (
    <>
      {/* HERO — accessible home carousel (v2 Phase 3). One sr-only h1 keeps the
          page's single h1; slide titles are h2. */}
      <h1 className="sr-only">The Divine Atlas — an interactive museum of world mythology</h1>
      <HomeCarousel slides={slides} />

      {/* Intro strip preserved from the former .home-hero — the site lede + entry CTAs. */}
      <section className="section-sm home-intro">
        <div className="container">
          <p className="muted" style={{ maxWidth: 700, margin: 0, fontSize: '1.05rem' }}>
            An interactive codex of {cultures.length} mythologies — Japanese, Greek, Norse, Egyptian,
            Slavic, and Mesopotamian. {totalE} entities, {totalR} typed relationships, {totalM} myths,
            and {totalA} verified artworks, each claim carried by its sources.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            <Link href="/culture/japanese" className="btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent-text)' }}>
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
                style={{ ['--card-accent' as string]: d.meta.palette.accent, ['--card-accent-text' as string]: d.meta.palette.accentText }}>
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
          {/* DES-009: one-line in-world mention only — the full expansion list lives on /about */}
          <p className="small faint" style={{ marginTop: 24, maxWidth: 680 }}>
            Eleven more traditions are named in the registry; their galleries open as the sources are verified.
            <Link href="/about" style={{ color: 'var(--accent-text)', marginLeft: 8 }}>How this is built →</Link>
          </p>
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
              <Link key={dom} href={`/domain/${domainSlug(dom)}`}
                className="chip" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                <strong style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{dom}</strong>
                <span className="faint" style={{ marginLeft: 8 }}>{v.count} deities</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* THE DECK (ADR-004) */}
      <section className="section">
        <div className="container">
          <span className="eyebrow">The Deck</span>
          <h2 style={{ marginTop: 8, marginBottom: 8 }}>Every god, as a card</h2>
          <p className="small muted" style={{ maxWidth: 680, marginBottom: 28 }}>
            The whole Atlas as a collectible deck — {cards.length} deities across {ALL_CULTURES.length}
            pantheons, each derived from the god&apos;s own verified profile. Six pantheon anchors below;
            the full deck, filters, and print-ready cards live in The Deck.
          </p>
          <div className="deck-teaser-row">
            {deckTeaser.map((c) => (
              <Link key={c.id} href={`/cards/${c.id}`} className="deck-teaser-item" aria-label={`${c.name} card`}>
                {/* interactive={false}: the outer teaser link already opens the
                    card page, so the inner print link is suppressed to avoid a
                    nested <a> (React hydration error #418). */}
                <DeityCard card={c} size="md" interactive={false} />
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/cards" className="btn" style={{ borderColor: 'var(--accent)', color: 'var(--accent-text)' }}>
              Browse the full deck →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
