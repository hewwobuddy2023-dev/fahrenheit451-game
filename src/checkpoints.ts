import { ROOMS } from './content.ts';
import type { SaveData } from './state.ts';

/** Recover v1 checkpoints written by M2 between a completed conversation and its room transition.
 * New checkpoints are atomic at event boundaries. Existing saves keep their choices and progress.
 */
export function restoreCheckpoint(save: SaveData | null): SaveData | null {
  if (!save || !Object.hasOwn(ROOMS, save.room)) return null;
  const interrupted: Record<string, [string, string]> = {
    burn: ['c01.lit', 'station1'], attic: ['c04.plea', 'home2'],
    home2: ['c06.still', 'home3'], subway: ['c08.verse', 'faber1'],
    home4: ['c09.burned', 'station3'], run: ['c12.river', 'river'],
  };
  const next = interrupted[save.room];
  if (!next || !save.flags[next[0]]) return save;
  return { ...save, room: next[1], x: ROOMS[next[1]].spawnX };
}
