// Input regression suite: desktop keyboard vs touch, holds, interruptions, and choice arming.
// Runs the real bundled game (Phaser Canvas renderer) under deterministic time. Not a physical device.
import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';

const results = [];
async function check(name, fn) {
  try { await fn(); results.push(['PASS', name]); console.log('PASS', name); }
  catch (e) { results.push(['FAIL', name]); console.log('FAIL', name, '\n  ', e.message); }
}

async function desktop(save, extra = {}) {
  const s = await simulate({ width: 1366, height: 768, dpr: 1, lowres: true, touchDevice: false, save, ...extra });
  await s.advance(700); await s.key('Enter'); await s.key('Enter', false);
  await s.until(() => s.scene().sys.settings.key === 'room', 'desktop Continue');
  return s;
}
/** Let cutscenes and dialogue finish by pressing E like a player would (desktop). */
async function settleKeys(s, maxMs = 60000) {
  for (let t = 0; t < maxMs; t += 150) {
    const r = s.scene();
    if (r.sys.settings.key !== 'room' || (r.mode === 'play' && !r.stillWatch)) return;
    if (r.dialogue?.choosing) { await s.advance(450); }
    await s.key('KeyE'); await s.key('KeyE', false); await s.advance(110);
  }
  throw new Error(`unsettled ${s.scene().room?.id}/${s.scene().mode}`);
}
const visibleTouchUi = (r) => !!r.hud.touchUi?.visible;
const promptKey = (r) => r.prompt.list.find((o) => o.name === 'key')?.text;
const noAct = (str) => !/\bACT\b|\bTAP\b/.test(str ?? '');

// ---------- desktop: controls, labels, holds ----------
await check('desktop: no touch arrows/ACT button; prompt, hint and objective say E, never ACT', async () => {
  const s = await desktop({ v: 1, room: 'burn', x: 900, flags: { 'e.burn': true } });
  try {
    const r = s.scene(); await settleKeys(s); await s.advance(300);
    assert.equal(visibleTouchUi(r), false, 'touch controls hidden on desktop');
    assert.equal(promptKey(r), 'E');
    assert.ok(noAct(r.controlHint.text), r.controlHint.text);
    assert.ok(noAct(r.hud.objective.text), r.hud.objective.text);
    assert.ok(/Hold E/.test(r.hud.objective.text), r.hud.objective.text);
  } finally { s.close(); }
});

await check('desktop: holding E continuously at the hose always finishes (no dead end)', async () => {
  const s = await desktop({ v: 1, room: 'burn', x: 900, flags: { 'e.burn': true } });
  try {
    const r = s.scene(); await settleKeys(s);
    await s.key('KeyE');
    let last = -1;
    for (let i = 0; i < 12 && !r.session.flags['c01.p1']; i++) {
      await s.advance(500);
      const p = r.session.flags['c01.p1'] ? Infinity : r.hose.progress;
      assert.ok(p > last, `progress stalled at ${r.hose.progress} (pressure ${r.hose.pressure.toFixed(2)})`);
      last = p;
    }
    await s.key('KeyE', false);
    assert.equal(r.session.flags['c01.p1'], true);
    assert.equal(r.mode, 'play');
  } finally { s.close(); }
});

await check('desktop: releasing E early keeps partial progress and does not complete', async () => {
  const s = await desktop({ v: 1, room: 'burn', x: 900, flags: { 'e.burn': true } });
  try {
    const r = s.scene(); await settleKeys(s);
    await s.key('KeyE'); await s.advance(900); await s.key('KeyE', false);
    const kept = r.hose.progress; await s.advance(1500);
    assert.ok(kept > 0 && !r.session.flags['c01.p1']);
    assert.equal(r.hose.progress, kept, 'progress kept after release');
    assert.equal(r.keys.act[0].isDown, false);
  } finally { s.close(); }
});

await check('desktop: another key during a hold, then release: no stuck input', async () => {
  const s = await desktop({ v: 1, room: 'burn', x: 900, flags: { 'e.burn': true } });
  try {
    const r = s.scene(); await settleKeys(s);
    await s.key('KeyE'); await s.advance(300); await s.key('KeyD'); await s.advance(400); await s.key('KeyD', false); await s.key('KeyE', false);
    await s.advance(1000);
    assert.equal(r.mode, 'play'); assert.equal(r.keys.act[0].isDown, false); assert.equal(r.vx, 0);
  } finally { s.close(); }
});

await check('desktop: losing focus while holding E freezes, releases the key, and resumes cleanly', async () => {
  const s = await desktop({ v: 1, room: 'burn', x: 900, flags: { 'e.burn': true } });
  try {
    const r = s.scene(); await settleKeys(s);
    await s.key('KeyE'); await s.advance(400);
    s.game.events.emit('blur'); await s.advance(100);
    await s.key('KeyE', false); await s.advance(300);
    const button = s.w.document.querySelector('#focus-resume'); assert.ok(button, 'focus guard shown');
    button.click(); await s.advance(1500);
    assert.equal(r.keys.act[0].isDown, false); assert.equal(r.mode, 'play');
    const p = r.hose.progress; await s.advance(1000); assert.equal(r.hose.progress, p, 'no phantom hold after resume');
  } finally { s.close(); }
});

await check('desktop: pausing while holding E stops the hold; resume needs a fresh press', async () => {
  const s = await desktop({ v: 1, room: 'burn', x: 900, flags: { 'e.burn': true } });
  try {
    const r = s.scene(); await settleKeys(s);
    await s.key('KeyE'); await s.advance(400);
    await s.key('Escape'); await s.key('Escape', false); assert.equal(r.mode, 'pause');
    const p = r.hose.progress; await s.advance(2000); assert.equal(r.hose.progress, p, 'pause freezes hose');
    await s.key('KeyE', false);
    await s.key('Escape'); await s.key('Escape', false); assert.equal(r.mode, 'play');
    await s.advance(1000); assert.equal(r.hose.progress, p, 'no hold after resume without a new press');
  } finally { s.close(); }
});

await check('desktop: rapid E taps on a normal hotspot open one conversation and return to play', async () => {
  const s = await desktop({ v: 1, room: 'station1', x: 620, flags: { 'e.station1': true, 'c01.lit': true } });
  try {
    const r = s.scene(); await settleKeys(s);
    for (let i = 0; i < 8; i++) { await s.key('KeyE'); await s.key('KeyE', false); }
    await settleKeys(s);
    assert.equal(r.mode, 'play');
  } finally { s.close(); }
});

await check('desktop: E held through a room change leaves the next room playable', async () => {
  const s = await desktop({ v: 1, room: 'station1', x: 2250, flags: { 'e.station1': true, 'c01.lit': true } });
  try {
    await settleKeys(s);
    await s.key('KeyE'); // walk out, keep holding
    await s.until(() => s.scene().room?.id === 'corner', 'room change', 10000);
    await s.advance(1500); await s.key('KeyE', false);
    const r = s.scene(); await settleKeys(s);
    assert.equal(r.mode, 'play'); assert.equal(r.keys.act[0].isDown, false);
  } finally { s.close(); }
});

await check('desktop: mashing E through a puzzle never picks the right answer for you', async () => {
  const s = await desktop({ v: 1, room: 'home2', x: 900, flags: {} });
  try {
    const r = s.scene(); let wrong = 0, sawChoices = false;
    for (let t = 0; t < 60000 && !r.session.flags['c05.done']; t += 120) {
      if (r.dialogue.choosing) {
        sawChoices = true;
        const before = r.dialogue.options[r.dialogue.sel];
        await s.key('KeyE'); await s.key('KeyE', false);
        if (!r.dialogue.choosing && /Let her/.test(before)) wrong++;
        if (wrong >= 3) break;
      } else { await s.key('KeyE'); await s.key('KeyE', false); }
      await s.advance(80);
    }
    assert.ok(sawChoices, 'reached the pillow choices');
    assert.ok(wrong >= 3, `wrong picks repeated (${wrong}); cursor stays on the chosen row`);
    assert.equal(r.session.flags['c05.done'], undefined, 'mashing never completes the puzzle');
    assert.equal(r.dialogue.sel, 0, 'cursor did not jump to another option');
  } finally { s.close(); }
});

await check('desktop: a confirm press within 400 ms of choices appearing is ignored', async () => {
  const s = await desktop({ v: 1, room: 'home2', x: 900, flags: {} });
  try {
    const r = s.scene();
    for (let t = 0; t < 60000 && !r.dialogue.choosing; t += 150) { await s.key('KeyE'); await s.key('KeyE', false); await s.advance(100); }
    assert.ok(r.dialogue.choosing);
    await s.key('KeyE'); await s.key('KeyE', false); // a carry-over press from the previous line
    assert.ok(r.dialogue.choosing, 'still choosing: early press ignored');
  } finally { s.close(); }
});

// ---------- touch and hybrid ----------
await check('touch: controls appear in play and hide in dialogue; prompt says ACT', async () => {
  const s = await simulate({ save: { v: 1, room: 'station1', x: 620, flags: { 'e.station1': true, 'c01.lit': true } }, lowres: true });
  try {
    await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'touch Continue');
    const r = s.scene(); await campaign(s).settle(); await s.advance(300);
    assert.equal(visibleTouchUi(r), true); assert.equal(promptKey(r), 'ACT');
    await s.tap(888, 474); assert.equal(r.mode !== 'play', true); assert.equal(visibleTouchUi(r), false);
  } finally { s.close(); }
});

await check('hybrid: desktop shows touch controls after a real touch and hides them after a key press', async () => {
  const s = await desktop({ v: 1, room: 'station1', x: 900, flags: { 'e.station1': true, 'c01.lit': true } });
  try {
    const r = s.scene(); await settleKeys(s); await s.advance(200);
    assert.equal(visibleTouchUi(r), false);
    await s.touch('touchstart', 480, 250); await s.touch('touchend', 480, 250); await s.advance(50);
    assert.equal(visibleTouchUi(r), true); assert.equal(promptKey(r) ?? 'ACT', 'ACT');
    await s.key('KeyD'); await s.key('KeyD', false); await s.advance(50);
    assert.equal(visibleTouchUi(r), false);
  } finally { s.close(); }
});

await check('manual setting: Controls = KEYBOARD hides touch UI even on a touch device', async () => {
  const s = await simulate({ save: { v: 1, room: 'station1', x: 900, flags: { 'e.station1': true, 'c01.lit': true } }, lowres: true, options: { inputMode: 'keyboard' } });
  try {
    await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'Continue');
    const r = s.scene(); await campaign(s).settle(); await s.advance(200);
    assert.equal(visibleTouchUi(r), false); assert.equal(promptKey(r) ?? 'E', 'E');
  } finally { s.close(); }
});

const failed = results.filter(([r]) => r === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} input checks passed`);
if (failed) process.exit(1);
