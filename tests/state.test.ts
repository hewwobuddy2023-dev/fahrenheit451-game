import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSave, writeSave, isComplete, completedIds, Session, SAVE_KEY } from '../src/state.ts';
import { CHALLENGES, RULES, ROOMS, SCRIPTS } from '../src/content.ts';

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
  for (const raw of ['{not json', 'null', '[]', '{"v":2,"room":"station","x":1,"flags":{}}',
    '{"v":1,"room":"station","x":"9","flags":{}}', '{"v":1,"room":"station","x":1,"flags":[]}',
    '{"v":1,"room":"station","x":1,"flags":{"a":{"nested":1}}}']) {
    assert.equal(loadSave(memStore({ [SAVE_KEY]: raw })), null, raw);
  }
  assert.equal(loadSave(memStore()), null);
});

test('save round-trips and blocked storage does not throw', () => {
  const s = memStore();
  assert.ok(writeSave({ v: 1, room: 'station', x: 512, flags: { 'c01.rack': true, 'c01.tone': 'curious' } }, s));
  assert.deepEqual(loadSave(s), { v: 1, room: 'station', x: 512, flags: { 'c01.rack': true, 'c01.tone': 'curious' } });
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); }, removeItem() {} };
  assert.equal(loadSave(broken), null);
  assert.equal(writeSave({ v: 1, room: 'station', x: 0, flags: {} }, broken), false);
});

test('challenge 01 needs both inspections plus the acknowledgement, not dialogue alone', () => {
  const rule = RULES.find((r) => r.id === 1)!;
  assert.equal(isComplete(rule, { 'c01.ack': true }), false);
  assert.equal(isComplete(rule, { 'c01.rack': true, 'c01.pump': true }), false);
  assert.equal(isComplete(rule, { 'c01.rack': true, 'c01.pump': true, 'c01.ack': true }), true);
  assert.deepEqual(completedIds(RULES, {}), []);
});

test('demo sessions never write progress to storage', () => {
  const s = memStore();
  const demo = new Session({ v: 1, room: 'station', x: 0, flags: {} }, true, s);
  demo.set({ 'c01.ack': true });
  demo.checkpoint('station', 100);
  assert.equal(s.m.size, 0);
  const real = new Session({ v: 1, room: 'station', x: 0, flags: {} }, false, s);
  real.set({ 'c01.rack': true });
  real.checkpoint('station', 100.6);
  assert.deepEqual(loadSave(s)?.flags, { 'c01.rack': true });
  assert.equal(loadSave(s)?.x, 101);
});

test('content is internally consistent', () => {
  assert.deepEqual(CHALLENGES.map((c) => c.id), Array.from({ length: 15 }, (_, i) => i + 1));
  const settable = new Set<string>();
  for (const s of Object.values(SCRIPTS)) {
    Object.keys(s.set ?? {}).forEach((k) => settable.add(k));
    s.choices?.forEach((c) => Object.keys(c.set).forEach((k) => settable.add(k)));
  }
  for (const r of RULES) {
    assert.ok(CHALLENGES.some((c) => c.id === r.id));
    r.required.forEach((f) => assert.ok(settable.has(f), `no script sets ${f}`));
  }
  for (const room of Object.values(ROOMS)) {
    for (const h of room.hotspots) {
      for (const key of [h.script, h.doneScript, h.lockedScript]) if (key) assert.ok(SCRIPTS[key], `${h.id}: missing ${key}`);
      assert.ok(h.x > 0 && h.x < room.width, `${h.id} outside room`);
    }
  }
});
