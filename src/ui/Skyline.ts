import Phaser from 'phaser';
import { paint, rng, vgrad, radial, type Ctx } from '../art/core.ts';
import { H, W } from '../view.ts';

const KEY = 'ui:skyline';

/** Night skyline strip, painted once. Title and end cards scroll it slowly; nothing runs per frame. */
export function skylineKey(scene: Phaser.Scene): string {
  paint(scene, KEY, W * 2, H, (c: Ctx) => {
    vgrad(c, 0, H, [[0, '#1d1614'], [0.6, '#3a2619'], [1, '#5a3520']]);
    radial(c, W * 1.2, H * 0.95, 380, 'rgba(232,104,46,A)', 0.35);
    const r = rng(451);
    let x = 0;
    while (x < W * 2) {
      const bw = 40 + r() * 80, bh = 90 + r() * 200;
      c.fillStyle = '#080605'; c.fillRect(x, H - bh, bw, bh);
      for (let wy = H - bh + 14; wy < H - 20; wy += 22) for (let wx = x + 8; wx < x + bw - 10; wx += 16) {
        if (r() < 0.14) { c.fillStyle = 'rgba(242,165,74,0.6)'; c.fillRect(wx, wy, 6, 9); }
      }
      x += bw + 2;
    }
  });
  return KEY;
}
