// Environment shot list: one capture per room set, plus the title screen (real Chromium/WebGL).
// Usage: node tools/room-shots.mjs <baseURL> <outDir> [width height] [name-filter]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/sets/after', w = '1366', h = '768', only = ''] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const ch1 = { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true, 'c01.tone': 'eager' };
const shots = [
  // name, room, x, flags
  ['title', 'menu', 0, {}],
  ['burn', 'burn', 700, {}],
  ['station1-a', 'station1', 700, { ...ch1, 'e.station1': true }],
  ['station1-b', 'station1', 1700, { ...ch1, 'e.station1': true }],
  ['corner', 'corner', 1000, { ...ch1 }],
  ['home1-a', 'home1', 300, { ...ch1, 'e.home1': true, 'h1.day': true }],
  ['home1-b', 'home1', 900, { ...ch1, 'e.home1': true, 'h1.day': true }],
  ['home1-c', 'home1', 1830, { ...ch1, 'e.home1': true, 'h1.day': true }],
  ['station2-a', 'station2', 1500, { ...ch1, 'e.station2': true }],
  ['station2-b', 'station2', 2150, { ...ch1, 'e.station2': true }],
  ['home2-a', 'home2', 900, { ...ch1 }],
  ['home2-b', 'home2', 1900, { ...ch1 }],
  ['home3', 'home3', 900, { ...ch1 }],
  ['subway', 'subway', 600, { ...ch1 }],
  ['faber1-a', 'faber1', 500, { ...ch1 }],
  ['faber1-b', 'faber1', 1000, { ...ch1 }],
  ['home4-a', 'home4', 300, { ...ch1 }],
  ['home4-b', 'home4', 1450, { ...ch1 }],
  ['station3', 'station3', 1100, { ...ch1 }],
  ['lawn', 'lawn', 640, { ...ch1 }],
  ['home5-a', 'home5', 800, { ...ch1 }],
  ['home5-b', 'home5', 1500, { ...ch1 }],
  ['lawn2', 'lawn2', 900, { ...ch1 }],
  ['boulevard-a', 'boulevard', 300, { ...ch1 }],
  ['boulevard-b', 'boulevard', 1300, { ...ch1 }],
  ['faber2', 'faber2', 700, { ...ch1 }],
  ['run', 'run', 900, { ...ch1 }],
  ['river', 'river', 700, { ...ch1 }],
  ['camp-a', 'camp', 200, { ...ch1 }],
  ['camp-b', 'camp', 1000, { ...ch1 }],
].filter((s) => s[0].startsWith(only));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const qa = (fn, arg) => page.evaluate(fn, arg);
const settle = async () => {
  for (let i = 0; i < 100; i++) {
    if ((await qa(() => window.__qa.mode())) === 'play') return;
    await qa(() => { const q = window.__qa; if (q.options().length) q.choose(0); else q.adv(); });
    await page.waitForTimeout(160);
  }
};
for (const [name, room, x, flags] of shots) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => {
    localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags }));
    localStorage.setItem('f451.options', JSON.stringify({ muted: true, inputMode: 'keyboard' }));
  }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 20000 });
  await page.waitForTimeout(700);
  if (room !== 'menu') {
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
    await settle();
    await qa((x) => window.__qa.go(x), x);
    await page.waitForTimeout(1600);
  }
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 88 });
  console.log('shot', name);
}
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
