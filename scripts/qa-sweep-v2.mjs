// scripts/qa-sweep-v2.mjs — PHASE 9 (v2) full-site static QA sweep.
//
// Serves nothing itself: point it at a static server over out/ (e.g.
// `python3 -m http.server 8899 -d out`) and pass the port:
//
//   node scripts/qa-sweep-v2.mjs 8899
//
// Covers the Phase-9 D1 checklist:
//   • routes: every out/**/*.html page at 380px AND 1440px — console errors,
//     local failed requests (404s for images/PDFs/fonts), horizontal overflow.
//   • broken links: every internal href in the exported HTML resolves to a file.
//   • images: sampled pages — every <img> loads (naturalWidth>0) and has alt;
//     lazy-loading coverage on card grids / banners.
//   • performance: referenced local assets > ~2 MB (PDF downloads exempt, but
//     flagged if not a plain link); lazy coverage.
//   • a11y: keyboard pass on v2 surfaces at 380px — primary nav, More sheet,
//     mobile tab bar, card overlay focus-trap + Escape, hero carousel keyboard,
//     prefers-reduced-motion carousel, footer mailto focusable; WCAG contrast.
//   • print CSS: @media print layout check on one page.
//
// Output: qa/evidence/PHASE9-sweep-<ts>.{json,md} + console summary.
// Exit 0 = no hard failures (console/links/overflow); 1 otherwise.
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const EVID = path.join(ROOT, 'qa', 'evidence');
fs.mkdirSync(EVID, { recursive: true });

const PORT = process.argv[2] || process.env.PORT || '8899';
const BASE = `http://localhost:${PORT}`;
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const TS = new Date().toISOString().replace(/[:.]/g, '-');
const CONCURRENCY = Number(process.env.SWEEP_CONCURRENCY || 6);

// ---------------------------------------------------------------------------
// route discovery from the static export
// ---------------------------------------------------------------------------
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}
function fileToUrl(f) {
  const rel = path.relative(OUT, f).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel.replace(/\.html$/, '');
}
const htmlFiles = walk(OUT).filter((f) => f.endsWith('.html'));
const ROUTES = [...new Set(htmlFiles.map(fileToUrl))].filter((r) => r !== '/404').sort();

// map every url path we might need -> whether a file exists in out/
function pageExists(urlPath) {
  let p = urlPath.split('#')[0].split('?')[0];
  try { p = decodeURIComponent(p); } catch { /* keep raw */ }
  if (p === '/' || p === '') return fs.existsSync(path.join(OUT, 'index.html'));
  const clean = p.replace(/^\//, '');
  if (fs.existsSync(path.join(OUT, clean))) return true; // file with ext (pdf/png/txt/svg)
  if (fs.existsSync(path.join(OUT, clean + '.html'))) return true;
  if (fs.existsSync(path.join(OUT, clean, 'index.html'))) return true;
  return false;
}

// ---------------------------------------------------------------------------
// broken-link scan (from exported HTML text — no browser needed)
// ---------------------------------------------------------------------------
const LINK_ATTR = /(?:href|src)\s*=\s*"([^"]+)"/gi;
const brokenLinks = [];
const linkStats = { total: 0, internal: 0, external: 0, asset: 0 };
for (const f of htmlFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const from = fileToUrl(f);
  const seen = new Set();
  let m;
  while ((m = LINK_ATTR.exec(src))) {
    const raw = m[1];
    if (seen.has(raw)) continue;
    seen.add(raw);
    if (/^(mailto:|tel:|data:|javascript:|#)/i.test(raw)) continue;
    if (/^https?:\/\//i.test(raw)) { linkStats.external++; continue; }
    linkStats.total++;
    const target = raw.split('#')[0].split('?')[0];
    if (!target) continue;
    if (!pageExists(target)) {
      // ignore Next.js hash-only or query-only leftovers
      brokenLinks.push({ from, href: raw });
    }
  }
}
// dedupe (same from+href)
const brokenLinksU = [];
const blSeen = new Set();
for (const b of brokenLinks) {
  const k = b.from + '|' + b.href;
  if (!blSeen.has(k)) { blSeen.add(k); brokenLinksU.push(b); }
}

// ---------------------------------------------------------------------------
// performance: local assets referenced from HTML that are > 2 MB
// ---------------------------------------------------------------------------
const BIG = 2 * 1024 * 1024;
const bigAssets = new Map(); // url -> { bytes, kind, froms:Set }
const ASSET_RE = /"(?:src|href)"\s*:\s*"([^"]+)"/gi; // not used; keep simple attr scan
for (const f of htmlFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const from = fileToUrl(f);
  const attrRe = /(?:src|href)\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = attrRe.exec(src))) {
    const raw = m[1];
    if (!raw.startsWith('/') || raw.startsWith('//')) continue;
    let clean = raw.split('#')[0].split('?')[0].replace(/^\//, '');
    try { clean = decodeURIComponent(clean); } catch { /* keep raw */ }
    if (!clean) continue;
    const file = path.join(OUT, clean);
    let st;
    try { st = fs.statSync(file); } catch { continue; }
    if (!st.isFile()) continue;
    const isImg = /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(clean);
    const isPdf = /\.pdf$/i.test(clean);
    // inline asset = <img src> or css/font; a plain <a href> to a pdf is a download
    const isInlineAnchor = new RegExp(`<a\\b[^>]*href="${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(src);
    if (st.size <= BIG) continue;
    if (isPdf && isInlineAnchor && !isImg) continue; // exempt download link
    const key = '/' + clean;
    if (!bigAssets.has(key)) bigAssets.set(key, { bytes: st.size, img: isImg, pdf: isPdf, anchor: isInlineAnchor, froms: new Set() });
    bigAssets.get(key).froms.add(from);
  }
}
const bigList = [...bigAssets.entries()].map(([url, v]) => ({ url, bytes: v.bytes, kind: v.img ? 'img' : v.pdf ? 'pdf' : 'other', anchor: v.anchor, pages: v.froms.size }));

// ---------------------------------------------------------------------------
// browser sweep
// ---------------------------------------------------------------------------
const VIEWPORTS = [
  { tag: '380', width: 380, height: 800, mobile: true },
  { tag: '1440', width: 1440, height: 900, mobile: false },
];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

async function sweepRoute(ctx, route, vp) {
  const page = await ctx.newPage();
  const consoleErrors = [], pageErrors = [], localFails = [], remoteFails = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 220)); });
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 220)));
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (u.startsWith('data:') || u.startsWith('blob:')) return;
    (u.includes(BASE) ? localFails : remoteFails).push(`${r.failure()?.errorText || 'failed'} ${u.slice(0, 120)}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes(BASE)) localFails.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`);
  });
  let status = 'ERR';
  let overflow = null;
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    status = resp ? resp.status() : 'NO-RESP';
    await page.waitForTimeout(220);
    const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })).catch(() => null);
    if (dims) overflow = dims.sw > dims.cw + 1 ? dims : null;
  } catch (e) {
    status = `NAV-ERR ${String(e).slice(0, 60)}`;
  }
  await page.close();
  return { route, vp: vp.tag, status, overflow, consoleErrors, pageErrors, localFails, remoteFails };
}

const routeResults = [];
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const task = queue.shift();
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile, hasTouch: vp.mobile,
        deviceScaleFactor: vp.mobile ? 2 : 1,
      });
      const r = await sweepRoute(ctx, task, vp);
      routeResults.push(r);
      await ctx.close();
    }
    done++;
    if (done % 50 === 0) process.stdout.write(`  swept ${done}/${ROUTES.length} routes\n`);
  }
}
const queue = [...ROUTES];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

// ---------------------------------------------------------------------------
// image audit on sampled pages
// ---------------------------------------------------------------------------
const IMG_PAGES = [
  '/', '/cards', '/artifacts', '/print', '/how-to-play', '/play', '/graph', '/stories', '/compare',
  '/culture/japanese', '/culture/greek', '/culture/norse', '/culture/egyptian', '/culture/slavic', '/culture/mesopotamian',
];
const imageAudit = [];
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const p of IMG_PAGES) {
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + p, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
      // Force every image eager + scroll through, then wait for completion so a
      // lazy-pending image is never misreported as broken. A broken image is one
      // that FINISHED loading (complete) with naturalWidth 0.
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
        const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
      }).catch(() => {});
      // poll until no image is pending (complete=false) — cap 8s
      await page.evaluate(() => new Promise((resolve) => {
        const t0 = Date.now();
        const tick = () => {
          const pending = [...document.images].some((i) => !i.complete);
          if (!pending || Date.now() - t0 > 8000) resolve();
          else setTimeout(tick, 150);
        };
        tick();
      })).catch(() => {});
      const imgs = await page.evaluate(() => [...document.images].map((im) => ({
        src: im.currentSrc || im.src,
        natural: im.naturalWidth,
        complete: im.complete,
        altAttr: im.hasAttribute('alt'),
        alt: (im.getAttribute('alt') || ''),
        loading: im.getAttribute('loading') || '',
        inViewportTop: im.getBoundingClientRect().top + window.scrollY,
      })));
      const isLocal = (i) => i.src.includes('localhost') || i.src.startsWith('/') || i.src.startsWith(BASE);
      const local = imgs.filter(isLocal);
      const remote = imgs.filter((i) => !isLocal(i));
      const isBroken = (i) => i.complete && i.natural === 0;
      const localBroken = local.filter(isBroken);
      const remoteBroken = remote.filter(isBroken);
      const localPending = local.filter((i) => !i.complete);
      const remotePending = remote.filter((i) => !i.complete);
      const noAlt = imgs.filter((i) => !i.altAttr);
      const lazy = imgs.filter((i) => i.loading === 'lazy');
      imageAudit.push({ page: p, total: imgs.length, local: local.length, remote: remote.length, localBroken, localPendingCount: localPending.length, remoteBroken: remoteBroken.slice(0, 10), remoteBrokenCount: remoteBroken.length, remotePendingCount: remotePending.length, noAlt, lazyCount: lazy.length });
    } catch (e) {
      imageAudit.push({ page: p, error: String(e).slice(0, 120) });
    }
    await page.close();
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// a11y + interaction pass at 380px
// ---------------------------------------------------------------------------
const a11y = {};
{
  // ---- keyboard nav: tab bar / More sheet / search ----
  const ctx = await browser.newContext({ viewport: { width: 380, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(400);
  const tabbar = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.tabbar .tab, .tabbar a, .tabbar button')];
    return { count: tabs.length, reachable: tabs.every((t) => t.tabIndex >= 0), labels: tabs.map((t) => (t.textContent || '').trim()).filter(Boolean) };
  });
  a11y.mobileTabBar = tabbar;
  // open More sheet via tab, check dialog + Escape
  let sheetOpen = false, sheetClosed = false, focusInSheet = false;
  const moreBtn = await page.$('.tabbar button:last-child');
  if (moreBtn) { await moreBtn.click(); await page.waitForTimeout(300); }
  sheetOpen = await page.evaluate(() => !!document.querySelector('.sheet[role="dialog"]'));
  focusInSheet = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('.sheet'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  sheetClosed = await page.evaluate(() => !document.querySelector('.sheet-root'));
  a11y.moreSheet = { sheetOpen, focusInSheet, sheetClosed };
  await ctx.close();

  // ---- card overlay focus trap + Escape (380px) ----
  const cctx = await browser.newContext({ viewport: { width: 380, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const cp = await cctx.newPage();
  await cp.goto(BASE + '/cards', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await cp.waitForTimeout(500);
  let overlayOpen = false, hasDialog = false, escapeCloses = false;
  const tile = await cp.$('.tc-open');
  if (tile) {
    await tile.click();
    await cp.waitForTimeout(500);
    hasDialog = await cp.evaluate(() => !!document.querySelector('[role="dialog"].cd-panel'));
    overlayOpen = hasDialog;
    // tab a bunch, ensure focus stays inside
    let stayedInside = true;
    for (let i = 0; i < 8; i++) {
      await cp.keyboard.press('Tab');
      const inside = await cp.evaluate(() => {
        const a = document.activeElement;
        const panel = document.querySelector('.cd-panel');
        return !panel || (a && panel.contains(a));
      });
      if (!inside) { stayedInside = false; break; }
    }
    await cp.keyboard.press('Escape');
    await cp.waitForTimeout(350);
    escapeCloses = await cp.evaluate(() => !document.querySelector('.cd-panel'));
    a11y.cardOverlay = { overlayOpen, hasDialog, tabTrapped: stayedInside, escapeCloses };
  } else {
    a11y.cardOverlay = { overlayOpen: false, error: 'no .tc-open tile found' };
  }
  await cctx.close();

  // ---- footer mailto focusable ----
  const fctx = await browser.newContext({ viewport: { width: 380, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const fp = await fctx.newPage();
  await fp.goto(BASE + '/about', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await fp.waitForTimeout(300);
  a11y.footerMail = await fp.evaluate(() => {
    const a = document.querySelector('.footer-mail');
    if (!a) return { present: false };
    const cs = getComputedStyle(a);
    return { present: true, href: a.getAttribute('href'), focusable: a.tabIndex >= 0, display: cs.display, visibility: cs.visibility };
  });
  await fctx.close();

  // ---- hero carousel keyboard (no reduced motion) ----
  const kctx = await browser.newContext({ viewport: { width: 380, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const kp = await kctx.newPage();
  await kp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await kp.waitForTimeout(400);
  const activeIdx = () => kp.evaluate(() => {
    const slides = [...document.querySelectorAll('.carousel-slide')];
    return slides.findIndex((s) => s.classList.contains('is-active'));
  });
  const before = await activeIdx();
  await kp.evaluate(() => document.querySelector('.home-carousel')?.focus());
  await kp.keyboard.press('ArrowRight');
  await kp.waitForTimeout(250);
  const after = await activeIdx();
  a11y.carouselKeyboard = { before, after, advanced: after !== before };
  await kctx.close();

  // ---- reduced-motion carousel: must not auto-advance ----
  const rctx = await browser.newContext({ viewport: { width: 380, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  await rp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await rp.waitForTimeout(400);
  const r0 = await rp.evaluate(() => [...document.querySelectorAll('.carousel-slide')].findIndex((s) => s.classList.contains('is-active')));
  await rp.waitForTimeout(7000); // > AUTOPLAY_MS (6s)
  const r1 = await rp.evaluate(() => [...document.querySelectorAll('.carousel-slide')].findIndex((s) => s.classList.contains('is-active')));
  a11y.carouselReducedMotion = { at0: r0, after7s: r1, autoAdvanced: r0 !== r1 };
  await rctx.close();
}

// ---------------------------------------------------------------------------
// WCAG contrast probe (reuse of the Phase-7/Gate-7 algorithm)
// ---------------------------------------------------------------------------
const CONTRAST_PAGES = ['/', '/cards', '/artifacts', '/print', '/how-to-play', '/play', '/graph', '/stories', '/compare', '/culture/greek', '/deity/gre-zeus'];
const contrastFails = [];
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  for (const p of CONTRAST_PAGES) {
    const page = await ctx.newPage();
    const r = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
    if (!r || !r.ok()) { await page.close(); continue; }
    await page.waitForTimeout(700);
    const res = await page.evaluate(() => {
      const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const contrast = (f, b) => { const L1 = lum(...f), L2 = lum(...b); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
      // parse rgb()/rgba() and color(srgb …) (with optional / alpha) → {rgb:[0..255], a}
      const parseColor = (s) => {
        if (!s) return null;
        const srgb = s.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/i);
        if (srgb) return { rgb: [Math.round(+srgb[1] * 255), Math.round(+srgb[2] * 255), Math.round(+srgb[3] * 255)], a: srgb[4] !== undefined ? +srgb[4] : 1 };
        if (/^transparent$/i.test(s)) return { rgb: [0, 0, 0], a: 0 };
        const n = s.match(/\d*\.?\d+/g);
        if (!n || n.length < 3) return null;
        // rgba alpha is the 4th number only when the string actually has 4+ numbers AND an alpha slot
        const hasAlpha = /^rgba?\(/i.test(s) && n.length >= 4;
        return { rgb: n.slice(0, 3).map(Number), a: hasAlpha ? +n[3] : 1 };
      };
      const composite = (fg, bg) => fg.rgb.map((c, i) => Math.round(c * fg.a + bg[i] * (1 - fg.a)));
      // Effective background: composite every semi-transparent layer up the tree
      // down to (and including) the first fully opaque ancestor.
      const bgOf = (el) => {
        const stack = [];
        let base = null;
        let n = el;
        while (n) {
          const p = parseColor(getComputedStyle(n).backgroundColor);
          if (p && p.a > 0) {
            if (p.a >= 0.999) { base = p.rgb; break; }
            stack.push(p);
          }
          n = n.parentElement;
        }
        if (!base) base = [11, 11, 14];
        for (let i = stack.length - 1; i >= 0; i--) base = composite(stack[i], base);
        return base;
      };
      const out = [];
      const seen = new Set();
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length > 3) continue;
        const txt = (el.textContent || '').trim();
        if (!txt || txt.length > 80) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) continue;
        // skip elements sitting on a background image / gradient (probe can't resolve)
        let hasBgImg = false, n = el;
        while (n && n !== document.body) { const b = getComputedStyle(n).backgroundImage; if (b && b !== 'none') { hasBgImg = true; break; } n = n.parentElement; }
        if (hasBgImg) continue;
        const key = el.tagName + '|' + txt.slice(0, 30);
        if (seen.has(key)) continue; seen.add(key);
        const fg = parseColor(cs.color);
        if (!fg || fg.a < 0.5) continue;
        const [r, g, b] = fg.rgb;
        const bg = bgOf(el);
        const ratio = contrast([r, g, b], bg);
        const fs = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight) >= 700;
        const large = fs >= 24 || (fs >= 18.66 && bold);
        const need = large ? 3.0 : 4.5;
        if (ratio < need - 0.01) out.push({ text: txt.slice(0, 45), ratio: +ratio.toFixed(2), need, fs });
      }
      return out;
    });
    for (const f of res) contrastFails.push({ page: p, ...f });
    await page.close();
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// print CSS check
// ---------------------------------------------------------------------------
let printCheck = {};
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/culture/greek', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  printCheck = await page.evaluate(() => {
    const body = document.body;
    const footer = document.querySelector('.site-footer');
    const tabbar = document.querySelector('.tabbar');
    return {
      bodyVisible: body.getBoundingClientRect().height > 0,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      footerHiddenInPrint: footer ? getComputedStyle(footer).display === 'none' || getComputedStyle(footer).visibility === 'hidden' : null,
      tabbarHiddenInPrint: tabbar ? getComputedStyle(tabbar).display === 'none' : null,
    };
  });
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------------------
// aggregate
// ---------------------------------------------------------------------------
const hardFailRoutes = routeResults.filter((r) => !String(r.status).startsWith('200') || r.consoleErrors.length || r.pageErrors.length || r.localFails.length || r.overflow);
const overflowRoutes = routeResults.filter((r) => r.overflow);
const consoleRoutes = routeResults.filter((r) => r.consoleErrors.length || r.pageErrors.length);
const localFailRoutes = routeResults.filter((r) => r.localFails.length);
const remoteFailRoutes = routeResults.filter((r) => r.remoteFails.length);

const summary = {
  ts: TS,
  base: BASE,
  routes: ROUTES.length,
  viewports: VIEWPORTS.map((v) => v.tag),
  pageLoads: routeResults.length,
  http200: routeResults.filter((r) => String(r.status).startsWith('200')).length,
  hardFailRoutes: hardFailRoutes.length,
  consoleErrorRoutes: consoleRoutes.length,
  localFailedReqRoutes: localFailRoutes.length,
  overflowRoutes: overflowRoutes.length,
  brokenLinks: brokenLinksU.length,
  bigAssets: bigList.length,
  imagePages: imageAudit.length,
  imageLocalBroken: imageAudit.reduce((n, a) => n + (a.localBroken ? a.localBroken.length : 0), 0),
  imageRemoteBroken: imageAudit.reduce((n, a) => n + (a.remoteBrokenCount || 0), 0),
  imagesNoAlt: imageAudit.reduce((n, a) => n + (a.noAlt ? a.noAlt.length : 0), 0),
  contrastFails: contrastFails.length,
};
const verdict = (hardFailRoutes.length === 0 && brokenLinksU.length === 0 && overflowRoutes.length === 0) ? 'PASS' : 'FAIL';

// ---- write json ----
const json = {
  summary, verdict,
  routesChecked: ROUTES,
  routeFailures: hardFailRoutes,
  overflowRoutes,
  consoleErrorRoutes: consoleRoutes,
  localFailedReqRoutes: localFailRoutes,
  remoteFailedReqRoutes: remoteFailRoutes.map((r) => ({ route: r.route, vp: r.vp, fails: r.remoteFails.slice(0, 3), count: r.remoteFails.length })),
  brokenLinks: brokenLinksU,
  bigAssets: bigList,
  imageAudit,
  a11y,
  contrastFails,
  printCheck,
};
fs.writeFileSync(path.join(EVID, `PHASE9-sweep-${TS}.json`), JSON.stringify(json, null, 1));

// ---- write markdown ----
const L = [];
L.push(`# Phase 9 (v2) — static QA sweep`);
L.push(`Date: ${new Date().toISOString()} · server ${BASE} · out/ static export`);
L.push('');
L.push(`- Routes checked: **${ROUTES.length}** × viewports ${VIEWPORTS.map((v) => v.tag + 'px').join(' / ')} = **${routeResults.length}** page loads`);
L.push(`- HTTP 200: **${summary.http200}/${routeResults.length}**`);
L.push(`- Console/page-error routes: **${consoleRoutes.length}**`);
L.push(`- Local failed-request routes: **${localFailRoutes.length}**`);
L.push(`- Horizontal-overflow routes: **${overflowRoutes.length}**`);
L.push(`- Broken internal links: **${brokenLinksU.length}**`);
L.push(`- Inline assets > 2 MB: **${bigList.length}**`);
L.push(`- Image audit: ${summary.imageLocalBroken} local broken / ${summary.imageRemoteBroken} remote broken / ${summary.imagesNoAlt} missing-alt across ${imageAudit.length} sampled pages`);
L.push(`- Contrast failures: **${contrastFails.length}** across ${CONTRAST_PAGES.length} pages`);
L.push('');
L.push(`## Verdict: **${verdict}**`);
L.push('');
if (hardFailRoutes.length) {
  L.push('## Failing routes');
  for (const r of hardFailRoutes.slice(0, 60)) {
    L.push(`- \`${r.route}\` @${r.vp} → ${r.status}` + (r.overflow ? ` overflow ${r.overflow.sw}>${r.overflow.cw}` : ''));
    for (const e of r.consoleErrors.slice(0, 2)) L.push(`    - console: ${e}`);
    for (const e of r.pageErrors.slice(0, 2)) L.push(`    - pageerror: ${e}`);
    for (const e of r.localFails.slice(0, 2)) L.push(`    - req: ${e}`);
  }
}
if (bigList.length) {
  L.push('## Inline assets > 2 MB');
  for (const a of bigList.slice(0, 20)) L.push(`- ${a.url} — ${(a.bytes / 1048576).toFixed(2)} MB (${a.kind}, ${a.pages} page(s))`);
}
if (brokenLinksU.length) {
  L.push('## Broken links');
  for (const b of brokenLinksU.slice(0, 60)) L.push(`- \`${b.href}\` on ${b.from}`);
}
if (contrastFails.length) {
  L.push('## Contrast failures (first 25)');
  for (const c of contrastFails.slice(0, 25)) L.push(`- ${c.page}: "${c.text}" ratio ${c.ratio} need ${c.need} (${c.fs}px)`);
}
L.push('');
L.push('## A11y surface checks (380px)');
L.push('```json');
L.push(JSON.stringify(a11y, null, 1));
L.push('```');
L.push('');
L.push('## Print CSS check');
L.push('```json');
L.push(JSON.stringify(printCheck, null, 1));
L.push('```');
fs.writeFileSync(path.join(EVID, `PHASE9-sweep-${TS}.md`), L.join('\n'));

// ---- console summary ----
console.log('\n================ PHASE 9 SWEEP ================');
console.log(JSON.stringify(summary, null, 1));
console.log('verdict:', verdict);
console.log('report:', path.relative(ROOT, path.join(EVID, `PHASE9-sweep-${TS}.md`)));
process.exit(verdict === 'PASS' ? 0 : 1);
