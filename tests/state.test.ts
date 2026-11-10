import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSave, writeSave, isComplete, completedIds, Session, SAVE_KEY } from '../src/state.ts';
import { CHALLENGES, RULES, ROOMS, SCRIPTS, CHAPTER_STARTS } from '../src/content.ts';
import type { Step } from '../src/content/types.ts';

// Raise as chapters land. Rules up to this challenge id must be fully achievable from the content.
const IMPLEMENTED = Number(process.env.F451_IMPLEMENTED ?? 6);

function memStore(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    m,
  };
}

test('corrupted or foreign saves load as null instead of crashing', () => {
  for (const raw of ['{not json', 'null', '[]', '{"v":2,"room":"burn","x":1,"flags":{}}',
    '{"v":1,"room":"burn","x":"9","flags":{}}', '{"v":1,"room":"burn","x":1,"flags":[]}',
    '{"v":1,"room":"burn","x":1,"flags":{"a":{"nested":1}}}']) {
    assert.equal(loadSave(memStore({ [SAVE_KEY]: raw })), null, raw);
  }
  assert.equal(loadSave(memStore()), null);
});

test('save round-trips and blocked storage does not throw', () => {
  const s = memStore();
  assert.ok(writeSave({ v: 1, room: 'burn', x: 512, flags: { 'c01.p1': true, 'c01.tone': 'eager' } }, s));
  assert.deepEqual(loadSave(s), { v: 1, room: 'burn', x: 512, flags: { 'c01.p1': true, 'c01.tone': 'eager' } });
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); }, removeItem() {} };
  assert.equal(loadSave(broken), null);
  assert.equal(writeSave({ v: 1, room: 'burn', x: 0, flags: {} }, broken), false);
});

test('challenge 01 needs all three piles and the ignition', () => {
  const rule = RULES.find((r) => r.id === 1)!;
  assert.equal(isComplete(rule, { 'c01.lit': true }), false);
  assert.equal(isComplete(rule, { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true }), false);
  assert.equal(isComplete(rule, { 'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true }), true);
  assert.deepEqual(completedIds(RULES, {}), []);
});

test('demo sessions never write progress to storage', () => {
  const s = memStore();
  const demo = new Session({ v: 1, room: 'burn', x: 0, flags: {} }, true, s);
  demo.set({ 'c01.lit': true });
  demo.checkpoint('burn', 100);
  assert.equal(s.m.size, 0);
  const real = new Session({ v: 1, room: 'burn', x: 0, flags: {} }, false, s);
  real.set({ 'c01.p1': true });
  real.checkpoint('burn', 100.6);
  assert.deepEqual(loadSave(s)?.flags, { 'c01.p1': true });
  assert.equal(loadSave(s)?.x, 101);
});

function walkSteps(steps: Step[] | undefined, visit: (s: Step) => void) {
  for (const s of steps ?? []) { visit(s); if ('if' in s) { walkSteps(s.then, visit); walkSteps(s.else, visit); } }
}

/** Every flag any script, choice, hold or cutscene can set. */
function settableFlags() {
  const out = new Set<string>();
  for (const s of Object.values(SCRIPTS)) {
    Object.keys(s.set ?? {}).forEach((k) => out.add(k));
    s.choices?.forEach((c) => Object.keys(c.set ?? {}).forEach((k) => out.add(k)));
  }
  for (const r of Object.values(ROOMS)) {
    for (const h of r.hotspots) { if (h.hold) out.add(h.hold.flag); walkSteps(h.steps, (s) => { if ('set' in s) Object.keys(s.set).forEach((k) => out.add(k)); }); }
    for (const e of r.enter ?? []) { out.add(e.key); walkSteps(e.steps, (s) => { if ('set' in s) Object.keys(s.set).forEach((k) => out.add(k)); }); }
  }
  return out;
}

test('15 challenges are listed and every implemented rule can be completed', () => {
  assert.deepEqual(CHALLENGES.map((c) => c.id), Array.from({ length: 15 }, (_, i) => i + 1));
  assert.deepEqual(RULES.map((r) => r.id), Array.from({ length: 15 }, (_, i) => i + 1));
  const settable = settableFlags();
  for (const r of RULES.filter((r) => r.id <= IMPLEMENTED)) r.required.forEach((f) => assert.ok(settable.has(f), `rule ${r.id}: nothing sets ${f}`));
});

test('every script, room and step reference exists; lines fit the dialogue box', () => {
  for (const [key, s] of Object.entries(SCRIPTS)) {
    for (const l of s.lines) assert.ok(l.text.length <= 200, `${key}: line too long`);
    s.choices?.forEach((c) => { if (c.next) assert.ok(SCRIPTS[c.next], `${key}: next ${c.next}`); c.reply?.forEach((l) => assert.ok(l.text.length <= 200)); });
  }
  for (const room of Object.values(ROOMS)) {
    const check = (s: Step) => {
      if ('say' in s) assert.ok(SCRIPTS[s.say], `${room.id}: missing script ${s.say}`);
      if ('goto' in s) assert.ok(ROOMS[s.goto], `${room.id}: missing room ${s.goto}`);
      if ('prompt' in s) assert.ok(SCRIPTS[s.miss], `${room.id}: missing ${s.miss}`);
    };
    for (const h of room.hotspots) {
      for (const key of [h.script, h.doneScript, h.lockedScript, h.watchedScript]) if (key) assert.ok(SCRIPTS[key], `${room.id}/${h.id}: missing ${key}`);
      if (h.exit) assert.ok(ROOMS[h.exit.room], `${room.id}/${h.id}: missing room ${h.exit.room}`);
      assert.ok(h.x > 0 && h.x < room.width, `${room.id}/${h.id} outside room`);
      walkSteps(h.steps, check);
    }
    for (const e of room.enter ?? []) walkSteps(e.steps, check);
  }
});

test('every room is reachable from the opening', () => {
  const seen = new Set<string>([CHAPTER_STARTS[0].room]);
  const queue = [CHAPTER_STARTS[0].room];
  while (queue.length) {
    const r = ROOMS[queue.shift()!];
    const next: string[] = [];
    for (const h of r.hotspots) { if (h.exit) next.push(h.exit.room); walkSteps(h.steps, (s) => { if ('goto' in s) next.push(s.goto); }); }
    for (const e of r.enter ?? []) walkSteps(e.steps, (s) => { if ('goto' in s) next.push(s.goto); });
    for (const n of next) if (!seen.has(n)) { seen.add(n); queue.push(n); }
  }
  for (const id of Object.keys(ROOMS)) assert.ok(seen.has(id), `${id} unreachable`);
});
