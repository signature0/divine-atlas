# ARTIFACT RESEARCH — OUTPUT CONTRACT (all cultures)

You are the art researcher + mythology researcher for THE DIVINE ATLAS
project. You research DIVINE ARTIFACTS (sacred objects) for ONE culture and
write verified JSON into `research/artifacts/<culture>/`.

## Files you MUST produce (in research/artifacts/<culture>/)
1. `artifacts.json`   — array of Artifact objects (schema below)
2. `artifact_artworks.json` — array of Artwork objects for the images (schema below)
3. `sources.md`       — `**[S1]**` … `**[Sn]**` bibliography that every [S#] marker resolves to
4. `notes.md`         — your research trail: what you verified, what you rejected and why

## Artifact schema (EXACT field names)
```json
{
  "id": "<culture-prefix>-<kebab>",        // e.g. "nor-mjolnir", "grk-aegis". Must match an entity id you will NOT create — the orchestrator links it.
  "slug": "mjolnir",                        // global unique, for /artifacts/[slug]
  "name": "Mjölnir",
  "native_name": null,
  "alternative_names": ["Mjölnir (Molnir)"],
  "culture": "<culture id>",
  "period": "Viking Age tradition; attested in texts c. 1250 CE",
  "artifact_type": "weapon",                 // normalized: weapon|armor|jewelry|clothing|sacred_object|tool|regalia|vehicle|container|instrument|magical_object
  "artifact_category": "hammer",
  "owner": "nor-thor",                       // entity id (check data/<culture>/entities.json for the exact id!) or null
  "previous_owners": [],
  "creator": "nor-brokkr",                   // entity id or null
  "associated_deities": ["nor-thor"],        // entity ids
  "associated_heroes": [],
  "associated_monsters": ["nor-hrungnir"],
  "material": "dwarven metal (unspecified in sources)",
  "appearance": "A small two-handed hammer with a short handle… [S2]",
  "symbols": ["hammer", "consecration"],
  "abilities": [
    {"name": "Thundercall", "type": "offensive",
     "description": "… [S2]", "sources": ["S2"],
     "certainty": "ATTESTED"}
  ],
  "limitations": ["Must be wielded with the gloves Járngreipr and belt Megingjörð to be lifted [S3]"],
  "power_profile": [
    {"label": "Destruction", "value": 9, "note": "Repeatedly used to slay giants; never fails in surviving myths."}
  ],
  "rank": {"tier": "DIVINE", "letter": "S"},
  "creation_story": "… [S3]",
  "origin_story": "…",
  "major_myths": ["<myth ids from data/<culture>/myths.json if they exist, else []>"],
  "associated_locations": ["Asgard"],
  "associated_realms": [],
  "status_in_myth": "preserved",             // lost|destroyed|hidden|preserved|unknown
  "current_status_note": "Not physically destroyed in any surviving source; its fate is never told.",
  "primary_sources": [
    {"type": "text", "name": "Prose Edda", "date": "c. 1220–1230 CE", "ref": "S1", "url": null}
  ],
  "artworks": ["<artifact-artwork ids from artifact_artworks.json>"],
  "hero_artwork": "<the artwork id used as the card image>",
  "image": {
    "image_type": "HISTORICAL ART",   // ARCHAEOLOGICAL|HISTORICAL ART|SCULPTURE|MANUSCRIPT|MODERN RECONSTRUCTION|MODERN ART
    "label": "Carved depiction of a hammer-wielding god, Gosforth Cross, c. 950 CE",
    "honesty_note": "This is a Viking Age cross carving that most scholars read as Thor; it is not a portrait of the mythic hammer itself."
  },
  "description_short": "≤3 sentences, [S#] inline.",
  "description_long": "8–15 sentences, [S#] inline.",
  "uncertainty_notes": ["What scholars dispute / what is later tradition"],
  "source_confidence": "HIGH"               // HIGH|MEDIUM|LOW
}
```

## Artwork schema (artifact_artworks.json, EXACT)
```json
{
  "id": "<culture-prefix>-<kebab>-art",
  "culture": "<culture id>",
  "title": "…", "artist": "… (or 'Unknown')", "date": "c. 950 CE",
  "institution": "British Museum",
  "source_url": "https://…",              // VERIFIED page you actually fetched
  "image_url": "https://…",               // direct file URL you actually fetched (status 200). null only if none exists.
  "license": "public domain",
  "copyright_notes": "Object created c. 950 CE; photograph: …",
  "image_type": "ARCHAEOLOGICAL",
  "alt": "…",
  "about_artifact": "nor-mjolnir"
}
```

## HARD RULES
1. **No invented evidence.** If no authentic depiction of the object survives,
   say so in `image.label` + `image.honesty_note` and use the best honest
   alternative, ALWAYS labeled (e.g. "19th-century artistic interpretation",
   "archaeological object of the same type/period, not the mythic object itself").
2. Image priority: museum photo of real related object > ancient/historical
   depiction > public-domain painting > sculpture/relief > manuscript >
   woodblock > archaeological material > carefully chosen later art.
3. **Verify every image**: web_search, open the page, and confirm the direct
   image URL returns 200 (curl -sI). If you cannot verify a direct file URL,
   set `image_url: null` and keep `source_url` (the page link).
4. Prefer: Met Open Access (images.metmuseum.org), Wikimedia Commons
   (upload.wikimedia.org), British Museum, Louvre, Rijksmuseum, Nasjonalgalleriet,
   Tokyo National Museum, Pergamon. These hosts are already allow-listed for
   the app's image loader: images.metmuseum.org, upload.wikimedia.org,
   thumb.wikimedia.org.
5. Every [S#] in text fields MUST resolve to a `**[S#]**` line in your sources.md.
6. Entity ids (`owner`, `creator`, `associated_*`): read `data/<culture>/entities.json`
   and use EXISTING ids. If the owner doesn't exist as an entity, use null and
   name them in `associated_deities_notes` (string, optional).
   Myth ids: read `data/<culture>/myths.json`.
7. power_profile: 3–7 attributes from DESTRUCTION, DEFENSE, CREATION, HEALING,
   PROTECTION, DIVINE_AUTHORITY, MAGIC, RANGE, DURABILITY, MOBILITY,
   TRANSFORMATION, CONTROL, UTILITY. 0–10 integers. Every value gets a one-line
   `note` grounded in the sources ("no surviving myth describes X being broken").
   Only attributes that actually apply. Do NOT inflate ratings for famous objects.
8. rank.tier: MINOR|SACRED|LEGENDARY|DIVINE|COSMIC|PRIMORDIAL; rank.letter:
   C|B|A|S|SS|EX. Interpretive Atlas classification — judge by: demonstrated
   power in myths, cosmological importance, rarity, influence on major myths,
   divine significance, versatility. (Methodology doc: docs/07-development/artifact-ranking-methodology.md)
9. Slavic: ONLY include objects with reasonably documented folkloric/historical
   support; set `source_confidence: "LOW"` and certainty "UNCERTAIN" or
   "MODERN INTERPRETATION" where appropriate, and explain the evidence base.
10. Write `notes.md`: every image you considered, accepted/rejected, and why.

## Finish
Print a JSON summary: {"culture": …, "artifacts": N, "artworks_verified": N,
"artworks_url_null": N, "ids": […], "low_confidence": […]}
