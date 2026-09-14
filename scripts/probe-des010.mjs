// DES-010 verification probe (dev :3100): vault header void tightened; filters + first card row above the fold @1440x900.
import { chromium } from 'playwright-core';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3100';
const out = { ts: new Date().toISOString(), fold: 900 };

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/artifacts', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
out.vault = await page.evaluate(() => {
  const r = (sel) => { const el = document.querySelector(sel); return el ? Math.round(el.getBoundingClientRect().top) : null; };
  const header = document.querySelector('header');
  const hb = header ? Math.round(header.getBoundingClientRect().bottom) : null;
  const grid = document.querySelector('.vault-grid');
  const cards = grid ? [...grid.children] : [];
  const firstRowBottom = cards.length ? Math.round(Math.max(...cards.slice(0, 4).map((c) => c.getBoundingClientRect().bottom))) : null;
  const note = document.querySelector('.vault-note');
  return {
    headerBottom: hb,
    searchTop: r('.vault-search'),
    filtersTop: r('.vault-filters'),
    toolbarTop: r('.vault-toolbar'),
    gridTop: r('.vault-grid'),
    firstRowBottom,
    disclaimerInToolbar: !!note && note.closest('.vault-toolbar') !== null,
    disclaimerText: note ? note.textContent : null,
    disclaimerInHeader: header ? /interpretive/i.test(header.textContent) : false,
  };
});
await page.screenshot({ path: 'qa/evidence/DES-010-vault_1440.png' }); // viewport-only (fold check)
await page.screenshot({ path: 'qa/evidence/DES-010-vault_1440-full.png', fullPage: true });
await page.close();

// mobile sanity: note wraps without overflow
{
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mp = await mctx.newPage();
  await mp.goto(BASE + '/artifacts', { waitUntil: 'networkidle' });
  out.mobile = await mp.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  await mp.screenshot({ path: 'qa/evidence/DES-010-vault_390.png' });
  await mp.close(); await mctx.close();
}
await ctx.close(); await browser.close();
console.log(JSON.stringify(out, null, 1));
