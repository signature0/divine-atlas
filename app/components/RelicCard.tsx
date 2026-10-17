'use client';
// Presentational Relic card (Phase 4; hierarchy reworked v2 Phase 4).
//
// Deliberately a SIBLING of DeityCard (which is typed to ResolvedCard +
// DeityCard internals) rather than a fork: it reuses the same 5:7 art-box
// geometry (--tc-art-ratio), but paints a DISTINCT archival frame — vault accent
// rules + corner rivets + a "RELIC" band instead of the deity rarity-pip
// treatment. There is NO flip affordance (D1): the whole card is one link to the
// artifact page, whose detail view carries the full story, abilities, provenance
// and classification (the former "museum-plaque" reverse content).
//
// Front-face hierarchy (D4): art → name + native → owner-god badge + RELIC type
// → one-line flavor → rarity + tier stats → tidy footer.
//
// SSR/hydration-safe: the faces are pure functions of serializable data; the
// only hooks live in this 'use client' module behind effects, so the same
// markup renders on the server and the client. No window/localStorage during
// render, no Math.random.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ELEMENT_COLORS, ELEMENT_LABELS, ELEMENT_TEXT_COLORS, RARITY_LABELS } from '../lib/card';
import { CULTURE_ACCENTS } from '../lib/types';
import type { RelicCard as RelicCardData } from '../lib/relic-card';

/** Strip [S#] citation markers (both `**[S1]**` and `[S1]`) for display. */
function stripRefs(s: string): string {
  return (s || '').replace(/\*\*\[S\d+\]\*\*/g, '').replace(/\[S\d+\]/g, '').trim();
}

// Letter-seal fallback for a missing/broken artwork. Mirrors DeityCard's
// DeityArt: onError catches post-hydration failures; a mount-time check
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

function RelicFace({ card, size = 'md' }: {
  card: RelicCardData;
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

  return (
    <div className={`rc rc-${size}`} style={styleVars}>
      <div className="rc-face">
        {/* RELIC band — the relic's signature frame (distinct from deity cards) */}
        <div className="rc-band">
          <span className="rc-band-word">RELIC</span>
          <span className="rc-band-rarity">{RARITY_LABELS[card.rarity]}</span>
        </div>

        {/* art — same 5:7 art-box contract as deity cards. The image credit is
            not painted on the art (v2 Phase 5 D3); it lives on the artifact
            detail page (the relic's detail view). */}
        <div className="rc-art">
          <RelicArt card={card} />
        </div>

        {/* name + native name */}
        <div className="rc-header">
          <div className="rc-title">
            <div className="rc-name">{card.name}</div>
            {card.native_name && <div className="rc-native">{card.native_name}</div>}
          </div>
          <span className="rc-el" aria-label={`Element ${ELEMENT_LABELS[card.element]}`}>
            {ELEMENT_LABELS[card.element]}
          </span>
        </div>

        {/* owner-god badge + type */}
        <div className="rc-meta">
          {card.ownerName && (
            <span className="rc-owner-badge" title="Wielder / owner">Wielder — {card.ownerName}</span>
          )}
          <span className="rc-typeline">{card.type_line}</span>
        </div>

        {/* one-line flavor */}
        <div className="rc-flavor">{stripRefs(card.flavor)}</div>

        {/* rarity + tier stats */}
        <div className="rc-stats">
          <div className="rc-stat">
            <span className="rc-stat-label">PWR</span>
            <span className="rc-stat-val">{card.stats.power}</span>
          </div>
          <div className="rc-stat rc-stat-right">
            <span className="rc-stat-label">GRD</span>
            <span className="rc-stat-val">{card.stats.guard}</span>
          </div>
        </div>

        {/* tidy footer */}
        <div className="rc-footer">
          <span className="rc-culture" style={{ color: cultureAccent }}>{card.culture}</span>
          <span className="rc-code mono">{card.set_code}</span>
        </div>
      </div>
    </div>
  );
}

export function RelicCard({ card, size = 'md' }: {
  card: RelicCardData;
  size?: 'sm' | 'md' | 'lg';
}) {
  const href = `/artifacts/${card.slug}`;
  const label = `${card.name} — ${card.type_line}, ${RARITY_LABELS[card.rarity]} relic. Open the artifact.`;
  return (
    <Link className="rc-card-link" href={href} aria-label={label}>
      <RelicFace card={card} size={size} />
    </Link>
  );
}
