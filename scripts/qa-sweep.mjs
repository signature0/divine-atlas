// TASK-010: full route sweep + visual baselines against prod :3002
// Usage: node scripts/qa-sweep.mjs
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const PROJ = '/AI/agents/workspaces/divine-atlas';
const BLINE = path.join(PROJ, 'qa/baseline');
const EVID = path.join(PROJ, 'qa/evidence');
fs.mkdirSync(BLINE, { recursive: true });
fs.mkdirSync(EVID, { recursive: true });

// ---------- build full route list from data ----------
const routes = [];
const add = (p) => routes.push(p);
['/', '/about', '/compare', '/graph', '/graph?from=gre-zeus', '/artifacts'].forEach(add);
for (const c of ['japanese','greek','norse','egyptian','slavic','mesopotamian']) add(`/culture/${c}`);
const load = (f) => { try { return JSON.parse(fs.readFileSync(path.join(PROJ, f), 'utf8')); } catch { return null; } };
const CULTS = ['japanese','greek','norse','egyptian','slavic','mesopotamian'];
for (const c of CULTS) {
  const deities = load(`data/${c}/entities.json`);
  const dlist = Array.isArray(deities) ? deities : ((deities && deities.entities) || []);
  for (const x of dlist) add(`/deity/${x.id}`);
  const myths = load(`data/${c}/myths.json`);
  const mlist = Array.isArray(myths) ? myths : ((myths && myths.myths) || []);
  for (const x of mlist) add(`/myths/${x.id}`);
  const arts = load(`data/${c}/artifacts.json`);
  const alist = Array.isArray(arts) ? arts : ((arts && arts.artifacts) || []);
  for (const x of alist) add(`/artifacts/${x.slug || x.id}`);
}
// domains: raw domain strings (page lowercases + uses raw value, spaces allowed)
const domains = new Set();
for (const c of CULTS) {
  const deities = load(`data/${c}/entities.json`);
  const dlist = Array.isArray(deities) ? deities : ((deities && deities.entities) || []);
  for (const x of dlist) (x.domains || []).forEach(dm => domains.add(dm));
}
for (const dm of domains) add(`/domain/${encodeURIComponent(dm)}`);
// dedupe
const uniq = [...new Set(routes)];

// ---------- sweep ----------
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const results = [];
let i = 0;
for (const route of uniq) {
  i++;
  const name = route.replace(/\//g, '_').replace(/\?/g, '?').replace(/&/g, '_') || 'root';
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
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
    // NOTE: use 'load' + settle delay, NOT 'networkidle' — lazy remote images
    // (Met/Wikimedia) never idle on art-heavy pages and caused false NAV timeouts.
    const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1200);
    status = resp ? resp.status() : 'NO-RESP';
  } catch (e) {
    status = `NAV-ERR ${String(e).slice(0, 80)}`;
  }
  await ctx.close();
  results.push({ route, name, status, consoleErrors, pageErrors, failedReqs });
  if (i % 25 === 0) process.stdout.write(`...${i}/${uniq.length}\n`);
}
await browser.close();

// ---------- negative checks ----------
const browser2 = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const negResults = [];
for (const p of ['/deity/nope-123', '/myths/nope-123', '/artifacts/nope-123', '/culture/nope']) {
  const ctx = await browser2.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  let status = 'ERR';
  try { const r = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 20000 }); status = r ? r.status() : 'NO-RESP'; } catch (e) { status = 'NAV-ERR'; }
  negResults.push({ route: p, status });
  await ctx.close();
}
await browser2.close();

// ---------- mobile overflow ----------
const browser3 = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const mobile = [];
for (const p of ['/', '/culture/japanese', '/myths/gre-creation']) {
  const ctx = await browser3.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
  await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  mobile.push({ route: p, scrollWidth: dims.sw, clientWidth: dims.cw, overflow: dims.sw > dims.cw + 1, errors: errs });
  await ctx.close();
}
await browser3.close();

// ---------- visual baselines ----------
const browser4 = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const VPS = [[390, 844, '390'], [768, 1024, '768'], [1440, 900, '1440'], [1920, 1080, '1920']];
const KEY = [['home','/'],['culture-greek','/culture/greek'],['zeus','/deity/gre-zeus'],['myth-creation','/myths/gre-creation'],['graph','/graph'],['artifacts','/artifacts'],['compare','/compare'],['about','/about']];
const baselineLog = [];
for (const [vpw, vph, tag] of VPS) {
  const ctx = await browser4.newContext({ viewport: { width: vpw, height: vph }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [name, p] of KEY) {
    const file = path.join(BLINE, `${name}_${tag}.png`);
    try {
      const r = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 });
      // let client-side graph/layout settle
      await page.waitForTimeout(1500);
      await page.screenshot({ path: file, fullPage: p === '/' || p === '/about' ? false : false });
      baselineLog.push({ name, viewport: tag, status: r?.status(), file: path.relative(PROJ, file), bytes: fs.statSync(file).size });
    } catch (e) {
      baselineLog.push({ name, viewport: tag, status: 'ERR', error: String(e).slice(0, 120) });
    }
  }
  await ctx.close();
}
await browser4.close();

// ---------- report ----------
const total = results.length;
const bad = results.filter(r => !String(r.status).startsWith('200') || r.consoleErrors.length || r.pageErrors.length || r.failedReqs.length);
const lines = [];
lines.push('# TASK-010 — QA Route Sweep Report');
lines.push(`Date: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · Target: ${BASE} (systemd divine-atlas, prod build)`);
lines.push('');
lines.push(`## Totals`);
lines.push(`- Routes swept: **${total}**`);
lines.push(`- HTTP 200: **${results.filter(r => r.status === 200).length}**`);
lines.push(`- Console errors: **${results.filter(r => r.consoleErrors.length).length}** routes`);
lines.push(`- Page errors: **${results.filter(r => r.pageErrors.length).length}** routes`);
lines.push(`- Failed requests (4xx/5xx local): **${results.filter(r => r.failedReqs.length).length}** routes`);
lines.push('');
lines.push(`## Negative checks (expect 404)`);
for (const n of negResults) lines.push(`- \`${n.route}\` → **${n.status}** ${n.status === 404 ? '✓' : '✗'}`);
lines.push('');
lines.push(`## Mobile (390px) overflow check`);
for (const m of mobile) lines.push(`- \`${m.route}\` scroll=${m.scrollWidth} client=${m.clientWidth} overflow=${m.overflow ? '✗ YES' : '✓ no'} errors=${m.errors.length}`);
lines.push('');
lines.push(`## Baselines captured`);
for (const b of baselineLog) lines.push(`- ${b.name} @${b.viewport}: ${b.status ?? 'ERR'} → ${b.file} (${b.bytes ? (b.bytes/1024).toFixed(0)+' KB' : b.error})`);
lines.push('');
lines.push(`## Failing routes (all details)`);
if (!bad.length) lines.push('- none — all routes clean');
for (const r of bad) {
  lines.push(`### ${r.route} → ${r.status}`);
  for (const e of r.consoleErrors) lines.push(`  - console: ${e}`);
  for (const e of r.pageErrors) lines.push(`  - pageerror: ${e}`);
  for (const e of r.failedReqs) lines.push(`  - req: ${e}`);
}
lines.push('');
const verdict = (bad.length === 0 && negResults.every(n => n.status === 404) && mobile.every(m => !m.overflow && m.errors.length === 0)) ? 'PASS' : 'FAIL';
lines.push(`## Verdict: **${verdict}**`);
const rpt = path.join(EVID, 'TASK-010-report.md');
fs.writeFileSync(rpt, lines.join('\n'));
process.stdout.write(`\nSWEEP: ${total} routes, ${bad.length} bad, verdict=${verdict}\nReport: ${rpt}\n`);
process.stdout.write(`Baselines: ${baselineLog.length} shots\n`);
