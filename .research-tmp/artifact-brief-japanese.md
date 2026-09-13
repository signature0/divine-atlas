# ARTIFACT RESEARCH — JAPANESE (research/artifacts/japanese/)

Culture brief on top of the template contract (.research-tmp/artifact-brief-template.md — read it FIRST).
FRAME: Shinto is a LIVING religious tradition — write with that framing; Kojiki (712) and
Nihon Shoki (720) are the primary texts; shrine engi are later. Document Kojiki vs Nihon
Shoki variant disagreements (esp. the regalia's origins).

## Artifacts to research (4 — the Imperial Regalia + Ame-no-Nuboko)
1. **Kusanagi-no-Tsurugi** (草薙剣, "Grass-Cutting Sword") — also Amenohabakiri in Kojiki;
   found by Susanoo in the tail of Yamata no Orochi (8th head's tail); later given to
   Amaterasu, then Ninigi, then becomes one of the Three Sacred Treasures; Yamato Takeru
   used it (blown backward, turned into a grass-cutting sword). Entity: jpn-susanoo,
   jpn-amaterasu, jpn-ninigi, jpn-yamata-no-orochi, jpn-yamato-takeru.
2. **Yata no Kagami** (八咫鏡, "Mirror of Yata") — Izanagi made it during purification
   (Kojiki) / or Izanagi's mirror; Amaterasu's reflection in it during the cave-dwelling
   myth (Amano-Iwato); treasure of the Ise Grand Shrine (real object — the *shinsei*
   mirror at Ise is the actual regalia, but NO public photo exists — honesty note!).
3. **Yasakani no Magatama** (八坂の勾玉, "Magatama of Yasakani") — a comma-shaped jewel;
   Izanagi's gift; Kojiki says a magatama, Nihon Shoki says a sword (variant! document);
   the actual regalia at Kofun? The real magatama is enshrined at Misasa (Kumamoto).
4. **Ame-no-Nuboko** (天沼矛, "Spear of Heavenly Lake") — Izanagi & Izanami stir the brine
   with it to create the first island (Onogoro); the spear-drip = Awaji island (Kojiki).

## Entity ids (data/japanese/entities.json)
jpn-kamimusubi, jpn-amenominakanushi, jpn-izananagi, jpn-izananami, jpn-amaterasu,
jpn-susanoo, jpn-kagutsuchi, jpn-ninigi, jpn-toyotama, jpn-hooroni, jpn-okuninushi,
jpn-kotohikone, jpn-sarutahiko, jpn-ameno-uzume, jpn-takemikazuchi, jpn-yamata-no-orochi,
jpn-yamato-takeru, … (full list in file)

## Myth ids
jpn-creation-primordial, jpn-creation-islands, jpn-izananagis-purification,
jpn-amaterasu-cave, jpn-susanoo-orochi, jpn-kuniyurinshi, jpn-ninigi-descent

## Image guidance (honesty paramount — the real regalia are NOT publicly photographed)
- Kusanagi → actual Kofun-period swords: Tōkyō National Museum / Met have Kofun-period
  swords and haniwa with sword imagery. Met Open Access API works (same as greek brief).
  Also ukiyo-e (Edo, PD) depicting the Orochi-tail sword scene. Prefer: Kofun sword
  (archaeological, same type/period) + ukiyo-e scene (HISTORICAL ART, later).
  The Ise *shinsei* sword (the actual regalia) — NO photo. Say so.
- Yata no Kagami → actual Kofun/Asuka period bronze mirrors: Met has many (e.g.
  "Mamada" mirrors, Asuka-period mirrors) — ARCHAEOLOGICAL, labeled "a real bronze
  mirror of the period; the sacred mirror of Ise is not publicly displayed".
- Yasakani no Magatama → actual magatama: Met / Tōkyō National Museum have magatama
  (glass / jade / stone, Kofun period). ARCHAEOLOGICAL — these are real magatama, the
  type the myth names. The actual Yasakani no Magatama (Misasa) — no public photo; say so.
- Ame-no-Nuboko → haniwa with figures holding spears/swords (Kofun haniwa, Met has some),
  or Kofun-period bronze spearheads; or ukiyo-e of Izanagi/Izanami (later, PD) labeled
  as interpretation.
- Met API: https://collectionapi.metmuseum.org/public/collection/v1/search?q=magatama etc.
- Wikimedia Commons: ukiyo-e (e.g. Utagawa Kuniyoshi Orochi prints — d.1861, PD).
Verify every image_url with curl -sI. Write notes.md.
