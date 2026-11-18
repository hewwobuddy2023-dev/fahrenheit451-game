// Attic traversal captures: the climb, the avalanche, the descent and her last stand, as played.
// Usage: node tools/attic-traversal.mjs <baseURL> <outDir> [climb|down]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/attic', only = ''] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const atticBase = { 'e.station2': true, 's2.hound': true, 's2.cards': true, 's2.alarm': true, 'e.attic': true };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const qa = (fn, arg) => page.evaluate(fn, arg);
const wait = (ms) => page.waitForTimeout(ms);
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
async function load(room, x, flags) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
  await wait(400); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
}
/** shoot every `step` ms for `total` ms, tapping through dialogue once a line has finished typing */
async function film(prefix, total, step = 450) {
  for (let t = 0, i = 0; t < total; t += step, i++) {
    await qa(() => { const q = window.__qa; if (q.mode() === 'dialogue') { const d = q.scene.dialogue; if (d.shown >= d.full.length) { q.options().length ? q.choose(0) : q.adv(); } } });
    await shot(`${prefix}-${String(i).padStart(2, '0')}`); await wait(step);
  }
}
if (!only || only === 'climb') {
  await load('attic', 560, atticBase);
  for (let i = 0; i < 60 && (await qa(() => window.__qa.mode())) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(150); }
  await shot('00-hall');
  await qa(() => window.__qa.go(700));
  await film('01-climb', 17000);
}
if (!only || only === 'down') {
  const fell = { ...atticBase, 'a.fell': true, 'c04.book': true };
  await load('attic', 1140, fell);
  for (let i = 0; i < 40 && (await qa(() => window.__qa.mode())) !== 'play'; i++) { await qa(() => window.__qa.adv()); await wait(150); }
  await shot('10-attic');
  await qa(() => window.__qa.go(1090));
  await film('11-down', 6000);
  await qa(() => window.__qa.go(535));
  await film('12-stand', 22000, 500);
}
console.log('errors', errors);
await browser.close();
