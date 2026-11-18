// Room kits. A kit paints its textures once (keyed by kit name, freed on chapter change), places the
// background, props and foreground occluders, and returns its lights, floor style and effect hooks.
import Phaser from 'phaser';
import { settings } from '../settings.ts';
import type { Light, RoomDef } from '../content/types.ts';
import type { Flags } from '../state.ts';
import { C, FLOOR_TOP, H, W } from '../view.ts';
import { hgrad, paint, poly, radial, rng, speckle, vgrad, type Ctx } from './core.ts';
import { fireAt } from './fx.ts';
import { pine } from './cinema.ts';
import { contactShadow } from './setLayers.ts';

export interface FloorStyle { key: string; top: string; bottom: string; line: string; spacing: number; kind: 'tile' | 'boards' | 'asphalt' | 'earth' | 'water' | 'metal' }
export interface KitParts {
  floor: FloorStyle;
  lights: Light[];
  fx: Record<string, () => void>;
  update?: (f: Flags) => void;
  tick?: (dt: number, camX: number) => void;
}
export type Kit = (s: Phaser.Scene, room: RoomDef) => KitParts;

const ADD = Phaser.BlendModes.ADD;
const once = new Set<string>();
/** Run an effect only once per room visit (flags re-check on every refresh). */
const first = (key: string, fn: () => void) => { if (!once.has(key)) { once.add(key); fn(); } };
export const resetKitOnce = () => once.clear();

// ---------------- shared pieces ----------------

function nightSky(s: Phaser.Scene, key = 'k:sky', moon = true, glow = 0.35) {
  paint(s, key, 1600, H, (c) => {
    c.fillStyle = vgrad(c, 0, H, [[0, '#05060a'], [0.5, '#120c10'], [0.8, '#33170f'], [1, '#0a0606']]);
    c.fillRect(0, 0, 1600, H);
    const r = rng(9);
    for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(230,225,210,${0.15 + r() * 0.5})`; c.fillRect(r() * 1600, r() * 260, 1, 1); }
    if (moon) { radial(c, 360, 100, 80, 'rgba(236,225,200,A)', 0.18); radial(c, 360, 100, 20, 'rgba(236,225,200,A)', 0.55); }
    [[420, glow], [1050, glow * 0.8], [1400, glow * 0.6]].forEach(([x, a]) => radial(c, x, 430, 280, 'rgba(232,104,46,A)', a));
  });
  const sky = s.add.image(0, 0, key).setOrigin(0).setScrollFactor(0.12).setDepth(0);
  if (!key.includes('wild') && s.textures.exists('city:backdrop')) s.add.image(0, -15, 'city:backdrop').setOrigin(0).setDisplaySize(1600, 534).setScrollFactor(0.18).setAlpha(0.85).setDepth(0.2).setName('city-backdrop-layer');
  return sky;
}

function skyline(s: Phaser.Scene, key: string, width: number, lit: number, base = 330, col = '#120d0e', tall = 160) {
  paint(s, key, width, H, (c) => {
    const r = rng(width + lit * 1000);
    for (let x = -20; x < width;) {
      const w = 30 + r() * 80, h = 60 + r() * tall;
      c.fillStyle = col; c.fillRect(x, base - h, w, H);
      if (r() > 0.6) c.fillRect(x + w / 2 - 1, base - h - 30, 2, 32);
      for (let wy = base - h + 10; wy < base; wy += 12) for (let wx = x + 6; wx < x + w - 6; wx += 10) {
        const v = r();
        if (v < lit) { c.fillStyle = 'rgba(242,165,74,0.55)'; c.fillRect(wx, wy, 3, 4); }
        else if (v < lit + 0.02) { c.fillStyle = 'rgba(120,175,200,0.6)'; c.fillRect(wx, wy, 3, 4); }
      }
      c.fillStyle = col;
      x += w + r() * 12;
    }
  });
}

function addLayer(s: Phaser.Scene, key: string, factor: number, depth: number, y = 0) {
  return s.add.image(0, y, key).setOrigin(0).setScrollFactor(factor).setDepth(depth);
}

function tree(c: Ctx, x: number, base: number, h: number, col: string, r: () => number) {
  c.fillStyle = col;
  poly(c, [x - 8, base, x - 3, base - h, x + 3, base - h, x + 8, base]);
  c.strokeStyle = col; c.lineWidth = 4;
  // Broken branching silhouettes avoid a row of identical circular crowns.
  for (let i = 0; i < 9; i++) {
    const y = base - h * (0.3 + i * 0.065), side = i % 2 ? -1 : 1;
    const reach = h * (0.12 + r() * 0.12) * (1 - i * 0.055);
    c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x + side * reach, y - 22); c.stroke();
    const cx = x + side * reach * 0.7, cy = y - 22, w = reach * 1.1;
    const points: number[] = [];
    for (let n = 0; n < 14; n++) {
      const angle = n / 14 * Math.PI * 2, shape = 0.75 + r() * 0.3;
      points.push(cx + Math.cos(angle) * w * shape, cy + Math.sin(angle) * h * 0.1 * shape);
    }
    poly(c, points);
  }
}

/** Baked architectural trim: a ceiling plane, baseboard and quiet vertical seams. */
function interiorTrim(c: Ctx, width: number, floor: number) {
  c.fillStyle = 'rgba(0,0,0,0.24)';
  poly(c, [0, 0, width, 0, width - 32, 36, 32, 36]);
  c.fillRect(0, floor - 15, width, 15);
  c.fillStyle = 'rgba(224,205,168,0.13)'; c.fillRect(0, floor - 16, width, 1);
  c.strokeStyle = 'rgba(220,200,170,0.08)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, 24); c.lineTo(width, 24); c.stroke();
}

/** Foreground occluder sprite (fades when Montag is behind it). */
function occluder(s: Phaser.Scene, key: string, x: number, factor = 1.3) {
  return s.add.image(x, H, key).setOrigin(0.5, 1).setScrollFactor(factor).setDepth(60).setData('occluder', factor);
}

/** A street lamp planted in the pavement: it scrolls with the street, so no foreground sprite slides across the scene. */
function lampPost(s: Phaser.Scene, x: number) {
  paint(s, 'k:lamppost', 40, 476, (c) => {
    c.fillStyle = hgrad(c, 17, 23, [[0, '#0c0909'], [1, '#1f1814']]); c.fillRect(17, 60, 6, 416);
    c.fillStyle = '#0c0909'; c.fillRect(8, 56, 28, 8); c.fillRect(30, 56, 4, 14); c.fillRect(13, 440, 14, 36);
    c.fillStyle = '#ffd08a'; c.fillRect(31, 70, 2, 3);
  });
  contactShadow(s, x, 472, 70, 0.6);
  return s.add.image(x, 476, 'k:lamppost').setOrigin(0.5, 1).setDepth(3);
}

function cones(s: Phaser.Scene, xs: number[], y: number, tint: number, alpha = 0.45) {
  return xs.map((x) => s.add.image(x, y, 'cone').setOrigin(0.5, 0).setTint(tint).setAlpha(alpha).setBlendMode(ADD).setDepth(2));
}

function dust(s: Phaser.Scene, width: number, tint: number = C.amberN) {
  s.add.particles(0, 0, 'dot', {
    x: { min: 0, max: width }, y: { min: 120, max: 470 }, speedX: { min: -5, max: 5 }, speedY: { min: -3, max: 3 },
    lifespan: 8000, frequency: 260, scale: { min: 0.4, max: 0.9 }, alpha: { start: 0.3, end: 0 }, tint, blendMode: ADD,
  }).setDepth(6);
}

function windowGlow(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(x + w / 2 - 1, y, 2, h); c.fillRect(x, y + h / 2 - 1, w, 2);
}

// ---------------- the firehouse ----------------

export const LAMPS = [470, 1110, 1520, 2010];
const WINDOWS = [160, 760, 1300, 1900];

const station: Kit = (s, room) => {
  const RW = 2400, F = FLOOR_TOP;
  nightSky(s);
  paint(s, 'k:station:wall', RW, F, (c) => {
    c.fillStyle = vgrad(c, 0, F, [[0, '#231c18'], [1, '#161211']]); c.fillRect(0, 0, RW, F);

    c.fillStyle = '#1a1412'; c.fillRect(0, 300, RW, F - 300);
    c.fillStyle = '#2b221e'; c.fillRect(0, 296, RW, 8);
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (let y = 322; y < F; y += 22) c.fillRect(0, y, RW, 1);
    // bureau emblem
    c.save(); c.globalAlpha = 0.5; c.strokeStyle = '#7d2513'; c.lineWidth = 6;
    c.beginPath(); c.arc(1030, 180, 86, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#8a2a14'; c.font = '700 90px Oswald'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('451', 1030, 176);
    c.font = '500 12px Oswald'; c.fillText('B U R E A U   O F   F I R E', 1030, 238); c.restore();
    const wr = rng(3);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(30,24,21,${wr() * 0.7})`; c.fillRect(940 + wr() * 180, 90 + wr() * 170, 1 + wr() * 3, 1 + wr() * 2); }
    // the list of forbidden titles: tiny illegible typed lines on a long board
    c.fillStyle = '#d9cba8'; c.fillRect(560, 70, 120, 150); c.fillStyle = 'rgba(30,20,15,0.6)';
    for (let y = 80; y < 214; y += 5) c.fillRect(568, y, 60 + ((y * 13) % 40), 1);
    c.fillStyle = '#1d1714'; c.fillRect(2120, 70, 280, F - 70);
    c.fillStyle = 'rgba(0,0,0,0.45)'; for (let y = 80; y < F; y += 14) c.fillRect(2120, y, 280, 2);
    c.globalCompositeOperation = 'destination-out';
    for (const x of WINDOWS) { c.beginPath(); c.moveTo(x - 58, 280); c.lineTo(x - 58, 140); c.arc(x, 140, 58, Math.PI, 0); c.lineTo(x + 58, 280); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    for (const x of WINDOWS) {
      c.strokeStyle = '#0b0807'; c.lineWidth = 10;
      c.beginPath(); c.moveTo(x - 58, 280); c.lineTo(x - 58, 140); c.arc(x, 140, 58, Math.PI, 0); c.lineTo(x + 58, 280); c.closePath(); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(x, 82); c.lineTo(x, 280); c.stroke();
      for (const y of [150, 200, 250]) { c.beginPath(); c.moveTo(x - 58, y); c.lineTo(x + 58, y); c.stroke(); }
      c.fillStyle = '#2c231e'; c.fillRect(x - 68, 280, 136, 8);
    }
    c.fillStyle = '#0c0908'; c.fillRect(0, 0, RW, 56);
    c.strokeStyle = '#1b1512'; c.lineWidth = 3;
    for (let x = 0; x < RW; x += 60) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 30, 50); c.lineTo(x + 60, 4); c.stroke(); }
    for (const [y, h] of [[60, 8], [72, 5]]) { c.fillStyle = '#2a201b'; c.fillRect(0, y, RW, h); c.fillStyle = 'rgba(242,165,74,0.18)'; c.fillRect(0, y, RW, 1); }
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(300, 52, 30, 7, 0, 0, Math.PI * 2); c.fill();
    radial(c, 300, 40, 50, 'rgba(242,165,74,A)', 0.25);
    for (const x of LAMPS) {
      c.fillStyle = '#0a0807'; c.fillRect(x - 1, 56, 2, 56);
      poly(c, [x - 6, 110, x + 6, 110, x + 22, 128, x - 22, 128]);
      c.fillStyle = '#ffd08a'; c.fillRect(x - 10, 127, 20, 3);
      radial(c, x, 128, 26, 'rgba(255,200,120,A)', 0.5);
    }
    interiorTrim(c, RW, F);
    speckle(c, RW, F, 20000, 11);
  });
  addLayer(s, 'k:station:wall', 1, 1);
  for (const x of WINDOWS) s.add.image(x + 40, 120, 'cone').setOrigin(0.5, 0).setRotation(-0.3).setScale(0.55, 0.9).setTint(0x9ab8c4).setAlpha(0.14).setBlendMode(ADD).setDepth(2);
  const lampCones = cones(s, LAMPS, 126, C.amberN, 0.48);
  const tired = lampCones[2];
  const stutter = () => {
    s.tweens.chain({ targets: tired, tweens: [{ alpha: 0.08, duration: 60 }, { alpha: 0.48, duration: 80 }, { alpha: 0.12, duration: 50 }, { alpha: 0.48, duration: 120 }] });
    s.time.delayedCall(3000 + Math.random() * 4000, stutter);
  };
  s.time.delayedCall(3000, stutter);
  stationProps(s);
  s.add.image(190, 52, 'k:pole').setOrigin(0.5, 0).setDepth(3).setScale(1, (F - 52) / 420);
  for (const [sx, sw] of [[620, 190], [1520, 120], [1770, 220], [2010, 130], [2290, 340], [1110, 190]]) contactShadow(s, sx, sx === 2290 ? 468 : sx === 1110 ? 454 : F - 2, sw, 0.55);
  s.add.image(620, F, 'k:rack').setOrigin(0.5, 1).setDepth(3);
  s.add.image(1110, 456, 'k:table').setOrigin(0.5, 1).setDepth(4.6);
  s.add.image(1520, F, 'k:pump').setOrigin(0.5, 1).setDepth(3);
  s.add.image(1770, F, 'k:kennel').setOrigin(0.5, 1).setDepth(3);
  const hound = s.add.image(1770, F - 6, 'k:hound').setOrigin(0.5, 1).setDepth(3);
  const eye = s.add.image(1724, F - 52, 'glow').setScale(0.12).setTint(C.coldN).setAlpha(0.8).setBlendMode(ADD).setDepth(3);
  s.tweens.add({ targets: eye, alpha: 0.35, yoyo: true, repeat: -1, duration: 1300 });
  s.add.image(2010, F, 'k:dispatch').setOrigin(0.5, 1).setDepth(3);
  const bulb = s.add.image(2065, F - 204, 'glow').setScale(0.55).setTint(C.redN).setAlpha(0).setBlendMode(ADD).setDepth(3);
  s.add.image(2290, 470, 'k:truck').setOrigin(0.5, 1).setDepth(4.5);
  dust(s, RW);
  let alarm: Phaser.Tweens.Tween | undefined;
  return {
    floor: { key: 'concrete', top: '#2a221d', bottom: '#0b0807', line: 'rgba(0,0,0,0.45)', spacing: 240, kind: 'tile' },
    lights: [...LAMPS.map((x) => ({ x, y: 300, color: C.amberN, r: 260 })), { x: 1770, y: 380, color: C.coldN, r: 160 }],
    fx: {
      houndGrowl: () => {
        eye.setTint(C.redN);
        s.tweens.add({ targets: hound, x: '+=1.5', yoyo: true, repeat: 7, duration: 40 });
        s.tweens.add({ targets: eye, scale: 0.24, yoyo: true, duration: 400, onComplete: () => eye.setTint(C.coldN) });
      },
      houndGone: () => { hound.setVisible(false); eye.setVisible(false); },
      // the Hound wakes as someone passes: rises on its legs, eye goes from cold to red, settles back
      houndStir: () => {
        if (!hound.visible) return;
        eye.setTint(C.redN);
        s.tweens.add({ targets: [hound, eye], y: '-=7', duration: 380, yoyo: true, hold: 900, ease: 'Sine.easeInOut', onComplete: () => eye.setTint(C.coldN) });
        s.tweens.add({ targets: eye, scale: 0.26, duration: 380, yoyo: true, hold: 900 });
      },
      alarm: () => { s.tweens.add({ targets: bulb, alpha: 0.9, yoyo: true, repeat: 7, duration: 150 }); if (!settings.reducedMotion) s.cameras.main.flash(250, 120, 20, 10); },
    },
    update: (f) => {
      const want = room.id === 'station2' && !!f['s2.hound'] && !!f['s2.cards'] && !f['s2.alarm'];
      if (want && !alarm) alarm = s.tweens.add({ targets: bulb, alpha: { from: 0.1, to: 0.7 }, yoyo: true, repeat: -1, duration: 600 });
      if (!want && alarm) { alarm.remove(); alarm = undefined; bulb.setAlpha(0); }
      if (room.id === 'station3') { hound.setVisible(false); eye.setVisible(false); } // the kennel is empty that night
    },
  };
};

function stationProps(s: Phaser.Scene) {
  paint(s, 'k:pole', 24, 420, (c) => {
    c.fillStyle = hgrad(c, 6, 18, [[0, '#4a3016'], [0.45, '#e6b866'], [0.6, '#fff0c8'], [1, '#5a3a18']]); c.fillRect(6, 0, 12, 420);
  });
  paint(s, 'k:rack', 170, 230, (c) => {
    c.fillStyle = '#24190f'; c.fillRect(8, 10, 154, 220);
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = 8; x < 162; x += 22) c.fillRect(x, 10, 1, 220);
    c.fillStyle = '#3a2a1c'; c.fillRect(0, 42, 170, 7);
    for (const x of [48, 120]) {
      c.fillStyle = '#1c1614'; c.beginPath(); c.ellipse(x, 40, 26, 5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + 2, 38, 13, Math.PI, 0); c.fill();
      c.fillStyle = '#8a5a22'; c.fillRect(x + 8, 18, 9, 13);
      c.fillStyle = '#171211'; poly(c, [x - 18, 64, x + 18, 64, x + 26, 178, x - 26, 178]);
      c.fillStyle = 'rgba(214,150,70,0.6)'; c.fillRect(x - 25, 158, 50, 4);
    }
    c.strokeStyle = '#3b2a1e'; c.lineWidth = 7; for (const r of [24, 16]) { c.beginPath(); c.arc(84, 204, r, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = hgrad(c, 100, 140, [[0, '#7a5220'], [0.5, '#ffe2a0'], [1, '#8a5a22']]); poly(c, [104, 196, 142, 190, 142, 198, 104, 206]);
  });
  // the card table, seen from a little above: a real tabletop with a hand dealt, a deck, a few coins and a mug
  paint(s, 'k:table', 200, 84, (c) => {
    c.fillStyle = '#1a1310'; c.fillRect(24, 44, 6, 40); c.fillRect(170, 44, 6, 40);
    c.fillStyle = '#2a1e16'; c.fillRect(10, 32, 180, 10);
    c.fillStyle = vgrad(c, 12, 32, [[0, '#5a4030'], [1, '#3e2c20']]); poly(c, [28, 12, 172, 12, 194, 32, 6, 32]);
    c.fillStyle = 'rgba(255,225,170,0.3)'; c.fillRect(6, 32, 188, 1);
    const card = (x: number, y: number, rot: number, suit: number) => {
      c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#f0e8d4'; c.fillRect(-6, -8, 12, 16); c.strokeStyle = 'rgba(40,30,20,0.5)'; c.lineWidth = 1; c.strokeRect(-6, -8, 12, 16);
      c.fillStyle = suit % 2 ? '#a82a22' : '#1a1412';
      if (suit % 2) poly(c, [0, 5, -4, 0, 0, -4, 4, 0]); else { c.beginPath(); c.arc(0, -1, 3.5, 0, Math.PI * 2); c.fill(); c.fillRect(-1, 0, 2, 5); }
      c.restore();
    };
    [[56, 22, -0.5, 0], [70, 21, -0.2, 1], [84, 21, 0.1, 2], [98, 22, 0.35, 3], [112, 23, 0.6, 1]].forEach(([x, y, r, k]) => card(x, y, r, k));
    c.save(); c.translate(140, 22); c.rotate(-0.12); c.fillStyle = '#244057'; c.fillRect(-7, -9, 14, 18); c.strokeStyle = '#e4d6b6'; c.lineWidth = 1; c.strokeRect(-5, -7, 10, 14); c.restore();
    for (const [x, y] of [[40, 24], [44, 22], [162, 26]]) { c.fillStyle = '#c8a24a'; c.beginPath(); c.ellipse(x, y, 4, 2, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#d9cba8'; c.fillRect(176, 14, 9, 9); c.fillStyle = '#2a1e16'; c.fillRect(177, 15, 7, 2); c.strokeStyle = '#d9cba8'; c.lineWidth = 1.5; c.beginPath(); c.arc(186, 19, 3, -1.2, 1.2); c.stroke();
  });
  paint(s, 'k:pump', 250, 210, (c) => {
    c.fillStyle = '#16110f'; c.fillRect(0, 194, 250, 16);
    c.strokeStyle = '#5a4026'; c.lineWidth = 7; c.beginPath(); c.moveTo(20, 50); c.lineTo(230, 50); c.stroke();
    for (const x of [45, 125, 205]) {
      c.fillStyle = hgrad(c, x - 31, x + 31, [[0, '#3d0c08'], [0.35, '#a52c1c'], [0.55, '#c8422a'], [1, '#4a0f0a']]);
      c.beginPath(); c.roundRect(x - 31, 26, 62, 170, [26, 26, 4, 4]); c.fill();
      c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(x - 8, 34, 4, 156);
      c.fillStyle = '#d9cba8'; c.beginPath(); c.arc(x, 48, 9, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = 'rgba(236,225,200,0.75)'; c.font = '600 11px Oswald'; c.textAlign = 'center'; c.fillText('K E R O S E N E', 125, 124);
  });
  paint(s, 'k:kennel', 230, 160, (c) => {
    c.fillStyle = '#2c231f'; c.beginPath(); c.moveTo(0, 160); c.lineTo(0, 50); c.arc(115, 50, 115, Math.PI, 0); c.lineTo(230, 160); c.fill();
    c.fillStyle = vgrad(c, 0, 160, [[0, '#020303'], [1, '#0a1112']]);
    c.beginPath(); c.moveTo(12, 160); c.lineTo(12, 56); c.arc(115, 56, 103, Math.PI, 0); c.lineTo(218, 160); c.fill();
  });
  paint(s, 'k:hound', 180, 80, (c) => {
    const d = (col: string, dx: number, dy: number) => {
      c.save(); c.translate(dx, dy); c.fillStyle = c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = 3;
      for (const x of [66, 86, 110, 132]) { c.beginPath(); c.moveTo(x, 46); c.lineTo(x - 12, 56); c.lineTo(x - 16, 74); c.stroke(); c.beginPath(); c.moveTo(x + 4, 46); c.lineTo(x + 14, 58); c.lineTo(x + 10, 74); c.stroke(); }
      poly(c, [56, 34, 90, 24, 150, 28, 168, 40, 140, 50, 62, 50]); poly(c, [60, 30, 30, 38, 60, 48]);
      c.lineWidth = 1.5; c.beginPath(); c.moveTo(32, 39); c.lineTo(6, 43); c.stroke(); c.restore();
    };
    d('rgba(127,214,200,0.45)', 1, -1); d('#262c2d', 0, 0);
  });
  // the dispatch board: a felt board of address slots (some lit, some marked), a call lamp, the teletype and the desk telephone
  paint(s, 'k:dispatch', 190, 230, (c) => {
    c.fillStyle = '#2a1f18'; c.fillRect(6, 0, 178, 130); c.fillStyle = '#1b2a22'; c.fillRect(11, 5, 168, 120);
    c.fillStyle = '#0e0a08'; c.fillRect(11, 5, 168, 36);
    c.fillStyle = '#e4d6b6'; c.font = '600 15px Oswald'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('D I S P A T C H', 20, 20);
    c.font = '500 8px Oswald'; c.fillStyle = '#a99c86'; c.fillText('ENGINE  ·  ALARM  ·  ADDRESS', 20, 34);
    c.fillStyle = '#3a0f0c'; c.beginPath(); c.arc(150, 26, 9, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#8a7a58'; c.lineWidth = 2; c.stroke();
    for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
      const x = 17 + col * 40, y = 48 + row * 25, n = row * 4 + col;
      c.fillStyle = '#0c1410'; c.fillRect(x, y, 36, 22);
      c.fillStyle = '#e6dcc0'; c.fillRect(x + 2, y + 5, 32, 17);
      c.fillStyle = 'rgba(40,30,22,0.6)'; for (let l = 0; l < 3; l++) c.fillRect(x + 5, y + 9 + l * 4, 18 + ((n * 7 + l * 5) % 10), 1);
      c.fillStyle = n % 5 === 0 ? '#c8442a' : n % 3 === 0 ? '#f2a54a' : '#2a3a30'; c.beginPath(); c.arc(x + 5, y + 2.5, 2, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#2e231c'; c.fillRect(0, 150, 190, 10); c.fillStyle = '#19130f'; c.fillRect(10, 160, 170, 70);
    c.fillStyle = '#2c2420'; c.beginPath(); c.roundRect(28, 128, 74, 22, [8, 8, 2, 2]); c.fill();
    c.fillStyle = '#d9cba8'; c.fillRect(44, 116, 40, 14); c.fillStyle = 'rgba(40,30,22,0.6)'; for (let l = 0; l < 3; l++) c.fillRect(48, 119 + l * 3, 30 - l * 4, 1);
    c.fillStyle = '#14100e'; c.beginPath(); c.roundRect(122, 138, 40, 12, [8, 8, 2, 2]); c.fill(); c.beginPath(); c.roundRect(120, 130, 44, 8, 4); c.fill();
    c.fillStyle = '#d8d0b8'; c.beginPath(); c.arc(142, 144, 4, 0, Math.PI * 2); c.fill();
  });
  truckTexture(s);
}

function truckTexture(s: Phaser.Scene) {
  paint(s, 'k:truck', 330, 250, (c) => {
    c.fillStyle = '#5a5048'; c.fillRect(10, 30, 320, 4); c.fillRect(10, 46, 320, 4); for (let x = 18; x < 330; x += 18) c.fillRect(x, 30, 3, 20);
    c.fillStyle = vgrad(c, 56, 216, [[0, '#8a3a16'], [0.5, '#6a240e'], [1, '#2a0a07']]); c.beginPath(); c.roundRect(0, 56, 330, 160, [14, 0, 0, 6]); c.fill();
    c.fillStyle = '#b8a57e'; c.fillRect(0, 150, 330, 5);
    c.fillStyle = '#e4c37e'; c.font = '700 44px Oswald'; c.textAlign = 'center'; c.fillText('451', 190, 132);
    for (const x of [70, 260]) { c.fillStyle = '#060404'; c.beginPath(); c.arc(x, 214, 36, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3a302a'; c.beginPath(); c.arc(x, 214, 14, 0, Math.PI * 2); c.fill(); }
  });
}

// ---------------- streets (burn, corner, lawn, boulevard, alley) ----------------

function pipeFacade(c: Ctx,x:number,y:number,h:number){c.strokeStyle='#0b1110';c.lineWidth=6;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+h);c.stroke();c.strokeStyle='#5a6256';c.lineWidth=1;c.beginPath();c.moveTo(x-2,y);c.lineTo(x-2,y+h);c.stroke();for(let n=20;n<h;n+=50){c.fillStyle='#4b5148';c.fillRect(x-4,y+n,8,3);}}

function facade(c: Ctx, x: number, w: number, h: number, base: number, o: { col: string; lit?: string; tvs?: boolean; old?: boolean; r: () => number }) {
  const top=base-h;
  c.fillStyle=hgrad(c,x,x+w,[[0,'#0b1112'],[.18,o.col],[.82,o.col],[1,'#10191a']]);c.fillRect(x,top,w,h);
  c.fillStyle='#0a1010';poly(c,[x-5,top,x+w/2,top-24,x+w+5,top,x+w+5,top+5,x-5,top+5]);
  c.strokeStyle='rgba(122,140,124,0.18)';c.lineWidth=1;
  for(let y=top+17;y<base;y+=15){c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();for(let b=x+((Math.round(y/15)%2)*22);b<x+w;b+=44){c.beginPath();c.moveTo(b,y-15);c.lineTo(b,y);c.stroke();}}
  c.fillStyle='#555b4e';c.fillRect(x-5,top+2,w+10,5);c.fillStyle='#161d1a';c.fillRect(x+w-15,top+7,15,h-7);
  pipeFacade(c,x+w-10,top+20,h-25);
  const rows=Math.floor((h-40)/70);
  for(let ry=0;ry<rows;ry++)for(let wx=x+24;wx<x+w-50;wx+=70){
    const y=top+30+ry*70,lit=o.lit&&o.r()>.35;
    c.fillStyle='#080c0d';c.beginPath();c.roundRect(wx-4,y-7,48,57,[12,12,0,0]);c.fill();
    windowGlow(c,wx,y,40,46,lit?o.lit!:'rgba(10,16,19,0.9)');
    c.strokeStyle='rgba(169,167,139,.28)';c.lineWidth=2;c.strokeRect(wx-2,y-2,44,50);c.fillStyle='#51534b';c.fillRect(wx-6,y+48,52,4);
    if(!lit){c.fillStyle='rgba(65,97,101,.3)';poly(c,[wx+2,y+3,wx+15,y+3,wx+4,y+39]);}
  }
  if(o.tvs)for(let wx=x+24;wx<x+w-50;wx+=140)windowGlow(c,wx,base-76,40,46,'rgba(90,155,170,0.5)');
  c.fillStyle='#080e0e';c.beginPath();c.roundRect(x+w/2-23,base-83,46,83,[16,16,0,0]);c.fill();
  c.strokeStyle='#4c5149';c.lineWidth=3;c.stroke();c.fillStyle='#997952';c.beginPath();c.arc(x+w/2+12,base-36,2,0,Math.PI*2);c.fill();
  c.fillStyle='#2c342e';poly(c,[x+w/2-29,base-2,x+w/2+30,base-2,x+w/2+40,base+6,x+w/2-38,base+6]);
  if(o.old)for(let i=0;i<80;i++){c.fillStyle='rgba(7,11,10,.3)';c.fillRect(x+o.r()*w,top+o.r()*h,2+o.r()*14,1+o.r()*4);}

}

/** Boulevard: a flat-roofed shop block with lit display windows, a striped awning and a sign band. */
function storefront(c: Ctx, x: number, w: number, h: number, base: number, o: { col: string; sign: string; awning: string; r: () => number }) {
  const top = base - h, r = o.r;
  c.fillStyle = hgrad(c, x, x + w, [[0, '#0c0a0b'], [0.1, o.col], [0.9, o.col], [1, '#0c0a0b']]); c.fillRect(x, top, w, h);
  c.fillStyle = '#3a3532'; c.fillRect(x - 3, top, w + 6, 7); c.fillStyle = 'rgba(255,230,190,0.14)'; c.fillRect(x - 3, top, w + 6, 1);
  for (let wy = top + 20; wy < base - 120; wy += 48) for (let wx = x + 14; wx < x + w - 30; wx += 40) {
    const lit = r() > 0.55;
    c.fillStyle = lit ? 'rgba(242,176,92,0.62)' : 'rgba(14,18,24,0.95)'; c.fillRect(wx, wy, 26, 32);
    c.strokeStyle = '#3a3a3a'; c.lineWidth = 2; c.strokeRect(wx, wy, 26, 32); c.fillStyle = '#3a3a3a'; c.fillRect(wx + 12, wy, 2, 32);
  }
  c.fillStyle = '#0a0809'; c.fillRect(x, base - 112, w, 22);
  c.fillStyle = '#e4d6b6'; c.font = '700 14px Oswald'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.sign, x + w / 2, base - 101);
  c.fillStyle = vgrad(c, base - 84, base - 4, [[0, 'rgba(255,196,120,0.85)'], [1, 'rgba(176,110,56,0.7)']]); c.fillRect(x + 10, base - 84, w - 20, 78);
  c.fillStyle = 'rgba(20,10,6,0.55)'; for (let sx = x + 26; sx < x + w - 24; sx += 34) { c.fillRect(sx, base - 56, 20, 30); c.fillRect(sx + 4, base - 70, 12, 14); } // goods in the window
  c.fillStyle = '#1c1612'; c.fillRect(x + w / 2 - 1, base - 84, 3, 78); c.fillRect(x + 10, base - 8, w - 20, 4);
  for (let k = 0, ax = x + 4; ax < x + w - 4; k++, ax += 18) { c.fillStyle = k % 2 ? '#d8cdb4' : o.awning; poly(c, [ax, base - 92, ax + 18, base - 92, ax + 20, base - 76, ax - 2, base - 76]); }
  radial(c, x + w / 2, base - 44, w * 0.7, 'rgba(255,196,120,A)', 0.12);
}

/** Lawn: a two-storey frame house with clapboard, a gable, a porch, shutters and a clipped hedge. */
function suburbHouse(c: Ctx, x: number, w: number, h: number, base: number, o: { col: string; roof: string; r: () => number; lit?: string }) {
  const top = base - h, r = o.r;
  c.fillStyle = hgrad(c, x, x + w, [[0, '#0e0d0f'], [0.08, o.col], [0.92, o.col], [1, '#0e0d0f']]); c.fillRect(x, top, w, h);
  c.fillStyle = 'rgba(255,255,255,0.045)'; for (let y = top + 7; y < base; y += 9) c.fillRect(x, y, w, 1);
  c.fillStyle = o.roof; poly(c, [x - 16, top + 6, x + w / 2, top - 64, x + w + 16, top + 6]);
  c.fillStyle = 'rgba(255,255,255,0.08)'; poly(c, [x - 16, top + 6, x + w / 2, top - 64, x + w / 2, top - 58, x - 8, top + 6]);
  c.fillStyle = '#2a2220'; c.fillRect(x + w * 0.72, top - 66, 16, 48);
  const win = (wx: number, wy: number, lit: boolean) => {
    c.fillStyle = lit ? (o.lit ?? 'rgba(242,176,92,0.7)') : 'rgba(12,16,22,0.95)'; c.fillRect(wx, wy, 30, 40);
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(wx + 14, wy, 2, 40); c.fillRect(wx, wy + 19, 30, 2);
    c.fillStyle = '#3a4a3c'; c.fillRect(wx - 9, wy, 8, 40); c.fillRect(wx + 31, wy, 8, 40); // shutters
  };
  for (const wx of [x + 26, x + w - 56]) win(wx, top + 22, r() > 0.6);
  win(x + 26, base - 76, r() > 0.5); win(x + w - 56, base - 76, r() > 0.5);
  c.fillStyle = '#0a0c0c'; c.beginPath(); c.roundRect(x + w / 2 - 15, base - 66, 30, 66, [6, 6, 0, 0]); c.fill();
  c.fillStyle = '#997952'; c.fillRect(x + w / 2 + 9, base - 34, 3, 3);
  c.fillStyle = '#2a2624'; c.fillRect(x + w / 2 - 36, base - 80, 72, 7); poly(c, [x + w / 2 - 40, base - 80, x + w / 2 + 40, base - 80, x + w / 2 + 28, base - 90, x + w / 2 - 28, base - 90]);
  c.fillStyle = '#34302c'; c.fillRect(x + w / 2 - 34, base - 74, 4, 74); c.fillRect(x + w / 2 + 30, base - 74, 4, 74);
  c.fillStyle = '#3c3834'; c.fillRect(x + w / 2 - 24, base - 4, 48, 4); c.fillRect(x + w / 2 - 30, base - 1, 60, 3);
  c.fillStyle = '#0d150f'; for (let hx = x - 6; hx < x + w + 6; hx += 14) { if (Math.abs(hx - (x + w / 2)) < 34) continue; c.beginPath(); c.ellipse(hx + 7, base - 8, 9, 10, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#e4dccb'; c.globalAlpha = 0.5; for (let px = x - 20; px < x + w + 20; px += 11) c.fillRect(px, base - 16, 5, 16); c.fillRect(x - 20, base - 12, w + 40, 2); c.globalAlpha = 1; // white picket fence along the lawn
}

/** Alley: the backs of tall buildings: dark brick, barred windows, a fire escape, a lit back door and a dumpster. */
function alleyBack(c: Ctx, x: number, w: number, h: number, base: number, o: { r: () => number; door?: boolean }) {
  const top = base - h, r = o.r;
  c.fillStyle = hgrad(c, x, x + w, [[0, '#120b0a'], [0.1, '#2a1a15'], [0.9, '#2a1a15'], [1, '#120b0a']]); c.fillRect(x, top, w, h);
  c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = top + 8; y < base; y += 8) c.fillRect(x, y, w, 1);
  for (let i = 0; i < 90; i++) { c.fillStyle = r() > 0.5 ? 'rgba(255,200,160,0.04)' : 'rgba(0,0,0,0.18)'; c.fillRect(x + r() * w, top + r() * h, 6 + r() * 12, 4); }
  c.fillStyle = '#0c0807'; c.fillRect(x - 4, top, w + 8, 8);
  for (let wy = top + 24; wy < base - 110; wy += 56) for (let wx = x + 22; wx < x + w - 60; wx += 52) {
    c.fillStyle = r() > 0.75 ? 'rgba(242,176,92,0.5)' : 'rgba(8,10,14,0.95)'; c.fillRect(wx, wy, 24, 32);
    c.strokeStyle = '#4a4038'; c.lineWidth = 2; c.strokeRect(wx, wy, 24, 32); c.lineWidth = 1; for (let b = wx + 6; b < wx + 24; b += 6) { c.beginPath(); c.moveTo(b, wy); c.lineTo(b, wy + 32); c.stroke(); }
  }
  // fire escape: landings, railings and a zig-zag ladder down the face
  c.strokeStyle = '#0b0807'; c.lineWidth = 3;
  for (let ly = top + 70, n = 0; ly < base - 60; ly += 56, n++) {
    c.beginPath(); c.moveTo(x + 14, ly); c.lineTo(x + w - 54, ly); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.moveTo(x + 14, ly - 16); c.lineTo(x + w - 54, ly - 16); c.stroke(); for (let px = x + 14; px < x + w - 54; px += 12) { c.beginPath(); c.moveTo(px, ly); c.lineTo(px, ly - 16); c.stroke(); } c.lineWidth = 3;
    c.beginPath(); c.moveTo(n % 2 ? x + 14 : x + w - 54, ly); c.lineTo(n % 2 ? x + 58 : x + w - 98, ly + 56); c.stroke();
  }
  c.fillStyle = '#0a0706'; c.fillRect(x + w - 16, top + 10, 8, h - 10); // drain pipe
  const dx = x + w * 0.45;
  c.fillStyle = '#080605'; c.fillRect(dx, base - 70, 38, 70);
  if (o.door) { c.fillStyle = 'rgba(255,196,120,0.55)'; c.fillRect(dx + 4, base - 66, 30, 66); radial(c, dx + 19, base - 6, 90, 'rgba(255,190,110,A)', 0.3); }
  c.fillStyle = '#1b2420'; c.fillRect(x + 10, base - 36, 58, 34); c.fillStyle = '#2c3a34'; c.fillRect(x + 6, base - 42, 66, 8); c.fillStyle = '#0a0f0d'; c.fillRect(x + 14, base - 2, 6, 2); c.fillRect(x + 58, base - 2, 6, 2);
  c.fillStyle = '#1a1614'; c.beginPath(); c.roundRect(x + w - 70, base - 30, 22, 30, 3); c.fill(); c.fillRect(x + w - 74, base - 33, 30, 4);
}

function street(variant: 'burn' | 'corner' | 'lawn' | 'boulevard' | 'alley'): Kit {
  return (s, room) => {
    const RW = room.width, F = FLOOR_TOP;
    nightSky(s, 'k:sky', variant !== 'alley', variant === 'boulevard' ? 0.2 : 0.32);
    // each street has its own far skyline: low roofs in the suburb, lit towers on the boulevard, a dark canyon in the alley
    const mid = `k:street:mid:${variant}`;
    skyline(s, mid, W + (RW - W) * 0.5 + 40, variant === 'boulevard' ? 0.16 : variant === 'lawn' ? 0.03 : 0.05, 300, variant === 'alley' ? '#0d0909' : '#120d0e', variant === 'lawn' ? 40 : variant === 'boulevard' ? 220 : 160);
    addLayer(s, mid, 0.5, 0.5).setTint(0x8a7a78);
    const key = `k:street:${variant}`;
    paint(s, key, RW, F, (c) => {
      const r = rng(RW + variant.length);
      for (let x = 0; x < RW; x += 260) tree(c, x + r() * 100, F - 20, 160 + r() * 80, '#0e0a0a', r);
      if (variant === 'boulevard') {
        // a long block of shops, with the porcelain gas station near the far end
        const gx = RW - 560;
        for (let x = 0, k = 0; x < RW; k++) {
          const w = 190 + r() * 90, h = 190 + r() * 60;
          if (x + w > gx - 10 && x < gx + 290) { x = gx + 290; continue; }
          storefront(c, x, w, h, F, { col: ['#1c1618', '#241a18', '#161a1c', '#201c14'][k % 4], sign: ['CAFE', 'DRUGS', 'HATS', 'SHOES', 'BAKERY', 'BAR', 'TAILOR'][k % 7], awning: ['#7a2a22', '#2a4a5a', '#3a5a3a', '#6a4a22'][k % 4], r });
          x += w + 4;
        }
        c.fillStyle = '#d8d6d0'; c.fillRect(RW - 520, F - 120, 220, 120); c.fillStyle = '#a8a6a0'; c.fillRect(RW - 540, F - 140, 260, 22); // porcelain gas station
        c.fillStyle = '#1a1416'; c.font = '700 14px Oswald'; c.textAlign = 'left'; c.fillText('G A S', RW - 450, F - 124);
        c.fillStyle = '#8a2a1e'; c.fillRect(RW - 500, F - 46, 14, 46); c.fillRect(RW - 440, F - 46, 14, 46); c.fillStyle = '#e8e0cc'; c.fillRect(RW - 498, F - 40, 10, 10); c.fillRect(RW - 438, F - 40, 10, 10); // two pumps
      } else if (variant === 'alley') {
        for (let x = 0, k = 0; x < RW; k++) { const w = 180 + r() * 70; alleyBack(c, x, w, 270 + r() * 40, F, { r, door: k % 3 === 1 }); x += w + 2; }
        c.fillStyle = '#2a2018'; for (let x = 0; x < RW - 300; x += 18) c.fillRect(x, F - 90, 10, 90); // board fence
      } else {
        for (let x = 0; x < RW; x += 330) {
          if (variant === 'burn' && x > 800 && x < 1500) continue;
          if (variant === 'lawn' && x > 700 && x < 1500) continue;
          if (variant === 'corner') {
            // Clarisse's street: no two neighbours alike; most windows glow parlor-blue, one family still keeps a warm lamp
            const k = Math.round(x / 330), cols = ['#1a1517', '#1f1b1f', '#161315', '#211a16'];
            facade(c, x + 20 + (k * 23) % 40, 200 + (k * 37) % 70, 160 + (k * 53) % 50, F - 10,
              { col: cols[k % 4], r, tvs: k % 3 !== 1, lit: k % 5 === 2 ? 'rgba(242,190,120,0.55)' : undefined, old: k % 4 === 3 });
            continue;
          }
          if (variant === 'lawn') { const k = Math.round(x / 330); suburbHouse(c, x + 40, 190 + (k * 29) % 40, 150 + (k * 31) % 30, F - 10, { col: ['#2c2d30', '#302c28', '#242c2e', '#2e2a30'][k % 4], roof: ['#161416', '#1c1514', '#121618'][k % 3], r }); continue; }
          facade(c, x + 30, 240, 170 + r() * 30, F - 10, { col: '#1a1517', r, tvs: true });
        }
        if (variant === 'burn') facade(c, 860, 600, 300, F - 10, { col: '#2a201b', lit: 'rgba(242,165,74,0.75)', old: true, r });
        if (variant === 'lawn') { suburbHouse(c, 760, 380, 190, F - 10, { col: '#3a3532', roof: '#1a1414', r, lit: 'rgba(255,170,80,0.8)' }); suburbHouse(c, 1210, 250, 160, F - 10, { col: '#26282c', roof: '#121416', r }); }
        if (variant === 'corner') { facade(c, RW - 340, 300, 190, F - 10, { col: '#2a2420', lit: 'rgba(255,214,150,0.85)', r: () => 0.9 }); radial(c, RW - 190, F - 100, 220, 'rgba(255,200,120,A)', 0.25); }
        if (variant === 'corner') { c.fillStyle = '#0a0808'; c.fillRect(30, F - 120, 120, 120); radial(c, 90, F - 40, 90, 'rgba(240,225,190,A)', 0.4); c.fillStyle = '#d9cba8'; c.font = '600 12px Oswald'; c.fillText('S U B W A Y', 50, F - 100); }
      }
      if (variant === 'corner' || variant === 'burn' || variant === 'lawn') {
        // a strip of lawn in front of the houses: the books die on it, and Clarisse's dew lies on it
        c.fillStyle = '#0f150e'; c.fillRect(0, F - 10, RW, 10);
        const g = rng(77);
        for (let i = 0; i < RW / 2.5; i++) { c.fillStyle = g() < 0.5 ? '#1f2c1b' : '#0b100a'; c.fillRect(g() * RW, F - 12 - g() * 6, 1.5, 6 + g() * 7); }
      }
      c.fillStyle = vgrad(c, F - 14, F, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']]); c.fillRect(0, F - 14, RW, 14);
      speckle(c, RW, F, 9000, 21);
    });
    addLayer(s, key, 1, 1);
    const posts: number[] = [];
    for (let x = 500; x < RW; x += 700) { lampPost(s, x); posts.push(x); }
    const lights: Light[] = posts.map((x) => ({ x, y: 120, color: C.amberN, r: 320 }));
    for (const x of posts) s.add.image(x, 70, 'cone').setOrigin(0.5, 0).setScale(1.2, 1.25).setTint(C.amberN).setAlpha(0.3).setBlendMode(ADD).setDepth(2);
    const fx: Record<string, () => void> = {};
    let update: ((f: Flags) => void) | undefined;
    if (variant === 'burn') {
      truckTexture(s);
      contactShadow(s, 380, 466, 360, 0.6);
      s.add.image(380, 470, 'k:truck').setOrigin(0.5, 1).setDepth(3);
      const piles = [900, 1060, 1220].map((x) => s.add.image(x, 474, 'k:pile').setOrigin(0.5, 1).setDepth(4.4));
      const sheen = [900, 1060, 1220].map((x) => s.add.image(x, 474, 'glow').setScale(1.9, 0.22).setTint(0xd8c890).setAlpha(0).setBlendMode(ADD).setDepth(4.35));
      // a heap of real-looking books: closed volumes with cream page edges, a few lying open, spines up
      paint(s, 'k:pile', 190, 84, (c) => {
        const r = rng(12), cols = ['#7a2c1e', '#2c4060', '#7c6a38', '#3c5a3c', '#5a2e46', '#c9b48a'];
        for (let i = 0; i < 34; i++) {
          const x = 24 + r() * 142, y = 80 - Math.pow(r(), 0.7) * 50 * (1 - Math.abs(x - 95) / 110), w = 22 + r() * 12, h = 7 + r() * 4;
          c.save(); c.translate(x, y); c.rotate((r() - 0.5) * 0.9);
          c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fillRect(-w / 2, -h / 2, w, h);
          c.fillStyle = '#ece0c2'; c.fillRect(-w / 2 + 2, -h / 2 + 2, w - 5, h - 4);   // page block
          c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-w / 2, h / 2 - 2, w, 2);
          c.restore();
        }
        for (const [x, y] of [[60, 42], [118, 36], [150, 60]]) { // open books, pages fanned
          c.fillStyle = '#f2e8d0'; poly(c, [x - 16, y, x, y + 4, x + 16, y, x + 14, y - 9, x, y - 5, x - 14, y - 9]);
          c.strokeStyle = 'rgba(60,50,40,0.5)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - 13, y - 8 + k * 2); c.lineTo(x - 2, y - 4 + k * 2); c.moveTo(x + 2, y - 4 + k * 2); c.lineTo(x + 13, y - 8 + k * 2); c.stroke(); }
        }
        for (let i = 0; i < 5; i++) { c.fillStyle = cols[i]; c.fillRect(70 + i * 9, 24 + (i % 2) * 4, 7, 26); c.fillStyle = 'rgba(232,212,160,0.7)'; c.fillRect(71 + i * 9, 30 + (i % 2) * 4, 5, 2); } // a few standing spines
      });
      piles.forEach((p) => p.setTexture('k:pile'));
      // books fall from the upper windows
      s.add.particles(0, 0, 'book', { x: { min: 940, max: 1380 }, y: 150, speedY: { min: 80, max: 140 }, speedX: { min: -30, max: 30 }, rotate: { min: 0, max: 360 }, lifespan: 2200, frequency: 700, gravityY: 120 }).setDepth(3.5);
      // soaked: darker, wet-looking books and a fuel sheen spreading on the lawn (before the fire)
      update = (f) => piles.forEach((p, i) => { if (f[`c01.p${i + 1}`]) { p.setTint(0x9a8460); if (!f['c01.lit'] && sheen[i].alpha === 0) s.tweens.add({ targets: sheen[i], alpha: 0.32, duration: 700 }); } if (f['c01.lit']) sheen[i].setAlpha(0); });
      // the novel's image of the opening burn: books rise like flapping birds, catch, and fall dying on the lawn
      paint(s, 'k:page', 18, 12, (c) => {
        c.fillStyle = '#f2e8d0'; poly(c, [1, 2, 9, 5, 17, 2, 16, 10, 9, 12, 2, 10]);
        c.strokeStyle = 'rgba(60,50,40,0.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(9, 5); c.lineTo(9, 12); c.stroke();
      });
      fx.pages = () => first('pages', () => {
        const calm = settings.reducedMotion;
        s.add.particles(0, 0, 'k:page', {
          x: { min: 860, max: 1260 }, y: { min: 420, max: 455 },
          speedY: { min: -240, max: -150 }, speedX: { min: -55, max: 65 }, gravityY: 100,
          lifespan: { min: 3000, max: 4000 }, frequency: calm ? 420 : 90, duration: 2800, maxParticles: calm ? 6 : 28,
          rotate: { min: -30, max: 30 }, scaleY: 1.8,
          // wing beat: the page folds and opens (scaled up 1.8x, otherwise they read as sparks); reduced motion keeps it still
          scaleX: calm ? 1.8 : { onUpdate: (_p: unknown, _k: string, t: number) => (0.25 + Math.abs(Math.sin(t * 26)) * 0.95) * 1.8 },
          color: [0xfff2dc, 0xffc070, 0xff6a28, 0x2a140c], alpha: { start: 1, end: 0.2 },
        }).setDepth(5.6);
      });
      fx.ignite = () => first('ignite', () => {
        piles.forEach((p) => fireAt(s, p.x, 472, 2));
        // the fire climbs window by window (single flames, staggered) instead of rows that read as one flat band
        [930, 1050, 1170, 1290, 1390].forEach((x, i) => s.time.delayedCall(500 + i * 220, () => fireAt(s, x, F - 112 - (i % 2) * 8, 1, false, 2.5)));
        // upper storey catches, smoke columns climb, and the whole street takes the fire's colour
        [990, 1110, 1230, 1350].forEach((x, i) => s.time.delayedCall(1500 + i * 300, () => fireAt(s, x, F - 205 - (i % 2) * 10, 1, false, 2.4)));
        s.time.delayedCall(900, () => s.add.particles(0, 0, 'smoke', { x: { min: 900, max: 1420 }, y: F - 260, speedY: { min: -60, max: -25 }, speedX: { min: -8, max: 18 }, lifespan: 7000, frequency: 110, scale: { start: 0.8, end: 3.2 }, alpha: { start: 0.42, end: 0 }, tint: 0x2a2220 }).setDepth(2.2));
        const wash = s.add.image(1150, F - 160, 'glow').setScale(12, 6).setTint(0xff6a2a).setAlpha(0).setBlendMode(ADD).setDepth(2.6);
        s.tweens.add({ targets: wash, alpha: 0.32, duration: 1600, onComplete: () => { if (!settings.reducedMotion) s.tweens.add({ targets: wash, alpha: 0.22, yoyo: true, repeat: -1, duration: 160 }); } });
        if (!settings.reducedMotion) s.cameras.main.flash(300, 255, 140, 60);
      });
    }
    if (variant === 'corner') {
      fx.leaves = () => s.add.particles(0, 0, 'leaf', { x: { min: 400, max: 1000 }, y: { min: 380, max: 520 }, speedX: { min: 60, max: 140 }, speedY: { min: -20, max: 20 }, rotate: { min: 0, max: 360 }, lifespan: 4000, quantity: 1, frequency: 90, duration: 3000 }).setDepth(6);
      s.add.particles(0, 0, 'leaf', { x: { min: 0, max: RW }, y: -10, speedY: { min: 20, max: 50 }, speedX: { min: 10, max: 40 }, rotate: { min: 0, max: 360 }, lifespan: 9000, frequency: 600 }).setDepth(6);
    }
    if (variant === 'lawn') {
      truckTexture(s);
      contactShadow(s, 320, 466, 360, 0.6);
      s.add.image(320, 470, 'k:truck').setOrigin(0.5, 1).setDepth(3);
      update = (f) => { if (f['c10.w3']) first('housefire', () => [820, 960, 1100].forEach((x) => fireAt(s, x, F - 20, 3, false, 2.5))); };
    }
    if (variant === 'boulevard') {
      // the five traffic lanes the cars run down, drawn in perspective (hazard lanes sit at x..x+90 on the walk line), with raised islands between them
      const L = [620, 820, 1020, 1220, 1420], vx = 1065, hy = 250, ox = 380;
      const px = (x: number, y: number) => vx + (x - vx) * (y - hy) / (480 - hy) - ox;
      paint(s, 'k:boulevard:lanes', 1500, H - F, (c) => {
        const quad = (x0: number, x1: number, y0: number, y1: number) => poly(c, [px(x0, y0), y0 - F, px(x1, y0), y0 - F, px(x1, y1), y1 - F, px(x0, y1), y1 - F]);
        for (let i = 0; i <= L.length; i++) {
          const a = i ? L[i - 1] + 98 : L[0] - 190, b = i < L.length ? L[i] - 8 : L[L.length - 1] + 98 + 190;
          c.fillStyle = '#3c3935'; quad(a, b, F, H); c.fillStyle = '#6c665a'; quad(a, a + 5, F, H); quad(b - 5, b, F, H);
        }
        for (const x of L) {
          c.fillStyle = 'rgba(4,4,6,0.45)'; quad(x - 8, x + 98, F, H);
          c.fillStyle = 'rgba(232,222,184,0.6)'; quad(x - 8, x - 6, F, H); quad(x + 96, x + 98, F, H);
          for (let y = F + 4; y < H;) { const len = 26 * (y - hy) / 230; c.fillStyle = 'rgba(240,206,110,0.7)'; quad(x + 43, x + 47, y, Math.min(H, y + len)); y += len * 2.1; }
        }
      });
      s.add.image(ox, F, 'k:boulevard:lanes').setOrigin(0).setDepth(1.2);
    }
    if (variant === 'boulevard' || variant === 'alley') dust(s, RW, 0x9ab8c4);
    return {
      floor: variant === 'boulevard'
        ? { key: 'asphalt', top: '#1c1a1c', bottom: '#060506', line: 'rgba(220,210,180,0.35)', spacing: 180, kind: 'asphalt' }
        : { key: 'sidewalk', top: '#26211f', bottom: '#080606', line: 'rgba(0,0,0,0.5)', spacing: 130, kind: 'tile' },
      lights, fx, update,
    };
  };
}

// ---------------- interiors (Montag's house, the old woman's house, Faber's house, subway) ----------------

export const PARLOR = [1660, 1980, 2300];

const HOME_LOOK: Record<string, { top: string; bot: string; dot: string; wain: string; bed: [string, string, string, string]; sofa: [string, string] }> = {
  home1: { top: '#4d4753', bot: '#35303b', dot: 'rgba(255,235,210,0.05)', wain: '#2b2731', bed: ['#4a4650', '#d8d4da', '#7b8aa3', '#efecf2'], sofa: ['#6a5160', '#3a2c37'] },
  home2: { top: '#3b4a43', bot: '#27322d', dot: 'rgba(200,235,205,0.06)', wain: '#1f2824', bed: ['#3d3a34', '#cfd0c8', '#8a6a52', '#e6e4da'], sofa: ['#4f5e52', '#26302a'] },
  home3: { top: '#343f4e', bot: '#212836', dot: 'rgba(190,210,240,0.05)', wain: '#1a202a', bed: ['#383c48', '#c4c9d4', '#56667f', '#e0e4ec'], sofa: ['#4a5468', '#252a38'] },
  home4: { top: '#55473b', bot: '#372d25', dot: 'rgba(255,220,180,0.06)', wain: '#2a221c', bed: ['#4a3a2e', '#d8cfc0', '#9a5a46', '#efe6d6'], sofa: ['#7a4e46', '#3c2622'] },
  home5: { top: '#2e211e', bot: '#150f0e', dot: 'rgba(0,0,0,0)', wain: '#0e0908', bed: ['#1a1412', '#3a322c', '#2a201c', '#4a403a'], sofa: ['#3a2a2a', '#1a1212'] },
};

/** Side-on bed: tall headboard, low footboard, mattress, folded blanket, pillow. A ruined one is bare and scorched. */
function bedTexture(s: Phaser.Scene, key: string, pal: [string, string, string, string], ruin: boolean) {
  paint(s, key, 220, 100, (c) => {
    const [frame, sheet, blanket, pillow] = pal;
    c.fillStyle = '#0e0c10'; c.fillRect(16, 88, 7, 12); c.fillRect(196, 88, 7, 12);
    c.fillStyle = frame; c.fillRect(8, 72, 204, 16);
    c.beginPath(); c.roundRect(0, 14, 18, 86, [9, 9, 0, 0]); c.fill();
    c.beginPath(); c.roundRect(206, 52, 12, 48, [4, 4, 0, 0]); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(4, 22, 2, 70); c.fillRect(209, 58, 2, 36);
    c.fillStyle = sheet; c.beginPath(); c.roundRect(16, 50, 192, 26, 7); c.fill();
    if (ruin) {
      c.fillStyle = '#0c0807'; for (const [x, w] of [[40, 50], [110, 70], [170, 30]]) { c.beginPath(); c.ellipse(x + w / 2, 62, w / 2, 9, 0, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = '#080505'; c.lineWidth = 2; c.beginPath(); c.moveTo(60, 50); c.lineTo(72, 60); c.lineTo(66, 70); c.stroke();
      c.fillStyle = blanket; poly(c, [130, 46, 210, 54, 208, 76, 150, 72, 140, 60]);
      return;
    }
    c.fillStyle = blanket; c.beginPath(); c.roundRect(66, 40, 142, 36, [10, 6, 5, 5]); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(70, 42, 134, 3);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(66, 60, 142, 2); c.fillRect(150, 44, 2, 32);
    c.fillStyle = pillow; c.beginPath(); c.ellipse(40, 44, 29, 11, -0.06, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(40, 44, 29, 11, -0.06, 0.1, Math.PI * 0.9); c.stroke();
  });
}

/** A proper sofa: rolled arms, back cushions, two seat cushions, short legs. */
function sofaTexture(s: Phaser.Scene, key: string, pal: [string, string], ruin: boolean) {
  paint(s, key, 230, 112, (c) => {
    const [lit, dark] = pal;
    c.fillStyle = '#0e0c10'; for (const x of [22, 198]) c.fillRect(x, 100, 8, 12);
    c.fillStyle = vgrad(c, 8, 70, [[0, lit], [1, dark]]); c.beginPath(); c.roundRect(24, 8, 182, 70, [22, 22, 4, 4]); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(115, 14); c.lineTo(115, 70); c.stroke();
    c.fillStyle = vgrad(c, 60, 100, [[0, lit], [1, dark]]); c.beginPath(); c.roundRect(20, 58, 190, 42, [10, 10, 6, 6]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.moveTo(115, 60); c.lineTo(115, 98); c.stroke();
    c.fillStyle = dark; for (const x of [0, 204]) { c.beginPath(); c.roundRect(x, 42, 26, 58, [13, 13, 5, 5]); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.1)'; for (const x of [4, 208]) c.fillRect(x, 46, 3, 30);
    if (ruin) { c.fillStyle = '#d9cba8'; poly(c, [90, 60, 112, 52, 128, 62, 118, 74, 98, 72]); c.strokeStyle = '#0a0606'; c.lineWidth = 2; c.beginPath(); c.moveTo(150, 20); c.lineTo(168, 46); c.lineTo(160, 66); c.stroke(); }
  });
}

/** Floor litter for the ruined house: paper, glass, a toppled chair leg. */
function debrisTexture(s: Phaser.Scene) {
  paint(s, 'k:debris', 300, 34, (c) => {
    const r = rng(77);
    for (let i = 0; i < 26; i++) {
      c.save(); c.translate(10 + r() * 280, 8 + r() * 22); c.rotate((r() - 0.5) * 1.4);
      c.fillStyle = ['#d9cba8', '#8a7a58', '#2a2120', '#9fb4b8'][i % 4]; c.globalAlpha = i % 4 === 3 ? 0.55 : 0.9;
      if (i % 4 === 3) poly(c, [0, 0, 7, 2, 3, 6]); else c.fillRect(-9, -3, 18, 6);
      c.restore();
    }
  });
}

const home: Kit = (s, room) => {
  const RW = 2600, F = FLOOR_TOP, id = room.id, look = HOME_LOOK[id] ?? HOME_LOOK.home1, ruin = id === 'home5';
  paint(s, `k:home:wall:${id}`, RW, F, (c) => {
    const r = rng(RW + id.length * 7);
    c.fillStyle = vgrad(c, 0, F, [[0, look.top], [1, look.bot]]); c.fillRect(0, 0, RW, F);
    // quiet diamond paper pattern (dots, not lines: nothing that can read as a seam)
    c.fillStyle = look.dot;
    for (let y = 50; y < F - 90; y += 34) for (let x = (y / 34) % 2 ? 18 : 0; x < RW; x += 36) poly(c, [x, y - 4, x + 4, y, x, y + 4, x - 4, y]);
    c.fillStyle = '#121216'; c.fillRect(0, 0, RW, 40);
    c.fillStyle = look.wain; c.fillRect(0, 300, RW, F - 300); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(0, 300, RW, 2);
    // warm pools where the lamps hang, so the furniture reads against the wall
    for (const x of [300, 1000, 1560]) radial(c, x, 220, 230, ruin ? 'rgba(210,90,40,A)' : 'rgba(255,214,160,A)', ruin ? 0.1 : id === 'home1' ? 0.2 : 0.12);
    // front door with its hand-print plate and speaker
    c.fillStyle = '#0d0d10'; c.fillRect(60, 150, 110, F - 150); c.fillStyle = '#c9a85a'; c.fillRect(176, 250, 12, 18);
    // hall ventilator grill (unexplained; the camera only glances at it)
    c.fillStyle = '#3a3a40'; c.fillRect(360, 90, 80, 40); c.fillStyle = '#121216'; for (let x = 364; x < 438; x += 8) c.fillRect(x, 94, 4, 32);
    // bedroom: window with moon, twin bed headboard shadows
    c.fillStyle = '#0a0c14'; c.fillRect(800, 110, 160, 150); radial(c, 900, 160, 40, 'rgba(220,225,235,A)', 0.4);
    c.strokeStyle = '#2e2e36'; c.lineWidth = 8; c.strokeRect(800, 110, 160, 150);
    if (id === 'home3') { c.fillStyle = 'rgba(120,135,160,0.85)'; for (let y = 114; y < 200; y += 12) c.fillRect(804, y, 152, 8); } // blinds half down
    else if (!ruin) { c.fillStyle = 'rgba(150,70,70,0.55)'; c.fillRect(800, 104, 34, 160); c.fillRect(926, 104, 34, 160); } // drapes
    // kitchen: cabinets, brass incinerator slot, toaster
    c.fillStyle = look.wain; c.fillRect(1240, 180, 180, F - 180); c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(1240, 180, 180, 3); c.fillStyle = '#c9a85a'; c.fillRect(1300, 230, 60, 8);
    c.fillStyle = '#5a5a62'; c.fillRect(1380, 160, 30, 20);
    // each house keeps its own small things on the walls
    if (id === 'home1') { c.fillStyle = '#c9b48a'; c.fillRect(1470, 130, 64, 84); c.fillStyle = '#2a2328'; c.fillRect(1476, 136, 52, 72); c.fillStyle = '#e6d8b8'; c.fillRect(1482, 142, 40, 8); for (let y = 156; y < 200; y += 6) c.fillRect(1482, y, 40 - (y % 12), 2); }
    if (id === 'home2') {
      c.fillStyle = '#7a5a3c'; c.fillRect(220, 110, 70, 90); c.fillStyle = '#d8c8a8'; c.beginPath(); c.ellipse(255, 150, 22, 30, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2a2018'; c.beginPath(); c.arc(255, 140, 9, 0, Math.PI * 2); c.fill(); c.fillRect(244, 150, 22, 16);
      c.fillStyle = '#2a2018'; for (const x of [500, 530, 560]) { c.fillRect(x, 150, 4, 20); c.beginPath(); c.arc(x + 2, 150, 5, 0, Math.PI * 2); c.fill(); }
    }
    if (id === 'home3') { c.fillStyle = '#2a3040'; c.fillRect(1480, 150, 90, 44); c.fillStyle = '#9aa6b8'; for (let i = 0; i < 4; i++) c.fillRect(1488 + i * 20, 160, 10, 24); }
    if (id === 'home4') {
      c.fillStyle = '#e0d4b6'; c.beginPath(); c.arc(1500, 160, 24, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#2a2018'; c.lineWidth = 3; c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(1500, 160); c.lineTo(1500, 144); c.moveTo(1500, 160); c.lineTo(1512, 166); c.stroke();
      for (const [x, y] of [[230, 140], [290, 128]]) { c.fillStyle = '#7a5a3c'; c.fillRect(x, y, 44, 56); c.fillStyle = '#c8b898'; c.fillRect(x + 5, y + 5, 34, 46); }
    }
    // parlor: three wall-sized screens, dark glass with a reflection while off (the live content is a layer above)
    for (const x of PARLOR) {
      c.fillStyle = vgrad(c, 60, 310, [[0, '#1a2026'], [1, '#0a0d10']]); c.fillRect(x - 150, 60, 300, 250);
      c.fillStyle = 'rgba(190,210,225,0.06)'; poly(c, [x - 150, 60, x - 40, 60, x - 150, 200]); poly(c, [x + 20, 310, x + 150, 160, x + 150, 310]);
    }
    if (ruin) {
      // the house after the burning begins: soot, torn paper, cracked screens
      for (let i = 0; i < 14; i++) { const x = r() * RW; radial(c, x, 20 + r() * 40, 90 + r() * 90, 'rgba(0,0,0,A)', 0.5); }
      for (let i = 0; i < 40; i++) { const x = r() * RW, w = 4 + r() * 12; c.fillStyle = `rgba(8,5,4,${0.1 + r() * 0.12})`; c.fillRect(x, 30 + r() * 20, w / 3, 40 + r() * 120); }
      c.strokeStyle = 'rgba(205,190,160,0.5)'; c.lineWidth = 1.5;
      for (const x of PARLOR) { c.beginPath(); c.moveTo(x - 20, 150); for (let n = 0; n < 6; n++) c.lineTo(x - 20 + (r() - 0.5) * 220, 150 + (r() - 0.5) * 190); c.stroke(); c.beginPath(); c.moveTo(x + 40, 100); c.lineTo(x + 70, 190); c.lineTo(x + 110, 160); c.stroke(); }
      c.fillStyle = 'rgba(214,190,150,0.3)'; for (let i = 0; i < 9; i++) { const x = 40 + r() * (RW - 80); poly(c, [x, 60, x + 22, 70, x + 14, 140 + r() * 60, x - 4, 100]); }
    }
    interiorTrim(c, RW, F);
    speckle(c, RW, F, 12000, 31, 0.02);
  });
  addLayer(s, `k:home:wall:${id}`, 1, 1);
  // Three walls, three broadcasts: the family shouting, the audience laughing, the family turning to smile at you.
  const shows = ['tv:argue', 'tv:laugh', 'tv:family'];
  const tvs = PARLOR.map((x, i) => s.add.sprite(x - 144, 66, shows[i]).setOrigin(0).setDepth(1.5).play(shows[i]));
  const tvGlow = PARLOR.map((x, i) => s.add.image(x, 220, 'glow').setScale(4.4, 3.2).setTint([0xff7aa0, 0x80c0ff, 0xffc080][i]).setAlpha(0.26).setBlendMode(ADD).setDepth(2));
  if (!settings.reducedMotion) tvGlow.forEach((g, i) => s.tweens.add({ targets: g, alpha: 0.16, yoyo: true, repeat: -1, duration: 140 + i * 60 }));
  bedTexture(s, `k:bed:${id}`, look.bed, ruin);
  for (const x of [740, 1060]) s.add.image(x, 452, `k:bed:${id}`).setOrigin(0.5, 1).setDepth(4.6);
  sofaTexture(s, `k:sofa:${id}`, look.sofa, ruin);
  // home1: Mildred sits center stage, a little nearer the camera; the sofa is tinted darker so she separates from it
  const sofa = s.add.image(1830, id === 'home1' ? 478 : 452, `k:sofa:${id}`).setOrigin(0.5, 1).setDepth(4.4).setTint(id === 'home1' ? 0x9a8c96 : 0xffffff);
  if (ruin) { sofa.setAngle(-4).setX(1836); debrisTexture(s); for (const x of [520, 1250, 1700, 2150]) s.add.image(x, 478, 'k:debris').setOrigin(0.5, 1).setDepth(4.3); }
  paint(s, 'k:chair', 90, 110, (c) => { c.fillStyle = '#3a2e36'; c.fillRect(10, 0, 70, 70); c.fillRect(0, 50, 90, 30); c.fillStyle = '#121216'; c.fillRect(8, 80, 6, 30); c.fillRect(76, 80, 6, 30); });
  const vChair = s.add.image(400, 480, 'k:chair').setOrigin(0.5, 1).setDepth(5.5).setScale(0.8).setVisible(false);
  const pile = s.add.image(470, 480, 'k:pile2').setOrigin(0.5, 1).setDepth(5.4).setVisible(false);
  paint(s, 'k:pile2', 120, 40, (c) => { const r = rng(4); for (let i = 0; i < 20; i++) { c.save(); c.translate(15 + r() * 90, 34 - r() * 18); c.rotate((r() - 0.5)); c.fillStyle = ['#d9cba8', '#6b2a1a', '#2a3a5a', '#7a6a3a', '#3a5a3a'][i % 5]; c.fillRect(-11, -3, 22, 7); c.restore(); } });
  pile.setTexture('k:pile2');
  const warm = ruin ? 0xd0602a : 0xd8d0c0;
  return {
    floor: { key: 'hometile', top: ruin ? '#241a17' : '#2e2d33', bottom: '#0a0a0c', line: 'rgba(255,255,255,0.05)', spacing: 90, kind: 'tile' },
    lights: [{ x: 300, y: 200, color: warm, r: 300 }, { x: 900, y: 200, color: ruin ? 0xc06a3a : 0x9ab0c8, r: 260 }, ...PARLOR.map((x) => ({ x, y: 220, color: ruin ? 0xb05a30 : 0x9ad0ff, r: 300 }))],
    fx: { tvOff: () => tvs.forEach((t) => t.setVisible(false)), tvOn: () => tvs.forEach((t) => t.setVisible(true)),
      // the walls address Mildred: every screen still on flares toward the sofa when the play cues her
      wallCue: () => tvs.forEach((t, i) => { if (!t.visible || t.alpha < 0.5) return; s.tweens.add({ targets: tvGlow[i], alpha: 0.7, yoyo: true, repeat: 1, duration: 220 }); }),
      // Chapter 1 ends as the novel's scene does: the front door opens on rain
      rainDoor: () => {
        const night = s.add.rectangle(115, 150, 110, F - 150, 0x18232e, 1).setOrigin(0.5, 0).setDepth(1.6).setAlpha(0);
        s.tweens.add({ targets: night, alpha: 1, duration: 500 });
        s.add.particles(0, 0, 'dot', { x: { min: 62, max: 168 }, y: 150, speedY: { min: 520, max: 640 }, speedX: -30, lifespan: 420,
          frequency: settings.reducedMotion ? 140 : 14, scaleY: 3.5, scaleX: 0.35, alpha: 0.5, tint: 0xa8c0d0 }).setDepth(1.7);
        const spill = s.add.image(115, F, 'glow').setScale(2.2, 0.5).setTint(0x7a9ab0).setAlpha(0).setBlendMode(ADD).setDepth(1.65);
        s.tweens.add({ targets: spill, alpha: 0.35, duration: 600 });
      },
      // Mildred turns the walls back up: each screen flickers to full brightness in turn
      wallsOn: () => tvs.forEach((t, i) => s.time.delayedCall(i * 260, () => { t.setTint(0xffffff); s.tweens.add({ targets: t, alpha: { from: 0.2, to: 1 }, duration: 120, repeat: 2, yoyo: true, onComplete: () => t.setAlpha(1) }); tvGlow[i].setVisible(true); })) },
    update: (f) => {
      const off = (!!f['c09.off'] && room.id !== 'home3') || room.id === 'home5' || room.id === 'home3' || (room.id === 'home1' && !f['h1.day']);
      tvs.forEach((t) => t.setVisible(!off)); tvGlow.forEach((g) => g.setVisible(!off));
      if (room.id === 'home1') PARLOR.forEach((_, i) => {
        const quiet = !!f[`c03.w${i + 1}`];
        tvs[i].setAlpha(quiet ? 0.28 : 1).setTint(quiet ? 0x8a9094 : 0xffffff);
        tvGlow[i].setVisible(!off && !quiet);
      });
      vChair.setVisible(!!f['c06.chair'] && room.id === 'home2');
      pile.setVisible(!!f['c06.vent'] && room.id === 'home2');
      if (room.id === 'home5') {
        if (f['c10.beds']) first('beds', () => [740, 1060].forEach((x) => fireAt(s, x, 440, 2)));
        PARLOR.forEach((x, i) => { if (f[`c10.w${i + 1}`]) first('w' + i, () => fireAt(s, x, F - 60, 3, false, 2.5)); });
      }
    },
  };
};

const attic: Kit = (s) => {
  const RW = 1800, F = FLOOR_TOP;
  paint(s, 'k:attic:wall', RW, F, (c) => {
    c.fillStyle = vgrad(c, 0, F, [[0, '#2a1d14'], [1, '#1a120c']]); c.fillRect(0, 0, RW, F);
    c.fillStyle = 'rgba(0,0,0,0.3)'; for (let x = 0; x < RW; x += 26) c.fillRect(x, 0, 2, F); // old boards
    c.fillStyle = '#0d0907'; c.fillRect(60, 140, 110, F - 140); // front door
    // stairwell climbing to the attic, drawn in perspective
    poly(c, [690, F, 712, F, 1012, F - 230, 990, F - 230]); // stringer under the treads
    for (let i = 0; i < 10; i++) {
      const x = 700 + i * 30, y = F - i * 22;
      c.fillStyle = '#2e2014'; c.fillRect(x, y - 22, 60, 22);             // riser
      c.fillStyle = '#5a4028'; c.fillRect(x, y - 24, 62, 4);              // worn tread edge catches the light
    }
    c.strokeStyle = '#4a3420'; c.lineWidth = 4; c.beginPath(); c.moveTo(706, F - 70); c.lineTo(1006, F - 290); c.stroke(); // handrail
    for (let i = 0; i < 10; i += 2) c.fillRect(706 + i * 30, F - 70 - i * 22, 3, 60);  // balusters
    // the head of the stairs: a landing and the dark doorway Montag climbs into
    c.fillStyle = '#080504'; c.fillRect(978, 40, 80, 126);
    c.fillStyle = '#3a2a1c'; c.fillRect(972, 34, 92, 8); c.fillRect(972, 34, 8, 134); c.fillRect(1056, 34, 8, 134);
    radial(c, 1018, 120, 90, 'rgba(242,165,74,A)', 0.16);
    c.fillStyle = '#5a4028'; c.fillRect(965, 166, 110, 6);
    // roof trusses over the heaps: upright pairs of rafters meeting at the ridge, with a tie beam (nothing here slopes like a stair)
    c.fillStyle = '#120c08';
    for (const cx of [1180, 1620]) {
      poly(c, [cx - 124, F - 150, cx - 106, F - 150, cx + 10, 0, cx - 10, 0]); poly(c, [cx + 124, F - 150, cx + 106, F - 150, cx - 10, 0, cx + 10, 0]);
      c.fillRect(cx - 118, F - 176, 236, 12);
    }
    // a small attic window and the dusty shaft of light it throws across the heaps
    c.fillStyle = '#3a2c20'; c.fillRect(1356, 30, 88, 64); c.fillStyle = '#c9b48a'; c.fillRect(1362, 36, 76, 52); c.fillStyle = '#3a2c20'; c.fillRect(1398, 36, 4, 52); c.fillRect(1362, 60, 76, 3);
    c.fillStyle = 'rgba(242,205,150,0.09)'; poly(c, [1362, 90, 1438, 90, 1560, F - 40, 1260, F - 40]);
    for (let x = 200; x < 640; x += 110) { c.fillStyle = '#2a1c12'; c.fillRect(x, 120, 90, 200); c.fillStyle = '#4a3220'; for (let y = 130; y < 310; y += 30) c.fillRect(x + 4, y, 82, 4); for (let y = 134; y < 310; y += 30) for (let b = x + 6; b < x + 84; b += 7) { c.fillStyle = ['#6b2a1a', '#2a3a5a', '#7a6a3a'][(b + y) % 3]; c.fillRect(b, y - 18, 6, 18); } }
    radial(c, 1400, 60, 200, 'rgba(242,165,74,A)', 0.2);
    interiorTrim(c, RW, F);
    speckle(c, RW, F, 14000, 41);
  });
  // the heaps are their own layer: the attic is empty until the books come down
  paint(s, 'k:attic:heaps', RW, F, (c) => {
    // single books of different sizes, tilted more toward the edges, with loose ones slid down the slopes
    const r = rng(8), tones = ['#6b2a1a', '#2a3a5a', '#7a6a3a', '#4a5a3a', '#5a2a3a', '#3a3a44', '#8a5a2a', '#24402f'];
    const book = (x: number, y: number, bw: number, bh: number, a: number) => {
      c.save(); c.translate(x, y); c.rotate(a); if (r() < 0.5) c.scale(-1, 1);
      c.fillStyle = tones[Math.floor(r() * tones.length)]; c.fillRect(-bw / 2, -bh / 2, bw, bh);        // cloth cover
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-bw / 2, bh / 2 - 2, bw, 2); c.fillRect(-bw / 2, -bh / 2, 4, bh);  // shadowed underside and spine
      c.fillStyle = 'rgba(255,255,255,0.13)'; c.fillRect(-bw / 2, -bh / 2, bw, 1.5);
      c.fillStyle = 'rgba(201,168,90,0.75)'; c.fillRect(-bw / 2 + 6, -bh / 2 + 1, 1.5, bh - 2); c.fillRect(-bw / 2 + 10, -bh / 2 + 1, 1, bh - 2); // gilt bands
      c.fillStyle = 'rgba(224,208,172,0.9)'; c.fillRect(bw / 2 - 5, -bh / 2 + 1.5, 5, bh - 3);          // page block at the open end
      c.fillStyle = 'rgba(70,50,30,0.35)'; for (let l = 3; l < bh - 2; l += 2) c.fillRect(bw / 2 - 5, -bh / 2 + l, 5, 0.6);
      c.restore();
    };
    for (const [cx, w, h] of [[1150, 200, 128], [1430, 260, 170], [1690, 170, 112]] as const) {
      const prof = (x: number) => h * Math.pow(Math.max(0, 1 - Math.abs(x - cx) / (w / 2)), 0.85) * (0.8 + 0.2 * Math.sin(x * 0.05 + cx));
      for (let y = F - 6; y > F - h; y -= 7) {
        for (let x = cx - w / 2; x < cx + w / 2; x += 20 + r() * 14) {
          if (prof(x) < F - y) continue;
          book(x + r() * 8 - 4, y - 3 + r() * 3, 26 + r() * 16, 7 + r() * 5, (r() - 0.5) * (0.2 + 0.9 * Math.abs(x - cx) / (w / 2)));
        }
      }
      for (let i = 0; i < 10; i++) { const side = r() < 0.5 ? -1 : 1; book(cx + side * (w / 2 - 14 + r() * 46), F - 6 - r() * 4, 22 + r() * 12, 7 + r() * 4, side * (0.25 + r() * 0.9)); }
    }
  });
  addLayer(s, 'k:attic:wall', 1, 1);
  const heaps = addLayer(s, 'k:attic:heaps', 1, 1.05).setAlpha(0);
  // Hall below the partition (x < SPLIT) and attic above it share one strip; whichever floor Montag is not on is blacked out.
  const SPLIT = 1062, ink = 0x0a0705;
  const attic = s.add.rectangle(SPLIT, 0, RW - SPLIT, H, ink, 1).setOrigin(0).setDepth(6.5);
  const hall = s.add.rectangle(0, 0, SPLIT, H, ink, 1).setOrigin(0).setDepth(6.5).setAlpha(0);
  const way = s.add.rectangle(1004, 70, 58, F - 70, 0x2a1c12, 1).setOrigin(0).setDepth(6.6).setAlpha(0); // the doorway down
  const wayLit = s.add.image(1033, F - 40, 'glow').setScale(0.9, 1.8).setTint(0xf2a54a).setAlpha(0).setBlendMode(ADD).setDepth(6.7);
  let open = false, heapsOn = false, reveal = false;
  const kero = s.add.ellipse(430, F + 36, 260, 34, 0x1a1208, 0.55).setDepth(1.95).setVisible(false); // kerosene around the woman
  paint(s, 'k:banister', 50, H, (c) => { c.fillStyle = '#0a0705'; c.fillRect(20, 120, 12, H); c.fillRect(0, 110, 50, 14); });
  occluder(s, 'k:banister', 880, 1.3);
  dust(s, RW);
  const pause = (ms: number) => new Promise<void>((r) => s.time.delayedCall(ms, r));
  // books shed from the rafters across the whole attic
  const fall = s.add.particles(0, 0, 'tome', { tint: [0xb06a58, 0x6a82b0, 0xc4ae6a, 0x7a9a6a, 0xa0607a, 0x8a8a96], x: { min: 1100, max: 1740 }, y: 20, speedX: { min: -140, max: 60 }, speedY: { min: 60, max: 200 }, rotate: { min: 0, max: 360 }, angle: { min: 0, max: 360 },
    lifespan: 1300, frequency: 45, gravityY: 520, scale: { min: 0.6, max: 1 }, emitting: false }).setDepth(7);
  return {
    floor: { key: 'boards', top: '#3a281a', bottom: '#100a06', line: 'rgba(0,0,0,0.5)', spacing: 60, kind: 'boards' },
    lights: [{ x: 400, y: 200, color: C.amberN, r: 300 }, { x: 1400, y: 120, color: C.amberN, r: 360 }],
    update: (f) => {
      const up = (f['a.fell'] || open) && !f['a.down'];
      hall.setAlpha(up ? 1 : 0);
      if (!reveal) attic.setAlpha(up ? 0 : 1);
      way.setAlpha(up ? 1 : 0); wayLit.setAlpha(up ? 0.5 : 0);
      if (f['a.fell'] && !heapsOn) { heapsOn = true; heaps.setAlpha(1); }
      kero.setVisible(!!f['a.down'] && !f['c04.plea']);
    },
    fx: {
      // the attic opens: the stairwell goes dark behind Montag and the lit roof space fades in
      atticOpen: async () => {
        open = true; hall.setAlpha(1); way.setAlpha(1); wayLit.setAlpha(0.5); reveal = true;
        s.tweens.add({ targets: attic, alpha: 0, duration: settings.reducedMotion ? 0 : 1600 });
        await pause(settings.reducedMotion ? 100 : 1900); reveal = false;
      },
      // the stacks let go: books pour off the rafters, the heaps build on the floor, loose ones slide to Montag's feet
      avalanche: async () => {
        heapsOn = true;
        fall.start();
        s.tweens.add({ targets: heaps, alpha: 1, duration: settings.reducedMotion ? 0 : 2200, delay: 500 });
        for (let i = 0; i < 12; i++) {
          const sx = 1480 + Math.random() * 220, b = s.add.image(sx, FLOOR_TOP - 150 - Math.random() * 40, 'tome').setTint([0xb06a58, 0x6a82b0, 0xc4ae6a, 0x7a9a6a][i % 4]).setDepth(5.2).setAngle(Math.random() * 90);
          s.tweens.add({ targets: b, x: 1160 + Math.random() * 170, y: FLOOR_TOP + 6 + Math.random() * 14, angle: b.angle + 200 + Math.random() * 300, delay: i * 120, duration: 900, ease: 'Quad.easeIn',
            onComplete: () => s.tweens.add({ targets: b, alpha: 0, duration: 400, delay: 1600, onComplete: () => b.destroy() }) });
        }
        await pause(2400); fall.stop(); await pause(600);
      },
      glowOrange: () => { if (!settings.reducedMotion) s.cameras.main.flash(900, 255, 120, 40); },
      // the match goes up and the stairwell hall catches
      hallFire: () => { for (const x of [380, 440, 500]) fireAt(s, x, FLOOR_TOP + 24, 3, false, 5.5); },
    },
  };
};

const faber: Kit = (s) => {
  const RW = 1500, F = FLOOR_TOP;
  paint(s, 'k:faber:wall', RW, F, (c) => {
    c.fillStyle = vgrad(c, 0, F, [[0, '#4a4036'], [1, '#2c251e']]); c.fillRect(0, 0, RW, F); // plaster gone warm and tobacco-stained
    c.fillStyle = '#241c15'; c.fillRect(0, 300, RW, F - 300); c.fillStyle = 'rgba(255,225,170,0.12)'; c.fillRect(0, 300, RW, 2); // wainscot
    for (const x of [200, 760, 1200]) radial(c, x, 200, 200, 'rgba(255,205,140,A)', 0.14);
    c.fillStyle = '#121010'; c.fillRect(60, 150, 100, F - 150);
    c.fillStyle = '#2a201a'; for (let x = 400; x < 600; x += 66) c.fillRect(x, 120, 56, 220); // empty shelves
    c.fillStyle = '#3a2a1e'; for (let y = 150; y < 340; y += 48) c.fillRect(400, y, 196, 5);
    // workshop bench with coils and crystals
    c.fillStyle = '#20180f'; c.fillRect(880, 260, 260, 20); c.fillRect(890, 280, 10, F - 280); c.fillRect(1120, 280, 10, F - 280);
    const r = rng(2); for (let i = 0; i < 60; i++) { c.fillStyle = r() > 0.5 ? '#9a8a5a' : '#5a7a7a'; c.fillRect(890 + r() * 240, 248 + r() * 10, 2 + r() * 4, 2 + r() * 4); }
    radial(c, 1010, 230, 120, 'rgba(242,190,110,A)', 0.35);
    // small picture-frame television
    c.fillStyle = '#3a2a1e'; c.fillRect(1260, 140, 110, 84); c.fillStyle = '#2a2c2e'; c.beginPath(); c.roundRect(1270, 150, 72, 64, 10); c.fill(); c.fillStyle = 'rgba(190,210,220,0.18)'; c.beginPath(); c.ellipse(1292, 166, 14, 6, -0.4, 0, Math.PI * 2); c.fill(); // switched-off screen with glass glint
    c.fillStyle = '#8a7a5a'; c.beginPath(); c.arc(1352, 166, 4, 0, Math.PI * 2); c.arc(1352, 186, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#5a4a36'; for (let y = 196; y < 212; y += 4) c.fillRect(1346, y, 12, 2); // knobs and speaker grille
    interiorTrim(c, RW, F);
    speckle(c, RW, F, 9000, 51, 0.02);
  });
  addLayer(s, 'k:faber:wall', 1, 1);
  // floor furniture: a worn leather armchair, a rug under it, and a stack of books by the wall
  paint(s, 'k:faber:chair', 120, 110, (c) => {
    c.fillStyle = '#0e0b09'; c.fillRect(14, 96, 8, 14); c.fillRect(98, 96, 8, 14);
    c.fillStyle = vgrad(c, 0, 80, [[0, '#4a5a3e'], [1, '#26301f']]); c.beginPath(); c.roundRect(14, 0, 92, 76, [28, 28, 4, 4]); c.fill();
    c.fillStyle = '#334028'; c.beginPath(); c.roundRect(2, 44, 28, 52, [12, 12, 4, 4]); c.fill(); c.beginPath(); c.roundRect(90, 44, 28, 52, [12, 12, 4, 4]); c.fill();
    c.fillStyle = '#3e4c30'; c.beginPath(); c.roundRect(26, 60, 68, 34, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(30, 62, 60, 2); c.fillRect(6, 48, 3, 30);
    c.fillStyle = '#8a7a52'; for (let x = 30; x < 100; x += 14) c.fillRect(x, 16, 2, 2);
  });
  s.add.image(840, 456, 'k:faber:chair').setOrigin(0.5, 1).setDepth(4.4);
  paint(s, 'k:faber:rug', 300, 22, (c) => { c.fillStyle = '#4a2a22'; c.beginPath(); c.ellipse(150, 11, 148, 10, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a07a4a'; c.lineWidth = 2; c.beginPath(); c.ellipse(150, 11, 128, 7, 0, 0, Math.PI * 2); c.stroke(); c.strokeStyle = 'rgba(200,160,100,0.35)'; c.lineWidth = 1; c.beginPath(); c.ellipse(150, 11, 96, 5, 0, 0, Math.PI * 2); c.stroke(); });
  s.add.image(800, 470, 'k:faber:rug').setOrigin(0.5, 1).setDepth(1.35);
  paint(s, 'k:faber:stack', 90, 70, (c) => { const r = rng(6); let y = 70; for (let i = 0; i < 6; i++) { const w = 60 + r() * 26, h = 9 + r() * 5; c.fillStyle = ['#6d4030', '#4d6050', '#5a5c72', '#8b7b51'][i % 4]; c.fillRect(8 + r() * 10, y - h, w, h); c.fillStyle = 'rgba(232,212,160,0.7)'; c.fillRect(10 + r() * 10, y - h + 3, w - 6, 2); y -= h; } });
  s.add.image(1250, 452, 'k:faber:stack').setOrigin(0.5, 1).setDepth(4.4);
  const tv = s.add.image(1315, 182, 'glow').setScale(0.9, 0.6).setTint(0x80c0ff).setAlpha(0).setBlendMode(ADD).setDepth(2);
  return {
    floor: { key: 'boards2', top: '#2e2620', bottom: '#0a0806', line: 'rgba(0,0,0,0.45)', spacing: 70, kind: 'boards' },
    lights: [{ x: 1010, y: 230, color: 0xf2be6e, r: 320 }, { x: 300, y: 200, color: 0xd8d0c0, r: 260 }],
    fx: { tvOn: () => { tv.setAlpha(0.6); s.tweens.add({ targets: tv, alpha: 0.35, yoyo: true, repeat: -1, duration: 200 }); } },
  };
};

const subway: Kit = (s) => {
  const RW = 1400, F = FLOOR_TOP;
  paint(s, 'k:tunnel', 512, 200, (c) => {
    c.fillStyle = '#060608'; c.fillRect(0, 0, 512, 200);
    for (let x = 0; x < 512; x += 128) { c.fillStyle = 'rgba(255,230,180,0.8)'; c.fillRect(x, 90, 50, 4); c.fillStyle = '#e8e2d0'; c.fillRect(x + 70, 0, 26, 200); } // cream tiles, black gaps
  });
  const tunnel = s.add.tileSprite(0, 80, W, 160, 'k:tunnel').setOrigin(0).setScrollFactor(0).setDepth(0.5);
  paint(s, 'k:subway:wall', RW, F, (c) => {
    c.fillStyle = '#1e1c20'; c.fillRect(0, 0, RW, F);
    c.globalCompositeOperation = 'destination-out';
    for (let x = 60; x < RW; x += 220) c.fillRect(x, 90, 170, 140);
    c.globalCompositeOperation = 'source-over';
    for (let x = 60; x < RW; x += 220) { c.strokeStyle = '#3a3840'; c.lineWidth = 6; c.strokeRect(x, 90, 170, 140); }
    for (let x = 60; x < RW; x += 440) { // ad panels
      c.fillStyle = '#d9cba8'; c.fillRect(x + 20, 30, 300, 46);
      c.fillStyle = '#7d2513'; c.font = '700 22px Oswald'; c.fillText("DENHAM'S DENTIFRICE", x + 34, 62);
    }
    c.fillStyle = '#2a2830'; c.fillRect(0, 280, RW, 50); // bench
    const r = rng(6);
    for (let x = 80; x < RW; x += 110) if (r() > 0.3) { // passengers tapping along
      c.fillStyle = '#121014'; c.beginPath(); c.ellipse(x, 236, 12, 14, 0, 0, Math.PI * 2); c.fill(); c.fillRect(x - 16, 250, 32, 50);
    }
    interiorTrim(c, RW, F);
    speckle(c, RW, F, 6000, 61, 0.02);
  });
  addLayer(s, 'k:subway:wall', 1, 1);
  paint(s, 'k:subpole', 30, 470, (c) => { c.fillStyle = hgrad(c, 10, 20, [[0, '#3a3a40'], [0.5, '#8a8a94'], [1, '#3a3a40']]); c.fillRect(10, 0, 10, 470); c.fillStyle = '#1a1a1e'; c.fillRect(4, 456, 22, 14); });
  for (let x = 300; x < RW; x += 420) { contactShadow(s, x, 468, 56, 0.55); s.add.image(x, 470, 'k:subpole').setOrigin(0.5, 1).setDepth(3); }
  return {
    floor: { key: 'metal', top: '#2e2c30', bottom: '#0a0a0c', line: 'rgba(255,255,255,0.06)', spacing: 40, kind: 'metal' },
    lights: [{ x: 300, y: 60, color: 0xe8e2d0, r: 300 }, { x: 900, y: 60, color: 0xe8e2d0, r: 300 }],
    fx: {},
    tick: (dt) => { tunnel.tilePositionX += dt * (settings.reducedMotion ? 0.25 : 1.6); },
  };
};

// ---------------- river and forest ----------------

function forest(variant: 'river' | 'camp'): Kit {
  return (s, room) => {
    const RW = room.width, F = FLOOR_TOP;
    nightSky(s, 'k:sky:wild', true, 0.22);
    skyline(s, 'k:city:far', W + 200, 0.08, 330, '#160f10');
    const city = addLayer(s, 'k:city:far', 0.08, 0.3).setTint(0x6a5a5a);
    const distantWidth = Math.ceil(W + (RW - W) * 0.4 + 40);
    paint(s, 'k:forest:distant', distantWidth, F, (c) => {
      const r = rng(451);
      for (let x = 0; x < distantWidth; x += 38) pine(c, x + r() * 25, F - 16, 150 + r() * 110, r() < 0.5 ? '#1f2c2b' : '#263434');
      c.fillStyle = vgrad(c, F - 100, F, [[0, 'rgba(112,131,137,0)'], [1, 'rgba(112,131,137,0.12)']]);
      c.fillRect(0, F - 100, distantWidth, 100);
    });
    addLayer(s, 'k:forest:distant', 0.4, 0.7);
    paint(s, `k:forest:${variant}`, RW, F, (c) => {
      const r = rng(RW + 7);
      for (let x = -50; x < RW; x += 120) pine(c, x + r() * 60, F, 170 + r() * 190, '#101a17');
      c.fillStyle = vgrad(c, F - 60, F, [[0, 'rgba(120,140,150,0)'], [1, 'rgba(120,140,150,0.1)']]); c.fillRect(0, F - 60, RW, 60); // ground mist
      if (variant === 'river') { c.fillStyle = vgrad(c, F - 40, F, [[0, '#1a2228'], [1, '#26323a']]); c.fillRect(0, F - 40, RW * 0.62, 40); } // muddy bank, lit by the moon
    });
    addLayer(s, `k:forest:${variant}`, 1, 1);
    paint(s, 'k:reeds', 120, 160, (c) => { c.strokeStyle = '#050605'; c.lineWidth = 3; const r = rng(3); for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(10 + r() * 100, 160); c.quadraticCurveTo(10 + r() * 100, 80, 10 + r() * 110, 10 + r() * 40); c.stroke(); } });
    for (let x = 300; x < RW; x += 520) occluder(s, 'k:reeds', x, 1.35);
    const fx: Record<string, () => void> = {};
    const lights: Light[] = [];
    if (variant === 'river') {
      // the shore: land covers the water floor from x 1500 on
      paint(s, 'k:shore', RW - 1480, H - F, (c) => { c.fillStyle = vgrad(c, 0, H - F, [[0, '#1c1712'], [1, '#050403']]); c.fillRect(0, 0, RW - 1480, H - F); c.fillStyle = '#3a3028'; c.fillRect(0, 70, RW - 1480, 4); c.fillRect(0, 84, RW - 1480, 4); for (let x = 0; x < RW; x += 26) c.fillRect(x, 66, 8, 26); });
      s.add.image(1480, F, 'k:shore').setOrigin(0).setDepth(1.2);
    }
    if (variant === 'camp') {
      paint(s, 'k:rails', RW, 30, (c) => { c.fillStyle = '#3a2e24'; for (let x = 0; x < RW; x += 26) c.fillRect(x, 6, 10, 24); c.fillStyle = '#6a5a4a'; c.fillRect(0, 8, RW, 4); c.fillRect(0, 22, RW, 4); });
      s.add.image(0, 452, 'k:rails').setOrigin(0).setDepth(1.3);
      // a proper bonfire (three tongues wide, so its near edge shows on arrival) with a glow that washes the trees and the near track
      fireAt(s, 1330, 470, 3, false, 4.4);
      const beacon = s.add.image(1310, 400, 'glow').setScale(14, 6).setTint(0xff8a3a).setAlpha(0.34).setBlendMode(ADD).setDepth(4.3);
      s.tweens.add({ targets: beacon, alpha: 0.2, yoyo: true, repeat: -1, duration: 420, ease: 'Sine.easeInOut' });
      lights.push({ x: 1310, y: 430, color: 0xffb050, r: 360 });
      const tvGlow = s.add.image(1180, 440, 'glow').setScale(0.6).setTint(0x80c0ff).setAlpha(0).setBlendMode(ADD).setDepth(4);
      fx.tvOn = () => { tvGlow.setAlpha(0.5); s.tweens.add({ targets: tvGlow, alpha: 0.3, yoyo: true, repeat: -1, duration: 150 }); };
      fx.tvOff = () => { s.tweens.killTweensOf(tvGlow); tvGlow.setAlpha(0); };
    }
    // shared by all endings: the city dies on the horizon
    fx.bombs = () => {
      const cam = s.cameras.main;
      s.time.delayedCall(200, () => { if (!settings.reducedMotion) cam.flash(1400, 255, 250, 240); });
      s.time.delayedCall(900, () => { city.setTint(0xffffff); s.tweens.add({ targets: city, alpha: 0, y: 40, duration: 2600 }); if (!settings.reducedMotion) cam.shake(900, 0.004); });
      s.time.delayedCall(1600, () => s.add.particles(0, 0, 'smoke', { x: { min: 0, max: W }, y: 340, speedY: { min: -20, max: -5 }, lifespan: 9000, frequency: 120, scale: { start: 1, end: 3 }, alpha: { start: 0.25, end: 0 }, tint: 0x8a7a70, duration: 6000 }).setScrollFactor(0.1).setDepth(0.6));
    };
    fx.dawn = () => {
      const dawn = s.add.rectangle(0, 0, W, H, 0xff9a70, 0).setOrigin(0).setScrollFactor(0).setDepth(890).setBlendMode(ADD);
      s.tweens.add({ targets: dawn, fillAlpha: 0.12, duration: 4000 });
    };
    return {
      floor: variant === 'river'
        ? { key: 'water', top: '#1d3142', bottom: '#060b10', line: 'rgba(190,215,230,0.22)', spacing: 70, kind: 'water' }
        : { key: 'earth', top: '#1c1712', bottom: '#050403', line: 'rgba(0,0,0,0.35)', spacing: 110, kind: 'earth' },
      lights, fx,
    };
  };
}

export const KITS: Record<string, Kit> = {
  station, home, attic, faber, subway,
  'street:burn': street('burn'), 'street:corner': street('corner'), 'street:lawn': street('lawn'),
  'street:boulevard': street('boulevard'), 'street:alley': street('alley'),
  'forest:river': forest('river'), 'forest:camp': forest('camp'),
};
