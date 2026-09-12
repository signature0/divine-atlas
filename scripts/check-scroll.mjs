import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();
await pg.goto('http://localhost:3002/culture/greek', { waitUntil: 'domcontentloaded', timeout: 60000 });
// Scroll through the whole page slowly to trigger every lazy image
await pg.evaluate(async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const step = 400;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y); await delay(120);
  }
  window.scrollTo(0, document.body.scrollHeight); await delay(2000);
});
await pg.waitForTimeout(9000);
const r = await pg.evaluate(() => Array.from(document.images).map(im => ({
  src: (im.currentSrc || im.src).slice(0, 70), nw: im.naturalWidth,
})));
const ok = r.filter(i => i.nw > 0).length;
console.log(`after scroll: ${ok}/${r.length} images decoded`);
const fails = r.filter(i => i.nw === 0);
for (const f of fails.slice(0, 8)) console.log('  still broken:', f.src);
await pg.screenshot({ path: '/tmp/atlas-qa/after-scroll-greek.png' });
console.log('shot: /tmp/atlas-qa/after-scroll-greek.png');
await browser.close();
