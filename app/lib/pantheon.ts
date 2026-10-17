// THE DIVINE ATLAS — "Pantheon" duel engine (PHASE5).
//
// A PURE, framework-free rules engine for the 2-player hot-seat duel. It is the
// single source of truth shared by the /play UI and scripts/enginetest.ts:
//
//   • no React, no DOM, no Date.now, no Math.random
//   • no module-level mutable state — every value lives INSIDE GameState
//     (including the seeded PRNG cursor and the uid counter)
//   • cards are read ONLY through app/lib/pantheon-data.ts (the fs-free store)
//
// Undo is "replay the action log minus the last action" from the same seed, so
// state is always exactly reproducible. Given the same seed, cultures and action
// sequence, two runs produce byte-identical state.
import type { CardElement } from './card';
import { duelAllCards, duelCard, duelRelicsForEntity } from './pantheon-data';
import type { DuelCardData } from './pantheon-data';

// ---------------------------------------------------------------------------
// DESIGN CONSTANTS — every number here is ours, not mythology's. The /how-to-play
// page prints this table under "design choice, not mythology".
// ---------------------------------------------------------------------------
export const DECK_SIZE = 24;        // lowered from the concept doc's 30: Slavic ships only 13 cards, so the max legal deck is 13×2 = 26
export const STARTING_HAND = 5;
export const HAND_LIMIT = 7;        // excess discarded at upkeep (from the newest end)
export const STARTING_ESSENCE = 2;
export const CHANNEL_GAIN = 2;      // per turn
export const ESSENCE_CAP = 12;
export const PILLAR_HP = 20;
export const FIELD_SLOTS = 3;
export const ELEMENT_ADVANTAGE = 2; // +PWR when the attacker's element beats the defender's
export const RELIC_COST = 1;        // essence to attach
export const RELIC_PWR = 1;         // relic blessing
export const RELIC_GRD = 1;
export const MAX_MYTHIC_COPIES = 1; // deck-building legality
export const MAX_RARE_COPIES = 2;
export const MAX_ATTACKS_PER_DEITY = 1;

export type PlayerId = 0 | 1;

export interface CardInstance { uid: number; entityId: string }

export interface FieldDeity {
  uid: number;
  entityId: string;
  name: string;
  element: CardElement;
  power: number;
  guard: number;
  damage: number;
  sick: boolean;       // summoning sickness: cannot strike the turn it arrives
  attacked: boolean;   // one strike per turn
  relicSlug: string | null;
  relicName: string | null;
}

export interface PlayerState {
  culture: string;
  hand: CardInstance[];
  deck: CardInstance[];       // index 0 is the top (draw from the front)
  discard: CardInstance[];
  field: (FieldDeity | null)[];
  essence: number;
  pillar: number;
  relicsUsed: string[];       // relic slugs already attached by this player
  drawn: boolean;             // this turn's Draw step done
  channeled: boolean;         // this turn's Channel step done
  turnsTaken: number;         // 1 on the player's first turn
}

export type Action =
  | { type: 'draw'; player: PlayerId }
  | { type: 'channel'; player: PlayerId }
  | { type: 'summon'; player: PlayerId; uid: number; slot: number }
  | { type: 'attach'; player: PlayerId; uid: number; relic: string }
  | { type: 'strike'; player: PlayerId; attackerUid: number; targetKind: 'deity' | 'pillar'; targetUid?: number; interceptUid?: number | null }
  | { type: 'endTurn'; player: PlayerId };

export interface GameState {
  seed: number;
  rngState: number;
  active: PlayerId;
  turn: number;
  players: [PlayerState, PlayerState];
  log: Action[];
  over: boolean;
  winner: PlayerId | null;
  nextUid: number;
}

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32 step) — the same generator family as card.ts,
// but with its cursor stored in GameState so the engine stays pure.
// ---------------------------------------------------------------------------
function nextRng(state: number): { value: number; state: number } {
  let a = state | 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: a };
}

function shuffle<T>(input: T[], rngState: number): { arr: T[]; rngState: number } {
  const a = input.slice();
  let s = rngState;
  for (let i = a.length - 1; i > 0; i--) {
    const r = nextRng(s);
    s = r.state;
    const j = Math.floor(r.value * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return { arr: a, rngState: s };
}

// ---------------------------------------------------------------------------
// Deck building + legality
// ---------------------------------------------------------------------------
export function buildDeck(culture: string): DuelCardData[] {
  const pool = duelAllCards()
    .filter((c) => c.culture === culture)
    .sort((a, b) => (a.set_code < b.set_code ? -1 : a.set_code > b.set_code ? 1 : 0));
  const out: DuelCardData[] = [];
  for (const c of pool) {
    const cap = c.rarity === 'mythic' ? MAX_MYTHIC_COPIES : MAX_RARE_COPIES;
    for (let i = 0; i < cap && out.length < DECK_SIZE; i++) out.push(c);
    if (out.length >= DECK_SIZE) break;
  }
  return out;
}

export function deckIsLegal(cards: DuelCardData[], culture: string): { ok: boolean; reason?: string } {
  if (cards.length !== DECK_SIZE) return { ok: false, reason: `deck has ${cards.length} cards, need ${DECK_SIZE}` };
  const counts = new Map<string, number>();
  for (const c of cards) {
    if (c.culture !== culture) return { ok: false, reason: `cross-pantheon card ${c.id}` };
    counts.set(c.id, (counts.get(c.id) || 0) + 1);
  }
  for (const [id, n] of counts) {
    const c = cards.find((x) => x.id === id)!;
    if (c.rarity === 'mythic' && n > MAX_MYTHIC_COPIES) return { ok: false, reason: `too many Mythic copies of ${id}` };
    if (c.rarity === 'rare' && n > MAX_RARE_COPIES) return { ok: false, reason: `too many Rare copies of ${id}` };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Element wheel + pantheon synergies (deterministic, data-derived)
// ---------------------------------------------------------------------------
const ADVANTAGE: Partial<Record<CardElement, CardElement>> = {
  fire: 'earth', earth: 'water', water: 'fire', storm: 'life', mind: 'war',
};
export const NEUTRAL_ELEMENTS: CardElement[] = ['light', 'death', 'sky', 'void'];
export const ELEMENT_ADVANTAGE_PAIRS: [CardElement, CardElement][] = (Object.keys(ADVANTAGE) as CardElement[])
  .map((a) => [a, ADVANTAGE[a] as CardElement]);

/** Does element `a` beat element `b`? (+ELEMENT_ADVANTAGE PWR in combat.) */
export function elementBeats(a: CardElement, b: CardElement): boolean {
  return ADVANTAGE[a] === b;
}

const NORSE_TERMS = ['war', 'battle', 'death', 'dead', 'slain', 'underworld'];
const JAPANESE_TERMS = ['sky', 'sun', 'light', 'heaven', 'celestial', 'dawn'];
const SLAVIC_TERMS = ['fertility', 'earth', 'nature', 'harvest', 'spring', 'growth', 'agriculture'];

function hasTerm(domains: string[], terms: string[]): boolean {
  const hay = (domains || []).join(' ').toLowerCase();
  return terms.some((t) => hay.includes(t));
}

export const PANTHEON_SYNERGY: Record<string, { name: string; text: string; rationale: string }> = {
  greek: {
    name: 'First Thunder',
    text: 'On your first Channel, gain +1 essence.',
    rationale: 'The Olympian order is founded by Zeus (element Sky, domains sky/thunder/kingship): a first-move advantage.',
  },
  norse: {
    name: 'Einherjar Vigil',
    text: 'Your deities whose domains include war or death get +1 GRD.',
    rationale: 'Odin and Tyr carry war; Odin and Hel carry death — the slain are the host.',
  },
  japanese: {
    name: 'Radiance of Heaven',
    text: 'Your deities whose domains include sky, sun, light or heaven get +1 PWR.',
    rationale: 'Amaterasu (domain sun) and Amenominakanushi (high heaven) are the shining line.',
  },
  egyptian: {
    name: 'Offering to the Gods',
    text: 'Attaching a relic costs 1 less essence (minimum 0).',
    rationale: 'Temple economy: offerings (artifacts) are the currency of the Egyptian cult.',
  },
  slavic: {
    name: 'Damp Mother Earth',
    text: 'Your deities whose domains include fertility, earth, nature or spring get +1 GRD.',
    rationale: 'Mokosh (fertility/earth) and Lada/Jarilo (spring/fertility) are the land\u2019s guardians.',
  },
  mesopotamian: {
    name: 'Primordial Tide',
    text: 'Your primordial (Mythic) deities cost 1 less essence to summon (minimum 1).',
    rationale: 'Apsu, Tiamat and Ki are the elder powers the younger gods must bargain with.',
  },
};

export function summonCost(culture: string, card: DuelCardData): number {
  let cost = card.stats.essence;
  if (culture === 'mesopotamian' && card.classification === 'primordial') cost = Math.max(1, cost - 1);
  return cost;
}
export function relicCost(culture: string): number {
  return culture === 'egyptian' ? 0 : RELIC_COST;
}
function channelGain(culture: string, turnsTaken: number): number {
  return CHANNEL_GAIN + (culture === 'greek' && turnsTaken === 1 ? 1 : 0);
}
function summonStats(culture: string, card: DuelCardData): { power: number; guard: number } {
  let power = card.stats.power;
  let guard = card.stats.guard;
  if (culture === 'norse' && hasTerm(card.domains, NORSE_TERMS)) guard += 1;
  if (culture === 'slavic' && hasTerm(card.domains, SLAVIC_TERMS)) guard += 1;
  if (culture === 'japanese' && hasTerm(card.domains, JAPANESE_TERMS)) power += 1;
  return { power, guard };
}

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------
const OTHER: [PlayerId, PlayerId] = [1, 0];
function other(p: PlayerId): PlayerId { return OTHER[p]; }

function drawCards(p: PlayerState, n: number, rngState: number): { player: PlayerState; rngState: number } {
  const next: PlayerState = { ...p, hand: p.hand.slice(), deck: p.deck.slice(), discard: p.discard.slice() };
  let rng = rngState;
  for (let i = 0; i < n; i++) {
    if (next.deck.length === 0) {
      if (next.discard.length === 0) break; // nothing left anywhere: draw nothing
      const sh = shuffle(next.discard, rng);
      next.deck = sh.arr;
      rng = sh.rngState;
      next.discard = [];
    }
    next.hand.push(next.deck[0]);
    next.deck = next.deck.slice(1);
  }
  return { player: next, rngState: rng };
}

function readyField(field: (FieldDeity | null)[]): (FieldDeity | null)[] {
  return field.map((d) => (d ? { ...d, sick: false, attacked: false } : null));
}

function findDeity(players: [PlayerState, PlayerState], uid: number): { player: PlayerId; index: number; deity: FieldDeity } | null {
  for (let pi = 0 as PlayerId; pi <= 1; pi = (pi + 1) as PlayerId) {
    const field = players[pi].field;
    for (let i = 0; i < field.length; i++) {
      const d = field[i];
      if (d && d.uid === uid) return { player: pi, index: i, deity: d };
    }
  }
  return null;
}

function findHandCard(p: PlayerState, uid: number): CardInstance | undefined {
  return p.hand.find((c) => c.uid === uid);
}

// ---------------------------------------------------------------------------
// Setup / replay
// ---------------------------------------------------------------------------
export function newGame(seed: number, culture0: string, culture1: string): GameState {
  let rngState = seed >>> 0;
  let nextUid = 1;

  const makePlayer = (culture: string): PlayerState => {
    const data = buildDeck(culture);
    const sh = shuffle(data, rngState);
    rngState = sh.rngState;
    const deck: CardInstance[] = sh.arr.map((c) => ({ uid: nextUid++, entityId: c.id }));
    const base: PlayerState = {
      culture, hand: [], deck, discard: [],
      field: Array.from({ length: FIELD_SLOTS }, () => null),
      essence: STARTING_ESSENCE, pillar: PILLAR_HP, relicsUsed: [],
      drawn: false, channeled: false, turnsTaken: 0,
    };
    const dr = drawCards(base, STARTING_HAND, rngState);
    rngState = dr.rngState;
    return dr.player;
  };

  const p0 = makePlayer(culture0);
  const p1 = makePlayer(culture1);
  // Player 0 begins turn 1.
  p0.turnsTaken = 1;

  return {
    seed: seed >>> 0, rngState, active: 0, turn: 1,
    players: [p0, p1], log: [], over: false, winner: null, nextUid,
  };
}

export function replay(seed: number, cultures: [string, string], actions: Action[]): GameState {
  let s = newGame(seed, cultures[0], cultures[1]);
  for (const a of actions) s = reduce(s, a);
  return s;
}

/** Undo = replay the action log minus its last entry (identical to the prior state). */
export function undo(state: GameState): GameState {
  if (state.log.length === 0) return state;
  const cultures: [string, string] = [state.players[0].culture, state.players[1].culture];
  return replay(state.seed, cultures, state.log.slice(0, -1));
}

// ---------------------------------------------------------------------------
// Validation — returns an error string when illegal, null when legal.
// ---------------------------------------------------------------------------
export function validate(state: GameState, action: Action): string | null {
  if (state.over) return 'the duel is over';
  if (action.player !== state.active) return 'not the active player';
  const active = state.players[state.active];
  const p = state.players[action.player];

  switch (action.type) {
    case 'draw':
      return active.drawn ? 'already drawn this turn' : null;
    case 'channel':
      return active.channeled ? 'already channeled this turn' : null;
    case 'endTurn':
      return null;
    case 'summon': {
      if (!active.drawn || !active.channeled) return 'draw and channel before acting';
      const card = findHandCard(p, action.uid);
      if (!card) return 'card is not in hand';
      if (action.slot < 0 || action.slot >= FIELD_SLOTS) return 'invalid slot';
      if (p.field[action.slot]) return 'slot is occupied';
      const data = duelCard(card.entityId);
      if (!data) return 'unknown card';
      if (p.essence < summonCost(p.culture, data)) return 'not enough essence';
      return null;
    }
    case 'attach': {
      if (!active.drawn || !active.channeled) return 'draw and channel before acting';
      const target = p.field.find((d) => d && d.uid === action.uid);
      if (!target) return 'no such deity on your field';
      if (target.relicSlug) return 'deity already carries a relic';
      const available = duelRelicsForEntity(target.entityId);
      if (!available.some((r) => r.slug === action.relic)) return 'relic does not belong to this deity';
      if (p.relicsUsed.includes(action.relic)) return 'relic already used';
      if (p.essence < relicCost(p.culture)) return 'not enough essence';
      return null;
    }
    case 'strike': {
      if (!active.drawn || !active.channeled) return 'draw and channel before acting';
      const attacker = p.field.find((d) => d && d.uid === action.attackerUid);
      if (!attacker) return 'no such attacker';
      if (attacker.sick) return 'that deity has summoning sickness';
      if (attacker.attacked) return 'that deity already struck this turn';
      const foe = state.players[other(action.player)];
      if (action.targetKind === 'deity') {
        if (!foe.field.some((d) => d && d.uid === action.targetUid)) return 'no such target';
        return null;
      }
      // pillar strike: the defender may intercept with any of their deities (or not)
      if (action.interceptUid !== null && action.interceptUid !== undefined) {
        if (!foe.field.some((d) => d && d.uid === action.interceptUid)) return 'interceptor is not a defender deity';
      }
      return null;
    }
    default:
      return 'unknown action';
  }
}

// ---------------------------------------------------------------------------
// Apply — assumes the action is legal (validate returned null).
// ---------------------------------------------------------------------------
function apply(state: GameState, action: Action): GameState {
  const active = state.active;
  const p = state.players[active];
  const foeId = other(active);
  const foe = state.players[foeId];

  switch (action.type) {
    case 'draw': {
      const dr = drawCards(p, 1, state.rngState);
      const players = state.players.slice() as [PlayerState, PlayerState];
      players[active] = { ...dr.player, drawn: true };
      return { ...state, players, rngState: dr.rngState };
    }
    case 'channel': {
      const essence = Math.min(ESSENCE_CAP, p.essence + channelGain(p.culture, p.turnsTaken));
      const players = state.players.slice() as [PlayerState, PlayerState];
      players[active] = { ...p, essence, channeled: true };
      return { ...state, players };
    }
    case 'summon': {
      const card = findHandCard(p, action.uid)!;
      const data = duelCard(card.entityId)!;
      const stats = summonStats(p.culture, data);
      const deity: FieldDeity = {
        uid: card.uid, entityId: card.entityId, name: data.name, element: data.element,
        power: stats.power, guard: stats.guard, damage: 0, sick: true, attacked: false,
        relicSlug: null, relicName: null,
      };
      const field = p.field.slice();
      field[action.slot] = deity;
      const players = state.players.slice() as [PlayerState, PlayerState];
      players[active] = {
        ...p,
        hand: p.hand.filter((c) => c.uid !== card.uid),
        field,
        essence: p.essence - summonCost(p.culture, data),
      };
      return { ...state, players };
    }
    case 'attach': {
      const field = p.field.map((d) => {
        if (!d || d.uid !== action.uid) return d;
        const ref = duelRelicsForEntity(d.entityId).find((r) => r.slug === action.relic);
        return { ...d, relicSlug: action.relic, relicName: ref ? ref.name : action.relic, power: d.power + RELIC_PWR, guard: d.guard + RELIC_GRD };
      });
      const players = state.players.slice() as [PlayerState, PlayerState];
      players[active] = { ...p, field, essence: p.essence - relicCost(p.culture), relicsUsed: [...p.relicsUsed, action.relic] };
      return { ...state, players };
    }
    case 'strike':
      return applyStrike(state, action);
    case 'endTurn': {
      // Upkeep: discard excess hand (newest end), then pass to the opponent and
      // begin their turn (ready their field, +turn counter).
      const overflow = Math.max(0, p.hand.length - HAND_LIMIT);
      const discarded = overflow ? p.hand.slice(p.hand.length - overflow) : [];
      const keptHand = overflow ? p.hand.slice(0, p.hand.length - overflow) : p.hand;
      const ending: PlayerState = { ...p, hand: keptHand, discard: [...p.discard, ...discarded] };

      const nextFoe: PlayerState = {
        ...foe,
        field: readyField(foe.field),
        drawn: false,
        channeled: false,
        turnsTaken: foe.turnsTaken + 1,
      };
      const players = state.players.slice() as [PlayerState, PlayerState];
      players[active] = ending;
      players[foeId] = nextFoe;
      return { ...state, players, active: foeId, turn: state.turn + 1 };
    }
    default:
      return state;
  }
}

function applyStrike(state: GameState, action: Extract<Action, { type: 'strike' }>): GameState {
  const active = state.active;
  const foeId = other(active);
  const p = state.players[active];
  const foe = state.players[foeId];

  const attackerIdx = p.field.findIndex((d) => d && d.uid === action.attackerUid);
  const attacker = p.field[attackerIdx] as FieldDeity;
  const damage = attacker.power; // element advantage is added only vs a deity

  const players = state.players.slice() as [PlayerState, PlayerState];
  const newPField = p.field.slice();
  newPField[attackerIdx] = { ...attacker, attacked: true };

  if (action.targetKind === 'deity') {
    const defIdx = foe.field.findIndex((d) => d && d.uid === action.targetUid);
    const defender = foe.field[defIdx] as FieldDeity;
    const total = damage + (elementBeats(attacker.element, defender.element) ? ELEMENT_ADVANTAGE : 0);
    const resolved = resolveDamage(foe, defIdx, defender, total);
    players[active] = { ...p, field: newPField };
    players[foeId] = resolved.player;
    return { ...state, players };
  }

  // Pillar strike: the defender may have chosen an interceptor.
  if (action.interceptUid !== null && action.interceptUid !== undefined) {
    const defIdx = foe.field.findIndex((d) => d && d.uid === action.interceptUid);
    const defender = foe.field[defIdx] as FieldDeity;
    const total = damage + (elementBeats(attacker.element, defender.element) ? ELEMENT_ADVANTAGE : 0);
    const resolved = resolveDamage(foe, defIdx, defender, total);
    players[active] = { ...p, field: newPField };
    players[foeId] = resolved.player;
    return { ...state, players };
  }

  const pillar = foe.pillar - damage;
  players[active] = { ...p, field: newPField };
  players[foeId] = { ...foe, pillar };
  const over = pillar <= 0;
  return { ...state, players, over, winner: over ? active : state.winner };
}

function resolveDamage(owner: PlayerState, index: number, defender: FieldDeity, total: number): { player: PlayerState } {
  const field = owner.field.slice();
  const newDamage = defender.damage + total;
  if (newDamage >= defender.guard) {
    // death -> discard
    field[index] = null;
    return { player: { ...owner, field, discard: [...owner.discard, { uid: defender.uid, entityId: defender.entityId }] } };
  }
  field[index] = { ...defender, damage: newDamage };
  return { player: { ...owner, field } };
}

/** Public reducer: validates, then applies and appends to the log. Illegal no-op. */
export function reduce(state: GameState, action: Action): GameState {
  if (validate(state, action)) return state;
  const next = apply(state, action);
  return { ...next, log: [...state.log, action] };
}

// ---------------------------------------------------------------------------
// Legal-action enumeration (UI disabling + random self-play).
// ---------------------------------------------------------------------------
export function legalActions(state: GameState): Action[] {
  if (state.over) return [];
  const p: PlayerId = state.active;
  const me = state.players[p];
  const foe = state.players[other(p)];
  const out: Action[] = [];
  if (!me.drawn) out.push({ type: 'draw', player: p });
  if (!me.channeled) out.push({ type: 'channel', player: p });

  if (me.drawn && me.channeled) {
    for (const card of me.hand) {
      const data = duelCard(card.entityId);
      if (!data) continue;
      if (me.essence < summonCost(me.culture, data)) continue;
      for (let slot = 0; slot < FIELD_SLOTS; slot++) {
        if (!me.field[slot]) out.push({ type: 'summon', player: p, uid: card.uid, slot });
      }
    }
    for (const d of me.field) {
      if (!d || d.relicSlug) continue;
      if (me.essence < relicCost(me.culture)) continue;
      for (const relic of duelRelicsForEntity(d.entityId)) {
        if (!me.relicsUsed.includes(relic.slug)) out.push({ type: 'attach', player: p, uid: d.uid, relic: relic.slug });
      }
    }
    for (const d of me.field) {
      if (!d || d.sick || d.attacked) continue;
      for (const t of foe.field) {
        if (t) out.push({ type: 'strike', player: p, attackerUid: d.uid, targetKind: 'deity', targetUid: t.uid });
      }
      out.push({ type: 'strike', player: p, attackerUid: d.uid, targetKind: 'pillar', interceptUid: null });
      for (const t of foe.field) {
        if (t) out.push({ type: 'strike', player: p, attackerUid: d.uid, targetKind: 'pillar', interceptUid: t.uid });
      }
    }
  }
  out.push({ type: 'endTurn', player: p });
  return out;
}
