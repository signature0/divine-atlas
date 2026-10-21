'use client';
// Presentational Relic card (Phase 4; unified with the deity card in v2 Phase 11).
//
// The relic tile now renders through the SAME skeleton as DeityCard
// (CardShell / CardFace / CardArt / CardStatRow): identical poker silhouette
// (2.5:3.5), frame, radius, shadow, art box and info-strip typography. Only the
// relic-specific band, owner line and type/rarity data differ. There is NO flip
// affordance: the whole card is one link to the artifact page.
import Link from 'next/link';
import { ELEMENT_LABELS, RARITY_LABELS } from '../lib/card';
import { CULTURE_ACCENTS, CULTURE_NAMES, CULTURE_TEXT_COLORS } from '../lib/types';
import type { RelicCard as RelicCardData } from '../lib/relic-card';
import { cultureIcons } from './icons';
import { CardArt, CardFace, CardShell, CardStatRow } from './CardFrame';

/** Strip [S#] citation markers (both `**[S1]**` and `[S1]`) for display. */
function stripRefs(s: string): string {
  return (s || '').replace(/\*\*\[S\d+\]\*\*/g, '').replace(/\[S\d+\]/g, '').trim();
}

function RelicFace({ card, size = 'md' }: {
  card: RelicCardData;
  size?: 'sm' | 'md' | 'lg';
}) {
  const cultureAccent = CULTURE_ACCENTS[card.culture] || '#c8a24a';
  const cultureText = CULTURE_TEXT_COLORS[card.culture] || cultureAccent;
  const CultureIcon = cultureIcons[card.culture];

  return (
    <CardShell
      size={size}
      element={card.element}
      accent={cultureAccent}
      variant="relic"
      style={{ '--rc-el': `var(--tc-el)`, '--rc-accent': cultureAccent } as React.CSSProperties}
    >
      <CardFace>
        {/* RELIC band — the relic's only signature frame marker (same frame as a god card). */}
        <div className="rc-band">
          <span className="rc-band-word">RELIC</span>
          <span className="rc-band-rarity">{RARITY_LABELS[card.rarity]}</span>
        </div>

        <CardArt
          src={card.image_url}
          alt={card.name}
          fallback={card.name.slice(0, 2).toUpperCase()}
        />

        {/* name + native name — same hierarchy/typography as the deity card */}
        <div className="tc-header">
          <div className="tc-title">
            <div className="tc-name">{card.name}</div>
            {card.native_name && <div className="tc-native">{card.native_name}</div>}
          </div>
          <span className="rc-el" aria-label={`Element ${ELEMENT_LABELS[card.element]}`}>
            {ELEMENT_LABELS[card.element]}
          </span>
        </div>

        {/* culture chip + relic type line */}
        <div className="tc-meta">
          <span className="tc-culture-badge" style={{ color: cultureText, borderColor: `color-mix(in srgb, ${cultureAccent} 55%, var(--line))` }}>
            {CultureIcon && <CultureIcon width={13} height={13} />}
            {CULTURE_NAMES[card.culture] || card.culture}
          </span>
          <span className="tc-typeline">
            <span>{card.type_line}</span>
          </span>
        </div>

        {card.ownerName && (
          <div className="tc-meta">
            <span className="rc-owner-badge" title="Wielder / owner">Wielder — {card.ownerName}</span>
          </div>
        )}

        <div className="tc-flavor">
          <span className="tc-flavor-text">{stripRefs(card.flavor)}</span>
        </div>

        <CardStatRow power={card.stats.power} guard={card.stats.guard} />

        <div className="tc-footer">
          <span className="tc-rarity">{RARITY_LABELS[card.rarity]}</span>
          <span className="tc-code mono">{card.set_code}</span>
        </div>
      </CardFace>
    </CardShell>
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
