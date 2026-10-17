// scripts/enginetest.ts — pure-engine tests for the Pantheon duel (PHASE 6).
//
// Run:  npx tsx scripts/enginetest.ts
//
// Covers: deck legality for all 6 cultures · determinism (same seed => same
// deck/state, replay matches) · channel gating · undo/replay · random self-play
// to termination · the elemental wheel · 2–4 player free-for-all (seat rotation,
// targeting, elimination, pillar/essence scaling) · the 2-player regression hash.
// No test framework, no new deps.
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { createHash } from 'crypto';
import { mulberry } from '../app/lib/card';
import { setDuelDeck } from '../app/lib/pantheon-data';
import type { DuelDeckPayload } from '../app/lib/pantheon-data';
import {
  DECK_SIZE, PILLAR_HP, newGame, createGame, buildDeck, deckIsLegal, legalActions, validate, reduce, replay, undo,
  elementBeats, ELEMENT_ADVANTAGE, pillarHpForCount, channelGainFor,
} from '../app/lib/pantheon';
import type { GameState, Action, PlayerCount } from '../app/lib/pantheon';

const CULTURES = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'] as const;

let passed = 0, failed = 0;
function test(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  \u2713 ${name}`); }
  catch (e) { failed++; console.error(`  \u2717 ${name}\n      ${(e as Error).message}`); }
}

// ---- load the runtime snapshot (same file the browser fetches) ----
const payload = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'duel-deck.json'), 'utf8')) as DuelDeckPayload;
setDuelDeck(payload.cards, payload.relics);
console.log(`enginetest · ${payload.cards.length} cards · ${Object.keys(payload.relics).length} relic entities\n`);

// same seed => identical bytes
const j = (x: unknown) => JSON.stringify(x);

console.log('deck legality');
test('every culture builds a legal, correctly-sized deck', () => {
  for (const culture of CULTURES) {
    const deck = buildDeck(culture);
    const check = deckIsLegal(deck, culture);
    assert.strictEqual(deck.length, DECK_SIZE, `${culture}: size ${deck.length}`);
    assert.ok(check.ok, `${culture}: ${check.reason}`);
  }
});

console.log('\ndeterminism');
test('newGame(seed) is byte-identical across runs', () => {
  const a = newGame(123456, 'greek', 'norse');
  const b = newGame(123456, 'greek', 'norse');
  assert.strictEqual(j(a), j(b));
});
test('different seeds produce different shuffles', () => {
  const a = newGame(1, 'greek', 'norse');
  const b = newGame(2, 'greek', 'norse');
  assert.notStrictEqual(j(a.players[0].deck), j(b.players[0].deck));
});
test('buildDeck is order-stable', () => {
  assert.strictEqual(j(buildDeck('slavic')), j(buildDeck('slavic')));
});

console.log('\nchannel gating');
test('main actions require Draw + Channel first', () => {
  const s = newGame(42, 'greek', 'norse');
  const uid = s.players[0].hand[0].uid;
  assert.match(validate(s, { type: 'summon', player: 0, uid, slot: 0 }) || '', /draw and channel/);
});
test('cannot channel (or draw) twice in a turn', () => {
  let s = newGame(42, 'greek', 'norse');
  assert.strictEqual(validate(s, { type: 'channel', player: 0 }), null);
  s = reduce(s, { type: 'channel', player: 0 });
  assert.match(validate(s, { type: 'channel', player: 0 }) || '', /already channeled/);
  s = reduce(s, { type: 'draw', player: 0 });
  assert.match(validate(s, { type: 'draw', player: 0 }) || '', /already drawn/);
});
test('cannot act for the non-active player', () => {
  const s = newGame(42, 'greek', 'norse');
  assert.match(validate(s, { type: 'channel', player: 1 }) || '', /not the active player/);
});
test('Greek synergy channels +1 on turn 1 (3 total with start 2 => 5)', () => {
  let s = newGame(7, 'greek', 'norse');
  s = reduce(s, { type: 'draw', player: 0 });
  s = reduce(s, { type: 'channel', player: 0 });
  assert.strictEqual(s.players[0].essence, 5);
});
test('non-Greek channels exactly +2', () => {
  let s = newGame(7, 'norse', 'greek');
  s = reduce(s, { type: 'draw', player: 0 });
  s = reduce(s, { type: 'channel', player: 0 });
  assert.strictEqual(s.players[0].essence, 4); // start 2 + 2
});

console.log('\nundo / replay');
test('replay reproduces a game exactly from its log', () => {
  let s = newGame(20261017, 'egyptian', 'mesopotamian');
  for (const a of legalActions(s).slice(0, 1)) s = reduce(s, a); // one deterministic first action
  const scripted: Action[] = [
    { type: 'draw', player: 0 }, { type: 'channel', player: 0 }, { type: 'endTurn', player: 0 },
    { type: 'draw', player: 1 }, { type: 'channel', player: 1 }, { type: 'endTurn', player: 1 },
  ];
  for (const a of scripted) s = reduce(s, a);
  const replayed = replay(s.seed, [s.players[0].culture, s.players[1].culture], s.log);
  assert.strictEqual(j(replayed), j(s));
});
test('undo returns the exact prior state', () => {
  let s = newGame(99, 'japanese', 'slavic');
  s = reduce(s, { type: 'draw', player: 0 });
  const before = j(s);
  s = reduce(s, { type: 'channel', player: 0 });
  const undone = undo(s);
  assert.strictEqual(j(undone), before);
  assert.strictEqual(undone.log.length, s.log.length - 1);
});
test('undo of the first action is a no-op', () => {
  const s = newGame(99, 'japanese', 'slavic');
  assert.strictEqual(j(undo(s)), j(s));
});

console.log('\nelemental wheel');
test('Fire>Earth, Earth>Water, Water>Fire, Storm>Life, Mind>War', () => {
  assert.ok(elementBeats('fire', 'earth'));
  assert.ok(elementBeats('earth', 'water'));
  assert.ok(elementBeats('water', 'fire'));
  assert.ok(elementBeats('storm', 'life'));
  assert.ok(elementBeats('mind', 'war'));
  assert.ok(!elementBeats('earth', 'fire'));
  assert.strictEqual(ELEMENT_ADVANTAGE, 2);
});

console.log('\nrandom self-play to termination');
test('random legal play always terminates with a winner (20 seeds)', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const rnd = mulberry((seed * 2654435761) >>> 0);
    const cultures: [string, string] = [CULTURES[seed % 6], CULTURES[(seed + 3) % 6]];
    let s: GameState = newGame(seed * 1000 + 1, cultures[0], cultures[1]);
    let steps = 0;
    while (!s.over && steps < 5000) {
      const actions = legalActions(s);
      assert.ok(actions.length > 0, `seed ${seed}: no legal actions at step ${steps}`);
      const pick = actions[Math.floor(rnd() * actions.length)];
      const before = s.log.length;
      s = reduce(s, pick);
      assert.strictEqual(s.log.length, before + 1, `seed ${seed}: legal action was rejected at step ${steps}`);
      steps++;
    }
    assert.ok(s.over, `seed ${seed}: did not terminate in 5000 steps`);
    assert.ok(s.winner === 0 || s.winner === 1, `seed ${seed}: no winner`);
    const loser = s.winner === 0 ? 1 : 0;
    assert.ok(s.players[loser].pillar <= 0, `seed ${seed}: loser pillar ${s.players[loser].pillar} > 0`);
    assert.ok(steps > 0);
  }
});
test('a full random game replays identically', () => {
  const rnd = mulberry(777);
  let s = newGame(777, 'norse', 'egyptian');
  let steps = 0;
  while (!s.over && steps < 5000) {
    const actions = legalActions(s);
    s = reduce(s, actions[Math.floor(rnd() * actions.length)]);
    steps++;
  }
  const replayed = replay(s.seed, [s.players[0].culture, s.players[1].culture], s.log);
  assert.strictEqual(j(replayed), j(s));
});

// ---------------------------------------------------------------------------
// PHASE 6 — 2–4 player free-for-all
// ---------------------------------------------------------------------------
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/** Deterministic random self-play for any player count. */
function selfPlayN(seed: number, cultures: string[], stepCap = 20000): { state: GameState; steps: number } {
  const rnd = mulberry((seed * 2654435761) >>> 0);
  let s = createGame({ seed, players: cultures.length as PlayerCount, deckCultures: cultures });
  let steps = 0;
  while (!s.over && steps < stepCap) {
    const actions = legalActions(s);
    assert.ok(actions.length > 0, `seed ${seed}: no legal actions at step ${steps}`);
    s = reduce(s, actions[Math.floor(rnd() * actions.length)]);
    steps++;
  }
  return { state: s, steps };
}

console.log('\n2–4 player free-for-all');
test('3-player self-play terminates with exactly one winner across 10 seeds (replay-identical)', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const cultures = [CULTURES[seed % 6], CULTURES[(seed + 2) % 6], CULTURES[(seed + 4) % 6]];
    const { state: s } = selfPlayN(seed * 100 + 3, cultures);
    assert.ok(s.over, `seed ${seed}: 3P did not terminate`);
    assert.strictEqual(s.players.length, 3);
    const alive = s.players.filter((p) => p.pillar > 0);
    assert.strictEqual(alive.length, 1, `seed ${seed}: ${alive.length} seats alive`);
    assert.ok(s.winner !== null && s.players[s.winner].pillar > 0, `seed ${seed}: bad winner`);
    const replayed = replay(s.seed, s.players.map((p) => p.culture), s.log);
    assert.strictEqual(j(replayed), j(s), `seed ${seed}: 3P replay diverged`);
  }
});
test('4-player self-play terminates with exactly one winner across 10 seeds (replay-identical)', () => {
  for (let seed = 1; seed <= 10; seed++) {
    const cultures = [CULTURES[seed % 6], CULTURES[(seed + 2) % 6], CULTURES[(seed + 4) % 6], CULTURES[(seed + 1) % 6]];
    const { state: s } = selfPlayN(seed * 100 + 7, cultures);
    assert.ok(s.over, `seed ${seed}: 4P did not terminate`);
    assert.strictEqual(s.players.length, 4);
    const alive = s.players.filter((p) => p.pillar > 0);
    assert.strictEqual(alive.length, 1, `seed ${seed}: ${alive.length} seats alive`);
    assert.ok(s.winner !== null && s.players[s.winner].pillar > 0, `seed ${seed}: bad winner`);
    const replayed = replay(s.seed, s.players.map((p) => p.culture), s.log);
    assert.strictEqual(j(replayed), j(s), `seed ${seed}: 4P replay diverged`);
  }
});
test('elimination banishes the defeated seat\u2019s field and discards its hand', () => {
  const rnd = mulberry(20260101);
  let s: GameState = createGame({ seed: 20260101, players: 3, deckCultures: ['greek', 'norse', 'egyptian'] });
  let steps = 0, found = false;
  while (!s.over && steps < 20000) {
    const actions = legalActions(s);
    s = reduce(s, actions[Math.floor(rnd() * actions.length)]);
    steps++;
    const dead = s.players.findIndex((p) => p.pillar <= 0);
    if (dead >= 0) {
      found = true;
      const d = s.players[dead];
      assert.strictEqual(d.pillar, 0, 'eliminated pillar should clamp to 0');
      assert.strictEqual(d.hand.length, 0, 'eliminated hand should be empty');
      assert.ok(d.field.every((f) => f === null), 'eliminated field should be empty');
      break;
    }
  }
  assert.ok(found, 'no elimination occurred in the 3P sample game');
});
test('targeting: any enemy seat\u2019s deity/pillar is legal; self and out-of-range are not', () => {
  let s = createGame({ seed: 555, players: 4, deckCultures: ['japanese', 'greek', 'norse', 'slavic'] });
  const rnd = mulberry(555);
  let steps = 0;
  while (steps < 8000) {
    const acts = legalActions(s);
    const hasStrike = acts.some((a) => a.type === 'strike');
    const striker = s.players[s.active].field.find((d) => d && !d.sick && !d.attacked);
    const enemies = s.players.map((_, i) => i).filter((i) => i !== s.active && s.players[i].pillar > 0);
    if (hasStrike && striker && enemies.length >= 2) break;
    s = reduce(s, acts[Math.floor(rnd() * acts.length)]);
    steps++;
  }
  const me = s.active;
  const striker = s.players[me].field.find((d) => d && !d.sick && !d.attacked);
  assert.ok(striker, 'expected an able striker in the sample state');
  const enemies = s.players.map((_, i) => i).filter((i) => i !== me && s.players[i].pillar > 0);
  assert.ok(enemies.length >= 2, 'expected ≥2 living enemies');

  for (const e of enemies) {
    const foeDeity = s.players[e].field.find((d) => d);
    if (foeDeity) {
      assert.strictEqual(
        validate(s, { type: 'strike', player: me, attackerUid: striker!.uid, targetKind: 'deity', targetPlayer: e, targetUid: foeDeity.uid }),
        null,
      );
    }
    assert.strictEqual(
      validate(s, { type: 'strike', player: me, attackerUid: striker!.uid, targetKind: 'pillar', targetPlayer: e, interceptUid: null }),
      null,
    );
  }
  assert.match(validate(s, { type: 'strike', player: me, attackerUid: striker!.uid, targetKind: 'pillar', targetPlayer: me, interceptUid: null }) || '', /own seat/);
  assert.match(validate(s, { type: 'strike', player: me, attackerUid: striker!.uid, targetKind: 'pillar', targetPlayer: 9, interceptUid: null }) || '', /invalid target seat/);
});
test('pillar HP scales 20/20/24 for 2/3/4 players', () => {
  assert.strictEqual(pillarHpForCount(2), 20);
  assert.strictEqual(pillarHpForCount(3), 20);
  assert.strictEqual(pillarHpForCount(4), 24);
  assert.strictEqual(createGame({ seed: 1, players: 2, deckCultures: ['greek', 'norse'] }).players[0].pillar, 20);
  assert.strictEqual(createGame({ seed: 1, players: 3, deckCultures: ['greek', 'norse', 'slavic'] }).players[0].pillar, 20);
  assert.strictEqual(createGame({ seed: 1, players: 4, deckCultures: ['greek', 'norse', 'slavic', 'japanese'] }).players[0].pillar, 24);
});
test('essence ramp: 2P flat +2; 3\u20134P +2/+3/+4 by the seat\u2019s own turn', () => {
  assert.strictEqual(channelGainFor(2, 'norse', 1), 2);
  assert.strictEqual(channelGainFor(2, 'norse', 3), 2);
  assert.strictEqual(channelGainFor(2, 'norse', 9), 2);
  for (const n of [3, 4]) {
    assert.strictEqual(channelGainFor(n, 'norse', 1), 2);
    assert.strictEqual(channelGainFor(n, 'norse', 2), 2);
    assert.strictEqual(channelGainFor(n, 'norse', 3), 3);
    assert.strictEqual(channelGainFor(n, 'norse', 4), 3);
    assert.strictEqual(channelGainFor(n, 'norse', 5), 4);
  }
  let s = createGame({ seed: 7, players: 3, deckCultures: ['norse', 'greek', 'slavic'] });
  s = reduce(s, { type: 'draw', player: 0 });
  s = reduce(s, { type: 'channel', player: 0 });
  assert.strictEqual(s.players[0].essence, 4);
  for (let i = 0; i < 6; i++) s = reduce(s, { type: 'endTurn', player: s.active });
  assert.strictEqual(s.players[0].turnsTaken, 3);
  s = reduce(s, { type: 'draw', player: 0 });
  s = reduce(s, { type: 'channel', player: 0 });
  assert.strictEqual(s.players[0].essence, 7);
});
test('2P action log never carries targetPlayer (byte-compatible with Phase 5)', () => {
  const rnd = mulberry(20261017);
  let g = newGame(20261017, 'greek', 'norse');
  let steps = 0;
  while (!g.over && steps < 5000) {
    const actions = legalActions(g);
    g = reduce(g, actions[Math.floor(rnd() * actions.length)]);
    steps++;
  }
  for (const a of g.log) if (a.type === 'strike') assert.ok(!('targetPlayer' in a), 'targetPlayer leaked into a 2P log');
});
test('2P regression: fixed-seed final state hash matches the Phase-5 snapshot', () => {
  // Captured by running the Phase-5 engine before any Phase 6 edit, with this
  // exact self-play routine (seed 20261017, greek vs norse).
  const EXPECT_INIT = '41fd8402a5f3bd050038f76c3df45780b24004244bd5042b2d73cecc62b61784';
  const EXPECT_FINAL = 'f533ded609cefc298348273df628897e8eb50f3ad874ec37350672e569f9fe1e';
  assert.strictEqual(sha(j(newGame(20261017, 'greek', 'norse'))), EXPECT_INIT, '2P initial-state hash changed');
  const rnd = mulberry((20261017 * 2654435761) >>> 0);
  let s = newGame(20261017, 'greek', 'norse');
  let steps = 0;
  while (!s.over && steps < 5000) {
    const actions = legalActions(s);
    s = reduce(s, actions[Math.floor(rnd() * actions.length)]);
    steps++;
  }
  assert.ok(s.over);
  assert.strictEqual(sha(j(s)), EXPECT_FINAL, '2P final-state hash changed — Phase 5 behavior not preserved');
});

console.log(`\n${failed ? `\u2717 ${failed} failed` : '\u2713 all tests passed'} · ${passed} passed${failed ? ` · ${failed} failed` : ''}`);
process.exit(failed ? 1 : 0);
