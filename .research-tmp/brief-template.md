# RESEARCH BRIEF TEMPLATE (internal)

## Output directory
/AI/agents/workspaces/divine-atlas/research/<CULTURE>/  (create with mkdir -p)

## Required output files (all JSON must be STRICTLY VALID — parse with `python3 -c "import json;json.load(open(f))"` before finishing; UTF-8; no trailing commas; escape quotes)

### 1. entities.json — array of 18–28 key entities (gods, primordial beings, major monsters, 2–4 heroes if central)
Each object:
```json
{
  "id": "<culture>-<slug>",
  "name": "English/Latinized name",
  "native_name": "name in original script (Japanese: 天照大御神; Greek: Ζεύς; Coptic: etc.)",
  "alternative_names": ["..."],
  "classification": "primordial | deity | minor deity | spirit | monster | hero | realm | object",
  "gender": "male | female | androgynous | nonbinary | none | unknown",
  "domains": ["..."],
  "symbols": ["..."],
  "animals": ["..."],
  "weapons": ["..."],
  "sacred_objects": ["..."],
  "parents": ["entity-id", "..."],
  "siblings": ["entity-id"],
  "partners": ["entity-id"],
  "children": ["entity-id"],
  "allies": ["entity-id"],
  "enemies": ["entity-id"],
  "associated_realms": ["realm-id"],
  "associated_places": ["place name or id"],
  "major_myths": ["myth-id"],
  "primary_sources": [{"type": "text|relief|seal|inscription|manuscript", "name": "...", "date": "ca. 3000 BCE", "ref": "S12", "url": "https://... (if stable, else null)"}],
  "artworks": ["artwork-id"],
  "description_short": "2-3 sentences, plain language.",
  "description_long": "8-15 sentences. Scholarly but readable. Cite claims with [S#] referencing sources.md. Mark uncertain items with [S#] + uncertainty.",
  "interesting_facts": ["fact [S#]", "fact [S#]"],
  "uncertainty_notes": ["where scholars disagree, list variants"]
}
```
Rules:
- Only include kinship edges (parents/children/partners) attested in cited sources.
- When versions conflict, pick the best-attested for the graph and record ALL variants in uncertainty_notes.
- Do NOT invent. If unsure, mark uncertainty_notes and keep the field conservative.

### 2. relationships.json — array
```json
{"from": "entity-id", "to": "entity-id", "type": "PARENT_OF|SIBLING_OF|PARTNER_OF|CREATED|KILLED|FOUGHT|ALLY_OF|ENEMY_OF|RULES|ASSOCIATED_WITH|SUCCESSOR_OF", "note": "one-line explanation", "confidence": "attested|disputed|reconstructed", "sources": ["S3"], "explanation": "for disputed: describe the variant(s) for the reader"}
```

### 3. myths.json — array of 6–10 major myths
```json
{"id": "<culture>-<slug>", "title": "...", "summary": "4-8 sentences, faithful to sources, [S#] citations", "variants": [{"name": "Variant A (e.g., Kojiki version)", "description": "..."}], "participants": ["entity-ids"], "primary_sources": ["S1", "S2"], "uncertainty_notes": "..."}
```

### 4. cosmology.json
```json
{"realms": [{"id": "realm-id", "name": "...", "native_name": "...", "description": "2-4 sentences [S#]", "entities": ["entity-ids"], "layout": {"x": 0-100, "y": 0-100, "w": width, "h": height}}], "structure_notes": "how the cosmology is organized; note if it's a reconstruction"}
```

### 5. artworks.json — array of 15–25 artworks
```json
{"id": "<culture>-<art-slug>", "title": "...", "artist": "name or 'Unknown/anonymous (culture)'", "date": "ca. 1820 | 19th c. | 1868", "museum": "Museum name", "culture": "...", "medium": "oil on canvas | woodblock print | limestone relief | ...", "license": "public domain | CC0 | CC-BY (specify)", "source_url": "VERIFIED page URL where the image is hosted", "image_url": "actual direct image file URL if found (else null)", "subject": "which deity/myth is depicted", "description": "1-3 sentences on significance", "copyright_notes": "why it is public domain (e.g., artist d. 1890; museum open access program)"}
```
Rules:
- ONLY include artworks whose page you have VERIFIED with a web fetch/search. Never guess a URL.
- Prefer: Met Museum Open Access (metmuseum.org — CC0 for public domain works), Rijksmuseum (CC0), British Museum, Louvre, Tokyo National Museum, museumopenaccess, Wikimedia Commons (check license per file).
- If a museum image is behind a paywall/login, find the same work on Wikimedia Commons or another open source; if none, omit the work.
- NEVER include copyrighted contemporary art.
- Record attribution exactly as the source page states it.

### 6. timeline.json — array
```json
{"year_label": "ca. 3000 BCE | 712 CE | 1800–1900", "sort_year": -3000, "kind": "civilization | text | archaeological | manuscript | modern_recording", "label": "short title", "description": "1-2 sentences [S#]", "sources": ["S1"]}
```
sort_year: negative = BCE. Must make clear that when a SOURCE was written ≠ when the myth originated.

### 7. uncertainties.json — array
```json
{"topic": "...", "description": "...", "positions": [{"name": "View A", "description": "...", "support": "who argues this [S#]"}], "sources": ["S#"]}
```
Include at least 3 real scholarly disagreements (parentage variants, chronology, authenticity, interpretation).

### 8. sources.md — numbered bibliography [S1] … [S20+]
Format per entry:
```
[S1] Title — Author/Institution, Date — TYPE (primary translation | museum collection | university | academic encyclopedia | national library) — URL
```
Requirements:
- Prioritize: museum collections (Met, British Museum, Louvre, Tokyo Nat'l Museum, Rijksmuseum, Getty, etc.), university sites, translated primary texts (Loeb, Sacred Texts project, Perseus Digital Library, Harvard), national libraries, recognized scholarly publications (JSTOR, Cambridge/Oxford companions).
- Wikipedia: allowed ONLY as a "discovery pointer" entry, clearly labeled, NEVER as the sole support for any claim.
- Every [S#] cited in entities/myths/artworks must resolve to an entry here.
- Include a FRAMING note: how to treat this tradition (historical mythology / living religious tradition / folklore / literary sources) — for Shinto: living religious tradition; do not frame as fiction.

## Method
1. Identify the core primary sources for the tradition.
2. Identify 2–4 major museum collections holding relevant objects.
3. Verify candidate artwork pages by fetching them (web_search + web_extract).
4. Write entities.json FIRST (drives everything), then relationships (must reference valid entity ids), myths, cosmology, artworks, timeline, uncertainties, sources.md last (so [S#] numbering is final — renumber references consistently).
5. Validate all JSON files parse.
6. Cross-check: every entity id referenced in relationships.json exists in entities.json; every [S#] exists in sources.md.

## Final output
Print a JSON summary:
```json
{"culture": "...", "entities": N, "relationships": N, "myths": N, "artworks_verified": N, "sources": N, "files_written": [...], "unverified_or_omitted": ["..."], "notes": "anything the lead should know"}
```
