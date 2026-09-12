
import { chromium } from 'playwright-core';
const EXE='/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const page=await (await browser.newContext()).newPage();
page.on('pageerror',e=>console.log('PAGEERR:',String(e)));
page.on('console',m=>{ if(m.type()==='error') console.log('CONSOLE:',m.text().slice(0,600)); });
await page.goto('http://localhost:3003/culture/japanese',{waitUntil:'networkidle',timeout:60000});
await page.waitForTimeout(2500);
console.log('done');
await browser.close();
