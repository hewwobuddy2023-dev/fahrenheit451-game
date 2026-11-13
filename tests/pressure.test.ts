import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hoseStep } from '../src/gameplay/pressure.ts';

const fresh = () => ({ pressure: 0, progress: 0, overheated: false });
const timeTo = (held: (t: number) => boolean, dt = 1 / 60) => {
  let s = fresh(), t = 0;
  while (s.progress < 1500 && t < 30) { s = hoseStep(s, held(t), dt, 1500); t += dt; }
  return t;
};

test('a continuous hold never stalls: progress rises in every half second, even overheated', () => {
  let s = fresh();
  for (let i = 0; i < 16 && s.progress < 1500; i++) {
    const before = s.progress;
    s = hoseStep(s, true, 0.5, 1500);
    assert.ok(s.progress > before, `stalled at ${i * 0.5}s (pressure ${s.pressure.toFixed(2)})`);
  }
  assert.equal(s.progress, 1500);
});

test('venting is the skilful, faster way; release keeps progress', () => {
  const continuous = timeTo(() => true);
  const pulsed = timeTo((t) => (t % 1.25) < 1);
  assert.ok(pulsed < continuous, `pulsed ${pulsed.toFixed(2)}s should beat held ${continuous.toFixed(2)}s`);
  let s = hoseStep(fresh(), true, 3, 1500);
  const kept = s.progress;
  s = hoseStep(s, false, 2, 1500);
  assert.equal(s.progress, kept);
  assert.equal(s.overheated, false);
});

test('hose response is delta-consistent at 10–60 FPS, and assisted hold remains available', () => {
  const run = (dt: number) => { let s = fresh(); for (let time = 0; time < 6; time += dt) s = hoseStep(s, (time % 1.25) < 1, dt, 1500); return s; };
  for (const dt of [1 / 60, 1 / 30, 1 / 10]) assert.equal(run(dt).progress, 1500);
  assert.equal(hoseStep(fresh(), true, 2, 1500, true).progress, 1500);
});
