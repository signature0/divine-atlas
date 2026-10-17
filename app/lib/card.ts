// THE DIVINE ATLAS — Deity card engine (ADR-004).
//
// A card is a VIEW over an Entity — never a new source of truth. Every field is
// derived deterministically from data the site already ships (classification,
// domains, symbols, weapons, sources, description), so:
//   • adding a culture = adding a folder of cards for free (DATA-SCHEMA rule 5),
//   • no invented claims (the "no invented claims" gate still applies),
//   • the same function powers the gallery, the profile callout, and the print run.
//
// Card stats are INTERPRETIVE (labelled as such on the card + docs), the same
// convention as the Artifact Vault's tier/rank/power_profile. They are computed
// from a hash of the entity id so they are stable across builds and machines.
import { Entity, Classification } from './types';

export type CardElement =
  | 'light' | 'storm' | 'fire' | 'water' | 'earth' | 'life' | 'death' | 'war' | 'mind' | 'sky' | 'void';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export interface CardStats { power: number; guard: number; essence: number }

export interface DeityCard {
  id: string;            // entity id
  culture: string;
  name: string;
  native_name?: string;
  classification: string;
  element: CardElement;
  type_line: string;     // "DEITY · Storm"
  flavor: string;        // description_short (may contain [S#])
  long: string;          // description_long (card back)
  symbols: string[];
  weapons: string[];
  sacred_objects: string[];
  domains: string[];
  stats: CardStats;      // power / guard / essence (interpretive)
  rarity: CardRarity;
  set_code: string;      // DA-EGY-014
  source_refs: string[]; // [S#] on the card
  hero_artwork_id?: string;
  image_url?: string | null;
  image_credit?: string; // "title · museum · license"
}

// ---- deterministic hashing (stable across builds/machines) ----
export function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// mulberry32 — a tiny deterministic PRNG, seeded so a given entity always rolls
// the same stats.
export function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- element from the god's domains ----
const ELEMENT_RULES: { el: CardElement; re: RegExp }[] = [
  { el: 'storm',  re: /\b(storm|thunder|lightning|wind|weather)\b/i },
  { el: 'fire',   re: /\b(fire|flame|sun|solar|dawn|day|light|heat)\b/i },
  { el: 'water',  re: /\b(water|sea|river|rain|flood|ocean|river|lake|spring|moon)\b/i },
  { el: 'earth',  re: /\b(earth|soil|mountain|stone|land|fertility|harvest|crop|grain|field|agriculture)\b/i },
  { el: 'life',   re: /\b(life|health|healing|growth|fertility|birth|mother|nursing|vitality)\b/i },
  { el: 'death',  re: /\b(dead|death|death|afterlife|underworld|underworld|grave|tomb|decay|fate|destiny|doom)\b/i },
  { el: 'war',    re: /\b(war|battle|warrior|army|military|hunt|hunt|fury|vengeance)\b/i },
  { el: 'mind',   re: /\b(mind|wisdom|knowledge|truth|law|justice|magic|sorcery|craft|trade|cunning|trickery|song|music|poetry|craftsmanship)\b/i },
  { el: 'sky',    re: /\b(sky|celestial|heaven|cosmos|cosmos|stars|constellation|astronomy|time|season)\b/i },
];
export function elementOf(domains: string[]): CardElement {
  for (const d of domains) for (const r of ELEMENT_RULES) if (r.re.test(d)) return r.el;
  return 'void'; // unassigned domains -> the neutral void element
}
export const ELEMENT_LABELS: Record<CardElement, string> = {
  light: 'Light', storm: 'Storm', fire: 'Fire', water: 'Water', earth: 'Earth',
  life: 'Life', death: 'Death', war: 'War', mind: 'Mind', sky: 'Sky', void: 'Void',
};
// A muted, archival palette per element (sits on the dark base, never neon).
export const ELEMENT_COLORS: Record<CardElement, string> = {
  light: '#c8a24a', storm: '#7fa0c0', fire: '#c06a3e', water: '#4f86a6', earth: '#8a9a5b',
  life: '#7fae8b', death: '#9a7f9a', war: '#c0574a', mind: '#b08bd8', sky: '#6f9fc0', void: '#868171',
};

// ---- rarity from classification (interpretive tier) ----
export function rarityOf(c: Classification): CardRarity {
  switch (c) {
    case 'primordial': return 'mythic';
    case 'deity': return 'rare';
    case 'minor deity': return 'uncommon';
    case 'hero': return 'uncommon';
    case 'monster': return 'uncommon';
    case 'spirit': return 'common';
    default: return 'common'; // realm / object / giant / mortal / creature / trickster
  }
}
export const RARITY_LABELS: Record<CardRarity, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', mythic: 'Mythic',
};

// ---- interpretive stats (power / guard / essence), seeded by id ----
function classifyBonus(c: string): number {
  switch (c) {
    case 'primordial': return 3;
    case 'deity': return 2;
    case 'giant': return 1;
    case 'monster': return 0;
    case 'hero': return -1;
    default: return -2;
  }
}
export function statsOf(id: string, c: Classification): CardStats {
  const rnd = mulberry(hash32(id));
  const b = classifyBonus(c);
  const power = Math.max(2, Math.min(12, 4 + Math.floor(rnd() * 5) + b));      // 2–12
  const guard = Math.max(1, Math.min(12, 3 + Math.floor(rnd() * 5) + Math.floor(b / 2)));
  // Essence cost tracks the card's heft: bigger gods cost more to summon.
  const essence = Math.max(1, Math.min(11, 2 + Math.floor((power + guard) / 3) + (c === 'primordial' ? 1 : 0)));
  return { power, guard, essence };
}

export const CURRENCY: Record<string, string> = {
  japanese: 'JPN', greek: 'GRE', norse: 'NOR', egyptian: 'EGY', slavic: 'SLA', mesopotamian: 'MES',
};

/** Derive the card for one entity. `index` is the deity's ordinal within its culture (1-based). */
export function deriveCard(e: Entity, index: number): DeityCard {
  const element = elementOf(e.domains);
  const primaryDomain = e.domains[0] || 'the divine';
  const typeLine = `${e.classification.toUpperCase()} · ${ELEMENT_LABELS[element]}`;
  return {
    id: e.id,
    culture: e.culture,
    name: e.name,
    native_name: e.native_name,
    classification: e.classification,
    element,
    type_line: typeLine,
    flavor: e.description_short,
    long: e.description_long,
    symbols: e.symbols || [],
    weapons: e.weapons || [],
    sacred_objects: e.sacred_objects || [],
    domains: e.domains || [],
    stats: statsOf(e.id, e.classification),
    rarity: rarityOf(e.classification),
    set_code: `DA-${CURRENCY[e.culture] || '???'}-${String(index).padStart(3, '0')}`,
    source_refs: (e.primary_sources || []).map((s) => s.ref),
    hero_artwork_id: e.hero_artwork || e.artworks?.[0],
  };
}
