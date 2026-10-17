import type { Metadata } from 'next';
import Link from 'next/link';
import { DuelClient } from '../components/play/DuelClient';

export const metadata: Metadata = {
  title: 'Play — hot-seat duel',
  description: 'A self-contained two-player hot-seat prototype of Pantheon, the Divine Atlas card game. Pick a pantheon, channel essence, and topple the Cosmic Pillar.',
};

export default function PlayPage() {
  return (
    <div className="play-page">
      <header className="deck-hero">
        <div className="container">
          <span className="eyebrow">Play</span>
          <h1 className="display-xl" style={{ marginTop: 14 }}>The duel table</h1>
          <p className="muted" style={{ maxWidth: 680, marginTop: 18, fontSize: '1.05rem', lineHeight: 1.6 }}>
            A true two-player hot-seat prototype, played on real Atlas data — every
            card&apos;s element, PWR, GRD and essence come straight from the deck you
            browsed. Same seed, same shuffle: a duel is fully reproducible. Pass one
            device back and forth, or play both sides yourself.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 26 }}>
            <Link href="/how-to-play" className="btn">How to play</Link>
            <Link href="/how-to-play/board" className="btn">Printable board</Link>
            <Link href="/cards" className="btn">The Deck</Link>
          </div>
        </div>
      </header>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <DuelClient />
        </div>
      </section>
    </div>
  );
}
