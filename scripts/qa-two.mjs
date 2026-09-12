// one-shot: greek + zeus only, print full errors
import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const pages = [
  ['greek', '/culture/greek'],
  ['zeus', '/deity/gre-zeus'],
];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
for (const [name, path] of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  const pageErrs = [];
  const failed = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => pageErrs.push(String(e)));
  page.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 140)}`));
  try {
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1500);
    console.log(`== ${name} OK title="${await page.title()}"`);
  } catch (e) {
    console.log(`== ${name} NAV FAIL: ${String(e).slice(0, 200)}`);
  }
  console.log(`   pageErrs: ${JSON.stringify(pageErrs)}`);
  console.log(`   console:  ${JSON.stringify(errs)}`);
  console.log(`   failed:   ${JSON.stringify(failed)}`);
  await ctx.close();
}
await browser.close();
