import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cardFor, entityById, allCards } from '../../lib/data';
import { DeityCard } from '../../components/DeityCard';
import { PrintButton } from '../../components/PrintButton';
import { RARITY_LABELS, ELEMENT_LABELS } from '../../lib/card';

export function generateStaticParams() {
  return allCards().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = cardFor(id);
  return c ? { title: `${c.name} — card`, description: `Print-ready ${RARITY_LABELS[c.rarity]} ${c.type_line} card from The Divine Atlas.` } : { title: 'Not found' };
}

export default async function CardPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = cardFor(id);
  if (!card) notFound();
  const entity = entityById(id);

  return (
    <div data-culture={card.culture} className="card-print-page">
      <div className="container print-toolbar" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg-0)' }}>
        <Link href="/cards" className="btn" style={{ padding: '6px 12px' }}>← The Deck</Link>
        <div className="print-hint mono" style={{ color: 'var(--ink-2)', fontSize: '0.64rem' }}>
          TCG size · 63.5 × 88.9 mm · 3 mm bleed · 300 DPI · front + reverse
        </div>
        <PrintButton label="Print / Save as PDF" />
      </div>

      <div className="container print-sheet" aria-label="Card print sheet">
        {/* FRONT */}
        <div className="print-card print-card-front">
          <DeityCard card={card} size="lg" asHeading />
        </div>
        {/* BACK */}
        <div className="print-card print-card-back">
          <DeityCard card={card} showBack size="lg" />
        </div>

        <div className="print-collate mono">
          <div>PRINT SHEET · {card.set_code} · {card.name} ({ELEMENT_LABELS[card.element]}, {RARITY_LABELS[card.rarity]})</div>
          <div style={{ color: 'var(--ink-2)', marginTop: 4 }}>
            Trim at the inner crop marks · keep the 3 mm bleed when printing ·
            {entity ? ` full profile at the deity page` : ''}
          </div>
        </div>
      </div>

      <div className="container print-detail" style={{ maxWidth: 720 }}>
        <span className="eyebrow">About this card</span>
        <p className="muted" style={{ marginTop: 12, lineHeight: 1.7 }}>
          {card.long}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {card.symbols.map((s) => <span key={s} className="chip">{s}</span>)}
          {card.weapons.map((s) => <span key={s} className="chip chip-accent">{s}</span>)}
        </div>
      </div>
    </div>
  );
}
