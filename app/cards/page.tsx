import type { Metadata } from 'next';
import Link from 'next/link';
import { allCards, ALL_CULTURES, loadCulture } from '../lib/data';
import { CardDeck } from '../components/CardDeck';

export const metadata: Metadata = {
  title: 'The Deck — Deity Cards',
  description: 'Every god in the Divine Atlas as a collectible card — 159 deities across six pantheons, with a print-ready PDF for each.',
};

export default async function CardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initialCulture = typeof sp.culture === 'string' ? sp.culture : undefined;
  const cards = allCards();
  const byCulture = cards.reduce((m, c) => { m[c.culture] = (m[c.culture] || 0) + 1; return m; }, {} as Record<string, number>);
  const mythics = cards.filter((c) => c.rarity === 'mythic').length;

  return (
    <div data-culture="egyptian">
      <header className="deck-hero">
        <div className="container">
          <span className="eyebrow">The Deck</span>
          <h1 className="display-xl" style={{ marginTop: 14 }}>Every god, as a card</h1>
          <p className="muted" style={{ maxWidth: 660, marginTop: 18, fontSize: '1.05rem', lineHeight: 1.6 }}>
            A trading-card reading of the entire Atlas — {cards.length} deities across{' '}
            {ALL_CULTURES.length} pantheons. Each card is derived directly from the
            verified data on the god&apos;s profile (domains, symbols, weapons, sources);
            the power numbers are <em>interpretive</em>, in the same spirit as the Vault&apos;s tiers.
            {mythics} are Mythic. Hover a card to flip it; open it for the print-ready card.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 26 }}>
            <a href="#deck" className="btn">Browse the deck ↓</a>
            <Link href="/cards/print" className="btn">Open print sheet</Link>
            <Link href="/artifacts" className="btn">The Vault</Link>
          </div>
        </div>
      </header>

      <section className="section-sm" style={{ paddingBottom: 8 }}>
        <div className="container">
          <span className="eyebrow">How to read a card</span>
          <div className="deck-legend">
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--gold)' }} /><b>Element sigil + type line.</b> The god&apos;s element (light, storm, water…) and class. The sigil is a hand-drawn mark, not a photo.</div>
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--accent-2)' }} /><b>Essence cost.</b> The number in the header corner — how much to summon them (interpretive, scaled to their heft).</div>
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--accent)' }} /><b>PWR / GRD pips.</b> Power and Guard, 1–12, seeded from the god&apos;s profile so they are stable and reproducible.</div>
            <div className="deck-legend-item"><span className="deck-legend-swatch" style={{ background: 'var(--ink-2)' }} /><b>Flavor + [S#].</b> The short profile, with the same source citations as the rest of the Atlas. The reverse is a collectible plate.</div>
          </div>
        </div>
      </section>

      <div id="deck" className="section-sm" style={{ paddingTop: 8 }}>
        <div className="container">
          <CardDeck cards={cards} initialCulture={initialCulture} />
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
