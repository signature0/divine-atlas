# Print & play — regenerating the PDFs (v2 Phase 7)

The printable set ships in `public/print/`. Every file is generated from the same
data the website renders, so the printed game and the site can never drift:

- `public/duel-deck.json` — the 158 deity cards
- `data/<culture>/artifacts.json` — the 26 relic cards (text + stats)
- `public/cards/<culture>/<culture>-<id>.png` — the generated card art (1024×1440, 5:7)
- `docs/GAME_RULES.md` — the rules booklet source

The **only** hand-authored print asset is the card-back design, and even that is
generated as vector SVG by the same script (see "Card back" below).

## 1. Requirements

Everything here is already present on the build machine — **no new npm or pip
dependencies** (per the project ground rules):

| Tool | Used for |
|---|---|
| `python3` | runs the generator |
| `reportlab` (5.0.1) | all PDF drawing (vector) |
| `Pillow` (12.3.0) | card art → JPEG q80 |
| `pdfinfo`, `pdffonts`, `pdfimages`, `pdfunite` (poppler) | verification |
| `gs` (ghostscript) | render smoke-test in the verifier |

## 2. Regenerate

```bash
python3 scripts/make-pdfs.py all
```

Subcommands:

```bash
python3 scripts/make-pdfs.py cards    # cards-fronts.pdf + cards-backs.pdf + card-back SVGs
python3 scripts/make-pdfs.py board    # board-a3.pdf + board-a4.pdf
python3 scripts/make-pdfs.py rules    # rules-booklet.pdf
python3 scripts/make-pdfs.py tokens   # reference-sheets.pdf
```

Then verify:

```bash
python3 scripts/verify-pdfs.py
```

Output is written to `public/print/`. For a shipping static export, run
`make-pdfs.py` **before** `npm run build` so the files are copied into `out/print/`
(they are gitignored — regenerate rather than commit; see `.gitignore`).

### Determinism

The generator sets `rl_config.invariant = 1`, which pins the PDF `CreationDate`
to a fixed value, and the stats derivations are exact ports of
`app/lib/card.ts` / `app/lib/relic-card.ts` (FNV-1a `hash32` + mulberry32). With
unchanged inputs, regenerating produces byte-identical output.

## 3. What is produced, and its size

| File | Paper | Contents |
|---|---|---|
| `cards-fronts.pdf` | A4 portrait, 21 pp | 184 card faces, 9-up, true size 63.5 × 88.8 mm + 3 mm bleed + crop marks |
| `cards-backs.pdf` | A4 portrait, 21 pp | the matching backs, imposed for duplex |
| `board-a3.pdf` | A3 landscape, 1 p | the free-for-all mat (4 seats) |
| `board-a4.pdf` | A4 landscape, 1 p | the same mat at 70.7% |
| `rules-booklet.pdf` | A5 portrait, 9 pp | cover + TOC + all rules + glossary |
| `reference-sheets.pdf` | A4 portrait, 2 pp | wheel, trackers, keywords, synergies, tokens |
| `card-back.svg` + `card-back-<culture>.svg` | vector | generic back + six pantheon variants |
| `manifest.json` | — | imposition manifest the verifier reads |

Card fronts are ~43 MB (184 faces as JPEG q80 at just over 300 DPI at printed
size). To stay under the spec's ~60 MB ceiling the generator downsamples art to
**837 px wide** — 306 DPI across the full 69.5 mm art cell (and 352 DPI inside the
63.5 mm trim). Native 1024 px art (374 DPI) produced a >60 MB PDF; see §5.

## 4. Imposition

```
trim (poker standard)   63.5 × 88.8 mm
bleed                    3.0 mm each side
art cell (trim + bleed) 69.5 × 94.8 mm
A4 sheet               210 × 297 mm → 3 × 3 grid (9-up)
grid                     190.5 × 266.4 mm, centred (9.75 mm sides, 15.3 mm top/bottom)
```

Adjacent cards **share** their bleed strips, so the pitch is the trim size
(63.5 / 88.8 mm), not the art cell. Crop marks are drawn only on the sheet's
outer edges at every trim boundary, so they never land on a neighbouring card.

**The spec's "10-up (5×2) on A4" is not physically possible** — five 63.5 mm
cards need 317.5 mm of width on a 210 mm sheet. Nine-up is the maximum true-size
imposition on A4 and the industry standard; see `docs/UNCERTAIN.md`.

### Front ↔ back (duplex, short edge)

`cards-fronts.pdf` and `cards-backs.pdf` have the **same page count and grid**.
Card *i* occupies logical slot *s* on both sheets, but its back is drawn at the
180°-rotated cell `(cols-1-col, rows-1-row)` on the same page — the exact
correction a short-edge (short-axis) turn applies to portrait stock. The
manifest records the front cell, the back cell and the shared slot for every
card; `scripts/verify-pdfs.py` re-reads it and asserts slot identity plus the
rotation.

## 5. Card art resolution

- Native art is 1024 px wide → 374 DPI over the 69.5 mm art cell.
- 184 faces at q80 native exceeded the ~60 MB ceiling, so the D4 fallback
  applies: art is resampled to **837 px** (≈306 DPI at placed size, ≈352 DPI at
  trim) with LANCZOS, then embedded as **DCTDecode (raw JPEG, no re-encode)**.
- The verifier asserts `pdfimages -list` reports ≥ 300 ppi for every card image.

## 6. Fonts

The site's webfonts are self-hosted **woff2** only, and converting woff2 → ttf
would require a new dependency (forbidden). The PDFs therefore use reportlab's
built-in **base-14** faces — Helvetica (body), Times (display headings) and
Courier (code) — which every PDF reader and printer already has.

**Native-script names are omitted** from the printed cards (Greek, Japanese,
cuneiform, …) because base-14 cannot shape them and rendering them would produce
missing-glyph boxes ("tofu"). Latin names, type lines, stats and set codes are
always present. If a shaping font (Noto Serif JP, etc.) is ever bundled as TTF,
register it with `pdfmetrics.registerFont(TTFont(...))` in `make-pdfs.py` and
the native line can be re-enabled.

## 7. Troubleshooting

**Fronts and backs are out of register.**
Print one sheet on plain paper first. The backs sheet is imposed for a
**short-edge** flip; if the printer's flip axis is labelled the other way, choose
**"flip on long edge"** instead. Also confirm scaling is **100%** ("fit to page"
off) — scaling moves the grid.

**Backs are upside-down / mirrored.**
That is the flip-edge setting, not the file. Switch short edge ↔ long edge and
reprint one test sheet.

**Gold looks muted / colours differ from screen.**
The PDFs are **sRGB**; there is no CMYK conversion (the generator does no colour
management). Let the printer manage colour, and avoid ink-saver modes, which mute
the gold. For commercial CMYK you would convert at the print shop, not here.

**A character shows as a box.**
It should not — native script is excluded by design. If a Latin name still shows
a box, the text contains a glyph outside Latin-1; report it rather than shipping
tofu.

**`pdfinfo`/`pdffonts`/`pdfimages` not found.**
Install poppler (`poppler-utils`). `gs` (ghostscript) is only needed by the
verifier's render check.

**File too large to email.**
The fronts PDF is ~43 MB. Generate it, upload to the printer/Cloudflare host, or
split with `pdfunite`/`pdfseparate`. Reducing JPEG quality below 80 is not
recommended for card stock.
