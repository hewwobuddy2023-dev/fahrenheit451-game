// Mini-game failure moments (chapters 3-5), captured mid-gameplay in real Chromium/WebGL through ?debug and window.__qa.
// Usage: node tools/ch4-moments.mjs <baseURL> <outDir> [only-name-prefix] [cpuThrottleRate]
//   prefixes: 01 boulevard car hit, 02 count of ten, 03 river found, 04 hound needle, 05 subway jingle
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/minigames', only = '', rate = '1'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(rate) });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const qa = (fn, arg) => page.evaluate(fn, arg);
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (name) => { await page.screenshot({ path: `${out}/${name}.png` }); console.log('shot', name); };
const want = (name) => !only || name.startsWith(only);

async function load(room, x, flags) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 60000 });
  await wait(400); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 60000 });
}
const mode = () => qa(() => window.__qa.mode());
async function settle(max = 120) {
  for (let i = 0; i < max && (await mode()) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(150); }
}
const state = () => qa(() => { const s = window.__qa.scene; return { x: Math.round(s.player.x), mode: s.mode, caught: s.caughtScene, line: s.dialogue?.current ?? '' }; });
/** shoot every `gap` ms until `pred` is true (or max shots) */
async function burst(prefix, pred, gap = 220, max = 14) {
  for (let i = 0; i < max; i++) { await shot(`${prefix}-${String(i).padStart(2, '0')}`); if (await pred()) return true; await wait(gap); }
  return false;
}

if (want('01')) {
  // walk straight into the traffic holding the keys: the car must hit, the screen goes black, and the held key keeps walking afterwards
  await load('boulevard', 400, { 'e.boulevard': true, 'c11.kids': true }); await settle(); await wait(300);
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 80 && !(await qa(() => window.__qa.scene.caughtScene)); i++) await wait(100);
  await shot('01-car-hit-0');
  for (let i = 1; i < 8; i++) { await wait(160); await shot(`01-car-hit-${i}`); }
  for (let i = 0; i < 40 && (await qa(() => window.__qa.scene.caughtScene)); i++) await wait(100);
  const x0 = (await state()).x; await wait(600); const x1 = (await state()).x;
  console.log('held right after the hit: x', x0, '->', x1, x1 > x0 ? 'KEY KEPT' : 'KEY DROPPED');
  await page.keyboard.up('ArrowRight'); await shot('01-back-at-kerb');
}
if (want('02')) {
  await load('run', 1200, { 'e.run': true }); await settle(); await wait(300);
  await qa(() => { const s = window.__qa.scene; s.timerStart = s.activeTime - 33000; }); // the count is at nine
  await burst('02-ten', async () => (await state()).line.includes('Ten') , 300, 6);
  await qa(() => window.__qa.adv());
  for (let i = 0; i < 40 && (await mode()) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(250); if (i % 3 === 0) await shot(`02-ten-after-${i}`); }
  console.log('after ten:', await state());
}
if (want('03')) {
  await load('river', 520, { 'e.river': true }); await settle(); await wait(300);
  await qa(() => { const s = window.__qa.scene; s.player.x = s.room.hazards[0].from; });
  for (let i = 0; i < 60 && !(await qa(() => window.__qa.scene.caughtScene)); i++) await wait(80);
  await shot('03-found-0'); await wait(900); await shot('03-found-scene'); await wait(500); await shot('03-found-scene2');
  for (let i = 0; i < 40 && (await mode()) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(250); }
  await shot('03-restart'); console.log('after river catch:', await state());
}
if (want('04')) {
  await load('lawn2', 900, { 'c10.beds': true, 'c10.w1': true, 'c10.w2': true, 'c10.w3': true, 'e.lawn': true, 'e.home5': true });
  let shots = 0, needled = false;
  for (let i = 0; i < 400; i++) {
    const s = await qa(() => { const q = window.__qa, sc = q.scene; return { m: q.mode(), p: !!sc.promptWait, l: q.line() }; });
    if (/needle grazes/.test(s.l) && !needled) { needled = true; await wait(900); await shot('04-needle-line'); }
    if (s.p && shots < 4) { await shot(`04-prompt-${shots}`); shots++; await wait(2100); continue; } // miss the first three prompts
    if (s.p) { await qa(() => window.__qa.hit()); await wait(200); continue; }
    if (s.m === 'play') break;
    await qa(() => { const q = window.__qa; if (q.mode() === 'dialogue') { q.options().length ? q.choose(0) : q.adv(); } });
    await wait(130);
  }
  console.log('hound: prompts shown', shots);
}
if (want('05')) {
  await load('subway', 620, {}); await settle();
  await qa(() => window.__qa.act()); for (let i = 0; i < 30 && !(await qa(() => window.__qa.scene.dialogue.puzzle)); i++) { await qa(() => window.__qa.adv()); await wait(150); }
  await shot('05-study');
  await qa(() => window.__qa.scene.dialogue.puzzle.action('act'));
  for (const i of [1, 0, 2, 3]) await qa((i) => window.__qa.scene.dialogue.puzzle.pick(i), i); // wrong order: a distractor first
  await shot('05-drowned');
}
console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : 'no page errors');
await browser.close();
