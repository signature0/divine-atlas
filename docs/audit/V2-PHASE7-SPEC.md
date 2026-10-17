# PHASE 7 (v2) SPEC — Print-ready PDFs + Download/Print page

You are the Phase 7 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 7. Available tooling (verified on this machine): **python3 + reportlab 5.0.1 + Pillow 12.3.0** (system python3, `import reportlab` works), `pdfunite` (poppler), `gs` (ghostscript), `qpdf` NOT present. NO new npm deps, NO pip installs — build on what exists.

## D1 — Card back design
Design a card back (63×88 mm, 3 mm bleed → 69×94 mm art area): site-styled (dark #0e0e12 + gold #d4af37 accents), unique geometric pattern (SVG-drawn via reportlab paths or a generated SVG→PNG via Pillow), border, "The Divine Atlas" logo/wordmark. Optional per-culture variants (6) if straightforward — same pattern, culture accent color + icon glyph. Store generator in repo (regenerable), output to `public/print/`.

## D2 — PDF generator script `scripts/make-pdfs.py` (python3, reportlab)
Reads card data the same way the site does — simplest reliable source: `public/duel-deck.json` (all cards + entity→relic map) + `data/*/artifacts.json` + `data/*/entities.json` for text; art from `public/cards/*.png` (5:7 fits the 63×88 face with margins). Subcommands (argparse):
1. `cards` — ALL god + relic cards, **63.5×88.8 mm poker standard with 3 mm bleed**, 10-up per A4 sheet (5×2), **fronts sheet + backs sheet** as separate PDFs (`cards-fronts.pdf`, `cards-backs.pdf`) arranged so duplex short-edge flip aligns front↔back (document the imposition math in the script header; verify by coordinate check: same grid cell index front i ↔ back i). Include **crop marks** + bleed (art extends 3 mm past trim). Missing art (7 Slavic relic slots) → styled placeholder panel (pattern + name), never blank.
2. `board` — dueling mat: A3 landscape + A4 landscape versions (`board-a3.pdf`, `board-a4.pdf`) rendered from the mat layout (reuse `/how-to-play/board` structure: seat zones for 2-4 players, pillar zones, deck/discard/relic zones — draw with reportlab vector primitives, print-friendly).
3. `rules` — rules booklet from `docs/GAME_RULES.md` (Phase 6) → `rules-booklet.pdf`: cover, TOC, sections, glossary; A5 or A6 saddle-stitch-friendly; embedded fonts.
4. `tokens` — reference sheet: element cycle diagram, essence/pillar trackers, keyword quick-reference, culture synergy table → `reference-sheets.pdf` (A4, cut-out tokens with crop marks).
5. `all` — runs 1-4 + unites nothing (keep separate files).
- **Fonts:** use reportlab's built-in Helvetica/Times base-14 for body BUT the site uses webfonts — check `public/` or `app/` for self-hosted woff2/ttf; if a TTF exists, register + embed it (reportlab `TTFont`). If only woff2, convert is NOT allowed (no new deps) → use Helvetica and note it. Native-script names (Greek/Japanese/etc.) may not render in base-14: OMIT native script from PDFs if the font can't shape it (note in printing instructions) rather than showing tofu.
- **300 DPI:** images placed at physical size must have ≥300 DPI effective resolution (1024px wide into 63.5mm ≈ 410 DPI ✓). Downsample nothing.
- Deterministic output (fixed metadata date via SOURCE_DATE_EPOCH or reportlab invariant=1) so regeneration is diff-stable.

## D3 — Run + verify (the brief's acceptance list)
Run `python3 scripts/make-pdfs.py all` → outputs in `public/print/`. Verify programmatically (write `scripts/verify-pdfs.py`):
- Each PDF opens (pypdf? NOT installed — use `pdfinfo` from poppler, it exists since pdfunite does; parse output).
- Page sizes correct (A4/A3/A5 as specced, card cells 63.5×88.8 + bleed).
- Fonts: `pdffonts` (poppler) lists fonts; base-14 Type1 are fine (always available); embedded TTFs show "yes" in the emb column — assert no missing-font errors from gs: `gs -o /dev/null -sDEVICE=nullpage file.pdf` exits 0.
- Image DPI: `pdffonts` no; use `pdfimages -list` (poppler) — assert ppi ≥ 300 for card art images.
- Front/back alignment: parse front/back page N cell coordinates (reportlab canvas positions are deterministic — re-derive from the same imposition function and assert equality; simplest: the generator writes a JSON manifest of placements, verifier re-reads it and checks front[i] cell == back[i] cell).
Print the verification table.

## D4 — Site Download/Print page `/print`
New page (server component): hero banner (slot `page-print` — add to prompts/ART_STYLES like Phase 3), sections per PDF: preview thumbnail (render page 1 to PNG at build? NO — keep static: link cards), file sizes, what-it-is, and **printing instructions**: paper (250-300gsm card stock, A4), duplex setting (flip on **short edge** — explain why: fronts/backs sheets), scaling = 100%/actual size (no "fit to page"), cut guide (crop marks, ruler + craft knife or paper trimmer), sleeving note (63.5mm standard sleeves), board printing (A3 poster shop or A4 2-page tile), booklet assembly. Links point to `/print/*.pdf` (static files in public/print — they ship with the export). Add `/print` to the More menu (Explore group) + footer links if trivial.
- Keep bundle size sane: PDFs with 184 card faces at 300 DPI will be large. Compress: reportlab `canvas.setPageCompressionLevel(9)` + JPEG-compress card art into PDFs at quality 80 (Pillow → JPEG → reportlab ImageReader) instead of raw PNG (PNG 3 MB × 184 = 550 MB is NOT acceptable; JPEG q80 at native res ≈ 150-300 KB each → ~40 MB fronts PDF — still large; if > ~60 MB, downsample art to exactly 300 DPI at placed size (63.5mm → 750px wide) which is still print-sharp). Document final sizes.

## D5 — Regeneration docs
`docs/PRINT.md`: how to regenerate (`python3 scripts/make-pdfs.py all`), requirements (python3 + reportlab + Pillow + poppler), imposition explanation, troubleshooting (font substitution, color profiles — sRGB, no CMYK conversion).

## Gates you MUST run and pass
`npx tsc --noEmit && npm run build && npm run validate` (site still builds with /print page) + `python3 scripts/make-pdfs.py all` + `python3 scripts/verify-pdfs.py` all green. Print: PDF list with sizes, verification table, files changed. Do NOT run `git add` or `git commit`.
