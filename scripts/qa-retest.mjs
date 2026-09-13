#!/usr/bin/env node
// Re-test the 8 timeout pages with 'load' wait + fixed delay (not networkidle)
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const pages = ['/deity/jpn-sarutahiko','/myths/jpn-amaterasu-cave','/deity/gre-chaos','/deity/gre-poseidon','/deity/gre-echidna','/deity/gre-telemachus','/deity/nor-muspel','/deity/slv-dazhbog'];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
for (const p of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0,120)));
  const t0 = Date.now();
  try {
    const r = await page.goto(BASE+p, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(4000);
    const h1 = await page.title();
    const imgCount = await page.evaluate(() => document.images.length);
    const imgComplete = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth>0).length);
    console.log(`${p} → ${r.status} in ${((Date.now()-t0)/1000).toFixed(1)}s · title="${h1.slice(0,40)}" · imgs ${imgComplete}/${imgCount} loaded · pageerrors=${errs.length}${errs.length?' '+errs[0]:''}`);
  } catch (e) {
    console.log(`${p} → ERR ${String(e).slice(0,80)}`);
  }
  await ctx.close();
}
// mobile overflow: which element is 643px wide?
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(BASE+'/', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(2500);
const wide = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right > 391 || r.left < -1) {
      const cs = getComputedStyle(el);
      out.push(`${el.tagName}.${String(el.className).slice(0,50)} right=${Math.round(r.right)} w=${Math.round(r.width)} pos=${cs.position} ovx=${cs.overflowX}`);
    }
  });
  return out.slice(0, 15);
});
console.log('--- wide elements at 390px (home) ---');
wide.forEach(w => console.log(' ', w));
await browser.close();
