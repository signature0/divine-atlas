# Phase 1 — Content Audit Worklist (2026-10-17)

Deterministic sweep (id/name/dup/broken-ref/empty-field scan) + full manual genealogy review of all 159 entities and 18 artifacts. Findings graded:
- **F = factual error** (contradicts primary sources) → fix
- **G = gap** (missing field/ref that sources support) → fill
- **S = schema** (inconsistent encoding) → normalize
- **U = uncertain/disputed** → flag in UNCERTAIN.md, do not silently change

## Japanese
- F1 `jpn-susanoo`: `parents:[jpn-kushiinadahime]` AND `children:[jpn-kushiinadahime]` — self-contradictory. Kojiki: Susanoo's parents are Izanagi (washed at the river mouth) + Izanami. Kushinada-hime is his **descendant/bride**, not child. Fix parents → izananagi; children → [].
- F2 `jpn-amaterasu`: `children:[jpn-toyotama]` — Toyotama is her great-granddaughter (via Ninigi). Real son Ame-no-oshihomimi is not in the dataset. Fix children → [] + uncertainty note.
- F3 `jpn-konohanasakuhana`: `parents:[jpn-ninigi]` — she is Ninigi's **wife**. Kojiki: her father is Ōkuninushi (of Izumo). Fix parents → [jpn-okuninushi].
- F4 `jpn-toyotama`: `parents:[jpn-amaterasu]` — she is Ninigi's wife; her father is the sea deity Watatsumi (not in dataset). Fix parents → [] + note.
- F5 `jpn-ninigi`: `parents:[jpn-amaterasu]` — Ninigi is her **grandson** (son of Ame-no-oshihomimi). Fix parents → [] + note.
- F6 `jpn-hooroni`: `parents:[jpn-ninigi, jpn-toyotama]` — parents are Ninigi **and Toyotama only** (Ninigi is also his grandfather, but the listed pair is right; verify children of Ninigi+Yohara list Hoori as youngest son — keep, but remove Amaterasu-line confusion in description if any).
- G1 `jpn-amaterasu`, `jpn-tsurugumo`, `jpn-susanoo`: `parents:[]` — Kojiki birth from Izanagi's purification (and Izanami for Susanoo per some readings). Fill parents.
- S1 `jpn-kamimusubi`: id says kamimusubi, name says "Takamimusubi" — two distinct Kojiki primordial deities (Kamimusubi vs Takamimusubi). Decide from description_long; align id/name; note in UNCERTAIN if description mixes them.
- S2 `jpn-yamata-no-orochi`: `gender:"none"` — normalize to "unknown" (or "other") for schema consistency.
- U1 `jpn-inari` gender unknown — correct (Inari appears in male, female, and androgynous forms); keep unknown, add note.

## Greek
- F7 `gre-hephaestus`: `children:[gre-ares]` — **Ares is his brother** (son of Zeus+Hera). Hephaestus has no canonical children with Aphrodite in the main corpus (Kadmos of Thebes, Ardalus etc. are minor/fragmentary). Fix children → [] + note.
- F8 `gre-horus`-class reciprocal errors: `gre-atlas`: `children:[gre-maia]` is right (Maia is daughter of Atlas), but `gre-maia`: `parents:[gre-atlas]` ✓ — verify no double-listing elsewhere. (No fix.)
- F9 `gre-aphrodite`: `children:[gre-eros]` — in Hesiod Eros is primordial, predating Aphrodite; in later (Hellenistic/Aristophanes) tradition he is her son with Ares. Keep but add uncertainty note + sources split.
- G2 `gre-gaia`: `children:[ouranos, oceanus, tethys]` — massively incomplete (Titans, Cyclopes, Hecatoncheires, Pontus, Erinyes…). Fill with the children present in the dataset; add note that only dataset members are listed.
- G3 `gre-persephone`: `parents:[gre-demeter]` — add Zeus (not in parents list; Zeus IS in dataset).
- G4 `gre-poseidon`: `partners:[]`, `children:[]` — Amphitrite not in dataset; Triton/Pegasus/Theseus etc. not in dataset. Add uncertainty note listing attested offspring rather than leaving blank.
- G5 `gre-ares`: `children:[]` — Harmonia (with Aphrodite; she's not in dataset), the Amazon Penthesilea lineage etc. Add note.
- S3 `gre-chaos` gender unknown — Hesiod: Chaos is a primordial *place/state*, genderless in most readings; keep "unknown" + note.
- S4 `gre-aphrodite`: `parents:[gre-ouranos]` (Hesiod's foam-born) vs Homeric "daughter of Zeus + Dione". Keep Hesiodic as primary, add alternative_names/note for the Homeric variant.
- Broken myth refs (24): entity `major_myths` point to myth ids that don't exist in `myths.json` (e.g. `gre-zeus-eye`, `gre-orion`, `gre-cassandra`, `gre-actaeon`, `gre-heracles-cerberus`…). These are dangling pointers, not missing myths — **strip the broken ids** (the myths themselves are out of scope to author) and log each removal.

## Norse
- F10 `nor-ymir`: `parents:[nor-ginnungagap]` — Ginnungagap is the **void**, not a parent. Ymir "self-generated" (sjálfborn) from the dripping venom where fire met ice (Gylfaginning). Fix parents → [] + note.
- F11 `nor-ymir`: `children:[nor-burir]` — Búri was **licked out of the salt-rime blocks by Auðumbla**, not Ymir's son. Fix children → []; Búri `parents:[]` + note (origin: Auðumbla's licking).
- F12 `nor-uthra` (Ullr): `parents:[nor-thor, nor-sif]` — Sif is Thor's **wife**; Ullr is stepson of Thor, son of Sif and an unnamed giant (Þrúðgelmir in a þulur/late source). Fix parents → [nor-sif] + note; Thor stays as stepfather in description only.
- F13 `nor-sid` ("Síd"): name not attested. The Sleipnir-mare is **Loki himself** (as a mare, mating with Svaðilfari). The Gylfaginning list of Loki's wives: Sigyn + Angrboða. "Síd" appears to be a corruption of **Sigiðr/Laufey** (Laufey = Loki's *mother*, male jötunn in some readings). → Replace entity with Laufey? Safer: rename to "Svaðilfari (the stallion)"? DECISION: the entity's description says "giantess who bore Sleipnir with Loki" — that is wrong on both counts (Sleipnir's other parent is the stallion Svaðilfari; Loki bore Sleipnir *as a mare*). Fix: convert entity to **Svaðilfari** (male, horse, correct myth) OR delete and note. Per rules (fix, don't delete): convert to Svaðilfari, gender male, fix Sleipnir `parents:[nor-loomi]` → parents [nor-loomi (as mare), nor-svaðilfari].
- F14 `nor-odin`: `children:[..., nor-heimdall]` — Heimdall's parentage: born of nine mothers (Gylfaginning); Odin-filiation is a late/uncertain claim. Move Heimdall from Odin's children → UNCERTAIN.md; Heimdall `parents:[]` + note.
- F15 `nor-frigg`: `children:[nor-baldr, nor-vidar, nor-vali]` — Víðarr's mother is the giantess **Gríðr**; Váli (son of Odin+Rindr) is not Frigg's. Frigg's attested sons: Baldr (and Höðr). Fix children → [baldr, hodr] + note.
- F16 `nor-hodr`: missing from Frigg's/Odin's children — add to Frigg (and Odin per Gylfaginning).
- F17 `nor-nyrd`: `partners:[nor-ska]` only — Njörðr's children's mother is his sister, a nameless giantess (Njörðr and the "sister-wife" of Nótt tradition). Keep Skaði as partner (attested marriage), add note that Freyr/Freyja's mother is an unnamed giantess.
- F18 `nor-sif`: `parents:[]` fine, but `nor-sif` listed as Thor's partner ✓ and as Ullr's parent ✓ (see F12).
- F19 `nor-loomi`: `parents:[]` — Fárbauti (father) and Laufey/Nál (mother) are attested (Loki is "son of Fárbauti" in skaldic kenning tradition). Neither parent is in dataset → add uncertainty note (don't invent entities).
- F20 `nor-forseti` name "Fosite (Forsétir)" — "Fosite" is the Frisian island-name form; normalize display name to "Forseti (Forseti/Fosite)".
- F21 `nor-jarnsaxa` name "Járnsaxa (Járnsaxa)" — duplicated gloss; clean to "Járnsaxa".
- F22 `nor-anguela` name "Angerboa" — Anglicization; normalize display to "Angrboða (Angerboda)".
- F23 `nor-loomi` `partners:[nor-anguela, nor-sid]` — Sigyn is Loki's attested wife (absent from dataset); Angrboða is a consort (not a marriage). Keep Angrboða, replace Síd per F13, add note re Sigyn.
- Broken myth refs: `nor-thor-hrungnir`, `nor-jormungandr` on Thor — strip (myths not authored).
- S5 `nor-muspel`/`nor-niflheim` — realms personified as entities; gender "unknown" fine; ensure classification "primordial" consistent.
- S6 `nor-aurdhumbla`/`nor-burir`/`nor-hodr`/`nor-tyr`/… id-vs-name "mismatches" are ASCII-folded ids vs diacritic names — **not errors**; leave ids (stable URLs), log as accepted.

## Egyptian
- F24 `egy-horus`: `partners:[egy-isfet]` — Horus's canonical consort is Hathor (in dataset!). Isis-as-consort appears only in rare magical texts. Fix partners → [egy-hathor] + note.
- F25 `egy-horus`: `children:[egy-horus-elder]` — **inverted**. Harsomtus (Horus the Elder/Har-soma-tawy) is a form/offspring of Horus at Edfu, not his father. Fix horus.children → []; horus-elder: classification "form of Horus", parents → [egy-horus] + note.
- F26 `egy-set`: `partners:[]` — Set's consort is **Nephthys** (attested; she's in dataset and lists Set as partner). Fix set.partners → [egy-nephthys].
- F27 `egy-nephthys`: `partners:[egy-set, egy-osiris]` — the Osiris liaison (mother of Anubis) is a specific tradition (Plutarch; the "false Osiris" episode). Keep both + note; this also gives Anubis's parentage.
- G6 `egy-anubis`: `parents:[]` — per F27 tradition: Set (or Osiris) + Nephthys. Fill parents → [egy-set, egy-nephthys] with note (or [egy-osiris, egy-nephthys] variant).
- F28 `egy-ogdoad-khnum` "Khenunu & Khenunit (primordial mystery)" — **wrong names**. Hermopolitan Ogdoad pairs: Nun/Naunet (waters), Heh/Hehet (infinity), **Kek/Kauket** (darkness), **Amun/Amaunet** (hiddenness). "Khenunu" is not attested. Fix → "Kek & Kauket (primordial darkness)".
- F29 `egy-ogdoad-sat` "Sat & Satet (primordial duration)" — **wrong names**; Satet is the Elephantine goddess, not Ogdoad. Fix → "Amun & Amaunet (primordial hiddenness)". NOTE: conflicts with existing `egy-amun` entity (Amun of Thebes) — add cross-reference note that Ogdoad Amun is the "hiddenness" principle, distinct from the Theban king-god.
- F30 `egy-nun` vs `egy-ogdoad-nun` — duplicate concept (Nun solo + Nun-of-the-pair). Keep both (solo Nun is the personified waters; pair entry documents the Ogdoad) + cross-link note. Log as near-duplicate.
- S7 Ogdoad pair entities: `gender:"unknown"` — better: "dual (male+female pair)"; normalize to "other" + note (schema enum).
- S8 `egy-aur` name "Atum-Ra (the primordial waters' first god)" — clean display to "Atum-Ra"; keep gloss in description.
- S9 `egy-ra` vs `egy-aur` — Ra and Atum-Ra are separate entities by design (syncretism documented); add cross-link note.
- U2 `egy-thoth` parentage empty — traditions differ (self-created on the mound; born from Set's semen via Herodotus; "tongue of Ra"). Flag, don't guess.
- U3 `egy-hathor` as "daughter of Ra" — common but not universal; flag.

## Slavic
- F31 `slv-svarog`: `children:[slv-veles]` — the Primary Chronicle (Ipatian, under 980) glosses Dazhbog as "son of Svarog" (in the Vladimir pantheon passage). Veles is NOT Svarog's son. Fix children → [slv-dazhbog] + cite; add note that the Svarog–Dazhbog father-son reading itself rests on one chronicle gloss and is debated.
- F32 `slv-dazhbog`: `parents:[]` → [slv-svarog] (same source, same caveat).
- U4 `slv-svarog` identity (Svarog = Hephaestus of the chronicle; whether Svarog=Dazhbog=SUN are one) — flag.
- U5 `slv-lada` — existence as a *deity* is heavily disputed (19th-c. forgeries/slowo; maxism controversy). Flag prominently; ensure evidence_status reflects "disputed".
- U6 `slv-cherd` ("Cherd/Chert") — the devil figure comes from a 16th-c. source (Bielski), likely Christian-era invention. Flag.
- U7 `slv-zorya` — "the Morning Stars" plural entity; dawn-star(s) Zorya(s) are ethnographic/folkloric; flag reconstruction level.
- U8 `slv-jarilo` "(Kupala)" — Kupala is a folk festival saint's eve, not identical to Jarilo; the equation is scholarly/folk reconstruction. Flag.
- U9 `slv-nebo` — already flagged in data; keep.
- G7 Slavic has **no artifacts.json** → Phase 4 will create it (per rules: fill, don't leave empty).

## Mesopotamian
- F33 `mes-tiamat`: `parents:[mes-kingu]` — **inverted**. Enuma Elish: Tiamat (primordial salt water) is paired with Apsu; Kingu (Qingu) is her **son** and commander of her army, later executed to make mankind. Fix tiamat.parents → [] (primordial); tiamat.children → [mes-kingu]; kingu.parents → [mes-tiamat]; kingu.partners → [] (he was given "exalted destiny", not marriage to Tiamat — the "elevated to husband" line refers to her *exalting* him, keep note).
- F34 `mes-erishkigal`: `parents:[]` — daughter of An (and in some lists Antu/Nammu). An is in dataset → parents → [mes-apas] + note variant.
- F35 `mes-erishkigal-consort` — duplicate of `mes-nergal` (same god: Nergal, consort of Ereshkigal per the myth "Nergal and Ereshkigal"). **Merge**: delete the duplicate entity, repoint references to `mes-nergal`. (Deletion allowed: it IS a duplicate.)
- F36 `mes-enki`: `parents:[]` — Enki is son of An (and Nammu in Sumerian tradition; Nammu not in dataset). parents → [mes-apas] + note.
- F37 `mes-marduk`: `parents:[mes-enki]` — Enuma Elish: Marduk is son of **Ea (Enki)** and Damkina. Father ✓; add note re Damkina (not in dataset).
- F38 `mes-nabu`: `parents:[mes-enki]` — Nabu is son of **Marduk** (and Nisaba/Tashmetu as consort in some lists), not of Enki. Fix parents → [mes-marduk].
- F39 `mes-enlil`: `children:[..., mes-nergal]` — Nergal's parentage: Enlil + Ninlil in some lists (Erra myth: "seed of Enlil"); acceptable, keep + note.
- F40 `mes-ki` as mother of Enlil/Enki — Ki (earth) + An = parents of Enlil in Sumerian tradition; Enki's mother is more often Nammu. Keep Enlil ✓; for Enki, note the variant.
- S10 `mes-apas` id — "apas" is unexplained (An?); id kept for URL stability, logged.
- S11 `mes-ki` name "Ki (the earth)" fine.
- U10 `mes-inanna`/`mes-utu` parents Nanna ✓ (standard). No change.
- U11 Ninhursag parentage empty — fine (she is among the great gods, birth-goddess; parentage not needed).

## Cross-cutting
- X1 Broken `major_myths` refs: greek 24, norse 2 — strip dangling ids, log each.
- X2 `gender:"none"` (jpn-yamata-no-orochi) → "unknown".
- X3 Primordial realms-as-entities (nor-muspel, nor-niflheim, nor-ginnungagap, gre-chaos, mes-abzu, mes-tiamat): ensure `classification:"primordial"` consistent; gender "unknown" acceptable with note.
- X4 Artifacts: nor artifacts have extra `status_note` key vs others — normalize (keep field, it's additive; log schema note).
- X5 `egy-aur` flavor text "the primordial waters' first god" — apostrophe inside display name caused awkward card titles; clean display names (S8).
