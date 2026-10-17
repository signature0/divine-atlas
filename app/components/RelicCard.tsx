'use client';
// Presentational Relic card (Phase 4) + a small client flip wrapper.
//
// Deliberately a SIBLING of FlippableCard/DeityCard (which are typed to
// ResolvedCard + DeityCard internals) rather than a fork: it reuses the same
// 5:7 geometry (--tc-ratio) and the same rotateY flip mechanics, but paints a
// DISTINCT archival frame — vault accent rules + corner rivets + a "RELIC"
// band instead of the deity rarity-pip treatment.
//
// SSR/hydration-safe: the faces are pure functions of serializable data; the
// only hooks live in this 'use client' module behind effects, so the same
// markup renders on the server and the client. No window/localStorage during
// render, no Math.random.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ELEMENT_COLORS, ELEMENT_LABELS, ELEMENT_TEXT_COLORS, RARITY_LABELS } from '../lib/card';
import { CULTURE_ACCENTS } from '../lib/types';
import type { RelicCard as RelicCardData } from '../lib/relic-card';

const CERT_LABELS: Record<string, string> = {
  attested: 'Attested', likely: 'Likely', later_tradition: 'Later tradition',
  modern_interpretation: 'Modern interpretation', uncertain: 'Uncertain',
};

/** Strip [S#] citation markers (both `**[S1]**` and `[S1]`) for display. */
function stripRefs(s: string): string {
  return (s || '').replace(/\*\*\[S\d+\]\*\*/g, '').replace(/\[S\d+\]/g, '').trim();
}

// Letter-seal fallback for a missing/broken artwork. Mirrors VaultClient's
// ArtifactCard: onError catches post-hydration failures; a mount-time check
// catches images that already failed before hydration.
function RelicArt({ card }: { card: RelicCardData }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);
  if (card.image_url && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef}
        src={card.image_url}
        alt={card.name}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
    );
  }
  return <div className="rc-art-fallback"><span>{card.name.charAt(0)}</span></div>;
}

function RelicFace({ card, showBack = false, size = 'md' }: {
  card: RelicCardData;
  showBack?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const el = ELEMENT_COLORS[card.element];
  const cultureAccent = CULTURE_ACCENTS[card.culture] || '#c8a24a';
  const styleVars = {
    '--rc-el': el,
    '--tc-el-text': ELEMENT_TEXT_COLORS[card.element],
    '--rc-culture': cultureAccent,
    '--rc-accent': cultureAccent,
  } as React.CSSProperties;

  if (showBack) {
    return (
      <div className={`rc rc-${size} rc-back-face`} style={styleVars}>
        <div className="rc-back">
          <div className="rc-back-rim" aria-hidden="true" />
          <div className="rc-back-head">
            <span className="rc-back-word">The Divine Atlas</span>
            <span className="rc-back-code mono">{card.set_code}</span>
          </div>
          <div className="rc-back-sigil" style={{ color: el }} aria-hidden="true">◈</div>
          <div className="rc-back-long">{stripRefs(card.long)}</div>
          {card.abilities.length > 0 && (
            <div className="rc-abilities">
              {card.abilities.slice(0, 3).map((ab) => (
                <div className="rc-ability" key={ab.name}>
                  <span className="rc-ability-name">{ab.name}</span>
                  <span className={`rc-ability-cert cert-${ab.certainty}`}>
                    {CERT_LABELS[ab.certainty] || ab.certainty}
                  </span>
                  <span className="rc-ability-desc">{ab.description}</span>
                </div>
              ))}
            </div>
          )}
          <div className="rc-back-facts">
            <span>Status — {card.status}</span>
            {card.creatorName && <span>Maker — {card.creatorName}</span>}
            <span>{card.source_count} source{card.source_count === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rc rc-${size}`} style={styleVars}>
      <div className="rc-face">
        {/* RELIC band (replaces the deity rarity-pip header treatment) */}
        <div className="rc-band">
          <span className="rc-band-word">RELIC</span>
          <span className="rc-band-rarity">{RARITY_LABELS[card.rarity]}</span>
        </div>

        <div className="rc-header">
          <div className="rc-title">
            <div className="rc-name">{card.name}</div>
            {card.native_name && <div className="rc-native">{card.native_name}</div>}
          </div>
          <span className="rc-el" aria-label={`Element ${ELEMENT_LABELS[card.element]}`}>
            {ELEMENT_LABELS[card.element]}
          </span>
        </div>

        <div className="rc-typeline">{card.type_line}</div>

        <div className="rc-art">
          <RelicArt card={card} />
          <span className="rc-art-credit" aria-hidden="true">{card.image_credit || 'archival reconstruction'}</span>
        </div>

        <div className="rc-stats">
          <div className="rc-stat">
            <span className="rc-stat-label">PWR</span>
            <span className="rc-stat-val">{card.stats.power}</span>
          </div>
          <div className="rc-stat-mid"><span className="rc-rarity">{RARITY_LABELS[card.rarity]}</span></div>
          <div className="rc-stat rc-stat-right">
            <span className="rc-stat-label">GRD</span>
            <span className="rc-stat-val">{card.stats.guard}</span>
          </div>
        </div>

        {card.ownerName && <div className="rc-owner">Wielder — {card.ownerName}</div>}

        <div className="rc-flavor">{stripRefs(card.flavor)}</div>

        <div className="rc-footer">
          <span className="rc-culture" style={{ color: cultureAccent }}>{card.culture}</span>
          <span className="rc-code mono">{card.set_code}</span>
        </div>
      </div>
    </div>
  );
}

export function RelicCard({ card, size = 'md', flip = true }: {
  card: RelicCardData;
  size?: 'sm' | 'md' | 'lg';
  flip?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hoverCapable, setHoverCapable] = useState(false);

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

  const canFlip = flip && !reduced;
  const hoverFlip = canFlip && hoverCapable;
  const toggleFlip = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFlipped((f) => !f);
  }, []);

  const href = `/artifacts/${card.slug}`;
  const label = `${card.name} — ${card.type_line}, ${RARITY_LABELS[card.rarity]} relic. Open the artifact.`;
  // expose the culture accent to the flip frame + toggle (--rc-accent)
  const wrapStyle = { '--rc-accent': CULTURE_ACCENTS[card.culture] || '#c8a24a' } as React.CSSProperties;

  return (
    <div
      className={`rc-flip${flipped ? ' is-flipped' : ''}${canFlip ? '' : ' is-static'}`}
      style={wrapStyle}
    >
      {/* hover handlers live on the faces' container (not the outer wrapper) so
          hovering/clicking the sibling flip button never triggers hover-flip */}
      <div
        className="rc-flip-inner"
        onPointerEnter={(e) => { if (hoverFlip && e.pointerType !== 'touch') setFlipped(true); }}
        onPointerLeave={(e) => { if (hoverFlip && e.pointerType !== 'touch') setFlipped(false); }}
      >
        <Link className="rc-flip-front" href={href} aria-label={label}>
          <RelicFace card={card} size={size} />
        </Link>
        {/* reverse plate: same destination so the whole card stays navigable */}
        <Link className="rc-flip-back" href={href} tabIndex={-1} aria-hidden="true">
          <RelicFace card={card} showBack size={size} />
        </Link>
      </div>
      {canFlip && (
        <button
          type="button"
          className="rc-flip-btn"
          onClick={toggleFlip}
          aria-label={flipped ? 'Show relic front' : 'Flip relic to reverse'}
          aria-pressed={flipped}
          title={flipped ? 'Show front' : 'Flip card'}
        >
          ⟲
        </button>
      )}
    </div>
  );
}
