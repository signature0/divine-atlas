import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8905';
const browser = await chromium.launch({ executablePath: '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const path of ['/cards/', '/artifacts/', '/culture/slavic/', '/print/']) {
  await page.goto(B + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null;
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { sel, w: Math.round(r.width), h: Math.round(r.height), ratio: (r.width / r.height).toFixed(3), radius: cs.borderRadius }; };
    return { title: document.title, tc: pick('.tc'), rc: pick('.rc'),
      tcCount: document.querySelectorAll('.tc').length, rcCount: document.querySelectorAll('.rc').length };
  });
  console.log(JSON.stringify(info));
  await page.screenshot({ path: `/tmp/p10m-${path.replace(/\W+/g, '_')}.png` });
}
await browser.close(); console.log('done');
