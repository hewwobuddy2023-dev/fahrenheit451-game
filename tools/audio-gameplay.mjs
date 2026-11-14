// Real-gameplay audio check in Chromium for the redesigned Chapter 1 (plus the river dive).
// Real key presses drive the game; we log which cues fire and read the audio engine's live state.
// Usage: node tools/audio-gameplay.mjs [baseURL]. Proves triggering, state and cleanup, NOT how it sounds.
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`, detail ?? ''); };
const A = (fn, arg) => page.evaluate(fn, arg);
const engine = () => A(() => { const a = window.__audio; return { profile: a.status.profile, spray: +a.sprayGain.gain.value.toFixed(3), ducked: a.ducked, muffle: Math.round(a.muffle.frequency.value), master: +a.master.gain.value.toFixed(3), state: a.status.state }; });
const mode = () => A(() => window.__qa?.mode());
const cues = () => A(() => window.__cues);

async function enter(room, x, flags, settle = true) {
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
  await A(() => { window.__cues = []; const a = window.__audio, orig = a.cue.bind(a); a.cue = (k) => { window.__cues.push(k); return orig(k); }; });
  if (settle) await advanceToPlay();
}
async function advanceToPlay(max = 120) {
  for (let i = 0; i < max && (await mode()) !== 'play'; i++) { await A(() => { const q = window.__qa; if (q.options().length) q.choose(0); else q.adv(); }); await page.waitForTimeout(150); }
}

const ch1 = { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true, 'c01.tone': 'eager' };

// 1. The burn: footsteps, the pour loop follows E, ignition = click, then rush, then the fire bed
await enter('burn', 760, { 'e.burn': true });
const e0 = await engine();
check('audio unlocked by a real key press; the burn uses the fire ambience', e0.state === 'running' && e0.profile === 'fire', JSON.stringify(e0));
await page.keyboard.down('d'); await page.waitForTimeout(900); await page.keyboard.up('d');
check('walking plays footsteps', (await cues()).includes('step'));
await A(() => window.__qa.go(1060)); await page.waitForTimeout(300);
await page.keyboard.down('e'); await page.waitForTimeout(900);
const pouring = await engine();
await page.keyboard.up('e'); await page.waitForTimeout(500);
const stopped = await engine();
check('the kerosene pour sounds while E is held (full stream, no sputter)', pouring.spray > 0.4, `spray ${pouring.spray}`);
check('the pour stops when E is released', stopped.spray < 0.02, `spray ${stopped.spray}`);
await page.keyboard.down('e'); await page.waitForTimeout(2600); await page.keyboard.up('e'); await page.waitForTimeout(300);
check('one pour soaks all three piles', await A(() => ['c01.p1','c01.p2','c01.p3'].every((k) => window.__qa.scene.session.flags[k])), JSON.stringify(await A(() => ({ near: window.__qa.scene.near?.id, hold: window.__qa.scene.holdMs, mode: window.__qa.mode() }))));
await A(() => window.__qa.go(560)); await page.waitForTimeout(300); await page.keyboard.press('e'); await page.waitForTimeout(300);
for (let i = 0; i < 40 && !(await A(() => window.__qa.scene.session.flags['c01.igniter'])); i++) { await A(() => { const q = window.__qa; if (q.options().length) q.choose(0); else q.adv(); }); await page.waitForTimeout(150); }
await advanceToPlay();
await A(() => { window.__cues = []; window.__qa.go(980); }); await page.waitForTimeout(300);
await page.keyboard.press('e'); await page.waitForTimeout(1500);
const lit = await cues();
check('lighting plays the igniter click, then the fire rush, then the ignition', lit.indexOf('click') >= 0 && lit.indexOf('rush') > lit.indexOf('click') && lit.includes('ignite'), lit.join(','));

// 2. Firehouse: industrial ambience; the Hound's servo fires when Montag walks past the kennel
await enter('station1', 1450, { ...ch1, 'e.station1': true });
check('the firehouse uses the industrial ambience', (await engine()).profile === 'industrial');
await page.keyboard.down('d'); await page.waitForTimeout(1500); await page.keyboard.up('d');
check('walking past the kennel wakes the Hound (servo cue from the bark)', (await cues()).includes('servo'), (await cues()).filter((c) => c !== 'step').join(','));
check('no hose loop left over from the burn', (await engine()).spray < 0.02);

// 3. Clarisse: the mix ducks for "Are you happy?" and comes back afterwards
await enter('corner', 1990, { ...ch1, 'c02.meet': true, 'c02.n1': 'look' });
await A(() => window.__qa.go(2025));
let duckedAtQuestion = false, sawQuestion = false;
for (let i = 0; i < 120; i++) {
  const t = await A(() => window.__qa.scene.dialogue?.body?.text ?? '');
  if (/happy\?/i.test(t)) { sawQuestion = true; await page.waitForTimeout(700); duckedAtQuestion = (await engine()).ducked; break; }
  await A(() => { const q = window.__qa; if (q.options().length) q.choose(0); else q.adv(); }); await page.waitForTimeout(200);
}
check('"Are you happy?" ducks the mix', sawQuestion && duckedAtQuestion);
await advanceToPlay();
const after = await engine();
check('the mix is restored after the question', !after.ducked && after.master > 0.3, JSON.stringify(after));

// 4. Parlor: the walls' broadcast ambience; knob cues; the room goes quiet when all walls are down
await enter('home1', 1660, { ...ch1, 'c02.meet': true, 'c02.n1': 'look', 'c02.n2': 'walk', 'c02.n3': 'walk', 'c02.asked': true, 'e.home1': true, 'h1.day': true });
check('walls up: the parlor plays the television ambience', (await engine()).profile === 'television');
for (const x of [1660, 2000, 2300]) {
  await A((x) => window.__qa.go(x), x); await page.waitForTimeout(300);
  await page.keyboard.press('e'); await page.waitForTimeout(300); await advanceToPlay();
}
const knobs = (await cues()).filter((c) => c === 'knob').length;
check('each wall turned down clicks its knob', knobs === 3, `${knobs} knob cues`);
check('all walls down: the broadcast ambience stops', (await engine()).profile === 'industrial', (await engine()).profile);

// 5. River (unchanged chapter): dive muffles and fully restores, including across a scene change
await enter('river', 380, { 'e.river': true });
await page.keyboard.down('s'); await page.waitForTimeout(600);
const under = (await engine()).muffle;
await page.keyboard.up('s'); await page.waitForTimeout(900);
check('diving muffles the mix and surfacing restores it', under < 2000 && (await engine()).muffle > 15000, `${under} Hz -> ${(await engine()).muffle} Hz`);
await page.keyboard.down('s'); await page.waitForTimeout(400);
await A(() => window.__audio.useScene('camp')); await page.keyboard.up('s'); await page.waitForTimeout(700);
const clean = await engine();
check('a scene change leaves no duck, muffle or hose loop behind', !clean.ducked && clean.muffle > 15000 && clean.spray < 0.02, JSON.stringify(clean));

console.log(`\n${results.filter(Boolean).length}/${results.length} gameplay audio checks passed`);
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
