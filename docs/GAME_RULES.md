# Pantheon — Game Rules (v2, 2–4 players)

*The complete, as-shipped rules for **Pantheon**, the Divine Atlas card game. This document is the source text the Phase-7 rules booklet will render. The digital rules page is `/how-to-play`; the printable mat is `/how-to-play/board`; the hot-seat engine is `app/lib/pantheon.ts`.*

---

## 1. Goal

Be the **last seat whose Cosmic Pillar still stands**. You channel one pantheon, summon its gods from a 24-card deck, and strike at the Pillars of every other seat. When a Pillar reaches **0**, that seat is **eliminated**; the game ends the instant only one seat remains.

Pantheon is a **free-for-all** for **2, 3 or 4 players**. There are no teams and no alliances encoded in the rules — every other seat is a legal enemy target on every strike.

---

## 2. Components

- **A pantheon deck** per seat: 24 cards, all from one culture (see §6).
- **A Cosmic Pillar** per seat: a life total of **20** (2–3 players) or **24** (4 players).
- **Essence**: the summoning currency, tracked 0–12 per seat.
- **Field slots**: **3** per seat, holding summoned deities.
- **Relics**: artifacts from the Atlas Vault; each deity may carry at most one.

Everything is derived from data the Atlas already ships. Card **names, elements, domains, classifications, rarity and source citations** come from the verified entity profiles; the **numbers** (PWR / GRD / essence) are an interpretive game layer and are labelled as such (§5).

---

## 3. Setup

1. Choose the number of seats: **2, 3 or 4** (default 2).
2. Each seat picks **one pantheon** (Japanese, Greek, Norse, Egyptian, Slavic or Mesopotamian) and shuffles its 24-card deck.
3. Each seat places its Pillar at its starting value: **20 HP** (2–3 seats) or **24 HP** (4 seats).
4. Each seat draws a **starting hand of 5** cards and begins with **2 essence**.
5. Seat 1 takes the first turn; play proceeds in **cyclic seat order** (Seat 1 → Seat 2 → … → Seat 1), skipping eliminated seats.
6. There is **no mulligan**: what the shuffle gives you is what you play. This is what makes a game reproducible from its seed.

A game is fully deterministic. Given the same **seed, seat cultures, player count and action sequence**, the engine produces byte-identical state (used by `scripts/enginetest.ts` and undo).

---

## 4. Turn structure

A turn has four steps, in this exact order.

### 4.1 Draw
Draw 1 card from the top of your deck. If your deck is empty, **shuffle your discard pile into a new deck** and continue. If both deck and discard are empty, you simply draw nothing. You must draw before you may take any main-phase action.

### 4.2 Channel
Gain essence, capped at **12**:

| Seats | Turns 1–2 | Turns 3–4 | Turn 5+ |
|---|---|---|---|
| **2** | +2 | +2 | +2 |
| **3–4** | +2 | +3 | +4 |

The 3–4 player ramp counts **the seat's own turns taken**, not the global turn counter (see §9).

The Greek pantheon's *First Thunder* synergy adds **+1** on the seat's **first** Channel only.

### 4.3 Main
In any order, any number of times:

- **Summon** — pay a card's essence cost and place it from your hand into an **empty** field slot. The deity enters **sick** (summoning sickness): it cannot strike this turn. It may be used as an **interceptor** while sick.
- **Attach a relic** — a deity with no relic may receive **one** relic that *belongs to that deity*. Cost: **1 essence** (0 for Egyptian, *Offering to the Gods*). Effect: **+1 PWR, +1 GRD**. Each relic may be used **once per seat**.
- **Strike** — one strike per ready deity per turn. Choose **any living enemy seat**, then either:
  - **a deity of that seat**: damage is the attacker's PWR, **+2** if the attacker's element beats the defender's on the wheel (§7). Damage **accumulates** on the defender; at `damage ≥ GRD` the deity dies and goes to its owner's discard.
  - **that seat's Pillar**: the defending seat may choose one of **their own** deities to **intercept**. If they do, resolve the hit against that deity exactly as above. If they do not, the Pillar loses the attacker's **base PWR** (the wheel does **not** apply — a Pillar has no element).

A deity that arrives this turn cannot strike. A deity may strike at most once per turn. Combat is **one-sided**: the attacker deals damage; there is no retaliation step.

### 4.4 Upkeep
Discard down to a hand of **7** (discard from the newest end). Then ready your deities — summoning sickness clears and each may strike again on your next turn — and pass the turn to the **next living seat**. Your essence **carries over**; it is not spent down between turns.

---

## 5. Card types and stat derivation

Each culture's pool is its own deck. Cards fall into interpretive **rarity tiers**, which govern deck-building legality:

| Rarity | Classification source | Max copies per deck |
|---|---|---|
| **Mythic** | primordial | 1 |
| **Rare** | deity | 2 |
| **Uncommon** | minor deity, hero, monster | 2 |
| **Common** | spirit, realm, object, giant, mortal, creature, trickster | 2 |

**Stats are design, not mythology.** PWR, GRD and essence are computed deterministically from a hash of the entity id plus a small classification bonus (`app/lib/card.ts`, `statsOf`):

- **PWR** = 4–12, higher for primordials and deities.
- **GRD** = 1–12, roughly half the classification bonus.
- **Essence cost** = derived from `(PWR + GRD) / 3`, plus 1 for primordials.

**Element** is derived from the god's **domains** by keyword (`elementOf`): storm, fire, water, earth, life, death, war, mind, sky — anything unmatched is the neutral **void**. *The numbers are ours; the names, elements, domains and sources are the Atlas's.*

---

## 6. Deck-building legality

- A deck is **exactly 24 cards**, all from **one** pantheon.
- At most **1 Mythic** and at most **2 Rare** copies of any single card. Uncommon and Common copies are unlimited.
- No cross-pantheon cards. No mulligan.

The 24-card size (rather than the concept doc's 30) is deliberate: the Slavic pantheon ships only 13 cards, so the largest legal single-pantheon deck under the rarity caps is 13 × 2 = 26. 24 leaves headroom for every culture.

---

## 7. The elemental wheel

Five directed advantages, each granting **+2 PWR** when the attacker's element beats the defender's:

| Attacker | Beats |
|---|---|
| Fire | Earth |
| Earth | Water |
| Water | Fire |
| Storm | Life |
| Mind | War |

**Light, Death, Sky and Void are neutral**: they neither gain nor grant an advantage. The wheel applies **only when a deity is the target**; Pillar damage is always the attacker's base PWR.

---

## 8. Pantheon synergies

Each pantheon has exactly one signature rule, active for the whole game. Every line is derived from domains its gods actually carry in the data.

| Pantheon | Ability | Effect | Data rationale |
|---|---|---|---|
| **Greek** | *First Thunder* | On your first Channel, gain +1 essence. | Zeus (Sky; sky/thunder/kingship) — a first-move advantage. |
| **Norse** | *Einherjar Vigil* | Your deities whose domains include **war** or **death** get +1 GRD. | Odin and Tyr carry war; Odin and Hel carry death — the slain are the host. |
| **Japanese** | *Radiance of Heaven* | Your deities whose domains include **sky, sun, light or heaven** get +1 PWR. | Amaterasu (sun) and Amenominakanushi (high heaven). |
| **Egyptian** | *Offering to the Gods* | Attaching a relic costs 1 less essence (minimum 0). | Temple economy: offerings are the currency of the cult. |
| **Slavic** | *Damp Mother Earth* | Your deities whose domains include **fertility, earth, nature or spring** get +1 GRD. | Mokosh (fertility/earth) and Lada/Jarilo (spring/fertility). |
| **Mesopotamian** | *Primordial Tide* | Your **primordial (Mythic)** deities cost 1 less essence to summon (minimum 1). | Apsu, Tiamat and Ki are the elder powers. |

---

## 9. Player-count differences and balance notes

The 2-player game is the tuned baseline and is preserved byte-for-byte from the original release. Free-for-all adds two levers.

### 9.1 Pillar HP scaling

| Seats | Pillar HP |
|---|---|
| 2 | 20 |
| 3 | 20 |
| 4 | 24 |

**Rationale:** in a 4-player game three opponents can aim strikes at the same Pillar, so it must absorb roughly one extra round of damage; 20 HP would fall too fast. Three-player games keep 20 HP because the pressure is only slightly higher than a duel. The values stay deliberately simple and are configurable in code (`PILLAR_HP_BY_PLAYERS`).

### 9.2 Essence ramp (3–4 players)

The Channel gain ramps by the **seat's own** turns taken: **+2** (turns 1–2), **+3** (turns 3–4), **+4** (turn 5+), capped at 12. The **2-player game stays a flat +2**.

**Rationale:** with three or four decks in play, a table can stall on the opening 2-essence curve — nobody can summon the gods they need while the board stays small. Ramping the active seat's income accelerates the mid-game without changing the 2-player balance. Counting the seat's **own** turns (rather than the global turn counter) means every seat ramps at the same personal pace regardless of how many seats are eliminated.

### 9.3 Elimination and turn order

When a seat's Pillar hits 0 it is **eliminated** immediately: its field deities are **banished** (removed from play), its hand is **discarded**, and it takes no further turns. Turn order continues cyclically, skipping eliminated seats. The game ends the moment one seat remains; the survivor wins.

Turn order matters in free-for-all: attacks may come from any direction, and removing one opponent can hand the initiative to another. There is no "last hit" scoring — only the survivor is the winner.

---

## 10. Win conditions

- A seat is **eliminated** the moment its Pillar reaches **0** or below.
- The game **ends immediately** when only **one** seat remains; that seat **wins**.
- Ties are impossible: Pillars are reduced one strike at a time, and a single strike can eliminate at most one seat.

In a 2-player game this is simply "reduce the opponent's Pillar to 0".

---

## 11. Reproducibility, undo and hot-seat privacy

- **Seeded and pure.** The engine (`app/lib/pantheon.ts`) uses one `mulberry32` PRNG seeded from the game seed, an in-state UID counter, and **no** `Math.random`, `Date.now`, React or I/O. Same seed + seats + actions ⇒ byte-identical state.
- **Undo** replays the action log minus its last entry.
- **Hot-seat privacy (digital):** only the active seat's hand is shown; other seats' hands are collapsed with a press-and-hold peek, and a "Hide hands" curtain covers the table while the device is passed.
- **Share string:** a game can be shared as `?seed=<n>&players=<2|3|4>&cultures=<list>`, which restores the exact setup.

---

## 12. Glossary

**Banish** — remove a seat's field deities from play when it is eliminated.
**Channel** — the turn's essence step.
**Domain** — mythic concepts a deity carries; they drive synergies and (for element) the card's element.
**Element bonus** — +2 PWR when the attacker's element beats the defender's.
**Elimination** — reducing a seat's Pillar to 0; the seat leaves the game.
**Essence** — the summoning currency (start 2, cap 12).
**Free-for-all** — every seat is its own side; any living enemy is a legal target.
**Intercept** — blocking a Pillar strike with one of your own deities.
**Mythic** — the rarest tier (primordial), 1 copy per deck.
**Pillar** — a seat's life total.
**Relic** — a Vault artifact attached to a deity for +1 PWR / +1 GRD.
**Sickness** — summoning sickness; a deity cannot strike the turn it arrives.
**Synergy** — a pantheon's one signature rule.
**Void / neutral elements** — Light, Death, Sky, Void: no wheel advantage.

---

## 13. Design-choice disclaimer

Every number in this rulebook — Pillar HP, deck size, hand limit, essence gains and the ramp, PWR/GRD/essence derivation, relic bonuses and player-count scaling — is a **design choice for a playable game**, not a claim about history or mythology. Names, elements, domains, classifications, rarity tiers and source citations are drawn from the Atlas's verified data. The numbers exist to make the gods playable, and are labelled as interpretive everywhere they appear.
