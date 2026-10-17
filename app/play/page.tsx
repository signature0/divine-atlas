import type { Metadata } from 'next';
import Link from 'next/link';
import { DuelClient } from '../components/play/DuelClient';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = {
  title: 'Play — hot-seat duel',
  description: 'A self-contained two-player hot-seat prototype of Pantheon, the Divine Atlas card game. Pick a pantheon, channel essence, and topple the Cosmic Pillar.',
};

export default function PlayPage() {
  return (
    <div className="play-page">
      <HeroBanner
        as="h1"
        slot="page-play"
        culture="play"
        eyebrow="Play"
        title="The duel table"
        tagline="A true two-player hot-seat prototype, played on real Atlas data — same seed, same shuffle; a duel is fully reproducible."
        imageSlot={resolveBannerSlot('page-play')}
      >
        <Link href="/how-to-play" className="btn">How to play</Link>
        <Link href="/how-to-play/board" className="btn">Printable board</Link>
        <Link href="/cards" className="btn">The Deck</Link>
      </HeroBanner>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <DuelClient />
        </div>
      </section>
    </div>
  );
}
