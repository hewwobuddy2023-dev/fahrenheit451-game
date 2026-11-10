// Content index: chapters are data files; the engine reads only these merged tables.
import { SCRIPTS1, ROOMS1 } from './content/ch1.ts';
import { SCRIPTS2, ROOMS2 } from './content/ch2.ts';
import type { RoomDef, Script } from './content/types.ts';

export { CHALLENGES, CHAPTERS, RULES } from './content/challenges.ts';
export type { ChallengeInfo } from './content/challenges.ts';

export const SCRIPTS: Record<string, Script> = { ...SCRIPTS1, ...SCRIPTS2 };
export const ROOMS: Record<string, RoomDef> = { ...ROOMS1, ...ROOMS2 };

/** Where each chapter begins (title-screen Presentation Mode and new games). */
export const CHAPTER_STARTS: { room: string; x: number; flags: Record<string, boolean | string> }[] = [
  { room: 'burn', x: 640, flags: {} },
];
