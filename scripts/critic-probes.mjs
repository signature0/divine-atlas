// TASK-011 verification probes: overflow scope, vault images, void measurement, graph legend
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

// 1) mobile overflow across ALL deity pages
const fs = await import('fs');
const CULTS = ['japanese','greek','norse','egyptian','slavic','mesopotamian'];
const deities = [];
for (const c of CULTS) {
  const d = JSON.parse(fs.readFileSync(`/AI/agents/workspaces/divine-atlas/data/${c}/entities.json`, 'utf8'));
  (Array.isArray(d) ? d : d.entities).forEach(e => deities.push(e.id));
}
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const overflows = [];
for (const id of deities) {
  const page = await mctx.newPage();
  await page.goto(BASE + `/deity/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(900);
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })).catch(() => null);
  await page.close();
  if (dims && dims.sw > dims.cw + 1) overflows.push({ id, sw: dims.sw });
}
console.log(`DEITY MOBILE OVERFLOW: ${overflows.length}/${deities.length} pages`);
console.log(JSON.stringify(overflows));

// 2) vault images: loaded vs broken at 1440
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await ctx2.newPage();
await p2.goto(BASE + '/artifacts', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p2.waitForTimeout(6000);
const imgs = await p2.evaluate(() => [...document.querySelectorAll('.vault-card-media img')].map(i => ({
  src: (i.currentSrc || i.src || '').slice(0, 80), complete: i.complete, natW: i.naturalWidth,
})));
const broken = imgs.filter(i => !i.complete || !i.natW);
console.log(`VAULT IMGS: ${imgs.length} total, ${broken.length} not-loaded/broken`);
console.log(JSON.stringify(broken.slice(0, 8)));
// void measurement: hero bottom -> search top
const voidm = await p2.evaluate(() => {
  const h1 = document.querySelector('h1');
  const hr = h1?.closest('section')?.querySelectorAll('hr');
  const search = document.querySelector('.vault-search');
  const lastHr = hr && hr.length ? hr[hr.length - 1] : null;
  const a = lastHr?.getBoundingClientRect(); const b = search?.getBoundingClientRect();
  return a && b ? Math.round(b.top - a.bottom) : null;
});
console.log('VAULT VOID (last hr -> search top) px:', voidm);
await ctx2.close();

// 3) graph: legend visibility + canvas fill at 1440
const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p3 = await ctx3.newPage();
await p3.goto(BASE + '/graph', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p3.waitForTimeout(3000);
const g = await p3.evaluate(() => {
  const legend = [...document.querySelectorAll('text, div, span')].filter(el => /marriage|creation|conflict/i.test(el.textContent || '') && (el.textContent || '').length < 40);
  const vis = legend.map(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { t: (el.textContent || '').trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), vis: r.width > 0 && cs.display !== 'none' && r.bottom > 0 && r.top < 900 };
  });
  // svg content extent
  const svg = document.querySelector('svg');
  const gsvg = svg?.querySelector('g');
  let ext = null;
  if (svg) {
    const bb = svg.getBBox ? null : null;
    const rect = svg.getBoundingClientRect();
    // find max y of drawn content via getBBox on inner g
    try { const b = gsvg?.getBBox(); ext = b ? { w: Math.round(b.width), h: Math.round(b.height), y: Math.round(b.y) } : null; } catch {}
    ext = { ...ext, rectH: Math.round(rect.height) };
  }
  return { vis, ext };
});
console.log('GRAPH legend texts:', JSON.stringify(g.vis, null, 1));
console.log('GRAPH svg extent:', JSON.stringify(g.ext));
await ctx3.close();
await browser.close();
