// Guidance helpers: where a line points, what a hazard's light is doing, how far a hotspot reaches. Pure, so the tests can check them.
import type { Hotspot } from './content/types.ts';

/** Montag's reach to a hotspot: a wide prop (span) is in reach anywhere along it. 0 = in reach. */
export function reachDistance(x: number, h: Hotspot) {
  if (!h.span) return Math.abs(h.x - x);
  return x < h.span[0] ? h.span[0] - x : x > h.span[1] ? x - h.span[1] : 0;
}

/** Replaces {dir} with where the target is from Montag: right here, behind him, or ahead. No target: the sentence keeps no direction. */
export function placeLine(line: string, from: number, target: number | undefined, inReach: boolean): string {
  const dir = target === undefined ? '' : inReach ? 'Right here.' : target < from ? 'Back to the left.' : 'Ahead to the right.';
  return line.replace(/\s*\{dir\}/, dir ? ' ' + dir : '').trim();
}

