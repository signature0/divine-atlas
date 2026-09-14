
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const out = '/AI/agents/workspaces/divine-atlas/qa/evidence/mobile-check';
const pages = [
  { name: 'myth-story', path: '/myths/egy-creation-heliopolis' },
  { name: 'culture-myths', path: '/culture/greek/myths' },
];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
for (const p of pages) {
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0,150)));
  const resp = await page.goto(BASE+p.path, { waitUntil: 'networkidle', timeout: 45000 }).catch(e=>null);
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth + 1 }));
  await page.screenshot({ path: `${out}/mobile-${p.name}.png` });
  console.log(JSON.stringify({ page: p.name, status: resp?.status(), ...m, errors: errs.slice(0,3) }));
  await page.close();
}
await browser.close();
