#!/usr/bin/env python3
# THE DIVINE ATLAS — print-ready PDF generator (v2 Phase 7, D2).
#
# Regenerate every printable asset in public/print/ from the same data the Site
# ships. Requirements (all present on this machine, no new deps):
#   python3 + reportlab (5.0.1) + Pillow (12.3.0); poppler (pdfinfo/pdffonts/
#   pdfimages/pdfunite) + ghostscript are only used by scripts/verify-pdfs.py.
#
# Usage:
#   python3 scripts/make-pdfs.py cards     # cards-fronts.pdf + cards-backs.pdf + card backs
#   python3 scripts/make-pdfs.py board     # board-a3.pdf + board-a4.pdf
#   python3 scripts/make-pdfs.py rules     # rules-booklet.pdf
#   python3 scripts/make-pdfs.py tokens    # reference-sheets.pdf
#   python3 scripts/make-pdfs.py all       # all of the above
#
# ---------------------------------------------------------------------------
# IMPOSITION MATH (documented per the spec)
# ---------------------------------------------------------------------------
# Card trim (poker standard, the sleeve size the site already targets):
#     TRIM = 63.5 × 88.8 mm
# Bleed (art extends past the trim so a craft blade has material to cut into):
#     BLEED = 3 mm each side  → ART CELL = 69.5 × 94.8 mm
#
# Sheet: A4 portrait (210 × 297 mm). We place a 3 × 3 grid (9-up). The spec's
# "10-up (5×2) on A4" is geometrically impossible: five 63.5 mm cards need
# 317.5 mm of width even before bleed, and A4 is 210 mm wide. Nine-up is the
# maximum true-size imposition on A4 and is the print-shop standard; the grid is
# centred with the following margins, which leave room for the crop marks:
#     9-up grid = 3·63.5 = 190.5 mm wide  →  9.75 mm side margins
#                 3·88.8 = 266.4 mm tall  →  15.3 mm top/bottom margins
# Adjacent cards SHARE their bleed strips (the 3 mm between two trims is printed
# once and split by the cut), so column pitch = 63.5 mm and row pitch = 88.8 mm —
# NOT 69.5/94.8. Crop marks are drawn only on the sheet's outer edges (at every
# trim boundary) so they never sit on a neighbouring card's art.
#
# Duplex alignment (the spec asks for a short-edge flip):
#   A duplexing machine turns the sheet about one axis. For PORTRAIT stock the
#   "short edge" is the 210 mm edge; turning about it is a 180° rotation of the
#   printed side. To make card i's back land behind card i's front the back sheet
#   content must therefore be rotated 180° in-place: for grid cell (col,row) on
#   the front, card i's back is drawn at (COLS-1-col, ROWS-1-row) on the SAME
#   page number. The manifest records both physical cells plus a shared logical
#   `slot`, so front↔back identity is exact and machine-checkable. (If a printer
#   instead mirrors long-edge, use "flip on long edge" and the backs come out
#   rotated the other way — see docs/PRINT.md troubleshooting.)
# ---------------------------------------------------------------------------
# DETERMINISM / DPI / FONTS
#   • rl_config.invariant = 1 fixes the PDF date to 2000-01-01, so regenerating
#     with unchanged inputs produces byte-identical fonts/images.
#   • Card art (1024×1440, 5:7) is embedded at native resolution as JPEG q80
#     (DCTDecode, no re-encode): 1024 px over the 69.5 mm art cell ≈ 374 DPI,
#     over the 63.5 mm trim ≈ 409 DPI — both clear the 300 DPI floor.
#   • Only reportlab base-14 faces (Helvetica / Times / Courier) are used. The
#     site's webfonts are self-hosted woff2 only, and conversion is disallowed
#     (no new deps), so native-script names (Greek/Japanese/…) are OMITTED rather
#     than rendered as tofu; see docs/PRINT.md.
import argparse
import io
import json
import math
import re
import sys
from pathlib import Path

from PIL import Image

from reportlab import rl_config

rl_config.invariant = 1  # fixed CreationDate/ModDate → diff-stable regeneration

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A3, A4, A5
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------------------
# paths + design tokens
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUTDIR = PUBLIC / "print"
DATA = ROOT / "data"

INK0 = HexColor("#0e0e12")
INK1 = HexColor("#17171e")
GOLD = HexColor("#d4af37")
GOLD_DIM = HexColor("#8a7530")
PAPER = HexColor("#f7f4ec")
INK_TEXT = HexColor("#1c1a16")
MUTED = HexColor("#6b6558")

CULTURES = ["japanese", "greek", "norse", "egyptian", "slavic", "mesopotamian"]
CULTURE_NAMES = {
    "japanese": "Japanese", "greek": "Greek", "norse": "Norse",
    "egyptian": "Egyptian", "slavic": "Slavic", "mesopotamian": "Mesopotamian",
}
CURRENCY = {
    "japanese": "JPN", "greek": "GRE", "norse": "NOR",
    "egyptian": "EGY", "slavic": "SLA", "mesopotamian": "MES",
}
CULTURE_ACCENTS = {
    "japanese": "#b3455a", "greek": "#4f86a6", "norse": "#7fa0c0",
    "egyptian": "#c8a24a", "slavic": "#7fae8b", "mesopotamian": "#c07a3e",
}

ELEMENT_LABELS = {
    "light": "Light", "storm": "Storm", "fire": "Fire", "water": "Water",
    "earth": "Earth", "life": "Life", "death": "Death", "war": "War",
    "mind": "Mind", "sky": "Sky", "void": "Void",
}
ELEMENT_COLORS = {
    "light": "#c8a24a", "storm": "#7fa0c0", "fire": "#c06a3e", "water": "#4f86a6",
    "earth": "#8a9a5b", "life": "#7fae8b", "death": "#9a7f9a", "war": "#c0574a",
    "mind": "#b08bd8", "sky": "#6f9fc0", "void": "#868171",
}
ELEMENT_RULES = [
    ("storm", r"\b(storm|thunder|lightning|wind|weather)\b"),
    ("fire", r"\b(fire|flame|sun|solar|dawn|day|light|heat)\b"),
    ("water", r"\b(water|sea|river|rain|flood|ocean|river|lake|spring|moon)\b"),
    ("earth", r"\b(earth|soil|mountain|stone|land|fertility|harvest|crop|grain|field|agriculture)\b"),
    ("life", r"\b(life|health|healing|growth|fertility|birth|mother|nursing|vitality)\b"),
    ("death", r"\b(dead|death|afterlife|underworld|grave|tomb|decay|fate|destiny|doom)\b"),
    ("war", r"\b(war|battle|warrior|army|military|hunt|fury|vengeance)\b"),
    ("mind", r"\b(mind|wisdom|knowledge|truth|law|justice|magic|sorcery|craft|trade|cunning|trickery|song|music|poetry|craftsmanship)\b"),
    ("sky", r"\b(sky|celestial|heaven|cosmos|stars|constellation|astronomy|time|season)\b"),
]
CLASSIFICATION_RARITY = {
    "primordial": "mythic", "deity": "rare", "minor deity": "uncommon",
    "hero": "uncommon", "monster": "uncommon", "spirit": "common",
}
TIER_RARITY = {
    "minor": "common", "sacred": "uncommon", "legendary": "rare",
    "divine": "mythic", "cosmic": "mythic", "primordial": "mythic",
}
RARITY_LABELS = {"common": "Common", "uncommon": "Uncommon", "rare": "Rare", "mythic": "Mythic"}

# card geometry (mm → points)
TRIM_W, TRIM_H = 63.5 * mm, 88.8 * mm
BLEED = 3 * mm
ART_W, ART_H = TRIM_W + 2 * BLEED, TRIM_H + 2 * BLEED
COLS, ROWS = 3, 3
PER_PAGE = COLS * ROWS

WHEEL = ["fire", "earth", "water", "storm", "life", "mind", "war"]
ADVANTAGE = {"fire": "earth", "earth": "water", "water": "fire", "storm": "life", "mind": "war"}
CULTURE_SYNERGY = [
    ("Greek", "First Thunder", "On your first Channel, gain +1 essence."),
    ("Norse", "Einherjar Vigil", "Deities with domains war or death get +1 GRD."),
    ("Japanese", "Radiance of Heaven", "Deities with domains sky/sun/light/heaven get +1 PWR."),
    ("Egyptian", "Offering to the Gods", "Attaching a relic costs 1 less essence (min 0)."),
    ("Slavic", "Damp Mother Earth", "Deities with domains fertility/earth/nature/spring get +1 GRD."),
    ("Mesopotamian", "Primordial Tide", "Primordial (Mythic) deities cost 1 less essence (min 1)."),
]

# ---------------------------------------------------------------------------
# deterministic stats (exact ports of app/lib/card.ts + relic-card.ts)
# ---------------------------------------------------------------------------
def hash32(s: str) -> int:
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def mulberry(seed: int):
    a = seed & 0xFFFFFFFF

    def rnd() -> float:
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = ((t ^ (t >> 15)) * (1 | a)) & 0xFFFFFFFF
        old = t
        inner = ((old ^ (old >> 7)) * (61 | old)) & 0xFFFFFFFF
        t = ((old + inner) & 0xFFFFFFFF) ^ old
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

    return rnd


def js_round(x: float) -> int:
    return math.floor(x + 0.5)


def clamp(lo, hi, n):
    return max(lo, min(hi, n))


def element_of(domains):
    for d in domains or []:
        for el, pat in ELEMENT_RULES:
            if re.search(pat, d, re.IGNORECASE):
                return el
    return "void"


def rarity_of(classification):
    return CLASSIFICATION_RARITY.get(classification, "common")


def cmp_bonus(c):
    return {"primordial": 3, "deity": 2, "giant": 1, "monster": 0, "hero": -1}.get(c, -2)


def card_stats(card_id, classification):
    rnd = mulberry(hash32(card_id))
    b = cmp_bonus(classification)
    power = max(2, min(12, 4 + math.floor(rnd() * 5) + b))
    guard = max(1, min(12, 3 + math.floor(rnd() * 5) + math.floor(b / 2)))
    essence = max(1, min(11, 2 + math.floor((power + guard) / 3) + (1 if classification == "primordial" else 0)))
    return {"power": power, "guard": guard, "essence": essence}


OFFENSE = {"destruction", "range", "control", "magic", "divine authority", "creation", "transformation", "truth"}
DEFENSE = {"protection", "defense", "durability", "healing"}


def _mean(vals):
    return None if not vals else sum(vals) / len(vals)


def relic_stats(aid, profile, tier):
    off, deff, neutral = [], [], []
    for p in profile or []:
        key = str(p.get("attribute", "")).lower()
        val = p.get("value", 0)
        if key in OFFENSE:
            off.append(val)
        elif key in DEFENSE:
            deff.append(val)
        else:
            neutral.append(val)
    rnd = mulberry(hash32(aid))
    fb_power = 2 + math.floor(rnd() * 5)
    fb_guard = 1 + math.floor(rnd() * 5)
    om, dm, nm = _mean(off), _mean(deff), _mean(neutral)
    power = clamp(2, 12, fb_power if om is None else 2 + js_round(om))
    guard = clamp(1, 12, fb_guard if dm is None else 1 + js_round(dm))
    neutral_bonus = 0 if nm is None else math.floor(nm / 5)
    tier_bonus = 1 if tier in ("cosmic", "primordial") else 0
    essence = clamp(1, 11, 2 + math.floor((power + guard) / 3) + neutral_bonus + tier_bonus)
    return {"power": power, "guard": guard, "essence": essence}


# ---------------------------------------------------------------------------
# data loading
# ---------------------------------------------------------------------------
def _strip_refs(text: str) -> str:
    return re.sub(r"\s*\[S\d+\]", "", text or "").strip()


def is_latin1(text: str) -> bool:
    try:
        (text or "").encode("latin-1")
        return True
    except UnicodeEncodeError:
        return False


def _load_cards():
    deck = json.loads((PUBLIC / "duel-deck.json").read_text(encoding="utf-8"))
    cards = []
    for c in deck["cards"]:
        img = c.get("image_url") or ""
        path = PUBLIC / img.lstrip("/") if img else None
        cards.append({
            "kind": "deity",
            "id": c["id"],
            "culture": c["culture"],
            "name": c["name"],
            "native_name": c.get("native_name") or "",
            "type_line": c.get("type_line", ""),
            "element": c.get("element") or element_of(c.get("domains")),
            "rarity": c.get("rarity") or rarity_of(c.get("classification", "")),
            "set_code": c.get("set_code", ""),
            "flavor": _strip_refs(c.get("flavor", "")),
            "stats": c.get("stats") or card_stats(c["id"], c.get("classification", "")),
            "sources": c.get("source_refs") or [],
            "art": path if (path and path.exists()) else None,
            "domains": c.get("domains") or [],
        })
    return deck, cards


def _load_relics():
    relics = []
    for culture in CULTURES:
        f = DATA / culture / "artifacts.json"
        if not f.exists():
            continue
        arts = json.loads(f.read_text(encoding="utf-8"))
        for i, a in enumerate(arts, start=1):
            domains = a.get("domains") or []
            art_path = PUBLIC / "cards" / culture / f"{culture}-{a['id']}.png"
            relics.append({
                "kind": "relic",
                "id": a["id"],
                "culture": culture,
                "name": a["name"],
                "native_name": a.get("native_name") or "",
                "type_line": f"RELIC · {a.get('artifact_type', 'Relic')} · {domains[0] if domains else 'relic'}",
                "element": element_of(domains),
                "rarity": TIER_RARITY.get(a.get("tier", "minor"), "common"),
                "set_code": f"DA-R-{CURRENCY.get(culture, '???')}-{i:03d}",
                "flavor": _strip_refs(a.get("description_short", "")),
                "stats": relic_stats(a["id"], a.get("power_profile"), a.get("tier", "minor")),
                "sources": [s.get("ref") for s in (a.get("primary_sources") or [])],
                "art": art_path if art_path.exists() else None,
                "domains": domains,
            })
    return relics


def load_all_faces():
    deck, cards = _load_cards()
    relics = _load_relics()
    # culture-grouped, cards before relics within a culture (set_code sorts that way)
    rank = {c: i for i, c in enumerate(CULTURES)}
    faces = cards + relics
    faces.sort(key=lambda f: (rank.get(f["culture"], 99), f["set_code"]))
    return deck, faces


# ---------------------------------------------------------------------------
# image cache (JPEG q80, deterministic)
# ---------------------------------------------------------------------------
_JPEG_CACHE = {}

# Effective-resolution target. Card art is placed across the full 69.5 mm art cell
# (bleed included), so to guarantee pdfimages reports ≥300 DPI we need ≥300 DPI at
# 69.5 mm = 821 px wide; we cap at 837 px for a small safety margin. Native art is
# 1024 px (374 DPI at the art cell); at native resolution the 184-face fronts PDF
# exceeded the spec's ~60 MB ceiling, so the D4 fallback applies: downsample to
# just over 300 DPI at placed size. Smaller images are never upscaled.
ART_TARGET_W = 837


def jpeg_bytes(path: Path) -> bytes:
    key = str(path)
    if key not in _JPEG_CACHE:
        im = Image.open(path).convert("RGB")
        if im.width > ART_TARGET_W:
            new_w = ART_TARGET_W
            new_h = round(im.height * ART_TARGET_W / im.width)
            im = im.resize((new_w, new_h), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=80, optimize=True, progressive=False)
        _JPEG_CACHE[key] = buf.getvalue()
    return _JPEG_CACHE[key]


def draw_cover(c, path, x, y, w, h):
    reader = ImageReader(io.BytesIO(jpeg_bytes(path)))
    iw, ih = reader.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(reader, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, preserveAspectRatio=False)
    c.restoreState()


# ---------------------------------------------------------------------------
# card back design (D1) — vector, regenerable, per-culture accent variant
# ---------------------------------------------------------------------------
def draw_culture_glyph(c, cx, cy, s, color):
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(max(0.8, s * 0.09))
    c.setLineCap(1)
    cult = _GLYPH_CURRENT
    if cult == "japanese":  # torii
        c.line(cx - s, cy - s, cx - s, cy + s)
        c.line(cx + s, cy - s, cx + s, cy + s)
        c.line(cx - s * 1.25, cy + s * 0.7, cx + s * 1.25, cy + s * 0.7)
        c.line(cx - s * 1.05, cy + s * 0.25, cx + s * 1.05, cy + s * 0.25)
    elif cult == "greek":  # temple pediment + columns
        c.line(cx - s, cy + s * 0.6, cx, cy + s * 1.2)
        c.line(cx, cy + s * 1.2, cx + s, cy + s * 0.6)
        c.line(cx - s, cy + s * 0.6, cx + s, cy + s * 0.6)
        for i in (-1, 0, 1):
            c.line(cx + i * s * 0.6, cy + s * 0.5, cx + i * s * 0.6, cy - s)
    elif cult == "norse":  # valknut (three interlocked triangles)
        for rot in (0, 120, 240):
            c.saveState()
            c.translate(cx, cy)
            c.rotate(rot)
            p = c.beginPath()
            p.moveTo(0, s)
            p.lineTo(s * 0.9, -s * 0.7)
            p.lineTo(-s * 0.9, -s * 0.7)
            p.close()
            c.drawPath(p, stroke=1, fill=0)
            c.restoreState()
    elif cult == "egyptian":  # ankh
        c.circle(cx, cy + s * 0.55, s * 0.5, stroke=1, fill=0)
        c.line(cx, cy + s * 0.05, cx, cy - s)
        c.line(cx - s * 0.7, cy - s * 0.3, cx + s * 0.7, cy - s * 0.3)
    elif cult == "slavic":  # rosette (six petals)
        for i in range(6):
            c.saveState()
            c.translate(cx, cy)
            c.rotate(i * 60)
            c.ellipse(-s * 0.28, s * 0.15, s * 0.28, s * 1.05, stroke=1, fill=0)
            c.restoreState()
        c.circle(cx, cy, s * 0.22, stroke=1, fill=0)
    else:  # mesopotamian — eight-pointed sun star
        for rot in (0, 45):
            c.saveState()
            c.translate(cx, cy)
            c.rotate(rot)
            p = c.beginPath()
            p.moveTo(0, s)
            p.lineTo(s * 0.34, s * 0.34)
            p.lineTo(s, 0)
            p.lineTo(s * 0.34, -s * 0.34)
            p.lineTo(0, -s)
            p.lineTo(-s * 0.34, -s * 0.34)
            p.lineTo(-s, 0)
            p.lineTo(-s * 0.34, s * 0.34)
            p.close()
            c.drawPath(p, stroke=1, fill=0)
            c.restoreState()
    c.restoreState()


_GLYPH_CURRENT = "greek"


def draw_back_pattern(c, x, y, w, h, accent):
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.setStrokeColor(accent)
    c.setFillColor(accent)
    # diagonal lattice of small diamonds, low alpha
    c.setStrokeAlpha(0.22)
    c.setFillAlpha(0.18)
    step = 6 * mm
    yy = y - step
    row = 0
    while yy < y + h + step:
        xx = x - step
        while xx < x + w + step:
            ox = xx + (step / 2 if row % 2 else 0)
            p2 = c.beginPath()
            p2.moveTo(ox, yy + step * 0.28)
            p2.lineTo(ox + step * 0.28, yy)
            p2.lineTo(ox, yy - step * 0.28)
            p2.lineTo(ox - step * 0.28, yy)
            p2.close()
            c.drawPath(p2, stroke=0, fill=1)
            xx += step
        yy += step
        row += 1
    c.setStrokeAlpha(1)
    c.setFillAlpha(1)
    # concentric rotated-square emblems behind the centre
    c.setStrokeAlpha(0.5)
    c.setLineWidth(0.7)
    for frac in (0.62, 0.46):
        s = min(w, h) * frac
        c.saveState()
        c.translate(x + w / 2, y + h / 2)
        for rot in (0, 45):
            c.saveState()
            c.rotate(rot)
            c.rect(-s / 2, -s / 2, s, s, stroke=1, fill=0)
            c.restoreState()
        c.restoreState()
    c.setStrokeAlpha(1)
    c.restoreState()


def draw_card_back(c, x, y, w, h, culture=None):
    """Draw a full card back (art cell, incl. bleed) at (x,y,w,h) points."""
    global _GLYPH_CURRENT
    _GLYPH_CURRENT = culture if culture in CULTURES else "greek"
    accent = HexColor(CULTURE_ACCENTS.get(culture, "#d4af37"))
    c.saveState()
    # base
    c.setFillColor(INK0)
    c.rect(x, y, w, h, stroke=0, fill=1)
    draw_back_pattern(c, x, y, w, h, accent)
    # inner trim frame (two gold rules just inside the trim edges)
    tx, ty, tw, th = x + BLEED, y + BLEED, TRIM_W, TRIM_H
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.1)
    c.rect(tx + 4 * mm, ty + 4 * mm, tw - 8 * mm, th - 8 * mm, stroke=1, fill=0)
    c.setLineWidth(0.5)
    c.setStrokeColor(GOLD_DIM)
    c.rect(tx + 5.2 * mm, ty + 5.2 * mm, tw - 10.4 * mm, th - 10.4 * mm, stroke=1, fill=0)
    cx, cy = x + w / 2, y + h / 2
    # centre emblem: circle + glyph
    c.setStrokeColor(accent)
    c.setLineWidth(1.4)
    c.circle(cx, cy + 6 * mm, 15 * mm, stroke=1, fill=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.7)
    c.circle(cx, cy + 6 * mm, 16.5 * mm, stroke=1, fill=0)
    draw_culture_glyph(c, cx, cy + 6 * mm, 8.5 * mm, accent)
    # wordmark
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(cx, y + h / 2 - 16 * mm, "THE DIVINE ATLAS")
    c.setFillColor(accent)
    c.setFont("Helvetica", 6)
    c.drawCentredString(cx, y + h / 2 - 20.5 * mm, "P A N T H E O N")
    c.setFillColor(GOLD_DIM)
    c.setFont("Helvetica", 5.5)
    c.drawCentredString(cx, y + h / 2 - 24.5 * mm, (CULTURE_NAMES.get(culture, "Generic") + " pantheon") if culture in CULTURES else "pantheon deck")
    # corner ticks
    c.setStrokeColor(accent)
    c.setLineWidth(0.9)
    for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        px, py = cx + sx * (tw / 2 - 8 * mm), cy + sy * (th / 2 - 8 * mm)
        c.line(px - sx * 3 * mm, py, px, py)
        c.line(px, py - sy * 3 * mm, px, py)
    c.restoreState()


def svg_back(culture=None):
    accent = CULTURE_ACCENTS.get(culture, "#d4af37")
    label = (CULTURE_NAMES.get(culture, "Generic") + " pantheon") if culture in CULTURES else "pantheon deck"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="69.5mm" height="94.8mm" viewBox="0 0 69.5 94.8" role="img" aria-label="The Divine Atlas card back {('— ' + label) if culture else ''}">
  <defs>
    <pattern id="lat" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#0e0e12"/>
      <path d="M3 0 L6 3 L3 6 L0 3 Z" fill="{accent}" opacity="0.18"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="69.5" height="94.8" fill="#0e0e12"/>
  <rect x="0" y="0" width="69.5" height="94.8" fill="url(#lat)"/>
  <rect x="7" y="7" width="55.5" height="80.8" fill="none" stroke="#d4af37" stroke-width="0.4"/>
  <rect x="8.2" y="8.2" width="53.1" height="78.4" fill="none" stroke="#8a7530" stroke-width="0.18"/>
  <g stroke="{accent}" fill="none" stroke-width="0.5">
    <circle cx="34.75" cy="41.4" r="15"/>
    <g transform="translate(34.75 41.4)"><rect x="-10.8" y="-10.8" width="21.6" height="21.6"/><rect x="-10.8" y="-10.8" width="21.6" height="21.6" transform="rotate(45)"/></g>
  </g>
  <circle cx="34.75" cy="41.4" r="16.5" fill="none" stroke="#d4af37" stroke-width="0.25"/>
  <text x="34.75" y="76" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="3.4" font-weight="700" fill="#d4af37" letter-spacing="0.1">THE DIVINE ATLAS</text>
  <text x="34.75" y="81" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="2.1" fill="{accent}">P A N T H E O N</text>
  <text x="34.75" y="85" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="1.9" fill="#8a7530">{label}</text>
</svg>
"""


# ---------------------------------------------------------------------------
# card faces
# ---------------------------------------------------------------------------
def wrap(text, max_chars, max_lines):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        if len(cur) + len(wd) + 1 <= max_chars:
            cur = (cur + " " + wd).strip()
        else:
            lines.append(cur)
            cur = wd
            if len(lines) == max_lines:
                break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    if len(lines) == max_lines and len(" ".join(lines)) < len(text):
        lines[-1] = lines[-1][: max_chars - 1].rstrip() + "…"
    return lines


def draw_placeholder_pattern(c, x, y, w, h, color):
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(color)
    c.setFillAlpha(0.13)
    step = 8 * mm
    yy = y - step
    while yy < y + h:
        xx = x - step
        while xx < x + w:
            c.rect(xx, yy, step * 0.5, step * 0.5, stroke=0, fill=1)
            xx += step
        yy += step
    c.setFillAlpha(1)
    c.restoreState()


def draw_card_front(c, x, y, w, h, card):
    accent = HexColor(CULTURE_ACCENTS.get(card["culture"], "#d4af37"))
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    if card["art"] is not None:
        c.setFillColor(INK0)
        c.rect(x, y, w, h, stroke=0, fill=1)
        draw_cover(c, card["art"], x, y, w, h)
    else:
        # styled placeholder panel (pattern + name) — never blank
        c.setFillColor(INK1)
        c.rect(x, y, w, h, stroke=0, fill=1)
        draw_placeholder_pattern(c, x, y, w, h, accent)
        c.setFillColor(MUTED)
        c.setFont("Helvetica-Oblique", 7)
        c.drawCentredString(x + w / 2, y + h * 0.66, "ART PENDING")
        c.setFillColor(accent)
        c.setFont("Helvetica-Bold", 10)
        for i, ln in enumerate(wrap(card["name"], 18, 2)):
            c.drawCentredString(x + w / 2, y + h * 0.58 - i * 11, ln)
    # text panel (dark, translucent) over the lower trim
    tx, ty, tw, th = x + BLEED, y + BLEED, TRIM_W, TRIM_H
    panel_h = 34 * mm
    c.setFillColor(INK0)
    c.setFillAlpha(0.86)
    c.rect(tx, ty, tw, panel_h, stroke=0, fill=1)
    c.setFillAlpha(1)
    # element colour rule
    c.setFillColor(accent)
    c.rect(tx + 4 * mm, ty + panel_h - 0.7 * mm, tw - 8 * mm, 0.6 * mm, stroke=0, fill=1)
    cx = tx + tw / 2
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 11.5)
    name = card["name"]
    if len(name) > 24:
        name = name[:23] + "…"
    c.drawCentredString(cx, ty + 27 * mm, name)
    c.setFillColor(accent)
    c.setFont("Helvetica", 6)
    c.drawCentredString(cx, ty + 23.4 * mm, card["type_line"].upper())
    # flavor (2 lines)
    c.setFillColor(HexColor("#cfc9bd"))
    c.setFont("Helvetica-Oblique", 5.6)
    for i, ln in enumerate(wrap(card["flavor"], 44, 2)):
        c.drawCentredString(cx, ty + 19.4 * mm - i * 6.4, ln)
    # stats row
    st = card["stats"]
    boxes = [("PWR", st["power"], HexColor("#c96b5f")), ("GRD", st["guard"], HexColor("#6f9fc0")),
             ("ESS", st["essence"], GOLD)]
    bw, bh = 12.5 * mm, 8.6 * mm
    gap = 2.6 * mm
    total = 3 * bw + 2 * gap
    bx = cx - total / 2
    by = ty + 8.2 * mm
    for i, (label, val, col) in enumerate(boxes):
        xx = bx + i * (bw + gap)
        c.setStrokeColor(col)
        c.setFillColor(HexColor("#101018"))
        c.setLineWidth(0.5)
        c.roundRect(xx, by, bw, bh, 1.2 * mm, stroke=1, fill=1)
        c.setFillColor(col)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(xx + bw / 2, by + 3.4 * mm, str(val))
        c.setFillColor(HexColor("#8d8878"))
        c.setFont("Helvetica", 4.6)
        c.drawCentredString(xx + bw / 2, by + 6.4 * mm, label)
    # footer strip
    c.setFillColor(HexColor("#9a927f"))
    c.setFont("Helvetica", 5)
    foot = f"{card['set_code']} · {RARITY_LABELS.get(card['rarity'], card['rarity'])}"
    c.drawString(tx + 4 * mm, ty + 3 * mm, foot)
    c.drawRightString(tx + tw - 4 * mm, ty + 3 * mm, CULTURE_NAMES.get(card["culture"], card["culture"]).upper())
    c.restoreState()


def draw_crop_marks(c, page_w, page_h, ox, oy):
    c.saveState()
    c.setStrokeColor(HexColor("#000000"))
    c.setLineWidth(0.3)
    mark = 4 * mm
    gap = 1.5 * mm
    # vertical boundaries at each column trim edge
    for col in range(COLS + 1):
        bx = ox + col * TRIM_W
        for y0, sgn in ((oy, -1), (oy + ROWS * TRIM_H, 1)):
            c.line(bx, y0 + sgn * (gap + 0), bx, y0 + sgn * (gap + mark))
    # horizontal boundaries at each row trim edge
    for row in range(ROWS + 1):
        by = oy + row * TRIM_H
        for x0, sgn in ((ox, -1), (ox + COLS * TRIM_W, 1)):
            c.line(x0 + sgn * gap, by, x0 + sgn * (gap + mark), by)
    c.restoreState()


def cmd_cards(outdir):
    deck, faces = load_all_faces()
    n = len(faces)
    pages = math.ceil(n / PER_PAGE)
    sheet_w, sheet_h = A4
    grid_w, grid_h = COLS * TRIM_W, ROWS * TRIM_H
    ox = (sheet_w - grid_w) / 2
    oy = (sheet_h - grid_h) / 2

    manifest_faces = []

    def cell_rect(col, row):
        # art cell: trim rect expanded by BLEED (shared bleed; overlaps are cut)
        tx = ox + col * TRIM_W
        ty = oy + row * TRIM_H
        return (tx - BLEED, ty - BLEED, ART_W, ART_H)

    front_path = outdir / "cards-fronts.pdf"
    back_path = outdir / "cards-backs.pdf"
    cf = rl_canvas.Canvas(str(front_path), pagesize=A4, invariant=1)
    cb = rl_canvas.Canvas(str(back_path), pagesize=A4, invariant=1)
    cf.setPageCompression(1)
    cb.setPageCompression(1)

    for idx, card in enumerate(faces):
        page = idx // PER_PAGE
        pos = idx % PER_PAGE
        col, row = pos % COLS, pos // COLS
        bcol, brow = COLS - 1 - col, ROWS - 1 - row  # short-edge duplex correction
        if pos == 0:
            if idx:
                cf.showPage()
                cb.showPage()
            draw_crop_marks(cf, sheet_w, sheet_h, ox, oy)
            draw_crop_marks(cb, sheet_w, sheet_h, ox, oy)
        fx, fy, fw, fh = cell_rect(col, row)
        bx, by, bw, bh = cell_rect(bcol, brow)
        draw_card_front(cf, fx, fy, fw, fh, card)
        draw_card_back(cb, bx, by, bw, bh, card["culture"])
        manifest_faces.append({
            "index": idx,
            "id": card["id"],
            "name": card["name"],
            "culture": card["culture"],
            "kind": card["kind"],
            "has_art": card["art"] is not None,
            "front": {"page": page, "col": col, "row": row, "slot": pos},
            "back": {"page": page, "col": bcol, "row": brow, "slot": pos},
        })
    cf.showPage()
    cb.showPage()
    cf.save()
    cb.save()

    # card-back SVG assets (D1, regenerable) — generic + six culture variants
    (outdir / "card-back.svg").write_text(svg_back(None), encoding="utf-8")
    for cu in CULTURES:
        (outdir / f"card-back-{cu}.svg").write_text(svg_back(cu), encoding="utf-8")

    manifest_faces_out = manifest_faces
    write_manifest(outdir, manifest_faces_out, {
        "sheets": pages,
        "per_page": PER_PAGE,
        "total": n,
    })
    print(f"cards: {n} faces → {front_path.name} ({pages} pp) + {back_path.name} ({pages} pp)")
    print(f"       card backs → card-back.svg + 6 culture variants")


def write_manifest(outdir, faces, extra):
    manifest = {
        "schema": "divine-atlas/print-manifest@1",
        "generated": "2000-01-01T00:00:00Z",
        "generator": "scripts/make-pdfs.py",
        "card": {
            "trim_mm": [63.5, 88.8],
            "bleed_mm": 3,
            "art_cell_mm": [69.5, 94.8],
            "cols": COLS,
            "rows": ROWS,
            "per_page": PER_PAGE,
            "duplex": "short-edge (back grid = 180° rotation of front grid)",
        },
        **extra,
        "faces": faces,
    }
    (outdir / "manifest.json").write_text(json.dumps(manifest, indent=1) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# board (D2.2) — A3 landscape + A4 landscape, vector
# ---------------------------------------------------------------------------
def _dashed(c, on=(1.4, 1.4)):
    c.setDash([x * mm for x in on], 0)


def _solid(c):
    c.setDash([], 0)


def draw_seat(c, x, y, w, h, label, accent, pillar_hp, field_slots=3, essence_cap=12):
    c.saveState()
    c.setFillColor(HexColor("#ffffff"))
    c.setStrokeColor(HexColor("#111111"))
    c.setLineWidth(0.6)
    c.roundRect(x, y, w, h, 2 * mm, stroke=1, fill=1)
    pad = 4 * mm
    c.setFillColor(HexColor("#111111"))
    c.setFont("Times-Bold", 11)
    c.drawString(x + pad, y + h - 7 * mm, label)
    c.setFillColor(accent)
    c.setFont("Helvetica", 6.4)
    c.drawRightString(x + w - pad, y + h - 7 * mm, f"PILLAR → 0   (start {pillar_hp})")

    # field slots (upper third)
    slot_top = y + h - 12 * mm
    slot_h = min(30 * mm, h * 0.24)
    gap = 2.5 * mm
    slot_w = (w - pad * 2 - gap * (field_slots - 1)) / field_slots
    for i in range(field_slots):
        sx = x + pad + i * (slot_w + gap)
        c.setFillColor(HexColor("#fafafa"))
        c.setStrokeColor(HexColor("#333333"))
        c.setLineWidth(0.5)
        c.roundRect(sx, slot_top - slot_h, slot_w, slot_h, 1.4 * mm, stroke=1, fill=1)
        c.setFillColor(HexColor("#aaaaaa"))
        c.setFont("Helvetica", 5.2)
        c.drawCentredString(sx + slot_w / 2, slot_top - slot_h + 2 * mm, f"FIELD {i + 1}")

    # pillar track (middle)
    yy = slot_top - slot_h - 9 * mm
    c.setFillColor(HexColor("#666666"))
    c.setFont("Helvetica", 5.4)
    c.drawString(x + pad, yy, "COSMIC PILLAR")
    r = 1.05 * mm
    dgap = (w - pad * 2) / 12
    for i in range(pillar_hp):
        cxx = x + pad + (i % 12) * dgap
        cyy = yy - 4 * mm - (i // 12) * (dgap * 0.78)
        c.setFillColor(HexColor("#ffffff"))
        c.setStrokeColor(HexColor("#333333"))
        c.setLineWidth(0.25)
        c.circle(cxx, cyy, r, stroke=1, fill=1)

    # relic row (lower-middle)
    relic_h = 9 * mm
    ry = yy - 4 * mm - math.ceil(pillar_hp / 12) * (dgap * 0.78) - 10 * mm
    c.setFillColor(HexColor("#666666"))
    c.setFont("Helvetica", 5.4)
    c.drawString(x + pad, ry, "RELICS (one per deity)")
    for i in range(field_slots):
        rx = x + pad + i * (slot_w + gap)
        c.setStrokeColor(HexColor("#888888"))
        c.setLineWidth(0.45)
        _dashed(c)
        c.roundRect(rx, ry - relic_h, slot_w, relic_h, 1 * mm, stroke=1, fill=0)
        _solid(c)

    # essence track (anchored near the bottom)
    ey = y + 16 * mm
    c.setFillColor(HexColor("#666666"))
    c.setFont("Helvetica", 5.4)
    c.drawString(x + pad, ey, f"ESSENCE  (0 → {essence_cap})")
    egap = (w - pad * 2) / (essence_cap + 1)
    for i in range(essence_cap + 1):
        cxx = x + pad + i * egap
        c.setFillColor(HexColor("#ffffff"))
        c.setStrokeColor(HexColor("#333333"))
        c.setLineWidth(0.25)
        c.circle(cxx, ey - 4 * mm, 1.3 * mm, stroke=1, fill=1)
        c.setFillColor(HexColor("#999999"))
        c.setFont("Helvetica", 4)
        c.drawCentredString(cxx, ey - 7.6 * mm, str(i))
    c.setFillColor(HexColor("#aaaaaa"))
    c.setFont("Helvetica", 4.6)
    c.drawString(x + pad, y + 3 * mm, "hand limit 7 · deck 24 · 3 field slots · one relic per deity")
    c.setFillColor(HexColor("#c9c2b4"))
    c.setFont("Helvetica-Oblique", 4.6)
    c.drawString(x + pad, y + 8 * mm, "ticks: mark destroyed Pillar circles from your starting total downward")
    c.restoreState()


def draw_wheel(c, cx, cy, r):
    c.saveState()
    c.setFillColor(HexColor("#666666"))
    c.setFont("Helvetica", 5)
    c.drawCentredString(cx, cy + r + 3 * mm, "ELEMENTAL WHEEL")
    pos = {}
    for i, el in enumerate(WHEEL):
        a = math.radians(-90 + i * (360 / len(WHEEL)))
        px, py = cx + r * math.cos(a), cy + r * math.sin(a)
        pos[el] = (px, py)
    c.setStrokeColor(HexColor("#555555"))
    c.setLineWidth(0.4)
    for src, dst in ADVANTAGE.items():
        x1, y1 = pos[src]
        x2, y2 = pos[dst]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1
        c.line(x1, y1, x2 - dx / L * 4 * mm, y2 - dy / L * 4 * mm)
    for el in WHEEL:
        px, py = pos[el]
        col = HexColor(ELEMENT_COLORS[el])
        c.setFillColor(HexColor("#ffffff"))
        c.setStrokeColor(col)
        c.setLineWidth(0.6)
        c.circle(px, py, 4.2 * mm, stroke=1, fill=1)
        c.setFillColor(col)
        c.setFont("Helvetica", 4.2)
        c.drawCentredString(px, py - 1.4, ELEMENT_LABELS[el][:4])
    c.restoreState()


def draw_zone_box(c, x, y, w, h, title, subtitle=""):
    c.saveState()
    c.setStrokeColor(HexColor("#111111"))
    c.setLineWidth(0.6)
    c.setFillColor(HexColor("#fafafa"))
    c.roundRect(x, y, w, h, 1.5 * mm, stroke=1, fill=1)
    c.setFillColor(HexColor("#111111"))
    c.setFont("Helvetica-Bold", 5.2)
    c.drawCentredString(x + w / 2, y + h - 3.4 * mm, title)
    if subtitle:
        c.setFillColor(HexColor("#888888"))
        c.setFont("Helvetica", 3.8)
        c.drawCentredString(x + w / 2, y + 1.8 * mm, subtitle)
    c.restoreState()


def _board(page_size, scale, accented):
    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=page_size, invariant=1)
    c.setPageCompression(1)
    c.saveState()
    c.scale(scale, scale)
    W, H = A3[1], A3[0]  # A3 LANDSCAPE coordinate space (content is scaled down for A4)
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(HexColor("#111111"))
    c.setFont("Times-Bold", 13)
    c.drawCentredString(W / 2, H - 9 * mm, "THE DIVINE ATLAS · PANTHEON — FREE-FOR-ALL MAT (2–4 SEATS)")
    c.setFillColor(HexColor("#888888"))
    c.setFont("Helvetica", 5)
    c.drawCentredString(W / 2, H - 13 * mm, "print & play · use only the seats you need · every number is a design choice, not mythology")

    margin = 8 * mm
    title_h = 18 * mm
    gap = 6 * mm
    seat_w = (W - margin * 2 - gap) * 0.5 * 0.72  # 72% of half → leaves a centre band
    avail_h = H - title_h - margin
    seat_h = (avail_h - gap) / 2
    seats = [
        ("SEAT 1", margin, margin + seat_h + gap),
        ("SEAT 2", W - margin - seat_w, margin + seat_h + gap),
        ("SEAT 3", margin, margin),
        ("SEAT 4", W - margin - seat_w, margin),
    ]
    for label, sx, sy in seats:
        accent = HexColor(CULTURE_ACCENTS[[c for c in CULTURES][int(label[-1]) - 1]]) if accented else HexColor("#666666")
        draw_seat(c, sx, sy, seat_w, seat_h, label, accent, 24)

    # centre band
    bx = margin + seat_w + gap / 2
    bw = W - margin * 2 - seat_w * 2 - gap
    by = margin
    bh = avail_h
    draw_wheel(c, bx + bw / 2, by + bh - 34 * mm, 20 * mm)
    box_h = 18 * mm
    draw_zone_box(c, bx, by + bh - 78 * mm, bw, box_h, "DECK", "draw here")
    draw_zone_box(c, bx, by + bh - 100 * mm, bw, box_h, "DISCARD", "")
    draw_zone_box(c, bx, by + bh - 122 * mm, bw, box_h, "RELICS", "shared vault")
    # turn flow
    c.setFillColor(HexColor("#111111"))
    c.setFont("Helvetica-Bold", 5.4)
    c.drawString(bx, by + 44 * mm, "TURN FLOW")
    steps = [
        "1 DRAW — draw 1 (reshuffle discard if empty)",
        "2 CHANNEL — +2 (2P) · ramp +2/+3/+4 (3–4P) · cap 12",
        "3 MAIN — summon · attach relic · strike any living seat",
        "4 UPKEEP — discard to 7 · ready deities · pass",
    ]
    c.setFont("Helvetica", 4.2)
    c.setFillColor(HexColor("#555555"))
    for i, s in enumerate(steps):
        c.drawString(bx, by + 39 * mm - i * 4.2 * mm, s)
    c.setFillColor(HexColor("#999999"))
    c.setFont("Helvetica", 3.4)
    c.drawString(bx, by + 18 * mm, "Summoning sickness · 1 strike/deity/turn")
    c.drawString(bx, by + 13.5 * mm, "Pillar at 0 = seat eliminated · last standing wins")
    c.restoreState()
    c.showPage()
    c.save()
    return buf.getvalue()


def cmd_board(outdir):
    (outdir / "board-a3.pdf").write_bytes(_board((A3[1], A3[0]), 1.0, True))
    (outdir / "board-a4.pdf").write_bytes(_board((A4[1], A4[0]), (A4[1]) / (A3[1]), False))
    print("board: board-a3.pdf + board-a4.pdf")


# ---------------------------------------------------------------------------
# tokens / reference sheets (D2.4) — A4
# ---------------------------------------------------------------------------
def cmd_tokens(outdir):
    path = outdir / "reference-sheets.pdf"
    c = rl_canvas.Canvas(str(path), pagesize=A4, invariant=1)
    c.setPageCompression(1)
    W, H = A4
    M = 15 * mm

    # ---- page 1: element cycle + trackers ----
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(HexColor("#111111"))
    c.setFont("Times-Bold", 16)
    c.drawString(M, H - M, "Reference sheet 1 — the wheel, essence & the Pillar")
    c.setFont("Helvetica", 6.5)
    c.setFillColor(HexColor("#777777"))
    c.drawString(M, H - M - 6 * mm, "The Divine Atlas · Pantheon · cut-out tokens carry crop marks")
    draw_wheel(c, W / 2, H - 78 * mm, 34 * mm)
    # advantage table
    c.setFillColor(HexColor("#111111"))
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M, H - 122 * mm, "ELEMENTAL ADVANTAGE (+2 PWR to the attacker)")
    c.setFont("Helvetica", 6)
    c.setFillColor(HexColor("#555555"))
    for i, (a, b) in enumerate(ADVANTAGE.items()):
        c.drawString(M, H - 128 * mm - i * 4.6 * mm, f"{ELEMENT_LABELS[a]} attacking {ELEMENT_LABELS[b]}  →  +2 PWR")
    c.setFillColor(HexColor("#888888"))
    c.setFont("Helvetica-Oblique", 5.4)
    c.drawString(M, H - 128 * mm - len(ADVANTAGE) * 4.6 * mm - 1 * mm,
                 "Light, Death, Sky and Void are neutral — no advantage either way.")
    # essence token strips (2)
    ty = H - 175 * mm
    for row in range(2):
        c.setFillColor(HexColor("#111111"))
        c.setFont("Helvetica-Bold", 6.4)
        c.drawString(M, ty - row * 14 * mm, "ESSENCE 0–12 (tick as your pool grows)")
        for i in range(13):
            xx = M + i * ((W - 2 * M) / 12)
            c.setFillColor(HexColor("#ffffff"))
            c.setStrokeColor(HexColor("#333333"))
            c.setLineWidth(0.3)
            c.circle(xx, ty - row * 14 * mm - 7 * mm, 2.6 * mm, stroke=1, fill=1)
            c.setFillColor(HexColor("#666666"))
            c.setFont("Helvetica", 4.6)
            c.drawCentredString(xx, ty - row * 14 * mm - 11 * mm, str(i))
    # pillar trackers
    py = ty - 2 * 14 * mm - 8 * mm
    for k, hp in enumerate((20, 24)):
        c.setFillColor(HexColor("#111111"))
        c.setFont("Helvetica-Bold", 6.4)
        c.drawString(M, py - k * 16 * mm, f"COSMIC PILLAR — {hp} HP  ({'2–3 seats' if hp == 20 else '4 seats'})")
        per_row = 12
        r = 2.2 * mm
        dgap = (W - 2 * M) / per_row
        for i in range(hp):
            xx = M + (i % per_row) * dgap
            yy = py - k * 16 * mm - 6 * mm - (i // per_row) * 6 * mm
            c.setFillColor(HexColor("#ffffff"))
            c.setStrokeColor(HexColor("#333333"))
            c.setLineWidth(0.3)
            c.circle(xx, yy, r, stroke=1, fill=1)
    # crop marks around a token sheet hint
    c.setStrokeColor(HexColor("#bbb"))
    c.setLineWidth(0.3)
    c.showPage()

    # ---- page 2: synergies + keywords + cut-out tokens ----
    c.setFillColor(HexColor("#ffffff"))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(HexColor("#111111"))
    c.setFont("Times-Bold", 16)
    c.drawString(M, H - M, "Reference sheet 2 — synergies, keywords & tokens")
    # synergy table
    y = H - M - 10 * mm
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M, y, "PANTHEON SYNERGIES (one per deck, active all game)")
    y -= 6 * mm
    c.setFillColor(HexColor("#f0ede4"))
    c.rect(M, y - 30 * mm, W - 2 * M, 30 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#111111"))
    c.setFont("Helvetica-Bold", 5.2)
    c.setFont("Helvetica", 5.2)
    for i, (cul, name, text) in enumerate(CULTURE_SYNERGY):
        yy = y - 4 * mm - i * 4.6 * mm
        c.setFillColor(HexColor("#111111"))
        c.setFont("Helvetica-Bold", 5.6)
        c.drawString(M + 2 * mm, yy, f"{cul} — {name}")
        c.setFillColor(HexColor("#555555"))
        c.setFont("Helvetica", 5.4)
        c.drawString(M + 55 * mm, yy, text)
    # keywords
    ky = y - 38 * mm
    c.setFillColor(HexColor("#111111"))
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M, ky, "KEYWORD QUICK-REFERENCE")
    keywords = [
        ("Banish", "remove a seat's field deities when it is eliminated"),
        ("Channel", "the turn's essence step"),
        ("Domain", "mythic concepts a deity carries; drive synergies + element"),
        ("Element bonus", "+2 PWR when the attacker's element beats the defender's"),
        ("Essence", "summoning currency — start 2, cap 12"),
        ("Intercept", "block a Pillar strike with one of your own deities"),
        ("Pillar", "a seat's life total (20 HP for 2–3 seats, 24 for 4)"),
        ("Relic", "a Vault artifact attached to a deity for +1 PWR / +1 GRD"),
        ("Sickness", "a deity cannot strike the turn it arrives"),
        ("Synergy", "a pantheon's one signature rule"),
    ]
    c.setFont("Helvetica", 5.4)
    for i, (k, v) in enumerate(keywords):
        yy = ky - 6 * mm - i * 4.4 * mm
        c.setFillColor(HexColor("#111111"))
        c.setFont("Helvetica-Bold", 5.4)
        c.drawString(M, yy, k)
        c.setFillColor(HexColor("#555555"))
        c.setFont("Helvetica", 5.4)
        c.drawString(M + 26 * mm, yy, v)
    # cut-out tokens with crop marks
    ty = ky - 6 * mm - len(keywords) * 4.4 * mm - 8 * mm
    c.setFillColor(HexColor("#111111"))
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M, ty, "CUT-OUT TOKENS (4 × 8 per seat — cut along the marks)")
    tw, th = 42 * mm, 14 * mm
    cols = 4
    for i in range(8):
        xx = M + (i % cols) * (tw + 2 * mm)
        yy = ty - 6 * mm - (i // cols) * (th + 2 * mm)
        c.setStrokeColor(HexColor("#333333"))
        c.setLineWidth(0.35)
        _dashed(c, (0.6, 0.6))
        c.roundRect(xx, yy - th, tw, th, 1 * mm, stroke=1, fill=0)
        _solid(c)
        c.setFillColor(HexColor("#111111"))
        c.setFont("Helvetica-Bold", 6)
        c.drawCentredString(xx + tw / 2, yy - 6 * mm, "PANTHEON")
        c.setFillColor(HexColor("#888888"))
        c.setFont("Helvetica", 4)
        c.drawCentredString(xx + tw / 2, yy - 10 * mm, "essence / pillar token")
        # crop ticks
        c.setStrokeColor(HexColor("#555555"))
        c.setLineWidth(0.3)
        for sx in (0, 1):
            for sy in (0, 1):
                px = xx + sx * tw
                py = yy - sy * th
                c.line(px - 1.2 * mm, py, px - 0.5 * mm, py)
                c.line(px + 0.5 * mm, py, px + 1.2 * mm, py)
                c.line(px, py - 1.2 * mm, px, py - 0.5 * mm)
                c.line(px, py + 0.5 * mm, px, py + 1.2 * mm)
    c.showPage()
    c.save()
    print("tokens: reference-sheets.pdf (2 pp)")


# ---------------------------------------------------------------------------
# rules booklet (D2.3) — A5, cover + TOC + sections + glossary
# ---------------------------------------------------------------------------
def _esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _inline(s):
    s = _esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<i>\1</i>", s)
    s = re.sub(r"`(.+?)`", r'<font face="Courier">\1</font>', s)
    return s


class _BookletDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            name = flowable.style.name
            text = flowable.getPlainText()
            if name == "RH1":
                self.notify("TOCEntry", (0, text, self.page))
            elif name == "RH2":
                self.notify("TOCEntry", (1, text, self.page))


def _markdown_to_story(md):
    styles = {
        "Body": ParagraphStyle("Body", fontName="Helvetica", fontSize=9, leading=12.5, spaceAfter=6, textColor=INK_TEXT),
        "RH1": ParagraphStyle("RH1", fontName="Times-Bold", fontSize=14, leading=17, spaceBefore=12, spaceAfter=7, textColor=INK0),
        "RH2": ParagraphStyle("RH2", fontName="Times-Bold", fontSize=11, leading=14, spaceBefore=9, spaceAfter=5, textColor=HexColor("#3a3323")),
        "Bullet": ParagraphStyle("Bullet", fontName="Helvetica", fontSize=9, leading=12.5, textColor=INK_TEXT),
        "Cell": ParagraphStyle("Cell", fontName="Helvetica", fontSize=7.6, leading=10, textColor=INK_TEXT),
        "CellH": ParagraphStyle("CellH", fontName="Helvetica-Bold", fontSize=7.6, leading=10, textColor=HexColor("#ffffff")),
        "Quote": ParagraphStyle("Quote", fontName="Helvetica-Oblique", fontSize=8.6, leading=12, leftIndent=8, textColor=MUTED),
    }
    story = []
    lines = md.split("\n")
    i = 0
    pending_para = []
    pending_table = []

    def flush_para():
        nonlocal pending_para
        if pending_para:
            story.append(Paragraph(_inline(" ".join(pending_para)), styles["Body"]))
            pending_para = []

    def flush_table():
        nonlocal pending_table
        if not pending_table:
            return
        rows = []
        for r, cells in enumerate(pending_table):
            st = styles["CellH"] if r == 0 else styles["Cell"]
            rows.append([Paragraph(_inline(c), st) for c in cells])
        ncols = max(len(r) for r in pending_table)
        width = (A5[0] - 30 * mm) / ncols
        t = Table(rows, colWidths=[width] * ncols, repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), INK0),
            ("GRID", (0, 0), (-1, -1), 0.3, HexColor("#bbb")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f2efe6")]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(t)
        story.append(Spacer(1, 5))
        pending_table = []

    while i < len(lines):
        line = lines[i].rstrip()
        if line.startswith("|") and line.endswith("|"):
            cells = [x.strip() for x in line.strip("|").split("|")]
            if all(re.fullmatch(r":?-{2,}:?", x) for x in cells):
                i += 1
                continue
            flush_para()
            pending_table.append(cells)
            i += 1
            continue
        else:
            flush_table()
        if line.startswith("# ") and not line.startswith("## "):
            story.append(Paragraph(_inline(line[2:].strip()), styles["RH1"]))
        elif line.startswith("## "):
            flush_para()
            story.append(Paragraph(_inline(line[3:].strip()), styles["RH1"]))
        elif line.startswith("### "):
            flush_para()
            story.append(Paragraph(_inline(line[4:].strip()), styles["RH2"]))
        elif line.startswith("> "):
            flush_para()
            story.append(Paragraph(_inline(line[2:].strip()), styles["Quote"]))
        elif re.match(r"^\s*[-*]\s+", line):
            flush_para()
            text = re.sub(r"^\s*[-*]\s+", "", line)
            story.append(Paragraph("• " + _inline(text), styles["Bullet"]))
        elif re.match(r"^\s*\d+\.\s+", line):
            flush_para()
            text = re.sub(r"^\s*\d+\.\s+", "", line)
            story.append(Paragraph("• " + _inline(text), styles["Bullet"]))
        elif line.strip() == "---":
            flush_para()
            story.append(HRFlowable(width="100%", thickness=0.6, color=GOLD_DIM, spaceBefore=4, spaceAfter=8))
        elif line.strip() == "":
            flush_para()
        else:
            pending_para.append(line.strip())
        i += 1
    flush_para()
    flush_table()
    return story


def cmd_rules(outdir):
    md = (ROOT / "docs" / "GAME_RULES.md").read_text(encoding="utf-8")
    # drop the leading H1 (used as the cover title instead)
    md = re.sub(r"^# .*\n", "", md, count=1)
    path = outdir / "rules-booklet.pdf"
    doc = _BookletDoc(str(path), pagesize=A5, leftMargin=15 * mm, rightMargin=15 * mm,
                      topMargin=15 * mm, bottomMargin=14 * mm, invariant=1,
                      title="Pantheon — Game Rules", author="The Divine Atlas")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")

    def cover(canv, d):
        canv.saveState()
        canv.setFillColor(INK0)
        canv.rect(0, 0, A5[0], A5[1], stroke=0, fill=1)
        canv.setFillColor(GOLD)
        canv.setFont("Times-Bold", 26)
        canv.drawCentredString(A5[0] / 2, A5[1] - 70 * mm, "PANTHEON")
        canv.setFont("Helvetica", 10)
        canv.setFillColor(HexColor("#cfc9bd"))
        canv.drawCentredString(A5[0] / 2, A5[1] - 80 * mm, "T H E   D I V I N E   A T L A S")
        canv.setStrokeColor(GOLD)
        canv.setLineWidth(0.6)
        canv.line(A5[0] / 2 - 30 * mm, A5[1] - 88 * mm, A5[0] / 2 + 30 * mm, A5[1] - 88 * mm)
        canv.setFillColor(HexColor("#e8e2d6"))
        canv.setFont("Times-Italic", 11)
        canv.drawCentredString(A5[0] / 2, A5[1] - 100 * mm, "Game Rules — v2, 2–4 players")
        canv.setFillColor(HexColor("#8d8878"))
        canv.setFont("Helvetica", 7)
        canv.drawCentredString(A5[0] / 2, 30 * mm, "Every number is a design choice, not mythology.")
        canv.drawCentredString(A5[0] / 2, 25 * mm, "Names, elements, domains and sources are the Atlas's.")
        canv.drawCentredString(A5[0] / 2, 18 * mm, "Regenerate: python3 scripts/make-pdfs.py rules")
        canv.restoreState()

    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame], onPage=cover),
        PageTemplate(id="body", frames=[frame]),
    ])
    story = []
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())  # cover consumes page 1
    story.append(Paragraph("Contents", ParagraphStyle("TOCH", fontName="Times-Bold", fontSize=16, spaceAfter=10, textColor=INK0)))
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle("TOC1", fontName="Helvetica-Bold", fontSize=9, leading=14, textColor=INK0),
        ParagraphStyle("TOC2", fontName="Helvetica", fontSize=8, leading=12, leftIndent=12, textColor=MUTED),
    ]
    story.append(toc)
    story.append(PageBreak())
    story.extend(_markdown_to_story(md))
    doc.multiBuild(story)
    print("rules: rules-booklet.pdf")


# ---------------------------------------------------------------------------
def cmd_all(outdir):
    cmd_cards(outdir)
    cmd_board(outdir)
    cmd_rules(outdir)
    cmd_tokens(outdir)


def main():
    ap = argparse.ArgumentParser(description="The Divine Atlas — print-ready PDF generator")
    ap.add_argument("command", choices=["cards", "board", "rules", "tokens", "all"])
    args = ap.parse_args()
    OUTDIR.mkdir(parents=True, exist_ok=True)
    {"cards": cmd_cards, "board": cmd_board, "rules": cmd_rules,
     "tokens": cmd_tokens, "all": cmd_all}[args.command](OUTDIR)


if __name__ == "__main__":
    main()
