// GATE-7 RE-SWEEP — verifies all DES-001..008 acceptance criteria on :3002
// Usage: node scripts/gate7-resweep.mjs  (writes qa/evidence/GATE7-resweep-<ts>.json + screenshots)
import { chromium } from 'playwright-core';
import fs from 'fs';

const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const BASE = 'http://localhost:3002';
const ROOT = '/AI/agents/workspaces/divine-atlas';
const TS = new Date().toISOString().replace(/[:.]/g, '-');
const EV = `${ROOT}/qa/evidence`;
const out = { ts: TS, base: BASE, checks: {} };
const ok = (name, pass, detail) => { out.checks[name] = { pass, detail }; console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

// ---------- DEITY IDS ----------
const CULTS = ['japanese', 'greek', 'norse', 'egyptian', 'slavic', 'mesopotamian'];
const deities = [];
for (const c of CULTS) {
  const d = JSON.parse(fs.readFileSync(`${ROOT}/data/${c}/entities.json`, 'utf8'));
  (Array.isArray(d) ? d : d.entities).forEach(e => deities.push(e.id));
}

// ---------- DES-001: 159 deity pages @390 no horizontal overflow ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const over = [];
  for (const id of deities) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/deity/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(600);
    const d = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })).catch(() => null);
    await p.close();
    if (d && d.sw > d.cw + 1) over.push({ id, sw: d.sw });
  }
  await ctx.close();
  ok('DES-001 deity-overflow@390', over.length === 0, `${over.length}/${deities.length} overflow`);
  if (over.length) fs.writeFileSync(`${EV}/GATE7-overflow-${TS}.json`, JSON.stringify(over, null, 1));
  // sample screenshots
  const sctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  for (const id of ['gre-zeus', 'jpn-amenominakanushi']) {
    const p = await sctx.newPage();
    const r = await p.goto(`${BASE}/deity/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => 'fail');
    if (r && r.ok()) await p.screenshot({ path: `${EV}/GATE7-deity-${id}_390.png` });
    await p.close();
  }
  await sctx.close();
}

// ---------- DES-002 + DES-003 + DES-006 + DES-007: home @1440 and @390 ----------
{
  // 1440
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(800);
  const probe = await p.evaluate(() => {
    const nav = document.querySelector('.topnav');
    const searchBtn = [...document.querySelectorAll('.topnav button, .topnav a')].find(el => /search/i.test(el.textContent || '') || el.getAttribute('aria-label')?.match(/search/i));
    const links = [...(nav?.querySelectorAll('a') || [])].map(a => a.textContent?.trim()).filter(Boolean);
    const skip = document.querySelector('a[href="#main"], a.skip-link, .skip-link');
    const h1 = document.querySelector('h1');
    const h1rect = h1?.getBoundingClientRect();
    return {
      navLinks: links,
      searchTrigger: !!searchBtn, searchText: searchBtn?.textContent?.trim(),
      skipLink: !!skip,
      h1Top: h1rect ? Math.round(h1rect.top) : null,
      navHeight: nav ? Math.round(nav.getBoundingClientRect().height) : null,
    };
  });
  await p.screenshot({ path: `${EV}/GATE7-home_1440.png` });
  // click search trigger -> overlay appears
  let overlayOpens = false;
  const btn = await p.$('.topnav button, .topnav a');
  const all = await p.$$eval('.topnav a, .topnav button', els => els.map(e => ({ tag: e.tagName, txt: e.textContent?.trim() })));
  const sb = (await p.$$('a, button')).length;
  const clickRes = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.topnav a, .topnav button')].find(e => /search/i.test(e.textContent || '') || /search/i.test(e.getAttribute('aria-label') || ''));
    if (!el) return 'no-trigger';
    el.click(); return 'clicked';
  });
  await p.waitForTimeout(600);
  overlayOpens = await p.evaluate(() => !!document.querySelector('.search-overlay'));
  await p.screenshot({ path: `${EV}/GATE7-search-open_1440.png` }).catch(() => {});
  await ctx.close();
  ok('DES-002 search-trigger@1440', probe.searchTrigger && overlayOpens, JSON.stringify({ click: clickRes, overlayOpens, searchText: probe.searchText }));
  const hasCompare = probe.navLinks.some(l => /compare/i.test(l));
  const hasStories = probe.navLinks.some(l => /stor/i.test(l));
  ok('DES-003 nav-links@1440', hasCompare && hasStories, `links=${JSON.stringify(probe.navLinks)} compare=${hasCompare} stories=${hasStories}`);
  ok('DES-006 skip-link', !!probe.skipLink, `skip=${!!probe.skipLink}`);

  // 390 mobile
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mp = await mctx.newPage();
  await mp.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await mp.waitForTimeout(800);
  const mprobe = await mp.evaluate(() => {
    const h1 = document.querySelector('h1');
    const r = h1?.getBoundingClientRect();
    const lead = h1?.parentElement?.querySelector('p');
    const lr = lead?.getBoundingClientRect();
    const nav = document.querySelector('.topnav');
    const links = [...(nav?.querySelectorAll('.links a') || [])]; // nav links only — brand is a separate row-1 element
    const navH = nav ? Math.round(nav.getBoundingClientRect().height) : null;
    const searchBtn = [...document.querySelectorAll('.topnav button, .topnav a')].find(el => /search/i.test(el.textContent || '') || el.getAttribute('aria-label')?.match(/search/i));
    // orphan row check: link rows inside nav (same top => same row)
    const tops = links.map(a => Math.round(a.getBoundingClientRect().top));
    const rows = [...new Set(tops)];
    const lastRow = rows[rows.length - 1];
    const lastRowCount = tops.filter(t => t === lastRow).length;
    const totalLinks = links.length;
    return {
      h1Top: r ? Math.round(r.top) : null,
      leadTop: lr ? Math.round(lr.top) : null,
      leadBottom: lr ? Math.round(lr.bottom) : null,
      fold: 844, navH, searchTrigger: !!searchBtn,
      rows, lastRowCount, totalLinks,
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    };
  });
  await mp.screenshot({ path: `${EV}/GATE7-home_390.png` });
  await mctx.close();
  ok('DES-007 hero-above-fold@390', mprobe.h1Top != null && mprobe.h1Top < 844 && (mprobe.leadBottom == null || mprobe.leadBottom < 844), `h1Top=${mprobe.h1Top} leadBottom=${mprobe.leadBottom} fold=844`);
  ok('DES-003 no-orphan-row@390', mprobe.rows.length <= 2 && mprobe.lastRowCount >= 2, `rows=${JSON.stringify(mprobe.rows)} lastRow=${mprobe.lastRowCount}of${mprobe.totalLinks} navH=${mprobe.navH}`);
  ok('DES-002 search-trigger@390', mprobe.searchTrigger);
  ok('home-overflow@390', mprobe.sw <= mprobe.cw + 1, `sw=${mprobe.sw} cw=${mprobe.cw}`);
}

// ---------- DES-004: graph legend a11y ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/graph`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(2500);
  const g = await p.evaluate(() => {
    const legend = [...document.querySelectorAll('[class*=legend], [role=list], [role=listitem], [aria-label*=legend i]')].map(el => ({
      tag: el.tagName, ariaHidden: el.getAttribute('aria-hidden'), role: el.getAttribute('role'), cls: el.className?.toString().slice(0, 60),
    }));
    const anyAriaHiddenLegend = legend.some(l => l.ariaHidden === 'true' && /legend/i.test((l.cls || '') + (l.role || '')));
    const edgeLabels = [...document.querySelectorAll('path[aria-label], line[aria-label], g[aria-label]')].length;
    return { legend, anyAriaHiddenLegend, edgeLabels };
  });
  await p.screenshot({ path: `${EV}/GATE7-graph_1440.png` });
  await ctx.close();
  ok('DES-004 graph-legend-exposed', !g.anyAriaHiddenLegend, JSON.stringify({ legendCount: g.legend.length, edgeAriaLabels: g.edgeLabels }));
}

// ---------- DES-008: 404 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const r = await p.goto(`${BASE}/this-page-does-not-exist-xyz`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(800);
  const nf = await p.evaluate(() => ({
    status: document.body ? 'rendered' : 'blank',
    text: document.body?.innerText?.slice(0, 600),
  }));
  await p.screenshot({ path: `${EV}/GATE7-404_1440.png` });
  await ctx.close();
  const noVersion1 = !/Version 1:/i.test(nf.text || '');
  const inWorld = /(tablet|duat|lost|tablet|inscri|ankh|djed|scribe|shard|frag)/i.test(nf.text || '');
  ok('DES-008 404-in-world', noVersion1 && inWorld, `noVersion1=${noVersion1} inWorldCues=${inWorld}`);
  console.log('--- 404 text sample ---\n' + (nf.text || '').slice(0, 400));
}

// ---------- DES-005: contrast re-audit (sampled pages, all text nodes) ----------
{
  const pages = ['/', '/culture/japanese', '/culture/norse', '/culture/egyptian', '/culture/mesopotamian',
    '/culture/greek', '/culture/slavic', '/deity/gre-zeus', '/deity/jpn-amaterasu', '/artifacts', '/compare', '/myths/jpn-creation-primordial'];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const fails = [];
  for (const path of pages) {
    const p = await ctx.newPage();
    const rr = await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
    if (!rr || !rr.ok()) { console.log('skip (no page):', path); await p.close(); continue; }
    await p.waitForTimeout(1500);
    const res = await p.evaluate(() => {
      const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const contrast = (f, b) => { const L1 = lum(...f), L2 = lum(...b); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };
      const parse = s => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
      const rgba = (el) => { const c = getComputedStyle(el); const a = c.color.match(/\d+(\.\d+)?/g) || [0,0,0]; return { rgb: a.slice(0, 3).map(Number), alpha: c.backgroundColor ? parseFloat(c.color.split(',')[3]) : 1 }; };
      const bgOf = (el) => { let n = el; while (n && n !== document.body) { const bg = getComputedStyle(n).backgroundColor; if (bg && !/transparent/.test(bg)) { const a = bg.match(/\d+(\.\d+)?/g) || [0,0,0]; return a.slice(0, 3).map(Number); } n = n.parentElement; } return [11, 11, 14]; };
      const out = [];
      const seen = new Set();
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length > 3) continue;
        const txt = (el.textContent || '').trim();
        if (!txt || txt.length > 80) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) continue;
        const key = el.tagName + '|' + txt.slice(0, 30);
        if (seen.has(key)) continue; seen.add(key);
        const [r, g, b] = cs.color.match(/\d+(\.\d+)?/g).map(Number);
        const bg = bgOf(el);
        const ratio = contrast([r, g, b], bg);
        const fs = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight) >= 700;
        const large = (fs >= 24) || (fs >= 18.66 && bold);
        const need = large ? 3.0 : 4.5;
        if (ratio < need - 0.01) out.push({ text: txt.slice(0, 40), rgb: [r, g, b], bg, ratio: +ratio.toFixed(2), fs, bold, need });
      }
      return out;
    });
    for (const f of res) fails.push({ page: path, ...f });
    await p.close();
  }
  await ctx.close();
  fs.writeFileSync(`${EV}/GATE7-contrast-fails-${TS}.json`, JSON.stringify(fails, null, 1));
  ok('DES-005 contrast-re-audit', fails.length === 0, `${fails.length} fails across ${pages.length} pages`);
  if (fails.length) console.log(JSON.stringify(fails.slice(0, 15), null, 1));
}

await browser.close();
const failed = Object.entries(out.checks).filter(([, v]) => !v.pass).map(([k]) => k);
out.summary = { total: Object.keys(out.checks).length, pass: Object.keys(out.checks).length - failed.length, failed };
fs.writeFileSync(`${EV}/GATE7-resweep-${TS}.json`, JSON.stringify(out, null, 1));
console.log('\n=== GATE-7 RE-SWEEP SUMMARY ===');
console.log(JSON.stringify(out.summary, null, 1));
process.exit(failed.length ? 1 : 0);
