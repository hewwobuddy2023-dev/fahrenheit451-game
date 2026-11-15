import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, SCRIPTS } from '../src/content.ts';
import type { Flags } from '../src/state.ts';
import type { RoomDef } from '../src/content/types.ts';

const rooms = Object.entries(ROOMS).filter(([, r]) => r.chapter >= 1 && r.chapter <= 5);

// Every flag the content writes or reads: collected from the data itself, so new flags are covered automatically.
function collect(o: unknown, out: Set<string>) {
  if (Array.isArray(o)) { o.forEach((x) => collect(x, out)); return; }
  if (!o || typeof o !== 'object') return;
  for (const [k, v] of Object.entries(o)) {
    if ((k === 'set' || k === 'also') && v && typeof v === 'object') Object.keys(v).forEach((x) => out.add(x));
    else if ((k === 'flag' || k === 'doneFlag') && typeof v === 'string') out.add(v);
    else if (k === 'requires' && Array.isArray(v)) v.forEach((x) => out.add(String(x)));
    collect(v, out);
  }
}
const flagNames = new Set<string>();
collect(SCRIPTS, flagNames);
collect(ROOMS, flagNames);
const names = [...flagNames];
const allTrue: Flags = Object.fromEntries(names.map((k) => [k, true]));
// the states the objective and hints can see: nothing, everything, each flag alone, and everything but one flag
const states: Flags[] = [{}, allTrue];
for (const k of names) {
  states.push({ [k]: true });
  states.push({ ...allTrue, [k]: false });
}

function hintsOf(r: RoomDef, f: Flags) {
  return r.hints ? r.hints(f) : null;
}

test('every room in chapters 1-5 uses the quiet UI', () => {
  for (const [id, r] of rooms) assert.equal(r.quietUi, true, `${id} must set quietUi`);
});

test('every room in chapters 1-5 has a three-step hint, each 11-140 characters', () => {
  for (const [id, r] of rooms) {
    assert.ok(r.hints, `${id} needs hints`);
    for (const f of states) {
      const h = hintsOf(r, f)!;
      assert.equal(h.length, 3, `${id}: hints must be a triple`);
      h.forEach((s) => assert.ok(s.length > 10 && s.length <= 140, `${id}: hint length ${s.length} "${s}"`));
    }
  }
});

test('every objective in chapters 1-5 is one short clause with no counter', () => {
  for (const [id, r] of rooms) {
    for (const f of states) {
      const o = r.objective(f);
      assert.ok(o.length <= 60, `${id}: objective too long "${o}"`);
      assert.ok(!/\d\s*\/\s*\d/.test(o), `${id}: counter in objective "${o}"`);
    }
  }
});

test('a locked door says what is missing, not just "not yet"', () => {
  for (const [id, r] of rooms) {
    for (const h of r.hotspots) {
      if (!h.lockedScript) continue;
      const sc = SCRIPTS[h.lockedScript];
      assert.ok(sc, `${id}/${h.id}: missing locked script ${h.lockedScript}`);
      const text = sc.lines.map((l) => l.text).join(' ');
      assert.ok(text.length >= 30, `${id}/${h.id}: locked line says too little: "${text}"`);
      assert.ok(!/^(Not yet|Not finished|Not now)\.?$/i.test(text), `${id}/${h.id}: bare refusal "${text}"`);
      assert.ok(!/for now\.?$/i.test(text), `${id}/${h.id}: vague refusal "${text}"`);
    }
  }
});
