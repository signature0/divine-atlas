
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/', { waitUntil: 'networkidle' });
const m = await page.evaluate(() => {
  const links = document.querySelector('.topnav .links');
  const inner = document.querySelector('.topnav .inner');
  const cs = getComputedStyle(links);
  const csI = getComputedStyle(inner);
  return {
    linksScrollW: links.scrollWidth, linksClientW: links.clientWidth,
    linksOverflowX: cs.overflowX, linksFlexWrap: cs.flexWrap, linksWidth: cs.width,
    innerW: inner.clientWidth, innerOverflowX: csI.overflowX, innerDisplay: csI.display,
    docScrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
    brandW: document.querySelector('.topnav .brand').getBoundingClientRect().width,
    searchW: document.querySelector('.topnav .search-btn').getBoundingClientRect().width,
    linksRect: JSON.stringify(links.getBoundingClientRect()),
    // can the last link be reached by scrolling the strip?
  };
});
console.log(JSON.stringify(m, null, 1));
// Try scrolling the links strip to the end and screenshot
await page.evaluate(() => { const l = document.querySelector('.topnav .links'); l.scrollLeft = l.scrollWidth; });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: '/AI/agents/workspaces/divine-atlas/qa/evidence/mobile-check/mobile-nav-scrolled.png' });
await browser.close();
