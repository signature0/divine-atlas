import type { Metadata } from 'next';
import Link from 'next/link';
import { DuelClient } from '../components/play/DuelClient';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = {
  title: 'Play — hot-seat duel',
  description: 'A self-contained 2–4 player hot-seat prototype of Pantheon, the Divine Atlas card game. Pick your pantheons, channel essence, and topple the Cosmic Pillars.',
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
        tagline="A 2–4 player hot-seat free-for-all, played on real Atlas data — same seed, same seats; a game is fully reproducible. Last pillar standing wins."
        imageSlot={resolveBannerSlot('page-play')}
      >
        <Link href="/how-to-play" className="btn btn-primary">How to play</Link>
        <Link href="/how-to-play/board" className="btn btn-secondary">Printable board</Link>
        <Link href="/cards" className="btn btn-secondary">The Deck</Link>
      </HeroBanner>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <DuelClient />
        </div>
      </section>
    </div>
  );
}
