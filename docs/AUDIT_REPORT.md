# Divine Atlas — Content Audit Report (Phase 1, v2)

**Branch:** `atlas-v2-2026-10` · **Date:** 2026-10-17 · **Worker:** OpenCode (`deepseek-v4.1-flash-free`)
**Companion documents:** `docs/audit/PHASE1-FINDINGS.md` (audit worklist), `docs/UNCERTAIN.md` (disputed items), `docs/CHANGELOG.md` (per-fix log), `docs/PLAN.md` §3 Phase 1.

This report delivers the four required artifacts of Phase 1 v2:
1. the before/after/why correction record for the whole prior audit (F/S/G items);
2. a list of missing content to be added later (listed, not invented);
3. the description rewrites performed in this pass (card-summary line vs detail story);
4. the PWR/GRD stat consistency & balance review, with a per-culture table.

---

## 1. Method

### 1.1 What was audited

| Culture | Entities | Artifacts | Myths | Relationships | Sources ([S#]) |
|---|---:|---:|---:|---:|---:|
| Japanese (Shinto) | 21 | 4 | 7 | 51 | 19 |
| Greek | 41 | 5 | 11 | 92 | 6 |
| Norse | 40 | 6 | 7 | 80 | 4 |
| Egyptian | 25 | 3 | 8 | 49 | 5 |
| Slavic | 13 | 7 | 5 | 16 | 6 |
| Mesopotamian | 18 | 1 | 6 | 34 | 6 |
| **Total** | **158** | **26** | **44** | **322** | — |

Also in scope: the comparison layer and the derived card/relic views over the same records.

### 1.2 Source classes (as recorded in `data/*/sources.json` / `sources.md`)

- **Japanese** — *Kojiki* (712, trans. Chamberlain) **[S1]**, *Nihon Shoki* (720) **[S2]**, *Engishiki* (927) **[S19]**, museum/ukiyo-e art records, Keown's Shinto overview **[S21]**.
- **Greek** — Hesiod *Theogony* **[S1]**, Homer *Iliad*/*Odyssey* **[S2]**, the Homeric Hymns, Apollodorus, and museum open-access art records.
- **Norse** — Poetic Edda (*Codex Regius*) **[S1]**, Snorri's Prose Edda (*Gylfaginning*, *Skáldskaparmál*) **[S2]**, skaldic poetry **[S3]**, the Gosforth Cross **[S4]**.
- **Egyptian** — Pyramid Texts **[S1]**, Book of the Dead (Papyrus of Ani) **[S2]**, Plutarch *De Iside et Osiride* **[S3]**, Hornung's scholarship **[S4]**, Met open-access objects **[S5]**.
- **Slavic** — Primary Chronicle (PVL) **[S1]**, Hypatian/Hletovskaya chronicle (idol lists) **[S2]**, "Tale of the Destruction of the Idols" **[S3]**, 19th-c. ethnography **[S4][S5]**, Ivanov–Toporov comparative reconstruction **[S6]**.
- **Mesopotamian** — *Enuma Elish* **[S1]**, *Epic of Gilgamesh* **[S2]**, *Atrahasis* **[S3]**, "Inanna's Descent" **[S4]**, the ETCSL corpus **[S5]**, Met records **[S6]**.

### 1.3 How the audit was run

1. **Deterministic sweep** — duplicate id/name detection, dangling cross-references, empty required fields, id↔name divergence, gender-enum drift. Recorded as F/S/G items in `PHASE1-FINDINGS.md`.
2. **Manual genealogy review** — every parent/partner/child edge checked against the primary source class above; reciprocal edges validated.
3. **Data fixes landed** (prior pass, logged in `docs/CHANGELOG.md`): the F/S/G corrections in §2 below.
4. **This pass** — authors this report, strengthens the weakest `description_short`/`description_long` texts (§4), and reviews PWR/GRD balance (§5). Debatable items are never silently changed; they live in `docs/UNCERTAIN.md`.

### 1.4 How PWR/GRD are produced (important for §5)

Card stats are **derived, not stored**. `app/lib/card.ts` (`statsOf`) computes PWR/GRD from a deterministic seeded roll over the entity `id` plus a `classification` bonus (`primordial` +3, `deity` +2, `giant` +1, `monster` 0, `hero` −1, everything else −2). Relic cards (`app/lib/relic-card.ts`) derive PWR/GRD from the artifact's own `power_profile` (means of the OFFENSE / DEFENSE attribute buckets), with a seeded fallback when a bucket is empty. The stats are labelled *interpretive* on the cards.

Consequence for this phase: an entity's PWR/GRD cannot be hand-set by editing JSON; the only data-level levers are `classification` (entity) and `power_profile` / `tier` (artifact). The consistency pass in §5 therefore (a) flags every derived divergence, and (b) fixes only clear-cut cases that are expressible in the allowed data files.

---

## 2. Corrections table (F1–F40 / G1–G7 / S1–S11 / X1–X5)

Every item from `PHASE1-FINDINGS.md`. "before → after" is the data state; debatable calls are cross-referenced to `docs/UNCERTAIN.md` rather than re-decided here. Items marked *flag only* were deliberately not changed.

### Japanese

| id | before | after | why (source) |
|---|---|---|---|
| **F1** `jpn-susanoo` | parents `[kushiinadahime]`; children `[kushiinadahime]` | parents `[izananagi, izananami]`; children `[]` | Kojiki: born of Izanagi's river-mouth washing + Izanami; Kushinada-hime is his descendant/bride, not parent/child |
| **F2** `jpn-amaterasu` | children `[toyotama]` | children `[]` | Kojiki: Toyotama is a great-granddaughter (via Ame-no-oshihomimi → Ninigi); that son is not modelled → `UNCERTAIN.md` |
| **F3** `jpn-konohanasakuhana` | parents `[]` (listed as Ninigi's parent) | parents `[okuninushi]` | Kojiki/Nihon Shoki: daughter of Ōkuninushi of Izumo, given to Ninigi in marriage |
| **F4** `jpn-toyotama` | parents `[amaterasu]` | parents `[]` | Kojiki: father is the sea deity Watatsumi (not modelled) → `UNCERTAIN.md` |
| **F5** `jpn-ninigi` | parents `[amaterasu]` | parents `[]` | Kojiki: grandson of Amaterasu (son of Ame-no-oshihomimi); parent not modelled |
| **F6** `jpn-hooroni` | parents `[ninigi, toyotama]` | unchanged (verified) | Kojiki: son of Ninigi + Toyotama (Ninigi is also his grandfather) |
| **G1** `jpn-amaterasu` / `jpn-tsurugumo` / `jpn-susanoo` | parents `[]` | `[izananagi, izananami]` | Kojiki: born of Izanagi's purification (left eye / right eye / nose) |
| **S1** `jpn-kamimusubi` | id = Kamimusubi, name = "Takamimusubi" | display kept "Takamimusubi", description aligned; id kept for URL stability | Kojiki names two distinct primordial producers → `UNCERTAIN.md` |
| **S2** `jpn-yamata-no-orochi` | gender `"none"` | `"unknown"` | schema enum normalisation |
| **U1** `jpn-inari` | — | kept `unknown` gender | male/female/androgynous across traditions → `UNCERTAIN.md` |

### Greek

| id | before | after | why (source) |
|---|---|---|---|
| **F7** `gre-hephaestus` | children `[ares]` | children `[]` | Ares is his brother (son of Zeus+Hera), not son → `UNCERTAIN.md` |
| **F8** `gre-atlas` / `gre-maia` | atlas.children `[maia]`, maia.parents `[atlas]` | verified reciprocal; no change | Hesiod |
| **F9** `gre-aphrodite` | children `[eros]` | kept + uncertainty note | Hesiod: Eros is primordial; later tradition: Aphrodite's son → `UNCERTAIN.md` |
| **G2** `gre-gaia` | children `[ouranos, oceanus, tethys]` | + `[cronus, rhea, …]` (dataset members only) | Hesiod *Theogony*: Titans, Cyclopes, etc.; only modelled children listed → `UNCERTAIN.md` |
| **G3** `gre-persephone` | parents `[demeter]` | `[zeus, demeter]` | Hesiod *Theogony* 912–914 |
| **G4** `gre-poseidon` | partners/children `[]` | `[]` + uncertainty note | attested offspring (Triton, Pegasus…) not modelled → `UNCERTAIN.md` |
| **G5** `gre-ares` | children `[]` | `[]` + note | Harmonia etc. not modelled → `UNCERTAIN.md` |
| **S3** `gre-chaos` | gender `unknown` | kept + note | Hesiod: Chaos is a place/state, genderless → `UNCERTAIN.md` |
| **S4** `gre-aphrodite` | parents `[ouranos]` | kept Hesiodic + alternative name/note | Homeric variant Zeus + Dione → `UNCERTAIN.md` |
| **X1** 24 Greek `major_myths` | dangling ids (`gre-zeus-eye`, `gre-orion`, `gre-cassandra`, `gre-actaeon`, `gre-heracles-cerberus`, `gre-pandora`, `gre-narcissus`, …) | stripped (myths not authored) | logged per-removal in `CHANGELOG.md` → `UNCERTAIN.md` |

### Norse

| id | before | after | why (source) |
|---|---|---|---|
| **F10** `nor-ymir` | parents `[ginnungagap]` | parents `[]` | Gylfaginning: Ymir is `sjálfborn`; Ginnungagap is the void, not a parent |
| **F11** `nor-ymir` / `nor-burir` | ymir.children `[burir]` | burir removed; burir.parents `[]` + note | Gylfaginning IV: Búri was licked from the salt-rime by Auðumbla |
| **F12** `nor-uthra` | parents `[thor, sif]` | parents `[sif]` + note | Ullr is Sif's son by an unnamed father; Thor is stepfather → `UNCERTAIN.md` |
| **F13** `nor-sid` | entity "Síd, giantess who bore Sleipnir with Loki" (unattested) | converted to **Svaðilfari**, the builder's stallion (male horse) | Gylfaginning: Loki (as a mare) bore Sleipnir; the other parent is the stallion Svaðilfari → `UNCERTAIN.md` |
| **F14** `nor-odin` / `nor-heimdall` | odin.children `[…, heimdall]`; heimdall.parents `[odin]` | heimdall removed from odin.children; heimdall.parents `[]` + note | Gylfaginning 27: born of nine mothers; Odin-filiation is a skaldic hint → `UNCERTAIN.md` |
| **F15** `nor-frigg` | children `[baldr, vidar, vali]` | children `[baldr, hodr]` | Gylfaginning: Frigg's sons are Baldr + Höðr; Víðarr's mother is Gríðr |
| **F16** `nor-hodr` | parents missing | parents `[odin, frigg]` | Gylfaginning 33 |
| **F17** `nor-nyrd` | partners `[ska]` only | kept + note | Freyr/Freyja's mother is Njörðr's nameless sister → `UNCERTAIN.md` |
| **F18** `nor-sif` | parents `[]`, partner Thor | verified; no change | attested |
| **F19** `nor-loomi` | parents `[]` | `[]` + note | Fárbauti + Laufey/Nál attested but not modelled → `UNCERTAIN.md` |
| **F20** `nor-forseti` | name "Fosite (Forsétir)" | display "Forseti" | Frisian place-name form removed from display |
| **F21** `nor-jarnsaxa` | name "Járnsaxa (Járnsaxa)" | "Járnsaxa" | duplicated gloss removed |
| **F22** `nor-anguela` | name "Angerboa" | "Angrboða" | Old Norse normalisation; "Angerboda" kept in alternative names |
| **F23** `nor-loomi` | partners `[anguela, sid]` | partners `[anguela]` | Sigyn (attested wife) not modelled; "sid" converted per F13 → `UNCERTAIN.md` |
| **X1** 2 Norse `major_myths` | `nor-thor-hrungnir`, `nor-jormungandr` on Thor | stripped | myths not authored → `UNCERTAIN.md` |
| **S5** `nor-muspel` / `nor-niflheim` | realms as entities | kept, classification `realm` | primordial realms modelled as nodes; gender `unknown` acceptable |
| **S6** `nor-aurdhumbla`, `nor-burir`, `nor-hodr`, `nor-tyr`, … | ASCII-folded ids vs diacritic names | ids kept | not errors; stable URLs |

### Egyptian

| id | before | after | why (source) |
|---|---|---|---|
| **F24** `egy-horus` | partners `[isfet]` | partners `[hathor]` | Horus's canonical consort is Hathor (Dendera/Edfu); Isis remains his mother |
| **F25** `egy-horus` / `egy-horus-elder` | horus.children `[horus-elder]`; horus-elder.parents `[]` | horus.children `[]`; horus-elder.parents `[horus]` | Harsomtus is a form/offspring of Horus at Edfu, not his father |
| **F26** `egy-set` | partners `[]` | partners `[nephthys]` | Nephthys is Set's consort throughout the sources |
| **F27** `egy-nephthys` | partners `[set, osiris]` | kept both + note | the Osiris liaison is the Plutarchan "false Osiris" episode → `UNCERTAIN.md` |
| **G6** `egy-anubis` | parents `[]` | parents `[set, nephthys]` + note | Set+Nephthys primary; Osiris+Nephthys Plutarchan variant → `UNCERTAIN.md` |
| **F28** `egy-ogdoad-khnum` | name "Khenunu & Khenunit (primordial mystery)" | "Kek & Kauket (primordial darkness)" | Hermopolitan Ogdoad's darkness pair is Kek/Kauket; "Khenunu" unattested |
| **F29** `egy-ogdoad-sat` | name "Sat & Satet (primordial duration)" | "Amun & Amaunet (primordial hiddenness)" | Ogdoad's fourth pair is Amun/Amaunet; Satet is the Elephantine goddess → `UNCERTAIN.md` |
| **F30** `egy-nun` / `egy-ogdoad-nun` | near-duplicate concept | kept both + cross-links | personified waters vs Ogdoad pair → `UNCERTAIN.md` |
| **S7** Ogdoad pairs | gender `unknown` | `other` (dual pair) | schema enum |
| **S8** `egy-aur` | name "Atum-Ra (the primordial waters' first god)" | "Atum-Ra" | gloss moved to description |
| **S9** `egy-ra` / `egy-aur` | two entities by design | kept + cross-link | syncretism documented → `UNCERTAIN.md` |
| **U2** `egy-thoth` | parentage empty | kept empty | traditions differ → `UNCERTAIN.md` |
| **U3** `egy-hathor` | — | kept as domain | "daughter of Ra" not asserted as parentage → `UNCERTAIN.md` |

### Slavic

| id | before | after | why (source) |
|---|---|---|---|
| **F31** `slv-svarog` | children `[veles]` | children `[dazhbog]` | PVL (under 980) glosses Dazhbog as "son of Svarog"; Veles is not Svarog's son → `UNCERTAIN.md` |
| **F32** `slv-dazhbog` | parents `[]` | parents `[svarog]` | same single chronicle gloss, same caveat → `UNCERTAIN.md` |
| **G7** Slavic artifacts | none | 7 relics created (Perun's axe, Perun's belt, Veles' horns, Mokosh's spindle, Morana's effigy, Jarilo's oak, Svarog's tongs) | Phase 4/2 work; all hero images license-verified |
| **U4–U9** `slv-svarog`, `slv-lada`, `slv-cherd`, `slv-zorya`, `slv-jarilo`, `slv-nebo` | reconstruction-heavy | kept with `evidence_status` / notes | not silently changed → `UNCERTAIN.md` |

### Mesopotamian

| id | before | after | why (source) |
|---|---|---|---|
| **F33** `mes-tiamat` / `mes-kingu` | tiamat.parents `[kingu]`; kingu.partners `[tiamat]` | tiamat.parents `[]`; tiamat.children `[kingu]`; kingu.parents `[tiamat]`; kingu.partners `[]` | *Enuma Elish* I: Tiamat is primeval; Kingu is her son/commander, exalted (not married) |
| **F34** `mes-erishkigal` | parents `[]` | parents `[apas]` + note | daughter of An (variant: An + Nammu/Antu) → `UNCERTAIN.md` |
| **F35** `mes-erishkigal-consort` | duplicate of Nergal | merged into `mes-nergal`; refs repointed | same god ("Nergal and Ereshkigal") |
| **F36** `mes-enki` | parents `[]` | parents `[apas]` + note | son of An; mother Nammu (not modelled) → `UNCERTAIN.md` |
| **F37** `mes-marduk` | parents `[enki]` | kept + note | *Enuma Elish*: son of Ea (Enki) + Damkina (not modelled) |
| **F38** `mes-nabu` | parents `[enki]` | parents `[marduk]` | Nabu is Marduk's son/vizier, not Enki's |
| **F39** `mes-enlil` | children `[…, nergal]` | kept + note | Erra myth ("seed of Enlil") |
| **F40** `mes-ki` | Ki as mother of Enlil/Enki | Enlil kept; Enki variant noted | Sumerian tradition → `UNCERTAIN.md` |
| **S10** `mes-apas` | id "apas" unexplained | id kept (URL stability), display = An | logged → `UNCERTAIN.md` |
| **S11** `mes-ki` | name "Ki (the earth)" | unchanged | fine |
| **U10/U11** `mes-inanna`/`mes-utu` parents; `mes-ninhursag` parentage | — | kept | standard / not needed |

### Cross-cutting

| id | before | after | why |
|---|---|---|---|
| **X1** | dangling `major_myths` (Greek 24, Norse 2) | stripped + logged | myths not authored → `UNCERTAIN.md` |
| **X2** | `gender:"none"` (Yamata-no-Orochi) | `"unknown"` | schema enum |
| **X3** | primordial realms-as-entities | `classification:"primordial"` / `realm` made consistent | schema consistency |
| **X4** | Norse artifact `status_note` key extra | kept (additive) | schema note |
| **X5** | `egy-aur` possessive in display name | cleaned (see S8) | display consistency |

---

## 3. Missing content (gaps to add later — listed, not invented)

These are known, bounded gaps. They are recorded here so a later content phase can fill them deliberately.

1. **Unmodelled parent/partner figures** (parentage notes currently point at absent entities): Ame-no-oshihomimi (Amaterasu's son), Watatsumi (sea god, Toyotama's father), Fárbauti + Laufey/Nál (Loki's parents), Sigyn (Loki's wife), Amphitrite (Poseidon's consort), Damkina (Marduk's mother), Nammu (Enki's mother), Nisaba/Tashmetu (Nabu's mother), Gríðr (Víðarr's mother), Rindr (Váli's mother), Jörð (Thor's mother).
2. **Missing myths referenced but not authored** (were dangling refs, now stripped): Orion, Cassandra, Actaeon, Arachne, Trojan horse, Hrungnir's duel, Thor & Jörmungandr fishing, Hermes' cattle-theft, Pandora, Persephone/Orpheus, etc.
3. **Thin galleries / domains:**
   - Mesopotamian has only **1 artifact** in the Vault (`mes-tablets-of-fate`) vs 4–7 elsewhere.
   - Egyptian has 3 artifacts; Japanese 4.
   - **Slavic card art:** 7 of 184 art slots missing — `slavic-slv-{perun-axe, perun-belt, veles-shapeshift, mokosh-spindle, morana-effigy, jarilo-green-oak, svarog-forge-tongs}.png`; 1 orphan PNG (`mesopotamian-mes-erishkigal-consort.png`).
   - Domains with a single card across all six cultures (thin archetypes for future expansion).
4. **Myth authoring:** 44 myths is dense for Greek but light for Slavic (5) and Mesopotamian (6); no dedicated creation-myth page per culture beyond `cosmology.json`.
5. **Legacy ids** (`mes-apas`=An, `nor-sid`=Svaðilfari, `egy-isfet`=Isis, `nor-loomi`=Loki, `nor-anguela`=Angrboða, `egy-ogdoad-khnum`=Kek/Kauket, `egy-ogdoad-sat`=Amun/Amaunet): display names corrected, ids kept for URL stability. A redirect-mapped id migration is a possible future cleanup (see `UNCERTAIN.md` §Legacy ids).

---

## 4. Weak descriptions (found and rewritten)

**This pass rewrote 37 description fields across 25 entities** — 21 card-summary/ story rewrites plus 16 factual-accuracy patches where the stored text still contradicted the audited data. The two `description_short` records under 60 chars and the two `description_long` records under 180 chars flagged by `docs/PLAN.md` were all addressed. No new claims were introduced; every rewrite stays inside the sources already cited on the entity and keeps the existing `[S#]` markers (the `validate` gate resolves them).

### 4.1 Flagged-by-length rewrites (the four the plan called out)

| id | field | before | after |
|---|---|---|---|
| `gre-let-o` | short (47) | "Titaness, mother of Apollo and Artemis by Zeus." | "The Titaness Leto, hunted by Hera's jealousy, who found refuge on the floating island of Delos and there bore Apollo and Artemis." |
| `nor-jarnsaxa` | short (53) | "The giantess who, with Thor, mothered Magni and Móði." | "The giantess Járnsaxa ('Iron-Saxa'), mother of Thor's sons Magni and Móði by the thunder-god." |
| `nor-modi` | long (125) | "Móði is the son of Thor and the giantess Járnsaxa, brother of Magni. The two are the next generation of divine strength …" | "Móði ('Wrath') is the son of Thor and the giantess Járnsaxa, and the brother of Magni [S2]. The two embody the strength that outlasts their father: after Thor falls to the world-serpent at Ragnarök, Móði and Magni are the ones who inherit the hammer Mjölnir [S1][S2]. Móði is the quieter of the pair, remembered chiefly through his name and his place in the line of divine strength [S2]." |
| `egy-ogdoad-sat` | long (140) | "Sat and Satet are the fourth pair of the Hermopolitan Ogdoad, representing primordial duration …" | "Amun and Amaunet are the fourth pair of the Hermopolitan Ogdoad, representing primordial hiddenness … [S4]. This Ogdoad-Amun is the principle of hiddenness, distinct from the later Theban king-god Amun (see egy-amun) …" |

### 4.2 Stale-description accuracy fixes (text that still repeated a corrected error)

These were the highest-value rewrites: the data fields had been fixed in the prior audit but the prose had not caught up.

| id | field | before (stale clause) | after |
|---|---|---|---|
| `jpn-toyotama` | short+long | "Daughter of Amaterasu … she becomes the sea goddess (Watatsumi)" | "Daughter of Watatsumi, the sea god, taken as Ninigi's bride … returns to her father's sea realm." |
| `jpn-ninigi` | long | "…the heavenly bride Toyotama-hime (Amaterasu's daughter)" | "…Toyotama-hime, the daughter of the sea god Watatsumi" |
| `mes-nabu` | short+long | "son of Enki (Ea)" | "son of Marduk … holding the written authority of the Tablet of Destinies" (temple corrected to Borsippa/Ezida) |
| `mes-enki` | long | "Enki is the father of Nabu" | "Enki is the father of Marduk … ancestor of Marduk's son, the scribe-god Nabu" |
| `slv-svarog` | short+long | "father of Veles" | "one chronicle gloss names father of Dazhbog" (single-gloss caveat stated) |
| `slv-veles` | short+long | "son of Svarog" | "He is not named as Svarog's son in the chronicle" |
| `egy-ogdoad-khnum` | short+long | "Khenunu and Khenunit represent primordial mystery" | "Kek and Kauket … primordial darkness" |
| `egy-horus-elder` | short+long | "an 'elder' Horus … is the father of the younger Horus" | "a form or offspring of Horus, not the father of the younger Horus" |
| `egy-horus` | long | "There is also an 'elder' Horus (Harsomatus / the son of the first Horus)" | "At Edfu, an 'elder' Horus (Harsomtus) appears as a form or offspring of the falcon god" |
| `nor-uthra` | short+long | "son of Thor" | "son of the goddess Sif, with Thor as his stepfather" |
| `nor-heimdall` | long | "son of Odin and of a giantess named Angrboða …" | "born of nine mothers, nine sisters … a skaldic kenning hints instead at Odin as father" |
| `mes-erishkigal` | long | "Inanna descends … to attend Ereshkigal's funeral … and is killed there" | "Inanna … is judged by Ereshkigal and the Anunnaki, struck down and hung on a hook before her restoration" |
| `nor-forseti`, `nor-baldr`, `nor-nanna` | long | "Fosite (Forsétir)" | "Forseti" (display-name normalisation per F20) |
| `nor-freyja` | long | "Freyrja is a complex …" | "Freyja is a complex …" (typo) |
| `nor-anguela`, `nor-fenrir` | long | "Angerboa (Angrboða)" | "Angrboða" (normalisation per F22) |
| `nor-sid` | long | "Gylfaginning IV–XIII:" | "Gylfaginning:" (wrong chapter range removed) |

### 4.3 Generic / flat rewrites (card-summary line made vivid and concrete)

| id | field | before | after |
|---|---|---|---|
| `nor-magni` | short | "The son of Thor (and the giantess Járnsaxa), a god of great strength." | "Thor's giant-born son, strong enough at three nights old to lift the fallen giant Hrungnir's leg from his father." |
| `nor-magni` | long | (near-duplicate of Móði's) | Hrungnir's leg + Gullfaxi + inheriting Mjölnir |
| `nor-modi` | short | "The son of Thor …; brother of Magni." | "Móði ('Wrath'), Thor's giant-born son and Magni's brother …" |
| `mes-ninagal` | short+long | "The consort of Nanna (the moon god); the 'light' of the moon." | "Ningal, wife of the moon-god Nanna and mother of Utu (the sun) and Inanna (the morning star) …" |

---

## 5. Stat balance review (PWR/GRD)

### 5.1 Rubric

As required, the review uses the card engine's own labels:

- **PWR** = mythological power / sovereignty tier. Sky-fathers, creators and pantheon heads sit at the top; minor local and nymph-tier figures at the bottom.
- **GRD** = protective / defensive role in the sources (a guardian or a protective emblem scores high; a purely offensive or fragile object scores low).

Because PWR/GRD are *derived* (§1.4), the tables below are the deterministic values the site actually renders; the "flag" column marks divergences from mythological standing. Fixes were possible only through `classification` (entities) and `power_profile` (artifacts).

### 5.2 Japan

| id | name | class | PWR | GRD | flag |
|---|---|---|---:|---:|---|
| jpn-kamimusubi | Takamimusubi | deity | 9 | 8 |  |
| jpn-amenominakanushi | Amenominakanushi | primordial | 8 | 7 |  |
| jpn-izananagi | Izanagi | deity | 7 | 7 |  |
| jpn-izananami | Izanami | deity | 9 | 4 |  |
| jpn-amaterasu | Amaterasu | deity | 10 | 7 |  |
| jpn-tsurugumo | Tsukuyomi | deity | 9 | 5 |  |
| jpn-susanoo | Susanoo | deity | 7 | 8 |  |
| jpn-kagutsuchi | Kagutsuchi | deity | 10 | 6 |  |
| jpn-konohanasakuhana | Konohanasakuya-hime | deity | 10 | 4 |  |
| jpn-ninigi | Ninigi | deity | 10 | 5 |  |
| jpn-toyotama | Toyotama-hime | deity | 10 | 4 |  |
| jpn-hooroni | Hooroni (Ōyahata) | deity | 7 | 7 |  |
| jpn-okuninushi | Ōkuninushi | deity | 7 | 8 |  |
| jpn-kotohikone | Kotohikone | deity | 10 | 6 |  |
| jpn-sarutahiko | Sarutahiko | deity | 8 | 7 |  |
| jpn-ameno-uzume | Ame-no-Uzume | deity | 10 | 6 |  |
| jpn-takemikazuchi | Takemikazuchi | deity | 9 | 5 |  |
| jpn-kushiinadahime | Kushinada-hime | deity | 6 | 8 |  |
| jpn-yamata-no-orochi | Yamata-no-Orochi | monster | 5 | 6 |  |
| jpn-inari | Inari | deity | 10 | 6 |  |
| jpn-yamato-takeru | Yamato Takeru | hero | 4 | 2 | low GRD (hero; intentional) |

### 5.3 Greece

| id | name | class | PWR | GRD | flag |
|---|---|---|---:|---:|---|
| gre-chaos | Chaos | primordial | 11 | 6 |  |
| gre-gaia | Gaia | deity | 8 | 4 | Gaia is a Protogenos; see note |
| gre-ouranos | Uranus | primordial | 11 | 7 |  |
| gre-cronus | Cronus | deity | 10 | 5 |  |
| gre-rhea | Rhea | deity | 7 | 6 |  |
| gre-zeus | Zeus | deity | 7 | 5 | **outlier:** pantheon head below many peers |
| gre-hera | Hera | deity | 10 | 6 |  |
| gre-hades | Hades | deity | 10 | 6 |  |
| gre-poseidon | Poseidon | deity | 9 | 6 |  |
| gre-athena | Athena | deity | 10 | 7 |  |
| gre-apollo | Apollo | deity | 10 | 8 |  |
| gre-artemis | Artemis | deity | 7 | 6 |  |
| gre-ares | Ares | deity | 9 | 8 |  |
| gre-aphrodite | Aphrodite | deity | 6 | 4 |  |
| gre-hermes | Hermes | deity | 10 | 4 |  |
| gre-dionysus | Dionysus | deity | 9 | 6 |  |
| gre-hephaestus | Hephaestus | deity | 9 | 5 |  |
| gre-demeter | Demeter | deity | 9 | 7 |  |
| gre-persephone | Persephone | deity | 10 | 5 |  |
| gre-hestia | Hestia | deity | 9 | 6 |  |
| gre-let-o | Leto | deity | 6 | 5 |  |
| gre-metis | Metis | deity | 9 | 5 |  |
| gre-perseus | Perseus | hero | 4 | 6 |  |
| gre-medusa | Medusa | monster | 5 | 5 |  |
| gre-typhon | Typhon | monster | 8 | 7 |  |
| gre-cerberus | Cerberus | monster | 6 | 5 | guardian hound; GRD mid — see note |
| gre-heracles | Heracles | hero | 4 | 4 |  |
| gre-odysseus | Odysseus | hero | 6 | 4 |  |
| gre-maia | Maia | minor deity | 3 | 5 | **adjusted** (was deity; nymph) |
| gre-atlas | Atlas | deity | 9 | 8 |  |
| gre-danae | Danae | mortal | 2 | 6 |  |
| gre-semele | Semele | mortal | 4 | 4 |  |
| gre-eros | Eros | deity | 7 | 6 |  |
| gre-andromeda | Andromeda | mortal | 3 | 6 |  |
| gre-echidna | Echidna | monster | 5 | 3 | low GRD |
| gre-oceanus | Oceanus | deity | 9 | 4 |  |
| gre-tethys | Tethys | deity | 7 | 4 |  |
| gre-alcmena | Alcmena | mortal | 4 | 3 | low GRD |
| gre-penelope | Penelope | mortal | 4 | 6 |  |
| gre-telemachus | Telemachus | mortal | 5 | 6 |  |
| gre-hebe | Hebe | deity | 9 | 7 | minor Olympian; see note |

### 5.4 Norse

| id | name | class | PWR | GRD | flag |
|---|---|---|---:|---:|---|
| nor-ginnungagap | Ginnungagap | realm | 6 | 4 |  |
| nor-muspel | Muspel (fire) | realm | 2 | 3 | realm, not a combatant |
| nor-niflheim | Niflheim (ice) | realm | 6 | 6 |  |
| nor-ymir | Ymir | giant | 5 | 4 | primordial ancestor; see note |
| nor-aurdhumbla | Auðhumbla | creature | 3 | 2 |  |
| nor-burir | Búri | deity | 6 | 5 |  |
| nor-borr | Borr | deity | 10 | 4 |  |
| nor-bestla | Bestla | giant | 6 | 6 |  |
| nor-odin | Odin | deity | 8 | 7 |  |
| nor-vili | Vili | deity | 6 | 7 |  |
| nor-ve | Vé | deity | 10 | 8 |  |
| nor-thor | Thor | deity | 7 | 7 |  |
| nor-frigg | Frigg | deity | 9 | 4 |  |
| nor-baldr | Baldr | deity | 8 | 6 |  |
| nor-hodr | Höðr | deity | 6 | 8 |  |
| nor-loomi | Loki | trickster | 4 | 3 | **outlier:** object-tier band for a major god |
| nor-tyr | Týr | deity | 6 | 8 |  |
| nor-freyr | Freyr | deity | 10 | 7 |  |
| nor-freyja | Freyja | deity | 10 | 4 |  |
| nor-nyrd | Njord | deity | 7 | 4 |  |
| nor-heimdall | Heimdall | deity | 10 | 4 | **outlier:** watchman with low GRD |
| nor-vidar | Víðarr | deity | 10 | 6 |  |
| nor-vali | Váli | deity | 7 | 4 |  |
| nor-fenrir | Fenrir | monster | 4 | 7 |  |
| nor-jormungandr | Jörmungandr | monster | 5 | 5 |  |
| nor-hel | Hel | deity | 6 | 5 |  |
| nor-sleipnir | Sleipnir | creature | 6 | 2 | mount, low GRD (intentional) |
| nor-anguela | Angrboða | giant | 7 | 4 |  |
| nor-sif | Sif | deity | 8 | 6 |  |
| nor-uthra | Ullr | deity | 7 | 6 |  |
| nor-nanna | Nanna | deity | 10 | 4 |  |
| nor-forseti | Forseti | deity | 10 | 8 |  |
| nor-magni | Magni | deity | 7 | 6 |  |
| nor-modi | Móði | deity | 6 | 4 |  |
| nor-jarnsaxa | Járnsaxa | giant | 5 | 7 |  |
| nor-gerd | Gerðr | giant | 9 | 6 | giantess with top-band PWR |
| nor-ska | Skaði | deity | 6 | 8 |  |
| nor-surt | Surt | giant | 9 | 6 |  |
| nor-hrungnir | Hrungnir | giant | 8 | 3 |  |
| nor-sid | Svaðilfari | creature | 3 | 2 | **adjusted** (was giant; a horse) |

### 5.5 Egypt

| id | name | class | PWR | GRD | flag |
|---|---|---|---:|---:|---|
| egy-aur | Atum-Ra | primordial | 11 | 8 |  |
| egy-nun | Nun | primordial | 10 | 6 |  |
| egy-apep | Apep (Apophis) | monster | 7 | 5 |  |
| egy-shu | Shu | deity | 8 | 6 |  |
| egy-tefnut | Tefnut | deity | 8 | 5 |  |
| egy-gebel | Geb | deity | 6 | 5 |  |
| egy-nut | Nut | deity | 7 | 6 |  |
| egy-osiris | Osiris | deity | 6 | 8 |  |
| egy-isfet | Isis | deity | 10 | 8 |  |
| egy-horus | Horus | deity | 8 | 6 |  |
| egy-set | Set (Seth) | deity | 6 | 5 |  |
| egy-nephthys | Nephthys | deity | 6 | 7 |  |
| egy-ra | Ra | deity | 7 | 4 | **outlier:** sun-king near the bottom band |
| egy-amun | Amun | deity | 6 | 7 |  |
| egy-ptah | Ptah | deity | 10 | 4 |  |
| egy-thoth | Thoth | deity | 6 | 6 |  |
| egy-hathor | Hathor | deity | 8 | 6 |  |
| egy-bastet | Bastet | deity | 8 | 6 |  |
| egy-sekhemet | Sekhmet | deity | 8 | 5 |  |
| egy-anubis | Anubis | deity | 6 | 6 |  |
| egy-ogdoad-nun | Nun & Naunet | primordial | 8 | 7 |  |
| egy-ogdoad-heh | Heh & Hehet | primordial | 7 | 8 |  |
| egy-ogdoad-khnum | Kek & Kauket | primordial | 10 | 7 |  |
| egy-ogdoad-sat | Amun & Amaunet | primordial | 8 | 6 |  |
| egy-horus-elder | Horus the Elder | deity | 10 | 8 |  |

### 5.6 Slavic

| id | name | class | PWR | GRD | flag |
|---|---|---|---:|---:|---|
| slv-nebo | Nebo | deity | 10 | 8 |  |
| slv-perun | Perun | deity | 9 | 4 |  |
| slv-veles | Veles | deity | 6 | 5 |  |
| slv-svarog | Svarog | deity | 10 | 6 |  |
| slv-dazhbog | Dazhbog | deity | 7 | 4 |  |
| slv-khors | Khors | deity | 6 | 7 |  |
| slv-stribog | Stribog | deity | 10 | 7 |  |
| slv-mokosh | Mokosh | deity | 8 | 5 |  |
| slv-lada | Lada | deity | 10 | 7 | disputed deity (see UNCERTAIN.md) |
| slv-morana | Morana | deity | 7 | 8 |  |
| slv-jarilo | Jarilo (Kupala) | deity | 6 | 7 | reconstruction (see UNCERTAIN.md) |
| slv-zorya | Zorya | deity | 10 | 6 | reconstruction (see UNCERTAIN.md) |
| slv-cherd | Cherd (Chert) | deity | 7 | 6 | disputed (see UNCERTAIN.md) |

### 5.7 Mesopotamia

| id | name | class | PWR | GRD | flag |
|---|---|---|---:|---:|---|
| mes-apas | An (Anu) | deity | 10 | 6 | pantheon head; see note |
| mes-ki | Ki (the earth) | primordial | 11 | 8 |  |
| mes-abzu | Apsu | primordial | 10 | 8 |  |
| mes-tiamat | Tiamat | primordial | 10 | 4 |  |
| mes-kingu | Kingu | deity | 10 | 7 |  |
| mes-enlil | Enlil | deity | 6 | 7 | **outlier:** "king of the gods" with low PWR |
| mes-enki | Enki (Ea) | deity | 6 | 5 |  |
| mes-ninlil | Ninlil | deity | 6 | 8 |  |
| mes-nanna | Nanna (Sin) | deity | 7 | 6 |  |
| mes-utu | Utu (Shamash) | deity | 9 | 4 |  |
| mes-inanna | Inanna (Ishtar) | deity | 9 | 8 |  |
| mes-erishkigal | Ereshkigal | deity | 6 | 5 |  |
| mes-nergal | Nergal | deity | 10 | 6 |  |
| mes-marduk | Marduk | deity | 8 | 4 |  |
| mes-antum | Antu (Anatum) | deity | 9 | 8 |  |
| mes-ninhursag | Ninhursag | deity | 10 | 8 |  |
| mes-ninagal | Ningal | deity | 8 | 4 |  |
| mes-nabu | Nabu | deity | 7 | 8 |  |

### 5.8 Relic cards (26 artifacts)

| id | name | tier/rank | PWR | GRD | note |
|---|---|---|---:|---:|---|
| jpn-kusanagi | Kusanagi-no-Tsurugi | divine/S | 10 | 9 |  |
| jpn-yata-kagami | Yata no Kagami | divine/S | 10 | 8 |  |
| jpn-yasakani | Yasakani no Magatama | divine/S | 9 | 8 |  |
| jpn-amenonuboko | Ame-no-Nuboko | divine/S | 10 | 3 | guard from seeded fallback (no DEFENSE attrs) |
| gre-zeus-thunderbolt | Thunderbolt of Zeus | divine/S | 10 | 5 | guard fallback |
| gre-aegis | Aegis | divine/S | 10 | 10 | pure defensive emblem — correct top GRD |
| gre-hades-helmet | Helmet of Hades | legendary/A | 9 | 5 | **adjusted** (PWR 11→9) |
| gre-poseidon-trident | Trident of Poseidon | divine/S | 10 | 1 | **outlier:** divine relic at the guard floor (see note) |
| gre-hermes-caduceus | Caduceus of Hermes | legendary/A | 8 | 3 | guard fallback |
| nor-mjolnir | Mjölnir | divine/S | 10 | 10 | protection + consecration — correct top GRD |
| nor-gungnir | Gungnir | divine/S | 11 | 9 |  |
| nor-draupnir | Draupnir | legendary/A | 9 | 5 | guard fallback |
| nor-brisingamen | Brísingamen | legendary/A | 9 | 7 |  |
| nor-gjallarhorn | Gjallarhorn | legendary/A | 9 | 3 | guard fallback |
| nor-skidbladnir | Skíðblaðnir | legendary/A | 10 | 8 |  |
| egy-peschent | Pschent | legendary/A | 10 | 7 |  |
| egy-ankh | Ankh | legendary/A | 9 | 8 |  |
| egy-heka | Heka (Crook & Flail) | legendary/A | 9 | 6 |  |
| slv-perun-axe | Perun's Thunderbolt Axe | divine/S | 10 | 9 |  |
| slv-perun-belt | Perun's Rain-Belt | sacred/A | 8 | 6 |  |
| slv-veles-shapeshift | Veles' Shapeshift Horns | legendary/A | 7 | 6 |  |
| slv-mokosh-spindle | Mokosh's Spindle | divine/S | 8 | 7 |  |
| slv-morana-effigy | Morana's Straw Effigy | legendary/A | 8 | 4 | intentionally fragile effigy |
| slv-jarilo-green-oak | Jarilo's Green Oak Branch | sacred/A | 7 | 5 |  |
| slv-svarog-forge-tongs | Svarog's Smith Tongs | cosmic/SS | 8 | 7 |  |
| mes-tablets-of-fate | Tablets of Destiny | cosmic/SS | 10 | 10 | correct top stats |

### 5.9 Adjustments made (before → after → why)

| card | field | before | after | why |
|---|---|---|---|---|
| `gre-maia` | `classification` | `deity` | `minor deity` | The entity's own sourced description calls her a **Nymph** (a Pleiad). As a full-deity-tier card the seeded roll gave her PWR 7 / GRD 7 — outranking the pantheon head Zeus (7 / 5), exactly the "nymph-tier figure outranking a pantheon head" case in the spec. Re-tiering fixes the derived band (now PWR 3 / GRD 5, rarity uncommon) without hand-editing a stat. |
| `nor-sid` | `classification` | `giant` | `creature` | F13 converted this record from the unattested "Síd, giantess" to **Svaðilfari**, the builder's stallion, but the type field still said `giant`. A horse is a `creature`; correcting it also drops the card out of the giant band (PWR 6→3). |
| `gre-hades-helmet` | `power_profile` `TRANSFORMATION` | value 9 | value 6 (+ explanation rewritten) | Invisibility was being scored as top-tier offensive power, making a legendary utility helmet the joint-highest-PWR relic (11, tied with divine Gungnir) above the supreme weapons. Lowering it to 6 yields PWR 9, below the divine weapons, matching its tier. The explanation now states the rubric (stealth/utility ≠ raw might). |

### 5.10 Outliers deliberately left alone (borderline → flagged in `UNCERTAIN.md` / here)

- **`gre-zeus` PWR 7 / GRD 5** and **`egy-ra` PWR 7 / GRD 4** and **`mes-enlil` PWR 6** — the most jarring divergences (pantheon heads below peers). They are artifacts of the seeded roll, not of classification; fixing them would require either a hand-set stat field (→ `app/lib/card.ts`, outside this phase's file scope) or falsifying classification (Zeus/Ra/Enlil are unquestionably full deities). **Left as-is and flagged.** Recommended code fix for a later phase: let an optional `stats` override in `entities.json` take precedence in `statsOf`.
- **`nor-loomi` (Loki) PWR 4 / GRD 3** — classified `trickster`, a value outside the schema enum that falls through to the −2 default bucket (same as realms/objects). Loki is a major god. Changing the data to a real enum value would be a taxonomy decision; flagged instead.
- **`nor-heimdall` GRD 4** — the watchman of Bifröst should be a guardian archetype, but GRD is a roll. Flagged.
- **`gre-poseidon-trident` GRD 1** — the guard *floor*. Per the rubric GRD = protective/defensive role, and a trident is purely offensive, so a low value is defensible; but the absolute floor reads as a bug. Left as-is and flagged rather than inventing a defensive attribute.
- **`gre-gaia` deity vs `gre-ouranos`/`gre-chaos` primordial** — arguably inconsistent (all three are Protogenoi). A modelling call, not a stat bug; flagged.
- **`nor-ymir` giant**, **`nor-muspel` realm PWR 2**, **`gre-hebe` deity PWR 9** — taxonomy/roll artifacts; flagged.
- **`gre-cerberus` GRD 5** — the underworld's guardian hound scores mid-GRD; a candidate for an override when the override mechanism exists.

### 5.11 Summary

- **Stats adjusted: 3 cards** (`gre-maia`, `nor-sid` classifications; `gre-hades-helmet` power profile). All changes are expressed in the allowed data files (`data/*/entities.json`, `data/*/artifacts.json`); no structural changes, no entries added/removed.
- **Outliers flagged, not fixed: 10** (Zeus, Ra, Enlil, Loki, Heimdall, Poseidon's trident, Gaia, Ymir, Muspel, Hebe, plus Cerberus's guard) — see §5.10.
- **Root cause worth recording:** entity PWR/GRD are hash-seeded, so rank inversions are statistically expected. A per-entity `stats` override read by `statsOf` (a one-line change in `app/lib/card.ts`, outside this phase's scope) is the correct durable fix and is recommended for a later phase.

---

*End of report. Data edits: `data/*/entities.json` (descriptions + 2 classifications), `data/*/artifacts.json` (1 power profile). Gates re-run after these changes: `npx tsc --noEmit`, `npm run build`, `npm run validate`.*
