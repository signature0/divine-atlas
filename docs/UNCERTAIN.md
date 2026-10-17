# Uncertain / Disputed Items — flagged, not guessed

Anything the audit could not settle against well-established sources. Each item stays in the data with an `uncertainty_notes` entry; nothing here was silently "fixed". (Audit 2026-10-17.)

## Japanese
- **Kamimusubi vs Takamimusubi** (`jpn-kamimusubi`): the Kojiki names two distinct primordial producers. The dataset has one entity whose id says Kamimusubi and whose description follows Takamimusubi. Kept as Takamimusubi (id stable); needs a decision whether to split into two entities.
- **Inari's gender** (`jpn-inari`): appears male, female, and androgynous across shrine traditions; kept `unknown` deliberately.
- **Ame-no-oshihomimi missing**: Amaterasu's son (Ninigi's father) is not modeled; genealogy shows the gap in notes rather than inventing an entity.

## Greek
- **Eros' parentage** (`gre-eros`): primordial (Hesiod) vs son of Aphrodite (later tradition). Kept Aphrodite-filiation, variant noted.
- **Aphrodite's parentage** (`gre-aphrodite`): Hesiodic (Ouranos) vs Homeric (Zeus + Dione). Kept Hesiodic, variant noted.
- **Zeus' partner list** now includes Leto, Metis, Maia, Danae, Semele, Alcmena (mothers of dataset children). These are unions/affairs, not marriages; Hera remains the spouse. Rendering should not call them "wives".

## Norse
- **Heimdall's parentage** (`nor-heimdall`): "born of nine mothers" (Gylfaginning 27) vs a skaldic hint at Odin. Removed from Odin's children; unresolved.
- **Ullr's father**: son of Sif by an unnamed father; Þrúðgelmir appears only in late þulur glosses. Thor = stepfather.
- **Svaðilfari entity** (`nor-sid`): converted from the unattested "Síd"; id kept for URL stability. Loki-as-mare is the source's own strange logic (Gylfag. XIII) — presented as the sources tell it.
- **Loki's parents** Fárbauti + Laufey/Nál: attested in the prose Edda prologue/kenning tradition, but not modeled as entities.
- **Frigg vs Fulla vs Saga** identity debates (Gylfag. 35) — not modeled.

## Egyptian
- **Anubis' father** (`egy-anubis`): Set (late temple tradition) vs Osiris (Plutarch). Set chosen as primary because the dataset models Set–Nephthys as married; both kept in notes.
- **Thoth's parentage** (`egy-thoth`): self-created / "tongue of Ra" / Herodotean Set-semen tradition. Left unset.
- **Hathor as "daughter of Ra"** (`egy-hathor`): common (Dendera) but her roles precede/exceed that filiation. Domain, not asserted parentage.
- **Ogdoad Amun vs Theban Amun** (`egy-ogdoad-sat` vs `egy-amun`): deliberately two entries (principle vs king-god); cross-noted.
- **Nun solo vs Nun-of-the-pair** (`egy-nun` vs `egy-ogdoad-nun`): near-duplicate kept separate on purpose (personified waters vs Ogdoad member); cross-noted.
- **Horus the Elder (Harsomtus)** (`egy-horus-elder`): a late Edfu form/offspring of Horus; whether to keep as separate entity at all is a modeling question.

## Slavic — the whole gallery is reconstruction-heavy
- **Svarog → Dazhbog fatherhood** (`slv-svarog`, `slv-dazhbog`): rests on ONE chronicle gloss ("Svarozhich", PVL ad 980). Applied, flagged.
- **Svarog's nature**: sky-father vs smith (chronicle's Hephaestus identification) vs euhemerized Assyrian king (chronicle's own etymology). Unresolved.
- **Lada's existence as a deity** (`slv-lada`): the evidence chain (Maciej of Miechów → Bielski → Gloger) is widely considered contaminated by misread Greek liturgical exclamations; some scholars deny a goddess entirely. Entry kept (folk "Lado!" tradition is real) but its divine status is disputed.
- **Chert/Cherd** (`slv-cherd`): 16th-c. source only; likely Christian-era "devil" projection. Kept with disputed badge.
- **Zorya** (`slv-zorya`): 19th-c. ethnographic dawn-sisters; pre-Christian status reconstructed.
- **Jarilo = Kupala** (`slv-jarilo`): the festival equation is Ivanov–Toporov reconstruction, not attested identity.
- **Nebo** (`slv-nebo`): pre-Christian supreme sky-father vs folk Christianization — already flagged in data, unchanged.
- **Veles vs "cattle-god Veles" of the PVL**: the chronicle's idol is well attested; his full mythology is reconstructed (Ivanov–Toporov).

## Mesopotamian
- **Enki's mother**: Nammu (Sumerian birth tradition) vs Ki (in some lists). Nammu not modeled; Ki's note flags the variant.
- **Nabu's mother**: Nisaba vs Tasmetu (as consort) depending on list. Left unset.
- **Kingu "husband of Tiamat"**: Enuma Elish exalts him (tablet of destinies on his lap); modeled as son + commander, not spouse.
- **Legacy ids** (`mes-apas` = An, `egy-ogdoad-khnum` = Kek/Kauket, `egy-ogdoad-sat` = Amun/Amaunet, `nor-sid` = Svaðilfari, `egy-isfet` = Isis, `nor-loomi` = Loki, `nor-anguela` = Angrboða): ids kept for URL stability; display names corrected. A future id migration could clean these — needs a redirect plan.

## Process notes
- Dangling `major_myths` refs (greek 24, norse 2) were stripped, not authored — the referenced myths (Orion, Cassandra, Actaeon, Arachne, Trojan horse, Hrungnir, etc.) are candidates for Phase 4+ myth authoring if wanted.
- Slavic `artifacts.json` missing entirely → Phase 4 fills it.

## Phase 7 (print PDFs)
- **Card imposition — "10-up (5×2) on A4" is geometrically impossible.** Five 63.5 mm cards need 317.5 mm of width before bleed; A4 is 210 mm wide (even the 3+3 shared bleed strip cannot reduce the pitch below 63.5 mm). `scripts/make-pdfs.py cards` therefore imposes **9-up (3×3) on A4**, the maximum true-size layout (190.5 × 266.4 mm grid, centred) and the print-shop standard. Documented in the script header and docs/PRINT.md. If a larger run is ever wanted, add an A3 5×2 variant (10-up fits A3) — not built here.
- **Duplex wording — spec says "flip on short edge"; card printing guides insist portrait stock wants "long edge".** The backs sheet is imposed as a 180° in-place rotation of the front grid, which is the correct correction for a short-edge (short-axis) turn. The /print page and docs/PRINT.md give the short-edge instruction plus a troubleshooting note to try long edge if a printer's axes are labelled the other way. One test sheet decides it.
- **No TTF in the repo → base-14 only.** Site fonts are self-hosted **woff2** (conversion disallowed: no new deps), so the PDFs use reportlab's built-in Helvetica / Times / Courier and **omit native-script names** (Greek/Japanese/cuneiform) rather than render tofu. Latin names, types, stats and set codes always print.
- **`canvas.setPageCompressionLevel(9)` does not exist** in reportlab 5.0.1; `canvas.setPageCompression(1)` is used instead. Determinism comes from `rl_config.invariant = 1` (fixed 2000-01-01 metadata).
