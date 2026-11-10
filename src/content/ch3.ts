// Chapter 3 — placeholder until the chapter lands (keeps Chapter 2's exit valid).
import type { RoomDef, Script } from './types.ts';

export const SCRIPTS3: Record<string, Script> = {
  wip3: { lines: [{ who: '', text: 'Chapter 3 is being built.' }] },
};

export const ROOMS3: Record<string, RoomDef> = {
  home3: {
    id: 'home3', chapter: 3, label: '', width: 2600, spawnX: 900, kit: 'home',
    objective: () => 'Chapter 3 is in progress',
    hotspots: [{ id: 'wip', x: 1000, label: 'In progress', script: 'wip3' }],
  },
};
