// Gate 7 MAJOR batch verification — DES-006 / DES-007 / DES-008.
// Run against a LIVE server (dev on :3003 during engineering; prod :3002 after rebuild).
// Usage: node scripts/verify-gate7-majors.mjs <des006|des007|des008> [BASE=http://localhost:3003]
// Writes screenshots to qa/evidence/DES-00x-*.png; exits non-zero on any FAIL.
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const [,, mode, BASE = 'http://localhost:3003'] = process.argv;
const EXE = '/home/mazen/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const EV = path.resolve('qa/evidence');
fs.mkdirSync(EV, { recursive: true });

let failures = 0;
const ok = (name, pass, detail) => {
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

if (mode === 'des006') {
  // DES-006: skip link present, hidden until focus, jumps to #main, focus-visible outline.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(800);

  const before = await p.evaluate(() => {
    const a = document.querySelector('a.skip-link[href="#main"]');
    const r = a?.getBoundingClientRect();
    return { exists: !!a, offscreen: r ? r.left < 0 : false, mainHasTabindex: document.querySelector('main#main')?.tabIndex === -1 };
  });
  ok('skip-link-present', before.exists, 'a.skip-link[href="#main"]');
  ok('skip-link-hidden-until-focus', before.offscreen, 'offscreen at rest (left<0)');

  await p.keyboard.press('Tab');
  const afterTab = await p.evaluate(() => {
    const a = document.activeElement;
    const r = a?.getBoundingClientRect();
    const cs = a ? getComputedStyle(a) : null;
    return {
      isSkip: !!a?.classList.contains('skip-link'),
      visible: r ? r.left >= 0 && r.top >= 0 && r.width > 0 && r.height > 0 : false,
      inViewport: r ? r.bottom <= 844 && r.right <= 390 : false,
      outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` : null,
      text: a?.textContent?.trim(),
    };
  });
  ok('skip-link-first-tab-stop', afterTab.isSkip && afterTab.visible, `active=${afterTab.isSkip} text="${afterTab.text}"`);
  ok('skip-link-focus-visible-outline', afterTab.outline && !/none/.test(afterTab.outline), `outline=${afterTab.outline}`);
  await p.screenshot({ path: `${EV}/DES-006-skiplink-focused_390.png` });

  // activate -> focus lands on main#main
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  const jumped = await p.evaluate(() => {
    const m = document.activeElement;
    return { id: m?.id, tag: m?.tagName, top: Math.round(m?.getBoundingClientRect().top ?? -99) };
  });
  ok('skip-link-jumps-to-main', jumped.id === 'main', `focus on <${jumped.tag}#${jumped.id}>`);

  // verify focus-visible outline on a nav link: fresh tab sequence (tab #1 = skip link, #2 = brand)
  const pn = await ctx.newPage();
  await pn.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await pn.waitForTimeout(400);
  await pn.keyboard.press('Tab');
  await pn.keyboard.press('Tab');
  const navFocus = await pn.evaluate(() => {
    const a = document.activeElement;
    const cs = getComputedStyle(a);
    return { inNav: !!a?.closest('nav.topnav'), outline: `${cs.outlineStyle} ${cs.outlineWidth}` };
  });
  ok('nav-focus-visible-outline', navFocus.inNav && !/none/.test(navFocus.outline), JSON.stringify(navFocus));

  // also confirm on a content page (skip link is in the root layout)
  const p2 = await ctx.newPage();
  await p2.goto(BASE + '/culture/egyptian', { waitUntil: 'domcontentloaded', timeout: 45000 });
  const onSub = await p2.evaluate(() => !!document.querySelector('a.skip-link[href="#main"]'));
  ok('skip-link-on-subpage', onSub, '/culture/egyptian');
  await ctx.close();
} else if (mode === 'des007') {
  // DES-007: H1 + lede above the fold @390x844; hero top padding collapses at <=560px.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(1200);
  const m = await p.evaluate(() => {
    const h1 = document.querySelector('h1');
    const hr = h1?.getBoundingClientRect();
    const lead = h1?.parentElement?.querySelector('p');
    const lr = lead?.getBoundingClientRect();
    const hero = document.querySelector('.home-hero, section');
    const pad = hero ? getComputedStyle(hero).paddingTop : null;
    const nav = document.querySelector('.topnav');
    return {
      h1Top: hr ? Math.round(hr.top) : null,
      h1Bottom: hr ? Math.round(hr.bottom) : null,
      leadTop: lr ? Math.round(lr.top) : null,
      leadBottom: lr ? Math.round(lr.bottom) : null,
      heroPadTop: pad,
      navH: nav ? Math.round(nav.getBoundingClientRect().height) : null,
      fold: 844,
    };
  });
  ok('hero-top-padding-collapsed-390', m.heroPadTop === '56px', `padding-top=${m.heroPadTop} (expect 56px at <=560px)`);
  ok('h1-above-fold-390', m.h1Top != null && m.h1Bottom < m.fold, `h1Top=${m.h1Top} h1Bottom=${m.h1Bottom} fold=${m.fold}`);
  ok('lede-above-fold-390', m.leadBottom != null && m.leadBottom < m.fold, `leadTop=${m.leadTop} leadBottom=${m.leadBottom} fold=${m.fold}`);
  await p.screenshot({ path: `${EV}/DES-007-home_390.png` });
  await ctx.close();

  // regression: desktop hero keeps its original 120px top padding
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await dctx.newPage();
  await dp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await dp.waitForTimeout(1000);
  const d = await dp.evaluate(() => {
    const hero = document.querySelector('.home-hero, section');
    return { pad: hero ? getComputedStyle(hero).paddingTop : null };
  });
  ok('desktop-hero-padding-unchanged', d.pad === '120px', `padding-top=${d.pad} (expect 120px)`);
  await dp.screenshot({ path: `${EV}/DES-007-home_1440.png` });
  await dctx.close();
} else if (mode === 'des008') {
  // DES-008: 404 in-world (lost tablet / Duat), no 'Version 1:', footer grounded with hairline rule.
  for (const [w, h, tag] of [[1440, 900, '1440'], [390, 844, '390']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const resp = await p.goto(BASE + '/this-page-does-not-exist-xyz', { waitUntil: 'domcontentloaded', timeout: 45000 });
    const httpStatus = resp ? resp.status() : null;
    await p.waitForTimeout(800);
    const nf = await p.evaluate(() => {
      const footer = document.querySelector('footer.site-footer');
      const fr = footer?.getBoundingClientRect();
      const fcs = footer ? getComputedStyle(footer) : null;
      const text = document.body?.innerText || '';
      return {
        status: document.body ? 'rendered' : 'blank',
        noVersion1: !/version 1:/i.test(text),
        inWorld: /(tablet|duat|lost|inscri|ankh|djed|scribe|shard|frag)/i.test(text),
        duatNamed: /duat/i.test(text),
        footerBottomGap: fr ? Math.round(window.innerHeight - fr.bottom) : null,
        footerBorderTop: fcs ? fcs.borderTopWidth : null,
        h1CenterPct: (() => { const r = document.querySelector('.notfound h1')?.getBoundingClientRect(); return r ? Math.round(((r.top + r.bottom) / 2 / window.innerHeight) * 100) : null; })(),
        sample: text.slice(0, 260).replace(/\n+/g, ' | '),
      };
    });
    ok(`404-renders@${tag}`, nf.status === 'rendered' && httpStatus === 404, `http=${httpStatus}`);
    ok(`404-no-version1@${tag}`, nf.noVersion1);
    ok(`404-in-world-copy@${tag}`, nf.inWorld && nf.duatNamed, nf.sample.slice(0, 140));
    ok(`404-footer-grounded@${tag}`, nf.footerBottomGap != null && nf.footerBottomGap >= 0 && nf.footerBottomGap <= 2, `gap below footer=${nf.footerBottomGap}px (0..2, no scroll)`);
    ok(`404-footer-hairline@${tag}`, nf.footerBorderTop === '1px', `border-top=${nf.footerBorderTop}`);
    ok(`404-content-centered@${tag}`, nf.h1CenterPct != null && nf.h1CenterPct >= 30 && nf.h1CenterPct <= 70, `h1 center at ${nf.h1CenterPct}% of viewport height`);
    await p.screenshot({ path: `${EV}/DES-008-404_${tag}.png` });
    await ctx.close();
  }
}

await browser.close();
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
