// Mini-game cues after the show-don't-tell pass. Usage: node tools/minigames2-shots.mjs <baseURL> <outDir> [cpuThrottleRate]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const [base = 'http://localhost:5173', out = 'docs/qa/mg2', rate = '1'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(process.env.VW ?? 1366), height: Number(process.env.VH ?? 768) } });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(rate) });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
const qa = (fn, arg) => page.evaluate(fn, arg);
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await page.screenshot({ path: `${out}/${n}.png` }); console.log('shot', n); };
async function load(room, x, flags) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 60000 });
  await wait(400); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 60000 });
}
async function settle(max = 120) {
  for (let i = 0; i < max && (await qa(() => window.__qa.mode())) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(150); }
}
const only = process.argv[5] ?? '';
const want = (n) => !only || n.startsWith(only);
if (want('a')) { // boulevard: wait on the island, shoot through a cycle
  await load('boulevard', 560, { 'e.boulevard': true, 'c11.kids': true }); await settle(); await wait(300);
  for (let i = 0; i < 8; i++) { await shot(`a-boulevard-${i}`); await wait(450); }
}
if (want('b')) { // alley count
  await load('run', 1200, { 'e.run': true }); await settle(); await wait(300);
  await qa(() => { const s = window.__qa.scene; s.timerStart = s.activeTime - 8000; }); await wait(200); await shot('b-run-early');
  await qa(() => { const s = window.__qa.scene; s.timerStart = s.activeTime - 30000; }); await wait(200); await shot('b-run-late');
}
if (want('c')) { // river
  await load('river', 520, { 'e.river': true }); await settle(); await wait(300);
  await qa(() => { const s = window.__qa.scene; s.player.x = 300; }); await wait(300); await shot('c-river-0');
  await page.keyboard.down('ArrowDown'); await wait(1500); await shot('c-river-dive'); await wait(2500); await shot('c-river-low'); await page.keyboard.up('ArrowDown');
}
if (want('d')) { // attic watcher
  await load('attic', 1050, { 'e.attic': true, 'a.fell': true }); await settle(); await wait(300);
  for (let i = 0; i < 8; i++) { await shot(`d-attic-${i}`); await wait(600); }
}
if (want('e')) { // burn hose
  await load('burn', 1000, { 'e.burn': true }); await settle(); await wait(300);
  await qa(() => window.__qa.go(1000)); await wait(300); await shot('e-burn-idle');
  await page.keyboard.down('e'); await wait(1500); await shot('e-burn-hold'); await page.keyboard.up('e');
}
if (want('f')) { // hound prompt
  await load('lawn2', 900, { 'c10.beds': true, 'c10.w1': true, 'c10.w2': true, 'c10.w3': true, 'e.lawn': true, 'e.home5': true });
  for (let i = 0; i < 300; i++) {
    const s = await qa(() => ({ p: !!window.__qa.scene.promptWait, m: window.__qa.mode() }));
    if (s.p) { await wait(500); await shot('f-hound'); break; }
    await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await wait(120);
  }
}
if (want('g')) { // subway puzzle
  await load('subway', 620, { 'e.subway': true }); await settle(); await wait(300);
  await qa(() => window.__qa.go(620)); await wait(100); await qa(() => window.__qa.act());
  for (let i = 0; i < 40 && !(await qa(() => !!window.__qa.scene.dialogue.puzzle)); i++) { await qa(() => window.__qa.adv()); await wait(120); }
  await wait(300); await shot('g-puzzle-study');
  await qa(() => window.__qa.scene.dialogue.puzzle.action('act')); await wait(200);
  await qa(() => { const p = window.__qa.scene.dialogue.puzzle; p.pick(p.state.cards.indexOf(p.def.fragments[0])); }); await wait(200); await shot('g-puzzle-one');
  await qa(() => { const p = window.__qa.scene.dialogue.puzzle; p.pick(p.state.cards.findIndex((c) => !p.def.fragments.includes(c))); }); await wait(100); await shot('g-puzzle-flash');
}
if (want('h')) { // standing still (home2)
  await load('home2', 420, { 'e.home2': true, 'h2.day': true, 'c05.done': true, 'c06.chair': true, 'c06.vent': true });
  await settle(); await qa(() => window.__qa.go(420)); await wait(200);
  await qa(() => { const s = window.__qa.scene; s.stillWatch = { until: s.activeTime + 5000, x: s.player.x, ms: 5000 }; });
  await wait(2500); await shot('h-still-mid'); await page.keyboard.down('ArrowLeft'); await wait(200); await shot('h-still-moved'); await page.keyboard.up('ArrowLeft');
}
if (want('i')) { // pillow suspicion meter
  await load('home2', 900, { 'e.home2': true });
  for (let i = 0; i < 200 && !(await qa(() => window.__qa.options().length)); i++) { await qa(() => window.__qa.adv()); await wait(100); }
  await wait(300); await shot('i-pillow-1');
  await qa(() => window.__qa.choose(0)); await wait(500); await shot('i-pillow-2');
}
await browser.close();
