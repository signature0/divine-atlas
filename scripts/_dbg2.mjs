import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='out';
const MIME={'.html':'text/html','.webp':'image/webp','.png':'image/png','.js':'text/javascript','.css':'text/css','.txt':'text/plain','.json':'application/json','.ico':'image/x-icon','.svg':'image/svg+xml'};
const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);let f=path.join(ROOT,p);
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory()){const i=path.join(f,'index.html');f=fs.existsSync(i)?i:f+'.html';}
 if(!fs.existsSync(f)&&fs.existsSync(f+'.html'))f+='.html';
 if(!fs.existsSync(f)&&p.endsWith('/')){const q=p.replace(/\/$/,'')+'.html';if(fs.existsSync(path.join(ROOT,q)))f=path.join(ROOT,q);}
 if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;}
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(8908);
const b=await chromium.launch({executablePath:'/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const bad=[]; p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url());});
await p.goto('http://127.0.0.1:8908/culture/slavic',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
console.log('hero img:', await p.evaluate(()=>{const i=document.querySelector('.hero-banner-img, .hero-banner-media img');return i?{src:i.getAttribute('src'),complete:i.complete,nw:i.naturalWidth}:null;}));
console.log('media html:', await p.evaluate(()=>document.querySelector('.hero-banner-media')?.innerHTML.slice(0,300)));
// open religions dropdown to see Slavic icon
await p.click('nav >> text=RELIGIONS').catch(()=>{});
await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/p11v-religions-dd.png'});
// scroll to tag grid on cards page for visual proof
await p.goto('http://127.0.0.1:8908/cards?tag=thunder',{waitUntil:'networkidle'});
await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('.deck-grid')?.scrollIntoView());
await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/p11v-tag-grid.png'});
console.log('bad responses:', bad.slice(0,8).join('\n')||'none');
await b.close(); srv.close();
