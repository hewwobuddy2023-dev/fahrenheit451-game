// Generic 2.5D stage pieces shared by every room: line-scrolled perspective floor, light-driven
// character tint, contact shadows and the night darkness overlay.
import Phaser from 'phaser';
import { paint, rng, vgrad } from '../art/core.ts';
import type { FloorStyle } from '../art/kits.ts';
import type { Light, RoomDef } from '../content/types.ts';
import { FLOOR_TOP, H, W } from '../view.ts';

/** Floor bands: [top, bottom, scroll factor]. Bands in front of the walk line scroll faster: perspective. */
export const BANDS: [number, number, number][] = [
  [FLOOR_TOP, 420, 1], [420, 450, 1], [450, 484, 1], [484, 504, 1.12], [504, 523, 1.26], [523, H, 1.42],
];

function mix(a: string, b: string, t: number) {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

export function buildFloor(s: Phaser.Scene, st: FloorStyle) {
  return BANDS.map(([y0, y1, f], i) => {
    const h = y1 - y0;
    const span = Math.max(24, Math.round(st.spacing * (0.5 + 0.22 * i)));
    const key = `floor:${st.key}:${i}`;
    paint(s, key, span, h, (c) => {
      const t0 = (y0 - FLOOR_TOP) / (H - FLOOR_TOP), t1 = (y1 - FLOOR_TOP) / (H - FLOOR_TOP);
      c.fillStyle = vgrad(c, 0, h, [[0, mix(st.top, st.bottom, t0)], [1, mix(st.top, st.bottom, t1)]]);
      c.fillRect(0, 0, span, h);
      c.fillStyle = st.line;
      const r = rng(i * 13 + span);
      switch (st.kind) {
        case 'tile': c.fillRect(0, 0, 1 + i * 0.3, h); c.fillRect(0, 0, span, 1); break;
        case 'boards': c.fillRect(0, 0, span, 1); for (let x = 0; x < span; x += Math.max(6, span / 3)) c.fillRect(x, 0, 1, h); break;
        case 'asphalt': if (i === 3) for (let x = 0; x < span * 0.5; x++) c.fillRect(x, h / 2, 1, 2); for (let k = 0; k < 20; k++) c.fillRect(r() * span, r() * h, 1, 1); break;
        case 'earth': for (let k = 0; k < span * h * 0.02; k++) c.fillRect(r() * span, r() * h, 2, 1); break;
        case 'water': for (let k = 0; k < 4 + i; k++) c.fillRect(r() * span, r() * h, 6 + r() * 14, 1); break;
        case 'metal': for (let y = 2; y < h; y += 4) c.fillRect(0, y, span, 1); break;
      }
    });
    const band = s.add.tileSprite(0, y0, W, h, key).setOrigin(0).setScrollFactor(0).setDepth(1.1);
    return { band, f, water: st.kind === 'water' };
  });
}

export function scrollFloor(bands: ReturnType<typeof buildFloor>, camX: number, time: number) {
  for (const b of bands) b.band.tilePositionX = camX * b.f + (b.water ? time * 0.02 * b.f : 0);
}

/** Tint a character from the room's lights: warm under lamps, cold near TV walls, dim in between. */
export function lightTint(x: number, lights: Light[], ambient = 0xb0a69c) {
  let r = (ambient >> 16) & 255, g = (ambient >> 8) & 255, b = ambient & 255;
  for (const l of lights) {
    const k = Math.max(0, 1 - Math.abs(x - l.x) / l.r);
    if (!k) continue;
    r += (((l.color >> 16) & 255) - r) * k * 0.7;
    g += (((l.color >> 8) & 255) - g) * k * 0.7;
    b += ((l.color & 255) - b) * k * 0.7;
  }
  return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
}

export function shadowFor(s: Phaser.Scene, x: number, y: number, scale = 1) {
  return s.add.image(x, y + 2, 'shadow').setScale(scale).setAlpha(0.7).setDepth(4.2);
}

/** Night darkness with a small personal light (the igniter, a window) that follows a target. */
export function darkness(s: Phaser.Scene) {
  const veil = s.add.rectangle(0, 0, W, H, 0x000000, 0).setOrigin(0).setScrollFactor(0).setDepth(880);
  const halo = s.add.image(0, 0, 'glow').setScale(2.2).setTint(0xffb060).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(881);
  return {
    set(on: boolean, ms = 600) {
      s.tweens.add({ targets: veil, fillAlpha: on ? 0.82 : 0, duration: ms });
      s.tweens.add({ targets: halo, alpha: on ? 0.55 : 0, duration: ms });
    },
    follow(x: number, y: number) { halo.setPosition(x + 14, y - 120); },
  };
}

/** Static ground planes and reflections. No inputs, physics, extra particles or frame allocations. */
export function stageDetails(s: Phaser.Scene, room: RoomDef, floor: FloorStyle, lights: Light[]) {
  if (floor.kind === 'water') return; // preserve the river's existing moving surface
  const g = s.add.graphics().setDepth(1.25);
  const inside = ['station', 'home', 'attic', 'faber', 'subway'].includes(room.kit);
  if (inside) {
    g.fillStyle(0x050403, 0.45);
    for (let x = 0; x < room.width; x += 480) {
      g.fillPoints([{ x, y: FLOOR_TOP }, { x: x + 20, y: FLOOR_TOP }, { x: x + 120, y: 540 }, { x: x + 70, y: 540 }], true);
    }
    g.lineStyle(1, 0xd0b58a, 0.12);
    g.lineBetween(0, FLOOR_TOP + 1, room.width, FLOOR_TOP + 1);
  }
  for (const light of lights) {
    const cold = light.color === 0x9ad0ff || light.color === 0x9ab0c8;
    g.fillStyle(cold ? 0x8aa8b7 : 0xc78b53, inside ? 0.045 : 0.07);
    g.fillEllipse(light.x, 449, Math.min(light.r * 0.6, 190), 24);
    if (!inside && floor.kind !== 'earth') {
      // Broken reflections, rather than a large uniform bloom on the pavement.
      for (let i = 0; i < 6; i++) g.fillRect(light.x - 38 - i * 3, 417 + i * 15, 60 + (i % 3) * 10, 1 + (i % 2));
    }
  }
}
