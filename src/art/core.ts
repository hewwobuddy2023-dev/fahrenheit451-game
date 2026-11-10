// Painting helpers. All art is painted once with Canvas 2D into textures; nothing here runs per frame.
import Phaser from 'phaser';

export type Ctx = CanvasRenderingContext2D;

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paint a canvas texture once. Returns the existing texture if already painted. */
export function paint(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
  if (scene.textures.exists(key)) return scene.textures.get(key) as Phaser.Textures.CanvasTexture;
  const t = scene.textures.createCanvas(key, Math.ceil(w), Math.ceil(h))!;
  draw(t.context);
  t.refresh();
  return t;
}

export function vgrad(c: Ctx, y0: number, y1: number, stops: [number, string][]) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

export function hgrad(c: Ctx, x0: number, x1: number, stops: [number, string][]) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

/** Soft radial light. `col` uses `A` as the alpha placeholder, e.g. 'rgba(255,200,120,A)'. */
export function radial(c: Ctx, x: number, y: number, r: number, col: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', String(a)));
  g.addColorStop(1, col.replace('A', '0'));
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

export function speckle(c: Ctx, w: number, h: number, n: number, seed: number, alpha = 0.035) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    c.fillStyle = r() > 0.5 ? `rgba(255,235,200,${alpha})` : `rgba(0,0,0,${alpha * 2})`;
    c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

export function poly(c: Ctx, pts: number[]) {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fill();
}

/** Remove a room's painted textures when leaving it, to keep GPU memory small on Chromebooks. */
export function freeTextures(scene: Phaser.Scene, prefix: string) {
  for (const key of scene.textures.getTextureKeys()) if (key.startsWith(prefix)) scene.textures.remove(key);
}
