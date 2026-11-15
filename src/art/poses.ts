// Pose table kept free of Phaser so content tests can validate pose names.
/** Held gesture poses (frames 16+), arm angles in radians from straight down, head tilt + = looking down, lean - = back. */
export interface Pose { fa?: number; ba?: number; bend?: number; head?: number; lean?: number; sit?: boolean; prop?: boolean; lie?: boolean }
export const POSES: Record<string, Pose> = {
  reach: { fa: 1.35, ba: 0.1, bend: 0.06 },
  pointUp: { fa: 2.45, ba: 0.05, bend: 0.12, head: -0.3 },
  hold: { fa: 0.5, ba: 0.42, bend: 1.3, head: 0.2, prop: true }, // a page, a script, an igniter: something in both hands
  recoil: { fa: 1.0, ba: -0.35, bend: 1.1, lean: -0.13, head: -0.14 },
  seated: { sit: true, fa: 0.35, ba: 0.3, bend: 1.25, head: 0.3, prop: true }, // reading the script on her lap
  seatedLook: { sit: true, fa: 0.12, ba: 0.08, bend: 1.2, head: -0.06 },
  lying: { lie: true, fa: 0.07, ba: 0.07, bend: 0.28 }, // bare-headed under a blanket; the scene lays the sprite on its back
};
export const POSE_NAMES = Object.keys(POSES);
