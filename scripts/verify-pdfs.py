#!/usr/bin/env python3
# THE DIVINE ATLAS — print PDF verifier (v2 Phase 7, D3).
#
# Programmatic acceptance check for the files produced by scripts/make-pdfs.py.
# Uses poppler (pdfinfo / pdffonts / pdfimages) and ghostscript — the tools the
# spec names — plus the generator's own manifest.json for front/back alignment.
# pypdf is NOT installed (and not needed).
#
#   python3 scripts/verify-pdfs.py
#
# Exit 0 = every check passed; 1 = at least one failure (details printed).
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRINT = ROOT / "public" / "print"
MM = 25.4 / 72.0  # points → mm

PASS, FAIL, WARN = "PASS", "FAIL", "WARN"
results = []


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def have(tool):
    return shutil.which(tool) is not None


def check(name, ok, detail=""):
    results.append((name, PASS if ok else FAIL, detail))
    return ok


def pt2mm(x):
    return x * MM


# expected page boxes (points), tolerance 1.5 pt
EXPECT = {
    "cards-fronts.pdf": ("A4 portrait", 595.276, 841.89, None),
    "cards-backs.pdf": ("A4 portrait", 595.276, 841.89, None),
    "board-a3.pdf": ("A3 landscape", 1190.55, 841.89, 1),
    "board-a4.pdf": ("A4 landscape", 841.89, 595.276, 1),
    "rules-booklet.pdf": ("A5 portrait", 419.528, 595.276, None),
    "reference-sheets.pdf": ("A4 portrait", 595.276, 841.89, 2),
}


def pdfinfo(path):
    r = run(["pdfinfo", str(path)])
    info = {}
    for line in r.stdout.splitlines():
        m = re.match(r"^(Pages|Page size):\s*(.+)$", line)
        if m:
            info[m.group(1)] = m.group(2).strip()
    return info


def pdffonts(path):
    r = run(["pdffonts", str(path)])
    lines = [l for l in r.stdout.splitlines()[2:] if l.strip()]
    fonts = []
    for l in lines:
        parts = re.split(r"\s{2,}", l.strip())
        if len(parts) >= 7:
            fonts.append({"name": parts[0], "type": parts[1], "emb": parts[3]})
    return fonts


def pdfimages_ppi(path):
    r = run(["pdfimages", "-list", str(path)])
    ppis = []
    for line in r.stdout.splitlines()[2:]:
        parts = line.split()
        if len(parts) < 13:
            continue
        try:
            ppis.append((int(parts[12]), int(parts[13])))
        except ValueError:
            continue
    return ppis


def main():
    print("verify-pdfs — Phase 7 print acceptance\n")
    for tool in ("pdfinfo", "pdffonts", "pdfimages", "gs"):
        if not have(tool):
            print(f"  ✗ required tool missing: {tool}")
            return 1

    table = []
    for fname, (label, exp_w, exp_h, exp_pages) in EXPECT.items():
        path = PRINT / fname
        if not path.exists():
            table.append((fname, "—", "—", "—", "—", "—", FAIL, "missing file"))
            continue
        row = {"file": fname, "size": label, "pages": "?"}
        ok = True

        # 1. opens
        info = pdfinfo(path)
        opens = "Pages" in info and "Page size" in info
        ok &= check(f"{fname}: opens (pdfinfo)", opens, info.get("Page size", "no output"))
        if not opens:
            table.append((fname, "—", "—", "—", "—", "—", FAIL, "pdfinfo failed"))
            continue

        # 2. page size
        m = re.match(r"([\d.]+)\s+x\s+([\d.]+)\s+pts", info["Page size"])
        w, h = (float(m.group(1)), float(m.group(2))) if m else (0, 0)
        size_ok = abs(w - exp_w) <= 1.5 and abs(h - exp_h) <= 1.5
        ok &= check(f"{fname}: page size {label}", size_ok, f"{pt2mm(w):.1f}×{pt2mm(h):.1f} mm")

        # pages
        pages = int(info["Pages"])
        row["pages"] = str(pages)
        if exp_pages is not None:
            ok &= check(f"{fname}: page count", pages == exp_pages, f"{pages} (expected {exp_pages})")

        # 3. fonts (pdffonts lists them; base-14 Type1 emb=no is fine)
        fonts = pdffonts(path)
        font_ok = len(fonts) >= 1
        ok &= check(f"{fname}: fonts listed", font_ok, f"{len(fonts)} font(s)")
        row["fonts"] = ",".join(sorted({f["name"] for f in fonts}))[:40]

        # 4. ghostscript rasterises without error (no missing glyphs/fonts)
        gs = run(["gs", "-o", "/dev/null", "-sDEVICE=nullpage", "-dNOPAUSE", "-dBATCH", str(path)])
        ok &= check(f"{fname}: gs renders", gs.returncode == 0, (gs.stderr.strip().splitlines() or [""])[-1][:80])
        row["gs"] = PASS if gs.returncode == 0 else FAIL

        # 5. image DPI (card art must clear the 300 DPI floor)
        ppis = pdfimages_ppi(path)
        if fname.startswith("cards-fronts"):
            min_ppi = min((min(p) for p in ppis), default=0)
            dpi_ok = min_ppi >= 300
            ok &= check(f"{fname}: image DPI ≥ 300", dpi_ok, f"{len(ppis)} images, min {min_ppi} ppi")
            row["dpi"] = f"min {min_ppi}"
        elif ppis:
            min_ppi = min(min(p) for p in ppis)
            row["dpi"] = f"min {min_ppi}"
        else:
            row["dpi"] = "vector/none"

        table.append((fname, row["size"], row["pages"], row["fonts"], row["dpi"], row["gs"],
                      PASS if ok else FAIL, ""))

    # 6. front/back alignment from the manifest
    manifest_path = PRINT / "manifest.json"
    align_ok = False
    align_detail = "manifest.json missing"
    if manifest_path.exists():
        man = json.loads(manifest_path.read_text(encoding="utf-8"))
        cols, rows = man["card"]["cols"], man["card"]["rows"]
        faces = man["faces"]
        total = man["total"]
        ids = {f["id"] for f in faces}
        good = (
            man.get("schema") == "divine-atlas/print-manifest@1"
            and len(faces) == total == 184
            and len(ids) == total
            and man["card"]["trim_mm"] == [63.5, 88.8]
            and man["card"]["bleed_mm"] == 3
            and man["card"]["art_cell_mm"] == [69.5, 94.8]
        )
        mismatch = 0
        for f in faces:
            fr, bk = f["front"], f["back"]
            if not (fr["page"] == bk["page"] and fr["slot"] == bk["slot"]
                    and bk["col"] == cols - 1 - fr["col"]
                    and bk["row"] == rows - 1 - fr["row"]):
                mismatch += 1
        align_ok = good and mismatch == 0
        align_detail = (f"{len(faces)} cards · slot identity front↔back · "
                        f"short-edge 180° grid · {mismatch} mismatch(es)")
    check("cards: front/back alignment", align_ok, align_detail)

    # ---- report ----
    print("\nVerification table")
    hdr = ("File", "Page", "Pages", "Fonts", "Image DPI", "gs", "Status")
    widths = (20, 13, 5, 34, 12, 4, 6)
    line = "  ".join(h.ljust(w) for h, w in zip(hdr, widths))
    print("  " + line)
    print("  " + "-" * len(line))
    for row in table:
        cells = (row[0], row[1], row[2], row[3], row[4], row[5], row[6])
        print("  " + "  ".join(str(c).ljust(w) for c, w in zip(cells, widths)))
    print()

    # detail: fonts + dpi
    for fname in EXPECT:
        path = PRINT / fname
        if not path.exists():
            continue
        fonts = pdffonts(path)
        emb = ", ".join(f'{f["name"]} ({f["type"]}, emb={f["emb"]})' for f in fonts)
        print(f"  fonts {fname}: {emb}")
    print()
    print(f"  {align_detail}")

    fails = [r for r in results if r[1] == FAIL]
    print(f"\n{'✓ all checks passed' if not fails else f'✗ {len(fails)} check(s) failed'} "
          f"({len(results)} checks)")
    for r in fails:
        print(f"  ✗ {r[0]}: {r[2]}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
