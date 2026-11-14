import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SCRIPTS } from '../src/content.ts';

// "X will remember that" may only appear when a later scene actually reads the choice's flag.
test('every remembered choice sets a flag that later content reads', () => {
  const dir = new URL('../src/content/', import.meta.url);
  const source = readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  const remembered = Object.values(SCRIPTS).flatMap((s) => s.choices ?? []).filter((c) => c.remember);
  assert.ok(remembered.length >= 2, 'callbacks exist');
  for (const c of remembered) {
    const keys = Object.keys(c.set ?? {});
    assert.ok(keys.length, `"${c.text}" remembers but sets nothing`);
    for (const k of keys) {
      const reads = source.split(`f['${k}']`).length - 1;
      assert.ok(reads >= 1, `"${c.text}" says ${c.remember} will remember, but nothing reads ${k}`);
    }
  }
});
