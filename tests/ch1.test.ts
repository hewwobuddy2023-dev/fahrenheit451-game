import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, SCRIPTS } from '../src/content.ts';

// The states a player passes through in Chapter 1, in order (flags accumulate).
const path: [string, Record<string, boolean | string>][] = [
  ['burn', {}],
  ['burn', { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true }],
  ['burn', { 'c01.igniter': true, 'c01.tone': 'eager' }],
  ['station1', { 'c01.lit': true }],
  ['corner', {}],
  ['corner', { 'c02.meet': true }],
  ['corner', { 'c02.n1': 'look' }],
  ['corner', { 'c02.asked': true, 'c02.n2': 'walk', 'c02.n3': 'walk' }],
  ['home1', { 'h1.day': true }],
  ['home1', { 'c03.w1': true }],
  ['home1', { 'c03.t1': true, 'c03.w2': true }],
  ['home1', { 'c03.t2': true, 'c03.w3': true }],
  ['home1', { 'c03.t3': true }],
  ['home1', { 'c03.script': true }],
];
const VERBS = /^(Soak|Take|Light|Hang|Listen|Talk|Watch|Leave|Look|Go|Turn|Read|Mildred)\b/;

test('Chapter 1 objectives state an intention and never a counter', () => {
  const f: Record<string, boolean | string> = {};
  for (const [room, add] of path) {
    Object.assign(f, add);
    const o = ROOMS[room].objective(f);
    assert.ok(!/\d\s*\/\s*\d/.test(o), `${room}: counter in objective "${o}"`);
    assert.ok(o.length <= 60, `${room}: objective too long "${o}"`);
  }
});

test('Chapter 1 hints escalate in three steps and never point at finished work', () => {
  const f: Record<string, boolean | string> = {};
  for (const [room, add] of path) {
    Object.assign(f, add);
    const r = ROOMS[room];
    assert.ok(r.quietUi && r.hints, `${room} uses the redesigned UI`);
    const h = r.hints!(f);
    assert.equal(h.length, 3);
    h.forEach((s) => assert.ok(s.length > 10 && s.length <= 140, `${room}: hint length "${s}"`));
    if (f['c01.p3']) h.forEach((s) => assert.ok(!/Soak the books|hold \[E\]/i.test(s), `burn hint after soaking: "${s}"`));
    if (f['c03.t3']) h.forEach((s) => assert.ok(!/Turn a wall down/i.test(s), `parlor hint after the walls: "${s}"`));
  }
});

test('Chapter 1 prompts use semantic verbs; the pressure hose is gone', () => {
  for (const id of ['burn', 'station1', 'corner', 'home1']) {
    for (const h of ROOMS[id].hotspots) {
      if (h.label) assert.match(h.label, VERBS, `${id}/${h.id}: "${h.label}"`);
      assert.ok(!h.hold?.pressure, `${id}/${h.id}: pressure mechanic must not return to Chapter 1`);
    }
  }
  const holds = ROOMS.burn.hotspots.filter((h) => h.hold);
  assert.equal(holds.length, 1, 'one pour, not three repeated holds');
});

test('the parlor blocks each serious subject until enough walls are down, and interruptions set nothing', () => {
  const hs = ROOMS.home1.hotspots, f: Record<string, boolean | string> = { 'h1.day': true };
  const active = (id: string) => { const h = hs.find((x) => x.id === id)!; return !h.when || h.when(f); };
  assert.ok(active('x1') && !active('t1'), 'walls up: only the interrupted conversation');
  f['c03.w2'] = true; assert.ok(active('t1') && !active('x1'));
  f['c03.t1'] = true; assert.ok(active('x2') && !active('t2'), 'one wall down is not enough for the second subject');
  for (const k of ['m_x1', 'm_x2', 'm_x3']) assert.equal(SCRIPTS[k].set, undefined, `${k} must not advance the story`);
});
