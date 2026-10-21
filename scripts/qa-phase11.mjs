// Phase 11 headless gate. Serve the static export first, e.g.
//   npx serve out -l 8903 -s
//   BASE=http://127.0.0.1:8903 node scripts/qa-phase11.mjs
// The QA chromium in this environment is 1234; the spec's 1243 path is tried first.
import { chromium } from 'playwright-core';
import { existsSync, writeFileSync } from 'node:fs';

const CANDIDATES = [
  '/home/mazen/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  '/home/mazen/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome',
];
const EXE = CANDIDATES.find((p) => existsSync(p));
if (!EXE) throw new Error('No Playwright Chromium executable found');
if (!EXE.includes('1243')) console.warn(`[warn] spec chromium-1243 missing; using ${EXE}`);

const BASE = process.env.BASE || 'http://127.0.0.1:8903';
const OUT = '/tmp';
const PAGES = [
  ['home', '/'],
  ['cards', '/cards'],
  ['artifacts', '/artifacts'],
  ['culture-slavic', '/culture/slavic'],
  ['play', '/play'],
];
const VIEWPORTS = [[1440, 900], [380, 780]];

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const failures = [];
const notes = [];
const fail = (msg) => { failures.push(msg); console.log(`  ✗ ${msg}`); };
const pass = (msg) => console.log(`  ✓ ${msg}`);

async function newPage(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e).slice(0, 240)}`));
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (!u.startsWith('data:') && !u.startsWith('blob:')) failed.push(`${r.failure()?.errorText} ${u.slice(0, 140)}`);
  });
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url().slice(0, 140)}`); });
  return { ctx, page, errors, failed };
}

for (const [name, path] of PAGES) {
  for (const [w, h] of VIEWPORTS) {
    console.log(`\n[${name} ${w}x${h}]`);
    const { ctx, page, errors, failed } = await newPage(w, h);
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(900);

    const geom = await page.evaluate(() => {
      const isHome = !!document.querySelector('.home-carousel');
      const hero = isHome ? null : document.querySelector('.hero-banner');
      // Home is a carousel (not a page hero): its padded content box overflows
      // upward inside the fixed-height viewport by design, so check the title's
      // visible copy instead of the padding box.
      const copy = isHome
        ? document.querySelector('.carousel-slide.is-active .carousel-slide-title')
        : document.querySelector('.hero-banner-copy');
      const nav = document.querySelector('.topnav');
      const r = (el) => el ? el.getBoundingClientRect().toJSON() : null;
      return {
        isHome, hero: r(hero), copy: r(copy), nav: r(nav),
        viewport: { w: innerWidth, h: innerHeight },
        scrollW: document.documentElement.scrollWidth,
      };
    });

    if (!geom.copy) fail(`${name}@${w}: missing hero/copy`);
    // Home explicitly keeps the carousel height (E2), so min-height applies only to page heroes.
    if (!geom.isHome && geom.hero && geom.hero.height < h * 0.9) {
      fail(`${name}@${w}: hero ${Math.round(geom.hero.height)}px < 90% of ${h}`);
    }
    if (geom.nav && geom.copy && geom.copy.top < geom.nav.bottom - 1) {
      fail(`${name}@${w}: hero copy top ${Math.round(geom.copy.top)} intersects nav bottom ${Math.round(geom.nav.bottom)}`);
    }
    if (geom.scrollW > geom.viewport.w + 1) fail(`${name}@${w}: horizontal overflow ${geom.scrollW} > ${geom.viewport.w}`);

    if (errors.length) fail(`${name}@${w}: ${errors.length} console/page error(s): ${errors.slice(0, 3).join(' | ')}`);
    else pass('0 console/page errors');
    if (failed.length) fail(`${name}@${w}: ${failed.length} failed request(s): ${[...new Set(failed)].slice(0, 3).join(' | ')}`);
    else pass('0 failed requests');

    const shot = `${OUT}/p11-${name}-${w}.png`;
    await page.screenshot({ path: shot, fullPage: false });
    notes.push({ name, w, h, heroHeight: geom.hero?.height, shot });
    await ctx.close();
  }
}

// ---- E6: cold tag load, filter applied after hydration, × restores ----
console.log('\n[cards?tag=thunder cold load]');
{
  const { ctx, page, errors, failed } = await newPage(1440, 900);
  await page.goto(BASE + '/cards?tag=thunder', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForSelector('[data-testid="tag-result-count"]', { timeout: 15000 });
  await page.waitForTimeout(400);
  const tagged = await page.evaluate(() => ({
    count: document.querySelector('[data-testid="tag-result-count"]')?.textContent?.trim() || '',
    tiles: document.querySelectorAll('.deck-grid .tc-open').length,
    activeChip: document.querySelector('.deck-tag-chip')?.textContent?.trim() || '',
    body: document.body.innerText.slice(0, 200),
  }));
  if (!/\b\d+\s+gods?\s*·\s*thunder/i.test(tagged.count)) fail(`tag count line wrong: “${tagged.count}”`);
  else pass(`tag count: “${tagged.count}”`);
  if (tagged.tiles !== 4) fail(`tag grid has ${tagged.tiles} tiles, expected 4 (Thor/Perun/Zeus/Takemikazuchi)`);
  else pass('tag grid filtered to 4 tiles');
  if (!/×|✕/.test(tagged.activeChip)) fail(`active tag chip lacks clear ×: “${tagged.activeChip}”`);
  else pass(`active chip: “${tagged.activeChip}”`);
  if (errors.length) fail(`tag: console errors: ${errors.slice(0, 3).join(' | ')}`);
  if (failed.length) fail(`tag: failed requests: ${[...new Set(failed)].slice(0, 3).join(' | ')}`);

  await page.evaluate(() => document.querySelector('#deck')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/p11-cards-tag-thunder-1440.png` });
  await page.click('.deck-tag-chip');
  await page.waitForTimeout(500);
  const cleared = await page.evaluate(() => ({
    url: location.search,
    tiles: document.querySelectorAll('.deck-grid .tc-open').length,
    count: document.querySelector('[data-testid="tag-result-count"]')?.textContent || '',
  }));
  if (cleared.url.includes('tag=')) fail(`clear × left URL param: ${cleared.url}`);
  else pass('× removed the tag param');
  if (cleared.tiles <= 4) fail(`full deck after clear shows ${cleared.tiles} tiles`);
  else pass(`full deck restored: ${cleared.tiles} tiles`);
  await ctx.close();
}

// ---- E6b: overlay tag chip closes the overlay and lands on the tag view ----
console.log('\n[overlay tag chip navigation]');
{
  const { ctx, page, errors } = await newPage(1440, 900);
  await page.goto(BASE + '/cards?card=jpn-amaterasu', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cd-chips a.chip-link', { timeout: 10000 });
  const chip = await page.$eval('.cd-chips a.chip-link', (a) => ({ text: a.textContent?.trim(), href: a.getAttribute('href') }));
  await page.click('.cd-chips a.chip-link');
  await page.waitForSelector('[data-testid="tag-result-count"]', { timeout: 15000 });
  const after = await page.evaluate(() => ({
    url: location.search,
    hash: location.hash,
    count: document.querySelector('[data-testid="tag-result-count"]')?.textContent?.trim(),
    overlay: !!document.querySelector('.cd-backdrop, .cd-panel, .cd-sheet'),
  }));
  if (!after.url.includes('tag=')) fail(`overlay chip ${chip.text} → ${after.url}, expected ?tag=`);
  else pass(`overlay chip “${chip.text}” → ${after.url}`);
  if (after.overlay) fail('overlay still open after tag-chip navigation');
  if (!/\bgods?\b/.test(after.count || '')) fail(`tag view count missing after chip click: “${after.count}”`);
  if (errors.length) fail(`overlay chip: console errors: ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// ---- E4: scrolled nav class ----
console.log('\n[E4 scrolled nav]');
{
  const { ctx, page } = await newPage(1440, 900);
  await page.goto(BASE + '/cards', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
  const cls = await page.$eval('.topnav', (el) => el.className);
  if (!cls.includes('scrolled')) fail(`topnav did not gain .scrolled after scroll (class=“${cls}”)`);
  else pass('.topnav.scrolled applied after scroll');
  await ctx.close();
}

// ---- E1: relic/deity tile silhouette parity ----
console.log('\n[E1 tile parity]');
{
  const { ctx, page } = await newPage(1440, 900);
  await page.goto(BASE + '/cards', { waitUntil: 'networkidle' });
  const deity = await page.$eval('.deck-grid .tc', (el) => {
    const s = getComputedStyle(el);
    return { aspect: s.aspectRatio, radius: s.borderRadius, height: el.getBoundingClientRect().height, width: el.getBoundingClientRect().width };
  });
  await page.goto(BASE + '/artifacts', { waitUntil: 'networkidle' });
  await page.getByRole('radio', { name: 'Cards' }).click();
  await page.waitForSelector('.vault-cards-grid .tc', { timeout: 10000 });
  const relic = await page.$eval('.vault-cards-grid .tc', (el) => {
    const s = getComputedStyle(el);
    return { aspect: s.aspectRatio, radius: s.borderRadius, height: el.getBoundingClientRect().height, width: el.getBoundingClientRect().width };
  });
  if (deity.aspect !== relic.aspect) fail(`aspect mismatch deity=${deity.aspect} relic=${relic.aspect}`);
  else pass(`aspect-ratio identical: ${deity.aspect}`);
  if (deity.radius !== relic.radius) fail(`radius mismatch deity=${deity.radius} relic=${relic.radius}`);
  else pass(`border-radius identical: ${deity.radius}`);
  notes.push({ deity, relic });
  await ctx.close();
}

await browser.close();
writeFileSync('/tmp/p11-report.json', JSON.stringify({ failures, notes }, null, 2));
console.log('\n=== PHASE 11 QA ===');
if (failures.length) {
  console.log(`FAIL (${failures.length})`);
  for (const f of failures) console.log(` - ${f}`);
  process.exitCode = 1;
} else {
  console.log('PASS — 0 console errors, 0 failed requests, hero/nav clear, E1 parity, E6 tag filter.');
}
console.log('screenshots: /tmp/p11-*.png');
console.log('report: /tmp/p11-report.json');
