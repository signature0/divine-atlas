// find the mobile overflow culprit on /deity/gre-zeus at 390px
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(4000);
const res = await page.evaluate(() => {
  const out = [];
  const cw = document.documentElement.clientWidth;
  const walk = (el) => {
    for (const child of el.children) {
      const r = child.getBoundingClientRect();
      if (r.right > cw + 1 && r.width > 40) {
        out.push({
          tag: child.tagName, cls: (child.className && child.className.baseVal !== undefined ? child.className.baseVal : child.className || '').toString().slice(0, 80),
          rect: { x: Math.round(r.x), w: Math.round(r.width), right: Math.round(r.right) },
          text: (child.textContent || '').trim().slice(0, 50),
        });
        if (out.length < 12) continue; // don't recurse into the first few wide ones deeply
      }
      if (r.right > cw + 1) walk(child);
    }
  };
  walk(document.body);
  return out.slice(0, 15);
});
console.log(JSON.stringify(res, null, 1));
// also: which element is widest overall
const widest = await page.evaluate(() => {
  let best = { w: 0 };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width > best.w) best = { w: Math.round(r.width), right: Math.round(r.right), tag: el.tagName, cls: String(el.className).slice(0, 80) };
  }
  return best;
});
console.log('WIDEST:', JSON.stringify(widest));
await browser.close();
