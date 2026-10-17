#!/usr/bin/env python3
# scripts/optimize-art.py — Phase 9 (v2) web-asset optimisation.
#
# The generated card art ships as 1024×1440 RGBA PNGs (~2.2–3.7 MB each). Every
# one is an inline <img> on a page, so the served site referenced 176 assets
# over the ~2 MB inline-asset budget the Phase 9 sweep enforces. This script
# writes a sibling `.webp` next to each PNG (quality 82, method 4 — lossy WebP
# at roughly 1/6 the bytes with no visible change at card size) and the build
# then prefers the `.webp` when present (app/lib/art-slot.ts).
#
# The `.png` remains the canonical slot (data/art-prompts.json, the shared
# external art pipeline, the duplicate gate and the PDF printer all key on the
# `.png`), so this is purely additive: a fresh checkout that has not been
# optimised still builds and serves the PNGs.
#
# Usage:
#   python3 scripts/optimize-art.py            # optimise public/cards + public/banners
#   python3 scripts/optimize-art.py --force    # rebuild every .webp
#   python3 scripts/optimize-art.py --dir public/cards
import argparse
import os
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUALITY = 82
METHOD = 4


def convert(png: str, force: bool):
    src = Path(png)
    dst = src.with_suffix(".webp")
    if dst.exists() and not force and dst.stat().st_mtime >= src.stat().st_mtime:
        return ("skip", str(src), src.stat().st_size, dst.stat().st_size)
    from PIL import Image
    with Image.open(src) as im:
        im = im.convert("RGBA")
        im.save(dst, "WEBP", quality=QUALITY, method=METHOD)
    return ("ok", str(src), src.stat().st_size, dst.stat().st_size)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--dir", action="append", default=None)
    ap.add_argument("--workers", type=int, default=min(8, (os.cpu_count() or 4)))
    args = ap.parse_args()

    dirs = [Path(d) for d in args.dir] if args.dir else [ROOT / "public" / "cards", ROOT / "public" / "banners"]
    pngs = []
    for d in dirs:
        if not d.exists():
            continue
        for p in sorted(d.rglob("*.png")):
            if "_orphans" in p.parts:
                continue
            pngs.append(str(p))

    if not pngs:
        print("optimize-art: no PNGs found — nothing to do")
        return 0

    print(f"optimize-art: {len(pngs)} PNG(s), quality {QUALITY}, method {METHOD}, {args.workers} worker(s)")
    before = sum(os.path.getsize(p) for p in pngs)
    with ProcessPoolExecutor(max_workers=args.workers) as ex:
        results = list(ex.map(convert, pngs, [args.force] * len(pngs)))
    after = sum(r[3] for r in results)
    written = sum(1 for r in results if r[0] == "ok")
    for status, src, b, a in results:
        if status == "ok":
            pass
    print(f"  wrote {written} .webp · skipped {len(results) - written}")
    print(f"  PNG total {before/1048576:.1f} MB → WebP total {after/1048576:.1f} MB "
          f"({after/before*100:.1f}%, −{(before-after)/1048576:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
