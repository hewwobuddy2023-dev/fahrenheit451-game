/**
 * Hose control. Holding always sprays and always makes progress: full flow inside the FLOW band,
 * a sputtering 40% outside it (too low while building, too high once overheated). Releasing briefly
 * vents the pressure back into the band, which is the faster, skilful way. Seconds, never frame counts.
 */
export interface HoseState { pressure: number; progress: number; overheated: boolean }
export const BAND = [0.32, 0.82] as const;
export const SPUTTER = 0.4;
export const inBand = (s: HoseState) => !s.overheated && s.pressure >= BAND[0] && s.pressure <= BAND[1];

export function hoseStep(s: HoseState, held: boolean, dt: number, required: number, assisted = false): HoseState {
  let { pressure, progress, overheated } = s;
  // Substeps make transitions through a band consistent at 10–60 FPS.
  for (let left = Math.max(0, dt); left > 0.000001; left -= 0.01) {
    const d = Math.min(0.01, left);
    pressure = Math.max(0, Math.min(1, pressure + (held ? 0.48 : -0.7) * d));
    if (pressure >= 0.97) overheated = true;
    if (pressure < 0.28) overheated = false;
    if (held) progress += d * 1000 * (assisted || inBand({ pressure, progress, overheated }) ? 1 : SPUTTER);
  }
  return { pressure, progress: Math.min(required, progress), overheated };
}
