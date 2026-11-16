import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS } from '../src/content.ts';
import { MUSE } from '../src/content/muse.ts';
import { laneReadout, placeLine, reachDistance } from '../src/guidance.ts';
import type { Flags } from '../src/state.ts';

// Every flag a room's objective or thinking-aloud lines read, so each state can be tried exhaustively.
function flagsRead(...fns: Function[]): string[] {
  const keys = new Set<string>();
  for (const fn of fns) for (const m of fn.toString().matchAll(/f\['([^']+)'\]/g)) keys.add(m[1]);
  return [...keys].sort();
}
/** Every true/false combination of the given flags. */
function states(keys: string[]): Flags[] {
  const out: Flags[] = [];
  for (let mask = 0; mask < 1 << keys.length; mask++) {
    const f: Flags = {};
    keys.forEach((k, i) => { if (mask & (1 << i)) f[k] = true; });
    out.push(f);
  }
  return out;
}
const roomIds = Object.keys(ROOMS);

test('every room has a non-empty objective in every flag state it reads', () => {
  for (const id of roomIds) {
    const r = ROOMS[id];
    const keys = flagsRead(r.objective);
    assert.ok(keys.length <= 10, `${id}: too many flags to enumerate (${keys.length})`);
    for (const f of states(keys)) {
      const o = r.objective(f);
      assert.ok(o && o.trim().length > 0, `${id}: empty objective with ${JSON.stringify(f)}`);
    }
  }
});

test('every room has thinking-aloud lines in every state it reads', () => {
  for (const id of roomIds) {
    assert.ok(MUSE[id], `${id}: no thinking-aloud lines`);
    for (const f of states(flagsRead(MUSE[id]))) {
      const lines = MUSE[id](f);
      assert.equal(lines.length, 4, `${id}: four lines`);
      assert.ok(lines.every((l) => l.trim().length > 8), `${id}: short or empty line`);
      assert.ok(new Set(lines.map((l) => l.replace(/\{dir\}/, '').trim())).size >= 3, `${id}: needs three distinct lines`);
    }
  }
});

test('direction is named relative to Montag and never leaves a placeholder', () => {
  assert.equal(placeLine('The books. {dir}', 500, 300, false), 'The books. Back to the left.');
  assert.equal(placeLine('The books. {dir}', 300, 900, false), 'The books. Ahead to the right.');
  assert.equal(placeLine('The books. {dir}', 900, 905, true), 'The books. Right here.');
  assert.equal(placeLine('Stay still. {dir}', 900, undefined, false), 'Stay still.');
  for (const id of roomIds) for (const l of MUSE[id]({})) assert.ok(!/\{dir\}/.test(placeLine(l, 400, 800, false)), `${id}: placeholder left in "${l}"`);
});

test('the burn soak zone covers all three piles and the light stays in reach too', () => {
  const douse = ROOMS.burn.hotspots.find((h) => h.id === 'douse')!;
  const light = ROOMS.burn.hotspots.find((h) => h.id === 'light')!;
  for (const x of [880, 1000, 1100, 1250]) {
    assert.equal(reachDistance(x, douse), 0, `douse in reach at ${x}`);
    assert.equal(reachDistance(x, light), 0, `light in reach at ${x}`);
  }
  assert.ok(reachDistance(1400, douse) > 70, 'out of reach past the piles');
});

test('the alley readout comes from its own hazard, not the boulevard text', () => {
  for (const hz of ROOMS.run.hazards ?? []) {
    const label = laneReadout(hz, true, false) + laneReadout(hz, false, true) + laneReadout(hz, false, false);
    assert.ok(!/ISLAND|LANE|CAR/.test(label), `${hz.id}: boulevard words in the alley: ${label}`);
  }
  for (const hz of ROOMS.boulevard.hazards ?? []) assert.match(laneReadout(hz, true, false), /CAR/);
});
