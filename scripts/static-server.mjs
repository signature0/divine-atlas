// scripts/static-server.mjs — dependency-free static server for the Next.js
// static export in out/. Mirrors the clean-URL conventions Cloudflare Pages
// applies: `/about` → `about.html`, `/cards/` → `cards/index.html`, with the
// project's 404.html fallback. Used by the Phase 9 QA sweep.
//
//   node scripts/static-server.mjs [port] [root]
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(process.argv[3] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'out'));
const PORT = Number(process.argv[2] || 8899);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
  '.map': 'application/json',
};

function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (!p.startsWith('/')) p = '/' + p;
  const safe = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
  const base = path.join(ROOT, safe);
  if (!base.startsWith(ROOT)) return null;
  const isDir = (f) => { try { return fs.statSync(f).isDirectory(); } catch { return false; } };
  const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };
  if (isDir(base) && isFile(path.join(base, 'index.html'))) return path.join(base, 'index.html');
  if (isFile(base) && !path.extname(base)) {
    if (isFile(base + '.html')) return base + '.html';
  }
  if (isFile(base)) return base;
  if (isFile(base + '.html')) return base + '.html';
  if (isFile(path.join(base, 'index.html'))) return path.join(base, 'index.html');
  return null;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  const file = resolveFile(req.url || '/');
  if (!file) {
    const nf = path.join(ROOT, '404.html');
    if (fs.existsSync(nf)) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(nf));
    } else { res.writeHead(404); res.end('Not found'); }
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const body = fs.readFileSync(file);
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'content-length': body.length });
  res.end(req.method === 'HEAD' ? undefined : body);
});

server.listen(PORT, () => console.log(`static server: ${ROOT} on http://localhost:${PORT}`));
