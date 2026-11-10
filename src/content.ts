// Content index: chapters are data files; the engine reads only these merged tables.
import { SCRIPTS1, ROOMS1 } from './content/ch1.ts';
import { SCRIPTS2, ROOMS2 } from './content/ch2.ts';
import { SCRIPTS3, ROOMS3 } from './content/ch3.ts';
import { SCRIPTS4, ROOMS4 } from './content/ch4.ts';
import { RULES as R } from './content/challenges.ts';
import type { RoomDef, Script } from './content/types.ts';

export { CHALLENGES, CHAPTERS, RULES } from './content/challenges.ts';
export type { ChallengeInfo } from './content/challenges.ts';

export const SCRIPTS: Record<string, Script> = { ...SCRIPTS1, ...SCRIPTS2, ...SCRIPTS3, ...SCRIPTS4 };
export const ROOMS: Record<string, RoomDef> = { ...ROOMS1, ...ROOMS2, ...ROOMS3, ...ROOMS4 };

/** Flags for a Presentation Mode start: earlier challenges done with neutral default choices (demo only, never saved). */
function before(id: number, extra: Record<string, boolean | string> = {}) {
  const f: Record<string, boolean | string> = {};
  for (const r of R) if (r.id < id) for (const k of r.required) f[k] = true;
  return { ...f, ...extra };
}

/** Where each chapter begins (title-screen Presentation Mode and new games). */
export const CHAPTER_STARTS: { room: string; x: number; flags: Record<string, boolean | string> }[] = [
  { room: 'burn', x: 640, flags: {} },
  { room: 'station2', x: 2200, flags: before(4, { 'c01.tone': 'eager', 'c02.k': 'perfume' }) },
  { room: 'home3', x: 900, flags: before(7, { 'c04.plea': 'plead' }) },
  { room: 'lawn', x: 640, flags: before(10, { 'c04.plea': 'plead', 'faber.tear': 'plead', 'faber.ear': true, 'c09.outburst': false }) },
];
