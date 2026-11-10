import assert from 'node:assert/strict';
import { simulate } from './support/simulation.mjs';
import { campaign } from './support/campaign.mjs';

const s = await simulate({ save: { v: 1, room: 'run', x: 150, flags: { 'e.run': true } } });
try {
  await s.advance(700); await s.tap(430, 282); await s.until(() => s.scene().sys.settings.key === 'room', 'run Continue');
  await campaign(s).settle();
  const r = s.scene();
  s.game.events.emit('blur');
  const start = r.time.now;
  await s.advance(40000);
  assert.equal(r.time.now, start, 'backgrounding must freeze the scene clock and timed escape');
  assert.equal(r.caughtAt, 0);
  assert.ok(s.w.document.querySelector('#focus-resume'));
  s.w.document.querySelector('#focus-resume').click();
  await s.advance(500);
  assert.equal(r.mode, 'play');
  assert.equal(r.caughtAt, 0);
  console.log('PASS focus loss freezes timers, explicit resume cannot skip an encounter');
} finally { s.close(); }
