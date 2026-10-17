// THE DIVINE ATLAS — Relic card engine (Phase 4).
//
// A relic card is a VIEW over an Artifact — never a new source of truth. It
// mirrors app/lib/card.ts: every field is derived deterministically from data
// the site already ships (category, artifact_type, domains, power_profile,
// abilities, description, artwork), so adding a culture = adding its relics for
// free and no claim is invented.
//
// Card stats are INTERPRETIVE (labelled as such on the card + detail callout),
// the same convention as card.ts and the Artifact Vault's tier/rank/power_profile.
// They are derived from the artifact's own power_profile and, where the profile
// cannot be split cleanly, from hash32(id) so they are stable across builds and
// machines.
import { Artifact, ArtifactTier, PowerAttribute, STATUS_LABELS } from './types';
import {
  CardElement, CardRarity, CardStats,
  elementOf, hash32, mulberry, CURRENCY, artSlotPath,
} from './card';
import { artSlotExists, GENERATED_ART_CREDIT } from './art-slot';

// A named ability as shown on the card back (cost/effect = the ability's
// description; the certainty tag mirrors the detail page).
export type RelicAbility = {
  name: string;
  description: string;
  certainty: string;
  source?: string;
};

export interface RelicCard {
  id: string; culture: string; slug: string;
  name: string; native_name?: string;
  type_line: string;        // "RELIC · Hammer · Thunder"
  element: CardElement;     // reuse elementOf(domains) from card.ts
  rarity: CardRarity;       // tier→rarity map below
  stats: CardStats;         // derived from a.power_profile (see below)
  flavor: string;           // description_short (may contain [S#])
  long: string;             // description_long
  symbols: string[]; domains: string[];
  ownerName?: string; creatorName?: string;
  status: string;           // current_status human label
  set_code: string;         // "DA-R-EGY-003" (culture code + index)
  image_url: string | null; // artwork url if present
  image_credit?: string;
  // Card-back content (spec §2 requires these on the reverse plate).
  abilities: RelicAbility[];
  source_count: number;     // how many primary sources support the artifact
}

// tier→rarity (interpretive): minor→common, sacred→uncommon, legendary→rare,
// divine/cosmic/primordial→mythic.
const TIER_RARITY: Record<ArtifactTier, CardRarity> = {
  minor: 'common',
  sacred: 'uncommon',
  legendary: 'rare',
  divine: 'mythic',
  cosmic: 'mythic',
  primordial: 'mythic',
};

// Attribute buckets for the 0–10 power_profile (labels are case-insensitive and
// vary between data files, e.g. "MAGIC" / "Magic").
//
// MAPPING (documented; interpretive):
//   power  = 2 + round(mean of OFFENSE attributes)        → 2–12, same band as card.ts
//   guard  = 1 + round(mean of DEFENSE attributes)         → 1–12 (+clamp), same band
//   essence= card.ts's heft formula (2 + (power+guard)/3) plus a neutral
//            (utility/mobility) term and a cosmic/primordial bonus → 1–11
// When a side has no attributes the value falls back to hash32(id) (mulberry,
// exactly as card.ts seeds its rolls), so a relic and a deity stay comparable.
const OFFENSE = new Set([
  'destruction', 'range', 'control', 'magic', 'divine authority',
  'creation', 'transformation', 'truth',
]);
const DEFENSE = new Set([
  'protection', 'defense', 'durability', 'healing',
]);

function clamp(min: number, max: number, n: number): number {
  return Math.max(min, Math.min(max, n));
}
function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function statsFor(id: string, profile: PowerAttribute[] | undefined, tier: ArtifactTier): CardStats {
  const off: number[] = [], def: number[] = [], neutral: number[] = [];
  for (const p of profile || []) {
    const key = String(p.attribute).toLowerCase();
    if (OFFENSE.has(key)) off.push(p.value);
    else if (DEFENSE.has(key)) def.push(p.value);
    else neutral.push(p.value); // utility / mobility / anything else
  }

  // Seeded fallback, bounded to the same ranges card.ts uses (power 2–12, guard 1–12).
  const rnd = mulberry(hash32(id));
  const fallbackPower = 2 + Math.floor(rnd() * 5); // 2–6 before any bonus
  const fallbackGuard = 1 + Math.floor(rnd() * 5); // 1–5

  const offMean = mean(off);
  const defMean = mean(def);
  const neutralMean = mean(neutral);

  const power = clamp(2, 12, offMean === null ? fallbackPower : 2 + Math.round(offMean));
  const guard = clamp(1, 12, defMean === null ? fallbackGuard : 1 + Math.round(defMean));
  const neutralBonus = neutralMean === null ? 0 : Math.floor(neutralMean / 5); // 0–2
  const tierBonus = tier === 'cosmic' || tier === 'primordial' ? 1 : 0;
  const essence = clamp(1, 11, 2 + Math.floor((power + guard) / 3) + neutralBonus + tierBonus);

  return { power, guard, essence };
}

/** Derive the relic card for one artifact. `index` is the artifact's ordinal within its culture (1-based). */
export function deriveRelicCard(a: Artifact, index: number): RelicCard {
  const domains = a.domains || [];
  const element = elementOf(domains);
  const primaryDomain = domains[0] || 'relic';
  const code = CURRENCY[a.culture] || '???';
  // Phase 6: prefer the deterministic generated-art slot when its PNG exists at
  // build time (this is a build-time loader, so fs is fine). When the slot is
  // missing, keep the existing behaviour — the artifact's archival artwork (and
  // its museum credit), else null → the card face's letter fallback. Generated
  // art gets an honest "generated reconstruction" credit, never an institution.
  const slotUrl = artSlotExists(a.culture, a.id) ? artSlotPath(a.culture, a.id) : null;
  return {
    id: a.id,
    culture: a.culture,
    slug: a.slug,
    name: a.name,
    native_name: a.native_name,
    type_line: `RELIC · ${a.artifact_type} · ${primaryDomain}`,
    element,
    rarity: TIER_RARITY[a.tier] || 'common',
    stats: statsFor(a.id, a.power_profile, a.tier),
    flavor: a.description_short,
    long: a.description_long,
    symbols: a.symbols || [],
    domains,
    ownerName: a.owner_name,
    creatorName: a.creator_name,
    status: STATUS_LABELS[a.current_status] || a.current_status,
    set_code: `DA-R-${code}-${String(index).padStart(3, '0')}`,
    image_url: slotUrl ?? a.artwork?.image_url ?? null,
    image_credit: slotUrl
      ? GENERATED_ART_CREDIT
      : a.artwork
        ? `${a.artwork.title} · ${a.artwork.institution} · ${a.artwork.license}`
        : '',
    abilities: (a.abilities || []).map((ab) => ({
      name: ab.name,
      description: ab.description,
      certainty: ab.certainty,
      source: ab.source,
    })),
    source_count: (a.primary_sources || []).length,
  };
}
