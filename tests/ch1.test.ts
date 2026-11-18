import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, RULES, SCRIPTS } from '../src/content.ts';
import { POSE_NAMES } from '../src/art/poses.ts';
import { completedIds } from '../src/state.ts';
import type { Hotspot, Step } from '../src/content/types.ts';

// The states a player passes through in Chapter 1, in order (flags accumulate).
const path: [string, Record<string, boolean | string>][] = [
  ['burn', {}],
  ['burn', { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true }],
  ['burn', { 'c01.igniter': true, 'c01.tone': 'eager' }], // set by the choice on Beatty's nod, just before lighting
  ['station1', { 'c01.lit': true }],
  ['corner', {}],
  ['corner', { 'c02.meet': true }],
  ['corner', { 'c02.n1': 'look' }],
  ['corner', { 'c02.asked': true, 'c02.n2': 'walk', 'c02.n3': 'walk' }],
  ['home1', { 'h1.day': true }],
  ['home1', { 'c03.t1': true }],
  ['home1', { 'c03.w1': true }],
  ['home1', { 'c03.t2': true }],
  ['home1', { 'c03.t3': true }],
  ['home1', { 'c03.script': true }],
];
const VERBS = /^(Soak|Take|Light|Hang|Listen|Talk|Watch|Leave|Look|Go|Turn|Read|Say|Mildred)\b/;

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
    assert.ok(r.quietUi && r.hints, `${room} uses the quiet UI`);
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

// Applies what a hotspot would set if the player used it: its script, then its steps (branches resolved on current flags).
function use(h: Hotspot, f: Record<string, boolean | string>) {
  const say = (k: string) => Object.assign(f, SCRIPTS[k].set ?? {}, SCRIPTS[k].choices?.[0]?.set ?? {});
  const run = (steps: Step[]) => { for (const s of steps) {
    if ('say' in s) say(s.say); else if ('set' in s) Object.assign(f, s.set); else if ('if' in s) run(s.if(f) ? s.then : s.else ?? []);
  } };
  if (h.script) say(h.script);
  run(h.steps ?? []);
}

test('the walls never gate the conversation, and Challenge 3 does not need them', () => {
  const hs = ROOMS.home1.hotspots;
  for (let mask = 0; mask < 8; mask++) {
    const f: Record<string, boolean | string> = { 'h1.day': true };
    [1, 2, 3].forEach((n, i) => { if (mask & (1 << i)) f[`c03.w${n}`] = true; });
    for (const id of ['t1', 't2', 't3', 'script']) {
      const h = hs.find((x) => x.id === id)!;
      assert.ok(!h.when || h.when(f), `walls ${mask}: ${id} is available`);
      use(h, f);
    }
    assert.ok(completedIds(RULES, f).includes(3), `walls ${mask}: Challenge 3 complete without touching the remaining walls`);
    const door = hs.find((x) => x.id === 'door')!;
    assert.ok(door.requires!.every((k) => f[k]), `walls ${mask}: the door opens`);
  }
  assert.ok(!ROOMS.home1.hotspots.some((h) => /^x\d$/.test(h.id)), 'no "she cannot hear you" interruptions');
});

test('every legacy save made partway through the parlor can still finish the chapter', () => {
  const hs = ROOMS.home1.hotspots, tk = ['c03.t1', 'c03.t2', 'c03.t3'];
  let states = 0;
  for (let mask = 0; mask < 8; mask++) for (let t = 0; t <= 3; t++) for (const script of t === 3 ? [false, true] : [false]) {
    // what an old (wall-gated) build could have saved: any walls, a prefix of the three talks, the script after the third
    const f: Record<string, boolean | string> = { 'h1.day': true, 'e.home1': true };
    [1, 2, 3].forEach((n, i) => { if (mask & (1 << i)) f[`c03.w${n}`] = true; });
    tk.slice(0, t).forEach((k) => { f[k] = true; });
    if (script) f['c03.script'] = true;
    for (let guard = 0; guard < 10; guard++) {
      const next = hs.find((h) => h.required && h.id !== 'door' && (!h.when || h.when(f)));
      if (!next) break;
      use(next, f);
    }
    assert.ok(hs.find((x) => x.id === 'door')!.requires!.every((k) => f[k]), `legacy ${JSON.stringify(f)} reaches the door`);
    assert.ok(completedIds(RULES, f).includes(3));
    states++;
  }
  assert.equal(states, 40);
});

test('Chapter 1 poses exist, set-piece subtitles fit the letterbox, and the Hound stays ambient', () => {
  const ch1 = ['burn', 'station1', 'corner', 'home1'];
  const lines = Object.entries(SCRIPTS).filter(([k]) => /^(b_|s1_|c_|h_|m_)/.test(k));
  for (const [k, sc] of lines) {
    for (const l of [...sc.lines, ...(sc.choices ?? []).flatMap((c) => c.reply ?? [])]) {
      if (l.pose) assert.ok(POSE_NAMES.includes(l.pose), `${k}: unknown pose ${l.pose}`);
      if (sc.sub) assert.ok(l.text.length + l.who.length <= 84, `${k}: subtitle too long for one bar line "${l.text}"`);
      assert.ok(!/needle|like anybody|doesn't like/i.test(l.text), `${k}: the Hound's menace belongs to Chapter 2 ("${l.text}")`);
    }
  }
  const steps = (ss: Step[]): Step[] => ss.flatMap((s) => 'if' in s ? [...steps(s.then), ...steps(s.else ?? [])] : [s]);
  for (const id of ch1) {
    const r = ROOMS[id];
    for (const n of r.npcs ?? []) {
      if (n.gesture) assert.ok(POSE_NAMES.includes(n.gesture.p));
      const p = n.pose?.({}); if (p) assert.ok(POSE_NAMES.includes(p));
    }
    for (const h of r.hotspots) for (const s of steps([...(h.steps ?? []), ...(r.enter ?? []).flatMap((e) => e.steps)])) {
      if ('pose' in s && s.p) assert.ok(POSE_NAMES.includes(s.p), `${id}/${h.id}: unknown pose ${s.p}`);
    }
  }
});

test('the way out of the parlor passes through the rain walk, and a save made in the rain can still reach the firehouse', () => {
  assert.equal(ROOMS.home1.hotspots.find((h) => h.id === 'door')!.exit!.room, 'rain');
  const goes = (ROOMS.rain.enter ?? []).flatMap((e) => e.steps).some((s) => 'goto' in s && s.goto === 'station2');
  assert.ok(goes, 'the walk ends at the firehouse by itself');
  const out = ROOMS.rain.hotspots.find((h) => h.exit?.room === 'station2');
  assert.ok(out && !out.requires && (!out.when || out.when({})), 'a resumed save has an open way on');
  assert.ok(ROOMS.rain.chapter === 1 && ROOMS.station2.chapter === 2, 'the chapter card still plays on the way into the firehouse');
});
