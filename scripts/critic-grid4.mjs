import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3500);
const r = await page.evaluate(() => {
  // measure min-content width of every element via a detached probe
  const minContent = (el) => {
    const probe = el.cloneNode(true);
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;max-width:none;display:inline-block;top:-9999px;left:-99999px;width:auto;';
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return Math.round(w);
  };
  const rail = document.querySelector('.attribute-rail');
  const left = document.querySelector('.profile-grid > div');
  const suspects = [];
  for (const root of [rail, left]) {
    if (!root) continue;
    root.querySelectorAll('*').forEach(el => {
      if (el.children.length > 30) return; // skip heavy subtrees
      const w = minContent(el);
      if (w > 400) suspects.push({ root: root===rail?'rail':'left', tag: el.tagName, cls:(el.className||'').toString().slice(0,40), minW: w, text: (el.textContent||'').trim().slice(0,90), style: el.getAttribute('style')?.slice(0,80) });
    });
  }
  suspects.sort((a,b)=>b.minW-a.minW);
  return suspects.slice(0,12);
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
