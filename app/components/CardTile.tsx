'use client';
// Clickable card tile (v2 Phase 4, replacing the old turn-over card wrapper).
//
// Tap/click/Enter on the tile opens the CardDetailOverlay; all of the card's
// extra content (full story, family, relics, sources, print sheet) lives in
// that overlay. The old 3D-flip affordance is gone — the face is a single
// presentational DeityCard and the tile only adds the activation surface.
//
// Hydration-safe: no window/localStorage during render; purely serializable
// props plus a callback.
import { useCallback } from 'react';
import { ResolvedCard } from '../lib/data';
import { DeityCard } from './DeityCard';

export function CardTile({ card, size = 'md', onOpen }: {
  card: ResolvedCard;
  size?: 'sm' | 'md' | 'lg';
  onOpen?: (id: string) => void;
}) {
  const open = useCallback(() => { onOpen?.(card.id); }, [onOpen, card.id]);
  return (
    <div
      className="tc-open"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`${card.name} — ${card.type_line}, ${card.rarity} card. Activate to open details.`}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
    >
      {/* interactive={false}: the tile itself opens the overlay, so the inner
          print link is suppressed (its "Print card" action lives in the overlay). */}
      <DeityCard card={card} size={size} interactive={false} />
    </div>
  );
}
