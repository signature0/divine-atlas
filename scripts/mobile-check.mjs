
import { chromium } from 'playwright-core';
import fs from 'fs';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const out = '/AI/agents/workspaces/divine-atlas/qa/evidence/mobile-check';
fs.mkdirSync(out, { recursive: true });

const pages = [
  { name: 'home', path: '/' },
  { name: 'deity-zeus', path: '/deity/gre-zeus' },
  { name: 'culture-greek', path: '/culture/greek' },
  { name: 'myths', path: '/myths' },
  { name: 'graph', path: '/graph' },
  { name: 'artifacts', path: '/artifacts' },
];

// iPhone 14 Pro viewport
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const results = [];
for (const p of pages) {
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0,150)));
  page.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text().slice(0,150)); });
  const resp = await page.goto(BASE+p.path, { waitUntil: 'networkidle', timeout: 45000 }).catch(e=>null);
  await page.waitForTimeout(1500);
  const metrics = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));
  const shot = `${out}/mobile-${p.name}.png`;
  await page.screenshot({ path: shot, fullPage: false });
  // scroll mid-page for deity pages to see content
  results.push({ page: p.name, path: p.path, status: resp?.status(), ...metrics, errors: errs.length ? errs.slice(0,3) : [], shot });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
