// Chapter 4 — placeholder until the chapter lands.
import type { RoomDef, Script } from './types.ts';

export const SCRIPTS4: Record<string, Script> = { wip4: { lines: [{ who: '', text: 'Chapter 4 is being built.' }] } };

export const ROOMS4: Record<string, RoomDef> = {
  lawn: {
    id: 'lawn', chapter: 4, label: '', width: 1900, spawnX: 640, kit: 'street:lawn',
    objective: () => 'Chapter 4 is in progress',
    hotspots: [{ id: 'wip', x: 900, label: 'In progress', script: 'wip4' }],
  },
};
