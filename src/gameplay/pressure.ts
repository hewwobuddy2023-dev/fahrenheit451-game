/** Hose control: effective flow only in the marked pressure band. Seconds, never frame counts. */
export interface HoseState { pressure: number; progress: number; overheated: boolean }
export function hoseStep(s: HoseState, held: boolean, dt: number, required: number, assisted = false): HoseState {
  let { pressure, progress, overheated } = s;
  // Substeps make transitions through a band consistent at 10–60 FPS.
  for (let left = Math.max(0, dt); left > 0.000001; left -= 0.01) {
    const d = Math.min(0.01, left);
    pressure = Math.max(0, Math.min(1, pressure + (held ? 0.48 : -0.7) * d));
    if (pressure >= 0.97) overheated = true;
    if (pressure < 0.28) overheated = false;
    if (held && (assisted || (!overheated && pressure >= 0.32 && pressure <= 0.82))) progress += d * 1000;
  }
  return { pressure, progress: Math.min(required, progress), overheated };
}
