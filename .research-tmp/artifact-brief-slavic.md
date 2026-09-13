# ARTIFACT RESEARCH — SLAVIC (research/artifacts/slavic/)

Culture brief on top of the template contract (.research-tmp/artifact-brief-template.md — read it FIRST).
CRITICAL FRAMING: Slavic mythology has NO major primary mythological texts. Everything is
RECONSTRUCTED from non-Slavic chronicles (9th–13th c.), toponyms, ethnography, and
comparative IE linguistics. The PO's rule: "Include only artifacts reasonably supported by
historical or folkloric sources. Clearly label later folklore or reconstruction."
→ source_confidence will mostly be LOW or MEDIUM. certainty: "UNCERTAIN" or
"MODERN INTERPRETATION" where appropriate. Write uncertainty_notes for EVERY artifact.

## Artifacts to research (2–3, ONLY if the evidence is real — if you cannot find a
documented attestation, SKIP the object and say so in notes.md; do not pad)
1. **Perun's thunder-weapons** — Perun (the sky/thunder god, documented in primary
   chronicles: Primary Chronicle 980 treaty oaths, 907/911 campaign records) is
   consistently associated with thunder-weaponry in scholarly reconstructions
   (hammer/axe: "Perun's hammer" = grom; the hammer-vs-axe debate is documented
   — Veselovsky, Vasiliev). This is a RECONSTRUCTION from iconographic/ethnographic
   comparison, not a textual description of an object. Label exactly that.
   Image: 19th-c. Russian Romantic art (Vasnetsov — d. 1927, PD status per work:
   verify; e.g. "Perun" by Vasnetsov 1899 if on Commons — PD in US since 1996) OR
   an actual Slavic thunder-talisman (gromovnik / grimoire amulet — real folk objects,
   museum photos on Commons) labeled "a real Slavic thunder-talisman (gromovnik) —
   folk apotropaic object, not a depiction of Perun's weapon".
2. **Veles' horned cattle / the sacred ox** — Veles (attested in Primary Chronicle 980
   oaths as god of cattle/horses/underworld) — his "artifact" is the sacred cattle
   (the bull as cosmic axis). This is more an attribute than an object; research whether
   a specific object is documented (e.g. the "Veles' horned serpent"? — that's a
   reconstruction). If the evidence is thin, make this a LOW-confidence "sacred
   animal / attribute" object with explicit uncertainty_notes, OR skip and note why.
3. **The sacred oak / world tree** — Perun's sacred oak (chronicles document Perun's
   oak at Kiev, chopped by Vladimir 980/988 — this is ATTTESTED in the Primary
   Chronicle, not reconstructed!). This is the strongest Slavic "object": a real,
   documented, named sacred tree. Image: no surviving oak; best = a 19th-c. painting of
   the oak's destruction (verify PD) or a real oak (labeled). Honesty: "the oak itself
   no longer exists; this is [X]".
4. OPTIONAL: **Koschei's death-location** (needle on an egg on a stone on a hawk's wing
   under an oak) — this is FOLKLORE (bylina, recorded 19th c.), not a deity's object.
   If included, classification must be clear: "folkloric object (bylina tradition),
   19th-c. written recording". Probably SKIP unless you find a strong case.

## Entity ids (data/slavic/entities.json)
slv-nebo, slv-perun, slv-veles, slv-svarog, slv-dazhbog, slv-khors, slv-stribog,
slv-mokosh, slv-lada, slv-morana, slv-jarilo, slv-zorya, slv-cherd (full list in file)

## Myth ids
slv-cosmology, slv-perun-veles, slv-seasonal, slv-kupala, slv-idol-destruction

## Image guidance
- Wikimedia Commons: Vasnetsov paintings (PD in US), real gromovnik thunder-talismans
  (museum photos), Slavic idol depictions (e.g. the "Perun idol" reconstructions — label
  as reconstruction), the Kiev oak (no photo; painting if PD-verified).
- If you include a 19th-c. painting, image_type = "HISTORICAL ART" and the honesty_note
  must say it is a later artistic interpretation of a reconstructed scene.
- Every image_url must curl-verify to 200. Write notes.md with the evidence base for
  each object (chronicle citation if you can find one).
