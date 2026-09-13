import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/deity/gre-zeus', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3000);
// baseline
const before = await page.evaluate(() => document.documentElement.scrollWidth);
// inject the hypothesized fix: mobile .profile-grid track -> minmax(0,1fr)
const after = await page.evaluate(() => {
  const st = document.createElement('style');
  st.textContent = '.profile-grid{ grid-template-columns: minmax(0,1fr) !important; } .attribute-rail{ min-width:0; } *{ min-width:0; }';
  document.head.appendChild(st);
  return document.documentElement.scrollWidth;
});
console.log('zeus mobile scrollWidth: BEFORE=', before, 'AFTER(minmax0fix)=', after, '=> FIX', after<=391?'WORKS':'still overflows');
await ctx.close();
await browser.close();
