// The cast in real rooms (Chromium/WebGL): loads a save into each room next to its characters and captures at game scale.
// Usage: node tools/cast-rooms.mjs <baseURL> <outDir> [width height]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/cast/rooms', w = '1366', h = '768'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const soaked = { 'e.burn': true, 'c01.p1': true, 'c01.p2': true, 'c01.p3': true };
const ch1 = { ...soaked, 'c01.lit': true, 'c01.igniter': true, 'c01.tone': 'eager' };
const met = { ...ch1, 'c02.meet': true };
const day = { ...met, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look', 'c02.asked': true, 'c02.gone': true, 'e.home1': true, 'h1.day': true };
// name, room, player x, flags
const shots = [
  ['burn-beatty', 'burn', 900, soaked],
  ['station-firemen', 'station1', 1000, { ...ch1, 'e.station1': true }],
  ['corner-clarisse', 'corner', 960, met],
  ['home1-mildred', 'home1', 1700, day],
  ['home3-mildred', 'home3', 1700, {}],
  ['home4-ladies', 'home4', 1800, {}],
  ['faber', 'faber1', 480, {}],
  ['attic-woman', 'attic', 600, {}],
  ['camp-group', 'camp', 900, {}],
  ['lawn-beatty-mildred', 'lawn', 760, {}],
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const qa = (fn, arg) => page.evaluate(fn, arg);
for (const [name, room, x, flags] of shots) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
  await page.waitForTimeout(400); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
  for (let i = 0; i < 80 && (await qa(() => window.__qa.mode())) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await page.waitForTimeout(150); }
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 88 });
  console.log('shot', name);
}
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
