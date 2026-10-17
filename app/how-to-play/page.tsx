import type { Metadata } from 'next';
import Link from 'next/link';
import { cardFor, ALL_CULTURES } from '../lib/data';
import { DeityCard } from '../components/DeityCard';
import { PrintButton } from '../components/PrintButton';
import { ELEMENT_LABELS, ELEMENT_COLORS, ELEMENT_TEXT_COLORS } from '../lib/card';
import { CULTURE_NAMES } from '../lib/types';
import {
  DECK_SIZE, STARTING_HAND, HAND_LIMIT, STARTING_ESSENCE, CHANNEL_GAIN, ESSENCE_CAP,
  PILLAR_HP, PILLAR_HP_BY_PLAYERS, ESSENCE_RAMP, FIELD_SLOTS, ELEMENT_ADVANTAGE,
  RELIC_COST, RELIC_PWR, RELIC_GRD, MAX_MYTHIC_COPIES, MAX_RARE_COPIES,
  PANTHEON_SYNERGY, ELEMENT_ADVANTAGE_PAIRS, NEUTRAL_ELEMENTS,
} from '../lib/pantheon';

export const metadata: Metadata = {
  title: 'How to play — Pantheon',
  description: 'The complete rulebook for Pantheon, the Divine Atlas card game for 2–4 players: quick start, card anatomy, a step-by-step turn walkthrough, the keyword glossary, a worked example transcribed from a real engine run, and the FAQ.',
};

// The wheel: seven interacting elements on a ring, neutral families outside.
const WHEEL = ['fire', 'earth', 'water', 'storm', 'life', 'mind', 'war'] as const;

function polarityTable() {
  return ELEMENT_ADVANTAGE_PAIRS.map(([a, b]) => `${ELEMENT_LABELS[a]} beats ${ELEMENT_LABELS[b]}`).join(' · ');
}

export default function HowToPlayPage() {
  const sample = cardFor('jpn-amaterasu') || cardFor('gre-zeus')!;

  return (
    <div className="rules-page">
      <header className="deck-hero rules-hero">
        <div className="container">
          <span className="eyebrow">How to play</span>
          <h1 className="display-xl" style={{ marginTop: 14 }}>Pantheon</h1>
          <p className="muted" style={{ maxWidth: 720, marginTop: 18, fontSize: '1.05rem', lineHeight: 1.65 }}>
            A free-for-all elemental card game for <strong>2 to 4 players</strong>, built from the Atlas itself. You
            are a priest channelling one pantheon; you win by being the <strong>last Cosmic Pillar standing</strong>.
            Every card is a real deity from this site — its element, PWR, GRD and essence are derived from the god&apos;s
            own verified profile, and its rarity is interpretive.
          </p>
          <div className="rules-cta" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 26 }}>
            <Link href="/play" className="btn">Play the duel ⚔</Link>
            <Link href="/how-to-play/board" className="btn">Printable board</Link>
            <PrintButton label="Print rulebook" />
            <Link href="/cards" className="btn">The Deck</Link>
          </div>
        </div>
      </header>

      {/* 1 — QUICK START */}
      <section className="container rules-section">
        <span className="eyebrow">01 · Quick start</span>
        <h2 className="rules-h2">The thirty-second version</h2>
        <ol className="rules-steps">
          <li><b>Pick seats.</b> Choose 2, 3 or 4 players and one pantheon each. Each seat shuffles a <b>{DECK_SIZE}-card</b> single-culture deck (rarity rules in §3).</li>
          <li><b>Set the table.</b> Every Pillar starts at <b>{PILLAR_HP}</b> ({PILLAR_HP_BY_PLAYERS[4]} in a four-player game). Each seat draws <b>{STARTING_HAND}</b> cards, starts with <b>{STARTING_ESSENCE}</b> essence and has <b>{FIELD_SLOTS}</b> field slots.</li>
          <li><b>Take a turn.</b> Draw 1 → Channel essence → Main phase (summon, attach relics, strike, in any order) → Upkeep. Then play passes to the next seat.</li>
          <li><b>Summon a deity</b> by paying its essence cost into an empty slot. A deity cannot strike the turn it is summoned (summoning sickness).</li>
          <li><b>Strike</b> with a ready deity: hit <em>any</em> enemy seat&apos;s deity or that seat&apos;s Pillar. Attacker PWR vs defender GRD; the attacking element may add <b>+{ELEMENT_ADVANTAGE} PWR</b>.</li>
          <li><b>Win</b> by being the last seat whose Pillar still stands. A cracked Pillar eliminates that seat immediately.</li>
        </ol>
        <p className="rules-note faint small">The deck, the print sheet, this rulebook and the digital duel are one card model. Nothing is invented: the numbers are a game, labelled as such.</p>
      </section>

      {/* 2 — CARD ANATOMY */}
      <section className="container rules-section">
        <span className="eyebrow">02 · Card anatomy</span>
        <h2 className="rules-h2">Reading a deity card</h2>
        <div className="rules-anatomy">
          <div className="rules-anatomy-card avoid-break">
            <DeityCard card={sample} size="lg" />
          </div>
          <ul className="rules-anatomy-list">
            <li><b>Essence cost</b> — the disc in the corner. Pay this to summon the deity from your hand to the field.</li>
            <li><b>Element sigil + type line</b> — the god&apos;s element (Fire, Water, Sky…) and class. The element drives the wheel in §3.</li>
            <li><b>PWR pips</b> — power: how much damage the deity deals when it strikes.</li>
            <li><b>GRD pips</b> — guard: how much damage it absorbs before it dies. Damage accumulates until it reaches GRD.</li>
            <li><b>Rarity band</b> — Common / Uncommon / Rare / Mythic. Rarity governs how many copies may go in a deck.</li>
            <li><b>Flavor + [S#]</b> — the god&apos;s own short profile and its source citations, the same ones used everywhere in the Atlas.</li>
            <li><b>Set code</b> — <span className="mono">{sample.set_code}</span> — culture and ordinal. This is how the deck is ordered and how a print run is collated.</li>
          </ul>
        </div>
      </section>

      {/* 3 — TURN WALKTHROUGH */}
      <section className="container rules-section">
        <span className="eyebrow">03 · Turn walkthrough</span>
        <h2 className="rules-h2">One turn, four steps — in order</h2>
        <ol className="rules-steps rules-steps-num">
          <li>
            <b>1 · Draw.</b> Draw 1 card from the top of your deck. If your deck is empty, shuffle your discard pile into
            a new deck and continue. Drawing is compulsory before you may act.
          </li>
          <li>
            <b>2 · Channel.</b> Gain essence, up to a maximum of <b>{ESSENCE_CAP}</b>. In a two-player game that is a flat
            <b> +{CHANNEL_GAIN}</b>. In 3–4 player games the gain <b>ramps by your own turn count</b> —
            +2 on turns 1–2, +3 on turns 3–4, +4 from turn 5 (see §7) — so a big table does not stall.
          </li>
          <li>
            <b>3 · Main.</b> In any order: <b>summon</b> (pay essence, empty slot), <b>attach</b> a relic, and <b>strike</b>
            (each deity strikes at most once per turn, and never the turn it arrives).
            <ul className="rules-list">
              <li><b>Summoning sickness.</b> A deity enters <em>sick</em> and cannot strike that turn; it can still be
                blocked-over (it is a legal interceptor). It readies at the start of your next turn.</li>
              <li><b>Relics</b> come from the Vault: a deity may carry one relic, and a relic must belong to that deity
                (<span className="mono">artifactsForEntity</span>). Attaching costs <b>{RELIC_COST} essence</b> and grants
                <b> +{RELIC_PWR} PWR / +{RELIC_GRD} GRD</b>. Each relic can be used once per seat.</li>
              <li><b>Free-for-all targeting.</b> On a strike, choose <em>any</em> living enemy seat, then either one of
                its deities or its Pillar. There are no teams and no alliances in the rules.</li>
              <li><b>Strike math.</b> Against a deity, <span className="mono">damage = attacker PWR + {ELEMENT_ADVANTAGE} if
                the attacker&apos;s element beats the defender&apos;s</span>. Damage accumulates; at <span className="mono">damage ≥ GRD</span>
                the deity dies and goes to its owner&apos;s discard.</li>
              <li><b>Strike the Pillar.</b> When you target a Pillar, that seat may choose one of <em>their own</em> deities
                to <b>intercept</b> (taking the hit exactly as above); otherwise the Pillar loses the attacker&apos;s base PWR.
                The wheel does not apply to a Pillar (it has no element).</li>
            </ul>
          </li>
          <li>
            <b>4 · Upkeep.</b> Discard down to a hand of <b>{HAND_LIMIT}</b> (from the newest end). Then your deities ready
            and the turn passes to the next living seat in order. If a Pillar was reduced to 0, that seat is
            <b> eliminated</b>: its field deities are banished and its hand is discarded. The game ends the moment one seat
            remains.
          </li>
        </ol>

        <h3 className="rules-h3">The elemental wheel</h3>
        <p className="muted" style={{ maxWidth: 760 }}>{polarityTable()}. Everything else — including the four neutral families below — fights on raw PWR and GRD.</p>
        <div className="rules-wheel">
          <svg viewBox="0 0 240 240" className="rules-wheel-svg avoid-break" role="img" aria-label={`Elemental wheel: ${polarityTable()}`}>
            <defs>
              <marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0 0 L7 3.5 L0 7 Z" fill="var(--ink-1)" />
              </marker>
            </defs>
            <circle cx="120" cy="120" r="86" fill="none" stroke="var(--line)" strokeDasharray="2 4" />
            {WHEEL.map((el, i) => {
              const a = (-90 + i * (360 / WHEEL.length)) * (Math.PI / 180);
              const x = 120 + 86 * Math.cos(a);
              const y = 120 + 86 * Math.sin(a);
              return (
                <g key={el}>
                  <circle cx={x} cy={y} r="17" fill="var(--bg-2)" stroke={ELEMENT_COLORS[el]} strokeWidth="1.6" />
                  <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fill={ELEMENT_COLORS[el]}
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>{ELEMENT_LABELS[el]}</text>
                </g>
              );
            })}
            {ELEMENT_ADVANTAGE_PAIRS.map(([from, to]) => {
              const pos = (el: string) => {
                const i = WHEEL.indexOf(el as typeof WHEEL[number]);
                const a = (-90 + i * (360 / WHEEL.length)) * (Math.PI / 180);
                return [120 + 86 * Math.cos(a), 120 + 86 * Math.sin(a)] as const;
              };
              const [x1, y1] = pos(from);
              const [x2, y2] = pos(to);
              const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
              const ex = x2 - (dx / len) * 21, ey = y2 - (dy / len) * 21;
              return <line key={`${from}-${to}`} x1={x1} y1={y1} x2={ex} y2={ey} stroke="var(--ink-1)" strokeWidth="1.2" markerEnd="url(#arrow)" opacity="0.7" />;
            })}
          </svg>
          <div className="rules-wheel-side">
            <table className="rules-table">
              <thead><tr><th>Attacker</th><th>Beats</th><th>Bonus</th></tr></thead>
              <tbody>
                {ELEMENT_ADVANTAGE_PAIRS.map(([a, b]) => (
                  <tr key={a}><td style={{ color: ELEMENT_TEXT_COLORS[a] }}>{ELEMENT_LABELS[a]}</td><td style={{ color: ELEMENT_TEXT_COLORS[b] }}>{ELEMENT_LABELS[b]}</td><td className="mono">+{ELEMENT_ADVANTAGE} PWR</td></tr>
                ))}
              </tbody>
            </table>
            <p className="rules-note">
              <b>Neutral:</b>{' '}
              {NEUTRAL_ELEMENTS.map((e) => ELEMENT_LABELS[e]).join(' · ')}.
              Neutral elements neither gain nor grant an advantage; they simply fight on raw PWR and GRD.
            </p>
          </div>
        </div>

        <h3 className="rules-h3">Pantheon synergies</h3>
        <p className="muted" style={{ maxWidth: 760 }}>Each bonus is a single deterministic line, derived from domains the culture&apos;s gods actually carry in the data.</p>
        <table className="rules-table rules-table-wide">
          <thead><tr><th>Pantheon</th><th>Ability</th><th>Effect</th><th>Data rationale</th></tr></thead>
          <tbody>
            {ALL_CULTURES.map((c) => {
              const s = PANTHEON_SYNERGY[c];
              return (
                <tr key={c}>
                  <td style={{ color: ELEMENT_COLORS.sky }}>{CULTURE_NAMES[c]}</td>
                  <td><b>{s.name}</b></td>
                  <td>{s.text}</td>
                  <td className="faint small">{s.rationale}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 className="rules-h3">Deck-building legality</h3>
        <ul className="rules-list">
          <li>A deck is <b>exactly {DECK_SIZE} cards</b>, all one pantheon.</li>
          <li>At most <b>{MAX_MYTHIC_COPIES} Mythic</b> copy and at most <b>{MAX_RARE_COPIES} Rare</b> copies of any single card. Uncommon and Common copies are unlimited.</li>
          <li>No mulligan. What you draw is what you play — every game is reproducible from its seed.</li>
        </ul>
      </section>

      {/* 4 — GLOSSARY */}
      <section className="container rules-section">
        <span className="eyebrow">04 · Keyword glossary</span>
        <h2 className="rules-h2">Words to know</h2>
        <dl className="rules-glossary">
          <div><dt>Channel</dt><dd>The second step of a turn: gain essence (a flat +{CHANNEL_GAIN} in 2P; ramped in 3–4P). Some pantheons channel more.</dd></div>
          <div><dt>Essence</dt><dd>The resource used to summon deities and attach relics. Starts at {STARTING_ESSENCE}, gains each turn, caps at {ESSENCE_CAP}.</dd></div>
          <div><dt>Pillar</dt><dd>Your life total: {PILLAR_HP} in 2–3 player games, {PILLAR_HP_BY_PLAYERS[4]} in a 4-player game. At 0 you are eliminated.</dd></div>
          <div><dt>Summon</dt><dd>Pay a card&apos;s essence cost to place it from hand onto an empty field slot.</dd></div>
          <div><dt>Banish</dt><dd>When a seat is eliminated its field deities are banished (removed from play) and its hand is discarded. A deity that takes lethal damage is also removed, but goes to its owner&apos;s discard.</dd></div>
          <div><dt>Intercept</dt><dd>When a Pillar is attacked, the defending seat may block with one of its own deities; that deity takes the hit instead.</dd></div>
          <div><dt>Strike</dt><dd>Attack with a ready deity — one strike per deity per turn, never the turn it arrives.</dd></div>
          <div><dt>Sickness</dt><dd>Summoning sickness — a deity cannot strike on the turn it arrives.</dd></div>
          <div><dt>Domain</dt><dd>The mythic concepts a deity carries (war, sun, fertility…). Domains drive the pantheon synergies above.</dd></div>
          <div><dt>Element bonus</dt><dd>+{ELEMENT_ADVANTAGE} PWR when your element beats the defender&apos;s on the wheel.</dd></div>
          <div><dt>Relic</dt><dd>An artifact from the Vault attached to a deity for +{RELIC_PWR} PWR / +{RELIC_GRD} GRD. One per deity, once per seat.</dd></div>
          <div><dt>Synergy</dt><dd>Your pantheon&apos;s one signature rule, active for the whole game.</dd></div>
          <div><dt>Elimination</dt><dd>Dropping a seat&apos;s Pillar to 0. Its board and hand are removed; it takes no further turns.</dd></div>
          <div><dt>Mythic</dt><dd>The rarest tier; at most {MAX_MYTHIC_COPIES} copy of any Mythic card per deck.</dd></div>
          <div><dt>Free-for-all</dt><dd>Every seat is its own side. You may attack any living enemy seat each strike.</dd></div>
        </dl>
      </section>

      {/* 5 — WORKED EXAMPLE */}
      <section className="container rules-section">
        <span className="eyebrow">05 · Worked example round</span>
        <h2 className="rules-h2">Seed 20261017 — Seat 1 Greek vs Seat 2 Norse</h2>
        <p className="rules-note faint small">
          Transcribed from a real engine run: <span className="mono">createGame({'{ seed: 20261017, players: 2, deckCultures: [\u2018greek\u2019, \u2018norse\u2019] }'})</span>,
          then the plays below. Same seed and plays reproduce this game exactly.
        </p>
        <div className="rules-transcript avoid-break">
          <div className="rules-turn">
            <h4>Opening hands</h4>
            <ul className="rules-list">
              <li><b>Seat 1 (Greek):</b> Ares (War 9/8, cost 7) · Rhea (Earth 7/6, cost 6) · Gaia (Earth 8/4, cost 6) · Uranus (Sky 11/7, cost 9) · Athena (Mind 10/7, cost 7).</li>
              <li><b>Seat 2 (Norse):</b> Ymir (Void 5/4, cost 5) · Auðhumbla (Void 3/2, cost 3) · Muspel (Fire 2/3, cost 3) · Muspel · Borr (Void 10/4, cost 6).</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 1 — Seat 1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Cronus (Sky 10/5, cost 7). <b>Channel</b> +2 plus the Greek synergy <em>First Thunder</em> +1 → <b>5 essence</b>.</li>
              <li><b>Main</b>: the cheapest card in hand costs 6, so nothing is summonable yet. <b>Upkeep</b>. Field empty.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 1 — Seat 2 (Norse)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Niflheim (Void 6/6, cost 6). <b>Channel</b> +2 → <b>4 essence</b>.</li>
              <li><b>Main</b>: summon <b>Auðhumbla</b> (Void 3/2, cost 3) → 1 essence. Auðhumbla is sick.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 2 — Seat 1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Rhea. <b>Channel</b> +2 → <b>7 essence</b> (the Greek bonus is turn-1 only).</li>
              <li><b>Main</b>: summon <b>Ares</b> (War 9/8, cost 7) → 0 essence. Ares is sick.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 2 — Seat 2 (Norse)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Ymir. <b>Channel</b> +2 → <b>3 essence</b>, summon <b>Muspel</b> (Fire 2/3, cost 3) → 0 essence.</li>
              <li>Auðhumbla had a turn to ready, so it strikes <b>Ares</b>: Auðhumbla PWR 3, Void is neutral vs War → Ares carries <b>3 damage</b> (of 8 GRD).</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 3 — Seat 1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Rhea. <b>Channel</b> +2 → <b>2 essence</b>.</li>
              <li>Ares readies and strikes <b>Auðhumbla</b>: 9 PWR vs 2 GRD — no wheel bonus, still lethal. Auðhumbla dies.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 3 — Seat 2 (Norse)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Ymir. <b>Channel</b> +2 → <b>2 essence</b> — one short of a summon.</li>
              <li>Muspel strikes <b>Ares</b>: 2 more damage → Ares at <b>5</b>, still standing.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 4 — Seat 1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Zeus. <b>Channel</b> +2 → <b>4 essence</b>.</li>
              <li>Ares strikes <b>Muspel</b>: 9 vs 3 GRD — Muspel dies.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 4 — Seat 2 (Norse)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Auðhumbla. <b>Channel</b> +2 → <b>4 essence</b>, summon the second <b>Muspel</b> → 1 essence.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 5 — Seat 1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Zeus. <b>Channel</b> +2 → <b>6 essence</b>, summon <b>Rhea</b> (cost 6) → 0 essence.</li>
              <li>Ares strikes the new <b>Muspel</b>: 9 vs 3 GRD — the Norse board is empty again, and the Pillar is exposed.</li>
            </ul>
          </div>
          <p className="rules-note">The lesson: channel early, respect summoning sickness, trade up with a big deity, and remember that an open field means the Pillar is next. In a 3–4 player game the same start applies, but your essence ramp and the extra enemy seats change the math.</p>
        </div>
      </section>

      {/* 6 — FAQ */}
      <section className="container rules-section">
        <span className="eyebrow">06 · FAQ</span>
        <h2 className="rules-h2">Frequently asked</h2>
        <dl className="rules-glossary">
          <div><dt>Is there a mulligan?</dt><dd>No. Your opening hand is whatever the shuffle gives you, which is what makes a seed reproduce a whole game.</dd></div>
          <div><dt>What happens when my deck runs out?</dt><dd>Shuffle your discard pile into a new deck and keep drawing. There is no fatigue clock — the gods keep returning.</dd></div>
          <div><dt>How do ties work?</dt><dd>They cannot happen. Pillars are only reduced one strike at a time, and the game ends the instant a single seat remains. A strike that would eliminate the last rival simply ends the game.</dd></div>
          <div><dt>How are 3 and 4 player games different?</dt><dd>Seats take turns in order and may attack any living enemy. Pillars are 20 HP for 2–3 players and {PILLAR_HP_BY_PLAYERS[4]} for 4. In 3–4 player games your own Channel ramps: +2 on your turns 1–2, +3 on turns 3–4, +4 from turn 5 (cap {ESSENCE_CAP}). Eliminated seats drop out entirely.</dd></div>
          <div><dt>Can I attack a player who is already at 0?</dt><dd>No. An eliminated seat is not a legal target.</dd></div>
          <div><dt>Do I have to attack?</dt><dd>No. You may summon, attach relics, pass, or end your turn without striking.</dd></div>
          <div><dt>How does hot-seat privacy work in the digital game?</dt><dd>Only the active seat&apos;s hand is shown. Other seats can be revealed with a press-and-hold &ldquo;peek&rdquo; (for teaching), and the &ldquo;Hide hands&rdquo; curtain lets you pass the device. The printed mat gives each seat its own zone.</dd></div>
          <div><dt>Is this historically accurate?</dt><dd>No — and it does not claim to be. Names, elements, domains and sources come from the Atlas; every number is our own design choice for a playable game. See §7.</dd></div>
        </dl>
      </section>

      {/* 7 — DESIGN CHOICES */}
      <section className="container rules-section">
        <span className="eyebrow">07 · Design choices</span>
        <h2 className="rules-h2">Design choice, not mythology</h2>
        <p className="muted" style={{ maxWidth: 760 }}>
          These numbers are <b>ours</b>. They are tuned for a playable game and are not claims about the historical
          gods. The only data-derived facts on a card are its name, element, domains, rarity and its interpretive
          PWR/GRD/essence — which the Atlas already labels as interpretive.
        </p>
        <table className="rules-table rules-table-wide">
          <thead><tr><th>Rule</th><th>Value</th><th>Why (design, not myth)</th></tr></thead>
          <tbody>
            <tr><td>Deck size</td><td className="mono">{DECK_SIZE}</td><td>Lowered from the concept doc&apos;s 30: Slavic ships only 13 cards, so the largest legal single-pantheon deck under the rarity caps is 13 × 2 = 26. {DECK_SIZE} leaves headroom.</td></tr>
            <tr><td>Starting hand</td><td className="mono">{STARTING_HAND}</td><td>Enough opening choice without a long setup.</td></tr>
            <tr><td>Hand limit</td><td className="mono">{HAND_LIMIT}</td><td>Keeps hands flowing; excess is discarded at upkeep.</td></tr>
            <tr><td>Starting essence</td><td className="mono">{STARTING_ESSENCE}</td><td>Lets each seat act soon after the first draw.</td></tr>
            <tr><td>Channel / cap</td><td className="mono">+{CHANNEL_GAIN} / {ESSENCE_CAP}</td><td>Essence accumulates, so the late game opens up big primordials.</td></tr>
            <tr><td>Essence ramp (3–4P)</td><td className="mono">{ESSENCE_RAMP.map((r) => `${r.gain}`).join('/')}</td><td>Three or four seats can stall on the opening curve; the ramp accelerates the mid-game by the seat&apos;s own turn count. 2P keeps the flat +{CHANNEL_GAIN}.</td></tr>
            <tr><td>Pillar HP</td><td className="mono">2P {PILLAR_HP_BY_PLAYERS[2]} · 3P {PILLAR_HP_BY_PLAYERS[3]} · 4P {PILLAR_HP_BY_PLAYERS[4]}</td><td>More attackers means more strikes aimed at one Pillar, so 4P gets +4. A 2-player duel lasts roughly 8–14 turns at these power levels.</td></tr>
            <tr><td>Field slots</td><td className="mono">{FIELD_SLOTS}</td><td>Small enough to read at a glance, large enough to matter.</td></tr>
            <tr><td>Element advantage</td><td className="mono">+{ELEMENT_ADVANTAGE} PWR</td><td>Meaningful but never decisive on its own.</td></tr>
            <tr><td>Relic cost / bonus</td><td className="mono">{RELIC_COST} ✦ / +{RELIC_PWR} PWR, +{RELIC_GRD} GRD</td><td>Relics are a light tempo play, reusing Vault artifacts.</td></tr>
            <tr><td>Rarity legality</td><td className="mono">max {MAX_MYTHIC_COPIES} Mythic, {MAX_RARE_COPIES} Rare</td><td>Mirrors the concept doc&apos;s deck-building layer.</td></tr>
            <tr><td>Strikes per deity</td><td className="mono">1 / turn</td><td>Prevents one deity clearing a whole board.</td></tr>
            <tr><td>Combat direction</td><td className="mono">one-sided</td><td>The attacker damages the defender; there is no retaliation step (keeps the math legible).</td></tr>
            <tr><td>Pillar damage</td><td className="mono">base PWR</td><td>The wheel needs an element on both sides; a Pillar has none.</td></tr>
            <tr><td>Mulligan</td><td className="mono">none</td><td>Keeps every game reproducible from its seed.</td></tr>
            <tr><td>Deck-out</td><td className="mono">reshuffle discard</td><td>No fatigue clock; gods keep returning.</td></tr>
            <tr><td>Pantheon synergies</td><td className="mono">6 × one line</td><td>See §3 — each derived from the culture&apos;s own domains.</td></tr>
          </tbody>
        </table>
      </section>

      <div className="container rules-footer">
        <Link href="/play" className="btn">Play the duel ⚔</Link>
        <Link href="/how-to-play/board" className="btn">Printable board</Link>
      </div>
    </div>
  );
}
