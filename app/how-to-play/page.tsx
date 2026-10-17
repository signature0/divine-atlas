import type { Metadata } from 'next';
import Link from 'next/link';
import { cardFor, ALL_CULTURES, loadCulture } from '../lib/data';
import { DeityCard } from '../components/DeityCard';
import { PrintButton } from '../components/PrintButton';
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../lib/card';
import { CULTURE_NAMES } from '../lib/types';
import {
  DECK_SIZE, STARTING_HAND, HAND_LIMIT, STARTING_ESSENCE, CHANNEL_GAIN, ESSENCE_CAP,
  PILLAR_HP, FIELD_SLOTS, ELEMENT_ADVANTAGE, RELIC_COST, RELIC_PWR, RELIC_GRD,
  MAX_MYTHIC_COPIES, MAX_RARE_COPIES, PANTHEON_SYNERGY, ELEMENT_ADVANTAGE_PAIRS,
  NEUTRAL_ELEMENTS,
} from '../lib/pantheon';

export const metadata: Metadata = {
  title: 'How to play — Pantheon',
  description: 'The complete rulebook for Pantheon, the Divine Atlas card game: quick start, card anatomy, the turn loop, the elemental wheel, pantheon synergies, a worked example round, and every design choice.',
};

// The wheel: seven interacting elements on a ring, three neutral families outside.
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
            A two-player elemental duelling game built from the Atlas itself. You are a priest
            channelling one pantheon; you win by toppling your opponent&apos;s <strong>Cosmic Pillar</strong>.
            Every card is a real deity from this site — its element, PWR, GRD and essence are
            derived from the god&apos;s own verified profile, and its rarity is interpretive.
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
        <h2 className="rules-h2">The sixty-second version</h2>
        <ol className="rules-steps">
          <li><b>Build a deck.</b> Each player picks one pantheon and shuffles a <b>{DECK_SIZE}-card</b> single-culture deck (rarity rules in §3).</li>
          <li><b>Set the table.</b> Both Pillars stand at <b>{PILLAR_HP}</b>. Each player draws <b>{STARTING_HAND}</b> cards and starts with <b>{STARTING_ESSENCE}</b> essence. There are <b>{FIELD_SLOTS}</b> field slots each.</li>
          <li><b>Take a turn.</b> Draw 1 → Channel <b>+{CHANNEL_GAIN}</b> essence (cap {ESSENCE_CAP}) → Main phase (summon, attach relics, strike, in any order) → Upkeep. Then pass.</li>
          <li><b>Summon a deity</b> by paying its essence cost into an empty slot. A deity cannot strike the turn it is summoned (summoning sickness).</li>
          <li><b>Strike</b> with a deity that has been on the field since your last turn: hit an enemy deity or the enemy Pillar. Attacker PWR vs defender GRD; the attacking element may add <b>+{ELEMENT_ADVANTAGE} PWR</b>.</li>
          <li><b>Win</b> the moment the opposing Pillar reaches 0.</li>
        </ol>
        <p className="rules-note faint small">All three of these — the deck, a print sheet, this rulebook, and the digital duel — are the same card model. Nothing is invented: the numbers are a game, labelled as such.</p>
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
            <li><b>Element sigil + type line</b> — the god&apos;s element (Fire, Water, Sky…) and class. The element drives the wheel in §4.</li>
            <li><b>PWR pips</b> — power: how much damage the deity deals when it strikes.</li>
            <li><b>GRD pips</b> — guard: how much damage it can absorb before it dies. Damage accumulates until it reaches GRD.</li>
            <li><b>Rarity band</b> — Common / Uncommon / Rare / Mythic. Rarity governs how many copies may go in a deck.</li>
            <li><b>Flavor + [S#]</b> — the god&apos;s own short profile and its source citations, the same ones used everywhere in the Atlas.</li>
            <li><b>Set code</b> — <span className="mono">{sample.set_code}</span>{' '}— culture and ordinal. This is how the deck is ordered and how a print run is collated.</li>
          </ul>
        </div>
      </section>

      {/* 3 — THE LOOP */}
      <section className="container rules-section">
        <span className="eyebrow">03 · The loop</span>
        <h2 className="rules-h2">One turn, four steps</h2>
        <div className="rules-loop">
          <div className="rules-loop-card"><h3>1 · Draw</h3><p>Draw 1 card from the top of your deck. If your deck is empty, shuffle your discard pile into a new deck and continue.</p></div>
          <div className="rules-loop-card"><h3>2 · Channel</h3><p>Gain <b>+{CHANNEL_GAIN}</b> essence, up to a maximum of <b>{ESSENCE_CAP}</b>. Essence is not spent down to zero between turns — it carries, so big gods become reachable.</p></div>
          <div className="rules-loop-card"><h3>3 · Main</h3><p>In any order: <b>summon</b> (pay essence, empty slot), <b>attach</b> a relic, and <b>strike</b>. Each deity strikes at most once per turn.</p></div>
          <div className="rules-loop-card"><h3>4 · Upkeep</h3><p>Discard down to a hand of <b>{HAND_LIMIT}</b>. Your deities ready: summoning sickness clears and each may strike again on your next turn.</p></div>
        </div>

        <h3 className="rules-h3">Summoning &amp; sickness</h3>
        <ul className="rules-list">
          <li>A summoned deity enters <b>sick</b> and cannot strike that turn; it can still block. It readies at the start of your next turn.</li>
          <li><b>Relics</b> come from the Vault: a deity may carry one relic, and a relic must belong to that deity (<span className="mono">artifactsForEntity</span>). Attaching costs <b>{RELIC_COST} essence</b> and grants <b>+{RELIC_PWR} PWR / +{RELIC_GRD} GRD</b>. Each relic can be used once per player.</li>
          <li><b>Strike math.</b> Attacker deals its effective PWR to the target. Against a deity: <span className="mono">effective PWR = PWR + {ELEMENT_ADVANTAGE} if the attacker&apos;s element beats the defender&apos;s</span>. Damage accumulates on the defender; at <span className="mono">damage ≥ GRD</span> the deity dies and goes to its owner&apos;s discard.</li>
          <li><b>Strike the Pillar.</b> When no deity is targeted, the defender may choose one of their own deities to <b>intercept</b> (taking the hit as above); otherwise the Pillar loses the attacker&apos;s base PWR (the wheel does not apply to a pillar).</li>
        </ul>

        <h3 className="rules-h3">Deck-building legality</h3>
        <ul className="rules-list">
          <li>A deck is <b>exactly {DECK_SIZE} cards</b>, all one pantheon.</li>
          <li>At most <b>{MAX_MYTHIC_COPIES} Mythic</b> copy and at most <b>{MAX_RARE_COPIES} Rare</b> copies of any single card. Uncommon and Common copies are unlimited.</li>
          <li>No mulligan. What you draw is what you play — every duel is reproducible from its seed.</li>
        </ul>
      </section>

      {/* 4 — ELEMENTAL WHEEL */}
      <section className="container rules-section">
        <span className="eyebrow">04 · The elemental wheel</span>
        <h2 className="rules-h2">Fire eats earth, earth drinks water, water drowns fire</h2>
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
              // pull the arrow short of the node so the arrowhead stays visible
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
                  <tr key={a}><td style={{ color: ELEMENT_COLORS[a] }}>{ELEMENT_LABELS[a]}</td><td style={{ color: ELEMENT_COLORS[b] }}>{ELEMENT_LABELS[b]}</td><td className="mono">+{ELEMENT_ADVANTAGE} PWR</td></tr>
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
      </section>

      {/* 5 — SYNCHRONIES */}
      <section className="container rules-section">
        <span className="eyebrow">05 · Pantheon synergies</span>
        <h2 className="rules-h2">One signature rule per culture</h2>
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
      </section>

      {/* 6 — EXAMPLE ROUND */}
      <section className="container rules-section">
        <span className="eyebrow">06 · Example round</span>
        <h2 className="rules-h2">P1 (Greek) vs P2 (Norse), turns 1–3</h2>
        <div className="rules-transcript avoid-break">
          <p className="faint small">Both Pillars 20 · both start with {STARTING_ESSENCE} essence and {STARTING_HAND} cards. Real cards, real stats.</p>
          <div className="rules-turn">
            <h4>Turn 1 — P1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Hephaestus. <b>Channel</b> +2, plus the Greek synergy <em>First Thunder</em> +1 → <b>5 essence</b>.</li>
              <li><b>Main</b>: summon <b>Danae</b> (Life, PWR 2, GRD 6, cost 4) → essence 1. Danae is sick.</li>
              <li><b>Upkeep</b>. Field: Danae.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 1 — P2 (Norse)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Frigg. <b>Channel</b> +2 → <b>4 essence</b>.</li>
              <li><b>Main</b>: summon <b>Loki</b> (Mind, PWR 4, GRD 3, cost 4) → essence 0. Loki is sick.</li>
              <li><b>Upkeep</b>. Field: Loki.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 2 — P1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Poseidon. <b>Channel</b> +2 → <b>3 essence</b> (Greek synergy is turn-1 only).</li>
              <li>Danae readies. Danae (Life) strikes <b>Loki</b> (Mind): no advantage, so 2 damage vs GRD 3 → Loki survives at <b>2 damage</b>.</li>
              <li><b>Main</b>: no affordable summon (cheapest in hand is 6). <b>Upkeep</b>.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 2 — P2 (Norse)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Muspel (cost 3). <b>Channel</b> +2 → <b>2 essence</b> — still one short of Muspel.</li>
              <li><b>Main</b>: nothing legal. <b>Upkeep</b>. Loki holds at 2 damage.</li>
            </ul>
          </div>
          <div className="rules-turn">
            <h4>Turn 3 — P1 (Greek)</h4>
            <ul className="rules-list">
              <li><b>Draw</b> Demeter. <b>Channel</b> +2 → <b>5 essence</b>.</li>
              <li>Danae strikes Loki: 2 more damage reaches GRD 3 → <b>Loki dies</b> and goes to P2&apos;s discard.</li>
              <li><b>Main</b>: no summon affordable (cheapest 6). P2&apos;s field is now empty — the Pillar is exposed.</li>
            </ul>
          </div>
          <p className="rules-note">The lesson of the example: channel early, respect summoning sickness, and remember that an open field means the Pillar is next.</p>
        </div>
      </section>

      {/* 7 — GLOSSARY */}
      <section className="container rules-section">
        <span className="eyebrow">07 · Glossary</span>
        <h2 className="rules-h2">Words to know</h2>
        <dl className="rules-glossary">
          <div><dt>Essence</dt><dd>The resource used to summon deities and attach relics. Starts at {STARTING_ESSENCE}, gains +{CHANNEL_GAIN} per turn, caps at {ESSENCE_CAP}.</dd></div>
          <div><dt>Channel</dt><dd>The second step of a turn: gain {CHANNEL_GAIN} essence (more for some pantheons).</dd></div>
          <div><dt>Summon</dt><dd>Pay a card&apos;s essence cost to place it from hand onto an empty field slot.</dd></div>
          <div><dt>Strike</dt><dd>Attack with a deity — one per deity per turn, never the turn it arrives.</dd></div>
          <div><dt>Pillar</dt><dd>Your life total. It starts at {PILLAR_HP}; when it reaches 0 you lose.</dd></div>
          <div><dt>Relic</dt><dd>An artifact from the Vault attached to a deity for +{RELIC_PWR} PWR / +{RELIC_GRD} GRD. One per deity.</dd></div>
          <div><dt>Element advantage</dt><dd>+{ELEMENT_ADVANTAGE} PWR when your element beats the defender&apos;s on the wheel.</dd></div>
          <div><dt>Pantheon</dt><dd>Your chosen culture; it sets your deck and your one signature synergy.</dd></div>
          <div><dt>Sickness</dt><dd>Summoning sickness — a deity cannot strike on the turn it arrives.</dd></div>
          <div><dt>Mythic</dt><dd>The rarest tier; at most {MAX_MYTHIC_COPIES} copy of any Mythic card per deck.</dd></div>
        </dl>
      </section>

      {/* 8 — DESIGN CHOICES */}
      <section className="container rules-section">
        <span className="eyebrow">08 · Design choices</span>
        <h2 className="rules-h2">Design choice, not mythology</h2>
        <p className="muted" style={{ maxWidth: 760 }}>
          These numbers are <b>ours</b>. They are tuned for a playable duel and are not claims about
          the historical gods. The only data-derived facts in a card are its name, element, domains,
          rarity, and its interpretive PWR/GRD/essence — which the Atlas already labels as interpretive.
        </p>
        <table className="rules-table rules-table-wide">
          <thead><tr><th>Rule</th><th>Value</th><th>Why (design, not myth)</th></tr></thead>
          <tbody>
            <tr><td>Deck size</td><td className="mono">{DECK_SIZE}</td><td>Lowered from the concept doc&apos;s 30: Slavic ships only 13 cards, so the largest legal single-pantheon deck under the rarity caps is 13 × 2 = 26. {DECK_SIZE} leaves headroom.</td></tr>
            <tr><td>Starting hand</td><td className="mono">{STARTING_HAND}</td><td>Enough opening choice without a long setup.</td></tr>
            <tr><td>Hand limit</td><td className="mono">{HAND_LIMIT}</td><td>Keeps hands flowing; excess is discarded at upkeep.</td></tr>
            <tr><td>Starting essence</td><td className="mono">{STARTING_ESSENCE}</td><td>Lets each player act on turn one.</td></tr>
            <tr><td>Channel / cap</td><td className="mono">+{CHANNEL_GAIN} / {ESSENCE_CAP}</td><td>Essence accumulates, so the late game opens up big primordials.</td></tr>
            <tr><td>Pillar HP</td><td className="mono">{PILLAR_HP}</td><td>A duel lasts roughly 8–14 turns at these power levels.</td></tr>
            <tr><td>Field slots</td><td className="mono">{FIELD_SLOTS}</td><td>Small enough to read at a glance, large enough to matter.</td></tr>
            <tr><td>Element advantage</td><td className="mono">+{ELEMENT_ADVANTAGE} PWR</td><td>Meaningful but never decisive on its own.</td></tr>
            <tr><td>Relic cost / bonus</td><td className="mono">{RELIC_COST} ✦ / +{RELIC_PWR} PWR, +{RELIC_GRD} GRD</td><td>Relics are a light tempo play, reusing Vault artifacts.</td></tr>
            <tr><td>Rarity legality</td><td className="mono">max {MAX_MYTHIC_COPIES} Mythic, {MAX_RARE_COPIES} Rare</td><td>Mirrors the concept doc&apos;s deck-building layer.</td></tr>
            <tr><td>Strikes per deity</td><td className="mono">1 / turn</td><td>Prevents one deity clearing a whole board.</td></tr>
            <tr><td>Combat direction</td><td className="mono">one-sided</td><td>The attacker damages the defender; there is no retaliation step (keeps the math legible).</td></tr>
            <tr><td>Pillar damage</td><td className="mono">base PWR</td><td>The wheel needs an element on both sides; a pillar has none.</td></tr>
            <tr><td>Mulligan</td><td className="mono">none</td><td>Keeps every duel reproducible from its seed.</td></tr>
            <tr><td>Deck-out</td><td className="mono">reshuffle discard</td><td>No fatigue clock; gods keep returning.</td></tr>
            <tr><td>Pantheon synergies</td><td className="mono">6 × one line</td><td>See §5 — each derived from the culture&apos;s own domains.</td></tr>
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
