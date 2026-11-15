// Chapter 1 moments, captured mid-gameplay in real Chromium/WebGL: each shot loads a save, uses the
// real interaction (E at the hotspot), advances dialogue until a given line is on screen, then captures.
// Usage: node tools/ch1-moments.mjs <baseURL> <outDir> [width height]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/ch1/moments', w = '1366', h = '768'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const soaked = { 'e.burn': true, 'c01.p1': true, 'c01.p2': true, 'c01.p3': true };
const ch1 = { ...soaked, 'c01.lit': true, 'c01.igniter': true, 'c01.tone': 'eager' };
const met = { ...ch1, 'c02.meet': true };
const ch2 = { ...ch1, 'c02.meet': true, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look', 'c02.asked': true, 'c02.gone': true };
const day = { ...ch2, 'e.home1': true, 'h1.day': true };
// name, room, x, flags, hotspot x to use (or null), line to stop on (regex), extra wait ms
const shots = [
  ['01-beatty-nod', 'burn', 960, soaked, 1060, /All yours/, 300],
  ['02-igniter-held', 'burn', 960, soaked, 1060, /thumb your igniter/, 300],
  ['03-pleasure-to-burn', 'burn', 960, soaked, 1060, /pleasure to burn/, 900],
  ['04-pages-rise', 'burn', 960, soaked, 1060, /startled birds/, 300],
  ['05-firehouse-cards', 'station1', 1000, { ...ch1, 'e.station1': true }, null, null, 5000],
  ['06-hound-ambient', 'station1', 1560, { ...ch1, 'e.station1': true }, 1630, /neither asleep/, 400],
  ['07-moon-pointing', 'corner', 1060, met, 1120, /man in the moon/, 400],
  ['08-are-you-happy', 'corner', 1990, { ...met, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look' }, 2025, /Are you happy/, 900],
  ['09-am-i-what', 'corner', 1990, { ...met, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look' }, 2025, /Am I what/, 500],
  ['10-parlor-loud', 'home1', 1700, day, 1760, /what do you think/, 300],
  ['11-parlor-answers-wall', 'home1', 1700, day, 1760, /wonderful/, 300],
  ['12-parlor-quiet', 'home1', 1700, { ...day, 'c03.t1': true, 'c03.w1': true, 'c03.w2': true, 'c03.w3': true }, 1760, /heard every word/, 300],
  ['13-goodbye-turns', 'home1', 1700, { ...day, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.w1': true }, 1760, /goodbye, dear/, 300],
  ['14-happy-ending', 'home1', 1700, { ...day, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.w1': true }, 1760, /read that far/, 300],
  ['15-reads-last-page', 'home1', 1700, { ...day, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.w1': true }, 1760, /does not ask how it ends/, 200],
  ['16-door-subtitle', 'home1', 200, { ...day, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.script': true }, 140, /hand on the latch/, 600],
  ['17-rain-exit', 'home1', 200, { ...day, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.script': true }, 140, 'rain', 0],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const qa = (fn, arg) => page.evaluate(fn, arg);
const line = () => qa(() => window.__qa.scene.dialogue?.current ?? '');
for (const [name, room, x, flags, at, want, extra] of shots) {
  await page.goto(`${base}/?debug`);
  await qa(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
  await page.waitForTimeout(400); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
  for (let i = 0; i < 80 && (await qa(() => window.__qa.mode())) !== 'play'; i++) { await qa(() => { const q = window.__qa; q.options().length ? q.choose(0) : q.adv(); }); await page.waitForTimeout(150); }
  let ok = true;
  if (at !== null) {
    await qa((at) => window.__qa.go(at), at); await page.waitForTimeout(500);
    await page.keyboard.press('e');
    ok = false;
    for (let i = 0; i < 160; i++) {
      if (want === 'rain') { if (await qa(() => window.__qa.scene.player.alpha < 0.6)) { ok = true; break; } }
      else if (want.test(await line()) && (await qa(() => { const d = window.__qa.scene.dialogue; return d.shown >= d.full.length; }))) { ok = true; break; }
      // advance only lines that are not the target; let cutscene steps run on their own
      if (want === 'rain' || !want.test(await line())) await qa(() => { const q = window.__qa; if (q.mode() === 'dialogue') { if (q.options().length) q.choose(0); else q.adv(); } });
      await page.waitForTimeout(want === 'rain' ? 250 : 200);
    }
  }
  await page.waitForTimeout(extra);
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 86 });
  console.log(ok ? 'shot' : 'MISSED', name);
}
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
