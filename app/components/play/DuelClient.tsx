'use client';
// /play — 2-player hot-seat duel (PHASE5). A thin React shell over the pure
// engine in app/lib/pantheon.ts: all rules live there, this file only renders
// state and dispatches actions. The card pool arrives at RUNTIME from
// /duel-deck.json (see the addendum) and is installed into pantheon-data.
//
// SSR/hydration-safe: no Date.now / Math.random during render (the random seed
// is chosen in an effect). All duel state is in memory; nothing is persisted.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DuelCard } from './DuelCard';
import { setDuelDeck, duelCard, duelRelicsForEntity } from '../../lib/pantheon-data';
import type { DuelDeckPayload } from '../../lib/pantheon-data';
import {
  newGame, reduce, undo,
  DECK_SIZE, PILLAR_HP, ESSENCE_CAP, HAND_LIMIT, summonCost, relicCost,
} from '../../lib/pantheon';
import type { Action, GameState, PlayerId } from '../../lib/pantheon';
import { CULTURE_NAMES, CULTURE_ACCENTS } from '../../lib/types';

const CULTURES = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'] as const;

type Pending = { attackerUid: number } | null;
type Sel = { kind: 'hand' | 'field'; uid: number } | null;

function PantheonPicker({ who, value, onChange }: { who: string; value: string; onChange: (c: string) => void }) {
  return (
    <div className="duel-pick">
      <span className="eyebrow">{who}</span>
      <div className="duel-chips">
        {CULTURES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip-btn${value === c ? ' active' : ''}`}
            style={value === c ? { borderColor: CULTURE_ACCENTS[c], color: CULTURE_ACCENTS[c] } : undefined}
            onClick={() => onChange(c)}
          >
            {CULTURE_NAMES[c]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DuelClient() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [p0Culture, setP0Culture] = useState('greek');
  const [p1Culture, setP1Culture] = useState('norse');
  const [seedText, setSeedText] = useState('');
  const [game, setGame] = useState<GameState | null>(null);
  const [sel, setSel] = useState<Sel>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [curtain, setCurtain] = useState(false);
  const [warn, setWarn] = useState('');

  // Deck fetch (runtime). The seed is chosen once, in an effect (hydration-safe).
  useEffect(() => {
    let alive = true;
    fetch('/duel-deck.json')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((p: DuelDeckPayload) => {
        if (!alive) return;
        if (!p || !Array.isArray(p.cards) || !p.cards.length) throw new Error('empty deck');
        setDuelDeck(p.cards, p.relics || {});
        setStatus('ready');
      })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setSeedText((s) => s || String(Math.floor(Math.random() * 1000000000)));
  }, []);

  const start = useCallback(() => {
    const seed = (Number.parseInt(seedText, 10) || 1) >>> 0;
    setGame(newGame(seed, p0Culture, p1Culture));
    setSel(null); setPending(null); setCurtain(false); setWarn('');
  }, [seedText, p0Culture, p1Culture]);

  const act = useCallback((a: Action) => {
    setGame((g) => (g ? reduce(g, a) : g));
    setSel(null); setPending(null); setWarn('');
  }, []);

  const doEndTurn = useCallback(() => {
    setGame((g) => {
      if (!g || g.over) return g;
      const next = reduce(g, { type: 'endTurn', player: g.active });
      return next;
    });
    setSel(null); setPending(null); setCurtain(true);
  }, []);

  // uid -> owning entity id, across every zone (dead uids live in the discard).
  const uidMap = useMemo(() => {
    const m = new Map<number, { entityId: string; owner: PlayerId }>();
    if (!game) return m;
    game.players.forEach((pl, pi) => {
      const owner = pi as PlayerId;
      for (const z of [pl.hand, pl.deck, pl.discard]) for (const c of z) m.set(c.uid, { entityId: c.entityId, owner });
      for (const d of pl.field) if (d) m.set(d.uid, { entityId: d.entityId, owner });
    });
    return m;
  }, [game]);

  const nameOf = useCallback((uid: number) => {
    const e = uidMap.get(uid);
    return e ? (duelCard(e.entityId)?.name || e.entityId) : `#${uid}`;
  }, [uidMap]);

  const fmt = useCallback((g: GameState, a: Action): string => {
    const P = (id: PlayerId) => (id === 0 ? 'P1' : 'P2');
    switch (a.type) {
      case 'draw': return `${P(a.player)} draws a card`;
      case 'channel': return `${P(a.player)} channels essence`;
      case 'summon': return `${P(a.player)} summons ${nameOf(a.uid)}`;
      case 'attach': return `${P(a.player)} attaches ${a.relic} to ${nameOf(a.uid)}`;
      case 'strike':
        if (a.targetKind === 'deity') return `${P(a.player)}'s ${nameOf(a.attackerUid)} strikes ${nameOf(a.targetUid!)}`;
        return a.interceptUid != null
          ? `${P(a.player)}'s ${nameOf(a.attackerUid)} strikes the Pillar (blocked by ${nameOf(a.interceptUid)})`
          : `${P(a.player)}'s ${nameOf(a.attackerUid)} strikes the Pillar`;
      case 'endTurn': return `— ${P(a.player)} ends the turn —`;
      default: return '';
    }
  }, [nameOf]);

  if (status === 'loading') {
    return <div className="duel-loading mono" role="status">Summoning the deck…</div>;
  }
  if (status === 'error') {
    return (
      <div className="duel-loading" role="alert">
        <p className="mono">Could not load /duel-deck.json.</p>
        <p className="muted small">The duel needs the generated card pool. Run <span className="mono">npx tsx scripts/gen-duel-data.ts</span> and reload.</p>
      </div>
    );
  }

  // ---- setup screen ----
  if (!game) {
    return (
      <div className="duel-setup">
        <div className="duel-setup-grid">
          <PantheonPicker who="Player 1 — choose a pantheon" value={p0Culture} onChange={setP0Culture} />
          <PantheonPicker who="Player 2 — choose a pantheon" value={p1Culture} onChange={setP1Culture} />
        </div>
        <div className="duel-seed">
          <label>
            <span className="deck-label">Seed</span>
            <input
              value={seedText}
              onChange={(e) => setSeedText(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              aria-label="Deck seed"
            />
          </label>
          <button type="button" className="chip-btn" onClick={() => setSeedText(String(Math.floor(Math.random() * 1000000000)))}>Random</button>
          <span className="faint small">Same seed → same shuffle. Both players draw {DECK_SIZE}-card decks.</span>
        </div>
        <div className="duel-setup-actions">
          <button type="button" className="btn" onClick={start}>Begin duel ⚔</button>
          <Link href="/how-to-play" className="btn">Read the rules</Link>
        </div>
      </div>
    );
  }

  // ---- duel ----
  const me = game.players[game.active];
  const foe = game.players[((game.active + 1) % 2) as PlayerId];
  const mainPhase = me.drawn && me.channeled && !pending;
  const active = game.active;
  const defender: PlayerId = ((active + 1) % 2) as PlayerId;

  const selCard = sel?.kind === 'hand' ? me.hand.find((c) => c.uid === sel.uid) : undefined;
  const selData = selCard ? duelCard(selCard.entityId) : undefined;
  const legalSlots = selCard && selData
    ? me.field.map((d, i) => (d ? -1 : i)).filter((i) => i >= 0 && me.essence >= summonCost(me.culture, selData))
    : [];
  const selDeity = sel?.kind === 'field' ? me.field.find((d) => d && d.uid === sel.uid) : undefined;
  const canStrike = !!selDeity && !selDeity.sick && !selDeity.attacked && mainPhase;
  const attachable = selDeity && !selDeity.relicSlug
    ? duelRelicsForEntity(selDeity.entityId).filter((r) => !me.relicsUsed.includes(r.slug))
    : [];

  const isTargetDeity = (uid: number) => canStrike && !!foe.field.find((d) => d && d.uid === uid);

  const onFoeDeity = (uid: number) => {
    if (pending) { act({ type: 'strike', player: active, attackerUid: pending.attackerUid, targetKind: 'pillar', interceptUid: uid }); return; }
    if (isTargetDeity(uid) && sel) act({ type: 'strike', player: active, attackerUid: sel.uid, targetKind: 'deity', targetUid: uid });
  };
  const onPillar = () => {
    if (pending) { act({ type: 'strike', player: active, attackerUid: pending.attackerUid, targetKind: 'pillar', interceptUid: null }); return; }
    if (canStrike && sel) { setPending({ attackerUid: sel.uid }); setSel(null); }
  };

  const lowHand = me.hand.length > HAND_LIMIT;

  const renderHalf = (pi: PlayerId) => {
    const pl = game.players[pi];
    const isActive = pi === active;
    const canHitPillar = !isActive && canStrike;
    const pillarInner = (
      <>
        <span className="duel-pillar-bar" style={{ width: `${Math.max(0, pl.pillar / PILLAR_HP) * 100}%` }} />
        <span className="duel-pillar-num">{pl.pillar}</span>
      </>
    );
    return (
      <section className={`duel-half${isActive ? ' is-active' : ' is-dim'}`} aria-label={`Player ${pi + 1} (${CULTURE_NAMES[pl.culture]})`}>
        <header className="duel-half-head">
          <span className="duel-who mono">P{pi + 1}</span>
          <span className="duel-culture" style={{ color: CULTURE_ACCENTS[pl.culture] }}>{CULTURE_NAMES[pl.culture]}</span>
          <span className="duel-res mono">
            {canHitPillar ? (
              <button type="button" className="duel-pillar duel-pillar-btn" onClick={onPillar} title="Strike this Pillar" aria-label={`Strike player ${pi + 1}'s Cosmic Pillar`}>{pillarInner}</button>
            ) : (
              <span className="duel-pillar" title="Cosmic Pillar">{pillarInner}</span>
            )}
            <span className="duel-ess" title="Essence">✦ {pl.essence}/{ESSENCE_CAP}</span>
            <span className="duel-counts">deck {pl.deck.length} · hand {pl.hand.length} · discard {pl.discard.length}</span>
          </span>
        </header>
        <div className="duel-field" role="group" aria-label={`Player ${pi + 1} field`}>
          {pl.field.map((d, i) => {
            const interactive = isActive || (pending && pi === defender);
            if (d) {
              const data = duelCard(d.entityId);
              if (!data) return <div key={i} className="duel-slot empty" />;
              const hit = !isActive && isTargetDeity(d.uid);
              return (
                <div key={i} className="duel-slot">
                  <DuelCard
                    data={data}
                    deity={d}
                    selected={sel?.kind === 'field' && sel.uid === d.uid}
                    hit={hit}
                    sick={d.sick}
                    attacked={d.attacked}
                    disabled={!interactive}
                    onClick={() => {
                      if (isActive) { setSel((s) => (s?.kind === 'field' && s.uid === d.uid ? null : { kind: 'field', uid: d.uid })); return; }
                      if (pending && pi === defender) onFoeDeity(d.uid);
                    }}
                  />
                </div>
              );
            }
            // empty slot: only the active player can fill it, and only with a selected hand card
            const canSummonHere = isActive && mainPhase && !!selCard && legalSlots.includes(i);
            return (
              <div key={i} className={`duel-slot empty${canSummonHere ? ' can-summon' : ''}`}>
                <button
                  type="button"
                  className="duel-slot-btn"
                  disabled={!canSummonHere}
                  onClick={() => { if (selCard && canSummonHere) act({ type: 'summon', player: active, uid: selCard.uid, slot: i }); }}
                  aria-label={canSummonHere ? `Summon ${selData?.name} into slot ${i + 1}` : `Empty field slot ${i + 1}`}
                >
                  <span aria-hidden="true">{canSummonHere ? '＋' : '·'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const phase = game.over ? 'Over' : !me.drawn ? 'Draw' : !me.channeled ? 'Channel' : 'Main';

  return (
    <div className="duel">
      <div className="duel-bar">
        <div className="duel-bar-info mono">
          <span>Turn {game.turn}</span>
          <span className="duel-phase">P{active + 1} · {phase}</span>
          <span className="faint">seed {game.seed}</span>
        </div>
        <div className="duel-bar-actions">
          <button type="button" className="chip-btn" onClick={() => setGame((g) => (g ? undo(g) : g))} disabled={!game.log.length}>Undo ↩</button>
          <button type="button" className="chip-btn" onClick={() => setCurtain(true)}>Hide hands</button>
          <button type="button" className="chip-btn" onClick={() => { setGame(null); setSel(null); setPending(null); }}>New duel</button>
        </div>
      </div>

      <div className="duel-steps" aria-label="Turn structure">
        {['Draw', 'Channel', 'Main', 'Upkeep'].map((s) => (
          <span key={s} className={`duel-step${phase === s ? ' on' : ''}`}>{s}</span>
        ))}
      </div>

      {renderHalf(1)}
      {renderHalf(0)}

      {/* active player's hand + controls */}
      <div className="duel-hand-wrap">
        <div className="duel-hand-head">
          <span className="eyebrow">P{active + 1} · {CULTURE_NAMES[me.culture]} hand</span>
          {lowHand && <span className="faint small">over {HAND_LIMIT} — discard at upkeep</span>}
        </div>
        <div className="duel-hand" role="list" aria-label="Your hand">
          {me.hand.map((c) => {
            const data = duelCard(c.entityId);
            if (!data) return null;
            const affordable = me.essence >= summonCost(me.culture, data);
            return (
              <div key={c.uid} role="listitem" className="duel-hand-item">
                <DuelCard
                  data={data}
                  selected={sel?.kind === 'hand' && sel.uid === c.uid}
                  disabled={!mainPhase || !affordable}
                  onClick={() => setSel((s) => (s?.kind === 'hand' && s.uid === c.uid ? null : { kind: 'hand', uid: c.uid }))}
                />
              </div>
            );
          })}
          {!me.hand.length && <span className="faint small">no cards in hand</span>}
        </div>

        {/* selected-deity action bar */}
        {selDeity && (
          <div className="duel-actions" role="region" aria-label="Selected deity actions">
            <span className="mono small">{selDeity.name}</span>
            {attachable.length > 0 && (
              <span className="duel-action-group">
                {attachable.map((r) => (
                  <button key={r.slug} type="button" className="chip-btn"
                    disabled={me.essence < relicCost(me.culture)}
                    onClick={() => act({ type: 'attach', player: active, uid: selDeity.uid, relic: r.slug })}>
                    Attach {r.name} ({relicCost(me.culture)}✦)
                  </button>
                ))}
              </span>
            )}
            {selDeity.sick && <span className="faint small">summoning sickness — cannot strike this turn</span>}
            {selDeity.attacked && <span className="faint small">already struck this turn</span>}
            {canStrike && <span className="faint small">tap an enemy deity or the enemy Pillar</span>}
          </div>
        )}

        <div className="duel-controls">
          <button type="button" className="btn" disabled={me.drawn || game.over} onClick={() => act({ type: 'draw', player: active })}>Draw 1</button>
          <button type="button" className="btn" disabled={me.channeled || game.over} onClick={() => act({ type: 'channel', player: active })}>Channel +2✦</button>
          <button type="button" className="btn" disabled={game.over || !!pending} onClick={doEndTurn}>End turn →</button>
          {warn && <span className="duel-warn small">{warn}</span>}
        </div>
      </div>

      {/* log */}
      <div className="duel-log" aria-label="Action log" aria-live="polite">
        <span className="eyebrow">Log</span>
        <ol className="duel-log-list mono">
          {game.log.slice(-12).reverse().map((a, i) => (
            <li key={game.log.length - i}>{fmt(game, a)}</li>
          ))}
          {!game.log.length && <li className="faint">The pillars stand. Begin the duel.</li>}
        </ol>
      </div>

      {game.over && (
        <div className="duel-over" role="alertdialog" aria-label="Duel over">
          <p className="duel-over-title">P{(game.winner ?? 0) + 1} topples the Cosmic Pillar</p>
          <p className="muted small">Pillar shattered on turn {game.turn}.</p>
          <div className="duel-over-actions">
            <button type="button" className="btn" onClick={() => { setGame(null); setSel(null); setPending(null); }}>New duel</button>
            <Link href="/how-to-play" className="btn">Rules</Link>
          </div>
        </div>
      )}

      {pending && !game.over && (
        <div className="duel-pending" role="region" aria-label="Defender chooses an interceptor">
          <span className="mono small">P{defender + 1}: tap one of your deities to block {nameOf(pending.attackerUid)}, or</span>
          <button type="button" className="btn" onClick={() => act({ type: 'strike', player: active, attackerUid: pending.attackerUid, targetKind: 'pillar', interceptUid: null })}>
            Let the Pillar take it
          </button>
        </div>
      )}

      {curtain && !game.over && !pending && (
        <button type="button" className="duel-curtain" onClick={() => setCurtain(false)}>
          <span className="duel-curtain-eye" aria-hidden="true">◉</span>
          <span className="duel-curtain-title">Hands hidden</span>
          <span className="duel-curtain-sub">Pass the device — tap to reveal P{active + 1}&apos;s turn</span>
        </button>
      )}
    </div>
  );
}
