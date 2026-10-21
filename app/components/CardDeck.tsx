'use client';
// The Deck — interactive card gallery (ADR-004), Phase 3.
// Pure presentation over allCards(); filtering is client-side so it feels
// instant across all 159 cards. Adds Grid / List / Hand layouts, a tap-to-expand
// detail overlay with client-side URL state (?card=), and a debounced search.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResolvedCard } from '../lib/data';
import { CardTile } from './CardTile';
import { DeityCard } from './DeityCard';
import { CardDetailOverlay } from './CardDetailOverlay';
import { ELEMENT_LABELS, ELEMENT_COLORS, ELEMENT_TEXT_COLORS, RARITY_LABELS } from '../lib/card';
import { CULTURE_NAMES, CULTURE_ACCENTS } from '../lib/types';
import { cardTagSlugs, tagSlug } from '../lib/tag';

const CULTURE_ORDER = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'];
const ELEMENT_ORDER = ['void', 'light', 'storm', 'fire', 'water', 'earth', 'life', 'death', 'war', 'mind', 'sky'];
const RARITY_ORDER = ['mythic', 'rare', 'uncommon', 'common'];

export type DeckRelic = { slug: string; name: string; category: string };
export type DeckRelics = Record<string, DeckRelic[]>;

type Layout = 'grid' | 'list' | 'hand';
const LAYOUTS: Layout[] = ['grid', 'list', 'hand'];
const LAYOUT_LABELS: Record<Layout, string> = { grid: 'Grid', list: 'List', hand: 'Hand' };

export function CardDeck({ cards, relics = {} }: { cards: ResolvedCard[]; relics?: DeckRelics }) {
  // Static export (Cloudflare Pages): query params are read client-side on mount
  // (previously passed from the server page via searchParams, which breaks
  // `next build` with output: 'export').
  const [culture, setCulture] = useState<string>('all');
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('culture');
    if (c && CULTURE_ORDER.includes(c)) setCulture(c);
  }, []);
  // Shareable tag view: /cards?tag=thunder applies after hydration (the static
  // export's prerendered HTML is the unfiltered deck, so there is no mismatch).
  const [tag, setTag] = useState<string | null>(null);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tag');
    setTag(t ? tagSlug(t) : null);
  }, []);
  const [element, setElement] = useState<string>('all');
  const [rarity, setRarity] = useState<string>('all');
  const [q, setQ] = useState('');       // live input value
  const [debouncedQ, setDebouncedQ] = useState(''); // applied filter (120ms debounce)
  const [pending, setPending] = useState(false);
  const [limit, setLimit] = useState(36);

  // layout mode (Grid default), persisted client-side only
  const [layout, setLayout] = useState<Layout>('grid');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('deck-layout');
      if (saved === 'grid' || saved === 'list' || saved === 'hand') setLayout(saved);
    } catch { /* localStorage may be unavailable */ }
  }, []);
  const chooseLayout = useCallback((l: Layout) => {
    setLayout(l);
    setLimit(36);
    try { localStorage.setItem('deck-layout', l); } catch { /* ignore */ }
  }, []);

  // debounce the search box (spec §4: subtle "filtering…" while pending)
  useEffect(() => {
    if (q === debouncedQ) { setPending(false); return; }
    setPending(true);
    const t = setTimeout(() => { setDebouncedQ(q); setLimit(36); }, 120);
    return () => clearTimeout(t);
  }, [q, debouncedQ]);

  const filtered = useMemo(() => {
    const ql = debouncedQ.trim().toLowerCase();
    return cards.filter((c) =>
      (culture === 'all' || c.culture === culture) &&
      (element === 'all' || c.element === element) &&
      (rarity === 'all' || c.rarity === rarity) &&
      (!tag || cardTagSlugs(c).includes(tag)) &&
      (!ql || c.name.toLowerCase().includes(ql) || (c.native_name || '').toLowerCase().includes(ql) ||
        c.domains?.join?.(' ')?.toLowerCase?.().includes(ql))
    );
  }, [cards, culture, element, rarity, tag, debouncedQ]);

  const visible = filtered.slice(0, limit);

  // Result count + display label for the active tag view.
  const tagCards = useMemo(
    () => (tag ? cards.filter((c) => cardTagSlugs(c).includes(tag)) : []),
    [cards, tag],
  );
  const tagLabel = useMemo(() => {
    if (!tag) return '';
    for (const c of tagCards) {
      for (const value of [...c.domains, ...c.symbols, ...c.weapons, ...c.sacred_objects]) {
        if (tagSlug(value) === tag) return value;
      }
    }
    return tag.replace(/-/g, ' ');
  }, [tag, tagCards]);
  const tagAccent = useMemo(() => {
    if (!tag) return 'var(--gold)';
    const cultures = new Set(tagCards.map((c) => c.culture));
    return cultures.size === 1 ? (CULTURE_ACCENTS[[...cultures][0]] || 'var(--gold)') : 'var(--gold)';
  }, [tag, tagCards]);

  const clearTag = useCallback(() => {
    setTag(null);
    setLimit(36);
    const url = new URL(window.location.href);
    url.searchParams.delete('tag');
    window.history.replaceState({}, '', url);
  }, []);

  const reset = () => {
    setCulture('all'); setElement('all'); setRarity('all'); setQ(''); setDebouncedQ(''); setLimit(36);
    if (tag) clearTag();
  };

  // ---- detail overlay + client-side URL state (?card=<id>) ----
  const [openId, setOpenId] = useState<string | null>(null);
  const openedFromUrl = useRef(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('card');
    if (id && cards.some((c) => c.id === id)) { openedFromUrl.current = true; setOpenId(id); }
  }, [cards]);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('card');
      setOpenId(id && cards.some((c) => c.id === id) ? id : null);
      const t = params.get('tag');
      setTag(t ? tagSlug(t) : null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [cards]);

  const openCard = useCallback((id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('card', id);
    window.history.pushState({ card: id }, '', url);
    openedFromUrl.current = false;
    setOpenId(id);
  }, []);

  const closeCard = useCallback(() => {
    if (openedFromUrl.current) {
      // deep-linked overlay: step back to the page the visitor came from
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('card');
      window.history.pushState({}, '', url);
    }
    openedFromUrl.current = false;
    setOpenId(null);
  }, []);

  const openCardData = openId ? cards.find((c) => c.id === openId) : undefined;

  // reduce-motion gate for the fan hover transforms
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const [handHover, setHandHover] = useState<number | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setNarrow(mq.matches);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const hand = filtered.slice(0, 10);
  const handTransform = (i: number, n: number) => {
    const off = i - (n - 1) / 2;
    // gentler fan on phones: rotation sweeps the card corners past the scroll
    // box and clips content at 380px; half the angle keeps every card readable
    const rot = Math.round(off * (narrow ? 2 : 4) * 100) / 100;
    const ty = Math.round(Math.abs(off) ** 2 * (narrow ? 1.2 : 2) * 100) / 100;
    return `rotate(${rot}deg) translateY(${ty}px)`;
  };

  return (
    <div className="deck">
      {/* controls */}
      <div className="deck-controls" role="region" aria-label="Filter the deck">
        <label className="deck-search">
          <span className="mono" style={{ color: 'var(--ink-2)', fontSize: '0.6rem', letterSpacing: '0.14em' }}>SEARCH</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a god, e.g. Odin, Amaterasu…"
            aria-label="Search gods by name"
          />
        </label>

        <div className="deck-layoutbar">
          <span className="deck-label">Layout</span>
          <div className="seg" role="radiogroup" aria-label="Card layout">
            {LAYOUTS.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={layout === l}
                className={`seg-btn${layout === l ? ' active' : ''}`}
                onClick={() => chooseLayout(l)}>
                {LAYOUT_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

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
              <button key={e} className={`chip-btn${element === e ? ' active' : ''}`} style={element === e ? { borderColor: ELEMENT_COLORS[e as keyof typeof ELEMENT_COLORS], color: ELEMENT_TEXT_COLORS[e as keyof typeof ELEMENT_TEXT_COLORS] } : undefined}
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
          {tag && (
            <button
              type="button"
              className="chip-btn deck-tag-chip"
              style={{ borderColor: tagAccent, color: tagAccent }}
              onClick={clearTag}
              aria-label={`Remove tag filter ${tagLabel}`}
            >
              {tagLabel} <span aria-hidden="true">×</span>
            </button>
          )}
          {tag ? (
            <span data-testid="tag-result-count" className="deck-tag-count">
              {filtered.length} {filtered.length === 1 ? 'god' : 'gods'} · {tagLabel}
            </span>
          ) : (
            <span>
              {filtered.length} card{filtered.length === 1 ? '' : 's'} in view · {(culture === 'all' ? 'all pantheons' : CULTURE_NAMES[culture])}
            </span>
          )}
          {pending && <span className="deck-filtering">filtering…</span>}
          {(q || element !== 'all' || rarity !== 'all' || tag) && <button className="deck-reset" onClick={reset}>reset ✕</button>}
        </div>
      </div>

      {/* card area — one of three layouts; controls stay put */}
      {layout === 'grid' && (
        <div className="deck-grid">
          {visible.map((c) => (
            <CardTile key={c.id} card={c} onOpen={openCard} />
          ))}
        </div>
      )}

      {layout === 'list' && (
        <div className="deck-list">
          {visible.map((c) => {
            const el = ELEMENT_COLORS[c.element];
            return (
              <div
                key={c.id}
                className="deck-row"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`${c.name} — ${c.type_line}. Open details.`}
                onClick={() => openCard(c.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(c.id); } }}
              >
                <div className="deck-row-card"><DeityCard card={c} size="sm" interactive={false} /></div>
                <div className="deck-row-body">
                  <div className="deck-row-name">{c.name}</div>
                  <div className="deck-row-type mono">{c.type_line}</div>
                </div>
                <span className="deck-row-culture mono" style={{ color: CULTURE_ACCENTS[c.culture] || '#c8a24a' }}>{CULTURE_NAMES[c.culture] || c.culture}</span>
                <div className="deck-row-stats mono">
                  <span>PWR <b style={{ color: el }}>{c.stats.power}</b></span>
                  <span>GRD <b style={{ color: el }}>{c.stats.guard}</b></span>
                </div>
                <span className="deck-row-chev" aria-hidden="true">›</span>
              </div>
            );
          })}
        </div>
      )}

      {layout === 'hand' && (
        <>
          <div className="deck-hand" role="list" aria-label="Hand of cards">
            {hand.map((c, i) => {
              const base = handTransform(i, hand.length);
              const lifted = !reduced && handHover === i;
              return (
                <div
                  key={c.id}
                  role="listitem"
                  className="deck-hand-card"
                  style={{ transform: lifted ? 'translateY(-14px) rotate(0deg)' : base, zIndex: lifted ? 20 : i }}
                  onMouseEnter={() => setHandHover(i)}
                  onMouseLeave={() => setHandHover((h) => (h === i ? null : h))}
                  onFocus={() => setHandHover(i)}
                  onBlur={() => setHandHover((h) => (h === i ? null : h))}
                >
                  <CardTile card={c} onOpen={openCard} />
                </div>
              );
            })}
          </div>
          <div className="deck-hand-hint">
            <button type="button" className="deck-hand-gridlink" onClick={() => chooseLayout('grid')}>View as grid →</button>
          </div>
        </>
      )}

      {!visible.length && (
        <div className="deck-empty">
          {tag ? (
            <>No gods tagged “{tagLabel}”. <button className="deck-reset" onClick={clearTag}>Clear tag ×</button></>
          ) : (
            'No cards match — try clearing a filter.'
          )}
        </div>
      )}

      {filtered.length > limit && (
        <div className="deck-more">
          <button className="btn btn-secondary" onClick={() => setLimit((l) => l + 36)}>Show {Math.min(36, filtered.length - limit)} more</button>
        </div>
      )}

      {openCardData && (
        <CardDetailOverlay
          card={openCardData}
          relics={relics[openCardData.id] || []}
          onClose={closeCard}
          onTagClick={() => { openedFromUrl.current = false; setOpenId(null); }}
        />
      )}
    </div>
  );
}
