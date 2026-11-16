// Walking and camera feel, as small pure functions. RoomScene owns the state and calls these each frame.
// Units are world pixels (960x540 logical space) and seconds. Everything is frame-rate independent.

/** Walk speed in world px/s. Hazard timings (lane crossings, chases) read this too. */
export const SPEED = 190;
export const SPRINT = 1.6;
export const LIMP = 0.72;
export const LIMP_SPRINT = 1.25;

const START_RATE = 16;   // 1/s: exponential rate while speeding up (95% of speed in ~0.19 s)
const TURN_RATE = 30;    // 1/s: reversing direction (the skid through zero is ~0.08 s)
const STOP_RATE = 13;    // 1/s: letting go
const STOP_DECEL = 1100; // px/s^2 floor so the tail of the stop never drags
const REST_SPEED = 3;    // below this the walker is simply still

/** Next horizontal velocity for held direction `dir` (-1, 0, 1) and top speed `speed`. */
export function stepVelocity(vx: number, dir: number, speed: number, dt: number): number {
  if (dir) {
    const rate = vx * dir < 0 ? TURN_RATE : START_RATE;
    vx += (dir * speed - vx) * (1 - Math.exp(-dt * rate));
  } else {
    const k = Math.abs(vx);
    const drop = Math.max(k * (1 - Math.exp(-dt * STOP_RATE)), STOP_DECEL * dt);
    vx = k <= drop ? 0 : vx - Math.sign(vx) * drop;
  }
  return Math.abs(vx) < REST_SPEED ? 0 : vx;
}

/** One walk cycle (two steps) covers this fraction of the figure's drawn height. */
const CYCLE_PER_HEIGHT = 0.72;

/** Animation speed that keeps the feet planted: ground covered per cycle matches the sprite's size. */
export function walkTimeScale(speed: number, cycleSeconds: number, spriteHeight: number): number {
  const ts = (Math.abs(speed) * cycleSeconds) / (CYCLE_PER_HEIGHT * spriteHeight);
  return Math.min(1.8, Math.max(0.4, ts));
}

/** True when the walk cycle just moved onto a foot-down frame (first or half-way). */
export function crossedFoot(prev: number, now: number, frames: number): boolean {
  // Feet land at frame 0 and at the half-way frame.
  const half = frames / 2;
  return now !== prev && (now === 0 || now === half);
}

export interface CamState {
  /** Centre of the view in world x, unrounded. */
  cx: number;
  /** Smoothed look-ahead, world px (positive = looking right). */
  look: number;
}

const DEADZONE = 80;     // the player may drift this far from the look-ahead point before the camera moves
const LOOK_MAX = 70;
const LOOK_GAIN = 0.4;   // look-ahead per px/s of velocity, capped at LOOK_MAX
const LOOK_RATE = 4;     // 1/s: how fast look-ahead follows velocity (so a turn doesn't lurch the view)
const FOLLOW_RATE = 9;   // 1/s
const FRAMING_RATE = 4;  // 1/s: calmer glide for scripted framing shots

/** Advance the camera. `frame` is a scripted framing target (world x) that overrides following. */
export function stepCamera(c: CamState, playerX: number, vx: number, dt: number, roomWidth: number, viewW: number, frame: number | null): CamState {
  const look = c.look + (Math.max(-LOOK_MAX, Math.min(LOOK_MAX, vx * LOOK_GAIN)) - c.look) * (1 - Math.exp(-dt * LOOK_RATE));
  let want: number, rate: number;
  if (frame !== null) { want = frame; rate = FRAMING_RATE; }
  else {
    // keep the look-ahead point inside a window around the view centre; stand still and the view stays put
    const lead = playerX + look;
    want = Math.max(lead - DEADZONE, Math.min(lead + DEADZONE, c.cx));
    rate = FOLLOW_RATE;
  }
  const cx = c.cx + (want - c.cx) * (1 - Math.exp(-dt * rate));
  return { cx: Math.max(viewW / 2, Math.min(roomWidth - viewW / 2, cx)), look };
}

/** Round a scroll position to a whole device pixel at render zoom `k`, so tiles and text never shimmer. */
export const snapScroll = (x: number, k: number) => Math.round(x * k) / k;
