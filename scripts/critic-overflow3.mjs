// TASK-011: pin down the 1002px overflow element on a deity page @390px
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3500);
const r = await page.evaluate(() => {
  const out = [];
  const all = document.querySelectorAll('*');
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 391 && rect.right > 391) {
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName, cls: ((el.className && el.className.baseVal) || el.className || '').toString().slice(0, 60),
        w: Math.round(rect.width), right: Math.round(rect.right),
        pos: cs.position, overflow: cs.overflow, minWidth: cs.minWidth, whiteSpace: cs.whiteSpace,
        text: (el.textContent || '').trim().slice(0, 60),
        html: el.outerHTML.slice(0, 220),
      });
    }
  }
  return out.slice(0, 6);
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
