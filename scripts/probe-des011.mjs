// DES-011 verification probe (dev :3100): identical type+note relationship rows grouped on deity pages.
import { chromium } from 'playwright-core';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3100';
const out = { ts: new Date().toISOString() };

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function check(path, expect) {
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)));
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const eyebrow = [...document.querySelectorAll('.eyebrow')].find((x) => /^relationships/i.test(x.textContent.trim()));
    const note = [...document.querySelectorAll('p.mono')].find((x) => /recorded edges/i.test(x.textContent));
    const sibRows = [...document.querySelectorAll('.rel-item')].filter((r) => /sibling_of/i.test(r.querySelector('.rel-type')?.textContent || ''));
    const sib = sibRows.map((r) => [...r.querySelectorAll('.rel-note a')].map((a) => a.textContent));
    const relItems = document.querySelectorAll('.rel-item').length;
    return {
      eyebrow: eyebrow ? eyebrow.textContent.trim() : null,
      groupNote: note ? note.textContent.trim() : null,
      relItems,
      sibRows: sib,
      sibRowCount: sibRows.length,
    };
  });
  out[path] = { ...data, consoleErrors };
  if (path === '/deity/gre-zeus') await page.screenshot({ path: 'qa/evidence/DES-011-zeus_1440.png', fullPage: true });
  if (path === '/deity/jpn-susanoo') await page.screenshot({ path: 'qa/evidence/DES-011-susanoo_1440.png', fullPage: true });
  // assertions
  const a = expect(data);
  out[path].checks = a.passed ? 'PASS' : `FAIL ${JSON.stringify(a.failed)}`;
  await page.close();
}

await check('/deity/gre-zeus', (d) => {
  const failed = [];
  if (d.eyebrow !== 'Relationships (29)') failed.push(`eyebrow=${d.eyebrow}`);
  if (!/22 rows · 29 recorded edges/i.test(d.groupNote || '')) failed.push(`groupNote=${d.groupNote}`);
  if (d.sibRowCount !== 1) failed.push(`sibRowCount=${d.sibRowCount}`);
  const want = ['Hera', 'Hades', 'Poseidon', 'Demeter', 'Hestia'];
  for (const w of want) if (!d.sibRows[0]?.includes(w)) failed.push(`missing sibling ${w}`);
  return { passed: !failed.length, failed };
});

await check('/deity/jpn-susanoo', (d) => {
  const failed = [];
  if (d.sibRowCount !== 1) failed.push(`sibRowCount=${d.sibRowCount}`);
  if (!d.groupNote) failed.push('no group note');
  return { passed: !failed.length, failed };
});

await ctx.close();
await browser.close();
console.log(JSON.stringify(out, null, 1));
