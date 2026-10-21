'use client';
// /play — 2–4 player hot-seat duel (PHASE 6). A thin React shell over the pure
// engine in app/lib/pantheon.ts: all rules live there, this file only renders
// state and dispatches actions. The card pool arrives at RUNTIME from
// /duel-deck.json (see the addendum) and is installed into pantheon-data.
//
// SSR/hydration-safe: no Date.now / Math.random during render (the random seed
// is chosen in an effect). All duel state is in memory; nothing is persisted.
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DuelCard } from './DuelCard';
import { setDuelDeck, duelCard, duelRelicsForEntity } from '../../lib/pantheon-data';
import type { DuelDeckPayload } from '../../lib/pantheon-data';
import {
  createGame, reduce, undo, channelGainFor, pillarHpForCount,
  DECK_SIZE, ESSENCE_CAP, HAND_LIMIT, summonCost, relicCost,
} from '../../lib/pantheon';
import type { Action, CardInstance, GameState, PlayerCount, PlayerId } from '../../lib/pantheon';
import { CULTURE_NAMES, CULTURE_ACCENTS } from '../../lib/types';

const CULTURES = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'] as const;
const COUNTS: PlayerCount[] = [2, 3, 4];

type Pending = { attackerUid: number; targetPlayer: PlayerId } | null;
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

/** Non-active seats' hands stay hidden: press-and-hold (or Space/Enter) to peek. */
function HandPeek({ seat, cards }: { seat: number; cards: CardInstance[] }) {
  const [peek, setPeek] = useState(false);
  return (
    <div className="duel-peek">
      <button
        type="button"
        className="chip-btn"
        onPointerDown={() => setPeek(true)}
        onPointerUp={() => setPeek(false)}
        onPointerLeave={() => setPeek(false)}
        onBlur={() => setPeek(false)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setPeek(true); }}
        onKeyUp={() => setPeek(false)}
        aria-label={`Hold to reveal Seat ${seat}'s hand (${cards.length} card${cards.length === 1 ? '' : 's'})`}
      >
        {peek ? 'peeking…' : `Hold to reveal hand (${cards.length})`}
      </button>
      {peek && (
        <div className="duel-peek-hand">
          {cards.length
            ? cards.map((c) => {
                const data = duelCard(c.entityId);
                return data ? <div key={c.uid} className="duel-hand-item"><DuelCard data={data} disabled /></div> : null;
              })
            : <span className="faint small">no cards in hand</span>}
        </div>
      )}
    </div>
  );
}

export function DuelClient() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [cultures, setCultures] = useState<string[]>(['greek', 'norse', 'slavic', 'mesopotamian']);
  const [seedText, setSeedText] = useState('');
  const [game, setGame] = useState<GameState | null>(null);
  const [sel, setSel] = useState<Sel>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [curtain, setCurtain] = useState(false);
  const [note, setNote] = useState('');

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

  // Seed + optional share params (?seed=&players=&cultures=), read once.
  useEffect(() => {
    let seed = '';
    try {
      const q = new URLSearchParams(window.location.search);
      seed = q.get('seed') || '';
      const pc = Number.parseInt(q.get('players') || '', 10);
      if (pc === 2 || pc === 3 || pc === 4) setPlayerCount(pc);
      const cs = (q.get('cultures') || '').split(',').filter((c) => (CULTURES as readonly string[]).includes(c));
      if (cs.length) setCultures((prev) => { const next = prev.slice(); cs.slice(0, 4).forEach((c, i) => { next[i] = c; }); return next; });
    } catch { /* ignore malformed URLs */ }
    setSeedText((s) => seed || s || String(Math.floor(Math.random() * 1000000000)));
  }, []);

  const setCultureAt = (i: number, c: string) =>
    setCultures((prev) => { const next = prev.slice(); next[i] = c; return next; });

  const start = useCallback(() => {
    const seed = (Number.parseInt(seedText, 10) || 1) >>> 0;
    setGame(createGame({ seed, players: playerCount, deckCultures: cultures.slice(0, playerCount) }));
    setSel(null); setPending(null); setCurtain(false); setNote('');
  }, [seedText, playerCount, cultures]);

  const share = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('seed', seedText);
    url.searchParams.set('players', String(playerCount));
    url.searchParams.set('cultures', cultures.slice(0, playerCount).join(','));
    const text = url.toString();
    navigator.clipboard?.writeText(text).then(
      () => setNote('Share link copied — same seed, same seats.'),
      () => setNote(text),
    );
  }, [seedText, playerCount, cultures]);

  const act = useCallback((a: Action) => {
    setGame((g) => (g ? reduce(g, a) : g));
    setSel(null); setPending(null); setNote('');
  }, []);

  const doEndTurn = useCallback(() => {
    setGame((g) => (g && !g.over ? reduce(g, { type: 'endTurn', player: g.active }) : g));
    setSel(null); setPending(null); setNote(''); setCurtain(true);
  }, []);

  // uid -> owning entity id, across every zone (dead uids live in the discard).
  const uidMap = useMemo(() => {
    const m = new Map<number, { entityId: string; owner: PlayerId }>();
    if (!game) return m;
    game.players.forEach((pl, pi) => {
      for (const z of [pl.hand, pl.deck, pl.discard]) for (const c of z) m.set(c.uid, { entityId: c.entityId, owner: pi });
      for (const d of pl.field) if (d) m.set(d.uid, { entityId: d.entityId, owner: pi });
    });
    return m;
  }, [game]);

  const nameOf = useCallback((uid: number) => {
    const e = uidMap.get(uid);
    return e ? (duelCard(e.entityId)?.name || e.entityId) : `#${uid}`;
  }, [uidMap]);

  // Replay the log purely (no side effects) so the log can show eliminations at
  // the exact action that caused them. Cheap: one linear pass, never persisted.
  const elimAt = useMemo(() => {
    const out = new Map<number, number[]>();
    if (!game) return out;
    let s: GameState = createGame({ seed: game.seed, players: game.players.length as PlayerCount, deckCultures: game.players.map((p) => p.culture) });
    let prev = s.players.map((p) => p.pillar);
    game.log.forEach((a, i) => {
      s = reduce(s, a);
      const now = s.players.map((p) => p.pillar);
      const deadNow = now.map((v, idx) => (v <= 0 && prev[idx] > 0 ? idx : -1)).filter((x) => x >= 0);
      if (deadNow.length) out.set(i, deadNow);
      prev = now;
    });
    return out;
  }, [game]);

  const fmt = useCallback((a: Action): string => {
    const S = (id: PlayerId) => `Seat ${id + 1}`;
    switch (a.type) {
      case 'draw': return `${S(a.player)} draws a card`;
      case 'channel': return `${S(a.player)} channels essence`;
      case 'summon': return `${S(a.player)} summons ${nameOf(a.uid)}`;
      case 'attach': return `${S(a.player)} attaches ${a.relic} to ${nameOf(a.uid)}`;
      case 'strike': {
        // 2P logs omit targetPlayer; the target is then the other seat.
        const target = a.targetPlayer ?? (a.player === 0 ? 1 : 0);
        if (a.targetKind === 'deity') return `${S(a.player)}'s ${nameOf(a.attackerUid)} strikes ${S(target)}'s ${nameOf(a.targetUid!)}`;
        return a.interceptUid != null
          ? `${S(a.player)}'s ${nameOf(a.attackerUid)} strikes ${S(target)}'s Pillar (blocked by ${nameOf(a.interceptUid)})`
          : `${S(a.player)}'s ${nameOf(a.attackerUid)} strikes ${S(target)}'s Pillar`;
      }
      case 'endTurn': return `— ${S(a.player)} ends the turn —`;
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
        <div className="duel-count">
          <span className="eyebrow">Players (free-for-all)</span>
          <div className="duel-chips" role="radiogroup" aria-label="Number of players">
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={playerCount === n}
                className={`chip-btn${playerCount === n ? ' active' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n} players
              </button>
            ))}
          </div>
        </div>
        <div className="duel-setup-grid">
          {Array.from({ length: playerCount }, (_, i) => (
            <PantheonPicker
              key={i}
              who={`Seat ${i + 1} — choose a pantheon`}
              value={cultures[i]}
              onChange={(c) => setCultureAt(i, c)}
            />
          ))}
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
          <button type="button" className="chip-btn" onClick={share}>Copy share link</button>
          <span className="faint small">Same seed, seats and pantheons → same game. Each seat draws a {DECK_SIZE}-card deck.</span>
        </div>
        {note && <p className="small mono duel-note" aria-live="polite">{note}</p>}
        <div className="duel-setup-actions">
          <button type="button" className="btn btn-primary" onClick={start}>Begin duel ⚔</button>
          <Link href="/how-to-play" className="btn btn-secondary">Read the rules</Link>
        </div>
      </div>
    );
  }

  // ---- duel ----
  const active = game.active;
  const me = game.players[active];
  const maxPillar = pillarHpForCount(game.players.length);
  const mainPhase = me.drawn && me.channeled && !pending;

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

  const onEnemyDeity = (seat: PlayerId, uid: number) => {
    if (pending) { act({ type: 'strike', player: active, attackerUid: pending.attackerUid, targetKind: 'pillar', targetPlayer: pending.targetPlayer, interceptUid: uid }); return; }
    if (canStrike && sel) act({ type: 'strike', player: active, attackerUid: sel.uid, targetKind: 'deity', targetPlayer: seat, targetUid: uid });
  };
  const onEnemyPillar = (seat: PlayerId) => {
    if (pending) { act({ type: 'strike', player: active, attackerUid: pending.attackerUid, targetKind: 'pillar', targetPlayer: pending.targetPlayer, interceptUid: null }); return; }
    if (canStrike && sel) { setPending({ attackerUid: sel.uid, targetPlayer: seat }); setSel(null); }
  };

  const lowHand = me.hand.length > HAND_LIMIT;
  const gain = channelGainFor(game.players.length, me.culture, me.turnsTaken);

  const renderSeat = (pi: PlayerId) => {
    const pl = game.players[pi];
    const isActive = pi === active;
    const dead = pl.pillar <= 0;
    const canHitPillar = !isActive && !dead && canStrike;
    const isPendingTarget = !!pending && pi === pending.targetPlayer;
    const pillarInner = (
      <>
        <span className="duel-pillar-bar" style={{ width: `${Math.max(0, pl.pillar / maxPillar) * 100}%` }} />
        <span className="duel-pillar-num">{pl.pillar}</span>
      </>
    );
    const seatLabel = `Seat ${pi + 1} (${CULTURE_NAMES[pl.culture]})`;
    return (
      <section key={pi} className={`duel-half${isActive ? ' is-active' : ' is-dim'}${dead ? ' is-dead' : ''}`} aria-label={seatLabel}>
        <header className="duel-half-head">
          <span className="duel-who mono">S{pi + 1}{isActive ? ' ▸' : ''}</span>
          <span className="duel-culture" style={{ color: CULTURE_ACCENTS[pl.culture] }}>{CULTURE_NAMES[pl.culture]}</span>
          {dead && <span className="duel-elim mono">eliminated</span>}
          <span className="duel-res mono">
            {isActive ? (
              <span className="duel-pillar" title="Your Cosmic Pillar">{pillarInner}</span>
            ) : (
              <button
                type="button"
                className={`duel-pillar duel-pillar-btn${canHitPillar ? ' is-target' : ''}`}
                onClick={() => onEnemyPillar(pi)}
                disabled={!canHitPillar && !isPendingTarget}
                title={canHitPillar || isPendingTarget ? `Attack Seat ${pi + 1} pillar` : 'Cosmic Pillar'}
                aria-label={`Attack Seat ${pi + 1} pillar`}
              >{pillarInner}</button>
            )}
            <span className="duel-ess" title="Essence">✦ {pl.essence}/{ESSENCE_CAP}</span>
            <span className="duel-counts">deck {pl.deck.length} · hand {pl.hand.length} · discard {pl.discard.length}</span>
          </span>
        </header>
        <div className="duel-field" role="group" aria-label={`Seat ${pi + 1} field`}>
          {pl.field.map((d, i) => {
            if (d) {
              const data = duelCard(d.entityId);
              if (!data) return <div key={i} className="duel-slot empty" />;
              const hit = (!isActive && canStrike) || isPendingTarget;
              return (
                <div key={i} className="duel-slot">
                  <DuelCard
                    data={data}
                    deity={d}
                    selected={isActive && sel?.kind === 'field' && sel.uid === d.uid}
                    hit={hit}
                    sick={d.sick}
                    attacked={d.attacked}
                    disabled={!isActive && !isPendingTarget && !canStrike}
                    label={!isActive ? (isPendingTarget ? `Block with ${d.name}` : `Attack ${d.name}`) : undefined}
                    onClick={() => {
                      if (isActive) { setSel((s) => (s?.kind === 'field' && s.uid === d.uid ? null : { kind: 'field', uid: d.uid })); return; }
                      if (isPendingTarget || canStrike) onEnemyDeity(pi, d.uid);
                    }}
                  />
                </div>
              );
            }
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
        {!isActive && <HandPeek seat={pi + 1} cards={pl.hand} />}
      </section>
    );
  };

  const seatOrder: PlayerId[] = [
    ...game.players.map((_, i) => i).filter((i) => i !== active),
    active,
  ];

  const phase = game.over ? 'Over' : !me.drawn ? 'Draw' : !me.channeled ? 'Channel' : 'Main';

  return (
    <div className="duel">
      <div className="duel-turn-banner" role="status" aria-live="polite">
        <span className="duel-turn-big">Seat {active + 1}&apos;s turn</span>
        <span className="muted small">{CULTURE_NAMES[me.culture]} · turn {game.turn} of the round · pass the device</span>
      </div>

      <div className="duel-bar">
        <div className="duel-bar-info mono">
          <span>Turn {game.turn}</span>
          <span className="duel-phase">S{active + 1} · {phase}</span>
          <span className="faint">seed {game.seed} · {game.players.length}P</span>
        </div>
        <div className="duel-bar-actions">
          <button type="button" className="chip-btn" onClick={() => setGame((g) => (g ? undo(g) : g))} disabled={!game.log.length}>Undo ↩</button>
          <button type="button" className="chip-btn" onClick={share}>Copy share link</button>
          <button type="button" className="chip-btn" onClick={() => setCurtain(true)}>Hide hands</button>
          <button type="button" className="chip-btn" onClick={() => { setGame(null); setSel(null); setPending(null); setNote(''); }}>New duel</button>
        </div>
      </div>

      <div className="duel-steps" aria-label="Turn structure">
        {['Draw', 'Channel', 'Main', 'Upkeep'].map((s) => (
          <span key={s} className={`duel-step${phase === s ? ' on' : ''}`}>{s}</span>
        ))}
      </div>

      {seatOrder.map(renderSeat)}

      {/* active seat's hand + controls */}
      <div className="duel-hand-wrap">
        <div className="duel-hand-head">
          <span className="eyebrow">Seat {active + 1} · {CULTURE_NAMES[me.culture]} hand</span>
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
            {canStrike && <span className="faint small">tap any enemy deity, or an enemy Pillar, to attack</span>}
          </div>
        )}

        <div className="duel-controls">
          <button type="button" className="btn btn-secondary" disabled={me.drawn || game.over} onClick={() => act({ type: 'draw', player: active })}>Draw 1</button>
          <button type="button" className="btn btn-secondary" disabled={me.channeled || game.over} onClick={() => act({ type: 'channel', player: active })}>Channel +{gain}✦</button>
          <button type="button" className="btn btn-primary" disabled={game.over || !!pending} onClick={doEndTurn}>End turn →</button>
          {note && <span className="duel-note small mono" aria-live="polite">{note}</span>}
        </div>
      </div>

      {/* log */}
      <div className="duel-log" aria-label="Action log" aria-live="polite">
        <span className="eyebrow">Log · seat names</span>
        <ol className="duel-log-list mono">
          {game.log.map((a, i) => ({ a, i })).slice(-12).reverse().map(({ a, i }) => (
            <Fragment key={i}>
              <li>{fmt(a)}</li>
              {elimAt.get(i)?.map((seat) => (
                <li key={`elim-${seat}`} className="duel-log-elim">Seat {seat + 1} eliminated — pillar shattered</li>
              ))}
            </Fragment>
          ))}
          {!game.log.length && <li className="faint">The pillars stand. Begin the duel.</li>}
        </ol>
      </div>

      {game.over && (
        <div className="duel-over" role="alertdialog" aria-label="Duel over">
          <p className="duel-over-title">Seat {(game.winner ?? 0) + 1} stands alone</p>
          <p className="muted small">
            {game.players.length > 2 ? 'Last pillar standing' : 'The opposing Cosmic Pillar shattered'} on turn {game.turn}.
          </p>
          <div className="duel-over-actions">
            <button type="button" className="btn btn-primary" onClick={() => { setGame(null); setSel(null); setPending(null); }}>New duel</button>
            <Link href="/how-to-play" className="btn btn-secondary">Rules</Link>
          </div>
        </div>
      )}

      {pending && !game.over && (
        <div className="duel-pending" role="region" aria-label={`Seat ${pending.targetPlayer + 1} chooses an interceptor`}>
          <span className="mono small">Seat {pending.targetPlayer + 1}: tap one of your deities to block {nameOf(pending.attackerUid)}, or</span>
          <button type="button" className="btn btn-primary" onClick={() => act({ type: 'strike', player: active, attackerUid: pending.attackerUid, targetKind: 'pillar', targetPlayer: pending.targetPlayer, interceptUid: null })}>
            Let the Pillar take it
          </button>
        </div>
      )}

      {curtain && !game.over && !pending && (
        <button type="button" className="duel-curtain" onClick={() => setCurtain(false)}>
          <span className="duel-curtain-eye" aria-hidden="true">◉</span>
          <span className="duel-curtain-title">Hands hidden</span>
          <span className="duel-curtain-sub">Pass the device — tap to reveal Seat {active + 1}&apos;s turn</span>
        </button>
      )}
    </div>
  );
}
