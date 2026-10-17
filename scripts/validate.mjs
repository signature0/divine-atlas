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
  const artPath = path.join(dir, 'artifacts.json');
  const artifacts = fs.existsSync(artPath) ? jload(artPath) : [];
  const md = fs.readFileSync(path.join(dir, 'sources.md'), 'utf8');
  const knownRefs = sourceRefsInMd(md);
  const ids = new Set(entities.map((e) => e.id));
  // Artifacts join the same graph (ADR-002): their ids are valid relationship
  // endpoints alongside entity ids.
  const artIds = new Set(artifacts.map((a) => a.id));
  const graphIds = new Set([...ids, ...artIds]);

  // 1. unique entity ids
  if (ids.size !== entities.length) fail(`${culture}: duplicate entity ids`);

  // 1b. artifact ids unique
  if (artIds.size !== artifacts.length) fail(`${culture}: duplicate artifact ids`);

  // 2. relationship endpoints exist (entities OR artifacts)
  for (const r of rels) {
    if (!graphIds.has(r.from)) fail(`${culture}: relationship ${r.type} from unknown ${r.from}`);
    if (!graphIds.has(r.to)) fail(`${culture}: relationship ${r.type} to unknown ${r.to}`);
  }

  // 3. every [S#] in text fields resolves (refs appear as **[S#]** or [S#])
  const used = allTextRefs(entities);
  allTextRefs(myths).forEach((r) => used.add(r));
  allTextRefs(jload(path.join(dir, 'timeline.json'))).forEach((r) => used.add(r));
  allTextRefs(jload(path.join(dir, 'cosmology.json'))).forEach((r) => used.add(r));
  allTextRefs(artifacts).forEach((r) => used.add(r));
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

  // 7. artifacts: endpoints, enums, power bounds (ADR-002)
  const TIERS = new Set(['minor','sacred','legendary','divine','cosmic','primordial']);
  const RANKS = new Set(['C','B','A','S','SS','EX']);
  const CONF = new Set(['high','medium','low']);
  const STATUS = new Set(['unknown','preserved','lost','hidden','destroyed','in_use']);
  const CERT = new Set(['attested','likely','later_tradition','modern_interpretation','uncertain']);
  const myids = new Set(myths.map((m) => m.id));
  for (const a of artifacts) {
    if (!a.id || !a.slug) fail(`${culture}: artifact missing id/slug`);
    for (const f of ['owner','creator']) { const v=a[f]; if (v && !ids.has(v)) fail(`${culture}: artifact ${a.id} ${f} ${v} not an entity`); }
    for (const f of ['associated_deities','associated_heroes','associated_monsters']) {
      for (const v of a[f]||[]) if (!ids.has(v)) fail(`${culture}: artifact ${a.id} ${f} ${v} not an entity`);
    }
    for (const v of a.major_myths||[]) if (!myids.has(v)) fail(`${culture}: artifact ${a.id} major_myth ${v} unknown`);
    if (!TIERS.has(a.tier)) fail(`${culture}: artifact ${a.id} bad tier ${a.tier}`);
    if (!RANKS.has(a.rank)) fail(`${culture}: artifact ${a.id} bad rank ${a.rank}`);
    if (!CONF.has(a.source_confidence)) fail(`${culture}: artifact ${a.id} bad source_confidence`);
    if (!STATUS.has(a.current_status)) fail(`${culture}: artifact ${a.id} bad current_status`);
    for (const p of a.power_profile||[]) {
      if (typeof p.value!=='number' || p.value<0 || p.value>10) fail(`${culture}: artifact ${a.id} power ${p.attribute} out of 0–10`);
      if (!p.explanation) fail(`${culture}: artifact ${a.id} power ${p.attribute} missing explanation`);
    }
    for (const ab of a.abilities||[]) if (!CERT.has(ab.certainty)) fail(`${culture}: artifact ${a.id} ability ${ab.name} bad certainty`);
    if (a.artwork && !a.artwork.image_url) fail(`${culture}: artifact ${a.id} hero artwork missing image_url`);
    if (a.artwork && !a.artwork.license) fail(`${culture}: artifact ${a.id} hero artwork missing license`);
    // list-typed fields must be arrays, never strings (guards against
    // `.map is not a function` prerender crashes)
    for (const f of ['alternative_names','powers','abilities','limitations','domains','symbols','associated_deities','associated_heroes','associated_monsters','major_myths','previous_owners','sources','primary_sources']) {
      if (a[f] !== undefined && !Array.isArray(a[f])) fail(`${culture}: artifact ${a.id} field ${f} must be an array, got ${typeof a[f]}`);
    }
  }
  // 7b. relationship fields required by the Relationship type
  const RELCONF = new Set(['attested','variant','uncertain','disputed','reconstructed']);
  for (const r of rels) {
    if (!Array.isArray(r.sources) || !r.sources.length) fail(`${culture}: relationship ${r.from}->${r.to} missing sources array`);
    if (!RELCONF.has(r.confidence)) fail(`${culture}: relationship ${r.from}->${r.to} bad confidence ${r.confidence}`);
  }

  console.log(`  entities ${entities.length} · relationships ${rels.length} · myths ${myths.length} · artworks ${artworks.length} · artifacts ${artifacts.length} · sources ${knownRefs.size}`);
}

console.log(`\n${errors ? `✗ ${errors} error(s)` : '✓ no errors'}${warnings ? ` · ⚠ ${warnings} warning(s)` : ''}`);
process.exit(errors ? 1 : 0);
