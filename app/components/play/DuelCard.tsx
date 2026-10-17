'use client';
// Presentational duel card face (PHASE5). Compact, click-first, no Link — a card
// in a duel is a button (summon / select / target), not a navigation target.
// Colors come from the card's own element + culture so a card keeps its identity.
import { ELEMENT_COLORS, ELEMENT_LABELS, RARITY_LABELS } from '../../lib/card';
import { CULTURE_ACCENTS } from '../../lib/types';
import type { DuelCardData } from '../../lib/pantheon-data';
import type { FieldDeity } from '../../lib/pantheon';

function ElGlyph({ element, color }: { element: string; color: string }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let inner: React.ReactNode;
  switch (element) {
    case 'fire': inner = <path d="M12 3 C8 9 8 12 12 21 C16 12 16 9 12 3 Z" {...p} />; break;
    case 'water': inner = <path d="M3 12 q3 -3 6 0 t6 0 t6 0 M3 16 q3 -3 6 0 t6 0 t6 0" {...p} />; break;
    case 'earth': inner = <path d="M5 18 h14 M7 18 l5-11 5 11 M8 13 h8" {...p} />; break;
    case 'storm': inner = <path d="M13 3 L6 13 h5 l-1 8 7-11 h-5 z" {...p} />; break;
    case 'life': inner = <path d="M12 20 C12 14 5 13 5 7 a5 5 0 0 1 7 -4 5 5 0 0 1 7 4 c0 6 -7 7 -7 13 Z" {...p} />; break;
    case 'death': inner = <path d="M6 4 h12 v16 a6 3 0 0 1 -12 0 Z M12 4 v13" {...p} />; break;
    case 'war': inner = <path d="M5 5 l14 14 M19 5 L5 19" {...p} />; break;
    case 'mind': inner = <path d="M12 3 c5 0 7 4 7 7 0 5 -4 5 -5 8 -1 2 -4 2 -5 0 -1 -3 -4 -3 -4 -8 0 -3 2 -7 7 -7 Z" {...p} />; break;
    case 'sky': inner = <g><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3" {...p} /></g>; break;
    case 'light': inner = <g><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3" {...p} /></g>; break;
    default: inner = <circle cx="12" cy="12" r="7" {...p} strokeDasharray="2 3" />;
  }
  return <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">{inner}</svg>;
}

export function DuelCard({ data, deity, selected, disabled, hit, sick, attacked, onClick, label }: {
  data: DuelCardData;
  deity?: FieldDeity;
  selected?: boolean;
  disabled?: boolean;
  hit?: boolean;        // legal target highlight
  sick?: boolean;
  attacked?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const el = ELEMENT_COLORS[data.element];
  const accent = CULTURE_ACCENTS[data.culture] || '#c8a24a';
  const power = deity ? deity.power : data.stats.power;
  const guard = deity ? deity.guard : data.stats.guard;
  const damage = deity ? deity.damage : 0;
  const cost = data.stats.essence;

  const cls = [
    'dc',
    selected ? 'dc-selected' : '',
    disabled ? 'dc-disabled' : '',
    hit ? 'dc-hit' : '',
    deity ? 'dc-field' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={cls}
      style={{ '--dc-el': el, '--dc-accent': accent } as React.CSSProperties}
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={label || `${data.name}, ${ELEMENT_LABELS[data.element]} ${data.rarity}, cost ${cost}, PWR ${power}, GRD ${guard}${deity && deity.relicName ? `, relic ${deity.relicName}` : ''}`}
      aria-pressed={selected || undefined}
      title={data.name}
    >
      <span className="dc-cost" aria-hidden="true">{deity ? data.stats.essence : cost}</span>
      <span className="dc-name">{data.name}</span>
      <span className="dc-el">
        <ElGlyph element={data.element} color={el} />
        {ELEMENT_LABELS[data.element]}
      </span>
      <span className="dc-stats">
        <span className="dc-stat"><b style={{ color: el }}>{power}</b> PWR</span>
        <span className="dc-stat"><b style={{ color: el }}>{guard}</b> GRD{damage > 0 ? <em> −{damage}</em> : null}</span>
      </span>
      <span className="dc-foot">
        <span className="dc-rarity">{RARITY_LABELS[data.rarity]}</span>
        {deity && deity.relicName && <span className="dc-relic" title={deity.relicName}>◆ {deity.relicName}</span>}
        {sick && <span className="dc-badge">sick</span>}
        {attacked && !sick && <span className="dc-badge">struck</span>}
      </span>
    </button>
  );
}
