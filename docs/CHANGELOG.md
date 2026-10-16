# Changelog — Divine Atlas overhaul

Format: newest first. Every content correction lists what was wrong → what it is now → why (source).

## 2026-10-17 — Setup
- Created branch `atlas-overhaul-2026-10` from `main` (backup commit `1e62f5a`).
- Added `docs/PLAN.md` (project map + phase plan) and this changelog.
- Baseline checks: `npm run validate`, `npx tsc --noEmit`, `npm run build` — results logged below.

## 2026-10-17 — Phase 1: Content audit

Deterministic sweep (dup ids/names, broken cross-refs, empty fields, id/name mismatches) + manual genealogy review of all 159 entities and 18 artifacts. Findings doc: `docs/audit/PHASE1-FINDINGS.md`; disputed items: `docs/UNCERTAIN.md`. **110 logged corrections** (each with source citation in `scripts/audit_fix_phase1.mjs`). Highlights:

### Corrections (what was wrong → what it is now → why)

| entity | field | before | after | why (source) |
|---|---|---|---|---|
| `jpn-susanoo` | parents | [] | ["jpn-izananagi", "jpn-izananami"] | F1: Kojiki — Susanoo born of Izanagi (washing at river mouth) and Izanami; Kushinada-hime was wrongly both parent and child (she is his descendant/bride, Gx. Yamata-no-Orochi episode). |
| `jpn-susanoo` | children | ["jpn-kushiinadahime"] | [] | F1: Kushinada-hime is Susanoo's bride and descendant (after 8 generations, per Kojiki), not his child. |
| `jpn-amaterasu` | children | ["jpn-toyotama"] | [] | F2: Toyotama-hime is Amaterasu's great-granddaughter (via Ame-no-oshihomimi -> Ninigi), not daughter. Her son Ame-no-oshihomimi is not in the dataset. |
| `jpn-konohanasakuhana` | parents | [] | ["jpn-okuninushi"] | F3: Kojiki/Nihon Shoki — Konohanasakuya-hime is a daughter of Ōkuninushi (Izumo), given in marriage to Ninigi. She was wrongly listed as Ninigi's parent AND child. |
| `jpn-konohanasakuhana` | partners | ["jpn-ninigi"] | ["jpn-ninigi"] | F3: she is Ninigi's wife (both entries now reciprocal). |
| `jpn-toyotama` | parents | ["jpn-amaterasu"] | [] | F4: Toyotama-hime is the sea god Watatsumi's daughter (Watatsumi not in dataset); she was wrongly listed as Amaterasu's daughter. |
| `jpn-ninigi` | parents | ["jpn-amaterasu"] | [] | F5: Ninigi is Amaterasu's GRANDSON (son of Ame-no-oshihomimi), not son. Parent entity not in dataset. |
| `jpn-amaterasu` | parents | [] | ["jpn-izananagi", "jpn-izananami"] | G1: Kojiki — sun and moon born from Izanagi's purification (washing left/right eye); Izanami co-creator of the three noble children in the same passage. |
| `jpn-tsurugumo` | parents | [] | ["jpn-izananagi", "jpn-izananami"] | G1: Kojiki — Tsukuyomi born of Izanagi (washing right eye). |
| `jpn-yamata-no-orochi` | gender | "none" | "unknown" | X2: normalize gender "none" -> "unknown" (schema enum). |
| `jpn-kamimusubi` | name | "Takamimusubi" | "Takamimusubi" | S1: display name kept as Takamimusubi (matches description); id kept for URL stability. |
| `gre-hephaestus` | children | ["gre-ares"] | [] | F7: Ares is Hephaestus's BROTHER (son of Zeus+Hera), not his child. Hephaestus's only near-attested offspring are fragmentary/minor (e.g. the Kadmeiloi, Erichthonios as foster-son). |
| `gre-gaia` | children | ["gre-ouranos", "gre-oceanus", "gre-tethys"] | ["gre-ouranos", "gre-oceanus", "gre-tethys", "gre-cronus", "gre-rhe... | G2: Hesiod Theogony — Gaia bore Ouranos, the Titans (incl. Kronos, Rhea), the Oceanids/Tethys, Pontus, and (with Tartarus) Typhon. Only dataset members listed. |
| `gre-persephone` | parents | ["gre-demeter"] | ["gre-zeus", "gre-demeter"] | G3: Hesiod Theogony 912-914 — Persephone is daughter of Zeus and Demeter (Zeus was missing). |
| `gre-zeus` | major_myths | ["gre-creation", "gre-titanomachy", "gre-zeus-eye", "gre-persephone"] | ["gre-creation", "gre-titanomachy", "gre-persephone"] | X1: stripped dangling myth refs (gre-zeus-eye) — those myths are not authored in myths.json |
| `gre-hades` | major_myths | ["gre-persephone", "gre-orpheus-eurydice"] | ["gre-persephone"] | X1: stripped dangling myth refs (gre-orpheus-eurydice) — those myths are not authored in myths.json |
| `gre-athena` | major_myths | ["gre-athena-birth", "gre-athena-athens", "gre-pandora", "gre-odyss... | ["gre-athena-birth", "gre-athena-athens", "gre-odysseus-kyklops"] | X1: stripped dangling myth refs (gre-pandora) — those myths are not authored in myths.json |
| `gre-apollo` | major_myths | ["gre-python-slaying", "gre-cassandra", "gre-narcissus"] | [] | X1: stripped dangling myth refs (gre-python-slaying, gre-cassandra, gre-narcissus) — those myths are not authored in myths.json |
| `gre-artemis` | major_myths | ["gre-actaeon", "gre-orion", "gre-arachne"] | [] | X1: stripped dangling myth refs (gre-actaeon, gre-orion, gre-arachne) — those myths are not authored in myths.json |
| `gre-ares` | major_myths | ["gre-ares-aphrodite-caught"] | [] | X1: stripped dangling myth refs (gre-ares-aphrodite-caught) — those myths are not authored in myths.json |
| `gre-aphrodite` | major_myths | ["gre-aphrodite-birth", "gre-aphrodite-adonis", "gre-ares-caught"] | ["gre-aphrodite-birth"] | X1: stripped dangling myth refs (gre-aphrodite-adonis, gre-ares-caught) — those myths are not authored in myths.json |
| `gre-hermes` | major_myths | ["gre-hermes-cattle-theft", "gre-hermes-psychopomp"] | [] | X1: stripped dangling myth refs (gre-hermes-cattle-theft, gre-hermes-psychopomp) — those myths are not authored in myths.json |
| `gre-dionysus` | major_myths | ["gre-dionysus-birth", "gre-dionysus-indo-europeans"] | [] | X1: stripped dangling myth refs (gre-dionysus-birth, gre-dionysus-indo-europeans) — those myths are not authored in myths.json |
| `gre-hephaestus` | major_myths | ["gre-hephaestus-zeus-throne", "gre-hephaestus-aphrodite-net"] | [] | X1: stripped dangling myth refs (gre-hephaestus-zeus-throne, gre-hephaestus-aphrodite-net) — those myths are not authored in myths.json |
| `gre-demeter` | major_myths | ["gre-persephone", "gre-eleusinian-mysteries"] | ["gre-persephone"] | X1: stripped dangling myth refs (gre-eleusinian-mysteries) — those myths are not authored in myths.json |
| `gre-perseus` | major_myths | ["gre-perseus-medusa", "gre-andromeda"] | ["gre-perseus-medusa"] | X1: stripped dangling myth refs (gre-andromeda) — those myths are not authored in myths.json |
| `gre-cerberus` | major_myths | ["gre-heracles-cerberus"] | [] | X1: stripped dangling myth refs (gre-heracles-cerberus) — those myths are not authored in myths.json |
| `gre-heracles` | major_myths | ["gre-heracles-labors", "gre-heracles-cerberus"] | ["gre-heracles-labors"] | X1: stripped dangling myth refs (gre-heracles-cerberus) — those myths are not authored in myths.json |
| `gre-odysseus` | major_myths | ["gre-odysseus-kyklops", "gre-odysseus-trojan"] | ["gre-odysseus-kyklops"] | X1: stripped dangling myth refs (gre-odysseus-trojan) — those myths are not authored in myths.json |
| `gre-atlas` | major_myths | ["gre-atlas-sky"] | [] | X1: stripped dangling myth refs (gre-atlas-sky) — those myths are not authored in myths.json |
| `gre-semele` | major_myths | ["gre-dionysus-birth"] | [] | X1: stripped dangling myth refs (gre-dionysus-birth) — those myths are not authored in myths.json |
| `nor-ymir` | parents | ["nor-ginnungagap"] | [] | F10: Gylfaginning — Ymir was "sjálfborn" (self-born), formed where venom-drops from Niflheim met the sparks of Muspel in the Ginnungagap void. Ginnungagap is a void, not a parent. |
| `nor-ymir` | children | ["nor-burir"] | [] | F11: Búri is NOT Ymir's son — Auðumbla licked him out of the salt-rime blocks over three days (Gylfaginning IV). Ymir's own offspring: the six-headed giant and (from under his arm) a man and woman. |
| `nor-burir` | parents | [] | [] | F11: Búri's "origin" is being licked out of rime by Auðumbla (Gylfaginning IV) — not parentage. Note added. |
| `nor-uthra` | parents | ["nor-thor", "nor-sif"] | ["nor-sif"] | F12: Ullr is the son of Sif (Gylag. 31 "Ullar ok svá kalla en þat er sonarsonar..."/stepson tradition) and an unnamed father; Thor is his STEPFATHER, not parent. Þrúðgelmir (giant, grandfather) appears in a late þulur gloss. |
| `nor-sid` | entity | {"name": "Síd", "gender": "female", "domains": ["the giantess who b... | "converted to Svaðilfari (male stallion)" | F13: "Síd" is unattested; the entity described (mother of Sleipnir with Loki) misstates Gylfaginning XIII — Sleipnir's other parent is the stallion Svaðilfari, and Loki bore Sleipnir himself AS a mare. Converted to Svaðilfari, id kept for URL stability. |
| `nor-sleipnir` | parents | ["nor-loomi"] | ["nor-loomi", "nor-sid"] | F13: Sleipnir's parents = Loki (as a mare) + Svaðilfari (Gylfaginning XIII). |
| `nor-odin` | children | ["nor-baldr", "nor-vidar", "nor-vali", "nor-thor", "nor-heimdall"] | ["nor-baldr", "nor-vidar", "nor-vali", "nor-thor", "nor-hodr"] | F14: Heimdall removed from Odin's children — Gylfaginning says he is born of nine mothers; Odin-filiation is uncertain (see UNCERTAIN.md). Höðr added (son of Odin+Frigg, Gylfaginning 22-33). |
| `nor-heimdall` | parents | ["nor-odin"] | [] | F14: Gylfaginning 27 — Heimdall is "the white god... born of nine mothers, nine sisters"; no parentage fixed. Old Norse sources also call him son of Odin in a skaldic hint (see note). |
| `nor-frigg` | children | ["nor-baldr", "nor-vidar", "nor-vali"] | ["nor-baldr", "nor-hodr"] | F15/F16: Frigg's attested sons are Baldr and Höðr (Gylfaginning 33, 49). Víðarr's mother is the giantess Gríðr (Gylfaginning 31); Váli (son of Odin and Rindr) is not Frigg's (Gylfaginning 33). |
| `nor-hodr` | parents | ["nor-odin", "nor-frigg"] | ["nor-odin", "nor-frigg"] | F16: Höðr is son of Odin and Frigg (Gylfaginning 33 "son of Odin... Frigg bore Höðr"); was missing both parents. |
| `nor-odin` | children | ["nor-baldr", "nor-vidar", "nor-vali", "nor-thor", "nor-hodr"] | ["nor-baldr", "nor-vidar", "nor-vali", "nor-thor", "nor-hodr"] | F16: Höðr added to Odin's children (Gylfaginning 33). |
| `nor-forseti` | name | "Fosite (Forsétir)" | "Forseti" | F20: normalized display name (Fosite is the Frisian place-name form; Forseti is the normalized Old Norse). |
| `nor-jarnsaxa` | name | "Járnsaxa (Járnsaxa)" | "Járnsaxa" | F21: removed duplicated gloss "Járnsaxa (Járnsaxa)". |
| `nor-anguela` | name | "Angerboa" | "Angrboða" | F22: normalized to Old Norse Angrboða ("Angerboa" was an Anglicization); kept in alternative_names. |
| `nor-loomi` | partners | ["nor-anguela", "nor-sid"] | ["nor-anguela"] | F23: Sigyn (attested wife) is not in the dataset; Síd entry converted to Svaðilfari (a mate, not a partner). Angrboða kept as consort. |
| `nor-thor` | major_myths | ["nor-thor-geirdrud", "nor-thor-hrungnir", "nor-ragnarok", "nor-jor... | ["nor-thor-geirdrud", "nor-ragnarok"] | X1: stripped dangling myth refs (nor-thor-hrungnir, nor-jormungandr) |
| `egy-horus` | partners | ["egy-isfet"] | ["egy-hathor"] | F24: Horus's canonical consort is Hathor (divine couple throughout the temple cult; e.g. Dendera/Edfu). Isis-as-consort is rare magical-text usage. Isis remains his MOTHER. |
| `egy-horus` | children | ["egy-horus-elder"] | [] | F25: Harsomtus ("Horus the Elder"/Horus-Unite-the-Two-Lands at Edfu) is a FORM/offspring of Horus, not his father. Inverted relation removed. |
| `egy-horus-elder` | parents | [] | ["egy-horus"] | F25: Harsomtus is a form/offspring of Horus (Edfu cosmogony: born in the nest of the sun-bark); previously he was listed as Horus's father. |
| `egy-set` | partners | [] | ["egy-nephthys"] | F26: Nephthys is Set's consort throughout the sources (Pyramid Texts; Plutarch De Iside; the divine court of the Contendings). She already listed Set — now reciprocal. |
| `egy-anubis` | parents | [] | ["egy-set", "egy-nephthys"] | G6: Anubis's parents vary by source: Set+Nephthys (late temple tradition) or Osiris+Nephthys (Plutarch De Iside 12-14). Set chosen as primary (matches the dataset's Set-Nephthys marriage); variant noted. |
| `egy-ogdoad-khnum` | name | "Khenunu & Khenunit (primordial mystery)" | "Kek & Kauket (primordial darkness)" | F28: the Hermopolitan Ogdoad's darkness pair is KEK (male frog) & KAUKET (female snake) — "Khenunu & Khenunit" is not attested. id kept for URL stability. |
| `egy-ogdoad-sat` | name | "Sat & Satet (primordial duration)" | "Amun & Amaunet (primordial hiddenness)" | F29: the Ogdoad's fourth pair is AMUN & AMAUNET ("hiddenness") — "Sat & Satet" is wrong (Satet is the Elephantine goddess). id kept for URL stability. |
| `egy-ogdoad-nun` | gender | "unknown" | "other" | S7: Ogdoad entries are male+female PAIRS (frog/snake); "unknown" -> "other" (dual pair) for schema clarity. |
| `egy-ogdoad-heh` | gender | "unknown" | "other" | S7: Ogdoad entries are male+female PAIRS (frog/snake); "unknown" -> "other" (dual pair) for schema clarity. |
| `egy-ogdoad-khnum` | gender | "unknown" | "other" | S7: Ogdoad entries are male+female PAIRS (frog/snake); "unknown" -> "other" (dual pair) for schema clarity. |
| `egy-ogdoad-sat` | gender | "unknown" | "other" | S7: Ogdoad entries are male+female PAIRS (frog/snake); "unknown" -> "other" (dual pair) for schema clarity. |
| `egy-aur` | name | "Atum-Ra (the primordial waters' first god)" | "Atum-Ra" | S8: cleaned display name (gloss "the primordial waters' first god" moved to description). |
| `slv-svarog` | children | ["slv-veles"] | ["slv-dazhbog"] | F31: the Primary Chronicle (Ipatian, Laurentian; under 980) glosses Dazhbog as "son of Svarog" — Veles is NOT Svarog's son. One gloss only; see UNCERTAIN.md. |
| `slv-dazhbog` | parents | [] | ["slv-svarog"] | F32: "Dazhbog, son of Svarog" — the chronicle gloss under Vladimir's pantheon (PVL, 1113/980 entry). Single-source; flagged. |
| `mes-tiamat` | parents | [] | [] | F33: Enuma Elish I — Tiamat is PRIMEVAL (salt water), "first of them, their mother-goddess"; Kingu is her son and army-commander. Inverted parentage removed. |
| `mes-tiamat` | children | [] | ["mes-kingu"] | F33: Kingu (Qingu) is Tiamat's son, exalted to "carry the tablets, decree destinies" (Enuma Elish I 27-29), later executed to create humankind (VI 33-38). |
| `mes-kingu` | parents | [] | ["mes-tiamat"] | F33: Kingu is son of Tiamat (Enuma Elish I). |
| `mes-kingu` | partners | ["mes-tiamat"] | [] | F33: Tiamat "exalted" Kingu to husband-position (gave him the tablet of destinies) — a promotion, not a marriage; reciprocal partner link removed, note kept. |
| `mes-erishkigal` | parents | [] | ["mes-apas"] | F34: Ereshkigal is a daughter of An in the Sumerian tradition (e.g. Enlil and Ninlil: "seed of An... Ereshkigal"); variant: daughter of An + Nammu/Antu (Nammu not in dataset). |
| `mes-erishkigal-consort` | entity | "Nergal (Ereshkigal's consort)" | "MERGED into mes-nergal" | F35: duplicate of Nergal (same god: consort of Ereshkigal in "Nergal and Ereshkigal"). Deletion allowed for duplicates; references repointed to mes-nergal. |
| `mes-enki` | parents | [] | ["mes-apas"] | F36: Enki is a son of An in the Sumerian tradition (Enki and the World Order; An's "counselor"); his mother is Nammu (the primeval sea) in the Enki-birth tradition — Nammu not in dataset. |
| `mes-nabu` | parents | ["mes-enki"] | ["mes-marduk"] | F38: Nabu is the son of MARDUK (and Nisaba/Tashmetu as mother/consort in different lists) — god of writing, Marduk's vizier. Was wrongly listed as Enki's son. |

### Uncertainty notes added (41)

- `jpn-amaterasu`: Audit 2026-10: previously listed Toyotama-hime as her daughter — corrected (she is a great-granddaughter through Ame-no-oshihomimi and Ninigi). Amaterasu's divine son Ame-no-oshihomimi is not modeled 
- `jpn-toyotama`: Audit 2026-10: father is the sea deity Watatsumi (not in this dataset); wife of Ninigi, mother of Ugayafukiaezu and Hoori.
- `jpn-ninigi`: Audit 2026-10: Ninigi is the son of Ame-no-oshihomimi and Takahara-bikihime, hence grandson of Amaterasu; sent to earth in the tenson kōrin (descent of the heavenly grandchild).
- `jpn-kamimusubi`: Audit 2026-10: Kojiki names TWO separate primordial deities, Takamimusubi ("high producer") and Kamimusubi ("divine producer"). This entity follows the Takamimusubi tradition (id kept for URL stabilit
- `gre-eros`: Audit 2026-10: parentage depends on the source — Hesiod's Theogony makes Eros a primordial being (before Aphrodite); the Hellenistic tradition (e.g. Apollonius of Rhodes, Aristophanes) makes him the s
- `gre-gaia`: Audit 2026-10: children list includes only entities present in this dataset; the full Hesiodic list (Cyclopes, Hecatoncheires, Pontus, Nereus, etc.) is in the description.
- `gre-poseidon`: Audit 2026-10: attested offspring (Triton by Amphitrite; Pegasus and Chrysaor by Medusa; Theseus in the golden-bull tradition; the Rhodian Telchines, etc.) are not modeled as entities in this dataset.
- `gre-ares`: Audit 2026-10: attested children (Harmonia with Aphrodite; the Amazon Penthesilea/hippolyte lineage; Deimos/Phobos in later tradition) are not modeled as entities here.
- `gre-aphrodite`: Audit 2026-10: two parentage traditions — Hesiod (born of Ouranos's sea-foam, hence parents = Ouranos) and Homer Il. 5 (daughter of Zeus and Dione). We keep the Hesiodic as primary; the Homeric varian
- `nor-burir`: Audit 2026-10: Búri emerged from the salt-rime blocks (hrímkalpar) that the cow Auðumbla licked bare over three days (Gylfaginning IV); he has no parents in the sources.
- `nor-uthra`: Audit 2026-10: Ullr is Sif's son by an unnamed father (Gylfaginning 31 calls him Thor's "son" in the step- sense; Snorri's skaldic usage). Thor is stepfather only.
- `nor-sid`: Audit 2026-10: this entity was previously "Síd, a giantess who bore Sleipnir" — unattested and wrong. It is now Svaðilfari, the builder's stallion (Gylfaginning XIII); Sleipnir's parents are Loki (as 
- `nor-sleipnir`: Audit 2026-10: Sleipnir was borne by Loki in mare-shape, sired by the stallion Svaðilfari (Gylfaginning XIII) — Loki is his mother.
- `nor-heimdall`: Audit 2026-10: parentage uncertain — Gylfaginning: born of nine mothers (nine waves / nine sisters); a skaldic kenning and Annalaí fragment hint at Odin as father. Previously listed as Odin's son; mov
- `nor-odin`: Audit 2026-10: children shown are the dataset members attested for Odin (Baldr and Höðr with Frigg; Thor with Jörð; Víðarr with the giantess Gríðr; Váli with Rindr; Heimdall uncertain — see his entry)
- `nor-nyrd`: Audit 2026-10: Freyr and Freyja's mother is Njörðr's sister (a nameless giantess; the incestuous union is noted in Ynglinga saga 4 and Loki's flyting in Lokasenna). Skaði is his later wife (divorced i
- `nor-loomi`: Audit 2026-10: Loki is "son of Fárbauti" in the kenning tradition (Umbli's son, Laufjar/Laufey's son — Gylfaginning prologue); his mother Laufey/Nál and father Fárbauti are not modeled as entities. Hi
- `egy-horus-elder`: Audit 2026-10: "Horus the Elder" (Harsomtus) is a late Edfu form/offspring of Horus, not a separate father-god. Relation was inverted; corrected.
- `egy-nephthys`: Audit 2026-10: mother of Anubis — by Set in some traditions, by Osiris in the Plutarchan "false-Osiris" episode (Nephthys deceived Osiris thinking him Set). Both traditions preserved; Anubis's parenta
- `egy-anubis`: Audit 2026-10: parentage disputed — Set and Nephthys (late tradition) vs Osiris and Nephthys (Plutarch); earlier still Anubis is a son of Ra or of Hesat. See UNCERTAIN.md.
- `egy-ogdoad-sat`: Audit 2026-10: the Ogdoad's Amun ("the Hidden One") is the Hermopolitan principle of hiddenness/air, distinct from the Theban king-god Amun (see egy-amun). Previously mislabeled "Sat & Satet".
- `egy-ogdoad-nun`: Audit 2026-10: this entry is a male+female pair (hermopolitan Ogdoad); gender field = "other" (dual).
- `egy-ogdoad-heh`: Audit 2026-10: this entry is a male+female pair (hermopolitan Ogdoad); gender field = "other" (dual).
- `egy-ogdoad-khnum`: Audit 2026-10: this entry is a male+female pair (hermopolitan Ogdoad); gender field = "other" (dual).
- `egy-ogdoad-sat`: Audit 2026-10: this entry is a male+female pair (hermopolitan Ogdoad); gender field = "other" (dual).
- `egy-nun`: Audit 2026-10: near-duplicate of egy-ogdoad-nun (Nun & Naunet pair). Kept separate: solo Nun is the personified primeval waters of Heliopolitan/temple theology; the pair entry documents the Ogdoad.
- `egy-ogdoad-nun`: Audit 2026-10: see also solo Nun (egy-nun). Pair entry documents the Ogdoad member.
- `egy-thoth`: Audit 2026-10: parentage varies — self-created on the primeval mound (Hermopolitan), "tongue of Ra" (creator's scribe), or born of Set's semen (Herodotus II.4 / Neferhotep tradition). Left unset delib
- `egy-hathor`: Audit 2026-10: "daughter of Ra" is common (Dendera theology) but Hathor's roles (eye of Ra, celestial cow, lady of the sycamore) precede and exceed that filiation; kept as domain, not asserted as fixe
- `slv-svarog`: Audit 2026-10: the Svarog→Dazhbog father-son relation rests on ONE chronicle gloss (PVL ad 980: "Dazhbog... Svarozhich"); whether Svarog is a sky-god, a smith-god (Hephaestus identification), or a euh
- `slv-lada`: Audit 2026-10: Lada's existence as a Slavic DEITY is disputed — the main evidence is 16th–18th c. sources (Maciej of Miechów, Bielski, Gloger) possibly derived from misread Greek "charis/Aglaia" litur
- `slv-cherd`: Audit 2026-10: "Chert" (devil) is attested only in late sources (Bielski 1564, via the "black god" of the PVL) and is likely a Christian-era concept projected backwards. See UNCERTAIN.md.
- `slv-zorya`: Audit 2026-10: the Zorya(s) — dawn star(s), often two or three sisters guarding the cosmic hound — are ethnographic/folkloric (19th c. records); their pre-Christian status is reconstruction. See UNCER
- `slv-jarilo`: Audit 2026-10: Jarilo (Jarovit) is attested in 12th c. Elbe-Slavic records (Havelberg/Rethra idols); the equation with the Kupala festival figure is 19th–20th c. ethnographic reconstruction (Ivanov–To
- `mes-kingu`: Audit 2026-10: Enuma Elish I 27-29 — Tiamat "exalted" Kingu among the gods, "placed the tablet of destinies on his lap"; the "made him husband" language is about his exaltation as army commander. Exec
- `mes-enki`: Audit 2026-10: mother is Nammu (primeval sea) in Sumerian tradition (Enki's birth cycle); Nammu is not modeled as an entity. Father An per the standard genealogy.
- `mes-marduk`: Audit 2026-10: Enuma Elish I 36-39 — Marduk is son of Ea (Enki) and Damkina, grandson of An and Tiamat (the "Tiamat" here is Ea's salt-water grandmother layer); Damkina not modeled as an entity.
- `mes-nabu`: Audit 2026-10: mother given as Nisaba (or Tasmetu as consort) in different lists; neither modeled. Father: Marduk (standard first-millennium genealogy).
- `mes-nergal`: Audit 2026-10: Erra/Nergal is "seed of Enlil, offspring of Ninlil" (Erra Epic I); as Ereshkigal's consort he is the "Nergal and Ereshkigal" myth. A duplicate entity for him was merged into this one (a
- `mes-ki`: Audit 2026-10: An+Ki are parents of Enlil in the Sumerian tradition; for Enki the mother is more often Nammu. Ki's motherhood of Enki kept only where the dataset already asserted it — see Enki entry.
- `mes-apas`: Audit 2026-10: entity id "mes-apas" is a legacy label (the god is An/Anu); id kept for URL stability.

### Structural changes
- **Merged duplicate**: `mes-erishkigal-consort` (Nergal duplicate) → `mes-nergal`; all refs repointed (entities, relationships, cosmology). Mesopotamian entities 19 → 18.
- **Converted misdescribed entity**: `nor-sid` ("Síd, giantess mother of Sleipnir", unattested) → **Svaðilfari** (the builder's stallion, Gylfaginning XIII); Sleipnir's parents now Loki (as mare) + Svaðilfari.
- **Reciprocity pass**: 14 partner links made bidirectional (Zeus' consorts, Gaia–Ouranos, Hebe–Heracles, Hathor–Horus, Osiris–Nephthys, An–Ki, Apsu–Tiamat).
- **Tiamat–Kingu partner link removed** (exaltation, not marriage; Enuma Elish I 27-29) and Tiamat–Apsu pair added.
- **Stripped 26 dangling `major_myths` refs** (greek 24, norse 2) pointing at myths never authored in `myths.json`.
- **Gender enum normalized**: `none` → `unknown` (Yamata-no-Orochi); Ogdoad pairs kept `unknown` + dual-pair note (schema has no "pair" value).
- **Display names cleaned**: Atum-Ra, Forseti, Járnsaxa, Angrboða, Kek & Kauket, Amun & Amaunet (was: Sat & Satet — wrong; was: Khenunu & Khenunit — wrong).
- Legacy ids kept for URL stability (`mes-apas`=An, `nor-sid`=Svaðilfari, `egy-isfet`=Isis, …) — logged in UNCERTAIN.md.

### Verification
- `npm run validate` → ✓ no errors (mesopotamian entities 18 after merge).
- Broken-ref sweep re-run: 0 broken refs, 0 non-reciprocal partners, 0 dangling myth refs.
- `npx tsc --noEmit` → clean.
