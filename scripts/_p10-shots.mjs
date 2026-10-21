import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8904';
const browser = await chromium.launch({ executablePath: '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
for (const [name, vp, path, sel] of [
  ['cards-1440', { width: 1440, height: 900 }, '/cards.html', '.tc'],
  ['cards-380', { width: 380, height: 780 }, '/cards.html', '.tc'],
  ['artifacts-1440', { width: 1440, height: 900 }, '/artifacts.html', '.rc'],
  ['slavic-1440', { width: 1440, height: 900 }, '/culture/slavic.html', null],
]) {
  const page = await browser.newPage({ viewport: vp });
  await page.goto(B + path, { waitUntil: 'networkidle' });
  if (sel) { const el = await page.$(sel); if (el) await el.scrollIntoViewIfNeeded(); }
  await page.waitForTimeout(500);
  await page.screenshot({ path: `/tmp/p10-${name}.png` });
  await page.close();
}
await browser.close(); console.log('done');
