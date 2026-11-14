// Content-derived pacing estimate per chapter: words to read, choices, walking, timed encounters.
// An ESTIMATE from the content alone, not a measurement of people. Usage: node tools/pacing.ts
import { ROOMS, SCRIPTS } from '../src/content.ts';

const WPM = 180;            // a typical middle/high-school silent reading rate in a game UI
const WALK = 175;           // px/s, the game's walking speed
const CHOICE_S = 6;         // seconds to read options and decide
const chapters = new Map<number, { rooms: string[]; words: number; choices: number; walk: number; holds: number; hazards: number }>();

const words = (k: string, seen = new Set<string>()): [number, number] => {
  if (!k || seen.has(k) || !SCRIPTS[k]) return [0, 0];
  seen.add(k);
  const s = SCRIPTS[k];
  let w = s.lines.reduce((n, l) => n + l.text.split(/\s+/).length, 0), c = s.choices?.length ? 1 : 0;
  // count the correct path once: the first non-retry choice, its reply and its continuation
  const pick = s.choices?.find((ch) => !ch.again) ?? s.choices?.[0];
  if (pick) {
    w += pick.text.split(/\s+/).length + (pick.reply ?? []).reduce((n, l) => n + l.text.split(/\s+/).length, 0);
    if (pick.next) { const [w2, c2] = words(pick.next, seen); w += w2; c += c2; }
  }
  return [w, c];
};

const stepScripts = (steps: unknown[] = []): string[] => steps.flatMap((s: any) => [s.say, ...(s.then ? stepScripts(s.then) : [])].filter(Boolean));

for (const r of Object.values(ROOMS)) {
  const ch = chapters.get(r.chapter) ?? { rooms: [], words: 0, choices: 0, walk: 0, holds: 0, hazards: 0 };
  ch.rooms.push(r.id);
  const keys = new Set<string>([...(r.enter ?? []).flatMap((e) => stepScripts(e.steps)), ...r.hotspots.flatMap((h) => [h.script, ...stepScripts(h.steps)].filter(Boolean) as string[])]);
  for (const k of keys) { const [w, c] = words(k); ch.words += w; ch.choices += c; }
  const xs = r.hotspots.filter((h) => h.required).map((h) => h.x);
  let at = r.spawnX; for (const x of xs) { ch.walk += Math.abs(x - at); at = x; }
  ch.holds += r.hotspots.filter((h) => h.hold).reduce((n, h) => n + h.hold!.ms, 0);
  ch.hazards += (r.hazards ?? []).length;
  chapters.set(r.chapter, ch);
}

let total = 0;
console.log('| Ch | Rooms | Words | Reading | Choices | Walking | Holds | Hazards | Est. active minutes |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [n, c] of [...chapters].sort((a, b) => a[0] - b[0])) {
  const read = c.words / WPM, walk = c.walk / WALK / 60, choose = c.choices * CHOICE_S / 60, hold = c.holds / 60000;
  const hazards = c.hazards * 0.5; // waiting for lanes/lights, ~30 s each including a retry
  const mins = read + walk + choose + hold + hazards;
  total += mins;
  console.log(`| ${n} | ${c.rooms.length} | ${c.words} | ${read.toFixed(1)} min | ${c.choices} | ${walk.toFixed(1)} min | ${hold.toFixed(1)} min | ${c.hazards} | ${mins.toFixed(1)} |`);
}
console.log(`\nEstimated first-play active time (correct path, no exploration, no puzzle mistakes): ${total.toFixed(0)} min`);
console.log('Wrong answers, retries, exploring optional hotspots and reading the journal add to this. Measure real players before relying on it.');
