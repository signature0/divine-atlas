# THE DIVINE ATLAS — DATA SCHEMA & ARCHITECTURE
Phase 3 document. How mythology content is structured, stored, and consumed.

## Principles
1. **Content is data, not code.** All mythology lives in `/data/<culture>/*.json`. Presentation never hardcodes a god, a myth, or a source.
2. **Graph-first.** Entities are nodes; relationships are typed edges. "Family tree" is a *view* over the graph (kinship edge filter), not the model.
3. **Variant-preserving.** Conflicts are data: `uncertainty_notes`, `variants` on myths, `confidence` + `explanation` on edges. We never silently pick one version.
4. **Sourced by default.** Every nontrivial claim carries `[S#]` markers in text fields that resolve to `sources.md` per culture. The bibliography is rendered at runtime, not copy-pasted.
5. **Add a culture by adding a folder.** `/data/<culture>/` + one entry in `cultures.json`. No migrations, no schema changes (v1).

## Repository layout (v1)
```
divine-atlas/
  app/                      # Next.js App Router (presentation only)
    (routes per INFORMATION-ARCHITECTURE.md)
    components/             # shared components (see DESIGN-SYSTEM.md)
    lib/
      data.ts               # loads /data into typed structures, builds indexes
      graph.ts              # graph queries: neighbors(n, edgeTypes, depth), ancestors, descendants
      search.ts             # inverted index over entities/myths (domains, symbols, names)
      compare.ts            # comparison verdicts logic
  data/
    cultures.json           # culture registry (id, name, framing, palette ref, region, status)
    japanese/
      meta.json             # culture-specific: framing banner, genealogy layers, archetype weights
      entities.json         # Entity[]
      relationships.json    # Relationship[]
      myths.json            # Myth[]
      cosmology.json        # Cosmology
      artworks.json         # Artwork[]
      timeline.json         # TimelineEvent[]
      uncertainties.json    # Uncertainty[]
      sources.md            # [S1]..[Sn] bibliography
    greek/ … norse/ … egyptian/ … slavic/ … mesopotamian/
  research/                 # Phase-1 research provenance (same 8 files, pre-integration)
  public/assets/…           # local image copies for verified PD artworks (mirrors)
  docs/                     # these documents
```

Note on `research/` vs `data/`: Phase 1 writes to `research/` (the inspection trail — how conclusions were reached, per Senpai's requirement). Integration copies/refines into `data/` (the app's canonical input). `research/` is never deleted; it is the audit trail.

## Entity schema
```ts
type Entity = {
  id: string;                    // "jpn-amaterasu" — culture-prefixed, kebab-case
  culture: string;               // "japanese"
  name: string;                  // "Amaterasu"
  native_name?: string;          // "天照大御神"
  alternative_names?: string[];
  classification: "primordial" | "deity" | "minor deity" | "spirit" |
                  "monster" | "hero" | "realm" | "object";
  gender?: "male" | "female" | "androgynous" | "nonbinary" | "none" | "unknown";
  domains: string[];             // normalized: "sky", "sun", "storm", "death", …
  symbols?: string[];
  animals?: string[];
  weapons?: string[];
  sacred_objects?: string[];
  // graph edges (denormalized for cheap reads; relationships.json is the source of truth
  // for typed/annotated edges — both are generated to stay consistent)
  parents?: string[]; siblings?: string[]; partners?: string[]; children?: string[];
  allies?: string[]; enemies?: string[];
  associated_realms?: string[];  // realm ids from cosmology.json
  associated_places?: string[];
  major_myths?: string[];        // myth ids
  primary_sources?: SourceRef[];
  artworks?: string[];           // artwork ids
  description_short: string;     // ≤3 sentences, may contain [S#]
  description_long: string;      // 8–15 sentences, [S#] inline
  interesting_facts?: string[];
  uncertainty_notes?: string[];  // variant parentage etc., reader-facing
  hero_artwork?: string;         // artwork id used on the profile hero
};

type SourceRef = {
  type: "text" | "relief" | "seal" | "inscription" | "manuscript" | "archaeological";
  name: string;
  date?: string;
  ref: string;                   // "S12" → resolves in sources.md
  url?: string | null;
};
```

## Relationship schema (the graph)
```ts
type RelType =
  | "PARENT_OF" | "SIBLING_OF" | "PARTNER_OF"
  | "CREATED_BY" | "CREATED" | "KILLED" | "FOUGHT"
  | "ALLY_OF" | "ENEMY_OF" | "RULES" | "ASSOCIATED_WITH" | "SUCCESSOR_OF";

type Relationship = {
  from: string; to: string;      // entity ids (directed; UI renders direction)
  type: RelType;
  note: string;                  // one-line, shown on hover
  confidence: "attested" | "disputed" | "reconstructed";
  sources: string[];             // ["S3", "S7"]
  explanation?: string;          // for disputed: the variant(s), reader-facing
};
```
Edge semantics:
- `PARENT_OF` is directed (parent→child); `SIBLING_OF`/`PARTNER_OF`/`ALLY_OF`/`ENEMY_OF` are treated as symmetric in the graph index (stored once).
- `CREATED_BY`/`CREATED` distinguish "X created Y" from "Y was created by X" (e.g., Marduk created the world from Tiamat's body: `MARDUK CREATED world`, `world CREATED_BY MARDUK`, plus `MARDUK FOUGHT TIAMAT`, `MARDUK KILLED TIAMAT`).
- `confidence` drives UI: `attested` = solid line, `disputed` = dashed + ⚠ on hover, `reconstructed` = dotted + "scholarly reconstruction" badge (critical for Slavic).
- Cross-culture edges are allowed but must be marked `confidence: "reconstructed"` unless attested (e.g., Inanna→Ishtar is a documented continuity, `attested` with sources).

## Myth schema
```ts
type Myth = {
  id: string; culture: string;
  title: string;
  summary: string;               // 4–8 sentences, [S#] inline
  chapters?: { heading: string; body: string }[];  // story-mode structure; [S#] inline
  variants?: { name: string; description: string }[];
  participants: string[];        // entity ids
  primary_sources: string[];     // ["S1","S2"]
  uncertainty_notes?: string;
  art?: string[];                // artwork ids illustrating it
};
```

## Cosmology schema
```ts
type Cosmology = {
  realms: Realm[];
  structure_notes: string;       // incl. "this is a reconstruction" where true
  traditions?: { id: string; name: string; realms: Realm[]; notes: string }[];
  // ^ Egyptian: multiple parallel traditions instead of one `realms` list
};
type Realm = {
  id: string; name: string; native_name?: string;
  description: string;           // [S#]
  entities: string[];
  layout: { x: number; y: number; w: number; h: number };  // 0–100 canvas coords
};
```

## Artwork schema
```ts
type Artwork = {
  id: string; culture: string;
  title: string; artist: string; date: string;
  museum: string; medium: string;
  license: "public domain" | "CC0" | "CC-BY (specify)" | "open access program";
  source_url: string;            // VERIFIED page
  image_url?: string | null;     // direct file URL if available
  subject: string;               // which deity/myth
  description: string;
  copyright_notes: string;       // why PD / license terms
  alt: string;                   // accessibility text
};
```
Images: prefer remote `image_url` from open-access programs (Met CDN, Rijks, etc.); fall back to `source_url` as a link. Local mirrors in `public/assets/` only when remote licensing is ambiguous — never scrape.

## Timeline schema
```ts
type TimelineEvent = {
  year_label: string; sort_year: number;   // negative = BCE
  kind: "civilization" | "text" | "archaeological" | "manuscript" | "modern_recording";
  label: string; description: string;      // [S#]
  sources: string[];
};
```
The global timeline merges all cultures, sorted by `sort_year`, with kind-based color coding and the standing callout: *"The date of a source is not the date of the myth it preserves."*

## Culture registry (`cultures.json`)
```ts
type Culture = {
  id: string;                    // "japanese"
  name: string; native_label?: string;    // "日本神話"
  framing: "historical mythology" | "living religious tradition" |
           "reconstructed tradition" | "historical religion";
  framing_note: string;          // the banner text shown on the culture landing
  palette: { accent: string; accent2: string; bg: string; surface: string; ink: string };
  region: { label: string; map: { x: number; y: number; w: number; h: number } };  // world-map coords
  period: string;                // "c. 3000 BCE – present"
  status: "active" | "coming soon";
  primary_sources_summary: string[];
};
```
Coming-soon entries (Celtic, Chinese, Hindu, Aztec, Maya, Polynesian, Roman, Finnish, Persian, West African, Arabian) live here with `status: "coming soon"` so the expansion path is visible and the registry is the single switch that activates them.

## Derived indexes (built at build time in `lib/data.ts`)
- `byId: Map<id, Entity>`
- `graph: adjacency map (node → {out: Rel[], in: Rel[]})`
- `searchIndex: { terms → {entities, myths, realms} }` over names, alternative_names, domains, symbols, animals, weapons, sacred_objects, places
- `archetypes: Map<domain, Entity[]>` for the home page's DIVINE ARCHETYPES
- `genealogies: per culture, layers computed from PARENT_OF/CREATED_BY chains` (cycle-safe: Ymir→Borr→Odin is fine, but reconstructed edges that could cycle are broken at the highest-generation node and flagged)
- `comparatorMatrix` helper for the compare page.

## Validation (CI-style script, `scripts/validate.ts`)
Run in dev + build:
1. All JSON parses.
2. Every relationship endpoint exists in entities.
3. Every `[S#]` in every text field resolves to a line in that culture's `sources.md`.
4. Every artwork `source_url` is recorded with `license` and `copyright_notes`.
5. Every entity id is unique per culture; cross-culture edges flagged.
6. No entity has `classification: "deity"` with zero `primary_sources` (quality floor).
Failures print the offending id + field. This is the project's "no invented claims" enforcement.
