// Character painter v2: filled silhouettes with head profiles, hands and coat tails,
// a 4-frame breathing idle and a 12-frame walk. Every cast member is one parameter set.
import Phaser from 'phaser';
import { paint, poly, type Ctx } from './core.ts';

export const FIG_W = 90;
export const FIG_H = 212;
export const FEET = FIG_H - 6;
export const IDLE = [0, 1, 2, 3];
export const WALK = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export interface Fig {
  work?: boolean;
  coat: string;
  rim: string;
  skin?: string;
  hat?: 'helmet' | 'cap' | 'none';
  hair?: 'short' | 'long' | 'straw' | 'white' | 'none';
  dress?: string;          // skirt colour instead of a long coat
  coatLen?: number;        // hem height above the feet (long coat 52)
  stoop?: number;          // 0..1
  beard?: boolean;
  pipe?: boolean;
  shell?: boolean;         // glowing Seashell radio in the ear
  bulk?: number;           // shoulder width multiplier
  tall?: number;           // height multiplier
  stripe?: boolean;        // reflective fireman stripe
  badge?: string;
  hairCol?: string;
}

function limb(c: Ctx, x1: number, y1: number, x2: number, y2: number, w1: number, w2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const cx = Math.cos(a), sy = Math.sin(a);
  poly(c, [x1 + cx * w1, y1 + sy * w1, x2 + cx * w2, y2 + sy * w2, x2 - cx * w2, y2 - sy * w2, x1 - cx * w1, y1 - sy * w1]);
  c.beginPath(); c.arc(x2, y2, w2, 0, Math.PI * 2); c.fill();
}

function body(c: Ctx, o: Fig, walk: number | null, breath: number, pass: 'rim' | 'base') {
  const p = walk ?? 0;
  const moving = walk !== null;
  const bulk = o.bulk ?? 1;
  const stoop = o.stoop ?? 0;
  const chest = breath * 1.2;
  const lenLeg = 39;
  // legs (back leg first)
  for (const q of [p + Math.PI, p]) {
    const th = moving ? Math.sin(q) * 0.45 : q === p ? 0.06 : -0.06;
    const sh = th - (moving ? Math.max(0, Math.cos(q)) * 0.6 : 0);
    const kx = Math.sin(th) * lenLeg, ky = -80 + Math.cos(th) * lenLeg;
    const fx = kx + Math.sin(sh) * lenLeg, fy = ky + Math.cos(sh) * lenLeg;
    limb(c, 0, -80, kx, ky, 7, 6);
    limb(c, kx, ky, fx, fy, 6, 4.5);
    poly(c, [fx - 6, fy - 5, fx + 14, fy - 3, fx + 15, fy + 2, fx - 6, fy + 2]); // shoe
  }
  c.save();
  c.translate(stoop * 9, stoop * 4);
  c.rotate(stoop * 0.18);
  c.translate(0, moving ? -Math.abs(Math.cos(p)) * 1.5 : 0);
  const sway = moving ? Math.sin(p * 2) * 1.2 : 0;
  const tail = moving ? -Math.abs(Math.sin(p)) * 4 - 2 : -1;
  const sl = -15 * bulk, sr = 13 * bulk, top = -146 - chest;
  // back arm
  const arm = (q: number) => o.work ? -1.0 + breath * 0.03 : (moving ? -Math.sin(q) * 0.42 : 0.07 + breath * 0.02);
  const drawArm = (a: number, ox: number) => {
    const ex = ox + Math.sin(a) * 31, ey = top + 6 + Math.cos(a) * 31;
    const b = a + 0.28;
    limb(c, ox, top + 6, ex, ey, 6.5 * bulk, 5);
    limb(c, ex, ey, ex + Math.sin(b) * 29, ey + Math.cos(b) * 29, 5, 4);
  };
  drawArm(arm(p + Math.PI), -3);
  if (o.dress) {
    c.fillStyle = pass === 'base' ? o.dress : c.fillStyle;
    poly(c, [sl + 3, top + 2, sr - 2, top, 16 * bulk, -98, 24 * bulk + sway, -60, -22 * bulk + tail, -60, -15 * bulk, -98]);
    if (pass === 'base') c.fillStyle = o.coat;
  } else {
    const hem = -(o.coatLen ?? 52);
    poly(c, [sl, top + 2, -11, top - 6, 9, top - 8, sr, top, 18 * bulk, hem - 2 + sway, 1, hem + 3, -21 * bulk + tail, hem + sway]);
  }
  drawArm(arm(p), 3);
  // head, neck and profile
  const hx = 4, hy = top - 18;
  limb(c, 1, top, hx - 1, hy + 9, 5, 5);
  c.beginPath(); c.ellipse(hx, hy, 10.5, 12.5, 0, 0, Math.PI * 2); c.fill();
  poly(c, [hx + 9, hy - 3, hx + 14, hy + 3, hx + 9, hy + 5]); // nose
  poly(c, [hx + 2, hy + 8, hx + 10, hy + 9, hx + 5, hy + 13]); // jaw
  if (o.beard) poly(c, [hx - 6, hy + 4, hx + 11, hy + 6, hx + 6, hy + 20, hx - 4, hy + 16]);
  if (pass === 'base' && o.hairCol) c.fillStyle = o.hairCol;
  switch (o.hair) {
    case 'long': poly(c, [hx - 10, hy - 8, hx + 6, hy - 14, hx + 8, hy - 6, hx - 2, hy + 4, hx - 6, hy + 26, hx - 16 + tail, hy + 28, hx - 13, hy + 2]); break;
    case 'straw': for (let i = -9; i < 9; i += 3) poly(c, [hx + i, hy - 9, hx + i + 4, hy - 19 - (i % 2 ? 3 : 0), hx + i + 6, hy - 8]); break;
    case 'white': poly(c, [hx - 11, hy - 2, hx - 6, hy - 10, hx - 2, hy - 3]); break;
    case 'short': poly(c, [hx - 10, hy - 4, hx - 4, hy - 13, hx + 8, hy - 12, hx + 9, hy - 6]); break;
    default:
  }
  if (pass === 'base') c.fillStyle = o.coat;
  if (o.hat === 'helmet') {
    c.beginPath(); c.ellipse(hx - 4, hy - 7, 26, 5, -0.12, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(hx, hy - 10, 12.5, Math.PI, 0); c.fill();
    poly(c, [hx + 6, hy - 10, hx + 6, hy - 27, hx + 14, hy - 24, hx + 14, hy - 10]); // front shield
  } else if (o.hat === 'cap') {
    poly(c, [hx - 10, hy - 8, hx - 9, hy - 22, hx + 12, hy - 23, hx + 12, hy - 8]);
    poly(c, [hx + 10, hy - 10, hx + 24, hy - 7, hx + 10, hy - 6]);
  }
  if (o.pipe) { c.fillRect(hx + 9, hy + 5, 11, 2); c.fillRect(hx + 18, hy + 1, 5, 7); }
  c.restore();
}

function details(c: Ctx, o: Fig, walk: number | null, breath: number) {
  const stoop = o.stoop ?? 0;
  c.save();
  c.translate(stoop * 9, stoop * 4);
  c.rotate(stoop * 0.18);
  const top = -146 - breath * 1.2, hx = 4, hy = top - 18;
  // Quiet fabric planes and seams keep dark coats readable between light sources.
  c.fillStyle = o.dress ? 'rgba(235,220,200,0.13)' : 'rgba(195,174,148,0.15)';
  poly(c, [-11, top + 3, -2, top + 21, -8, top + 57, -16, top + 46]);
  c.strokeStyle = 'rgba(215,192,156,0.2)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(1, top + 20); c.lineTo(0, -(o.coatLen ?? 52) + 2); c.stroke();
  c.fillStyle = 'rgba(216,196,160,0.45)';
  for (let y = top + 30; y < -79; y += 18) c.fillRect(3, y, 2, 2);
  // Collar edge and a short cheek highlight preserve the profile without a portrait workflow.
  c.fillStyle = 'rgba(200,180,149,0.25)'; poly(c, [-9, top + 1, 0, top + 13, 8, top - 2, 4, top + 7]);
  if (!o.skin) { c.fillStyle = 'rgba(192,164,132,0.3)'; c.fillRect(hx + 7, hy + 1, 3, 6); }
  if (o.stripe) { c.fillStyle = 'rgba(214,150,70,0.55)'; c.fillRect(-19, -68, 38, 3); c.fillRect(-15, top + 40, 30, 2); }
  if (o.badge) { c.fillStyle = o.badge; c.fillRect(hx + 7, hy - 25, 6, 12); }
  if (o.pipe) { c.fillStyle = '#ff8a3a'; c.fillRect(hx + 19, hy, 3, 2); }
  if (o.shell) { c.fillStyle = '#9fe0ff'; c.fillRect(hx - 2, hy, 3, 3); }
  if (o.skin) { c.fillStyle = o.skin; c.beginPath(); c.ellipse(hx + 5, hy + 1, 4, 6, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  void walk;
}

function frame(c: Ctx, x: number, y: number, o: Fig, walk: number | null, breath: number) {
  const s = o.tall ?? 1;
  const bob = 0; // feet stay on the walk plane; torso supplies the walking rise below
  c.save();
  c.translate(x, y + bob);
  c.scale(s, s);
  c.save(); c.translate(2, -1); c.fillStyle = o.rim; body(c, o, walk, breath, 'rim'); c.restore();
  c.fillStyle = o.coat; body(c, o, walk, breath, 'base');
  details(c, o, walk, breath);
  c.restore();
}

/** Paint a 16-frame sheet: 0–3 idle breathing, 4–15 walk. */
export function figureSheet(scene: Phaser.Scene, key: string, o: Fig) {
  if (scene.textures.exists(key)) return;
  const t = paint(scene, key, FIG_W * 16, FIG_H, (c) => {
    [0, 0.5, 1, 0.5].forEach((b, i) => frame(c, i * FIG_W + 40, FEET, o, null, b));
    for (let i = 0; i < 12; i++) frame(c, (i + 4) * FIG_W + 40, FEET, o, (i / 12) * Math.PI * 2, 0.5);
  });
  for (let i = 0; i < 16; i++) t.add(i, 0, i * FIG_W, 0, FIG_W, FIG_H);
  const a = scene.anims;
  if (!a.exists(key + ':idle')) a.create({ key: key + ':idle', frames: IDLE.map((f) => ({ key, frame: f })), frameRate: 2.4, repeat: -1 });
  if (!a.exists(key + ':walk')) a.create({ key: key + ':walk', frames: WALK.map((f) => ({ key, frame: f })), frameRate: 14, repeat: -1 });
}

const WARM = 'rgba(242,165,74,0.85)';
const COLD = 'rgba(150,190,205,0.7)';

/** The cast. Distinct silhouettes: helmet brim, captain's cap and pipe, white dress, straw hair, stoop, beard. */
export const CAST: Record<string, Fig> = {
  montag: { coat: '#1a1615', rim: WARM, hat: 'helmet', stripe: true, badge: '#c98a3a' },
  montagWork: { coat: '#262422', rim: WARM, hat: 'helmet', stripe: true, badge: '#c98a3a', work: true },
  montagCivil: { coat: '#1f1b1a', rim: WARM, hat: 'none', hair: 'short', coatLen: 70 },
  beatty: { coat: '#141111', rim: 'rgba(232,104,46,0.85)', hat: 'cap', pipe: true, bulk: 1.18, tall: 1.06, stripe: true },
  fireman: { coat: '#171313', rim: 'rgba(242,165,74,0.55)', hat: 'helmet', stripe: true, bulk: 1.08 },
  clarisse: { coat: '#cfc6b5', rim: COLD, hair: 'long', hairCol: '#2a2420', dress: '#ddd5c4', tall: 0.92, bulk: 0.82, skin: '#cfc3ad' },
  mildred: { coat: '#4a3c44', rim: 'rgba(160,200,215,0.75)', hair: 'straw', hairCol: '#b59a5a', dress: '#5a4a52', tall: 0.95, bulk: 0.8, shell: true },
  faber: { coat: '#141313', rim: WARM, hair: 'white', hairCol: '#cfc9bd', stoop: 0.7, tall: 0.93, coatLen: 64 },
  granger: { coat: '#1e2a36', rim: 'rgba(242,165,74,0.9)', hair: 'short', beard: true, coatLen: 78, bulk: 1.05 },
  bookman: { coat: '#1b2530', rim: 'rgba(242,165,74,0.8)', hair: 'white', beard: true, coatLen: 78, stoop: 0.2 },
  woman: { coat: '#201a19', rim: 'rgba(242,165,74,0.7)', hair: 'white', hairCol: '#bdb6a8', dress: '#3a2e2a', stoop: 0.45, tall: 0.88, bulk: 0.85 },
  lady1: { coat: '#2a2024', rim: 'rgba(160,200,215,0.7)', hair: 'short', dress: '#6b3d4a', tall: 0.93, bulk: 0.85 },
  lady2: { coat: '#262126', rim: 'rgba(160,200,215,0.7)', hair: 'straw', dress: '#3f4f5f', tall: 0.96, bulk: 0.9 },
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
