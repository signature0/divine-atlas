// QA: load key pages in headless Chromium, capture console errors, failed
// network requests, and screenshots. Usage: node scripts/qa.mjs
import { chromium } from 'playwright-core';
import fs from 'fs';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const OUT = '/tmp/atlas-qa';
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  ['home', '/', 1440, 900],
  ['japanese', '/culture/japanese', 1440, 900],
  ['amaterasu', '/deity/jpn-amaterasu', 1440, 900],
  ['greek', '/culture/greek', 1440, 900],
  ['zeus', '/deity/gre-zeus', 1440, 900],
  ['compare', '/compare', 1440, 900],
  ['domain', '/domain/creation', 1440, 900],
  ['home-mobile', '/', 390, 844],
  ['japanese-mobile', '/culture/japanese', 390, 844],
];

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

const report = [];
for (const [name, path, w, h] of pages) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedReqs = [];
  const pageErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200)); });
  page.on('pageerror', (err) => pageErrors.push(String(err).slice(0, 200)));
  page.on('requestfailed', (req) => {
    const u = req.url();
    if (!u.startsWith('data:') && !u.startsWith('blob:')) failedReqs.push(`${req.failure()?.errorText} ${u.slice(0, 120)}`);
  });
  page.on('response', (res) => { if (res.status() >= 400) failedReqs.push(`HTTP ${res.status()} ${res.url().slice(0, 120)}`); });

  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log(`!! ${name}: navigation failed: ${String(e).slice(0, 150)}`);
    await ctx.close();
    continue;
  }
  await page.waitForTimeout(800); // let fonts + lazy imgs settle

  // scroll to bottom to trigger lazy-loaded images, then back to top for hero shot
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);

  const shot = `${OUT}/${name}.png`;
  await page.screenshot({ path: shot });

  const title = await page.title();
  const bodyLen = await page.evaluate(() => document.body.innerText.length);
  const imgCount = await page.evaluate(() => document.images.length);
  const imgBroken = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).length);

  report.push({ name, path, title, bodyLen, imgCount, imgBroken,
    consoleErrors: consoleErrors.length, pageErrors: pageErrors.length, failedReqs: failedReqs.length });
  if (consoleErrors.length) console.log(`  console errors [${name}]:`, consoleErrors.slice(0, 5));
  if (pageErrors.length) console.log(`  page errors [${name}]:`, pageErrors.slice(0, 5));
  if (failedReqs.length) console.log(`  failed reqs [${name}]:`, [...new Set(failedReqs)].slice(0, 8));
  await ctx.close();
}

await browser.close();
console.log('\n=== QA REPORT ===');
for (const r of report) {
  const bad = r.consoleErrors || r.pageErrors || r.failedReqs || r.imgBroken;
  console.log(`${bad ? '⚠' : '✓'} ${r.name.padEnd(16)} ${r.path.padEnd(22)} text=${String(r.bodyLen).padStart(6)} imgs=${String(r.imgCount).padStart(3)} broken=${r.imgBroken} console=${r.consoleErrors} pageErr=${r.pageErrors} netFail=${r.failedReqs}`);
}
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(`\nscreenshots in ${OUT}/`);
