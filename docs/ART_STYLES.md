# The Divine Atlas — Card & Banner Art Style Guide

Source of truth for this guide is the art generator itself,
[`docs/audit/gen_art_prompts.py`](audit/gen_art_prompts.py), and the top-level
metadata fields of the committed [`data/art-prompts.json`](../data/art-prompts.json)
(`schema: divine-atlas/art-prompts@1`, generated `2026-10-17`; the `purpose`,
`rule` and `negative_prompt_default` keys). Every rule below
is derived from those two files; nothing is invented. Prompt attributes themselves
come only from the audited `data/<culture>/entities.json` and
`data/<culture>/artifacts.json` — no invented mythology.

The generator emits **one prompt per entity and per artifact**, deterministically
(same input → same prompt; no randomness). 184 items are emitted for the six
cultures: 158 deity prompts and 26 relic (artifact) prompts. A separate
`banners` key holds the 24 Phase-3 banner prompts (§9).

---

## 0. Ratio & prompt-field contract (reconciled, v2 Phase 5)

One place states the geometry contract so CSS, prompts, and the gate cannot drift:

| Asset | Slot | Aspect ratio | Resolution | Safe margins |
|---|---|---|---|---|
| Card art (deity + relic) | `public/cards/<culture>/<culture>-<id>.png` | **5:7 portrait** (0.7143) | **1024 × 1440** | **≥ 8 % top/bottom**; subject never touches any frame edge |
| Page / carousel banner | `public/banners/<slot>.png` | **21:9 landscape** (2.3333) | **2016 × 864** | generous side space for the title overlay; dark bottom-weighted scrim; no important detail at the edges |

The CSS art box is locked to `--tc-art-ratio: 5 / 7` (`app/globals.css`), so
`object-fit: cover` is a no-op on a 1024×1440 PNG — the full image is shown,
never cropped. Details in §1, §5 (card) and §9 (banner). **No other ratio is
valid**; the earlier legacy card proportion `--tc-ratio: 2.5 / 3.5` applies only
to the print sheet / hand fan, never to the art box.

**Prompt field contract** (enforced by `scripts/check-prompts.mjs`, `npm run
check:prompts`). Each entry's composite `prompt` must carry — by kind — the
segments the D4 contract names. The mapping:

| Contract field | Where it lives |
|---|---|
| subject | leads the prompt: `<name>, the <classification> of <domains> …` |
| gender (explicit) | top-level `gender` + its explicit phrase in the prompt (deities only) |
| appearance | clipped `description_short` (deity) / artifact `appearance` (relic) |
| pose | the capitalised pose sentence (§3, deity) |
| clothing | carried by the per-culture `Art style:` tag (§7) |
| relics / attributes | `wielding …` / `with …` / `beside them float symbols of …` / `accompanied by …` (entity-driven) |
| setting | `Setting:` sentence (deity) |
| mood | `Mood:` sentence (deity) |
| composition (with ratio) | `Composition:` + `Aspect ratio 5:7 …` / `Aspect ratio 21:9 …` |
| style tag | `Art style: <per-culture tag>` (§7) |
| negative prompt | top-level `negative_prompt` (§6) |
| filename / slot | `slot`, matched to the deterministic path pattern for the kind |

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

The top-level `purpose` field states the contract in one line:
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

**Contract (Phase 4 D3):** the card's art box is locked to **5:7 (0.7143)** and the
image is drawn with `object-fit: cover`, so `cover` is a no-op — the full PNG is
shown, never cropped. Generated art must therefore be a **full figure or
head-and-shoulders with relic**, with **safe margins ≥ 8% top/bottom**, and the
**subject never touching the frame edges**. Card-safe margins are required because
the artwork fills the card's 5:7 frame exactly; no figure may be cut at the edge.

**Mood:** "solemn and awe-inspiring" by default; when the string `death` appears
in the entity's domains the generator switches to "hushed, reverent, solemn".

---

## 6. Negative-prompt default

Every item carries the same `negative_prompt`, defined once as `NEG` in the
generator and repeated verbatim in the top-level `negative_prompt_default`:

> photograph, photorealistic, 3d render, anime, cartoon, modern clothing, modern
> objects, text, watermark, logo, signature, deformed hands, extra fingers,
> mutated anatomy, blurry, lowres, disrespectful or mocking depiction of the
> subject, contemporary political symbols

**Why:** the top-level `rule` field requires that depictions stay mythological and respectful
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

---

## 9. Banner slots (v2 Phase 3)

Banners are a **separate art contract from the 5:7 card slots**. They back the
`HeroBanner` component on every main page and the home hero carousel, and are the
Phase-5 generation target.

| Property | Value |
|---|---|
| Slot path (disk) | `public/banners/<slot>.png` |
| Slot path (web) | `/banners/<slot>.png` |
| Aspect ratio | **21:9 landscape** |
| Resolution | **2016 × 864** (PNG) |

### 9.1 Slot list (25)

**Home carousel slides (11)** — one per content category:

| Slot | Links to |
|---|---|
| `home-slide-japanese` | `/culture/japanese` |
| `home-slide-greek` | `/culture/greek` |
| `home-slide-norse` | `/culture/norse` |
| `home-slide-egyptian` | `/culture/egyptian` |
| `home-slide-slavic` | `/culture/slavic` |
| `home-slide-mesopotamian` | `/culture/mesopotamian` |
| `home-slide-relics` | `/artifacts` |
| `home-slide-cards` | `/cards` |
| `home-slide-game` | `/play` |
| `home-slide-graph` | `/graph` |
| `home-slide-stories` | `/stories` |

**Page banners (14)** — one per main page:

| Slot | Page |
|---|---|
| `page-japanese` · `page-greek` · `page-norse` · `page-egyptian` · `page-slavic` · `page-mesopotamian` | `/culture/<id>` |
| `page-relics` | `/artifacts` (the Vault) |
| `page-cards` | `/cards` |
| `page-play` | `/play` |
| `page-graph` | `/graph` |
| `page-stories` | `/stories` |
| `page-compare` | `/compare` |
| `page-about` | `/about` |
| `page-print` | `/print` |

### 9.2 Resolution & fallback

`app/lib/banner-slot.ts` (server-only, mirrors `app/lib/art-slot.ts`) checks each
slot at **build time**. A slot is used only when the PNG exists on disk; there is
no runtime request for a missing image. Until the Phase-5 art lands, each page
renders a **unique interim backdrop** — layered gradients plus a large
low-opacity culture/page icon from `app/components/icons.tsx`, tinted per
culture (or page) — so the site never shows one shared placeholder image. The
same backdrop component is reused by the home carousel per slide.

### 9.3 Prompt contract

Prompts live under the new top-level `banners` key of `data/art-prompts.json`
(25 entries; same field shape as `items`, `kind: "banner"`, `gender: "none"`,
`slot: public/banners/<slot>.png`). Each subject is a pantheon-defining myth
scene grounded in the existing `data/<culture>/myths.json` (or, for the shared
feature pages, the site's own content) — no invention. The shared composition
sentence:

> Composition: wide landscape banner (21:9), panoramic cinematic staging, subject
> centered with generous side space kept clear for title overlay, dark
> bottom-weighted scrim area, no important detail at the frame edges.

Each prompt ends with the per-culture style tag from §7 (or the `pan-Atlas
codex` style for cross-culture feature pages) and `Aspect ratio 21:9
(2016x864)`. The negative prompt is the same `NEG` default from §6.

