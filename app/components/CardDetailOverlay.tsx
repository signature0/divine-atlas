'use client';
// Phase 3 — tap-to-expand full-screen card detail (phone-first dialog).
// A modal overlay rendered by CardDeck. It is a pure view over the already
// resolved card (+ its relics); it invents no claims and adds no data.
// Accessibility: role=dialog / aria-modal, focus moves in on open and returns
// to the trigger on close, Tab is trapped, Escape closes, body scroll is locked.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ResolvedCard } from '../lib/data';
import { ELEMENT_COLORS, ELEMENT_LABELS, ELEMENT_TEXT_COLORS, RARITY_LABELS } from '../lib/card';
import { CULTURE_ACCENTS, CULTURE_NAMES } from '../lib/types';

export type Relic = { slug: string; name: string; category: string };

// ---- small local copies of the card face primitives (DeityCard keeps its own) ----
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

function Pips({ n, color, max = 12 }: { n: number; color: string; max?: number }) {
  return (
    <span className="tc-pips" role="img" aria-label={`${n} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="tc-pip" style={i < n ? { background: color, borderColor: color } : { borderColor: 'var(--line)' }} />
      ))}
    </span>
  );
}

// Hero art with the same broken-image letter fallback as the card faces: the
// generated art is deployed separately, so a missing PNG must fall back rather
// than flash a broken-image icon (mount check + onError).
function CdHeroArt({ card }: { card: ResolvedCard }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);
  if (card.image_url && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img ref={imgRef} src={card.image_url} alt={card.name} onError={() => setBroken(true)} />
    );
  }
  return <div className="cd-hero-fallback"><span>{card.name.slice(0, 2).toUpperCase()}</span></div>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function CardDetailOverlay({ card, relics, onClose }: {
  card: ResolvedCard;
  relics: Relic[];
  onClose: () => void;
}) {
  const el = ELEMENT_COLORS[card.element];
  const elText = ELEMENT_TEXT_COLORS[card.element];
  const cultureAccent = CULTURE_ACCENTS[card.culture] || '#c8a24a';
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ startY: number; startT: number } | null>(null);
  const [dy, setDy] = useState(0);
  const [reduced, setReduced] = useState(false);

  // ---- mount: focus in, lock scroll, wire keyboard, restore focus on close ----
  useEffect(() => {
    restoreRef.current = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(rm.matches);
    const onRm = () => setReduced(rm.matches);
    rm.addEventListener('change', onRm);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const root = panelRef.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!nodes.length) { e.preventDefault(); root.focus(); return; }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || active === root) { e.preventDefault(); last.focus(); }
      } else if (active === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      rm.removeEventListener('change', onRm);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [onClose]);

  // ---- swipe-down-to-close (header/handle only; touch-action: none) ----
  const onDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startT: Date.now() };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setDy(Math.max(0, e.clientY - dragRef.current.startY));
  };
  const onUp = () => {
    if (!dragRef.current) return;
    const dist = dy;
    const dt = Date.now() - dragRef.current.startT;
    const flick = dt < 250 && dist > 30;
    if (dist > 80 || flick) onClose();
    setDy(0);
    dragRef.current = null;
  };

  const familySections: { label: string; list: { id: string; name: string }[] }[] = [
    { label: 'Partners', list: card.family.partners },
    { label: 'Parents', list: card.family.parents },
    { label: 'Children', list: card.family.children },
  ];
  const hasFamily = familySections.some((s) => s.list.length);
  const hasRelics = relics.length > 0;
  const weapons = [...card.weapons, ...card.sacred_objects];

  const jump = (ref: string) => {
    document.getElementById(`cd-src-${ref}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };

  // story text → pieces, with [S#] markers as chips that scroll to the sources list
  const storyParts = (card.long || '').split(/(\[S\d+\])/g);

  return (
    <div className="cd-root">
      <div className="cd-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="cd-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${card.name} card details`}
        tabIndex={-1}
        style={{ '--tc-el': el, '--tc-el-text': elText, '--tc-culture': cultureAccent, transform: dy ? `translateY(${dy}px)` : undefined } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cd-handle" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span className="cd-grip" aria-hidden="true" />
        </div>

        <div className="cd-scroll">
          {/* hero */}
          <div className="cd-hero">
            <CdHeroArt card={card} />
          </div>

          <div className="cd-head">
            <span className="cd-culture" style={{ background: cultureAccent }}>{CULTURE_NAMES[card.culture] || card.culture}</span>
            <h2 className="cd-name">{card.name}</h2>
            {card.native_name && <div className="cd-native">{card.native_name}</div>}
            <div className="cd-typeline">
              <Sigil el={card.element} color={el} size={16} />
              <span>{card.type_line}</span>
              <span className="cd-rarity">{RARITY_LABELS[card.rarity]}</span>
            </div>
          </div>

          {/* stats */}
          <div className="cd-stats">
            <div className="cd-stat"><span className="cd-stat-label">Essence</span><span className="cd-stat-num" style={{ color: el }}>{card.stats.essence}</span></div>
            <div className="cd-stat"><span className="cd-stat-label">PWR</span><span className="cd-stat-num" style={{ color: el }}>{card.stats.power}</span><Pips n={card.stats.power} color={el} /></div>
            <div className="cd-stat"><span className="cd-stat-label">GRD</span><span className="cd-stat-num" style={{ color: el }}>{card.stats.guard}</span><Pips n={card.stats.guard} color={el} /></div>
          </div>

          {/* story */}
          <section className="cd-section">
            <h3 className="cd-h3">Story</h3>
            <p className="cd-story">
              {storyParts.map((p, i) => {
                const m = p.match(/^\[(S\d+)\]$/);
                if (m) {
                  return (
                    <button key={i} type="button" className="cd-ref" onClick={() => jump(m[1])}
                      aria-label={`Jump to source ${m[1]}`}>[{m[1]}]</button>
                  );
                }
                return <span key={i}>{p}</span>;
              })}
            </p>
          </section>

          {card.domains.length > 0 && (
            <section className="cd-section">
              <h3 className="cd-h3">Domains</h3>
              <div className="cd-chips">{card.domains.map((d) => <span key={d} className="chip">{d}</span>)}</div>
            </section>
          )}

          {card.symbols.length > 0 && (
            <section className="cd-section">
              <h3 className="cd-h3">Symbols</h3>
              <div className="cd-chips">{card.symbols.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </section>
          )}

          {weapons.length > 0 && (
            <section className="cd-section">
              <h3 className="cd-h3">Weapons &amp; sacred objects</h3>
              <div className="cd-chips">{weapons.map((w) => <span key={w} className="chip">{w}</span>)}</div>
            </section>
          )}

          {hasRelics && (
            <section className="cd-section">
              <h3 className="cd-h3">Relics</h3>
              <ul className="cd-list">
                {relics.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/artifacts/${r.slug}`} className="cd-link">
                      <span>{r.name}</span>
                      <span className="cd-link-sub mono">{r.category.replace(/_/g, ' ')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasFamily && (
            <section className="cd-section">
              <h3 className="cd-h3">Family</h3>
              {familySections.filter((s) => s.list.length).map((s) => (
                <div key={s.label} className="cd-family-row">
                  <span className="cd-family-label mono">{s.label}</span>
                  <span className="cd-family-links">
                    {s.list.map((f) => (
                      <Link key={f.id} href={`/deity/${f.id}`} className="cd-famlink">{f.name}</Link>
                    ))}
                  </span>
                </div>
              ))}
            </section>
          )}

          {card.sources.length > 0 && (
            <section className="cd-section">
              <h3 className="cd-h3">Sources</h3>
              <ol className="cd-sources">
                {card.sources.map((s) => (
                  <li key={s.ref} id={`cd-src-${s.ref}`}>
                    <span className="cd-src-ref mono">[{s.ref}]</span> {s.text}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* footer actions */}
          <div className="cd-actions">
            <Link href={`/deity/${card.id}`} className="btn">Open profile</Link>
            <Link href={`/cards/${card.id}`} className="btn">Print card</Link>
            <button type="button" className="btn cd-close" onClick={onClose} aria-label="Close card details">Close ×</button>
          </div>

          {/* image credit — moved off the card face (v2 Phase 5 D3). Honest:
              generated slots say "generated reconstruction · The Divine Atlas";
              archival artwork keeps its museum credit. */}
          {card.image_credit && <p className="cd-credit">{card.image_credit}</p>}
        </div>
      </div>
    </div>
  );
}
