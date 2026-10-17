// scripts/enginetest.ts — pure-engine tests for the Pantheon duel (PHASE5).
//
// Run:  npx tsx scripts/enginetest.ts
//
// Covers: deck legality for all 6 cultures · determinism (same seed => same
// deck/state, replay matches) · channel gating · undo/replay · random self-play
// to termination · the elemental wheel. No test framework, no new deps.
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { mulberry } from '../app/lib/card';
import { setDuelDeck } from '../app/lib/pantheon-data';
import type { DuelDeckPayload } from '../app/lib/pantheon-data';
import {
  DECK_SIZE, newGame, buildDeck, deckIsLegal, legalActions, validate, reduce, replay, undo,
  elementBeats, ELEMENT_ADVANTAGE,
} from '../app/lib/pantheon';
import type { GameState, Action } from '../app/lib/pantheon';

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

console.log(`\n${failed ? `\u2717 ${failed} failed` : '\u2713 all tests passed'} · ${passed} passed${failed ? ` · ${failed} failed` : ''}`);
process.exit(failed ? 1 : 0);
