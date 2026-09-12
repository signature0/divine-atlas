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
  | 'ALLY_OF' | 'ENEMY_OF' | 'RULES' | 'ASSOCIATED_WITH' | 'SUCCESSOR_OF';

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

export type CultureData = {
  culture: string;
  meta: Culture;
  entities: Entity[];
  relationships: Relationship[];
  myths: Myth[];
  cosmology: Cosmology;
  artworks: Artwork[];
  timeline: TimelineEvent[];
  uncertainties: Uncertainty[];
  sources: SourceRef[]; // [S#] -> SourceRef
};

// ---- Explorer edge categories (docs/INFORMATION-ARCHITECTURE.md) ----
export type EdgeCategory = 'family' | 'marriage' | 'creation' | 'conflict' | 'alliance' | 'association';

export const CATEGORY_TYPES: Record<EdgeCategory, RelType[]> = {
  family: ['PARENT_OF', 'CHILD_OF', 'SIBLING_OF'],
  marriage: ['PARTNER_OF'],
  creation: ['CREATED_BY', 'CREATED'],
  conflict: ['KILLED', 'FOUGHT', 'ENEMY_OF'],
  alliance: ['ALLY_OF'],
  association: ['ASSOCIATED_WITH', 'RULES', 'SUCCESSOR_OF'],
};

export const CATEGORY_COLORS: Record<EdgeCategory, string> = {
  family: '#c8a24a',
  marriage: '#c084a8',
  creation: '#7fae8b',
  conflict: '#c0574a',
  alliance: '#6f9fc0',
  association: '#8a8577',
};

export function categoryOf(t: RelType): EdgeCategory {
  for (const [cat, types] of Object.entries(CATEGORY_TYPES) as [EdgeCategory, RelType[]][]) {
    if (types.includes(t)) return cat;
  }
  return 'association';
}

// ---- Global graph (the /graph explorer) ----
/** Data the relationship explorer needs — one culture's CultureData or the global merge. */
export type GraphData = Pick<CultureData, 'entities' | 'relationships' | 'myths' | 'artworks'>;

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
