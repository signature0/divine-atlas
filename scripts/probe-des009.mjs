// DES-009 verification probe (dev :3100): coming-soon section off home, list on /about.
import { chromium } from 'playwright-core';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3100';
const out = { ts: new Date().toISOString() };

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// ---- home ----
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const body = await page.textContent('body');
  const chips = await page.locator('.chip', { hasText: /coming soon/i }).count();
  out.home = {
    hasComingSoonHeading: /coming soon to the atlas/i.test(body),
    hasExpansionPathEyebrow: /expansion path/i.test(body),
    comingSoonChips: chips,
    oneLineMention: /eleven more traditions are named in the registry/i.test(body),
    mentionLinksToAbout: await page.locator('a[href="/about"]', { hasText: /how this is built/i }).count(),
  };
  await page.screenshot({ path: 'qa/evidence/DES-009-home_1440.png', fullPage: true });
  await page.close();
}

// ---- about ----
{
  const page = await ctx.newPage();
  await page.goto(BASE + '/about', { waitUntil: 'networkidle' });
  const names = ['Celtic', 'Chinese', 'Hindu', 'Aztec', 'Maya', 'Polynesian', 'Roman', 'Finnish', 'Persian / Zoroastrian', 'West African', 'Arabian (pre-Islamic)'];
  const found = [];
  for (const n of names) {
    const c = await page.locator('.chip', { hasText: n }).count();
    if (c) found.push(n);
  }
  out.about = { chipsFound: found.length, names, missing: names.filter((n) => !found.includes(n)) };
  await page.screenshot({ path: 'qa/evidence/DES-009-about_1440.png', fullPage: true });
  await page.close();
}

await ctx.close();
await browser.close();
console.log(JSON.stringify(out, null, 1));
