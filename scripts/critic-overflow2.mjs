// identify the 1002px-wide bare DIV on /deity/gre-zeus @390px
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(4000);
const res = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width > 392) {
      const chain = [];
      let e = el;
      for (let i = 0; i < 8 && e; i++) {
        chain.push(`${e.tagName}.${String(e.className && e.className.baseVal === undefined ? e.className : '').slice(0, 40)}${e.id ? '#' + e.id : ''}`);
        e = e.parentElement;
      }
      out.push({
        w: Math.round(r.width), right: Math.round(r.right), x: Math.round(r.x), y: Math.round(r.y),
        tag: el.tagName, cls: String(el.className).slice(0, 60),
        style: el.getAttribute('style')?.slice(0, 120) || null,
        children: el.children.length,
        text: (el.textContent || '').trim().slice(0, 60),
        chain: chain.join(' < '),
      });
    }
  }
  return out;
});
console.log(JSON.stringify(res, null, 1));
await browser.close();
