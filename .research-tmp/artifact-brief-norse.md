# ARTIFACT RESEARCH — NORSE (research/artifacts/norse/)

Culture brief on top of the template contract (.research-tmp/artifact-brief-template.md — read it FIRST).

## Artifacts to research (8)
1. **Mjölnir** (hammer of Thor) — the flagship. Gylfaginning ch. 27 (dwarves Sindri & Brokkr; handle so short Thor can't throw with one hand without the belt/gloves). Gullinbursti is NOT in scope.
2. **Gungnir** (Odin's spear) — forged by dwarves; every thrown spear finds its mark; Odin cast it into the world at creation (Gylfaginning ch. 20).
3. **Draupnir** (Odin's ring) — 8 rings drop from it every ninth night; Baldr's funeral; test of Odin's wisdom.
4. **Brísingamen** (Freyja's necklace) — four dwarves (Breidri, Sindri, Dainli, Dvalin) made it; Loki's bet with Brokkr.
5. **Gjallarhorn** (Heimdall's horn) — will sound at Ragnarök; Heimdall keeps it from his lips.
6. **Megingjörð** (Thor's belt, strength ×3) — dwarf-forged with Mjölnir.
7. **Freyja's falcon-feather cloak** (brísingafreyr? no — the *feather cloak* that lets her become a falcon; source: Gylfaginning / Völuspá? verify which source says what — be precise)
8. **Skíðblaðnir** (Odin's collapsible ship) — dwarven work; folds to the size of a cloak; carries all the Æsir.

## Entity ids available (data/norse/entities.json)
nor-odin, nor-thor, nor-frigg, nor-freyja, nor-heimdall, nor-baldr, nor-hodr, nor-tyr,
nor-fenrir, nor-hrungnir, nor-surt, nor-uthra, nor-sif, … (full list in the file).
Note: dwarves (Sindri/Brokkr) are NOT entities — set creator: null and mention them in
creation_story + associated notes. Hrungnir IS an entity (nor-hrungnir).

## Myth ids available
nor-creation, nor-runes, nor-baldr-death, nor-fenrir-binding, nor-loki-children, nor-ragnarok, nor-thor-geirdrud
(Map artifacts to these where genuinely relevant; e.g. Gjallarhorn → nor-ragnarok, nor-baldr-death.)

## Image guidance (honesty is paramount — NO authentic image of any of these objects exists)
- Mjölnir → best candidates: Gosforth Cross (Thor with hammer, British Museum), runestones
  depicting Thor with hammer (e.g. Altuna, Swedish History Museum), Thor figurines
  (Mann岛? verify), 19th-c. Munch paintings (Nasjonalgalleriet Oslo — PD, d.1914).
- Gungnir → runestone spear imagery, Odin on Sleipnir with spear (e.g. runestone
  depictions), Munch's "Odin and Sleipnir" if verifiable PD.
- Draupnir → ring imagery: Oseberg/Gokstad gold rings (National Museum Denmark) labeled
  as "Viking Age ring of the same type, not the mythic ring".
- Brísingamen → no depiction; best: Oseberg jewelry / Viking Age necklace finds (Met Open
  Access has Viking jewelry) labeled honestly; or Munch's "The Death of Baldr" (Frigg, not
  Freyja — check if necklace visible) — label carefully.
- Gjallarhorn → Gjellehorn (real ceremonial horn, e.g. Norwegian museum, Met has a
  Gjellehorn) labeled "a real gjellehorn — the type of horn the myth describes".
- Megingjörð → Viking Age belt fittings (Met/National Museum Denmark).
- Freyja's cloak → falcon imagery: Munch "Frigg"? (wrong owner), better: medieval falcon
  illustrations (e.g. 15th-c. falconry manuscripts, Commons) labeled "a falcon — Freyja's
  shapeshift form; no depiction of the cloak itself survives".
- Skíðblaðnir → Oseberg ship (Finnish? no — Oseberg Viking ship, Oslo, Met has a model?
  National Museum Norway) labeled "the Oseberg ship — a real Viking Age vessel of the type
  described"; or Munch "Odin and the Giant"? (verify)
- Munch paintings: Nasjonalgalleriet images are open (verify direct URL). His works are PD (d. 1914).
- Wikimedia Commons is your friend for runestones (e.g. Altuna stone, Kåre's stone).

Verify every image URL with curl -sI (200 + image content-type). Write notes.md.
