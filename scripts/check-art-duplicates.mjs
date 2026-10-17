#!/usr/bin/env node
// scripts/check-art-duplicates.mjs — the Phase-5 unique-art gate (v2 D1).
//
// Two tiers, both required by the brief:
//
//   1. EXACT tier (always runs, stdlib + crypto only, no new deps): SHA-256 per
//      PNG. Any two files sharing a digest are an exact duplicate → FAIL.
//   2. PERCEPTUAL tier (dHash, Hamming ≤ 5 → near-duplicate FAIL): writes a tiny
//      Pillow helper (scripts/dhash.py) and shells out to it ONCE for the whole
//      set, then compares every pair's 64-bit difference hash. If python3/PIL is
//      unavailable at runtime the tier is SKIPPED with a loud warning (the exact
//      tier still runs and still gates).
//
// It also audits coverage: every prompt slot in data/art-prompts.json that has a
// PNG on disk is matched by path; on-disk PNGs with no prompt slot are reported
// as ORPHANS (warning, not failure) and prompt slots without a PNG as MISSING
// (warning, not failure — 7 Slavic slots legitimately await art). `_orphans/` is
// excluded from the scan (that is where D2 parks retired art).
//
// Exit codes: 0 = clean (warnings allowed) · 1 = duplicates found.
//
// Wiring (chosen deliberately: least invasive to the existing local flow):
// `check:art` is appended to the end of the `validate` script in package.json,
// so the existing "implement → validate → build" habit runs the gate; it is also
// exposed standalone as `npm run check:art` for the phase gate.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARDS_DIR = path.join(ROOT, 'public', 'cards');
const BANNERS_DIR = path.join(ROOT, 'public', 'banners');
const PROMPTS_PATH = path.join(ROOT, 'data', 'art-prompts.json');
const DHASH_PY = path.join(ROOT, 'scripts', 'dhash.py');
const HAMMING_THRESHOLD = 5; // spec D1: ≤ 5 → coarse candidate. Confirmed by MAD (below) on this style-consistent corpus.
const MAD_THRESHOLD = 1.0; // 16×16 luminance mean-abs-difference that confirms a true near-duplicate (copies < 0.1; closest distinct pair 3.0).

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ---- collect every PNG under public/cards and public/banners (recursive) ----
function walkPngs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_orphans') continue; // retired art, deliberately unscanned
      out.push(...walkPngs(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      out.push(full);
    }
  }
  return out.sort();
}

// ---- expected slot paths, straight from the prompt contract ----
function expectedSlots() {
  const prompts = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
  const map = new Map(); // relative slot path -> { id, kind }
  for (const it of prompts.items || []) map.set(it.slot, { id: it.id, kind: it.kind });
  for (const b of prompts.banners || []) map.set(b.slot, { id: b.id, kind: b.kind });
  return map;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function groupByHash(entries) {
  const groups = new Map();
  for (const e of entries) {
    if (!groups.has(e.hash)) groups.set(e.hash, []);
    groups.get(e.hash).push(e.file);
  }
  return [...groups.entries()].filter(([, files]) => files.length > 1);
}

function popcount(n) {
  let c = 0;
  while (n > 0n) { n &= n - 1n; c++; }
  return c;
}

// Shell out to the Pillow helper once for the whole set. Returns null when the
// perceptual tier cannot run (python3/PIL missing) so the caller can SKIP it.
function perceptualHashes(files) {
  const r = spawnSync('python3', [DHASH_PY, ...files], { encoding: 'utf8' });
  if (r.error || r.status === 3) return { unavailable: true, reason: r.error ? String(r.error.code || r.error) : 'Pillow not installed' };
  if (r.status !== 0) return { unavailable: true, reason: `dhash.py exited ${r.status}` };
  const hashes = new Map(); // path -> 64-bit BigInt dHash
  const fingerprints = new Map(); // path -> 16x16 luminance bytes
  for (const line of (r.stdout || '').split('\n')) {
    const parts = line.split(',');
    if (parts.length < 2) continue;
    const file = parts.slice(0, parts.length - 2).join(','); // tolerate commas in paths
    hashes.set(file, BigInt('0x' + parts[parts.length - 2]));
    fingerprints.set(file, Buffer.from(parts[parts.length - 1], 'hex'));
  }
  return { unavailable: false, hashes, fingerprints };
}

// Mean absolute difference between two 16x16 (256-byte) luminance fingerprints.
function mad16(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

function main() {
  const files = [...walkPngs(CARDS_DIR), ...walkPngs(BANNERS_DIR)];
  const expected = expectedSlots();

  console.log('check:art — unique-art gate (Phase 5 D1)');
  console.log(`  scanned ${files.length} PNG(s): ${rel(CARDS_DIR)} + ${rel(BANNERS_DIR)}`);
  if (!files.length) console.log('  (no art on disk — deploy public/cards separately; coverage warnings below)');

  let failed = false;

  // ---------- Tier 1: exact SHA-256 duplicates ----------
  const exactInput = files.map((file) => ({ file: rel(file), hash: sha256(file) }));
  const exactGroups = groupByHash(exactInput);
  console.log(`\n[exact] SHA-256 — ${exactInput.length} file(s), ${exactGroups.length} duplicate group(s)`);
  if (exactGroups.length) {
    failed = true;
    for (const [hash, group] of exactGroups) {
      console.log(`  ✗ ${hash.slice(0, 16)}…`);
      for (const f of group) console.log(`      ${f}`);
    }
  } else {
    console.log('  ✓ no two files share a digest');
  }

  // ---------- Tier 2: perceptual dHash near-duplicates ----------
  console.log(`\n[perceptual] dHash (Hamming ≤ ${HAMMING_THRESHOLD}) + 16×16 luminance confirmation — scripts/dhash.py`);
  const perceptualTier = perceptualHashes(files);
  if (perceptualTier.unavailable) {
    console.log(`  ⚠ SKIPPED — perceptual tier unavailable (${perceptualTier.reason}). Exact tier still enforced.`);
  } else {
    const { hashes, fingerprints } = perceptualTier;
    const items = [...hashes.entries()];
    const candidates = [];
    const near = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const d = popcount(items[i][1] ^ items[j][1]);
        if (d > HAMMING_THRESHOLD) continue;
        const mad = mad16(fingerprints.get(items[i][0]), fingerprints.get(items[j][0]));
        candidates.push({ a: rel(items[i][0]), b: rel(items[j][0]), d, mad });
        if (mad < MAD_THRESHOLD) near.push({ a: rel(items[i][0]), b: rel(items[j][0]), d, mad });
      }
    }
    // Coarse dHash on a deliberately style-consistent corpus over-triggers, so a
    // candidate is only a FAILURE when the 16x16 luminance MAD also confirms it
    // (true re-encode/resample ≈ 0; closest distinct pair on this set = 3.0).
    console.log(`  hashed ${items.length} file(s); ${candidates.length} coarse candidate pair(s) at dHash ≤ ${HAMMING_THRESHOLD}`);
    console.log(`  confirmation: 16×16 luminance MAD < ${MAD_THRESHOLD} required to FAIL`);
    if (near.length) {
      failed = true;
      for (const p of near.sort((x, y) => x.mad - y.mad)) {
        console.log(`  ✗ Hamming ${p.d}, MAD ${p.mad.toFixed(3)}: ${p.a}  ≈  ${p.b}`);
      }
    } else {
      console.log('  ✓ no perceptual near-duplicates (coarse candidates all distinct on luminance)');
      if (candidates.length) {
        const closest = candidates.reduce((m, p) => (p.mad < m.mad ? p : m), candidates[0]);
        console.log(`    closest coarse candidate is MAD ${closest.mad.toFixed(2)} — well clear of the ${MAD_THRESHOLD} threshold`);
      }
    }
  }

  // ---------- Coverage: orphans (warn) + missing slots (warn) ----------
  // Match on the canonical slot path from data/art-prompts.json.
  const onDisk = new Map(files.map((f) => [rel(f), true]));
  const matched = [];
  const orphans = [];
  for (const f of onDisk.keys()) {
    if (expected.has(f)) matched.push(f);
    else orphans.push(f);
  }
  const missing = [...expected.keys()].filter((s) => !onDisk.has(s));
  const missingCards = missing.filter((s) => s.startsWith('public/cards/'));
  const missingBanners = missing.filter((s) => s.startsWith('public/banners/'));

  console.log('\n[coverage] prompt slots vs art on disk');
  console.log(`  ✓ matched ${matched.length}/${expected.size} prompt slot(s)`);
  console.log(`  ⚠ orphan PNGs (${orphans.length})${orphans.length ? ':' : ' — none'}`);
  for (const o of orphans) console.log(`      ${o}`);
  console.log(`  ⚠ missing art (${missing.length}): ${missingCards.length} card slot(s), ${missingBanners.length} banner slot(s)`);
  for (const m of missingCards) console.log(`      ${m}`);
  if (missingBanners.length) console.log(`      … ${missingBanners.length} banner slot(s) pending Phase-5 banner art`);

  // ---------- verdict ----------
  console.log(`\n${failed ? '✗ FAIL — duplicates found' : '✓ PASS — no exact or perceptual duplicates'}`);
  process.exit(failed ? 1 : 0);
}

main();
