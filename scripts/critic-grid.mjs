import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3500);
const r = await page.evaluate(() => {
  const pg = document.querySelector('.profile-grid');
  const cs = getComputedStyle(pg);
  const tracks = pg ? cs.gridTemplateColumns : null;
  // find the element whose min-content forces the width: walk for nowrap or long tokens
  const wide = [];
  document.querySelectorAll('*').forEach(el => {
    const c = getComputedStyle(el);
    if (c.whiteSpace === 'nowrap' || c.whiteSpace === 'pre' || c.whiteSpace === 'pre-wrap') {
      const rect = el.getBoundingClientRect();
      if (rect.width > 380) wide.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,40), ws: c.whiteSpace, w: Math.round(rect.width), text: (el.textContent||'').trim().slice(0,80) });
    }
  });
  return { tracks, wide: wide.slice(0,10) };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
