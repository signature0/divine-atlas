#!/usr/bin/env node
import { chromium } from 'playwright-core';
const EXE='/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto('http://localhost:3002/',{waitUntil:'load',timeout:45000});
await p.waitForTimeout(2500);
const d=await p.evaluate(()=>{
  const meta=document.querySelector('meta[name="viewport"]');
  // find elements that are widest (near the 643 boundary)
  let widest=[];
  document.querySelectorAll('body *').forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.width>0) widest.push({w:Math.round(r.width),tag:el.tagName,cls:String(el.className).slice(0,40),text:(el.textContent||'').trim().slice(0,25)});
  });
  widest.sort((a,b)=>b.w-a.w);
  // html/body min-width + overflow
  const hw=getComputedStyle(document.documentElement);
  const bw=getComputedStyle(document.body);
  return {
    viewportMeta: meta?meta.content:'NONE',
    innerWidth: window.innerWidth,
    visualViewport: window.visualViewport?{w:window.visualViewport.width,scale:window.visualViewport.scale}:null,
    htmlMinW: hw.minWidth, bodyMinW: bw.minWidth,
    htmlWidth: hw.width, bodyWidth: bw.width,
    widest5: widest.slice(0,5)
  };
});
console.log(JSON.stringify(d,null,2));
await b.close();
