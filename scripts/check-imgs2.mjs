import { chromium } from 'playwright-core';
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const path = process.argv[2];
await page.goto('http://localhost:3002' + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
for (let i=0;i<14;i++){ await page.evaluate(()=>window.scrollBy(0,900)); await page.waitForTimeout(350); }
await page.waitForTimeout(4000);
const r = await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll('img')];
  for (const im of imgs) { try { im.loading = 'eager'; } catch(e){} }
  await new Promise(r2=>setTimeout(r2,3000));
  let ok=0, broken=0; const bad=[];
  for (const im of imgs) {
    const loaded = im.naturalWidth>0 && im.complete;
    if (loaded) ok++; else { broken++; bad.push(im.src.slice(0,90)); }
  }
  return { total: imgs.length, ok, broken, bad };
});
console.log(path, JSON.stringify(r));
await browser.close();
