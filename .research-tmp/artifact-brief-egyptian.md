# ARTIFACT RESEARCH — EGYPTIAN (research/artifacts/egyptian/)

Culture brief on top of the template contract (.research-tmp/artifact-brief-template.md — read it FIRST).
Egyptian art/objects are ancient → public domain. Met Open Access is the strongest source
(actual objects: crowns, was-scepters, ankh, scarabs, solar boats, papyri with scenes).
Cairo Museum / Louvre via Wikimedia Commons also good.

## Artifacts to research (5, "verified research" per the PO)
1. **Was-scepter** (ꜥs / was) — held by most gods (Set especially, Osiris, Ra); a symbol
   of power/authority, NOT a weapon in the modern sense (honesty note: often mistranslated
   "flywhisk"). Real objects exist in many museums (Met has several).
2. **Ankh** (ꜥnḫ) — the "key of life" / symbol of life itself; held by Ra to give life to
   Osiris at the weighing? (verify scene); ubiquitous on actual objects (Met has hundreds).
   This is a symbol-object — be honest about its debated meaning (hieroglyph "life" vs
   physical "scepter loop").
3. **Djed pillar** (djed) — symbol of stability, associated with Osiris (his spine);
   "Osiris' backbone" in later tradition (Pyramid Texts / later); real djed pillars exist
   (Met / British Museum).
4. **Solar barque** (solar boat of Ra) — the *mandjet* (day) and *mesketet* (night) boats;
   the actual solar barque found at Giza (Khufu ship, c. 2500 BCE) is the best archaeological
   match — images: Wikimedia Commons (Giza solar boat, PD photos), also a scale model in
   the Giza Solar Boat Museum (photos on Commons). This is the strongest "real object"
   in the Egyptian set.
5. **Eye of Horus** (wedjat / Udjat) — the restored eye; magical amulet; the weighing of the
   heart scenes; actual wedjat amulets (Met has many faience ones — ARCHAEOLOGICAL, same
   type). Honesty: the mythic eye is a body-part, the amulet is the object — note the
   distinction.

## Entity ids (data/egyptian/entities.json)
egy-ra, egy-aur, egy-osiris, egy-isfet, egy-horus, egy-set, egy-thoth, egy-anubis,
egy-hathor, egy-ogdoad-khnum, egy-horus-elder, … (full list in file)

## Myth ids
egy-creation-heliopolis, egy-creation-memphis, egy-creation-hermopolis, egy-osiris-murder,
egy-isis-restores, egy-horus-vs-set, egy-solar-journey, egy-eye-of-ra

## Image guidance
- Met API (https://collectionapi.metmuseum.org/public/collection/v1/search?q=…):
  "was scepter", "ankh", "djed", "wedjat amulet", "solar boat" — returns primaryImageObject
  (images.metmuseum.org/iiif/…). Verify 200.
- Wikimedia Commons for the Khufu solar boat (large PD photos) and Giza scenes.
- Papyrus scenes (e.g. Papyrus of Ani — Metropolitan Museum has the actual Papyrus of Ani!
  images.metmuseum.org) for the weighing-of-the-heart / solar barque scenes (MANUSCRIPT).
- Every image_url must curl-verify to 200. Write notes.md.
