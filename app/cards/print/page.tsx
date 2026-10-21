import type { Metadata } from 'next';
import Link from 'next/link';
import { allCards, ALL_CULTURES } from '../../lib/data';
import { DeityCard } from '../../components/DeityCard';
import { PrintButton } from '../../components/PrintButton';

export const metadata: Metadata = {
  title: 'Print sheet — full deck',
  description: 'A print-ready sheet of every Deity Atlas card. Print or save as PDF; each card is trimmed to TCG size.',
};

export default function CardPrintDeckPage() {
  const cards = allCards();
  return (
    <div data-culture="egyptian" className="card-print-page">
      <div className="container print-toolbar" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg-0)' }}>
        <Link href="/cards" className="btn btn-secondary" style={{ padding: '6px 12px' }}>← The Deck</Link>
        <div className="print-hint mono" style={{ color: 'var(--ink-2)', fontSize: '0.64rem' }}>
          {cards.length} cards · front faces · 3 per row · trim to TCG size
        </div>
        <PrintButton label="Print full deck" />
      </div>

      <div className="container">
        <h1 className="muted print-intro" style={{ maxWidth: 720, lineHeight: 1.6, fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 400 }}>
          This is the full-deck sheet — {cards.length} front faces across {ALL_CULTURES.length} pantheons,
          in set order (DA-{ALL_CULTURES.map((c) => ({ japanese: 'JPN', greek: 'GRE', norse: 'NOR', egyptian: 'EGY', slavic: 'SLA', mesopotamian: 'MES' })[c]).join(' / ')}-###).
          For a single card at true 63.5 × 88.9 mm with its reverse, open it from the deck and choose
          <span className="mono"> print ↗</span> — or go straight to its <span className="mono">/cards/‹id›</span> sheet.
        </h1>
      </div>

      <div className="print-deck-grid" aria-label="Full deck print sheet">
        {cards.map((c) => (
          <div key={c.id} className="print-deck-item">
            <DeityCard card={c} size="lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
