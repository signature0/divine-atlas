
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox'] });
const jobs = [
  ['home','/index.html',1440,900],['cards','/cards.html',1440,900],
  ['print','/print.html',1440,900],['culture-greek','/culture/greek.html',1440,900],
  ['home-mobile','/index.html',380,780],['cards-mobile','/cards.html',380,780],
  ['print-mobile','/print.html',380,780],
];
for (const [name, path, w, h] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://127.0.0.1:8902' + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.screenshot({ path: '/home/mazen/.hermes/cache/scratch/atlas-v2-shots/' + name + '.png' });
  await p.close();
}
await b.close();
console.log('SHOTS_DONE');
