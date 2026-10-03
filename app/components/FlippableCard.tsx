'use client';
// Interactive flip wrapper around the presentational DeityCard (ADR-004).
// Hover (pointer) or tap (touch) flips to the reverse plate. A click toggles it
// so it works on touch and for keyboard users (Enter/Space). The whole thing is
// disabled under prefers-reduced-motion — the card then shows its front and a
// "show reverse" affordance is dropped (the back is non-essential).
import { useState, useRef, useEffect, useCallback } from 'react';
import { ResolvedCard } from '../lib/data';
import { DeityCard } from './DeityCard';

export function FlippableCard({ card, size = 'md' }: { card: ResolvedCard; size?: 'sm' | 'md' | 'lg' }) {
  const [flipped, setFlipped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => { setReduced(mq.matches); if (mq.matches) setFlipped(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => { if (!reduced) setFlipped((f) => !f); }, [reduced]);

  // Escape a pointer that leaves; reset on blur.
  return (
    <div
      ref={ref}
      className={`tc-flip${flipped ? ' is-flipped' : ''}${reduced ? ' is-static' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${card.name} — ${card.type_line}, ${card.rarity} card. Activate to ${flipped ? 'show front' : 'show reverse'}.`}
      onPointerEnter={(e) => { if (e.pointerType !== 'touch' && !reduced) setFlipped(true); }}
      onPointerLeave={(e) => { if (e.pointerType !== 'touch' && !reduced) setFlipped(false); }}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
    >
      <div className="tc-flip-inner">
        <div className="tc-flip-front"><DeityCard card={card} size={size} /></div>
        <div className="tc-flip-back"><DeityCard card={card} showBack size={size} /></div>
      </div>
    </div>
  );
}
