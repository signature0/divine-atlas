# The Divine Atlas — Card Art Style Guide (Phase 6)

Source of truth for this guide is the art generator itself,
[`docs/audit/gen_art_prompts.py`](audit/gen_art_prompts.py), and the `_meta`
block of the committed [`data/art-prompts.json`](../data/art-prompts.json)
(`schema: divine-atlas/art-prompts@1`, generated `2026-10-17`). Every rule below
is derived from those two files; nothing is invented. Prompt attributes themselves
come only from the audited `data/<culture>/entities.json` and
`data/<culture>/artifacts.json` — no invented mythology.

The generator emits **one prompt per entity and per artifact**, deterministically
(same input → same prompt; no randomness). 184 items are emitted for the six
cultures: 158 deity prompts and 26 relic (artifact) prompts.

---

## 1. File-slot & resolution contract

| Property | Value |
|---|---|
| Slot path (disk) | `public/cards/<culture>/<culture>-<id>.png` |
| Slot path (web) | `/cards/<culture>/<culture>-<id>.png` |
| `<culture>` | `greek`, `norse`, `egyptian`, `slavic`, `mesopotamian`, `japanese` |
| `<id>` | the **entity id** for a deity, the **artifact id** for a relic (e.g. `gre-chaos`, `gre-zeus-thunderbolt`) |
| Aspect ratio | **5:7 portrait** |
| Resolution | **1024 × 1440** (PNG) |

The generator composes both slots with the same template
(`f"public/cards/{c}/{c}-{e['id']}.png"` and `f"public/cards/{c}/{c}-{a['id']}.png"`).
The card engines resolve the same path via `artSlotPath(culture, id)` in
`app/lib/card.ts` and only use it when the PNG exists at **build** time
(`app/lib/art-slot.ts`, a server-only module). When a slot is absent the card
falls back to its existing archival artwork, or — when that is also absent — to
the letter-seal `onError` fallback in the card face. Deployed separately;
`public/cards/` is gitignored.

`_meta.purpose` states the contract in one line:
> Image-generation prompts for every deity and relic card. Slot:
> `public/cards/<culture>/<culture>-<id>.png` (1024x1440, 5:7).

---

## 2. Gender & age handling

Gender is made **explicit** in every deity prompt so the image model cannot
default to a stereotype. `gen_art_prompts.py` maps the data `gender` field through
`GENDER_WORD`:

| data `gender` | prompt wording |
|---|---|
| `male` | "male" |
| `female` | "female" |
| `other` | "dual-gendered (depicted with both masculine and feminine features)" |
| `unknown` | "enigmatic, beyond-human gender (do not emphasize gender)" |
| `pair` | "a divine pair shown together" |

The article before the phrase is chosen by first letter (`_article`: `an` before a
vowel, else `a`). The gender phrase is embedded in the subject sentence built by
`subject_phrase`:

> `<name> (<native_name>), the <classification> of <domains> in <Culture> mythology,
> <article> <gender phrase> figure drawn from the original legends (not modern pop-culture)`

**Age:** the generator has **no age field and emits no age wording**. Age is not
part of the prompt contract; only gender is made explicit. (`PLAN.md`'s phase
summary mentions "explicit gender, age", but the shipped generator does not
implement age — this guide documents the generator, not the plan.)

Classification strings (used verbatim, underscores → spaces) are:
`primordial`, `deity`, `hero`, `monster`, `mortal`, `realm`, `giant`, `creature`,
`trickster`. Gender distribution in the audited data is male 89, female 57,
unknown 12 (no `other`/`pair` values in the current data, though the mapping
supports them).

Relic prompts carry **no gender** — they depict the object, not a person.

---

## 3. Pose vocabulary (deities)

`pose_for(domains, gender)` returns the **first** matching rule, keyed off the
lowercased domain text. Order matters:

1. **war / storm / thunder / battle / hunt** → "Dynamic contrapposto stance, striding forward, weapon raised mid-swing, cloth whipping in the wind"
2. **underworld / death / afterlife / grave / fate** → "Seated upright on a low dark throne, hands resting on knees or a staff, solemn and patient"
3. **sea / water / river / ocean / rain / flood** → "Standing knee-deep in stylized waves, one arm extended over the water"
4. **sky / heaven / sun / celestial / star** → "Standing tall, arms slightly raised, head tilted up toward the heavens"
5. **wisdom / knowledge / craft / magic / scribe / writing / healing / medicine** → "Seated at a low table, leaning forward attentively over the attribute of their art"
6. **love / beauty / fertility / harvest / agriculture / mother / birth / life** → "Standing in a fertile grove or ripening field, arms open in welcome or cradling the harvest"
7. **trickery / cunning / mischief / thief** → "Half-turned over one shoulder with a knowing glance, weight on one foot, ready to slip away"
8. **creation / primordial / chaos / void / time** → "Emerging from swirling primeval mist, body partly dissolving into the elements"
9. **fallback** → "Dignified frontal stance, chin level, hands visible holding their attribute"

The chosen pose is capitalised and inserted after the description sentence.

---

## 4. Attribute vocabulary

**Deities** (`attrs`) draw from the entity record itself, never invented:

| field | prompt lead-in | cap |
|---|---|---|
| `weapons` | "wielding …" | 3 items, each < 60 chars |
| `sacred_objects` | "with …" | 3 items, each < 60 chars |
| `symbols` | "beside them float symbols of …" | 3 items, each < 60 chars |
| `animals` | "accompanied by …" | 2 items |
| `associated_realms` / `associated_places` | "Setting: <realm names>, atmospheric depth." | 2 ids, resolved to realm names via `cosmology.json` (`realm_names`) |

**Relics** (`artifact_prompt`) draw from the artifact record:

| field | prompt use | cap |
|---|---|---|
| `category` | "the <category> of <Culture> myth" | — |
| `appearance` | the object description | clip 200 |
| `creator_name` | "wrought by <creator>" | — |
| owner (via `owner`, resolved to the owner's name; else `owner_name`) | "held or displayed by <owner>" | — |
| `origin_story` (else `creation_story`) | "Origin: …" | clip 180 |

`clip(s, n)` collapses whitespace and truncates on a word boundary with an
ellipsis (`…`) when over the limit.

---

## 5. Composition, mood & framing

The shared composition sentence (from `entity_prompt` / `artifact_prompt`):

- **Deity:** "Composition: single centered figure, waist-up to full-body, eye-level
  camera, generous headroom, card-safe margins (no limbs at frame edge)."
- **Relic:** "Composition: the relic as hero object, three-quarter view, dramatic
  single-source light, faint aura of its element, card-safe margins."
- Both end with "Aspect ratio 5:7 portrait (1024x1440)."

Card-safe margins are required because the artwork window crops to the card's
5:7 frame; no figure may be cut at the frame edge.

**Mood:** "solemn and awe-inspiring" by default; when the string `death` appears
in the entity's domains the generator switches to "hushed, reverent, solemn".

---

## 6. Negative-prompt default

Every item carries the same `negative_prompt`, defined once as `NEG` in the
generator and repeated verbatim in `_meta.negative_prompt_default`:

> photograph, photorealistic, 3d render, anime, cartoon, modern clothing, modern
> objects, text, watermark, logo, signature, deformed hands, extra fingers,
> mutated anatomy, blurry, lowres, disrespectful or mocking depiction of the
> subject, contemporary political symbols

**Why:** `_meta.rule` requires that depictions stay mythological and respectful
("Keep depictions mythological and respectful."). The negative list therefore
suppresses (a) media that break the painterly/archival style (photo, 3D, anime,
cartoon, modern dress/objects), (b) generation artifacts and overlays that would
misrepresent a card (text, watermark, logo, signature, deformed hands, extra
fingers, mutated anatomy, blurry, lowres), and (c) disrespectful/mocking or
contemporary-political depictions of the subject.

---

## 7. Per-religion style tags

Each culture has one style tag (`STYLES`) appended to exactly the same sentence
position in every prompt for that culture: "... Art style: `<tag>`. Aspect ratio
5:7 portrait (1024x1440)."

### Greek — `greek`
> Greek black-figure and red-figure vase-painting fused with heroic Renaissance oil painting: marble-white flesh, draped chiton himation cloth, terracotta and marigold ochre palette, Meandros and laurel border motifs, idealized heroic anatomy, flat decorative background with a single column or tree

- **Palette:** terracotta, marigold ochre, marble-white.
- **Medium reference:** black-figure/red-figure vase painting + Renaissance oil.
- **Composition rules:** idealized heroic anatomy; flat decorative background with
  a single column or tree; Meandros and laurel border motifs.

### Norse — `norse`
> Cold rugged Norse painterly style: birch-wood and wet-slate palette, aurora-green and ice-blue light, carved Urnes-style ribbon beasts, fur, wool and riveted iron, mist over fjord and ash tree, dramatic low northern sun

- **Palette:** birch-wood, wet-slate, aurora-green, ice-blue.
- **Medium reference:** rugged painterly.
- **Composition rules:** carved Urnes-style ribbon beasts; fur/wool/riveted iron
  materials; mist over fjord and ash tree; dramatic low northern sun.

### Egyptian — `egyptian`
> Ancient Egyptian temple-relief fused with gold-leaf painterly style: profile-composite canon, lapis lazuli and gold palette, linen shendyt, broad collars, hieroglyph column background, torch-lit sandstone, strict registers

- **Palette:** lapis lazuli, gold.
- **Medium reference:** temple-relief + gold-leaf painterly.
- **Composition rules:** profile-composite canon; linen shendyt, broad collars;
  hieroglyph column background; torch-lit sandstone; strict registers.

### Slavic — `slavic`
> Eastern-Slavic folk-icon meets forest-realism painterly style: deep forest green, ember red and birch white, embroidered vyshyvanka linen, oak and birch forest, onion-domed horizon, warm candlelight on gilded halo

- **Palette:** deep forest green, ember red, birch white.
- **Medium reference:** folk-icon meets forest-realism painterly.
- **Composition rules:** embroidered vyshyvanka linen; oak and birch forest;
  onion-domed horizon; warm candlelight on gilded halo.

### Mesopotamian — `mesopotamian`
> Ancient Mesopotamian cylinder-seal and palace-relief fused with oil painting: baked-clay ochre and lapis palette, horned divine crown, cuneiform-stamped background, winged-bull and palm motifs, Tigris reed light, layered ziggurat horizon

- **Palette:** baked-clay ochre, lapis.
- **Medium reference:** cylinder-seal and palace-relief fused with oil painting.
- **Composition rules:** horned divine crown; cuneiform-stamped background;
  winged-bull and palm motifs; Tigris reed light; layered ziggurat horizon.

### Japanese — `japanese`
> Japanese ukiyo-e and Yamato-e painterly style: washi paper texture, vermilion and indigo with gold-leaf clouds, flowing silk kariginen and junihitoe layers, pine, crane and sakura motifs, flat mist bands (suyari-gasumi), crisp ink outlines

- **Palette:** vermilion, indigo, gold-leaf clouds.
- **Medium reference:** ukiyo-e and Yamato-e painterly.
- **Composition rules:** washi paper texture; flowing silk kariginen/junihitoe
  layers; pine, crane and sakura motifs; flat mist bands (suyari-gasumi); crisp
  ink outlines.

---

## 8. Prompt assembly reference

A deity prompt is assembled in this exact order (`entity_prompt`):

1. subject phrase (name, classification, domains, explicit gender, "drawn from the
   original legends (not modern pop-culture)"),
2. clipped `description_short` (≤ 220 chars),
3. capitalised pose,
4. attributes (`weapons` → `sacred_objects` → `symbols` → `animals`),
5. setting from realm names,
6. mood,
7. composition + aspect-ratio sentence,
8. style tag.

A relic prompt is assembled by `artifact_prompt`:

1. "<name>, the <category> of <Culture> myth[wrought by <creator>]: <appearance>",
2. owner line ("held or displayed by <owner>" or "displayed on a carved stone plinth"),
3. "Origin: <origin_story|creation_story>",
4. composition (hero object, three-quarter view, single-source light, faint aura),
5. aspect-ratio sentence,
6. style tag.
