// Mini-game stakes: cars, the count of ten, the searchlight, the Hound's needle, the subway jingle. Real bundled game, deterministic time.
import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';

async function desktop(save, extra = {}) {
  const s = await simulate({ width: 1366, height: 768, dpr: 1, lowres: true, touchDevice: false, save, ...extra });
  await s.advance(700); await s.key('Enter'); await s.key('Enter', false);
  await s.until(() => s.scene().sys.settings.key === 'room', 'Continue');
  return s;
}
async function settleKeys(s, maxMs = 60000) {
  for (let t = 0; t < maxMs; t += 150) {
    const r = s.scene();
    if (r.mode === 'play' && !r.stillWatch) return;
    if (r.dialogue?.choosing) await s.advance(450);
    await s.key('KeyE'); await s.key('KeyE', false); await s.advance(110);
  }
  throw new Error('unsettled');
}

{ // the boulevard: a car hit is a scene, it ends at the near kerb, and a still-held key keeps walking
  const s = await desktop({ v: 1, room: 'boulevard', x: 500, flags: { 'e.boulevard': true, 'c11.kids': true } });
  try {
    await settleKeys(s); const r = s.scene();
    await s.key('ArrowRight'); // never released
    await s.until(() => r.caughtScene, 'a car hits a player who never waits', 20000);
    assert.equal(r.mode, 'cutscene'); assert.ok(r.player.x > 560, 'hit inside the traffic');
    await s.until(() => !r.caughtScene && r.mode === 'play', 'back to play', 8000);
    assert.ok(r.player.x < 640, `sent back to the kerb, got ${r.player.x}`);
    assert.equal(r.keys.right[0].isDown, true, 'the held movement key survives the caught scene');
    const x0 = r.player.x; await s.advance(900); assert.ok(r.player.x > x0 + 20, 'and keeps moving the player');
    await s.key('ArrowRight', false);
    console.log('PASS boulevard car hit: scene, near kerb, held key kept');
  } finally { s.close(); }
}
{ // the count of ten: a real caught scene (lines), then the start of the alley
  const s = await desktop({ v: 1, room: 'run', x: 1200, flags: { 'e.run': true } });
  try {
    await settleKeys(s); const r = s.scene();
    await s.key('ArrowRight'); // held from before the count ends, never released
    r.timerStart = r.activeTime - 34500;
    await s.until(() => r.caughtScene, 'the count reaches ten');
    await s.until(() => r.dialogue?.open, 'the caught scene speaks');
    assert.match(r.dialogue.current, /Ten\./);
    await settleKeys(s);
    assert.equal(Math.round(r.player.x), 150); assert.equal(r.caughtScene, false);
    assert.ok(r.activeTime - r.timerStart < 1500, 'the count starts over');
    assert.equal(r.keys.right[0].isDown, true, 'the key held through the caught scene is still down');
    const x0 = r.player.x; await s.advance(1200); assert.ok(r.player.x > x0 + 20, 'and the held key walks on after the scene');
    await s.key('ArrowRight', false);
    console.log('PASS count of ten: caught scene, then restart');
  } finally { s.close(); }
}
for (const exhausted of [false, true]) { // the river: out of breath, the light finds you from further off
  const s = await desktop({ v: 1, room: 'river', x: 200, flags: { 'e.river': true } });
  try {
    await settleKeys(s); const r = s.scene(), hz = r.room.hazards[0];
    r.player.x = hz.from + 300; r.breath = { air: exhausted ? 0 : 1, exhausted };
    let caught = false;
    for (let t = 0; t < 2600 && !caught; t += 50) {
      const k = ((r.activeTime / hz.period) + (hz.phase ?? 0)) % 1, bx = hz.from + (hz.to - hz.from) * (k < 0.5 ? k * 2 : 2 - k * 2);
      r.player.x = bx + (bx < 850 ? 100 : -100); // beam edge 75 px away: 100 px is outside it, inside the gasp radius (and clear of the second light)
      r.breath = { air: exhausted ? 0 : 1, exhausted };
      await s.advance(50); caught = r.caughtScene;
    }
    assert.equal(caught, exhausted, exhausted ? 'out of breath is found' : 'a healthy swimmer 100 px off the beam is not');
    if (exhausted) { await s.until(() => r.dialogue?.open, 'river caught scene'); assert.match(r.dialogue.current, /white light/); await settleKeys(s); assert.equal(r.player.x, hz.reset); }
    console.log('PASS river', exhausted ? 'out of breath is found, caught scene, upstream restart' : 'healthy swimmer off the beam is safe');
  } finally { s.close(); }
}
{ // the Hound: every second miss lands the needle and shortens the next window
  const s = await simulate({ save: { v: 1, room: 'lawn2', x: 900, flags: { 'c10.beds': true, 'c10.w1': true, 'c10.w2': true, 'c10.w3': true, 'e.lawn': true, 'e.home5': true } }, lowres: true });
  try {
    await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'Continue');
    const r = s.scene(); const c = campaign(s); const windows = []; let sawNeedle = false;
    for (let i = 0; i < 4000 && !r.session.flags['c10.hound']; i++) {
      if (r.promptWait) { windows.push(r.promptWait.until - r.activeTime); if (windows.length < 4) await s.advance(2100); else await s.tap(888, 474); }
      else if (r.dialogue?.open) { if (/needle grazes/.test(r.dialogue.current)) sawNeedle = true; await s.tap(480, 450 + (r.dialogue.root?.y ?? 0)); }
      else await s.advance(100);
    }
    assert.ok(sawNeedle, 'the second miss plays the needle scene');
    assert.ok(windows[0] > 1700 && windows[1] > 1700 && windows[2] < 1700, `window shrinks after the needle: ${windows.map(Math.round)}`);
    assert.ok(r.session.flags['c10.hound'], 'a hit still ends it');
    console.log('PASS hound: second miss = needle, next window shorter', windows.map(Math.round).join('/'));
  } finally { s.close(); }
}
{ // the subway jingle: a wrong order drowns the line you missed until you read the source again
  const s = await simulate({ save: { v: 1, room: 'subway', x: 620, flags: {} }, lowres: true });
  try {
    await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'Continue'); await campaign(s).settle();
    const r = s.scene(); s.w.__qa.go(620); await s.advance(50); await s.tap(888, 474);
    for (let n = 0; n < 40 && !r.dialogue.puzzle; n++) await s.tap(480, 450);
    const p = r.dialogue.puzzle; await s.tap(480, 450);
    for (const i of [1, 0, 2, 3]) await s.tap(220 + (i % 2) * 425, 231 + Math.floor(i / 2) * 75); // a distractor first
    assert.equal(p.state.attempts, 1); assert.equal(p.state.drowned, p.def.fragments[0]);
    p.pick(p.state.cards.indexOf(p.def.fragments[0]));
    assert.equal(p.state.selected.length, 0, 'a drowned line cannot be placed');
    p.action('back'); assert.equal(p.state.drowned, undefined, 'reading the source again clears it');
    console.log('PASS subway jingle drowns the missed line until the source is read again');
  } finally { s.close(); }
}
{ // Montag mutters the room's tip once, after the second failed attempt, and never again that visit
  const s = await simulate({ save: { v: 1, room: 'boulevard', x: 400, flags: { 'e.boulevard': true, 'c11.kids': true } }, lowres: true });
  try {
    await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'Continue'); await campaign(s).settle();
    const r = s.scene();
    r.failed(); await s.advance(1500); assert.equal(r.barkTexts.length, 0, 'no tip after the first failure');
    r.failed(); await s.advance(1500); assert.equal(r.barkTexts.length, 1, 'tip after the second');
    assert.equal(r.barkTexts[0].text, r.room.failTip);
    r.barkTexts.forEach((t) => t.destroy()); r.barkTexts = [];
    r.failed(); await s.advance(1500); assert.equal(r.barkTexts.length, 0, 'the tip is not repeated');
    console.log('PASS one muttered tip after the second failure');
  } finally { s.close(); }
}
