import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='out';
const MIME={'.html':'text/html','.webp':'image/webp','.png':'image/png','.js':'text/javascript','.css':'text/css','.txt':'text/plain','.json':'application/json','.ico':'image/x-icon','.svg':'image/svg+xml'};
const srv=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);let f=path.join(ROOT,p);
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory()){const i=path.join(f,'index.html');f=fs.existsSync(i)?i:f+'.html';}
 if(!fs.existsSync(f)&&fs.existsSync(f+'.html'))f+='.html';
 if(!fs.existsSync(f)&&p.endsWith('/')){const q=p.replace(/\/$/,'')+'.html';if(fs.existsSync(path.join(ROOT,q)))f=path.join(ROOT,q);}
 if(!fs.existsSync(f)){res.writeHead(404);res.end('nf');return;}
 res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(8910);
const b=await chromium.launch({executablePath:'/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox']});
for (const [n,vp,u] of [['slavic',{width:1440,height:900},'/culture/slavic'],['cards',{width:1440,height:900},'/cards'],['artifacts-m',{width:380,height:780},'/artifacts']]) {
  const p=await b.newPage({viewport:vp});
  await p.goto('http://127.0.0.1:8910'+u,{waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  await p.screenshot({path:`/tmp/p11fix-${n}.png`});
  await p.close();
}
await b.close(); srv.close(); console.log('shot');
