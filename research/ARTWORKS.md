# THE DIVINE ATLAS — ARTWORK RESEARCH
Phase 1 deliverable. How we find, verify, license, and record historical art.

## Method
1. **Collection**: For each culture we queried two open, stable, license-transparent
   repositories:
   - **Metropolitan Museum of Art — Met Open Access** (public domain only; the API
     returns `isPublicDomain: true` per object, plus a stable `objectURL` and a CDN
     image at `images.metmuseum.org/CRDImages/...`). API:
     `https://collectionapi.metmuseum.org/public/collection/v1`
   - **Wikimedia Commons** (per-file license metadata via the Commons API —
     `extmetadata: LicenseShortName, Artist, DateTimeOriginal, ImageDescription`;
     images served from `upload.wikimedia.org`).
2. **Verification** (done 2026-09-12):
   - Both image CDNs confirmed serving real image bytes (HTTP 200, correct
     `content-type: image/jpeg`) — Met CDN and `upload.wikimedia.org` both tested live.
   - 818 candidate files resolved to concrete image URLs across the six cultures
     (counts per culture in the collected JSON under `.research-tmp/`).
   - Every candidate carries its license string as returned by the source repository.
3. **Curation**: From the candidates we hand-picked the works that actually depict
   the relevant deities/myths (not just "Japanese art" or "Egyptian art"). Each pick
   was checked against the deity/myth it will illustrate.

## Licensing policy
- **Only** public-domain or explicitly open-licensed (CC0 / CC-BY) images are used.
- Every `artworks.json` record stores: `license`, `source_url` (the repository object
  page, not just the image), `image_url`, `attribution` (for display), and
  `copyright_notes`.
- **No** copyrighted contemporary artwork is scraped or presented. Where a famous
  image exists only under copyright, we use a different public-domain depiction of
  the same subject, or omit it and note the gap.
- Attribution is rendered on every artwork card (museum + artist + license + link),
  per the "display attribution" requirement.

## What we have, per culture (verified picks in each `artworks.json`)
- **Japanese**: Met — Amaterasu cave scroll (Kōno Bairei), Izanagi/Izanami (Nishikawa
  Sukenobu); Commons — Yoshitoshi (Susanoo slays Orochi; Amaterasu from cave), Kuniyoshi
  (Susanoo & water dragon), Chikanobu (Susanoo rescues Kushinada-hime), Kobayashi Eitaku
  (creation of islands), 1790 shinbutsu-zue plates (Amaterasu; Izanagi/Izanami), Kunisada
  (Iwato kagura, 1856). 11 works, all image-URLs live-verified.
- **Greek**: Met (vases, bronzes, Parthenon-area sculptures, black-figure/red-figure
  candidates) + Commons (sculpture photography, vase paintings, classical friezes).
- **Norse**: Commons (Munch and 19th-c. Romantic Norse paintings, Oseberg/Gokstad
  ship imagery, runestones, valkyrie prints) + Met (Viking-age objects, Gungnir-type
  spearheads).
- **Egyptian**: Met (sarcophagi, papyri, mummies, scarabs, Amarna) + Commons (Osiris/Isis/
  Anubis imagery, Book of the Dead papyri, tomb paintings, temple reliefs).
- **Slavic**: Commons (19th-c. Romantic Slavic-deity paintings, wood carving,
  embroidery, ethnographic photography). Note: pre-Christian primary Slavic
  *artwork* is essentially nonexistent; the visual identity is built from Romantic-era
  and ethnographic images, labeled as such.
- **Mesopotamian**: Met + Commons (Ishtar Gate brickwork, cuneiform tablets, cylinder
  seals, Assyrian palace reliefs, the Gudea statues, the Stele of Hammurabi).

## Record schema (per artwork)
`id, culture, title, artist, date, museum, medium, license, source_url, image_url,
subject, description, copyright_notes, attribution`
`subject` lists the deities/myths the work depicts, so it can be linked back to
entities and myths in the data model.

## Gaps (documented, not hidden)
- **Slavic**: no surviving pre-Christian devotional art; visual identity relies on
  19th-c. Romantic reconstruction + ethnographic material. We say so on the page.
- Some deities (especially lesser Slavic and Mesopotamian figures) have no surviving
  likeness; we link them to *related* works (e.g. the Ishtar Gate for Ishtar) and mark
  the link as "associated," not a portrait.
- We prefer a correct public-domain work over an impressive copyrighted one, every time.
