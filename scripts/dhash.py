#!/usr/bin/env python3
"""Perceptual dHash helper for scripts/check-art-duplicates.mjs (v2 Phase 5 D1).

Usage:
    python3 scripts/dhash.py <image> [<image> ...]

Prints one line per readable image:
    <path>,<16-hex-char 64-bit dHash>,<512-hex-char 16x16 luminance fingerprint>

The dHash is the standard difference hash: the image is converted to 8-bit
greyscale, resized to 9x8 (so 8 rows of 8 horizontal neighbour pairs), and each
bit is 1 when a pixel is brighter than the pixel to its right. It is cheap and
coarse on purpose — it catches re-exports / recolours / resized copies, not
mere stylistic resemblance.

The third column is a 16x16 greyscale fingerprint (256 bytes, hex) used by the
caller as a CONFIRMATION signal. Why: this corpus is deliberately style-consistent
(one centered-figure template per culture), so a raw 64-bit dHash gives many
low-Hamming FALSE pairs between genuinely different deities; a true re-encode /
resample of an image is dHash distance 0 AND near-zero mean-absolute-difference.
Calibrated on this set: re-encoded/resampled copies have MAD < 0.1, while the
closest distinct pair is MAD 3.0 — so the intersection is decisive.

Exit codes:
    0  at least attempted; per-image failures are reported on stderr and skipped
    3  Pillow (PIL) is not importable — the caller SKIPS the perceptual tier
"""
import sys


def _pixels(im):
    """Pillow 12 renamed getdata() → get_flattened_data(); support both."""
    fn = getattr(im, "get_flattened_data", None) or im.getdata
    return list(fn())


def main() -> int:
    try:
        from PIL import Image
    except Exception:
        sys.stderr.write("PIL_UNAVAILABLE\n")
        return 3

    resample = getattr(getattr(Image, "Resampling", Image), "LANCZOS", Image.LANCZOS)
    for path in sys.argv[1:]:
        try:
            with Image.open(path) as im:
                g = im.convert("L").resize((9, 8), resample)
                px = _pixels(g)
                fp = im.convert("L").resize((16, 16), resample).tobytes()  # 256 bytes
            bits = 0
            for row in range(8):
                for col in range(8):
                    bits <<= 1
                    if px[row * 9 + col] > px[row * 9 + col + 1]:
                        bits |= 1
            print(f"{path},{bits:016x},{fp.hex()}")
        except Exception as exc:  # unreadable / truncated PNG
            sys.stderr.write(f"DHASH_ERR {path}: {exc}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
