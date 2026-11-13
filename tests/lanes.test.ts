import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossMs, inLane, laneState, MARGIN, WARN_MS } from '../src/gameplay/lanes.ts';
import { ROOMS } from '../src/content.ts';

const LIMP = 175 * 0.72;

for (const id of ['boulevard', 'run']) {
  const hazards = (ROOMS[id].hazards ?? []).filter((h) => h.pulse);
  test(`${id}: warning is longer than crossing a lane, so a warned player is never trapped`, () => {
    for (const h of hazards) assert.ok(WARN_MS > crossMs(h, LIMP), `${h.id}: warn ${WARN_MS} <= cross ${crossMs(h, LIMP).toFixed(0)}`);
  });
  test(`${id}: every lane has a dark window that fits a crossing, and islands between lanes are safe`, () => {
    for (const h of hazards) assert.ok(h.period - (h.pulse ?? 0) > crossMs(h, LIMP) + 300, h.id);
    const sorted = [...hazards].sort((a, b) => a.from - b.from);
    for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].from - MARGIN - (sorted[i - 1].to + MARGIN) >= 40, `island before ${sorted[i].id}`);
  });
  test(`${id}: being caught returns you to the safe spot just before that lane`, () => {
    for (const h of hazards) {
      assert.ok(h.reset < h.from - MARGIN, `${h.id} reset is outside the lane`);
      for (const o of hazards) assert.ok(!inLane(o, h.reset), `${h.id} reset ${h.reset} lies inside ${o.id}`);
      const behind = hazards.filter((o) => o.to < h.from).map((o) => o.to);
      if (behind.length) assert.ok(h.reset > Math.max(...behind), `${h.id} resets past earlier lanes`);
    }
  });
}

test('lane state: lit window, warning window and collision are exact', () => {
  const l = { from: 100, to: 190, period: 3600, pulse: 1000 };
  assert.equal(laneState(l, 0).lit, true);
  assert.equal(laneState(l, 999).lit, true);
  assert.equal(laneState(l, 1001).lit, false);
  assert.equal(laneState(l, 3600 - WARN_MS - 5).warn, false);
  assert.equal(laneState(l, 3600 - WARN_MS + 5).warn, true);
  assert.ok(inLane(l, 100 - MARGIN + 1) && !inLane(l, 100 - MARGIN));
  assert.equal(laneState({ ...l, phase: -0.25 }, 900).lit, true, 'negative phase wraps');
});

test('a player who enters a lane the moment its warning starts always clears it', () => {
  for (const h of (ROOMS.boulevard.hazards ?? []).filter((x) => x.pulse)) {
    // find the instant the warning begins, then walk across at limping speed
    let t = 0; while (!laneState(h, t).lit) t += 5; while (!laneState(h, t).warn) t += 5; // the warning's first instant
    for (let x = h.from - MARGIN, time = t; x < h.to + MARGIN; x += LIMP / 100, time += 10) {
      assert.ok(!(laneState(h, time).lit && inLane(h, x)), `${h.id} caught at x=${x.toFixed(0)}`);
    }
  }
});
