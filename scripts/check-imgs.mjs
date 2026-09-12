import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const pages = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctx.newPage();
for (const p of pages) {
  await pg.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await pg.waitForTimeout(8000); // give lazy imgs a chance
  const r = await pg.evaluate(() => Array.from(document.images).map(im => ({
    src: (im.currentSrc || im.src).slice(0, 90),
    nw: im.naturalWidth, ch: im.naturalHeight,
    cw: Math.round(im.getBoundingClientRect().width),
    complete: im.complete,
  })));
  console.log(`\n=== ${p} (${r.length} imgs) ===`);
  for (const i of r) {
    const ok = i.nw > 0 ? 'OK ' : 'BROKEN';
    console.log(`  ${ok} nw=${i.nw}x${i.ch} cw=${i.cw} ${i.src}`);
  }
  const shot = `/tmp/atlas-qa/live-${p.replace(/[\/-]/g,'_') || 'home'}.png`;
  await pg.screenshot({ path: shot });
  console.log('  shot:', shot);
}
await browser.close();
