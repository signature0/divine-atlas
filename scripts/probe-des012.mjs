// DES-012 verification probe (dev :3100):
//  1) rank badges are one gold/neutral color (token), not per-culture accent;
//  2) broken/aborted remote images fire onError -> .vault-card-seal always renders.
// Note: vault images use loading="lazy" — settle() scrolls slowly and repeatedly
// so every image gets a chance to start (and, when aborted, to error).
import { chromium } from 'playwright-core';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3100';
const out = { ts: new Date().toISOString() };

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

async function slowScroll(page, rounds = 4) {
  for (let r = 0; r < rounds; r++) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((res) => setTimeout(res, 120));
      }
    });
    await page.waitForTimeout(1000);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

async function stats(page) {
  return page.evaluate(() => {
    const badges = [...document.querySelectorAll('.vault-card-rank')];
    const combos = new Set();
    for (const b of badges) {
      const cs = getComputedStyle(b);
      combos.add(`${cs.backgroundColor} / ${cs.color}`);
    }
    const imgs = [...document.querySelectorAll('.vault-card-media img')];
    const broken = imgs.filter((i) => !i.complete || i.naturalWidth === 0);
    const seals = document.querySelectorAll('.vault-card-media .vault-card-seal').length;
    const cards = document.querySelectorAll('.vault-card').length;
    const okVisual = [...document.querySelectorAll('.vault-card-media')].every((m) => {
      const img = m.querySelector('img');
      if (img) return img.complete && img.naturalWidth > 0;
      return !!m.querySelector('.vault-card-seal');
    });
    return { badgeCount: badges.length, badgeStyles: [...combos], imgCount: imgs.length, brokenImgs: broken.length, seals, cards, okVisual };
  });
}

// ---- 1) normal load: badge color + real remote failures -> seals ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/artifacts', { waitUntil: 'domcontentloaded' });
  await slowScroll(page);
  // wait until every remaining img is in a terminal state (loaded or errored+swapped)
  await page.waitForFunction(
    () => [...document.querySelectorAll('.vault-card-media img')].every((i) => i.complete),
    null, { timeout: 90000 },
  ).catch((e) => { out.normal.waitErr = String(e).slice(0, 120); });
  out.normal = await stats(page);
  await page.screenshot({ path: 'qa/evidence/DES-012-vault_1440.png' });
  await page.close(); await ctx.close();
}

// ---- 2) forced failure: abort every Wikimedia request -> onerror path ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  let aborted = 0;
  await page.route('**/upload.wikimedia.org/**', (route) => { aborted++; route.abort(); });
  out.forcedFailure = { abortedRequests: 0 };
  await page.goto(BASE + '/artifacts', { waitUntil: 'domcontentloaded' });
  await slowScroll(page, 8);
  // every lazy image must have started, errored, and been swapped for its seal
  await page.waitForFunction(() => document.querySelectorAll('.vault-card-media img').length === 0, null, { timeout: 90000 })
    .catch((e) => { out.forcedFailure.waitErr = String(e).slice(0, 120); });
  out.forcedFailure = { abortedRequests: aborted, ...(await stats(page)) };
  out.forcedFailure.sealsMatchNames = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.vault-card')];
    return cards.every((c) => {
      const seal = c.querySelector('.vault-card-seal');
      const name = c.querySelector('.vault-card-name')?.textContent || '';
      return !!seal && seal.textContent === name.charAt(0);
    });
  });
  await page.screenshot({ path: 'qa/evidence/DES-012-vault-imagerr_1440.png' });
  await page.close(); await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
