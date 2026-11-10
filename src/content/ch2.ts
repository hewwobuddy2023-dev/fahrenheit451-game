// Chapter 2 — placeholder until the chapter lands (keeps Chapter 1's exit valid).
import type { RoomDef, Script } from './types.ts';

export const SCRIPTS2: Record<string, Script> = {
  wip: { lines: [{ who: '', text: 'Chapter 2 is being built.' }] },
};

export const ROOMS2: Record<string, RoomDef> = {
  station2: {
    id: 'station2', chapter: 2, label: '', width: 2400, spawnX: 2200, kit: 'station',
    objective: () => 'Chapter 2 is in progress',
    hotspots: [{ id: 'wip', x: 2000, label: 'In progress', script: 'wip' }],
  },
};
