import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3500);
const r = await page.evaluate(() => {
  const h2s = [...document.querySelectorAll('h2')].filter(h=>h.textContent.trim()==='Who they are');
  const h2 = h2s[0];
  // its grid parent
  const grid = h2.closest('.profile-grid');
  const gcs = getComputedStyle(grid);
  // min-content test: what's the grid's scrollWidth and the track
  // dump the grid's outerHTML around the h2
  const html = grid.innerHTML.slice(0, 1200);
  // Also: does the H2 have a ::before or sibling forcing? measure each direct child min-content
  const kids = [...grid.children].map(c => {
    const rect = c.getBoundingClientRect();
    return { t: c.tagName, cls:(c.className||'').toString().slice(0,30), w: Math.round(rect.width), sw: c.scrollWidth };
  });
  return {
    tracks: gcs.gridTemplateColumns,
    gridW: Math.round(grid.getBoundingClientRect().width),
    gridSW: grid.scrollWidth,
    kids,
    html
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
