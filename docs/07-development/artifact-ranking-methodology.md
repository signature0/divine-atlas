# Atlas Classification — Ranking Methodology

> **What this is.** The ATLAS CLASSIFICATION (tier + letter rank) and the
> ATLAS POWER PROFILE (0–10 attributes) are **editorial, interpretive features
> of The Divine Atlas**. They are NOT historical rankings and are NEVER
> presented as statements from the mythological sources. The UI must always
> carry the labels "ATLAS CLASSIFICATION" and "ATLAS POWER PROFILE".

## Why a rank at all
The PO wants a collectible-card feel and a fast "how important is this object"
read, plus a comparison axis. The risk is gamification implying objective
historical power. Mitigations: the labels above, per-attribute source notes,
and `certainty` on every ability.

## Tier (MINOR → PRIMORDIAL) — what it measures
Tiers measure **mythological significance**, not raw destructive output:

| Tier | Meaning | Examples |
|---|---|---|
| MINOR | A single-episode object; no cosmological role | a hero's one-off weapon |
| SACRED | Ritual/enshrined object with continuous cultic life | magatama, amulets |
| LEGENDARY | Central to one major hero-cycle or divine cycle | Gungnir, the Golden Fleece |
| DIVINE | Belongs to / defines a major deity's identity across many myths | Mjölnir, the Aegis |
| COSMIC | Its fate affects the structure or ending of the cosmos | Draupnir (recreation), the solar barque, Tablets of Destiny |
| PRIMORDIAL | Exists at (or before) creation; creation itself depends on it | Ame-no-Nuboko, the me |

## Letter rank (C → EX) — the compact visual rank
Letter rank = tier mapped to a card-rank scale, with one notch of adjustment
for **versatility** (number of distinct mythic functions demonstrated):

- C = MINOR, B = SACRED, A = LEGENDARY, S = DIVINE, SS = COSMIC, EX = PRIMORDIAL.
- An artifact may earn +0/+1 notch within its tier for exceptional versatility
  (e.g. an object that is simultaneously weapon, regalia, and creation tool),
  but may NOT cross a tier boundary. The adjustment and its justification are
  recorded in the artifact's `uncertainty_notes` ("rank adjustment: …").

## Power profile attributes (0–10)
Only attributes that genuinely apply are shown (3–7 per artifact):
DESTRUCTION, DEFENSE, CREATION, HEALING, PROTECTION, DIVINE_AUTHORITY, MAGIC,
RANGE, DURABILITY, MOBILITY, TRANSFORMATION, CONTROL, UTILITY.

Scoring rubric (each score must have a one-line source-grounded `note`):
- **10** — the sources describe this as absolute/never-failing for this
  attribute ("no surviving myth describes it being broken" = DURABILITY 10).
- **7–9** — repeatedly demonstrated across multiple independent episodes.
- **4–6** — demonstrated in a single well-attested episode, or implied.
- **1–3** — weakly implied or contested.
- **0 / omitted** — not applicable or never attested.

Hard rules:
1. No score may rest on a single modern retelling without an ancient source.
2. Ratings do not make objects "stronger" than gods — the profile describes
   the *object's* mythic role only.
3. When sources are fragmentary (Slavic), the profile is shorter and the
   artifact's `source_confidence` (LOW) is displayed prominently.

## What is NOT ranked
- Popularity. An obscure but cosmologically central object outranks a famous
  one with a single episode (e.g. Ame-no-Nuboko is EX-tier while a famous
  hero's sword is A-tier).
- Cultural prestige. No tradition is ranked above another; ranks are
  per-object within the whole corpus.
