'use client';
// Presentational Deity Card face (ADR-004; hierarchy reworked v2 Phase 4).
//
// Client component (the footer "print ↗" Link carries an onClick to stop
// propagation). Takes only serializable data and uses no server-only features, so
// it renders on both server and client — reused by the deck tile, the deck list,
// the homepage teaser, the deity-profile print run, and the rulebook anatomy.
//
// Front-face hierarchy (phone-first, D2): art (flexes inside the fixed 2.5:3.5
// card) → name + native → culture badge + type → one-line summary → PWR/GRD →
// tidy footer. Everything
// else (rarity, set code, source refs) is a small footer strip; the full story,
// family, domains, symbols, relics and sources live in CardDetailOverlay.
//
// The former rear "collectible plate" is only rendered for the print sheet via
// `showBack` — there is no flip affordance. `interactive={false}` suppresses the
// inner print link so the face can be embedded inside an outer anchor (the
// homepage teaser) without producing `<a>` inside `<a>` (hydration error #418).
import { ELEMENT_COLORS, ELEMENT_LABELS, RARITY_LABELS } from '../lib/card';
import { ResolvedCard } from '../lib/data';
import { CULTURE_ACCENTS, CULTURE_NAMES, CULTURE_TEXT_COLORS } from '../lib/types';
import { cultureIcons } from './icons';
import Link from 'next/link';
import { CardArt, CardFace, CardShell, CardStatRow } from './CardFrame';

// A small geometric sigil per element — hand-drawn SVG, crisp at any size, prints clean.
function Sigil({ el, color, size = 20 }: { el: string; color: string; size?: number }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
    <line key={a} x1="12" y1="3" x2="12" y2="6.5" {...p} transform={`rotate(${a} 12 12)`} />
  ));
  let inner: React.ReactNode;
  switch (el) {
    case 'light': inner = (<g><circle cx="12" cy="12" r="4" {...p} />{rays}</g>); break;
    case 'storm': inner = <path d="M13 3 L6 13 h5 l-1 8 7-11 h-5 z" {...p} />; break;
    case 'fire': inner = <path d="M12 3 C8 8 8 11 12 21 C16 11 16 8 12 3 Z M12 9 C10.5 11 10.5 13 12 15 C13.5 13 13.5 11 12 9 Z" {...p} />; break;
    case 'water': inner = <path d="M3 12 q3 -3 6 0 t6 0 t6 0 M3 17 q3 -3 6 0 t6 0 t6 0" {...p} />; break;
    case 'earth': inner = (<g><rect x="5" y="9" width="14" height="9" rx="1" {...p} /><path d="M8 9 v-3 h8 v3 M12 9 v9" {...p} /></g>); break;
    case 'life': inner = <path d="M12 20 C12 14 5 13 5 7 a5 5 0 0 1 7 -4 5 5 0 0 1 7 4 c0 6 -7 7 -7 13 Z" {...p} />; break;
    case 'death': inner = (<g><path d="M6 4 h12 v16 a6 3 0 0 1 -12 0 Z" {...p} /><line x1="12" y1="4" x2="12" y2="17" {...p} /><line x1="8" y1="9" x2="16" y2="9" {...p} /></g>); break;
    case 'war': inner = <path d="M5 5 l14 14 M19 5 L5 19 M5 9 V5 h4 M19 9 V5 h-4" {...p} />; break;
    case 'mind': inner = <path d="M12 3 c5 0 7 4 7 7 0 2 -1 3 -2 4 1 1 1 3 0 4 -1 1 -3 2 -5 2 -2 0 -4 -1 -5 -2 -1 -1 -1 -3 0 -4 -1 -1 -2 -2 -2 -4 0 -3 2 -7 7 -7 Z" {...p} />; break;
    case 'sky': inner = (<g><circle cx="12" cy="12" r="2.5" {...p} /><path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M19 5 l-2 2 M5 19 l2-2" {...p} /></g>); break;
    default: inner = <circle cx="12" cy="12" r="8" {...p} strokeDasharray="2 3" />;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{inner}</svg>;
}

export function DeityCard({ card, showBack = false, size = 'md', asHeading = false, interactive = true }: {
  card: ResolvedCard;
  showBack?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asHeading?: boolean;
  interactive?: boolean;
}) {
  const el = ELEMENT_COLORS[card.element];
  const cultureAccent = CULTURE_ACCENTS[card.culture] || '#c8a24a';
  const cultureText = CULTURE_TEXT_COLORS[card.culture] || cultureAccent;
  const isMythic = card.rarity === 'mythic';
  const CultureIcon = cultureIcons[card.culture];
  const refs = card.source_refs.map((r) => `[${r}]`).join(' ');

  return (
    <CardShell size={size} element={card.element} accent={cultureAccent} variant={undefined}>
      {isMythic && <div className="tc-mythic-ring" aria-hidden="true" />}

      {showBack ? (
        // Print-sheet reverse plate (also reachable as the print card back). The
        // detailed legend content lives on the overlay, not here.
        <div className="tc-back">
          <div className="tc-back-rim" aria-hidden="true" />
          <div className="tc-back-sigil"><Sigil el={card.element} color={el} size={64} /></div>
          <div className="tc-back-wordmark">The Divine Atlas</div>
          <div className="tc-back-sub">{ELEMENT_LABELS[card.element]} · {card.culture} pantheon</div>
          <div className="tc-back-code mono">{card.set_code}</div>
        </div>
      ) : (
        <CardFace>
          {/* 1 · art — flexes into the remaining height of the fixed-ratio card.
              The generated-reconstruction credit lives in CardDetailOverlay, not on
              the art (v2 Phase 5 D3). */}
          <CardArt
            src={card.image_url}
            alt={card.name}
            fallback={card.name.slice(0, 2).toUpperCase()}
          />

          {/* 2 · name + native name */}
          <div className="tc-header">
            <div className="tc-title">
              {asHeading
                ? <h1 className="tc-name">{card.name}</h1>
                : <div className="tc-name">{card.name}</div>}
              {card.native_name && <div className="tc-native">{card.native_name}</div>}
            </div>
            <div className="tc-cost" title="Essence cost — interpretive" aria-label={`Essence cost ${card.stats.essence}`}>
              {card.stats.essence}
            </div>
          </div>

          {/* 3 · culture badge + type */}
          <div className="tc-meta">
            <span className="tc-culture-badge" style={{ color: cultureText, borderColor: `color-mix(in srgb, ${cultureAccent} 55%, var(--line))` }}>
              {CultureIcon && <CultureIcon width={13} height={13} />}
              {CULTURE_NAMES[card.culture] || card.culture}
            </span>
            <span className="tc-typeline">
              <Sigil el={card.element} color={el} size={14} />
              <span>{card.type_line}</span>
            </span>
          </div>

          {/* 4 · one-line summary (description_short, clamped to 2 lines) */}
          <div className="tc-flavor">
            <span className="tc-flavor-text">{card.flavor}</span>
          </div>

          {/* 5 · key stats — PWR / GRD only */}
          <CardStatRow power={card.stats.power} guard={card.stats.guard} />

          {/* 6 · tidy footer strip */}
          <div className="tc-footer">
            <span className="tc-rarity">{RARITY_LABELS[card.rarity]}</span>
            <span className="tc-code mono">{card.set_code}</span>
            {refs && <span className="tc-refs mono">{refs}</span>}
            {interactive && (
              <Link href={`/cards/${card.id}`} className="tc-print" aria-label={`Open ${card.name} print sheet`}
                onClick={(e) => e.stopPropagation()}>print ↗</Link>
            )}
          </div>
        </CardFace>
      )}
    </CardShell>
  );
}
