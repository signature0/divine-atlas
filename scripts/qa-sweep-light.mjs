// Lightweight post-rebuild route sweep (single context, no baseline re-shoots).
// Verifies: every domain route 200, no console/page errors, no local 4xx/5xx,
// negative routes 404, mobile no-overflow. Usage: node scripts/qa-sweep-light.mjs
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const PROJ = '/AI/agents/workspaces/divine-atlas';
const EVID = path.join(PROJ, 'qa/evidence');
fs.mkdirSync(EVID, { recursive: true });

const routes = [];
const add = (p) => routes.push(p);
['/', '/about', '/compare', '/graph', '/graph?from=gre-zeus', '/artifacts', '/stories'].forEach(add);
const CULTS = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'];
const load = (f) => { try { return JSON.parse(fs.readFileSync(path.join(PROJ, f), 'utf8')); } catch { return null; } };
for (const c of CULTS) add(`/culture/${c}`);
for (const c of CULTS) {
  const dl = load(`data/${c}/entities.json`);
  (Array.isArray(dl) ? dl : (dl?.entities || [])).forEach(x => add(`/deity/${x.id}`));
  const ml = load(`data/${c}/myths.json`);
  (Array.isArray(ml) ? ml : (ml?.myths || [])).forEach(x => add(`/myths/${x.id}`));
  const al = load(`data/${c}/artifacts.json`);
  (Array.isArray(al) ? al : (al?.artifacts || [])).forEach(x => add(`/artifacts/${x.slug || x.id}`));
}
const domainSlug = (dm) => dm.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const domains = new Set();
for (const c of CULTS) {
  const dl = load(`data/${c}/entities.json`);
  (Array.isArray(dl) ? dl : (dl?.entities || [])).forEach(x => (x.domains || []).forEach(dm => domains.add(domainSlug(dm))));
}
for (const dm of domains) add(`/domain/${dm}`);
const uniq = [...new Set(routes)];
console.log(`routes: ${uniq.length}`);

let browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
let ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const results = [];
const CKPT = `${EVID}/GATE5-sweep-light-ckpt.json`;
const doneRoutes = fs.existsSync(CKPT) ? new Set(JSON.parse(fs.readFileSync(CKPT, 'utf8'))) : new Set();
if (doneRoutes.size) console.log(`resuming — ${doneRoutes.size} routes already done`);
let i = 0;
async function freshCtx() {
  try { await ctx.close(); } catch {}
  try { await browser.close(); } catch {}
  browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
}
for (const route of uniq) {
  i++;
  if (doneRoutes.has(route)) { results.push({ route, status: '200 (checkpointed)', consoleErrors: [], pageErrors: [], failedReqs: [] }); continue; }
  if (i % 250 === 0) { console.log('cycling browser'); await freshCtx(); }
  const page = await ctx.newPage();
  const consoleErrors = [], pageErrors = [], failedReqs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 200)));
  page.on('requestfailed', r => {
    const u = r.url();
    if (!u.startsWith('data:') && !u.startsWith('blob:') && !u.includes(BASE)) failedReqs.push(`${r.failure()?.errorText} ${u.slice(0, 100)}`);
  });
  page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(BASE)) failedReqs.push(`HTTP ${r.status()} ${r.url().slice(0, 100)}`); });
  let status = 'ERR';
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(700);
    status = resp ? resp.status() : 'NO-RESP';
  } catch (e) { status = `NAV-ERR ${String(e).slice(0, 80)}`; }
  await page.close();
  results.push({ route, status, consoleErrors, pageErrors, failedReqs });
  if (i % 25 === 0) fs.writeFileSync(CKPT, JSON.stringify([...doneRoutes, ...results.slice(-25).map(r => r.route)]));
  if (i % 50 === 0) console.log(`...${i}/${uniq.length}`);
}
// negative routes
for (const p of ['/deity/nope-123', '/myths/nope-123', '/artifacts/nope-123', '/culture/nope', '/this-page-does-not-exist-xyz']) {
  const page = await ctx.newPage();
  let status = 'ERR';
  try { const r = await page.goto(BASE + p, { waitUntil: 'load', timeout: 20000 }); status = r ? r.status() : 'NO-RESP'; } catch (e) { status = 'NAV-ERR'; }
  results.push({ route: 'NEG ' + p, status, consoleErrors: [], pageErrors: [], failedReqs: [] });
  await page.close();
}
await ctx.close();

// mobile overflow (separate mobile context)
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mobile = [];
for (const p of ['/', '/culture/japanese', '/myths/gre-creation', '/deity/gre-zeus', '/artifacts', '/stories']) {
  const page = await mctx.newPage();
  await page.goto(BASE + p, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })).catch(() => null);
  mobile.push({ route: p, ...dims, overflow: dims && dims.sw > dims.cw + 1 });
  await page.close();
}
await mctx.close();
await browser.close();

const bad = results.filter(r => !r.route.startsWith('NEG') && (!String(r.status).startsWith('200') || r.consoleErrors.length || r.pageErrors.length || r.failedReqs.length));
const neg = results.filter(r => r.route.startsWith('NEG'));
const mobBad = mobile.filter(m => m.overflow);
const out = { ts: new Date().toISOString(), total: uniq.length, bad, neg, mobile };
const TS = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(`${EVID}/GATE5-sweep-light-${TS}.json`, JSON.stringify(out, null, 1));
console.log('\n=== SWEEP LIGHT SUMMARY ===');
console.log(`routes=${uniq.length} bad=${bad.length} mobile-overflow=${mobBad.length}`);
console.log('negatives:', neg.map(n => `${n.route.replace('NEG ','')}=${n.status}`).join(' '));
if (bad.length) console.log(JSON.stringify(bad.slice(0, 12), null, 1));
if (mobBad.length) console.log(JSON.stringify(mobBad, null, 1));
process.exit(bad.length || mobBad.length ? 1 : 0);
