// THE DIVINE ATLAS — data types (mirrors docs/DATA-SCHEMA.md)
export type Classification =
  | 'primordial' | 'deity' | 'minor deity' | 'spirit'
  | 'monster' | 'hero' | 'realm' | 'object';

export type SourceRef = {
  type: string;
  name: string;
  date?: string;
  ref: string; // 'S1'
  url?: string | null;
};

export type Entity = {
  id: string;
  culture: string;
  name: string;
  native_name?: string;
  alternative_names?: string[];
  classification: Classification;
  gender?: string;
  domains: string[];
  symbols?: string[];
  animals?: string[];
  weapons?: string[];
  sacred_objects?: string[];
  parents?: string[];
  siblings?: string[];
  partners?: string[];
  children?: string[];
  allies?: string[];
  enemies?: string[];
  associated_realms?: string[];
  associated_places?: string[];
  major_myths?: string[];
  primary_sources?: SourceRef[];
  artworks?: string[];
  evidence_status?: string; // slavic: attested / attested (folk) / reconstructed
  description_short: string;
  description_long: string;
  interesting_facts?: string[];
  uncertainty_notes?: string[];
  hero_artwork?: string;
};

export type RelType =
  | 'PARENT_OF' | 'CHILD_OF' | 'SIBLING_OF' | 'PARTNER_OF'
  | 'CREATED_BY' | 'CREATED' | 'KILLED' | 'FOUGHT'
  | 'ALLY_OF' | 'ENEMY_OF' | 'RULES' | 'ASSOCIATED_WITH' | 'SUCCESSOR_OF'
  // Artifact relations (ADR-002). Direction: from -> to.
  | 'OWNS' | 'FORGED' | 'FOUND' | 'STOLE' | 'GIFTED' | 'INHERITED'
  | 'USED' | 'DESTROYED' | 'SEALED' | 'CONTAINS' | 'PROTECTS' | 'UNLOCKS' | 'CONTROLS';

export type Confidence = 'attested' | 'disputed' | 'reconstructed';

export type Relationship = {
  from: string;
  to: string;
  type: RelType;
  note: string;
  confidence: Confidence;
  sources: string[];
  explanation?: string;
};

export type MythChapter = { heading: string; body: string };
export type MythVariant = { name: string; description: string };

export type Myth = {
  id: string;
  culture: string;
  title: string;
  summary: string;
  chapters?: MythChapter[];
  variants?: MythVariant[];
  participants: string[];
  primary_sources: string[];
  uncertainty_notes?: string;
  art?: string[];
};

export type Realm = {
  id: string;
  name: string;
  native_name?: string;
  description: string;
  entities: string[];
  // rect (x,y,w,h) for box layouts, or circle (x,y,r) for realm bubbles.
  // x/y are 0–100 for rect data, 0–1 for circle data (component normalizes).
  layout?: { x: number; y: number; w?: number; h?: number; r?: number };
};

export type CreationTradition = {
  id: string;
  name: string;
  realms?: Realm[];
  notes: string;
  sequence?: string[]; // ordered entity ids
};

export type Cosmology = {
  realms?: Realm[];
  structure_notes?: string;
  traditions?: CreationTradition[];
};

export type Artwork = {
  id: string;
  culture: string;
  title: string;
  artist: string;
  date: string;
  museum: string;
  medium: string;
  license: string;
  source_url: string;
  image_url?: string | null;
  subject: string;
  description: string;
  copyright_notes: string;
  attribution?: string;
  alt: string;
};

export type TimelineEvent = {
  year_label: string;
  sort_year: number;
  kind: string;
  label: string;
  description: string;
  sources: string[];
};

export type Uncertainty = {
  id?: string;
  topic: string;
  question?: string;
  description: string;
  positions?: { name: string; description: string; support?: string }[];
  how_we_present_it?: string;
};

export type Culture = {
  id: string;
  name: string;
  native_label?: string;
  framing: string;
  framing_note: string;
  palette: { accent: string; accent2: string; bg: string; surface: string; ink: string };
  region: { label: string; map: { x: number; y: number; w: number; h: number } };
  period: string;
  status: 'active' | 'coming soon';
  primary_sources_summary: string[];
};

// ---- Artifact system (ADR-002) ----
export type ArtifactCategory =
  | 'weapon' | 'armor' | 'jewelry' | 'clothing' | 'sacred_object'
  | 'tool' | 'regalia' | 'vehicle' | 'vessel' | 'instrument'
  | 'magical_object' | 'book' | 'stone' | 'other';

export type ArtifactTier = 'minor' | 'sacred' | 'legendary' | 'divine' | 'cosmic' | 'primordial';
export type CompactRank = 'C' | 'B' | 'A' | 'S' | 'SS' | 'EX';
export type SourceConfidence = 'high' | 'medium' | 'low';
export type AbilityCertainty = 'attested' | 'likely' | 'later_tradition' | 'modern_interpretation' | 'uncertain';
export type ArtifactStatus = 'preserved' | 'hidden' | 'lost' | 'destroyed' | 'in_use' | 'unknown';

export type PowerAttribute = {
  attribute: string;      // DESTRUCTION, DEFENSE, CREATION, ... (uppercase label)
  value: number;          // 0–10 (interpretive, Atlas scale)
  explanation: string;    // WHY this score — the interpretive justification
};

export type ArtifactAbility = {
  name: string;           // e.g. "RETURNING WEAPON"
  description: string;
  source?: string;        // free-text pointer, e.g. "Prose Edda, Gylfaginning 28"
  certainty: AbilityCertainty;
};

export type ArtifactArtworkRef = {
  title: string;
  artist?: string;
  date: string;
  institution: string;
  license: string;
  image_url: string | null;
  image_type: 'ARCHAEOLOGICAL' | 'HISTORICAL ART' | 'SCULPTURE' | 'MANUSCRIPT' | 'MODERN RECONSTRUCTION' | 'MODERN ART' | 'TYPE-PROXY';
  // How this image relates to the artifact (what the user is actually looking at).
  // e.g. "The hammer itself does not survive; this is a 12th-century depiction of Thor
  // brandishing Mjölnir (Gosforth Cross)."
  depicts: string;
  copyright_status: string;
};

export type Artifact = {
  id: string;             // e.g. 'nor-mjolnir' (culture-prefixed, graph node id)
  slug: string;           // URL segment, e.g. 'mjolnir'
  culture: string;
  name: string;
  native_name?: string;
  alternative_names?: string[];
  category: ArtifactCategory;
  artifact_type: string;  // human label, e.g. "Hammer", "Sword"
  domains: string[];      // e.g. ['Thunder', 'Protection', 'Consecration']
  owner?: string;         // entity id (deity/hero) or free text if no entity
  owner_name?: string;    // display name (resolved or as-given)
  creator?: string;       // entity id or free text (e.g. "Brokkr / Sindri")
  creator_name?: string;
  previous_owners?: string[];
  associated_deities?: string[];  // entity ids
  associated_heroes?: string[];   // entity ids
  associated_monsters?: string[]; // entity ids
  material?: string;
  appearance?: string;
  symbols?: string[];
  limitations?: string[];
  creation_story?: string;   // may contain [S#] markers
  origin_story?: string;
  major_myths?: string[];    // myth ids
  associated_realms?: string[];
  current_status: ArtifactStatus;
  status_note?: string;
  primary_sources?: SourceRef[];
  source_confidence: SourceConfidence;
  confidence_note?: string;
  // Atlas classification (INTERPRETIVE — never stated as historical fact)
  tier: ArtifactTier;
  rank: CompactRank;
  tier_rationale?: string;   // why this tier, per the documented methodology
  power_profile: PowerAttribute[];
  abilities: ArtifactAbility[];
  // Visual (every artifact MUST have a dominant image)
  artwork: ArtifactArtworkRef;
  gallery?: ArtifactArtworkRef[];
  description_short: string; // card teaser (may contain [S#])
  description_long: string;  // detail-page overview (may contain [S#])
  interesting_facts?: string[];
  uncertainty_notes?: string[];
};

export type ArtifactCollection = {
  id: string;
  name: string;
  tagline: string;
  filter: {
    categories?: ArtifactCategory[];
    tier_min?: number;      // tier ordinal (0..5)
    status?: ArtifactStatus[];
    domains?: string[];     // any-of
    power_min?: { attribute: string; value: number }[];
    ids?: string[];         // explicit allowlist (curated collections)
  };
};

export type CultureData = {
  culture: string;
  meta: Culture;
  entities: Entity[];
  relationships: Relationship[];
  myths: Myth[];
  cosmology: Cosmology;
  artworks: Artwork[];
  artifacts: Artifact[];
  timeline: TimelineEvent[];
  uncertainties: Uncertainty[];
  sources: SourceRef[]; // [S#] -> SourceRef
};

// ---- Explorer edge categories (docs/INFORMATION-ARCHITECTURE.md) ----
export type EdgeCategory = 'family' | 'marriage' | 'creation' | 'conflict' | 'alliance' | 'association' | 'artifact';

export const CATEGORY_TYPES: Record<EdgeCategory, RelType[]> = {
  family: ['PARENT_OF', 'CHILD_OF', 'SIBLING_OF'],
  marriage: ['PARTNER_OF'],
  creation: ['CREATED_BY', 'CREATED'],
  conflict: ['KILLED', 'FOUGHT', 'ENEMY_OF'],
  alliance: ['ALLY_OF'],
  association: ['ASSOCIATED_WITH', 'RULES', 'SUCCESSOR_OF'],
  artifact: ['OWNS', 'FORGED', 'FOUND', 'STOLE', 'GIFTED', 'INHERITED',
    'USED', 'DESTROYED', 'SEALED', 'CONTAINS', 'PROTECTS', 'UNLOCKS', 'CONTROLS'],
};

export const CATEGORY_COLORS: Record<EdgeCategory, string> = {
  family: '#c8a24a',
  marriage: '#c084a8',
  creation: '#7fae8b',
  conflict: '#c0574a',
  alliance: '#6f9fc0',
  association: '#8a8577',
  artifact: '#b08bd8',
};

export function categoryOf(t: RelType): EdgeCategory {
  for (const [cat, types] of Object.entries(CATEGORY_TYPES) as [EdgeCategory, RelType[]][]) {
    if (types.includes(t)) return cat;
  }
  return 'association';
}

// ---- Global graph (the /graph explorer) ----
/** Data the relationship explorer needs — one culture's CultureData or the global merge. */
export type GraphData = Pick<CultureData, 'entities' | 'relationships' | 'myths' | 'artworks' | 'artifacts'>;

// Display names + palette accents for the live traditions (docs/DESIGN-SYSTEM.md
// per-culture palettes; keep in sync with data/cultures.json).
export const CULTURE_NAMES: Record<string, string> = {
  japanese: 'Japanese', greek: 'Greek', norse: 'Norse',
  egyptian: 'Egyptian', slavic: 'Slavic', mesopotamian: 'Mesopotamian',
};
export const CULTURE_ACCENTS: Record<string, string> = {
  japanese: '#c0392b', greek: '#c9a227', norse: '#5b8db8',
  egyptian: '#c8a24a', slavic: '#8a9a5b', mesopotamian: '#3f7ca6',
};

// ---- Artifact classification (INTERPRETIVE Atlas feature, not historical fact) ----
// Ordinal scale for "tier_min" filters and rank ordering.
export const TIER_ORDER: Record<ArtifactTier, number> = {
  minor: 0, sacred: 1, legendary: 2, divine: 3, cosmic: 4, primordial: 5,
};
export const TIER_LABELS: Record<ArtifactTier, string> = {
  minor: 'Minor', sacred: 'Sacred', legendary: 'Legendary',
  divine: 'Divine', cosmic: 'Cosmic', primordial: 'Primordial',
};
export const RANK_ORDER: Record<CompactRank, number> = { C: 0, B: 1, A: 2, S: 3, SS: 4, EX: 5 };
export const CATEGORY_LABELS: Record<ArtifactCategory, string> = {
  weapon: 'Weapon', armor: 'Armor', jewelry: 'Jewelry', clothing: 'Clothing',
  sacred_object: 'Sacred Object', tool: 'Tool', regalia: 'Regalia', vehicle: 'Vehicle',
  vessel: 'Vessel', instrument: 'Musical Instrument', magical_object: 'Magical Object',
  book: 'Book', stone: 'Sacred Stone', other: 'Object',
};
export const CONFIDENCE_LABELS: Record<SourceConfidence, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
};
export const CONFIDENCE_NOTES: Record<SourceConfidence, string> = {
  high: 'Multiple early textual or archaeological sources.',
  medium: 'Supported, but dependent on fewer or later sources.',
  low: 'Fragmentary evidence or reconstructed tradition.',
};
export const STATUS_LABELS: Record<ArtifactStatus, string> = {
  preserved: 'Preserved', hidden: 'Hidden', lost: 'Lost',
  destroyed: 'Destroyed', in_use: 'In use', unknown: 'Unknown',
};
