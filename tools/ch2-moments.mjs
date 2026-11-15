// Chapter 2 moments, captured mid-gameplay in real Chromium/WebGL: seeded saves through ?debug and window.__qa.
// Usage: node tools/ch2-moments.mjs <baseURL> <outDir> [only-name-prefix]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/ch2', only = ''] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const atticBase = { 'e.station2': true, 's2.hound': true, 's2.cards': true, 's2.alarm': true, 'e.attic': true };
const fell = { ...atticBase, 'a.fell': true };
const bedroom = { ...fell, 'c04.book': true, 'c04.plea': 'plead' };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const qa = (fn, arg) => page.evaluate(fn, arg);
const shot = async (name) => { await page.screenshot({ path: `${out}/${name}.png` }); console.log('shot', name); };
const wait = (ms) => page.waitForTimeout(ms);

async function load(room, x, flags) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
  await wait(400); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
}
const mode = () => qa(() => window.__qa.mode());
async function settle(max = 120) {
  for (let i = 0; i < max && (await mode()) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(150); }
}
const line = () => qa(() => window.__qa.scene.dialogue?.current ?? '');
/** advance dialogue until the line matches (and has finished typing) */
async function until(re, max = 200) {
  for (let i = 0; i < max; i++) {
    const done = await qa(() => { const d = window.__qa.scene.dialogue; return d.shown >= d.full.length; });
    if (re.test(await line()) && done) return true;
    await qa(() => { const q = window.__qa; if (q.mode() === 'dialogue') { if (q.options().length) q.choose(0); else q.adv(); } });
    await wait(160);
  }
  return false;
}
const want = (name) => !only || name.startsWith(only);

if (want('01')) {
  await load('attic', 560, atticBase); await settle(); await wait(500);
  await shot('01-attic-stairs-before');
  await qa(() => window.__qa.go(1250)); await wait(1800); await shot('01-attic-right-before');
}

if (want('02')) {
  await load('attic', 560, atticBase); await settle(); await wait(400);
  await qa(() => window.__qa.go(700)); // the stair foot triggers the climb
  for (let i = 0; i < 12; i++) { await wait(380); await shot(`02-climb-${String(i).padStart(2, '0')}`); }
  await wait(1500); await shot('02-climb-top');
}

if (want('03')) {
  await load('attic', 1100, fell); await settle(); await wait(600);
  await qa(() => window.__qa.go(1140)); await wait(400); await shot('03-hide-before');
  // wait for a clear window, then hold E
  await page.keyboard.down('e'); await wait(260); await shot('03-hide-mid'); await wait(200); await shot('03-hide-late');
  await page.keyboard.up('e'); await wait(250); await shot('03-hide-done');
  await wait(2000); await shot('03-hide-after');
}

if (want('04')) {
  await load('home2', 900, bedroom); await wait(1800);
  await shot('04-night-in-bed'); // lying down, helmet off, in the dark
  await until(/in the morning/i, 300); await wait(900); await shot('04-day-sick');
  await until(/fix your pillow/i, 300); await wait(900);
  await shot('04-beatty-seated');
  for (let i = 0; i < 80 && !(await qa(() => window.__qa.options().length)); i++) { await qa(() => window.__qa.adv()); await wait(150); }
  await wait(800); await shot('04-meter-above-choices');
}

if (want('05')) {
  await load('home2', 900, bedroom);
  await until(/fix your pillow/i, 400);
  for (let i = 0; i < 80 && !(await qa(() => window.__qa.options().length)); i++) { await qa(() => window.__qa.adv()); await wait(150); }
  await wait(700);
  const save0 = await qa(() => localStorage.getItem('f451.save'));
  await qa(() => window.__qa.choose(0)); await wait(300); // wrong: +1
  for (let i = 0; i < 40 && !(await qa(() => window.__qa.options().length)); i++) { await qa(() => window.__qa.adv()); await wait(150); }
  await wait(800); await shot('05-after-first-wrong-2of3');
  await qa(() => window.__qa.choose(2)); await wait(300); // wrong: +2, caught
  for (let i = 0; i < 60; i++) { const l = await line(); if (/What is this/.test(l) && (await qa(() => { const d = window.__qa.scene.dialogue; return d.shown >= d.full.length; }))) break; await qa(() => { if (window.__qa.mode() === 'dialogue') window.__qa.adv(); }); await wait(150); }
  await wait(150); console.log('panel visible:', await qa(() => window.__qa.scene.dialogue.root.visible)); await shot('05-what-is-this');
  await qa(() => window.__qa.adv());
  await wait(2150); await shot('05-black');
  await wait(1500); await shot('05-back-at-first-decision');
  const save1 = await qa(() => localStorage.getItem('f451.save'));
  console.log('save unchanged by the failed attempt:', save0 === save1);
}

console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
