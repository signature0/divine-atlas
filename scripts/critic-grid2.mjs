import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3500);
const r = await page.evaluate(() => {
  // find the 1002 wide div containing "The account"
  let target = null;
  document.querySelectorAll('div').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 990 && (el.textContent||'').includes('Who they are')) { if(!target) target = el; }
  });
  if (!target) return { found: false };
  const chain = [];
  let el = target;
  for (let i=0; i<6 && el; i++) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    chain.push({ tag: el.tagName, cls:(el.className||'').toString().slice(0,30), w:Math.round(rect.width),
      display: cs.display, gtc: cs.gridTemplateColumns, overflow: cs.overflow, minW: cs.minWidth,
      style: el.getAttribute('style')?.slice(0,120) });
    el = el.parentElement;
  }
  // what's inside target that's wide?
  const kids = [...target.children].map(c=>({t:c.tagName, cls:(c.className||'').toString().slice(0,30), w:Math.round(c.getBoundingClientRect().width), style:c.getAttribute('style')?.slice(0,100)}));
  return { found: true, chain, kids };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
