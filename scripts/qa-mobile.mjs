#!/usr/bin/env node
// Pin the exact element causing 390px horizontal overflow
import { chromium } from 'playwright-core';
const EXE='/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto('http://localhost:3002/',{waitUntil:'load',timeout:45000});
await p.waitForTimeout(2500);
const info=await p.evaluate(()=>{
  const vw=window.innerWidth;
  const bad=[];
  document.querySelectorAll('*').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.right>vw+1||r.left<-1){
      const cs=getComputedStyle(el);
      bad.push({tag:el.tagName,cls:String(el.className).slice(0,60),text:(el.textContent||'').trim().slice(0,40),right:Math.round(r.right),w:Math.round(r.width),disp:cs.display,flexWrap:cs.flexWrap,whiteSpace:cs.whiteSpace});
    }
  });
  return {vw,docScrollW:document.documentElement.scrollWidth,bodyScrollW:document.body.scrollWidth,
    overflowXhtml:getComputedStyle(document.documentElement).overflowX,
    bad:bad.slice(0,20)};
});
console.log(JSON.stringify(info,null,2));
await b.close();
