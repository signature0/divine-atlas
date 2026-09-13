#!/usr/bin/env node
// Post-fix verification for BUG-001 + BUG-002 (runs against prod :3002)
// Checks: (a) every /domain/* route in the prerender manifest -> 200
//          (b) homepage domain links -> 200
//          (c) 390px mobile: layout viewport not inflated (innerWidth ~390)
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

const BASE = 'http://localhost:3002';
const PROJ = '/AI/agents/workspaces/divine-atlas';

function get(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(0));
    req.setTimeout(15000, () => { req.destroy(); resolve(0); });
  });
}

// (a) all /domain routes from manifest (post-rebuild: slugified)
const m = JSON.parse(fs.readFileSync(path.join(PROJ, '.next/prerender-manifest.json'), 'utf8'));
const domainRoutes = Object.keys(m.routes || {}).filter((r) => r.startsWith('/domain/'));
console.log(`domain routes in build: ${domainRoutes.length}`);
let ok = 0, bad = [];
for (const r of domainRoutes) {
  const code = await get(BASE + r);
  if (code === 200) ok++; else bad.push([r, code]);
}
console.log(`domain(manifest) 200: ${ok}/${domainRoutes.length}`);
if (bad.length) console.log('BAD manifest samples:', bad.slice(0, 10));

// (a2) ANY /domain link emitted anywhere on key pages must also be 200
//      (catches href/manifest mismatch, e.g. homepage still emitting %20 links)
const probePages = ['/', '/culture/greek', '/deity/gre-zeus'];
const emitted = new Set();
for (const p of probePages) {
  const html = await new Promise((res) => http.get(BASE + p, (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(d)); }).on('error',()=>res('')));
  for (const x of html.matchAll(/href="(\/domain\/[^"]*)"/g)) emitted.add(x[1]);
}
console.log(`\ndistinct /domain/ hrefs emitted on key pages: ${emitted.size}`);
let emOk = 0, emBad = [];
for (const l of emitted) {
  const code = await get(BASE + l);
  if (code === 200) emOk++; else emBad.push([l, code]);
}
console.log(`emitted domain links 200: ${emOk}/${emitted.size}`);
if (emBad.length) console.log('BAD emitted samples:', emBad.slice(0, 10));

// (b) homepage domain links (subset of emitted, kept for the report)
const home = await new Promise((res) => http.get(BASE + '/', (r) => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(d)); }).on('error',()=>res('')));
const homeDomLinks = [...new Set(home.matchAll(/href="(\/domain\/[^"]*)"/g).map(x => x[1]))];
console.log(`\nhomepage domain links: ${homeDomLinks.length}`);
let homeOk = 0;
for (const l of homeDomLinks) {
  const code = await get(BASE + l);
  if (code === 200) homeOk++; else console.log('  BAD:', l, code);
}
console.log(`homepage domain links 200: ${homeOk}/${homeDomLinks.length}`);

// (c) mobile viewport check
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2500);
const vw = await page.evaluate(() => window.innerWidth);
const docW = await page.evaluate(() => document.documentElement.scrollWidth);
console.log(`\nmobile 390px: innerWidth=${vw} docScrollWidth=${docW} -> ${vw <= 400 ? 'PASS (no inflation)' : 'FAIL (viewport inflated to ' + vw + ')'}`);
await browser.close();

const verdict = (ok === domainRoutes.length && emOk === emitted.size && homeOk === homeDomLinks.length && vw <= 400) ? 'PASS' : 'FAIL';
console.log(`\nBUG-001/002 re-verification verdict: ${verdict}`);
