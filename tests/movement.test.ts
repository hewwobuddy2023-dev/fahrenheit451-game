import assert from 'node:assert/strict';
import test from 'node:test';
import { SPEED, snapScroll, stepCamera, stepVelocity, walkTimeScale } from '../src/movement.ts';

const run = (dir: number, secs: number, fps: number, vx = 0) => {
  for (let i = 0; i < secs * fps; i++) vx = stepVelocity(vx, dir, SPEED, 1 / fps);
  return vx;
};

test('walker reaches speed quickly and stops in a short skid, at any frame rate', () => {
  for (const fps of [60, 15, 7]) {
    assert.ok(run(1, 0.3, fps) > SPEED * 0.95, `start @${fps}`);
    assert.equal(run(0, 0.3, fps, SPEED), 0, `stop @${fps}`);
    assert.ok(run(-1, 0.15, fps, SPEED) < 0, `turn @${fps}`);
  }
});

test('camera holds still after the player stops and while turning in place', () => {
  let c = { cx: 480, look: 0 };
  for (let i = 0; i < 120; i++) c = stepCamera(c, 480 + i * 3, 180, 1 / 60, 3000, 960, null);
  const px = 480 + 120 * 3;
  for (let i = 0; i < 180; i++) c = stepCamera(c, px, 0, 1 / 60, 3000, 960, null);
  const settled = c.cx;
  for (let i = 0; i < 120; i++) c = stepCamera(c, px, 0, 1 / 60, 3000, 960, null);
  assert.ok(Math.abs(c.cx - settled) < 0.5, 'no glide after stop');
});

test('camera stays inside the room and framing overrides follow', () => {
  const c = stepCamera({ cx: 480, look: 0 }, 5, -200, 1, 1500, 960, null);
  assert.ok(c.cx >= 480);
  const f = stepCamera({ cx: 480, look: 0 }, 5, 0, 10, 1500, 960, 900);
  assert.ok(f.cx > 890);
});

test('walk animation speed follows ground speed; scroll snaps to device pixels', () => {
  assert.ok(walkTimeScale(2 * SPEED, 0.85, 212) > walkTimeScale(SPEED, 0.85, 212));
  assert.equal(snapScroll(10.37, 1.5) * 1.5, Math.round(10.37 * 1.5));
});
