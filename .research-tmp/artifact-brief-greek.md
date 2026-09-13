# ARTIFACT RESEARCH — GREEK (research/artifacts/greek/)

Culture brief on top of the template contract (.research-tmp/artifact-brief-template.md — read it FIRST).
Greek art is ancient → public domain. Met Open Access (images.metmuseum.org) is gold here:
actual painted vases depict thunderbolts, tridents, aegis, helmets, caduceus.

## Artifacts to research (7)
1. **Zeus' thunderbolt** (Keraunos) — forged by the Cyclopes (Hesiod Theogony 134–142, 518–531);
   "the most powerful weapon"; lightning imagery is EVERYWHERE on vases.
2. **Poseidon's trident** (Gorgoneion trident, "earth-shaker") — vases show Poseidon with
   trident constantly (e.g. Met red-figure amphorae).
3. **Athena's Aegis** — the shield/cape of aegis; aegis imagery on vases (often with Gorgon
   head); also the *gorgoneion* itself. Sources: Iliad, Pindar, scholia; also the *aegis*
   as a real leather garment of the priestesses (honesty note!).
4. **Hades' helmet** (kernos? no — the *cap of invisibility*; associated with Hekate and the
   Cyclopes' smithing for Hades; Iliad 5.366–377 mentions it as a gift from the Cyclopes) —
   hardest to image: no helmet-in-the-myth survives on vases (vases show generic helmets).
   Best: actual Corinthian helmet from excavations (Met has many, PD) labeled honestly:
   "a real Greek helmet of the period — the mythic cap of invisibility has no surviving depiction".
5. **Hermes' caduceus** — the *kerykeion*; VERY well attested on vases and in real life
   (Met has actual bronze kerykeia!). Prefer a real bronze kerykeion (archaeological) over
   a vase.
6. **Golden Fleece** (Chryso mallos) — the *Argonautica* (Apollonius Rhodius); vases show
   the fleece on a tree (e.g. Met has Argo/fleece scenes); also a real golden fleece?
   (no) — label vase scenes as "4th-c. BC depiction of the fleece on its sacred tree".
7. **Pandora's jar** (pithos — actually a JAR, not a box; the "box" is a mistranslation by
   Erasmus; honesty note required!) — no surviving image of the actual pithos; best:
   19th-c. paintings (e.g. John William Waterhouse "Pandora" — d. 1917, PD? Waterhouse
   d. 1917 → PD in US) or earlier (e.g. John Flaxman "Pandora" 1825, PD) labeled
   "19th-century artistic interpretation — no ancient depiction of the jar survives".

## Entity ids (data/greek/entities.json)
gre-zeus, gre-poseidon, gre-athena, gre-hades, gre-hermes, gre-apollo, gre-artemis,
gre-hephaestus, gre-perseus, gre-heracles, gre-odysseus, gre-persephone, … (full list in file).
Cyclopes are NOT entities → creator null + note.

## Myth ids
gre-creation, gre-overthrow-of-ouranos, gre-titanomachy, gre-athena-birth, gre-athena-athens,
gre-aphrodite-birth, gre-persephone, gre-perseus-medusa, gre-typhon-zeus, gre-heracles-labors

## Image guidance
- Met Open Access: search images.metmuseum.org via the Met collection API
  (https://collectionapi.metmuseum.org/public/collection/v1/search?q=…) — returns JSON
  with primaryImageObject URLs (images.metmuseum.org/iiif/…). This is the fastest
  verified-200 path. Prioritize: thunderbolt + Zeus vase, trident + Poseidon vase,
  aegis (Athena with aegis/gorgoneion), kerykeion (actual bronze staff), Corinthian
  helmet (actual), golden fleece (Argonautica scene).
- Wikimedia Commons for Flaxman/Waterhouse paintings (PD).
- Every image_url must curl-verify to 200.
