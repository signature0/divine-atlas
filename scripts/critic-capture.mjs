// TASK-011: design-critic evidence capture against prod :3002
// Screenshots (1440 + 390, with full-page scrolls), computed-style audits,
// contrast pairs, a11y tree checks. Output: qa/evidence/TASK-011-*.{png,json}
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const PROJ = '/AI/agents/workspaces/divine-atlas';
const OUT = path.join(PROJ, 'qa/evidence');
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['home', '/'],
  ['culture-japanese', '/culture/japanese'],
  ['culture-norse', '/culture/norse'],
  ['culture-egyptian', '/culture/egyptian'],
  ['zeus', '/deity/gre-zeus'],
  ['myth-creation', '/myths/gre-creation'],
  ['graph', '/graph'],
  ['vault', '/artifacts'],
  ['compare', '/compare'],
  ['domain-war', '/domain/war'],
  ['notfound', '/deity/nope-123'],
];

// styles to sample per page (selector, label)
const SAMPLES = [
  [".topnav", 'topnav'],
  [".topnav .brand", 'brand'],
  [".topnav .links", 'navlinks'],
  [".culture-card", 'culturecard'],
  [".entity-card", 'entitycard'],
  [".card", 'card'],
  [".btn", 'btn'],
  [".chip", 'chip'],
  [".eyebrow", 'eyebrow'],
  [".display-xl", 'display-xl'],
  ["h1", 'h1'],
  ["h2", 'h2'],
  [".hero-art", 'heroart'],
  [".framing", 'framing'],
  [".attribute-rail", 'attrail'],
  [".src", 'sourcefootnote'],
  [".mat-band", 'matband'],
  [".search-overlay", 'searchoverlay'],
  ["footer.site-footer", 'footer'],
  ["a", 'first-link'],
];

function parseColor(s) {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const [r, g, b] = [+m[1], +m[2], +m[3]];
  const a = m[4] !== undefined ? +m[4] : 1;
  return { r, g, b, a };
}
function lum({ r, g, b, a = 1 }) {
  // composite over page bg (#0b0b0e) if semi-transparent
  const bg = { r: 0x0b, g: 0x0b, b: 0x0e };
  const comp = (c, bc) => Math.round(a * c + (1 - a) * bc);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(comp(r, bg.r)) + 0.7152 * f(comp(g, bg.g)) + 0.0722 * f(comp(b, bg.b));
}
function contrast(c1, c2) {
  const l1 = lum(c1), l2 = lum(c2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const all = {};

for (const [name, route] of ROUTES) {
  // ---------- desktop 1440 ----------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1800);

  await page.screenshot({ path: path.join(OUT, `TASK-011-${name}_1440.png`) });
  // scrolled shots for long pages
  if (['zeus', 'myth-creation', 'culture-japanese', 'home', 'domain-war'].includes(name)) {
    for (let s = 1; s <= 2; s++) {
      await page.evaluate((y) => window.scrollTo(0, y), s * 900);
      await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(OUT, `TASK-011-${name}_1440_s${s}.png`) });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  const styleAudit = await page.evaluate((SAMPLES) => {
    const out = {};
    for (const [sel, label] of SAMPLES) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      out[label] = {
        sel,
        color: cs.color,
        bg: cs.backgroundColor,
        font: cs.fontFamily.split(',')[0].replace(/['"]/g, ''),
        size: cs.fontSize,
        weight: cs.fontWeight,
        radius: cs.borderRadius,
        border: cs.borderTopWidth + ' ' + cs.borderTopColor,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
      };
    }
    return out;
  }, SAMPLES);

  const a11y = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const noAlt = imgs.filter(i => !i.getAttribute('alt')).length;
    const emptyAlt = imgs.filter(i => i.getAttribute('alt') === '').length;
    const headings = [...document.querySelectorAll('h1,h2,h3')].map(h => ({ t: h.tagName, txt: (h.textContent || '').trim().slice(0, 60) }));
    const h1s = [...document.querySelectorAll('h1')];
    const btnsNoName = [...document.querySelectorAll('button, a')].filter(el => {
      const txt = (el.textContent || '').trim();
      const aria = el.getAttribute('aria-label') || '';
      return !txt && !aria;
    }).length;
    const landmarks = ['header', 'nav', 'main', 'footer', 'aside'].map(t => document.querySelectorAll(t).length);
    const skip = !!document.querySelector('.skip-link, a[role="link"].skip-link, a[href="#main"]');
    const links = [...document.querySelectorAll('a')].length;
    const btns = [...document.querySelectorAll('button')].length;
    // decorative images should have empty alt, not missing
    return { imgCount: imgs.length, noAlt, emptyAlt, headings: headings.slice(0, 25), h1Count: h1s.length, h1texts: h1s.map(h => (h.textContent || '').trim().slice(0, 50)), btnsNoName, landmarks, skip, links, btns };
  });

  // contrast pairs actually used on this page
  const contrasts = await page.evaluate(() => {
    const pairs = [];
    const seen = new Set();
    const bgOf = (el) => {
      let e = el;
      while (e && e !== document.documentElement) {
        const bg = getComputedStyle(e).backgroundColor;
        if (bg && !bg.includes('0, 0, 0, 0') && bg !== 'transparent') return bg;
        e = e.parentElement;
      }
      return 'rgb(11, 11, 14)';
    };
    const parse = (s) => { const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/); return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 } : null; };
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (c) => 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    const samples = [...document.querySelectorAll('p, span, div, h1, h2, h3, a, button, li, summary, td, th, small, strong')];
    for (const el of samples) {
      const txt = (el.childNodes.length && el.childNodes[0].nodeType === 3) ? el.childNodes[0].textContent.trim() : '';
      if (txt.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const fg = parse(cs.color); const bg = parse(bgOf(el));
      if (!fg || !bg) continue;
      const key = fg.r + ',' + fg.g + ',' + fg.b + ' | ' + bg.r + ',' + bg.g + ',' + bg.b;
      if (seen.has(key)) continue;
      seen.add(key);
      const l1 = lum(fg), l2 = lum(bg);
      const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
      const ratio = (hi + 0.05) / (lo + 0.05);
      const fs = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 600;
      const large = fs >= 18.66 || (fs >= 14 && bold);
      pairs.push({ fg: cs.color, bg: bgOf(el), ratio: +ratio.toFixed(2), fontSize: fs, bold, large, sample: txt.slice(0, 40) });
      if (pairs.length > 40) break;
    }
    return pairs;
  });

  const meta = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content || null,
    og: document.querySelector('meta[property="og:image"]')?.content || null,
    dataCulture: document.documentElement.getAttribute('data-culture') || document.body.getAttribute('data-culture') || null,
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  await ctx.close();

  // ---------- mobile 390 ----------
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mpage = await mctx.newPage();
  await mpage.goto(BASE + route, { waitUntil: 'load', timeout: 45000 }).catch(() => {});
  await mpage.waitForTimeout(1500);
  await mpage.screenshot({ path: path.join(OUT, `TASK-011-${name}_390.png`) });
  const mdims = await mpage.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, navH: document.querySelector('.topnav')?.getBoundingClientRect().height }));
  await mctx.close();

  all[name] = { route, styleAudit, a11y, contrasts: contrasts.slice(0, 40), meta, mobile: mdims };
  process.stdout.write(`captured ${name}\n`);
}
await browser.close();

fs.writeFileSync(path.join(OUT, 'TASK-011-audit.json'), JSON.stringify(all, null, 2));
// summary of failed contrast pairs
const fails = [];
for (const [name, d] of Object.entries(all)) {
  for (const c of d.contrasts) {
    if (!c.large && c.ratio < 4.5) fails.push({ name, ...c });
    if (c.large && c.ratio < 3) fails.push({ name, ...c });
  }
}
fs.writeFileSync(path.join(OUT, 'TASK-011-contrast-fails.json'), JSON.stringify(fails, null, 2));
console.log('DONE. contrast failures:', fails.length);
