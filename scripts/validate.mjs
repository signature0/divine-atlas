// scripts/validate.mjs — the project's "no invented claims" enforcement.
// Run: node scripts/validate.mjs   (wired to `npm run validate`)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CULTURES = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'];
let errors = 0, warnings = 0;
const fail = (msg) => { errors++; console.error(`  ✗ ${msg}`); };
const warn = (msg) => { warnings++; console.warn(`  ⚠ ${msg}`); };
const jload = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// [S#] markers actually present in sources.md (research format: `**[S1]** Name...`)
function sourceRefsInMd(md) {
  const refs = new Set();
  for (const m of md.matchAll(/\*\*\[(S\d+)\]\*\*/g)) refs.add(m[1]);
  return refs;
}
function allTextRefs(obj, out = new Set()) {
  if (typeof obj === 'string') {
    for (const m of obj.matchAll(/\[(S\d+)\]/g)) out.add(m[1]);
  } else if (Array.isArray(obj)) obj.forEach((x) => allTextRefs(x, out));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((v) => allTextRefs(v, out));
  return out;
}

for (const culture of CULTURES) {
  console.log(`\n[${culture}]`);
  const dir = path.join(ROOT, 'data', culture);
  const entities = jload(path.join(dir, 'entities.json'));
  const rels = jload(path.join(dir, 'relationships.json'));
  const myths = jload(path.join(dir, 'myths.json'));
  const artworks = jload(path.join(dir, 'artworks.json'));
  const md = fs.readFileSync(path.join(dir, 'sources.md'), 'utf8');
  const knownRefs = sourceRefsInMd(md);
  const ids = new Set(entities.map((e) => e.id));

  // 1. unique entity ids
  if (ids.size !== entities.length) fail(`${culture}: duplicate entity ids`);

  // 2. relationship endpoints exist
  for (const r of rels) {
    if (!ids.has(r.from)) fail(`${culture}: relationship ${r.type} from unknown ${r.from}`);
    if (!ids.has(r.to)) fail(`${culture}: relationship ${r.type} to unknown ${r.to}`);
  }

  // 3. every [S#] in text fields resolves (refs appear as **[S#]** or [S#])
  const used = allTextRefs(entities);
  allTextRefs(myths).forEach((r) => used.add(r));
  allTextRefs(jload(path.join(dir, 'timeline.json'))).forEach((r) => used.add(r));
  allTextRefs(jload(path.join(dir, 'cosmology.json'))).forEach((r) => used.add(r));
  const dangling = [...used].filter((r) => !knownRefs.has(r));
  if (dangling.length) fail(`${culture}: [S#] markers with no sources.md entry: ${dangling.join(', ')}`);

  // 4. deity quality floor
  for (const e of entities) {
    if (e.classification === 'deity' && (!e.primary_sources || !e.primary_sources.length)) {
      fail(`${culture}: deity ${e.id} has zero primary_sources`);
    }
  }

  // 5. artworks: license + source_url present, image_url (if any) is http(s)
  for (const a of artworks) {
    if (!a.license) fail(`${culture}: artwork ${a.id} missing license`);
    if (!a.source_url) fail(`${culture}: artwork ${a.id} missing source_url`);
    if (a.image_url && !/^https?:/.test(a.image_url)) fail(`${culture}: artwork ${a.id} image_url not http(s)`);
  }

  // 6. myth participants exist
  for (const m of myths) for (const p of m.participants) if (!ids.has(p)) fail(`${culture}: myth ${m.id} participant ${p} unknown`);

  console.log(`  entities ${entities.length} · relationships ${rels.length} · myths ${myths.length} · artworks ${artworks.length} · sources ${knownRefs.size}`);
}

console.log(`\n${errors ? `✗ ${errors} error(s)` : '✓ no errors'}${warnings ? ` · ⚠ ${warnings} warning(s)` : ''}`);
process.exit(errors ? 1 : 0);
