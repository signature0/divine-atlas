// capture the cosmology section of each circle-layout culture
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const OUT = '/tmp/atlas-cosmo';
import fs from 'fs'; fs.mkdirSync(OUT, { recursive: true });
const pages = ['greek','norse','egyptian','slavic','mesopotamian','japanese'];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
for (const c of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await ctx.newPage();
  await page.goto(BASE + `/culture/${c}`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(800);
  // find the cosmology canvas (the 16/9 aspect box) and screenshot it
  const box = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label^="Realm:"]');
    const t = btn?.closest('div');
    if (!t) return null;
    t.scrollIntoView({ block: 'center' });
    return true;
  });
  if (box) {
    await page.waitForTimeout(300);
    const el = await page.$('button[aria-label^="Realm:"]');
    const canvas = el && await el.evaluateHandle((b) => b.parentElement);
    await canvas.asElement().screenshot({ path: `${OUT}/${c}.png` });
    console.log(`${c}: captured cosmology canvas`);
  } else {
    console.log(`${c}: cosmology box not found (tradition tabs?)`);
    await page.screenshot({ path: `${OUT}/${c}.png` });
  }
  await ctx.close();
}
await browser.close();
