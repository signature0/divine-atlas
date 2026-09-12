# THE DIVINE ATLAS — UNCERTAINTIES
Phase 1 deliverable. Where the traditions genuinely disagree or the evidence is thin,
and how the site handles it. Rule: we never silently choose one version — we store
variants and say so.

## Global policy
- Every relationship carries a `confidence` field: `attested` (named in a primary text),
  `variant` (text A says X, text B says Y — both stored), `reconstructed` (scholarly
  inference from fragments), `uncertain` (weak or single-source).
- Every entity may carry `uncertainty_notes[]` — free-text, source-tagged.
- Variant data is first-class: e.g. `parentage: {version_A: ..., version_B: ..., sources: ...}`.

## Greek
- **Parentage contradictions are the norm.** Hesiod's Theogony and the Homeric Hymns and
  local cult traditions often disagree (e.g. Athena's birth — from Zeus's head in the
  *Hymn to Athena* / later tradition, but different local accounts; Persephone's abductor
  is Hades everywhere, but her mother is Demeter everywhere too — the variance is more
  in local cult detail than core genealogy).
- **The Olympian "family" is a later literary synthesis.** Pre-Olympian local deities
  (e.g. local Artemis, local Apollo) predate the classical pantheon; the tidy family
  tree is partly a classical-era editorial construction. We note where a deity's
  "family position" is a literary vs. cult reality.
- **Orphic vs. Hesiodic cosmogony** differ sharply (Orphic: egg, Phanes; Hesiodic:
  Chaos). Both stored as variants.

## Norse
- **The sources are literary recordings, not contemporary records.** The Eddas and
  sagas were written by Christian authors in the 13th c. about a pre-Christian religion.
  We date the *source* (1220–1270) separately from the *beliefs* (pre-1000 AD) on the
  timeline, and label the whole tradition as "attested in 13th-c. literary sources."
- **Æsir vs. Vanir** — the distinction and the peace/alliance between the groups is
  explicit in the Eddas, but the genealogical relationship (e.g. Freyr/Freyja as
  children of Njörðr, Vanir, yet often listed among the Æsir later) is treated
  carefully; we don't force a single merged tree.
- **Odin's one eye** — *Vafthrúðnismál* (Poetic Edda) attests the eye-for-wisdom;
  details of the *well of Mímir* vs. *well of Urd* location vary.

## Japanese (Shinto)
- **Kojiki vs. Nihon Shoki disagree on the creation sequence and parentage.** The order
  and "which hand" Amaterasu/Tsukuyomi/Susanoo emerge from Izanagi's body differs
  between the two texts; the "birth" of Izanagi/Izanami from the high plain (Kojiki)
  vs. a "command" (Nihon Shoki) is a classic variant. All stored.
- **The primordial triad** (Takamimusubi, Kamimusubi, Aminakanushi) is terse and
  ritualized in the Kojiki; their exact relationship to Amenominakanushi and to the
  creator pair is debated — we do not invent a clean tree.
- **Ōkuninushi's parentage** of Konohanasakuya-hime varies; the Kuniyurinshi
  (subjugation) sequence of acts differs between the two texts.
- **Living religion**: kami are religious figures, not fiction; we do not present Shinto
  as "mythology" in the dismissive sense. Label: *living religious tradition*.

## Egyptian
- **No single genealogy.** This is the biggest one. Heliopolis (Atum/Ennead: Shu, Tefnut,
  Geb, Nut, Osiris, Isis, Set, Nephthys), Memphis (Ptah creates via word/thought),
  Hermopolis (Ogdoad: eight primordial deities), Thebes (Amun as hidden god who
  absorbs others) — each city gives a different creation. We present these as
  **parallel creation traditions** (selectable), not one merged "Egyptian family tree."
  This is a deliberate, documented design decision.
- **Syncretism** (e.g. Amun-Ra, Ptah-Sokar-Osiris) is real but later; we note
  syncretic forms separately from the base deities.
- **The Ennead's internal parentage** is stable within the Heliopolite tradition; the
  uncertainty is *which* tradition you're reading.

## Slavic
- **The evidence is thin and post-Christian.** Most "Slavic gods" are named in a handful
  of 10th–12th-c. chroniclers (Perun, Veles, Dazhbog, Stribog, Khors, Mokosh, Svarog)
  with almost no narrative. The rich "stories" commonly told (Perun vs. Veles for rule
  of the sky) are largely **19th-c. Romantic reconstruction** (e.g. Afanasiev) inferred
  from folktales and ethnography. We:
  - mark each claim `attested` / `reconstructed` / `later tradition`,
  - present Perun–Veles explicitly as a *reconstructed* opposition,
  - state plainly in the UI: "Slavic mythological narratives are largely
    reconstructed; primary narrative sources do not survive."
- We do NOT invent a Slavic "family tree" that the sources don't support.

## Mesopotamian
- **Sumerian vs. Akkadian/Babylonian names & mergers.** Inanna (Sumerian) = Ishtar
  (Akkadian/Babylonian) is a *name merger* across languages, not a different goddess —
  we model as one entity with both names, and note the linguistic layer.
- **Enuma Elish** is a late Babylonian (c. 1100–700 BC) literary work that reworks older
  traditions; the Apsu/Tiamat cosmogony differs from the Sumerian *Eridu* and earlier
  creation fragments. We date and label accordingly.
- **Gilgamesh** — the Standard Babylonian (c. 1200 BC) is the main text; Sumerian
  versions (c. 2100 BC) differ in content and are a separate, older layer. Both noted.
- **Inanna's descent** (Sumerian, c. 1900 BC) vs. the later Ishtar descent — same myth,
  different language/period layers.

## How the UI surfaces this
- Profile pages: an "Uncertainty" callout (amber) when the entity has `uncertainty_notes`.
- Relationship edges: hover shows confidence + any variant explanation.
- Cosmology/genealogy views: where multiple traditions exist (esp. Egyptian), a
  tradition selector switches which creation is shown, with a note that others exist.
- Timeline: separates "belief attested (approx.)" from "source written (dated)."
