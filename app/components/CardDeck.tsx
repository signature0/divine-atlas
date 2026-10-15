'use client';
// The Deck — interactive card gallery (ADR-004). Pure presentation over
// allCards(); filtering is client-side so it feels instant across all 159 cards.
import { useEffect, useMemo, useState } from 'react';
import { ResolvedCard } from '../lib/data';
import { FlippableCard } from './FlippableCard';
import { ELEMENT_LABELS, ELEMENT_COLORS, RARITY_LABELS } from '../lib/card';
import { CULTURE_NAMES, CULTURE_ACCENTS } from '../lib/types';

const CULTURE_ORDER = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'];
const ELEMENT_ORDER = ['void', 'light', 'storm', 'fire', 'water', 'earth', 'life', 'death', 'war', 'mind', 'sky'];
const RARITY_ORDER = ['mythic', 'rare', 'uncommon', 'common'];

export function CardDeck({ cards }: { cards: ResolvedCard[] }) {
  // Static export (Cloudflare Pages): query params are read client-side on mount
  // (previously passed from the server page via searchParams, which breaks
  // `next build` with output: 'export').
  const [culture, setCulture] = useState<string>('all');
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('culture');
    if (c && CULTURE_ORDER.includes(c)) setCulture(c);
  }, []);
  const [element, setElement] = useState<string>('all');
  const [rarity, setRarity] = useState<string>('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(36);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return cards.filter((c) =>
      (culture === 'all' || c.culture === culture) &&
      (element === 'all' || c.element === element) &&
      (rarity === 'all' || c.rarity === rarity) &&
      (!ql || c.name.toLowerCase().includes(ql) || (c.native_name || '').toLowerCase().includes(ql) ||
        c.domains?.join?.(' ')?.toLowerCase?.().includes(ql))
    );
  }, [cards, culture, element, rarity, q]);

  const visible = filtered.slice(0, limit);
  const reset = () => { setCulture('all'); setElement('all'); setRarity('all'); setQ(''); setLimit(36); };

  return (
    <div className="deck">
      {/* controls */}
      <div className="deck-controls" role="region" aria-label="Filter the deck">
        <label className="deck-search">
          <span className="mono" style={{ color: 'var(--ink-2)', fontSize: '0.6rem', letterSpacing: '0.14em' }}>SEARCH</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setLimit(36); }}
            placeholder="Search a god, e.g. Odin, Amaterasu…"
            aria-label="Search gods by name"
          />
        </label>

        <div className="deck-group">
          <span className="deck-label">Culture</span>
          <div className="deck-chips">
            <button className={`chip-btn${culture === 'all' ? ' active' : ''}`} onClick={() => { setCulture('all'); setLimit(36); }}>All</button>
            {CULTURE_ORDER.map((c) => (
              <button key={c} className={`chip-btn${culture === c ? ' active' : ''}`} style={culture === c ? { borderColor: CULTURE_ACCENTS[c], color: CULTURE_ACCENTS[c] } : undefined}
                onClick={() => { setCulture(c); setLimit(36); }}>{CULTURE_NAMES[c]}</button>
            ))}
          </div>
        </div>

        <div className="deck-group">
          <span className="deck-label">Element</span>
          <div className="deck-chips">
            <button className={`chip-btn${element === 'all' ? ' active' : ''}`} onClick={() => { setElement('all'); setLimit(36); }}>All</button>
            {ELEMENT_ORDER.map((e) => (
              <button key={e} className={`chip-btn${element === e ? ' active' : ''}`} style={element === e ? { borderColor: ELEMENT_COLORS[e as keyof typeof ELEMENT_COLORS], color: ELEMENT_COLORS[e as keyof typeof ELEMENT_COLORS] } : undefined}
                onClick={() => { setElement(e); setLimit(36); }}>{ELEMENT_LABELS[e as keyof typeof ELEMENT_LABELS]}</button>
            ))}
          </div>
        </div>

        <div className="deck-group">
          <span className="deck-label">Rarity</span>
          <div className="deck-chips">
            <button className={`chip-btn${rarity === 'all' ? ' active' : ''}`} onClick={() => { setRarity('all'); setLimit(36); }}>All</button>
            {RARITY_ORDER.map((r) => (
              <button key={r} className={`chip-btn${rarity === r ? ' active' : ''}`} onClick={() => { setRarity(r); setLimit(36); }}>{RARITY_LABELS[r as keyof typeof RARITY_LABELS]}</button>
            ))}
          </div>
        </div>

        <div className="deck-count mono" aria-live="polite">
          {filtered.length} card{filtered.length === 1 ? '' : 's'} in view · {(culture === 'all' ? 'all pantheons' : CULTURE_NAMES[culture])}
          {(q || element !== 'all' || rarity !== 'all') && <button className="deck-reset" onClick={reset}>reset ✕</button>}
        </div>
      </div>

      {/* grid */}
      <div className="deck-grid">
        {visible.map((c) => (
          <FlippableCard key={c.id} card={c} />
        ))}
      </div>
      {!visible.length && <div className="deck-empty">No cards match — try clearing a filter.</div>}

      {filtered.length > limit && (
        <div className="deck-more">
          <button className="btn" onClick={() => setLimit((l) => l + 36)}>Show {Math.min(36, filtered.length - limit)} more</button>
        </div>
      )}
    </div>
  );
}
