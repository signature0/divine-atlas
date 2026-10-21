import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='out';
const MIME={'.html':'text/html','.webp':'image/webp','.png':'image/png','.js':'text/javascript','.css':'text/css','.txt':'text/plain','.json':'application/json','.ico':'image/x-icon','.svg':'image/svg+xml'};
const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);let f=path.join(ROOT,p);
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory()){const i=path.join(f,'index.html');f=fs.existsSync(i)?i:f+'.html';}
 if(!fs.existsSync(f)&&fs.existsSync(f+'.html'))f+='.html';
 if(!fs.existsSync(f)&&p.endsWith('/')){const q=p.replace(/\/$/,'')+'.html';if(fs.existsSync(path.join(ROOT,q)))f=path.join(ROOT,q);}
 if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;}
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(8907);
const b=await chromium.launch({executablePath:'/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('http://127.0.0.1:8907/cards',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
console.log('classes:', await p.evaluate(()=>[...new Set([...document.querySelectorAll('[class]')].flatMap(e=>[...e.classList]))].filter(c=>/tc|deck|hero|tag|grid/.test(c)).slice(0,30).join(' ')));
console.log('h1:', await p.evaluate(()=>document.querySelector('h1')?.textContent));
console.log('tc count:', await p.evaluate(()=>document.querySelectorAll('.tc').length));
console.log('deck link:', await p.evaluate(()=>[...document.querySelectorAll('a')].map(a=>a.getAttribute('href')).filter(h=>h&&/print|deck/.test(h)).slice(0,5).join(' ')));
console.log('errs:', errs.slice(0,5).join(' | ')||'none');
await p.screenshot({path:'/tmp/p11v-dbg-cards.png',fullPage:false});
await b.close(); srv.close();
