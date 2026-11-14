// Real-gameplay audio check in Chromium: real key presses drive the game, and we log which cues fire,
// whether the hose loop follows E, and whether the river dive muffle closes and fully reopens.
// Usage: node tools/audio-gameplay.mjs [baseURL]. Proves triggering and levels, NOT how it sounds to a person.
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`, detail ?? ''); };

async function enter(room, x, flags) {
  await page.goto(`${base}/?debug`);
  await page.evaluate(([room, x, flags]) => {
    localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags }));
    localStorage.setItem('f451.options', JSON.stringify({ muted: false, volume: 1, inputMode: 'keyboard' }));
  }, [room, x, flags]);
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter'); // a real gesture: unlocks audio and continues
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
  for (let i = 0; i < 80 && (await page.evaluate(() => window.__qa.mode())) !== 'play'; i++) {
    await page.evaluate(() => { const q = window.__qa; if (q.options().length) q.choose(0); else q.adv(); });
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => {
    window.__cues = [];
    const a = window.__audio, orig = a.cue.bind(a);
    a.cue = (k) => { window.__cues.push(k); return orig(k); };
  });
}
const audio = (fn) => page.evaluate(fn);

// 1. Burn: footsteps, hose loop follows E, ignite cue
await enter('burn', 760, { 'e.burn': true });
check('audio context running after a real key press', (await audio(() => window.__audio.status.state)) === 'running');
await page.keyboard.down('d'); await page.waitForTimeout(900); await page.keyboard.up('d');
const steps = (await audio(() => window.__cues)).filter((c) => c === 'step').length;
check('walking plays footsteps', steps >= 2, `${steps} steps in 0.9 s`);
await audio(() => { window.__qa.go?.(900); });
await page.waitForTimeout(300);
await page.keyboard.down('e'); await page.waitForTimeout(700);
const spraying = await audio(() => ({ gain: window.__audio.sprayGain.gain.value, rms: window.__audio.sampleOutput().rms }));
await page.keyboard.up('e'); await page.waitForTimeout(500);
const released = await audio(() => ({ gain: window.__audio.sprayGain.gain.value, rms: window.__audio.sampleOutput().rms }));
check('hose loop sounds while E is held', spraying.gain > 0.15, JSON.stringify(spraying));
check('hose loop stops after E is released', released.gain < 0.02, JSON.stringify(released));

// 2. River: dive closes the muffle, surfacing restores it completely
await enter('river', 380, { 'e.river': true });
const open0 = await audio(() => window.__audio.muffle.frequency.value);
await page.keyboard.down('s'); await page.waitForTimeout(600);
const under = await audio(() => window.__audio.muffle.frequency.value);
await page.keyboard.up('s'); await page.waitForTimeout(900);
const open1 = await audio(() => window.__audio.muffle.frequency.value);
check('diving muffles the mix', under < 2000, `${Math.round(open0)} Hz -> ${Math.round(under)} Hz`);
check('surfacing restores the full mix', open1 > 15000, `${Math.round(open1)} Hz`);
// leaving mid-dive must not strand the muffle
await page.keyboard.down('s'); await page.waitForTimeout(400);
await audio(() => window.__audio.useScene('camp')); await page.keyboard.up('s'); await page.waitForTimeout(700);
check('scene change while diving restores the mix', (await audio(() => window.__audio.muffle.frequency.value)) > 15000);

// 3. Encounter cues fire from gameplay (not called by hand)
await enter('station2', 1500, { 'e.station2': true, 'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look', 'c02.asked': true, 'c03.w1': true, 'c03.w2': true, 'c03.w3': true, 'c03.t3': true, 'c03.script': true });
await audio(() => window.__qa.go?.(1770)); await page.waitForTimeout(300);
await page.keyboard.press('e'); await page.waitForTimeout(400);
const cues = await audio(() => window.__cues);
check('touching the Hound plays the Hound cue', cues.includes('hound'), cues.join(','));

console.log(`\n${results.filter(Boolean).length}/${results.length} gameplay audio checks passed`);
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
