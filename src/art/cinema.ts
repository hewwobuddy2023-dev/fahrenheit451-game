// Final-sprint set pieces: parlor broadcasts, approaching cars, helicopters, the running Hound,
// the boulevard billboard and surveillance poles. All painted once into textures (no shaders,
// no per-frame drawing); animation is sprite frames and tweens only.
import Phaser from 'phaser';
import { paint, poly, radial, vgrad, type Ctx } from './core.ts';
import { FLOOR_TOP } from '../view.ts';
import { settings } from '../settings.ts';
import { fireAt } from './fx.ts';
import type { Light, RoomDef } from '../content/types.ts';
import type { Flags } from '../state.ts';

const ADD = Phaser.BlendModes.ADD;
const TV_W = 288, TV_H = 238;

function sheet(s: Phaser.Scene, key: string, w: number, h: number, frames: number, draw: (c: Ctx, f: number) => void, rate: number) {
  if (s.textures.exists(key)) return;
  const t = paint(s, key, w * frames, h, (c) => { for (let f = 0; f < frames; f++) { c.save(); c.translate(f * w, 0); c.beginPath(); c.rect(0, 0, w, h); c.clip(); draw(c, f); c.restore(); } });
  for (let f = 0; f < frames; f++) t.add(f, 0, f * w, 0, w, h);
  if (!s.anims.exists(key)) s.anims.create({ key, frames: Array.from({ length: frames }, (_, f) => ({ key, frame: f })), frameRate: rate, repeat: -1 });
}

/** Head-and-shoulders broadcast figure; `turn` 0 = profile, 1 = facing the viewer. */
function person(c: Ctx, x: number, y: number, s: number, skin: string, cloth: string, turn: number, mouth: number) {
  c.fillStyle = cloth;
  c.beginPath(); c.ellipse(x, y + 46 * s, 34 * s, 26 * s, 0, Math.PI, 0); c.fill();
  c.fillRect(x - 34 * s, y + 46 * s, 68 * s, 40 * s);
  c.fillStyle = skin;
  c.beginPath(); c.ellipse(x + (1 - turn) * 4 * s, y, 15 * s, 19 * s, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2a2018';
  c.beginPath(); c.ellipse(x, y - 13 * s, 16 * s, 9 * s, 0, Math.PI, 0); c.fill(); // hair
  if (turn > 0.5) {
    c.fillStyle = '#141014';
    c.fillRect(x - 8 * s, y - 3 * s, 5 * s, 2 * s); c.fillRect(x + 3 * s, y - 3 * s, 5 * s, 2 * s);
    c.beginPath(); c.ellipse(x, y + 8 * s, 7 * s, (1.5 + mouth * 4) * s, 0, 0, Math.PI); c.fill(); // the wide fixed smile
    c.fillStyle = '#f1ebe0'; c.fillRect(x - 5 * s, y + 8 * s, 10 * s, 1.5 * s);
  } else {
    poly(c, [x + 15 * s, y - 2 * s, x + 21 * s, y + 3 * s, x + 15 * s, y + 5 * s]); // nose in profile
  }
}

function screen(c: Ctx, f: number, top: string, bottom: string) {
  c.fillStyle = vgrad(c, 0, TV_H, [[0, top], [1, bottom]]); c.fillRect(0, 0, TV_W, TV_H);
  c.fillStyle = `rgba(255,255,255,${0.03 + (f % 2) * 0.02})`;
  for (let y = 0; y < TV_H; y += 3) c.fillRect(0, y, TV_W, 1);
}

function scanlinesAndCurve(c: Ctx) {
  c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 1; y < TV_H; y += 3) c.fillRect(0, y, TV_W, 1);
  const g = c.createRadialGradient(TV_W / 2, TV_H / 2, TV_H * 0.3, TV_W / 2, TV_H / 2, TV_W * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
  c.fillStyle = g; c.fillRect(0, 0, TV_W, TV_H);
}

export function paintCinema(s: Phaser.Scene) {
  // Wall 1: a shouting match nobody can follow.
  sheet(s, 'tv:argue', TV_W, TV_H, 4, (c, f) => {
    screen(c, f, '#c2365a', '#3a1230');
    radial(c, 144, 90, 120, 'rgba(255,190,120,A)', 0.25);
    person(c, 80 + (f === 1 ? 6 : 0), 92, 1.25, '#e8b49a', '#26324a', 0.2, f % 2);
    c.save(); c.translate(288, 0); c.scale(-1, 1); person(c, 80 + (f === 3 ? 6 : 0), 96, 1.2, '#d9a48a', '#47222e', 0.2, (f + 1) % 2); c.restore();
    c.fillStyle = '#f6e7c8'; c.font = '700 13px Oswald'; c.fillText('LIVE  ·  YOUR FAMILY', 12, 226);
    scanlinesAndCurve(c);
  }, 4);
  // Wall 2: the studio audience laughing on cue.
  sheet(s, 'tv:laugh', TV_W, TV_H, 3, (c, f) => {
    screen(c, f, '#2c5f8a', '#0c1b2c');
    for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) {
      const x = 16 + i * 32 + (row % 2) * 16, y = 70 + row * 42 + ((i + f) % 2) * 3;
      c.fillStyle = row % 2 ? '#c9d6e6' : '#a9bdd4';
      c.beginPath(); c.ellipse(x, y, 11, 14, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0a1420'; c.beginPath(); c.ellipse(x, y + 5, 5, f === 1 ? 2 : 6, 0, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#ffe9a6'; c.font = '700 22px Oswald'; c.textAlign = 'center'; c.fillText(f === 1 ? '' : 'LAUGH', 144, 40);
    scanlinesAndCurve(c);
  }, 3);
  // Wall 3: the family at dinner, turning one by one to smile out at the room.
  sheet(s, 'tv:family', TV_W, TV_H, 4, (c, f) => {
    screen(c, f, '#d39a52', '#4a2a16');
    c.fillStyle = '#5c3a22'; c.fillRect(0, 170, TV_W, 68);
    c.fillStyle = '#efe2c8'; c.fillRect(20, 168, 248, 8);
    [52, 112, 176, 236].forEach((x, i) => person(c, x, 112, 0.95, ['#eec4a0', '#e2b090', '#f0caa8', '#dcae8e'][i], ['#3b5a4a', '#6a3a3a', '#2f4466', '#5a4a2a'][i], i <= f ? 1 : 0.1, 1));
    scanlinesAndCurve(c);
  }, 1.2);

  // A beetle car seen head-on, for the boulevard's approaching traffic.
  paint(s, 'car', 170, 110, (c) => {
    c.fillStyle = '#0d0d10'; c.beginPath(); c.ellipse(85, 70, 82, 38, 0, Math.PI, 0); c.fill(); c.fillRect(3, 70, 164, 30);
    c.fillStyle = '#2a2f36'; c.beginPath(); c.ellipse(85, 46, 46, 22, 0, Math.PI, 0); c.fill();
    c.fillStyle = 'rgba(160,190,210,0.25)'; c.beginPath(); c.ellipse(85, 47, 38, 15, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#b8b2a2'; c.fillRect(48, 84, 74, 4);
    for (const x of [30, 140]) { c.fillStyle = '#fff6dc'; c.beginPath(); c.arc(x, 78, 13, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffe9a0'; c.beginPath(); c.arc(x, 78, 7, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#050506'; c.fillRect(12, 100, 30, 10); c.fillRect(128, 100, 30, 10);
  });
  // A police helicopter silhouette with its rotor and warning lamp.
  paint(s, 'heli', 150, 56, (c) => {
    c.fillStyle = '#08090b';
    c.beginPath(); c.ellipse(60, 32, 38, 16, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(90, 28, 52, 6); c.fillRect(136, 18, 6, 18); c.fillRect(20, 10, 90, 3); c.fillRect(56, 12, 6, 10);
    c.fillRect(38, 48, 44, 3); c.fillRect(44, 44, 3, 6); c.fillRect(72, 44, 3, 6);
    c.fillStyle = 'rgba(150,190,210,0.35)'; c.beginPath(); c.ellipse(42, 30, 14, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ff3a2a'; c.fillRect(58, 46, 4, 3);
  });
  // The Mechanical Hound, running: four frames of eight spidered legs.
  sheet(s, 'hound:run', 190, 90, 4, (c, f) => {
    const draw = (col: string, dx: number, dy: number) => {
      c.save(); c.translate(dx, dy); c.fillStyle = c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = 3;
      [62, 84, 112, 136].forEach((x, i) => {
        const a = Math.sin((f / 4) * Math.PI * 2 + i * 1.3) * 12;
        c.beginPath(); c.moveTo(x, 50); c.lineTo(x - 10 + a, 64); c.lineTo(x - 14 + a * 1.4, 84); c.stroke();
        c.beginPath(); c.moveTo(x + 4, 50); c.lineTo(x + 12 - a, 64); c.lineTo(x + 8 - a * 1.4, 84); c.stroke();
      });
      poly(c, [54, 38, 90, 26, 152, 30, 172, 42, 142, 54, 60, 54]); poly(c, [58, 34, 26, 42, 58, 52]);
      c.lineWidth = 1.5; c.beginPath(); c.moveTo(28, 43); c.lineTo(4, 47); c.stroke(); c.restore();
    };
    draw('rgba(127,214,200,0.55)', 1, -1); draw('#262c2d', 0, 0);
    c.fillStyle = '#9ff2e2'; c.fillRect(40, 38, 4, 3);
  }, 12);
}

/** A layered pine for the country beyond the city. */
export function pine(c: Ctx, x: number, base: number, h: number, col: string) {
  c.fillStyle = col;
  c.fillRect(x - 3, base - h * 0.2, 6, h * 0.2);
  for (let i = 0; i < 5; i++) {
    const y = base - h * (0.18 + i * 0.17), w = h * (0.34 - i * 0.055);
    poly(c, [x - w, y, x + w, y, x + w * 0.15, y - h * 0.28, x, y - h * 0.34, x - w * 0.15, y - h * 0.28]);
  }
}

export interface CinemaParts { lights: Light[]; update?: (f: Flags) => void; fx: Record<string, () => void> }

/** Per-room set pieces layered over the kit. */
export function cinematicSet(s: Phaser.Scene, room: RoomDef): CinemaParts {
  const parts: CinemaParts = { lights: [], fx: {} };
  const F = FLOOR_TOP;
  if (room.kit === 'street:boulevard') {
    // The two-hundred-foot billboard Clarisse mentions, and loudspeaker/camera poles.
    paint(s, 'k:street:billboard', 900, 150, (c) => {
      c.fillStyle = '#0b0b0e'; c.fillRect(0, 0, 900, 150);
      c.fillStyle = vgrad(c, 8, 142, [[0, '#d6563a'], [1, '#7a1f2a']]); c.fillRect(8, 8, 884, 126);
      for (let i = 0; i < 6; i++) person(c, 470 + i * 70, 62, 0.8, '#f0cfae', ['#244', '#422', '#243', '#334', '#432', '#244'][i], 1, 1);
      c.fillStyle = '#fff1d6'; c.font = '700 54px Oswald'; c.fillText("DENHAM'S", 30, 78);
      c.font = '600 22px Oswald'; c.fillText('DENTIFRICE  ·  YOUR FAMILY IS WAITING', 32, 116);
      c.fillStyle = '#1a1a1f'; for (let x = 60; x < 900; x += 160) c.fillRect(x, 134, 8, 16);
    });
    const bb = s.add.image(260, 70, 'k:street:billboard').setOrigin(0).setDepth(0.9).setScrollFactor(0.75);
    s.add.image(260 + 450, 140, 'glow').setScale(9, 2.2).setTint(0xff7a50).setAlpha(0.18).setBlendMode(ADD).setDepth(0.95).setScrollFactor(0.75);
    s.tweens.add({ targets: bb, alpha: 0.86, yoyo: true, repeat: -1, duration: 2300, ease: 'Sine.easeInOut' });
    paint(s, 'k:street:speaker', 60, 300, (c) => {
      c.fillStyle = '#08080a'; c.fillRect(27, 40, 6, 260); poly(c, [8, 22, 30, 30, 30, 48, 8, 56]); poly(c, [52, 22, 30, 30, 30, 48, 52, 56]);
      c.fillRect(24, 4, 12, 14); c.fillStyle = '#ff3a2a'; c.fillRect(28, 8, 4, 4);
    });
    for (const x of [430, 1130, 1830]) {
      s.add.image(x, F + 2, 'k:street:speaker').setOrigin(0.5, 1).setDepth(1.2);
      const eye = s.add.image(x, F - 290, 'glow').setScale(0.12).setTint(0xff3a2a).setBlendMode(ADD).setDepth(1.25);
      if (!settings.reducedMotion) s.tweens.add({ targets: eye, alpha: 0.15, yoyo: true, repeat: -1, duration: 700 });
    }
  }
  if (room.id === 'lawn2') {
    // The Hound comes across the lawn, veers off, comes again, until Montag fires.
    const hound = s.add.sprite(1720, 470, 'hound:run').setOrigin(0.5, 1).setDepth(5.2).setVisible(false);
    let run: Phaser.Tweens.Tween | undefined;
    parts.fx.houndLeap = () => {
      hound.setVisible(true).play('hound:run');
      run = s.tweens.add({ targets: hound, x: 990, duration: 1700, ease: 'Quad.easeIn', yoyo: true, hold: 120, repeat: -1,
        onYoyo: () => hound.setFlipX(true), onRepeat: () => hound.setFlipX(false) });
      s.tweens.add({ targets: hound, y: 452, duration: 300, yoyo: true, repeat: -1, repeatDelay: 1100, ease: 'Sine.easeOut' });
    };
    parts.fx.houndBurn = () => {
      run?.stop(); s.tweens.killTweensOf(hound);
      hound.setFlipX(false).setPosition(Math.min(hound.x, 1100), 470).stop().setTint(0xff9a50);
      fireAt(s, hound.x, 474, 2, false, 5.3);
      s.tweens.add({ targets: hound, angle: -18, y: 478, duration: 500, ease: 'Bounce.easeOut', onComplete: () => hound.setTint(0x2a2220) });
    };
  }
  if (room.id === 'river') {
    // Moon on the water and the helicopters quartering the far bank.
    const moon = s.add.image(560, F + 40, 'glow').setScale(6, 0.4).setTint(0xcfd8e6).setAlpha(0.3).setBlendMode(ADD).setDepth(1.15).setScrollFactor(0.2);
    if (!settings.reducedMotion) s.tweens.add({ targets: moon, scaleX: 4.2, alpha: 0.14, yoyo: true, repeat: -1, duration: 1900, ease: 'Sine.easeInOut' });
    for (const [i, x] of [300, 900].entries()) {
      const h = s.add.image(x, 70 + i * 30, 'heli').setScale(0.8 - i * 0.15).setDepth(0.8).setScrollFactor(0.25);
      const beam = s.add.image(x, 84 + i * 30, 'cone').setOrigin(0.5, 0).setScale(0.5, 1.2).setTint(0xdfefff).setAlpha(0.16).setBlendMode(ADD).setDepth(0.79).setScrollFactor(0.25);
      s.tweens.add({ targets: [h, beam], x: x + 500, duration: 14000 + i * 5000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => h.setFlipX(true), onRepeat: () => h.setFlipX(false) });
      if (!settings.reducedMotion) s.tweens.add({ targets: beam, angle: 14, yoyo: true, repeat: -1, duration: 2600 + i * 700, ease: 'Sine.easeInOut' });
    }
  }
  return parts;
}
