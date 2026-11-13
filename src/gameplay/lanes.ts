/**
 * Timed lane hazards (cars crossing the boulevard, doors opening, searchlight passes).
 * A lane is dangerous only while lit; it glows for WARN_MS first. Islands between lanes are always safe.
 * Pure functions so timing and collision can be unit-tested.
 */
export interface Lane { from: number; to: number; period: number; pulse?: number; phase?: number }
export const WARN_MS = 1200;
export const MARGIN = 14; // half-width of Montag's body for collision

export function laneState(l: Lane, time: number) {
  const t = (((time / l.period) + (l.phase ?? 0)) % 1 + 1) % 1;
  const k = t * l.period;
  const pulse = l.pulse ?? 0;
  const lit = k < pulse;
  const untilLit = lit ? 0 : l.period - k;
  return { lit, warn: !lit && untilLit <= WARN_MS, untilLit, progress: lit ? k / pulse : 0 };
}

export const inLane = (l: Lane, x: number) => x > l.from - MARGIN && x < l.to + MARGIN;
/** ms to walk from just before a lane to safely past it */
export const crossMs = (l: Lane, speed: number) => ((l.to - l.from + 2 * MARGIN) / speed) * 1000;
