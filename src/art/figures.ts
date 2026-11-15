// Character painter: lit-profile silhouettes (brow, nose, lips, chin, an eye glint) with a rim light, a 4-frame
// breathing idle, a 12-frame walk, and the Chapter 1 cast also carries gesture poses with two in-between frames each.
// Every cast member is one parameter set; everything is painted once at boot.
import Phaser from 'phaser';
import { paint, poly, type Ctx } from './core.ts';
import { POSES, POSE_NAMES, type Pose } from './poses.ts';

export { POSE_NAMES };
export const FIG_W = 110;
export const FIG_H = 212;
export const FEET = FIG_H - 6;
export const IDLE = [0, 1, 2, 3];
export const WALK = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
/** Sheet layout: frames 0-3 idle, 4-15 walk, 16..16+N-1 the poses in POSE_NAMES order, then 2 in-betweens per pose. */
const X0 = 48;            // figure origin inside a frame (extra room in front for outstretched arms)
const COLS = 20;          // frames per sheet row, so a sheet never exceeds a safe texture width
const BETWEEN = [0.4, 0.75];
/** Only the Chapter 1 cast carries pose frames (texture memory on school laptops). */
const POSED = new Set(['fig:montag', 'fig:beatty', 'fig:fireman', 'fig:clarisse', 'fig:mildred']);
const SIT = 36, KNEEL = 38; // hips drop this far when seated / on one knee
const ARM1 = 31, ARM2 = 29, THIGH = 39;

export interface Fig {
  work?: boolean;
  coat: string;
  rim: string;
  skin: string;
  pants?: string;
  shirt?: string;          // visible shirt at the open front of a cardigan
  hat?: 'helmet' | 'cap' | 'flat' | 'none';
  hair?: 'short' | 'long' | 'bob' | 'bun' | 'white' | 'curls' | 'hood' | 'none';
  hairCol?: string;
  dress?: string;          // fitted bodice and skirt instead of a long coat
  sash?: string;
  collar?: string;         // pale dress collar, or clerical white
  flare?: number;          // skirt fullness
  hemY?: number;           // skirt hem height above the feet
  coatLen?: number;        // coat hem height above the feet
  stoop?: number;          // 0..1
  belly?: number;
  bulk?: number;           // shoulder width multiplier
  tall?: number;           // height multiplier
  slim?: number;           // limb thickness multiplier
  nose?: number;
  chin?: number;
  stripe?: boolean;        // reflective fireman stripe
  badge?: string;
  rank?: boolean;          // brass buttons and epaulettes
  beard?: boolean;
  pipe?: boolean;
  glasses?: boolean;
  shell?: boolean;         // glowing Seashell radio in the ear
  heels?: boolean;
  stock?: string;          // stocking colour under a skirt
  lips?: string;
  age?: boolean;
  shawl?: string;
}

function tint(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16), t = a < 0 ? 0 : 255, k = Math.abs(a);
  const m = (v: number) => Math.round(v + (t - v) * k);
  return `rgb(${m(n >> 16)},${m((n >> 8) & 255)},${m(n & 255)})`;
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function limb(c: Ctx, x1: number, y1: number, x2: number, y2: number, w1: number, w2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const cx = Math.cos(a), sy = Math.sin(a);
  poly(c, [x1 + cx * w1, y1 + sy * w1, x2 + cx * w2, y2 + sy * w2, x2 - cx * w2, y2 - sy * w2, x1 - cx * w1, y1 - sy * w1]);
  c.beginPath(); c.arc(x2, y2, w2, 0, Math.PI * 2); c.fill();
}
const dot = (c: Ctx, x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
const rel = (hx: number, hy: number, p: number[]) => p.map((v, i) => v + (i % 2 ? hy : hx));

/** A pose resolved to numbers; `t` blends from the resting stance (0) to the held pose (1) for the in-between frames. */
interface St { fa: number; ba: number; bend: number; head: number; lean: number; drop: number; ff: number[]; fb: number[]; prop: false | 'page' | 'nozzle'; full: boolean }
function resolve(p: Pose | undefined, t = 1): St | undefined {
  if (!p) return undefined;
  const drop = p.kneel ? KNEEL : p.sit ? SIT : 0;
  const ff = p.kneel ? [32, -4] : p.sit ? [34, -4] : [3, -3], fb = p.kneel ? [-34, -4] : p.sit ? [31, -4] : [-3, -3];
  return {
    fa: lerp(0.07, p.fa ?? 0.07, t), ba: lerp(0.07, p.ba ?? 0.07, t), bend: lerp(0.28, p.bend ?? 0.28, t),
    head: lerp(0, p.head ?? 0, t), lean: lerp(0, p.lean ?? 0, t), drop: drop * t,
    ff: [lerp(3, ff[0], t), lerp(-3, ff[1], t)], fb: [lerp(-3, fb[0], t), lerp(-3, fb[1], t)],
    prop: t === 1 && p.prop ? (p.prop === true ? 'page' : p.prop) : false, full: t === 1,
  };
}

/** Two-bone leg from the hip to a planted foot; the knee bends forward. */
function ik(hx: number, hy: number, fx: number, fy: number, a: number, b: number) {
  const dx = fx - hx, dy = fy - hy, d = Math.min(Math.hypot(dx, dy), a + b - 0.5), ang = Math.atan2(dy, dx);
  const A = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  return [hx + Math.cos(ang - A) * a, hy + Math.sin(ang - A) * a, hx + Math.cos(ang) * d, hy + Math.sin(ang) * d];
}

/** Everything is painted in two passes: 'rim' fills the silhouette in the rim colour, 'base' paints the lit figure over it. */
function figure(c: Ctx, o: Fig, walk: number | null, breath: number, pass: 'rim' | 'base', st?: St) {
  const base = pass === 'base';
  const col = (s: string) => { if (base) c.fillStyle = s; };
  const p = walk ?? 0, moving = walk !== null;
  const bulk = o.bulk ?? 1, w = o.slim ?? 1, stoop = o.stoop ?? 0, drop = st?.drop ?? 0;
  const chest = breath * 1.2, top = -146 - chest;
  const skin = o.skin, hairCol = o.hairCol ?? '#2a2420';
  const shinLen = o.heels ? 35 : 39, thigh = 7 * w, ankle = 4.4 * w;
  const sway = moving ? Math.sin(p * 2) * 1.2 : 0, tail = moving ? -Math.abs(Math.sin(p)) * 4 - 2 : -1;

  // ---- legs (back leg first) ----
  const shoe = (fx: number, fy: number, dir = 1) => {
    col(o.heels ? '#1d1618' : tint(o.coat, -0.6));
    if (o.heels) poly(c, [fx - 3 * dir, fy - 5, fx + 3 * dir, fy - 5, fx + 12 * dir, fy - 1, fx + 13 * dir, fy + 2, fx + 5 * dir, fy + 1, fx, fy - 1, fx - 2 * dir, fy + 2, fx - 4 * dir, fy + 2]);
    else poly(c, [fx - 6 * dir, fy - 5, fx + 14 * dir, fy - 3, fx + 15 * dir, fy + 2, fx - 6 * dir, fy + 2]);
  };
  const legCol = o.dress ? (o.stock ?? tint(skin, -0.12)) : (o.pants ?? tint(o.coat, -0.2));
  const legs: [number, number, number][] = [[p + Math.PI, 0, -1], [p, 0, 1]];
  if (drop > 0.5) {
    [st!.fb, st!.ff].forEach((f, i) => {
      const [kx, ky, fx, fy] = ik(0, -80 + drop, f[0], f[1], THIGH, shinLen);
      col(legCol); limb(c, 0, -80 + drop, kx, ky, thigh, thigh - 1); limb(c, kx, ky, fx, fy, thigh - 1, ankle);
      shoe(fx, fy + (o.heels ? -3 : 0), f[0] < 0 ? -1 : 1);
      void i;
    });
  } else for (const [q] of legs) {
    const th = moving ? Math.sin(q) * 0.45 : q === p ? 0.06 : -0.06;
    const sh = th - (moving ? Math.max(0, Math.cos(q)) * 0.6 : 0);
    const kx = Math.sin(th) * THIGH, ky = -80 + Math.cos(th) * THIGH;
    const fx = kx + Math.sin(sh) * shinLen, fy = ky + Math.cos(sh) * shinLen;
    col(legCol); limb(c, 0, -80, kx, ky, thigh, thigh - 1); limb(c, kx, ky, fx, fy, thigh - 1, ankle);
    shoe(fx, fy);
  }

  // ---- torso, arms, head: stoop and lean pivot about the hips ----
  c.save();
  c.translate(0, drop); c.translate(0, -80); c.rotate(stoop * 0.2 + (st?.lean ?? 0)); c.translate(0, 80);
  c.translate(0, moving ? -Math.abs(Math.cos(p)) * 1.5 : 0);
  const sl = -15 * bulk, sr = 13 * bulk, belly = o.belly ?? 0, hump = stoop * 6;
  const k = Math.min(1, drop / 30); // 0 standing .. 1 seated: skirts and coat fronts spread over the lap
  const sleeve = o.dress ? o.dress : o.coat;
  const arm = (q: number) => o.work ? -1.0 + breath * 0.03 : (moving ? -Math.sin(q) * 0.42 : 0.07 + breath * 0.02);
  const hands: number[][] = [];
  const drawArm = (a: number, ox: number, front: boolean) => {
    const bAng = a + (st ? st.bend : 0.28);
    const ex = ox + Math.sin(a) * ARM1, ey = top + 6 + Math.cos(a) * ARM1;
    const hx2 = ex + Math.sin(bAng) * ARM2, hy2 = ey + Math.cos(bAng) * ARM2;
    const r = o.dress ? 4.4 * w : 6.5 * bulk * w;
    col(sleeve); limb(c, ox, top + 6, ex, ey, r, r * 0.76);
    col(o.dress ? skin : sleeve); limb(c, ex, ey, hx2, hy2, r * 0.76, r * 0.6);
    col(skin); c.beginPath(); c.ellipse(hx2 + Math.sin(bAng) * 2, hy2 + Math.cos(bAng) * 2, 3.8 * w, 3.2 * w, -bAng, 0, Math.PI * 2); c.fill();
    if (front) hands.push([hx2, hy2, bAng]); else hands.push([hx2, hy2, bAng]);
  };
  drawArm(st ? st.ba : arm(p + Math.PI), -3, false);

  const body: number[][] = [];
  if (o.dress) {
    const hem = -(o.hemY ?? 38), fl = o.flare ?? 1;
    const fx = lerp(14 + 13 * fl + sway * 2, 40, k), bx = lerp(-13 - 15 * fl + tail * 1.5, -20, k), hy = lerp(hem, -70, k);
    col(o.dress);
    // fitted bodice with a bust, nipped waist, then the flared skirt (curved sides, scalloped hem)
    poly(c, [sl + 3, top + 3, -6, top - 3, 7, top - 4, sr - 2, top + 1, sr + 3, top + 16, 9, -100,
      lerp(17 + 8 * fl, 30, k), lerp(-80, -86, k), fx, hy - 3, fx - 6, hy + 2, 0, hy + 3, bx + 8, hy + 1, bx, hy - 3,
      lerp(-15 - 9 * fl, -14, k), lerp(-80, -76, k), -9, -100, -11 * bulk, top + 28]);
    if (base) {
      c.save(); c.beginPath(); c.rect(-60, top, 120, 200); c.clip();
      c.fillStyle = o.sash ?? tint(o.dress, -0.5); poly(c, [-9, -104, 9, -104, 9.5, -98, -9.5, -98]);                // waist sash
      c.strokeStyle = tint(o.dress, -0.28); c.lineWidth = 1.2;                                                         // skirt folds
      for (const f of [0.25, 0.55, 0.85]) { c.beginPath(); c.moveTo(lerp(-8, 8, f), -97); c.lineTo(lerp(bx + 6, fx - 6, f), hy); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.22)'; poly(c, [bx, hy - 3, bx + 8, hy + 1, 0, hy + 3, 0, hy - 6]);               // back of the skirt in shade
      c.fillStyle = tint(o.dress, 0.3); poly(c, [7, top - 4, sr - 2, top + 1, sr + 2, top + 10, 5, top + 6]);         // shoulder light
      if (o.collar) { c.fillStyle = o.collar; poly(c, [-8, top - 1, 0, top + 7, 8, top - 2, 9, top + 4, 1, top + 12, -7, top + 4]); }
      c.restore();
    }
    body.push([bx, hy]);
  } else {
    const hem = -(o.coatLen ?? 52), hemF = [lerp(16 * bulk + belly * 0.6, 36, k), lerp(hem - 2, -76, k)];
    const pts = [sl, top + 3, -8, top - 3, 6, top - 4, sr, top + 1, sr + belly * 0.5, top + 22, sr + belly, top + 50,
      hemF[0], hemF[1] + sway, 1, hem + 3, -20 * bulk + tail, hem + sway, -16 * bulk - hump * 0.6, top + 56, sl - hump, top + 16];
    col(o.coat); poly(c, pts);
    if (base) {
      c.save(); c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.clip();
      const g = c.createLinearGradient(sl - 8, 0, sr + belly, 0); g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(0.55, 'rgba(0,0,0,0.08)'); g.addColorStop(1, 'rgba(255,235,200,0.1)');
      c.fillStyle = g; c.fillRect(-60, top - 10, 120, 200);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(-60, hem - 4, 120, 10);                                         // hem in shade
      c.fillStyle = tint(o.coat, 0.2); poly(c, [-9, top - 2, 0, top + 16, 8, top - 3, 5, top + 6]);                  // collar
      if (o.shirt) { c.fillStyle = o.shirt; c.fillRect(sr - 3 + belly * 0.4, top + 4, 4, 52 + belly); c.fillStyle = '#6b4a3a'; poly(c, [sr - 2, top + 6, sr + 3, top + 7, sr + 3, top + 30, sr - 1, top + 28]); }
      c.strokeStyle = tint(o.coat, 0.18); c.lineWidth = 1; c.beginPath(); c.moveTo(sr - 8, top + 20); c.lineTo(sr - 6 + belly * 0.5, hem + 4); c.stroke();
      c.fillStyle = o.rank ? '#c9a24a' : tint(o.coat, 0.3);
      for (let y = top + 28; y < hem - 2; y += 16) { dot(c, sr - 6 + belly * 0.3, y, 1.3); if (o.rank) dot(c, sr - 12 + belly * 0.3, y, 1.3); }
      if (o.rank) { c.fillStyle = '#c9a24a'; poly(c, [sl, top + 3, -8, top - 3, -5, top + 1, sl + 2, top + 7]); poly(c, [4, top - 4, sr, top + 1, sr - 2, top + 4, 2, top]); }
      if (o.stripe) { c.fillStyle = 'rgba(214,150,70,0.6)'; c.fillRect(-19 * bulk, -68, 38 * bulk + belly, 3); c.fillRect(-15 * bulk, top + 38, 30 * bulk + belly, 2); }
      if (o.shawl) { c.fillStyle = o.shawl; poly(c, [sl - 1, top + 2, -8, top - 4, 7, top - 5, sr, top, sr - 6, top + 22, -4, top + 50, -20, top + 62, sl - hump, top + 20]); c.fillStyle = 'rgba(0,0,0,0.2)'; poly(c, [-4, top + 50, -20, top + 62, -14, top + 30]); }
      if (o.collar) { c.fillStyle = o.collar; poly(c, [5, top - 1, 9, top + 1, 9, top + 9, 5.5, top + 8]); }
      c.restore();
    }
    body.push([hemF[0], hemF[1]]);
  }
  drawArm(st ? st.fa : arm(p), 3, true);

  // props in the hands
  if (base && st?.prop === 'page') {
    const [hx3, hy3] = hands[1]; c.fillStyle = '#d9cba8'; poly(c, [hx3 - 3, hy3 - 9, hx3 + 12, hy3 - 11, hx3 + 13, hy3 + 1, hx3 - 2, hy3 + 3]);
    c.fillStyle = 'rgba(80,60,40,0.35)'; for (let i = 0; i < 3; i++) c.fillRect(hx3 - 1, hy3 - 7 + i * 3, 11, 1);
  }
  if (base && st?.prop === 'nozzle') {
    const [fx, fy, ang] = hands[1], [bx, by] = hands[0], dx = Math.sin(ang), dy = Math.cos(ang);
    c.strokeStyle = '#15100e'; c.lineWidth = 4.6; c.lineCap = 'round';   // hose: from the rear hand, sagging down behind him
    c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(-14, -60, -34, -3); c.stroke();
    c.strokeStyle = '#3b3430'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by - 1.5); c.quadraticCurveTo(-14, -61, -34, -4.5); c.stroke(); c.lineCap = 'butt';
    const nx = fx + dx * 4, ny = fy + dy * 4;
    c.fillStyle = '#2a2523'; limb(c, bx, by, nx, ny, 2.8, 3.4);                  // barrel
    c.fillStyle = '#a58546'; limb(c, nx, ny, nx + dx * 11, ny + dy * 11, 3.2, 2);    // brass nozzle
    c.fillStyle = '#e8c27a'; dot(c, nx + dx * 11, ny + dy * 11, 1.2);
  }

  // ---- head ----
  const nk = o.age ? 4 : 3.6 * w + 0.6, hx = 4 + stoop * 5.5, hy = top - 18 + stoop * 2.5;
  c.save();
  if (st?.head) { c.translate(1, top); c.rotate(st.head); c.translate(-1, -top); }
  col(skin); limb(c, 1, top + 2, hx - 1.5, hy + 10, nk, nk);
  if (o.collar && base && !o.dress) { /* clerical band drawn with the coat */ }
  const n = o.nose ?? 1, ch = o.chin ?? 1;
  const head = rel(hx, hy, [-10, -2, -9.5, -8.5, -4, -13.5, 3.5, -13.5, 8.5, -11, 10.3, -7, 10.8, -4.2, 9.6, -2.6, 10.1, -0.5,
    10 + 5.2 * n, 4.2, 10.3, 6.2, 11.2, 7.6, 10.4, 8.9, 11, 10.2, 10, 11.8, 10.4 + ch * 0.4, 14.4, 8, 15.8, 1, 15, -5, 12, -9.5, 7]);
  col(skin); poly(c, head);
  const hc = (pts: number[]) => poly(c, rel(hx, hy, pts));
  if (base) {
    c.save(); c.beginPath(); c.moveTo(head[0], head[1]); for (let i = 2; i < head.length; i += 2) c.lineTo(head[i], head[i + 1]); c.closePath(); c.clip();
    const g = c.createLinearGradient(hx - 11, 0, hx + 11, 0); g.addColorStop(0, 'rgba(10,6,4,0.55)'); g.addColorStop(0.5, 'rgba(10,6,4,0.12)'); g.addColorStop(1, 'rgba(255,235,205,0.12)');
    c.fillStyle = g; c.fillRect(hx - 12, hy - 15, 26, 33); c.restore();
    c.fillStyle = tint(skin, -0.3); c.beginPath(); c.ellipse(hx - 3, hy + 2.5, 1.9, 3.1, 0.1, 0, Math.PI * 2); c.fill();   // ear
    c.fillStyle = o.lips ?? tint(skin, -0.28); hc([10.9, 7.5, 11.8, 8.2, 11.1, 10.3, 10.2, 9]);                              // lips
    c.strokeStyle = 'rgba(25,14,10,0.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx + 10.2, hy + 8.9); c.lineTo(hx + 7.2, hy + 8.5); c.stroke();
    c.strokeStyle = o.age ? 'rgba(25,14,10,0.7)' : hairCol; c.lineWidth = 1.3; c.beginPath(); c.moveTo(hx + 2.5, hy - 5.8); c.lineTo(hx + 9.3, hy - 5.2); c.stroke(); // brow
    c.fillStyle = '#1b130f'; c.beginPath(); c.ellipse(hx + 6.1, hy - 2.2, 1.6, 1.15, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff6e4'; dot(c, hx + 6.6, hy - 2.6, 0.6);                                                               // eye glint
    if (o.lips) { c.strokeStyle = '#1b130f'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(hx + 4.6, hy - 3.2); c.lineTo(hx + 7.2, hy - 3.9); c.stroke(); } // lashes
    if (o.age) { c.strokeStyle = 'rgba(30,18,12,0.35)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(hx + 7.5, hy + 4); c.quadraticCurveTo(hx + 6, hy + 7, hx + 8, hy + 9.5); c.moveTo(hx + 3, hy - 0.5); c.lineTo(hx - 1, hy + 0.5); c.stroke(); }
  }
  // hair
  if (base) c.fillStyle = hairCol;
  const hair = o.hair ?? 'none';
  if (hair === 'short') hc([9.5, -8.5, 5, -14.5, -4, -14.5, -11, -7, -11.5, 4, -7, 6.5, -5, 0, -1, -4.5, 5, -7.5]);
  else if (hair === 'long') hc([9.5, -8.5, 5, -14.5, -4, -15, -12, -8, -15 + tail * 0.5, 10, -17 + tail, 30, -8 + tail, 32, -4, 12, -2, 0, 1, -4.5, 5, -7.5]);
  else if (hair === 'bob' || hair === 'curls') {
    hc([9.8, -9, 4, -16, -5, -16.5, -13, -9, -15.5, 3, -13.5, 12, -7, 14, -3, 8, -1.5, -1, 4, -5.5, 8, -6.5]);
    for (const [px, py] of [[7, -11.5], [-13, 9], [-9, 13.5]]) { dot(c, hx + px, hy + py, 3.4); }                    // pin curl on the brow, flip at the nape
    if (hair === 'curls') for (const [px, py] of [[-8, -12], [-1, -15], [5, -13]]) dot(c, hx + px, hy + py, 4);
    if (base) { c.strokeStyle = tint(hairCol, 0.4); c.lineWidth = 1.2; c.beginPath(); c.arc(hx - 1, hy - 4, 11.5, -2.6, -0.9); c.stroke(); }
  } else if (hair === 'bun') { hc([9, -8, 4, -14, -4, -14.5, -11, -8, -11, 2, -6, 5, -4, -1, 3, -6]); dot(c, hx - 12.5, hy - 3, 5.4); }
  else if (hair === 'white') hc([-2, -13.8, -9.5, -10.5, -11.5, -1, -9, 7.5, -5.5, 2, -5, -6, 0, -11.5]);
  else if (hair === 'hood') { col(o.coat); hc([9, -9, 4, -15.5, -6, -16.5, -14, -8, -15.5, 6, -13, 15, -4, 17, -5, 8, -3.5, -2, 3, -7.5]); col(tint(o.coat, -0.35)); hc([-14, -6, -15.5, 6, -13, 15, -8, 14, -10, 2]); }
  if (o.beard) { if (base) c.fillStyle = hairCol; hc([-6.5, 3, 2, 8, 9.2, 9.5, 10.3, 15, 6.5, 22, -1, 18, -6.5, 11]); }
  if (o.glasses && base) {
    c.strokeStyle = '#1e1814'; c.lineWidth = 1.1; c.beginPath(); c.arc(hx + 6.3, hy - 1.6, 3.4, 0, Math.PI * 2); c.moveTo(hx + 2.9, hy - 2); c.lineTo(hx - 4, hy - 1); c.stroke();
    c.fillStyle = 'rgba(200,225,235,0.35)'; dot(c, hx + 6.3, hy - 1.6, 3); c.fillStyle = 'rgba(255,255,255,0.75)'; dot(c, hx + 5.2, hy - 2.7, 0.9);
  }
  // hats
  const bandC = tint(o.coat, 0.22);
  if (o.hat === 'helmet') {
    col(o.coat); c.beginPath(); c.ellipse(hx - 4, hy - 7, 24, 4.6, -0.12, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(hx, hy - 10, 12.5, Math.PI, 0); c.fill();
    poly(c, [hx + 6, hy - 10, hx + 6, hy - 27, hx + 14, hy - 24, hx + 14, hy - 10]);
    poly(c, [hx - 9, hy - 18, hx - 2, hy - 26, hx + 6, hy - 25, hx + 4, hy - 16]);
    if (base) { col(bandC); c.fillRect(hx - 12, hy - 11, 24, 1.8); col(o.badge ?? '#c98a3a'); poly(c, [hx + 7, hy - 24, hx + 13, hy - 22, hx + 13, hy - 13, hx + 7, hy - 13]); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(hx - 28, hy - 6.5, 24, 2); }
  } else if (o.hat === 'cap') {
    col(o.coat); poly(c, [hx - 12, hy - 8, hx - 14, hy - 17, hx - 6, hy - 22, hx + 11, hy - 22.5, hx + 14, hy - 17, hx + 12.5, hy - 8]);
    poly(c, [hx + 10, hy - 9.5, hx + 25, hy - 6, hx + 24, hy - 3.5, hx + 9, hy - 6.5]);
    if (base) { col('#1c1412'); c.fillRect(hx - 12.5, hy - 12.5, 25, 4.5); col('#c9a24a'); poly(c, [hx + 5, hy - 21, hx + 11, hy - 20.5, hx + 10, hy - 14, hx + 5, hy - 14.5]); c.fillStyle = 'rgba(255,235,190,0.25)'; c.fillRect(hx - 6, hy - 22, 17, 1.2); }
  } else if (o.hat === 'flat') {
    col(o.coat); poly(c, [hx - 12, hy - 6.5, hx - 11, hy - 15, hx + 1, hy - 18, hx + 14, hy - 11, hx + 22, hy - 7, hx + 14, hy - 5.5]);
    if (base) { c.fillStyle = 'rgba(0,0,0,0.25)'; poly(c, [hx - 12, hy - 6.5, hx - 11, hy - 11, hx + 14, hy - 7, hx + 14, hy - 5.5]); }
  }
  if (o.pipe) {
    if (base) c.fillStyle = '#2a1b12';
    c.save(); c.translate(hx + 10, hy + 9); c.rotate(-0.22); c.fillRect(0, -1.1, 11, 2.2); poly(c, [9, -6, 15, -6.5, 15.5, 1, 9.5, 1.5]); c.restore();
    if (base) { c.fillStyle = '#ff8a3a'; dot(c, hx + 20, hy + 2.8, 1.5); c.fillStyle = 'rgba(255,170,80,0.25)'; dot(c, hx + 20, hy + 2.8, 4.5); }
  }
  if (o.shell && base) {
    const g = c.createRadialGradient(hx - 3, hy + 3, 0, hx - 3, hy + 3, 9); g.addColorStop(0, 'rgba(150,225,255,0.4)'); g.addColorStop(1, 'rgba(150,225,255,0)');
    c.fillStyle = g; dot(c, hx - 3, hy + 3, 9);
    c.fillStyle = '#c4ecff'; c.beginPath(); c.ellipse(hx - 3, hy + 3, 2.3, 3.6, 0.1, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffffff'; dot(c, hx - 3.3, hy + 2.4, 1);
    c.strokeStyle = 'rgba(190,235,255,0.55)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(hx - 3, hy + 6.5); c.quadraticCurveTo(hx - 9, hy + 14, hx - 6, top + 4); c.stroke();
  }
  c.restore();
  c.restore();
}

function frame(c: Ctx, x: number, y: number, o: Fig, walk: number | null, breath: number, st?: St) {
  c.save();
  c.translate(x, y);
  c.scale(o.tall ?? 1, o.tall ?? 1);
  c.save(); c.translate(2, -1); c.fillStyle = o.rim; figure(c, o, walk, breath, 'rim', st); c.restore();
  figure(c, o, walk, breath, 'base', st);
  c.restore();
}

/** Paint the sheet and its animations. Pose frames: 16+i; in-betweens: 16 + N + 2i and +1 (RoomScene plays `:pose:`/`:unpose:`). */
export function figureSheet(scene: Phaser.Scene, key: string, o: Fig) {
  if (scene.textures.exists(key)) return;
  const poses = POSED.has(key) ? POSE_NAMES : [];
  const N = poses.length, n = 16 + N * 3, rows = Math.ceil(n / COLS);
  const cell = (i: number) => [(i % COLS) * FIG_W, Math.floor(i / COLS) * FIG_H];
  const t = paint(scene, key, FIG_W * Math.min(n, COLS), FIG_H * rows, (c) => {
    const draw = (i: number, walk: number | null, breath: number, st?: St) => {
      const [cx, cy] = cell(i);
      c.save(); c.beginPath(); c.rect(cx, cy, FIG_W, FIG_H); c.clip();
      frame(c, cx + X0, cy + FEET, o, walk, breath, st); c.restore();
    };
    [0, 0.5, 1, 0.5].forEach((b, i) => draw(i, null, b));
    for (let i = 0; i < 12; i++) draw(i + 4, (i / 12) * Math.PI * 2, 0.5);
    poses.forEach((k, i) => {
      draw(16 + i, null, 0.5, resolve(POSES[k]));
      BETWEEN.forEach((b, j) => draw(16 + N + i * 2 + j, null, 0.5, resolve(POSES[k], b)));
    });
  });
  for (let i = 0; i < n; i++) { const [cx, cy] = cell(i); t.add(i, 0, cx, cy, FIG_W, FIG_H); }
  const a = scene.anims;
  if (!a.exists(key + ':idle')) a.create({ key: key + ':idle', frames: IDLE.map((f) => ({ key, frame: f })), frameRate: 2.4, repeat: -1 });
  if (!a.exists(key + ':walk')) a.create({ key: key + ':walk', frames: WALK.map((f) => ({ key, frame: f })), frameRate: 14, repeat: -1 });
  poses.forEach((k, i) => {
    const b = 16 + N + i * 2;
    a.create({ key: `${key}:pose:${k}`, frames: [b, b + 1, 16 + i].map((frame) => ({ key, frame })), frameRate: 30 });
    a.create({ key: `${key}:unpose:${k}`, frames: [b + 1, b].map((frame) => ({ key, frame })), frameRate: 30 });
  });
}

const WARM = 'rgba(242,165,74,0.85)';
const COLD = 'rgba(150,190,205,0.7)';

/** The cast. Distinct silhouettes: helmet and hose, captain's cap and pipe, a 1950s set-and-skirt housewife, a stooped
 * cardigan, an old woman with a bun, and a book group that varies in height, coat and hair. */
export const CAST: Record<string, Fig> = {
  montag: { coat: '#463d35', skin: '#a88a72', rim: WARM, hat: 'helmet', stripe: true, badge: '#c98a3a', hairCol: '#2b231e', tall: 1.02 },
  montagWork: { coat: '#4c443c', skin: '#a88a72', rim: WARM, hat: 'helmet', stripe: true, badge: '#c98a3a', work: true, tall: 1.02 },
  montagCivil: { coat: '#4d4842', skin: '#a88a72', rim: WARM, hat: 'none', hair: 'short', hairCol: '#2b231e', coatLen: 70, tall: 1.02 },
  beatty: { coat: '#47302b', skin: '#b4907a', rim: 'rgba(232,104,46,0.85)', hat: 'cap', pipe: true, bulk: 1.12, belly: 5, slim: 1.14, tall: 1.05, stripe: true, rank: true, nose: 1.2, chin: 1.5, hairCol: '#3a2a22' },
  fireman: { coat: '#3c3431', skin: '#8c7464', rim: 'rgba(242,165,74,0.55)', hat: 'helmet', stripe: true, bulk: 1.08, slim: 1.05, hairCol: '#1d1713' },
  clarisse: { coat: '#cfc6b5', rim: COLD, hair: 'long', hairCol: '#2a2420', dress: '#ddd5c4', collar: '#f3ece0', sash: '#a89e8c', tall: 0.9, bulk: 0.82, slim: 0.72, skin: '#d6c2ab', flare: 0.55, hemY: 46, nose: 0.75, chin: 0.6, lips: '#a35a55', stock: '#cdb9a2', heels: false },
  mildred: { coat: '#4a3c44', rim: 'rgba(160,200,215,0.75)', hair: 'bob', hairCol: '#d6c286', dress: '#86606f', collar: '#ece2cf', sash: '#3a2a32', tall: 0.97, bulk: 0.8, slim: 0.7, skin: '#dcc0a8', flare: 1, hemY: 38, nose: 0.7, chin: 0.55, lips: '#b04650', stock: '#bba28f', heels: true, shell: true },
  faber: { coat: '#6a6a58', skin: '#c2aa94', rim: WARM, hair: 'white', hairCol: '#d8d2c6', shirt: '#cfc8b8', pants: '#3f3a34', stoop: 0.8, tall: 0.95, slim: 0.78, coatLen: 66, glasses: true, nose: 1.25, chin: 0.8, age: true },
  granger: { coat: '#1e2a36', skin: '#a3866d', rim: 'rgba(242,165,74,0.9)', hair: 'short', hairCol: '#a7a49b', beard: true, coatLen: 78, bulk: 1.05, tall: 1.04, hat: 'none', pants: '#20262c' },
  bookman: { coat: '#2f3a34', skin: '#b39a82', rim: 'rgba(242,165,74,0.8)', hair: 'hood', coatLen: 72, bulk: 0.9, slim: 0.85, tall: 0.92, stoop: 0.25, nose: 0.9, pants: '#262b27' },
  bookman2: { coat: '#4f3d2e', skin: '#b8957c', rim: 'rgba(242,165,74,0.8)', hat: 'flat', hair: 'short', hairCol: '#9b968c', beard: false, coatLen: 66, bulk: 1.12, belly: 6, slim: 1.1, tall: 0.88, nose: 1.1, pants: '#2e261f' },
  bookman3: { coat: '#16181e', skin: '#c4a98f', rim: 'rgba(242,165,74,0.8)', hair: 'white', hairCol: '#dcd7cc', collar: '#e6e0d2', coatLen: 84, bulk: 0.92, slim: 0.82, tall: 1.08, stoop: 0.15, nose: 1.2, chin: 0.9, age: true, pants: '#101216' },
  woman: { coat: '#4e423c', skin: '#c4ac96', rim: 'rgba(242,165,74,0.7)', hair: 'bun', hairCol: '#c9c3b6', dress: '#3a2e2a', shawl: '#6a5748', sash: '#2a201d', hemY: 24, flare: 0.5, stoop: 0.4, tall: 0.96, bulk: 0.95, slim: 0.8, age: true, glasses: true, nose: 1.05, stock: '#6b5c54', pants: '#3a2e2a' },
  lady1: { coat: '#2a2024', skin: '#d0b29b', rim: 'rgba(160,200,215,0.7)', hair: 'curls', hairCol: '#4a3328', dress: '#58704f', collar: '#eadfcb', sash: '#26331f', tall: 0.94, bulk: 0.85, slim: 0.74, flare: 0.95, hemY: 38, nose: 0.8, chin: 0.6, lips: '#a8404c', stock: '#b69e8b', heels: true },
  lady2: { coat: '#262126', skin: '#c8ac96', rim: 'rgba(160,200,215,0.7)', hair: 'bob', hairCol: '#8e5e3c', dress: '#456373', collar: '#e6e0d0', sash: '#243742', tall: 1.0, bulk: 0.9, slim: 0.76, flare: 0.9, hemY: 40, nose: 0.75, chin: 0.6, lips: '#9e3f48', stock: '#b39b88', heels: true },
};

export function paintCast(scene: Phaser.Scene) {
  for (const [k, o] of Object.entries(CAST)) figureSheet(scene, 'fig:' + k, o);
  paintSwimmer(scene);
}

/** Surface silhouette: head, shoulders and a slow arm stroke; legs remain below the water.
 * A tiny reusable sheet replaces the walking figure, with no physics or movement changes.
 */
function paintSwimmer(scene: Phaser.Scene) {
  const key = 'fig:montagFloat', width = 176, height = 80, count = 8;
  const t = paint(scene, key, width * count, height, (c) => {
    for (let i = 0; i < count; i++) {
      const phase = i / count * Math.PI * 2;
      c.save(); c.translate(i * width, 0);
      c.fillStyle = 'rgba(115,155,175,0.5)';
      c.beginPath(); c.ellipse(88, 56, 62, 5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#20303a';
      poly(c, [30, 53, 61, 43, 104, 39, 128, 44, 123, 54, 80, 57]);
      limb(c, 115, 43, 138 + Math.sin(phase) * 12, 54, 6, 4);
      limb(c, 138 + Math.sin(phase) * 12, 54, 151 + Math.sin(phase) * 12, 51, 4, 2.5);
      c.fillStyle = '#4b5558';
      limb(c, 123, 42, 129, 31, 5, 5);
      c.beginPath(); c.ellipse(132, 26, 10, 13, -0.18, 0, Math.PI * 2); c.fill();
      poly(c, [140, 24, 146, 30, 140, 32]);
      c.fillStyle = '#161b1c';
      c.beginPath(); c.ellipse(130, 18, 10, 7, -0.1, Math.PI, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(165,195,210,0.65)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(29, 56); c.quadraticCurveTo(85, 60 + Math.sin(phase) * 2, 148, 55); c.stroke();
      c.restore();
    }
  });
  for (let i = 0; i < count; i++) t.add(i, 0, i * width, 0, width, height);
  for (const [name, frameRate] of [['idle', 4], ['walk', 7]] as const) {
    scene.anims.create({ key: key + ':' + name, frames: Array.from({ length: count }, (_, frame) => ({ key, frame })), frameRate, repeat: -1 });
  }
}
