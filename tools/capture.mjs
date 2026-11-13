// Real-browser (Chromium/WebGL) scene captures for before/after review.
// Usage: node tools/capture.mjs <baseURL> <outDir>
// Loads a save into the actual build, settles dialogue with real key presses, then screenshots.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://127.0.0.1:5181', out = 'docs/qa/sprint-after'] = process.argv.slice(2);
await mkdir(out, { recursive: true });

const ch = (n) => ({ ...Object.fromEntries(Array.from({ length: 50 }, () => []).flat()) , n });
const done = (upTo, extra = {}) => {
  // Earlier challenges' flags, as Presentation Mode seeds them (staging only, never saved as play).
  const f = {
    'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look', 'c02.asked': true,
    'c03.w1': true, 'c03.w2': true, 'c03.w3': true, 'c03.t3': true, 'c03.script': true, 'c04.book': true, 'c04.plea': 'plead', 'c05.done': true,
    'c06.chair': true, 'c06.vent': true, 'c06.millie': true, 'c06.still': true, 'c07.file': true, 'c07.call': 'book', 'c08.verse': true,
    'c09.off': true, 'c09.read': true, 'c09.burned': true, 'c10.beds': true, 'c10.w1': true, 'c10.w2': true, 'c10.w3': true, 'c10.beatty': true, 'c10.hound': true,
    'c11.crossed': true, 'c11.choice': 'walk', 'c12.mask': true, 'c12.river': true,
  };
  return Object.fromEntries(Object.entries({ ...f, ...extra }).filter(([k]) => Number(k.slice(1, 3)) < upTo || !/^c\d\d\./.test(k)));
};
void ch;

const cases = [
  ['ch1-burn', 'burn', 1060, { 'e.burn': true }, 'ignite'],
  ['ch1-clarisse', 'corner', 1000, { ...done(2), 'c02.meet': true }],
  ['ch1-parlor', 'home1', 1980, { ...done(3), 'e.home1': true, 'h1.day': true }],
  ['ch2-firehouse', 'station2', 1500, { ...done(4), 'e.station2': true }],
  ['ch2-attic', 'attic', 1200, { ...done(4), 'e.attic': true }],
  ['ch3-subway', 'subway', 600, { ...done(8), 'e.subway': true }],
  ['ch3-faber', 'faber1', 900, { ...done(8), 'e.faber1': true }],
  ['ch4-house', 'home5', 1980, { ...done(10), 'e.home5': true, 'c10.beds': true, 'c10.w1': true, 'c10.w2': true }],
  ['ch4-lawn', 'lawn2', 820, { ...done(10), 'e.lawn2': true, 'c10.beds': true, 'c10.w1': true, 'c10.w2': true, 'c10.w3': true }],
  ['ch4-boulevard', 'boulevard', 900, { ...done(11), 'e.boulevard': true }],
  ['ch4-run', 'run', 1100, { ...done(12), 'e.run': true }],
  ['ch5-river', 'river', 700, { ...done(13), 'e.river': true }],
  ['ch5-camp', 'camp', 1000, { ...done(14), 'e.camp': true, 'cp.met': true }],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
for (const [name, room, x, flags, fx] of cases) {
  await page.goto(`${base}/?debug`);
  await page.evaluate(([room, x, flags]) => {
    localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags }));
    localStorage.setItem('f451.options', JSON.stringify({ muted: true, inputMode: 'keyboard' }));
  }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
  for (let i = 0; i < 80; i++) {
    const mode = await page.evaluate(() => window.__qa?.mode());
    if (mode === 'play') break;
    await page.evaluate(() => { const q = window.__qa; if (q?.options().length) q.choose(0); else q?.adv(); });
    await page.waitForTimeout(220);
  }
  if (fx) await page.evaluate((fx) => window.__qa.scene.kit.fx[fx]?.(), fx);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('captured', name);
}
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
