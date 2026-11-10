/** A finite dive, with release-to-recover. No frame-count dependency or saved transient state. */
export interface Breath { air: number; exhausted: boolean }
export function diveStep(s: Breath, held: boolean, seconds: number): Breath & { diving: boolean } {
  const air = Math.max(0, Math.min(1, s.air + (held ? -seconds / 4.2 : seconds / 2)));
  const exhausted = air <= 0 || (s.exhausted && (held || air < 0.6));
  return { air, exhausted, diving: held && !exhausted };
}
