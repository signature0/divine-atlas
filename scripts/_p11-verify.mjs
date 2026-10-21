import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = 'out';
const MIME = {'.html':'text/html','.webp':'image/webp','.png':'image/png','.js':'text/javascript','.css':'text/css','.txt':'text/plain','.json':'application/json','.ico':'image/x-icon','.svg':'image/svg+xml'};
const srv = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(ROOT, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) { const i = path.join(f,'index.html'); f = fs.existsSync(i) ? i : f + '.html'; }
  if (!fs.existsSync(f) && fs.existsSync(f+'.html')) f += '.html';
  if (!fs.existsSync(f) && p.endsWith('/')) { const q=p.replace(/\/$/,'')+'.html'; if (fs.existsSync(path.join(ROOT,q))) f=path.join(ROOT,q); }
  if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, {'content-type': MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
}).listen(8906);
const b = await chromium.launch({ executablePath: '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args:['--no-sandbox'] });
const errs = [];
// hero/nav geometry
for (const [name, vp, url] of [
  ['cards-1440',{width:1440,height:900},'/cards'],
  ['slavic-1440',{width:1440,height:900},'/culture/slavic'],
  ['cards-380',{width:380,height:780},'/cards'],
  ['artifacts-380',{width:380,height:780},'/artifacts'],
]) {
  const p = await b.newPage({ viewport: vp });
  p.on('console', m => m.type()==='error' && errs.push(name+': '+m.text()));
  p.on('pageerror', e => errs.push(name+': '+e.message));
  await p.goto('http://127.0.0.1:8906'+url, { waitUntil:'networkidle' });
  await p.waitForTimeout(500);
  const geo = await p.evaluate(()=>{
    const nav=document.querySelector('nav,[class*=nav]')?.getBoundingClientRect();
    const hero=document.querySelector('[class*=hero]'); const hb=hero?.getBoundingClientRect();
    const copy=document.querySelector('[class*=hero-banner-title],[class*=hero-copy]')?.getBoundingClientRect();
    return { vh: innerHeight, heroH: hb?Math.round(hb.height):null,
      copyTop: copy?Math.round(copy.top):null, navBottom: nav?Math.round(nav.bottom):null,
      overlap: (copy&&nav)? copy.top < nav.bottom : null };
  });
  console.log(name, JSON.stringify(geo));
  await p.screenshot({ path:`/tmp/p11v-${name}.png` });
  await p.close();
}
// tag filter cold load
{
  const p = await b.newPage({ viewport:{width:1440,height:900} });
  p.on('pageerror', e => errs.push('tag: '+e.message));
  await p.goto('http://127.0.0.1:8906/cards?tag=thunder', { waitUntil:'networkidle' });
  await p.waitForTimeout(600);
  const r = await p.evaluate(()=>({ count: document.querySelector('[data-testid=tag-result-count]')?.textContent || document.body.innerText.match(/\d+ gods? · thunder/)?.[0], tiles: document.querySelectorAll('.tc').length, chip: !!document.querySelector('[class*=tag-chip]') }));
  console.log('tag=thunder', JSON.stringify(r));
  await p.screenshot({ path:'/tmp/p11v-tag-thunder.png' });
  await p.close();
}
// tile parity: .tc on /cards vs relic tiles on /artifacts cards view
{
  const p = await b.newPage({ viewport:{width:1440,height:900} });
  await p.goto('http://127.0.0.1:8906/cards', { waitUntil:'networkidle' });
  const tc = await p.evaluate(()=>{const e=document.querySelector('.tc');const r=e.getBoundingClientRect();const c=getComputedStyle(e);return {w:Math.round(r.width),h:Math.round(r.height),ratio:+(r.width/r.height).toFixed(3),radius:c.borderRadius};});
  await p.goto('http://127.0.0.1:8906/artifacts', { waitUntil:'networkidle' });
  await p.evaluate(()=>{const r=[...document.querySelectorAll('label,button')].find(x=>/cards/i.test(x.textContent));r&&r.click();});
  await p.waitForTimeout(600);
  const rc = await p.evaluate(()=>{const e=document.querySelector('.tc, [class*=card-face], [class*=CardFace]')?.closest('[class*=tc]')||document.querySelector('[class*=vault] [class*=card]');if(!e)return null;const r=e.getBoundingClientRect();const c=getComputedStyle(e);return {sel:e.className.split(' ')[0],w:Math.round(r.width),h:Math.round(r.height),ratio:+(r.width/r.height).toFixed(3),radius:c.borderRadius};});
  console.log('deity tile', JSON.stringify(tc)); console.log('relic tile', JSON.stringify(rc));
  await p.close();
}
await b.close(); srv.close();
console.log(errs.length? 'CONSOLE_ERRORS:\n'+errs.join('\n') : 'NO_CONSOLE_ERRORS');
