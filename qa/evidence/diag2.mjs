import { chromium } from 'playwright-core';
const EXE='/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:900}});
for (const [url,texts] of [['/cards',['Cards','All']],['/graph',['Greek','Norse']],['/deity/gre-zeus',['Religions','Full pantheon']]]) {
  const p=await ctx.newPage(); await p.goto('http://localhost:8899'+url,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(500);
  const res=await p.evaluate((texts)=>{
    const out=[];
    for(const t of texts){
      const el=[...document.querySelectorAll('body *')].find(e=>e.children.length<=3 && (e.textContent||'').trim()===t);
      if(!el){out.push({t,found:false});continue;}
      const cs=getComputedStyle(el);
      out.push({t,cls:el.className,color:cs.color,fill:cs.webkitTextFillColor,bg:cs.backgroundColor,bgImg:cs.backgroundImage.slice(0,40),opacity:cs.opacity});
    }
    return out;
  },texts);
  console.log(url, JSON.stringify(res,null,1));
  await p.close();
}
await b.close();
