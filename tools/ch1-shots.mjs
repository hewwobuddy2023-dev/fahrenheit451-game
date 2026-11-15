// Chapter 1 shot list (real Chromium/WebGL), identical camera positions before and after the redesign.
// Usage: node tools/ch1-shots.mjs <baseURL> <outDir> [width height]
// Shots use saves and the game's own state/fx; nothing is drawn into the screenshot by this tool.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/ch1-after', w = '1366', h = '768', input = 'keyboard'] = process.argv.slice(2);
const touch = input === 'touch';
await mkdir(out, { recursive: true });
const ch1 = { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true, 'c01.tone': 'eager' };
const ch2 = { ...ch1, 'c02.meet': true, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look', 'c02.asked': true, 'c02.gone': true };
const shots = [
  // name, room, x, flags, action
  ['01-opening', 'burn', 640, {}, 'settle'],
  ['02-soaked-before-ignition', 'burn', 760, { 'e.burn': true, 'c01.p1': true, 'c01.p2': true, 'c01.p3': true }, 'settle'],
  ['03-ignition', 'burn', 760, { 'e.burn': true, 'c01.p1': true, 'c01.p2': true, 'c01.p3': true }, 'ignite'],
  ['04-firehouse-hound', 'station1', 1640, { ...ch1, 'e.station1': true }, 'settle'],
  ['05-clarisse-walk', 'corner', 1000, { ...ch1, 'c02.meet': true }, 'settle'],
  ['06-are-you-happy', 'corner', 1990, { ...ch1, 'c02.meet': true, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look' }, 'happy'],
  ['07-parlor', 'home1', 1830, { ...ch2, 'e.home1': true, 'h1.day': true }, 'settle'],
  ['08-chapter-end', 'home1', 160, { ...ch2, 'e.home1': true, 'h1.day': true, 'c03.w1': true, 'c03.w2': true, 'c03.w3': true, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.script': true }, 'leave'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, hasTouch: touch, isMobile: touch });
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
for (const [name, room, x, flags, action] of shots) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags, inputMode]) => {
    localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags }));
    localStorage.setItem('f451.options', JSON.stringify({ muted: true, inputMode }));
  }, [room, x, flags, input]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 20000 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
  if (action === 'happy') {
    // walk into the house trigger and stop on Clarisse's question
    await qa(() => window.__qa.go(2025));
    for (let i = 0; i < 120; i++) {
      const t = await qa(() => window.__qa.scene.dialogue?.body?.text ?? '');
      if (/happy\?/i.test(t)) break;
      await qa(() => { const q = window.__qa; if (q.options().length) q.choose(0); else q.adv(); });
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(900);
  } else {
    await settle();
    if (action === 'ignite') { await qa(() => window.__qa.scene.fx('ignite')); await page.waitForTimeout(3800); }
    else if (action === 'leave') { await qa(() => { window.__qa.go(140); }); await page.waitForTimeout(300); await page.keyboard.press('e'); await page.waitForTimeout(2600); }
    else await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 88 });
  console.log('shot', name);
}
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
