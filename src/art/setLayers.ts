// Layered extras for the set dressing: room-family specific pieces, contact shadows, a mid-ground behind the
// room wall and foreground silhouettes that cross the player. Everything is painted once at boot.
import Phaser from 'phaser';
import { paint, poly, radial, rng, type Ctx } from './core.ts';
import { FLOOR_TOP, H, W } from '../view.ts';
import type { RoomDef } from '../content/types.ts';

/** Subway platform: tiled arch ribs, hanging tube lights, a route map and the edge strip; no pipes or lamp cones (the station owns those). */
export function subwayDressing(c: Ctx, RW: number, F: number, r: () => number) {
  for (let x = 60; x < RW; x += 220) { c.fillStyle = 'rgba(8,8,10,0.35)'; c.fillRect(x - 12, 30, 12, F - 30); c.fillStyle = 'rgba(255,240,200,0.06)'; c.fillRect(x - 1, 30, 1, F - 30); }
  for (let x = 150; x < RW; x += 440) { c.fillStyle = '#0a0a0c'; c.fillRect(x - 1, 0, 2, 44); c.fillStyle = '#e8e2d0'; c.fillRect(x - 46, 44, 92, 5); radial(c, x, 48, 70, 'rgba(232,226,208,A)', 0.35); }
  const mx = RW * 0.5;
  c.fillStyle = '#1d3a2c'; c.fillRect(mx - 70, 150, 140, 58); c.strokeStyle = '#d9cba8'; c.lineWidth = 1; c.strokeRect(mx - 70, 150, 140, 58);
  c.strokeStyle = '#e4c070'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx - 58, 190); c.lineTo(mx - 20, 170); c.lineTo(mx + 10, 185); c.lineTo(mx + 55, 160); c.stroke();
  c.fillStyle = '#d6b24a'; c.fillRect(0, F - 8, RW, 3);
  for (let x = 0; x < RW; x += 24) { c.fillStyle = 'rgba(20,18,12,0.5)'; c.fillRect(x, F - 8, 12, 3); }
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(r() * RW, 60 + r() * 220, 3 + r() * 10, 1 + r() * 3); }
}

/** Attic: cobwebs in the roof corners, a steamer trunk, a sheeted chair and a dress form between the heaps. */
export function atticDressing(c: Ctx, RW: number, F: number, r: () => number) {
  c.strokeStyle = 'rgba(220,210,190,0.22)'; c.lineWidth = 1;
  for (const [x, d] of [[20, 1], [RW - 20, -1], [640, 1], [1010, -1]] as const) {
    for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + d * k * 14, k * 10, x + d * k * 26, k * 26); c.stroke(); }
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + d * 140, 110); c.stroke();
  }
  c.fillStyle = '#2a1c12'; c.beginPath(); c.roundRect(300, F - 56, 120, 54, [18, 18, 3, 3]); c.fill();
  c.fillStyle = '#6a5030'; c.fillRect(300, F - 30, 120, 4); c.fillRect(356, F - 48, 8, 46); c.fillStyle = 'rgba(255,220,160,0.12)'; c.fillRect(304, F - 54, 112, 2);
  c.fillStyle = '#8a8478'; poly(c, [480, F - 4, 470, F - 70, 500, F - 92, 540, F - 70, 530, F - 4]);
  c.fillStyle = 'rgba(0,0,0,0.25)'; poly(c, [510, F - 88, 540, F - 70, 530, F - 4, 512, F - 4]);
  c.fillStyle = '#4a3828'; c.fillRect(580, F - 130, 3, 130); c.fillStyle = '#b8a888'; poly(c, [565, F - 128, 598, F - 128, 602, F - 92, 595, F - 70, 568, F - 70, 561, F - 92]);
  for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,225,170,0.07)'; c.fillRect(r() * RW, r() * F, 1, 1 + r() * 2); }
}

/** A soft elliptical contact shadow painted once; props call this so they sit on the ground instead of floating. */
export function contactShadow(s: Phaser.Scene, x: number, y: number, w: number, a = 0.5) {
  if (!s.textures.exists('cshadow')) {
    paint(s, 'cshadow', 128, 24, (c) => {
      c.save(); c.scale(1, 24 / 128);
      const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, 128, 128); c.restore();
    });
  }
  return s.add.image(x, y, 'cshadow').setDisplaySize(w, w * 0.16).setAlpha(a).setDepth(1.9);
}

const layerW = (RW: number, f: number) => Math.ceil(W + (RW - W) * f + 40);

/** A mid-ground behind the room wall (scroll 0.4-0.72) and foreground silhouettes at 1.25 that cross the player and fade (the occluder rule). */
export function layers(s: Phaser.Scene, room: RoomDef, family: string) {
  const RW = room.width, F = FLOOR_TOP, seed = RW + room.chapter * 17;
  const mid: Record<string, number> = { street: 0.72, forest: 0.62, station: 0.4 };
  const f = mid[family];
  if (f) {
    const key = `k:${family}:mid2:${room.kit}`, w = layerW(RW, f);
    paint(s, key, w, F, (c) => {
      const r = rng(seed);
      if (family === 'street') {
        // garden walls, clipped hedges and parked cars in the far yards
        for (let x = 0; x < w; x += 140 + r() * 120) {
          const k = r();
          c.fillStyle = '#17110f';
          if (k < 0.4) { c.fillRect(x, F - 44, 110, 44); c.fillStyle = '#1f1714'; c.fillRect(x, F - 46, 110, 4); }
          else if (k < 0.75) { c.beginPath(); c.roundRect(x, F - 52, 90, 52, 22); c.fill(); }
          else { c.beginPath(); c.ellipse(x + 50, F - 28, 62, 22, 0, Math.PI, 0); c.fill(); c.fillRect(x - 12, F - 28, 124, 26); c.fillStyle = 'rgba(255,225,160,0.35)'; c.fillRect(x - 10, F - 22, 6, 5); }
        }
      } else if (family === 'forest') {
        for (let x = -30; x < w; x += 70) {
          const h = 120 + r() * 120; c.fillStyle = r() < 0.5 ? '#0e1816' : '#122020';
          poly(c, [x, F, x + 20, F - h * 0.45, x + 8, F - h * 0.45, x + 26, F - h * 0.75, x + 13, F - h * 0.75, x + 28, F - h, x + 44, F - h * 0.75, x + 31, F - h * 0.75, x + 49, F - h * 0.45, x + 36, F - h * 0.45, x + 56, F]);
        }
      } else {
        for (let x = 0; x < w; x += 70 + r() * 90) { const h = 60 + r() * 120; c.fillStyle = '#100c0d'; c.fillRect(x, 330 - h, 60 + r() * 60, h + 60); if (r() < 0.4) c.fillRect(x + 20, 300 - h, 3, 30); }
      }
    });
    s.add.image(0, 0, key).setOrigin(0).setScrollFactor(f).setDepth(family === 'station' ? 0.45 : 0.85);
  }
  // foreground silhouettes
  const fkey = `k:${family}:fg`;
  paint(s, fkey, 70, H, (c) => {
    const r = rng(seed + 5);
    if (family === 'street' || family === 'forest') {
      c.fillStyle = '#050404'; poly(c, [20, H, 26, 60, 34, 60, 42, H]); c.strokeStyle = '#050404'; c.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const y = 80 + i * 70, d = i % 2 ? 1 : -1; c.beginPath(); c.moveTo(30, y + 30); c.lineTo(30 + d * (14 + r() * 22), y); c.stroke(); }
    } else if (family === 'attic' || family === 'faber') {
      c.fillStyle = '#0a0705'; c.fillRect(24, 0, 14, H); c.fillStyle = 'rgba(255,200,140,0.1)'; c.fillRect(24, 0, 2, H); c.fillRect(8, 0, 46, 8);
    } else {
      c.fillStyle = '#080808'; c.fillRect(22, 0, 20, H); c.fillStyle = 'rgba(255,225,170,0.12)'; c.fillRect(22, 0, 2, H);
      c.fillStyle = '#080808'; c.fillRect(14, 0, 36, 10); c.fillRect(14, H - 26, 36, 8);
    }
  });
  const reach = 1.25 * (RW - W);
  if (family !== 'home') {
    for (const t of [0.3 + (seed % 7) / 40, 0.78]) {
      s.add.image(Math.round(W * 0.5 + reach * t), H, fkey).setOrigin(0.5, 1).setScrollFactor(1.25).setDepth(60).setData('occluder', 1.25);
    }
  }
  if (family === 'street' || family === 'forest') {
    const ekey = `k:${family}:edge`, ew = layerW(RW, 1.2);
    paint(s, ekey, ew, 46, (c) => {
      const r = rng(seed + 9);
      c.fillStyle = '#060806';
      for (let x = 0; x < ew; x += 5 + r() * 9) { const h = 10 + r() * 28; poly(c, [x, 46, x + 2, 46 - h, x + 5 + r() * 3, 46]); }
      c.fillRect(0, 40, ew, 6);
    });
    s.add.image(0, H, ekey).setOrigin(0, 1).setScrollFactor(1.2).setDepth(59);
  }
}
