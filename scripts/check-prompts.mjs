#!/usr/bin/env node
// scripts/check-prompts.mjs — the art-prompt field contract (v2 Phase 5 D4).
//
// data/art-prompts.json stores the art brief for every card slot and banner as a
// single composite `prompt` string (schema divine-atlas/art-prompts@1), whose
// segments are assembled deterministically by docs/audit/gen_art_prompts.py. The
// D4 contract names the fields each entry must carry: subject, explicit gender,
// appearance, pose, clothing/relics, setting, mood, composition (with ratio),
// style tag, negative prompt, filename/slot.
//
// The conceptual fields map onto the composite prompt like this (documented in
// docs/ART_STYLES.md §0):
//   subject       → <name>, the <classification> of <domains> … (leads the prompt)
//   gender        → the top-level `gender` field + its explicit phrase in the prompt
//   appearance    → the clipped description (deity) / artifact appearance (relic)
//   pose          → the capitalised pose sentence (deity)
//   clothing      → carried by the per-culture `Art style:` tag (draped chiton,
//                   linen shendyt, vyshyvanka, fur/wool, silk layers …)
//   relics/attrs  → "wielding …", "with …", "beside them float symbols of …",
//                   "accompanied by …" (entity-driven; may be absent)
//   setting       → "Setting: …" (deity)
//   mood          → "Mood: …" (deity)
//   composition   → "Composition: …" + "Aspect ratio <ratio>"
//   style tag     → "Art style: <per-culture tag>"
//   negative      → top-level `negative_prompt`
//   filename/slot → `slot`, matched against the deterministic path pattern
//
// Run: node scripts/check-prompts.mjs  (wired to `npm run check:prompts`).
// Exit: 0 = contract satisfied · 1 = missing/invalid fields.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROMPTS_PATH = path.join(ROOT, 'data', 'art-prompts.json');

const CULTURES = new Set(['greek', 'norse', 'egyptian', 'slavic', 'mesopotamian', 'japanese', 'pan']);
const CULTURE_TITLE = {
  greek: 'Greek', norse: 'Norse', egyptian: 'Egyptian',
  slavic: 'Slavic', mesopotamian: 'Mesopotamian', japanese: 'Japanese',
};
const KINDS = new Set(['deity', 'relic', 'banner']);
// gen_art_prompts.py GENDER_WORD — the explicit gender wording required in a deity prompt.
const GENDER_WORD = {
  male: 'male',
  female: 'female',
  other: 'dual-gendered (depicted with both masculine and feminine features)',
  unknown: 'enigmatic, beyond-human gender (do not emphasize gender)',
  pair: 'a divine pair shown together',
};
const CARD_RATIO = 'Aspect ratio 5:7 portrait (1024x1440)';
const BANNER_RATIO = 'Aspect ratio 21:9 (2016x864)';
const REQUIRED_KEYS = ['id', 'kind', 'culture', 'name', 'slot', 'prompt', 'negative_prompt'];

const data = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
const defaultNeg = data.negative_prompt_default || '';

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error(`  ✗ ${msg}`); };
const warn = (msg) => { warnings++; console.warn(`  ⚠ ${msg}`); };

const entries = [
  ...(data.items || []).map((e) => ({ ...e, _group: 'items' })),
  ...(data.banners || []).map((e) => ({ ...e, _group: 'banners' })),
];

console.log('check:prompts — art field contract (Phase 5 D4)');
console.log(`  schema ${data.schema || '(none)'} · items ${(data.items || []).length} · banners ${(data.banners || []).length}`);
if ((data.items || []).length !== 184) warn(`items = ${(data.items || []).length}, expected 184`);
if ((data.banners || []).length !== 25) warn(`banners = ${(data.banners || []).length}, expected 25`);

const seenIds = new Set();
const seenSlots = new Set();

for (const e of entries) {
  const where = `${e._group}/${e.id || '?'}`;

  // 1. required, non-empty scalar fields
  for (const k of REQUIRED_KEYS) {
    if (typeof e[k] !== 'string' || !e[k].trim()) fail(`${where}: missing/empty field "${k}"`);
  }
  if (!KINDS.has(e.kind)) fail(`${where}: bad kind "${e.kind}"`);
  if (!CULTURES.has(e.culture)) fail(`${where}: bad culture "${e.culture}"`);
  // 'pan' is the pan-Atlas cross-culture feature-page style — banners only.
  if (e.culture === 'pan' && e.kind !== 'banner') fail(`${where}: culture "pan" is only valid for banners`);

  // 2. unique id + slot
  if (e.id) {
    if (seenIds.has(e.id)) fail(`${where}: duplicate id`);
    seenIds.add(e.id);
  }
  if (e.slot) {
    if (seenSlots.has(e.slot)) fail(`${where}: duplicate slot ${e.slot}`);
    seenSlots.add(e.slot);
  }

  // 3. slot matches the deterministic filename pattern for the kind
  if (e.kind !== 'banner' && e.culture && e.id) {
    const expected = `public/cards/${e.culture}/${e.culture}-${e.id}.png`;
    if (e.slot !== expected) fail(`${where}: slot "${e.slot}" ≠ expected "${expected}"`);
  }
  if (e.kind === 'banner' && e.id) {
    const expected = `public/banners/${e.id}.png`;
    if (e.slot !== expected) fail(`${where}: slot "${e.slot}" ≠ expected "${expected}"`);
  }

  const p = typeof e.prompt === 'string' ? e.prompt : '';

  // 4. explicit gender: deities carry an enum + its explicit phrase; banners are
  //    scenes (gender "none"); relics depict an object (no gender field).
  if (e.kind === 'deity') {
    if (!(e.gender in GENDER_WORD)) fail(`${where}: bad/missing gender "${e.gender}"`);
    else if (!p.includes(GENDER_WORD[e.gender])) fail(`${where}: prompt omits explicit gender phrase for "${e.gender}"`);
  } else if (e.kind === 'banner') {
    if (typeof e.gender !== 'string' || !e.gender.trim()) fail(`${where}: banner missing explicit "gender" field`);
  }

  // 5. subject (name leads the prompt for card art) + composition/ratio + style tag
  if (e.kind === 'deity' || e.kind === 'relic') {
    if (e.name && !p.includes(e.name)) fail(`${where}: prompt does not name the subject "${e.name}"`);
    if (!p.includes(CARD_RATIO)) fail(`${where}: prompt missing card ratio "${CARD_RATIO}"`);
    if (p.includes(BANNER_RATIO)) fail(`${where}: card prompt wrongly carries banner ratio`);
  }
  if (e.kind === 'relic' && e.culture) {
    if (!p.includes(`of ${CULTURE_TITLE[e.culture]} myth`)) fail(`${where}: relic prompt missing "of ${CULTURE_TITLE[e.culture]} myth"`);
  }
  if (e.kind === 'banner') {
    if (!p.includes(BANNER_RATIO)) fail(`${where}: banner prompt missing "${BANNER_RATIO}"`);
    if (p.includes(CARD_RATIO)) fail(`${where}: banner prompt wrongly carries card ratio`);
  }

  if (!p.includes('Composition:')) fail(`${where}: prompt missing "Composition:"`);
  if (!p.includes('Art style:')) fail(`${where}: prompt missing "Art style:" (style tag / clothing)`);

  // 6. deity setting + mood + legend grounding
  if (e.kind === 'deity') {
    if (!p.includes('Setting:')) fail(`${where}: deity prompt missing "Setting:"`);
    if (!p.includes('Mood:')) fail(`${where}: deity prompt missing "Mood:"`);
    if (!p.includes('drawn from the original legends')) fail(`${where}: deity prompt missing legend grounding`);
  }

  // 7. negative prompt present (identical default is expected)
  if (typeof e.negative_prompt !== 'string' || !e.negative_prompt.trim()) {
    fail(`${where}: missing negative_prompt`);
  } else if (defaultNeg && e.negative_prompt !== defaultNeg) {
    warn(`${where}: negative_prompt differs from the schema default`);
  }
}

console.log(`\n${errors ? `✗ ${errors} error(s)` : '✓ field contract satisfied'}${warnings ? ` · ⚠ ${warnings} warning(s)` : ''}`);
process.exit(errors ? 1 : 0);
