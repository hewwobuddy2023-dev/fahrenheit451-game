// Room kits. A kit paints its textures once (keyed by kit name, freed on chapter change), places the
// background, props and foreground occluders, and returns its lights, floor style and effect hooks.
import Phaser from 'phaser';
import type { Light, RoomDef } from '../content/types.ts';
import type { Flags } from '../state.ts';
import { C, FLOOR_TOP, H, W } from '../view.ts';
import { hgrad, paint, poly, radial, rng, speckle, vgrad, type Ctx } from './core.ts';
import { fireAt } from './fx.ts';

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
  return s.add.image(0, 0, key).setOrigin(0).setScrollFactor(0.12).setDepth(0);
}

function skyline(s: Phaser.Scene, key: string, width: number, lit: number, base = 330, col = '#120d0e') {
  paint(s, key, width, H, (c) => {
    const r = rng(width + lit * 1000);
    for (let x = -20; x < width;) {
      const w = 30 + r() * 80, h = 60 + r() * 160;
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
  c.fillRect(x - 4, base - h * 0.45, 8, h * 0.45);
  for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + (r() - 0.5) * h * 0.5, base - h * 0.5 - r() * h * 0.45, h * 0.22, h * 0.17, 0, 0, Math.PI * 2); c.fill(); }
}

/** Foreground occluder sprite (fades when Montag is behind it). */
function occluder(s: Phaser.Scene, key: string, x: number, factor = 1.3) {
  return s.add.image(x, H, key).setOrigin(0.5, 1).setScrollFactor(factor).setDepth(60).setData('occluder', factor);
}

function lampPost(s: Phaser.Scene) {
  paint(s, 'k:lamppost', 40, H, (c) => {
    c.fillStyle = '#070505'; c.fillRect(17, 60, 6, H - 60); c.fillRect(8, 56, 28, 8); c.fillRect(30, 56, 4, 14);
    c.fillStyle = 'rgba(242,165,74,0.5)'; c.fillRect(23, 66, 1, H - 70);
  });
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

// ---------------- the firehouse (from M1, re-based on the new floor line) ----------------

export const LAMPS = [470, 1110, 1520, 2010];
const WINDOWS = [160, 760, 1300, 1900];

const station: Kit = (s, room) => {
  const RW = 2400, F = FLOOR_TOP;
  nightSky(s);
  paint(s, 'k:station:wall', RW, F, (c) => {
    c.fillStyle = vgrad(c, 0, F, [[0, '#231c18'], [1, '#161211']]); c.fillRect(0, 0, RW, F);
    for (let x = 0; x < RW; x += 200) {
      c.fillStyle = '#0d0a09'; c.fillRect(x, 56, 3, 250);
      c.fillStyle = 'rgba(120,96,80,0.35)'; for (let y = 70; y < 300; y += 24) c.fillRect(x + 7, y, 2, 2);
    }
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
    speckle(c, RW, F, 20000, 11);
  });
  addLayer(s, 'k:sky', 0.12, 0);
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
  s.add.image(300, 52, 'k:pole').setOrigin(0.5, 0).setDepth(3).setScale(1, (F - 52) / 420);
  s.add.image(620, F, 'k:rack').setOrigin(0.5, 1).setDepth(3);
  s.add.image(1110, 452, 'k:table').setOrigin(0.5, 1).setDepth(4.6);
  s.add.image(1520, F, 'k:pump').setOrigin(0.5, 1).setDepth(3);
  s.add.image(1770, F, 'k:kennel').setOrigin(0.5, 1).setDepth(3);
  const hound = s.add.image(1770, F - 6, 'k:hound').setOrigin(0.5, 1).setDepth(3);
  const eye = s.add.image(1724, F - 52, 'glow').setScale(0.12).setTint(C.coldN).setAlpha(0.8).setBlendMode(ADD).setDepth(3);
  s.tweens.add({ targets: eye, alpha: 0.35, yoyo: true, repeat: -1, duration: 1300 });
  s.add.image(2010, F, 'k:dispatch').setOrigin(0.5, 1).setDepth(3);
  const bulb = s.add.image(2065, F - 204, 'glow').setScale(0.55).setTint(C.redN).setAlpha(0).setBlendMode(ADD).setDepth(3);
  s.add.image(2290, 470, 'k:truck').setOrigin(0.5, 1).setDepth(4.5);
  paint(s, 'k:station:beam', 60, H, (c) => { c.fillStyle = '#060404'; c.fillRect(14, 0, 32, H); c.fillRect(4, 0, 52, 16); c.fillStyle = 'rgba(242,165,74,0.15)'; c.fillRect(45, 16, 1, H); });
  occluder(s, 'k:station:beam', 900, 1.32);
  occluder(s, 'k:station:beam', 1900, 1.32);
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
      alarm: () => { s.tweens.add({ targets: bulb, alpha: 0.9, yoyo: true, repeat: 7, duration: 150 }); s.cameras.main.flash(250, 120, 20, 10); },
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
  paint(s, 'k:table', 200, 70, (c) => {
    c.fillStyle = '#1a1310'; c.fillRect(30, 18, 6, 52); c.fillRect(164, 18, 6, 52);
    c.fillStyle = '#3a2a20'; c.fillRect(14, 10, 172, 10); c.fillStyle = 'rgba(242,165,74,0.35)'; c.fillRect(14, 10, 172, 1);
    const r = rng(9); for (let i = 0; i < 7; i++) { c.save(); c.translate(50 + r() * 100, 9); c.rotate((r() - 0.5) * 0.6); c.fillStyle = '#e4d6b6'; c.fillRect(-5, -2, 10, 3); c.restore(); }
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
  paint(s, 'k:dispatch', 190, 230, (c) => {
    c.fillStyle = '#120e0c'; c.fillRect(20, 0, 150, 72); c.strokeStyle = '#2c231f'; c.lineWidth = 4; c.strokeRect(20, 0, 150, 72);
    c.fillStyle = '#d9cba8'; c.fillRect(32, 8, 66, 12);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { c.fillStyle = (r * 7 + i) % 5 === 0 ? 'rgba(242,165,74,0.8)' : 'rgba(242,165,74,0.18)'; c.beginPath(); c.arc(38 + i * 12, 34 + r * 12, 3, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#5a1510'; c.beginPath(); c.arc(150, 26, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2e231c'; c.fillRect(0, 142, 190, 10); c.fillStyle = '#19130f'; c.fillRect(10, 152, 170, 78);
    c.fillStyle = '#2c2420'; c.beginPath(); c.roundRect(46, 100, 104, 42, [10, 10, 2, 2]); c.fill();
    c.fillStyle = '#d9cba8'; c.beginPath(); c.roundRect(64, 88, 66, 16, 7); c.fill(); c.fillRect(88, 136, 16, 34);
  });
  paint(s, 'k:truck', 330, 250, (c) => {
    c.fillStyle = '#5a5048'; c.fillRect(10, 30, 320, 4); c.fillRect(10, 46, 320, 4); for (let x = 18; x < 330; x += 18) c.fillRect(x, 30, 3, 20);
    c.fillStyle = vgrad(c, 56, 216, [[0, '#8a3a16'], [0.5, '#6a240e'], [1, '#2a0a07']]); c.beginPath(); c.roundRect(0, 56, 330, 160, [14, 0, 0, 6]); c.fill();
    c.fillStyle = '#b8a57e'; c.fillRect(0, 150, 330, 5);
    c.fillStyle = '#e4c37e'; c.font = '700 44px Oswald'; c.textAlign = 'center'; c.fillText('451', 190, 132);
    for (const x of [70, 260]) { c.fillStyle = '#060404'; c.beginPath(); c.arc(x, 214, 36, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3a302a'; c.beginPath(); c.arc(x, 214, 14, 0, Math.PI * 2); c.fill(); }
  });
}

// ---------------- streets (burn, corner, lawn, boulevard, alley) ----------------

function facade(c: Ctx, x: number, w: number, h: number, base: number, o: { col: string; lit?: string; tvs?: boolean; old?: boolean; r: () => number }) {
  c.fillStyle = o.col; c.fillRect(x, base - h, w, h);
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x, base - h, w, 6);
  if (o.old) { c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 40; i++) c.fillRect(x + o.r() * w, base - h + o.r() * h, 2 + o.r() * 8, 1); }
  const rows = Math.floor((h - 40) / 70);
  for (let ry = 0; ry < rows; ry++) for (let wx = x + 24; wx < x + w - 50; wx += 70) {
    const lit = o.lit && o.r() > 0.35;
    windowGlow(c, wx, base - h + 30 + ry * 70, 40, 46, lit ? o.lit! : 'rgba(10,10,14,0.9)');
  }
  if (o.tvs) for (let wx = x + 24; wx < x + w - 50; wx += 140) windowGlow(c, wx, base - 76, 40, 46, 'rgba(110,170,200,0.55)');
  c.fillStyle = '#0b0807'; c.fillRect(x + w / 2 - 16, base - 70, 32, 70); // flat front door, no porch
}

function street(variant: 'burn' | 'corner' | 'lawn' | 'boulevard' | 'alley'): Kit {
  return (s, room) => {
    const RW = room.width, F = FLOOR_TOP;
    nightSky(s, 'k:sky', variant !== 'alley', variant === 'boulevard' ? 0.2 : 0.32);
    skyline(s, 'k:street:mid', W + (RW - W) * 0.5 + 40, 0.05, 300);
    addLayer(s, 'k:sky', 0.12, 0);
    addLayer(s, 'k:street:mid', 0.5, 0.5).setTint(0x8a7a78);
    const key = `k:street:${variant}`;
    paint(s, key, RW, F, (c) => {
      const r = rng(RW + variant.length);
      for (let x = 0; x < RW; x += 260) tree(c, x + r() * 100, F - 20, 160 + r() * 80, '#0e0a0a', r);
      if (variant === 'boulevard') {
        c.fillStyle = '#0a0809'; c.fillRect(0, F - 230, RW, 230);
        for (let x = 40; x < RW; x += 400) facade(c, x, 240, 200 + r() * 40, F, { col: '#141012', lit: 'rgba(242,165,74,0.4)', r });
        c.fillStyle = '#d8d6d0'; c.fillRect(RW - 520, F - 120, 220, 120); c.fillStyle = '#a8a6a0'; c.fillRect(RW - 540, F - 140, 260, 22); // porcelain gas station
        c.fillStyle = '#1a1416'; c.font = '700 14px Oswald'; c.fillText('G A S', RW - 450, F - 124);
      } else if (variant === 'alley') {
        c.fillStyle = '#100c0c'; c.fillRect(0, F - 260, RW, 260);
        for (let x = 0; x < RW - 300; x += 220) facade(c, x, 200, 230, F, { col: '#171214', r, tvs: true });
        c.fillStyle = '#2a2018'; for (let x = 0; x < RW - 300; x += 18) c.fillRect(x, F - 90, 10, 90); // board fence
      } else {
        for (let x = 0; x < RW; x += 330) {
          if (variant === 'burn' && x > 800 && x < 1500) continue;
          if (variant === 'lawn' && x > 700 && x < 1500) continue;
          facade(c, x + 30, 240, 170 + r() * 30, F - 10, { col: '#1a1517', r, tvs: true });
        }
        if (variant === 'burn') facade(c, 860, 600, 300, F - 10, { col: '#2a201b', lit: 'rgba(242,165,74,0.75)', old: true, r });
        if (variant === 'lawn') { facade(c, 760, 380, 200, F - 10, { col: '#221c1d', r }); facade(c, 1200, 260, 180, F - 10, { col: '#141012', r }); }
        if (variant === 'corner') { facade(c, RW - 340, 300, 190, F - 10, { col: '#2a2420', lit: 'rgba(255,214,150,0.85)', r: () => 0.9 }); radial(c, RW - 190, F - 100, 220, 'rgba(255,200,120,A)', 0.25); }
        if (variant === 'corner') { c.fillStyle = '#0a0808'; c.fillRect(30, F - 120, 120, 120); radial(c, 90, F - 40, 90, 'rgba(240,225,190,A)', 0.4); c.fillStyle = '#d9cba8'; c.font = '600 12px Oswald'; c.fillText('S U B W A Y', 50, F - 100); }
      }
      c.fillStyle = vgrad(c, F - 14, F, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']]); c.fillRect(0, F - 14, RW, 14);
      speckle(c, RW, F, 9000, 21);
    });
    addLayer(s, key, 1, 1);
    lampPost(s);
    const posts: number[] = [];
    for (let x = 500; x < RW; x += 700) { occluder(s, 'k:lamppost', x, 1.3); posts.push(x); }
    const lights: Light[] = posts.map((x) => ({ x, y: 120, color: C.amberN, r: 320 }));
    for (const x of posts) s.add.image(x, 70, 'cone').setOrigin(0.5, 0).setScale(1.2, 1.25).setTint(C.amberN).setAlpha(0.3).setBlendMode(ADD).setDepth(2).setScrollFactor(1.3);
    const fx: Record<string, () => void> = {};
    let update: ((f: Flags) => void) | undefined;
    if (variant === 'burn') {
      s.add.image(380, 470, 'k:truck').setOrigin(0.5, 1).setDepth(3).setFlipX(true);
      const piles = [900, 1060, 1220].map((x) => s.add.image(x, 472, 'k:pile').setOrigin(0.5, 1).setDepth(4.4));
      paint(s, 'k:pile', 120, 50, (c) => {
        const r = rng(12);
        for (let i = 0; i < 26; i++) { c.save(); c.translate(20 + r() * 80, 44 - r() * 26); c.rotate((r() - 0.5) * 1.2); c.fillStyle = ['#d9cba8', '#6b2a1a', '#2a3a5a', '#7a6a3a'][i % 4]; c.fillRect(-11, -3, 22, 7); c.restore(); }
      });
      piles.forEach((p) => p.setTexture('k:pile'));
      // books fall from the upper windows
      s.add.particles(0, 0, 'book', { x: { min: 940, max: 1380 }, y: 150, speedY: { min: 80, max: 140 }, speedX: { min: -30, max: 30 }, rotate: { min: 0, max: 360 }, lifespan: 2200, frequency: 700, gravityY: 120 }).setDepth(3.5);
      update = (f) => piles.forEach((p, i) => { if (f[`c01.p${i + 1}`]) p.setTint(0x7a6a50); });
      fx.ignite = () => first('ignite', () => {
        piles.forEach((p) => fireAt(s, p.x, 472, 2));
        [960, 1100, 1240].forEach((x, i) => s.time.delayedCall(500 + i * 300, () => fireAt(s, x, F - 120, 3, false, 2.5)));
        s.cameras.main.flash(300, 255, 140, 60);
      });
    }
    if (variant === 'corner') {
      fx.leaves = () => s.add.particles(0, 0, 'leaf', { x: { min: 400, max: 1000 }, y: { min: 380, max: 520 }, speedX: { min: 60, max: 140 }, speedY: { min: -20, max: 20 }, rotate: { min: 0, max: 360 }, lifespan: 4000, quantity: 1, frequency: 90, duration: 3000 }).setDepth(6);
      s.add.particles(0, 0, 'leaf', { x: { min: 0, max: RW }, y: -10, speedY: { min: 20, max: 50 }, speedX: { min: 10, max: 40 }, rotate: { min: 0, max: 360 }, lifespan: 9000, frequency: 600 }).setDepth(6);
    }
    if (variant === 'lawn') {
      s.add.image(320, 470, 'k:truck').setOrigin(0.5, 1).setDepth(3);
      update = (f) => { if (f['c10.w3']) first('housefire', () => [820, 960, 1100].forEach((x) => fireAt(s, x, F - 20, 3, false, 2.5))); };
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

const home: Kit = (s, room) => {
  const RW = 2600, F = FLOOR_TOP;
  paint(s, 'k:home:wall', RW, F, (c) => {
    c.fillStyle = vgrad(c, 0, F, [[0, '#24242a'], [1, '#18181c']]); c.fillRect(0, 0, RW, F);
    c.fillStyle = '#121216'; c.fillRect(0, 0, RW, 40);
    c.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = 0; x < RW; x += 120) c.fillRect(x, 40, 1, F - 40);
    // front door with its hand-print plate and speaker
    c.fillStyle = '#0d0d10'; c.fillRect(60, 150, 110, F - 150); c.fillStyle = '#c9a85a'; c.fillRect(176, 250, 12, 18);
    // hall ventilator grill (unexplained; the camera only glances at it)
    c.fillStyle = '#3a3a40'; c.fillRect(360, 90, 80, 40); c.fillStyle = '#121216'; for (let x = 364; x < 438; x += 8) c.fillRect(x, 94, 4, 32);
    // bedroom: window with moon, twin bed headboards
    c.fillStyle = '#0a0c14'; c.fillRect(800, 110, 160, 150); radial(c, 900, 160, 40, 'rgba(220,225,235,A)', 0.4);
    c.strokeStyle = '#2e2e36'; c.lineWidth = 8; c.strokeRect(800, 110, 160, 150);
    c.fillStyle = '#20202a'; c.fillRect(680, 250, 90, F - 250); c.fillRect(1000, 250, 90, F - 250);
    // kitchen: brass incinerator slot, toaster
    c.fillStyle = '#2a2a30'; c.fillRect(1240, 180, 180, F - 180); c.fillStyle = '#c9a85a'; c.fillRect(1300, 230, 60, 8);
    c.fillStyle = '#5a5a62'; c.fillRect(1380, 160, 30, 20);
    // parlor: three wall-sized screens (content added as live layers)
    for (const x of PARLOR) { c.fillStyle = '#060608'; c.fillRect(x - 150, 60, 300, 250); }
    speckle(c, RW, F, 12000, 31, 0.02);
  });
  addLayer(s, 'k:home:wall', 1, 1);
  const tvs = PARLOR.map((x, i) => s.add.tileSprite(x - 144, 66, 288, 238, 'tv').setOrigin(0).setDepth(1.5)
    .setTint([0xffd0a0, 0xa0d8ff, 0xffa0d0][i]));
  const tvGlow = PARLOR.map((x) => s.add.image(x, 220, 'glow').setScale(4, 3).setTint(0x80c0ff).setAlpha(0.22).setBlendMode(ADD).setDepth(2));
  paint(s, 'k:bed', 200, 70, (c) => { c.fillStyle = '#2a2830'; c.fillRect(0, 20, 200, 40); c.fillStyle = '#c8c6cc'; c.fillRect(6, 14, 188, 14); c.fillStyle = '#e0dde4'; c.fillRect(8, 6, 50, 14); c.fillStyle = '#121216'; c.fillRect(6, 60, 8, 10); c.fillRect(186, 60, 8, 10); });
  s.add.image(740, 452, 'k:bed').setOrigin(0.5, 1).setDepth(4.6);
  s.add.image(1060, 452, 'k:bed').setOrigin(0.5, 1).setDepth(4.6);
  paint(s, 'k:chair', 90, 110, (c) => { c.fillStyle = '#3a2e36'; c.fillRect(10, 0, 70, 70); c.fillRect(0, 50, 90, 30); c.fillStyle = '#121216'; c.fillRect(8, 80, 6, 30); c.fillRect(76, 80, 6, 30); });
  s.add.image(1830, 452, 'k:chair').setOrigin(0.5, 1).setDepth(4.4);
  paint(s, 'k:doorframe', 70, H, (c) => { c.fillStyle = '#0a0a0c'; c.fillRect(18, 0, 34, H); c.fillRect(0, 0, 70, 30); c.fillStyle = 'rgba(160,200,215,0.12)'; c.fillRect(51, 30, 1, H); });
  occluder(s, 'k:doorframe', 560, 1.3); occluder(s, 'k:doorframe', 1210, 1.3); occluder(s, 'k:doorframe', 1500, 1.3);
  const vChair = s.add.image(400, 480, 'k:chair').setOrigin(0.5, 1).setDepth(5.5).setScale(0.8).setVisible(false);
  const pile = s.add.image(470, 480, 'k:pile2').setOrigin(0.5, 1).setDepth(5.4).setVisible(false);
  paint(s, 'k:pile2', 120, 40, (c) => { const r = rng(4); for (let i = 0; i < 20; i++) { c.save(); c.translate(15 + r() * 90, 34 - r() * 18); c.rotate((r() - 0.5)); c.fillStyle = ['#d9cba8', '#6b2a1a', '#2a3a5a', '#7a6a3a', '#3a5a3a'][i % 5]; c.fillRect(-11, -3, 22, 7); c.restore(); } });
  pile.setTexture('k:pile2');
  return {
    floor: { key: 'hometile', top: '#2e2d33', bottom: '#0a0a0c', line: 'rgba(255,255,255,0.05)', spacing: 90, kind: 'tile' },
    lights: [{ x: 300, y: 200, color: 0xd8d0c0, r: 300 }, { x: 900, y: 200, color: 0x9ab0c8, r: 260 }, ...PARLOR.map((x) => ({ x, y: 220, color: 0x9ad0ff, r: 300 }))],
    fx: { tvOff: () => tvs.forEach((t) => t.setVisible(false)), tvOn: () => tvs.forEach((t) => t.setVisible(true)) },
    tick: (dt) => tvs.forEach((t, i) => { if (t.visible) t.tilePositionX += dt * (0.02 + i * 0.012); }),
    update: (f) => {
      const off = (!!f['c09.off'] && room.id !== 'home3') || room.id === 'home5' || room.id === 'home3';
      tvs.forEach((t) => t.setVisible(!off)); tvGlow.forEach((g) => g.setVisible(!off));
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
    for (let i = 0; i < 10; i++) { c.fillStyle = i % 2 ? '#3a281a' : '#2e2014'; poly(c, [700 + i * 30, F - i * 22, 760 + i * 30, F - i * 22, 760 + i * 30, F - i * 22 - 22, 700 + i * 30, F - i * 22 - 22]); }
    // attic roof beams and heaps of books
    c.fillStyle = '#120c08';
    for (let x = 1000; x < RW; x += 140) poly(c, [x, 0, x + 20, 0, x + 120, F - 160, x + 100, F - 160]);
    const r = rng(8);
    for (let i = 0; i < 400; i++) {
      const x = 1000 + r() * 780, y = F - r() * 150;
      c.fillStyle = ['#d9cba8', '#6b2a1a', '#2a3a5a', '#7a6a3a', '#3a2a1a'][i % 5]; c.fillRect(x, y, 22 + r() * 8, 5 + r() * 3);
    }
    for (let x = 200; x < 640; x += 110) { c.fillStyle = '#2a1c12'; c.fillRect(x, 120, 90, 200); c.fillStyle = '#4a3220'; for (let y = 130; y < 310; y += 30) c.fillRect(x + 4, y, 82, 4); for (let y = 134; y < 310; y += 30) for (let b = x + 6; b < x + 84; b += 7) { c.fillStyle = ['#6b2a1a', '#2a3a5a', '#7a6a3a'][(b + y) % 3]; c.fillRect(b, y - 18, 6, 18); } }
    radial(c, 1400, 60, 200, 'rgba(242,165,74,A)', 0.2);
    speckle(c, RW, F, 14000, 41);
  });
  addLayer(s, 'k:attic:wall', 1, 1);
  paint(s, 'k:banister', 50, H, (c) => { c.fillStyle = '#0a0705'; c.fillRect(20, 120, 12, H); c.fillRect(0, 110, 50, 14); });
  occluder(s, 'k:banister', 880, 1.3);
  dust(s, RW);
  const fall = s.add.particles(0, 0, 'book', { x: { min: 1000, max: 1500 }, y: 40, speedY: { min: 120, max: 220 }, rotate: { min: 0, max: 360 }, lifespan: 1800, frequency: 120, gravityY: 200, emitting: false }).setDepth(7);
  return {
    floor: { key: 'boards', top: '#3a281a', bottom: '#100a06', line: 'rgba(0,0,0,0.5)', spacing: 60, kind: 'boards' },
    lights: [{ x: 400, y: 200, color: C.amberN, r: 300 }, { x: 1400, y: 120, color: C.amberN, r: 360 }],
    fx: { books: () => { fall.start(); s.time.delayedCall(4000, () => fall.stop()); }, glowOrange: () => s.cameras.main.flash(900, 255, 120, 40) },
  };
};

const faber: Kit = (s) => {
  const RW = 1500, F = FLOOR_TOP;
  paint(s, 'k:faber:wall', RW, F, (c) => {
    c.fillStyle = vgrad(c, 0, F, [[0, '#3a3834'], [1, '#26241f']]); c.fillRect(0, 0, RW, F); // white plaster gone grey at night
    c.fillStyle = '#121010'; c.fillRect(60, 150, 100, F - 150);
    c.fillStyle = '#2a201a'; for (let x = 400; x < 600; x += 66) c.fillRect(x, 120, 56, 220); // empty shelves
    c.fillStyle = '#3a2a1e'; for (let y = 150; y < 340; y += 48) c.fillRect(400, y, 196, 5);
    // workshop bench with coils and crystals
    c.fillStyle = '#20180f'; c.fillRect(880, 260, 260, 20); c.fillRect(890, 280, 10, F - 280); c.fillRect(1120, 280, 10, F - 280);
    const r = rng(2); for (let i = 0; i < 60; i++) { c.fillStyle = r() > 0.5 ? '#9a8a5a' : '#5a7a7a'; c.fillRect(890 + r() * 240, 248 + r() * 10, 2 + r() * 4, 2 + r() * 4); }
    radial(c, 1010, 230, 120, 'rgba(242,190,110,A)', 0.35);
    // small picture-frame television
    c.fillStyle = '#3a2a1e'; c.fillRect(1260, 140, 110, 84); c.fillStyle = '#0a0c10'; c.fillRect(1270, 150, 90, 64);
    speckle(c, RW, F, 9000, 51, 0.02);
  });
  addLayer(s, 'k:faber:wall', 1, 1);
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
    speckle(c, RW, F, 6000, 61, 0.02);
  });
  addLayer(s, 'k:subway:wall', 1, 1);
  paint(s, 'k:subpole', 30, H, (c) => { c.fillStyle = hgrad(c, 8, 22, [[0, '#4a4a50'], [0.5, '#d0d0d8'], [1, '#4a4a50']]); c.fillRect(8, 0, 14, H); });
  for (let x = 300; x < RW; x += 420) occluder(s, 'k:subpole', x, 1.28);
  return {
    floor: { key: 'metal', top: '#2e2c30', bottom: '#0a0a0c', line: 'rgba(255,255,255,0.06)', spacing: 40, kind: 'metal' },
    lights: [{ x: 300, y: 60, color: 0xe8e2d0, r: 300 }, { x: 900, y: 60, color: 0xe8e2d0, r: 300 }],
    fx: {},
    tick: (dt) => { tunnel.tilePositionX += dt * 1.6; },
  };
};

// ---------------- river and forest ----------------

function forest(variant: 'river' | 'camp'): Kit {
  return (s, room) => {
    const RW = room.width, F = FLOOR_TOP;
    nightSky(s, 'k:sky:wild', true, 0.1);
    addLayer(s, 'k:sky:wild', 0.12, 0);
    skyline(s, 'k:city:far', W + 200, 0.08, 330, '#160f10');
    const city = addLayer(s, 'k:city:far', 0.08, 0.3).setTint(0x6a5a5a);
    paint(s, `k:forest:${variant}`, RW, F, (c) => {
      const r = rng(RW + 7);
      for (let x = -50; x < RW; x += 70) tree(c, x + r() * 40, F, 150 + r() * 170, '#070908', r);
      if (variant === 'river') { c.fillStyle = '#0a0d10'; c.fillRect(0, F - 40, RW * 0.62, 40); }
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
      fireAt(s, 1000, 470, 1.4, true, 4.4);
      lights.push({ x: 1000, y: 430, color: 0xffb050, r: 360 });
      const tvGlow = s.add.image(1180, 440, 'glow').setScale(0.6).setTint(0x80c0ff).setAlpha(0).setBlendMode(ADD).setDepth(4);
      fx.tvOn = () => { tvGlow.setAlpha(0.5); s.tweens.add({ targets: tvGlow, alpha: 0.3, yoyo: true, repeat: -1, duration: 150 }); };
      fx.tvOff = () => { s.tweens.killTweensOf(tvGlow); tvGlow.setAlpha(0); };
    }
    // shared by all endings: the city dies on the horizon
    fx.bombs = () => {
      const cam = s.cameras.main;
      s.time.delayedCall(200, () => cam.flash(1400, 255, 250, 240));
      s.time.delayedCall(900, () => { city.setTint(0xffffff); s.tweens.add({ targets: city, alpha: 0, y: 40, duration: 2600 }); cam.shake(900, 0.004); });
      s.time.delayedCall(1600, () => s.add.particles(0, 0, 'smoke', { x: { min: 0, max: W }, y: 340, speedY: { min: -20, max: -5 }, lifespan: 9000, frequency: 120, scale: { start: 1, end: 3 }, alpha: { start: 0.25, end: 0 }, tint: 0x8a7a70, duration: 6000 }).setScrollFactor(0.1).setDepth(0.6));
    };
    fx.dawn = () => {
      const dawn = s.add.rectangle(0, 0, W, H, 0xff9a70, 0).setOrigin(0).setScrollFactor(0).setDepth(890).setBlendMode(ADD);
      s.tweens.add({ targets: dawn, fillAlpha: 0.12, duration: 4000 });
    };
    return {
      floor: variant === 'river'
        ? { key: 'water', top: '#0e1620', bottom: '#020406', line: 'rgba(160,190,210,0.12)', spacing: 70, kind: 'water' }
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
