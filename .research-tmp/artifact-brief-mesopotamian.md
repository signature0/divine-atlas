# ARTIFACT RESEARCH — MESOPOTAMIAN (research/artifacts/mesopotamian/)

Culture brief on top of the template contract (.research-tmp/artifact-brief-template.md — read it FIRST).
Mesopotamian objects are ancient → PD. Best sources: British Museum (British Museum
open access via Wikimedia Commons), Met Open Access (cuneiform tablets! the Met has
actual cuneiform tablets incl. some Enuma Elish fragments), Louvre, Pergamon.

## Artifacts to research (3 — depth over breadth here)
1. **Tablets of Destiny** (me / "tablets of fate") — the *me* are the divine decrees /
   laws of the cosmos; Enki holds them; Enlil takes them in the "Eridu Poem"/
   "Enki and the World Order"; Marduk receives them in the Enuma Elish (VI.6–27) —
   THIS is the cosmological climax of the Babylonian creation myth (Marduk's rise to
   supremacy). Honesty: no physical "Tablet of Destiny" object is identified in
   archaeology; the *me* are abstract decrees written on clay in the myths. Best image:
   an actual cuneiform tablet (Met/BM) labeled "an actual cuneiform tablet — the *me*
   are mythic decree-tablets; no object identified as THE Tablet of Fate survives",
   plus a relief of Marduk (e.g. British Museum Marduk statues) if verifiable.
2. **Marduk's weapons** (Enuma Elish: wind, storm, "the weapon that cannot be
   disarmed", the net, the bow, the mace, the "hurling-stone", the "no-mistake weapon")
   — Marduk defeats Tiamat with a set of storm-weapons given by the gods
   (Enuma Elish IV.93–106). Research the actual list from the translation (George 2003).
   Image: British Museum Marduk statue / cuneiform tablet of the Enuma Elish (Met has
   Enuma Elish tablet fragments — verify which). Label honestly: the weapons are
   storm-concepts, not physical objects.
3. **The Anzu bird's thunderbolts** — the *Anzu* (Zu) bird stole the "Tablets of
   Destiny" from Enlil; Enlil sent Ninurta (or in one version, Shullay / "the one
   who knows") to reclaim them with a "hundred weapons"; Ninurta's single feather
   (or arrow) defeats the Anzu. This is the classic "stolen regalia recovered"
   myth. Image: a relief of Ninurta or Anzu (Louvre / BM via Commons — verify), or
   an actual arrowhead (labeled as type/period).

## Entity ids (data/mesopotamian/entities.json)
mes-enlil, mes-enki, mes-marduk, mes-ninurta? (check — may not exist; use null if not),
mes-inanna, mes-erishkigal, mes-tiamat, mes-kingu, mes-enlil, mes-ninlil, mes-nanna,
mes-utu, mes-nabu, mes-erishkigal-consort, … (full list in file — check for Ninurta;
if absent, creator/owner null + note)

## Myth ids
mes-enuma, mes-creation, mes-flood, mes-inanna-descent, mes-inanna-erishkigal, mes-enlil-erosion

## Image guidance
- Met API for cuneiform tablets ("cuneiform tablet Enuma Elish", "clay tablet Marduk").
- Wikimedia Commons: British Museum Marduk statue (BM 119082?), Louvre Ninurta reliefs,
  Anzu bird reliefs. Verify each direct URL 200.
- Every image_url must curl-verify to 200. Write notes.md.
- source_confidence: the *me* concept is HIGH (well attested across many texts);
  specific weapon names MEDIUM (dependent on the Enuma Elish transmission);
  Anzu story HIGH for the outline, MEDIUM for weapon specifics.
