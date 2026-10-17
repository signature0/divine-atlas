import { chromium } from 'playwright-core';
const EXE='/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE='http://localhost:8899';
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto(BASE+'/',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(500);
const eb=await p.evaluate(()=>{
  const els=[...document.querySelectorAll('.eyebrow, .hero-eyebrow, .carousel-slide-eyebrow')].slice(0,3);
  return els.map(el=>{const cs=getComputedStyle(el);let bg='';let n=el;while(n&&n!==document.body){const b=getComputedStyle(n).backgroundColor;if(b&&!/transparent|rgba\(0, 0, 0, 0\)/.test(b)){bg=n.className+'::'+b;break;}n=n.parentElement;}
    return {cls:el.className,color:cs.color,fs:cs.fontSize,text:el.textContent.trim(),bg};});
});
console.log('EYEBROW', JSON.stringify(eb,null,1));
// local images diagnostic on /cards
const p2=await ctx.newPage();
await p2.goto(BASE+'/cards',{waitUntil:'load'}); await p2.waitForTimeout(800);
async function stats(){return p2.evaluate(()=>{
  const imgs=[...document.images]; const local=imgs.filter(i=>i.src.includes('localhost:8899'));
  return {total:imgs.length,local:local.length,completeZero:local.filter(i=>i.complete&&i.naturalWidth===0).length,pending:local.filter(i=>!i.complete).length,loaded:local.filter(i=>i.complete&&i.naturalWidth>0).length};
});}
console.log('cards before scroll', await stats());
// force eager + scroll
await p2.evaluate(async()=>{document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');const step=600;for(let y=0;y<document.body.scrollHeight;y+=step){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
await p2.waitForTimeout(2000);
console.log('cards after force', await stats());
const broken=await p2.evaluate(()=>[...document.images].filter(i=>i.src.includes('localhost:8899')&&i.complete&&i.naturalWidth===0).map(i=>i.src));
console.log('truly broken srcs', broken.slice(0,5), 'count', broken.length);
await b.close();
