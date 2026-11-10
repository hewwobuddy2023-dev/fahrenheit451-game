// Chapter 5 — placeholder until the chapter lands.
import type { RoomDef, Script } from './types.ts';

export const SCRIPTS5: Record<string, Script> = { wip5: { lines: [{ who: '', text: 'Chapter 5 is being built.' }] } };

export const ROOMS5: Record<string, RoomDef> = {
  river: {
    id: 'river', chapter: 5, label: '', width: 2400, spawnX: 200, kit: 'forest:river',
    objective: () => 'Chapter 5 is in progress',
    hotspots: [{ id: 'wip', x: 600, label: 'In progress', script: 'wip5' }],
  },
};
