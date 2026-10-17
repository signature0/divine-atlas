import type { Metadata } from 'next';
import Link from 'next/link';
import { allCards, allArtifacts, ALL_CULTURES, loadCulture } from '../lib/data';
import { CardDeck } from '../components/CardDeck';
import type { DeckRelics } from '../components/CardDeck';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = {
  title: 'The Deck — Deity Cards',
  description: 'Every god in the Divine Atlas as a collectible card — 159 deities across six pantheons, with a print-ready PDF for each.',
};

export default function CardsPage() {
  const cards = allCards();
  const byCulture = cards.reduce((m, c) => { m[c.culture] = (m[c.culture] || 0) + 1; return m; }, {} as Record<string, number>);
  const mythics = cards.filter((c) => c.rarity === 'mythic').length;

  // Relics owned by each entity (ADR-002) — built here so CardDeck stays a pure
  // view over serializable data. Only artifacts whose `owner` is a real entity.
  const cardIds = new Set(cards.map((c) => c.id));
  const relics: DeckRelics = {};
  for (const a of allArtifacts()) {
    if (!a.owner || !cardIds.has(a.owner)) continue;
    (relics[a.owner] ||= []).push({ slug: a.slug, name: a.name, category: a.category });
  }

  return (
    <div data-culture="egyptian">
      <HeroBanner
        as="h1"
        slot="page-cards"
        culture="cards"
        eyebrow="The Deck"
        title="Every god, as a card"
        tagline={`A trading-card reading of the entire Atlas — ${cards.length} deities across ${ALL_CULTURES.length} pantheons, each derived from its god's verified profile.`}
        imageSlot={resolveBannerSlot('page-cards')}
      >
        <a href="#deck" className="btn">Browse the deck ↓</a>
        <Link href="/how-to-play" className="btn">How to play</Link>
        <Link href="/cards/print" className="btn">Open print sheet</Link>
        <Link href="/artifacts" className="btn">The Vault</Link>
      </HeroBanner>

      <div className="container" style={{ paddingTop: 24 }}>
        <div className="mono" style={{ color: 'var(--ink-2)', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <span>{cards.length} cards</span>
          <span>{ALL_CULTURES.length} pantheons</span>
          <span>{mythics} mythic</span>
        </div>
      </div>

      <section className="section-sm" style={{ paddingBottom: 8 }}>
        <div className="container">
          <span className="eyebrow">How to read a card</span>
          <div className="deck-legend">
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--gold)' }} /><b>Art + element sigil + type line.</b> The god&apos;s portrait, element (light, storm, water…) and class. The sigil is a hand-drawn mark, not a photo.</div>
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--accent-2)' }} /><b>Culture badge + essence cost.</b> The pantheon chip, and the number in the header corner — how much to summon them (interpretive, scaled to their heft).</div>
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--accent)' }} /><b>PWR / GRD.</b> Power and Guard, 1–12, seeded from the god&apos;s profile so they are stable and reproducible.</div>
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--ink-2)' }} /><b>Flavor + [S#].</b> The short profile, with the same source citations as the rest of the Atlas. Tap a card to open its full profile, relics and print sheet.</div>
          </div>
        </div>
      </section>

      <div id="deck" className="section-sm" style={{ paddingTop: 8 }}>
        <div className="container">
          <CardDeck cards={cards} relics={relics} />
        </div>
      </div>

      <section className="section-sm" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow">Pantheons in the deck</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            {ALL_CULTURES.map((id) => (
              <Link key={id} href={`/cards?culture=${id}`} className="chip" style={{ padding: '10px 18px', borderColor: 'var(--line)' }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--ink-0)' }}>{loadCulture(id).meta.name.replace(' Mythology', '').replace('Ancient ', '')}</strong>
                <span className="faint" style={{ marginLeft: 8 }}>{byCulture[id] || 0} cards</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
