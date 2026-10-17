'use client';
// Interactive wrapper around the presentational DeityCard (ADR-004), Phase 3.
// Tap/click/Enter on the card body opens the detail overlay. The 3D flip is
// demoted to a small ⟲ button (bottom-right) so the reverse plate stays
// reachable on every device; on pointer-hover devices hover still flips as
// before. All motion is disabled under prefers-reduced-motion.
import { useState, useRef, useEffect, useCallback } from 'react';
import { ResolvedCard } from '../lib/data';
import { DeityCard } from './DeityCard';

export function FlippableCard({ card, size = 'md', onOpen }: {
  card: ResolvedCard;
  size?: 'sm' | 'md' | 'lg';
  onOpen?: (id: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hv = window.matchMedia('(hover: hover)');
    setReduced(rm.matches);
    setHoverCapable(hv.matches);
    const onRm = () => { setReduced(rm.matches); if (rm.matches) setFlipped(false); };
    const onHv = () => { setHoverCapable(hv.matches); if (!hv.matches) setFlipped(false); };
    rm.addEventListener('change', onRm);
    hv.addEventListener('change', onHv);
    return () => { rm.removeEventListener('change', onRm); hv.removeEventListener('change', onHv); };
  }, []);

  // Flip is a secondary action now — the ⟲ button toggles it on every device.
  const toggleFlip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped((f) => !f);
  }, []);

  const open = useCallback(() => { onOpen?.(card.id); }, [onOpen, card.id]);

  const hoverFlip = hoverCapable && !reduced;
  return (
    <div
      ref={ref}
      className={`tc-flip${flipped ? ' is-flipped' : ''}${reduced ? ' is-static' : ''}`}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`${card.name} — ${card.type_line}, ${card.rarity} card. Activate to open details.`}
      onPointerEnter={(e) => { if (hoverFlip && e.pointerType !== 'touch') setFlipped(true); }}
      onPointerLeave={(e) => { if (hoverFlip && e.pointerType !== 'touch') setFlipped(false); }}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
    >
      <button
        type="button"
        className="tc-flip-btn"
        onClick={toggleFlip}
        aria-label={flipped ? 'Show card front' : 'Flip card to reverse'}
        aria-pressed={flipped}
        title={flipped ? 'Show front' : 'Flip card'}
      >
        ⟲
      </button>
      <div className="tc-flip-inner">
        <div className="tc-flip-front"><DeityCard card={card} size={size} /></div>
        <div className="tc-flip-back"><DeityCard card={card} showBack size={size} /></div>
      </div>
    </div>
  );
}
