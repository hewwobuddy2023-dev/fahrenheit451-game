// Shared effect textures: light, smoke, fire, weather, shadows, overlay, TV-wall content.
import Phaser from 'phaser';
import { W, H } from '../view.ts';
import { paint, radial, rng, vgrad } from './core.ts';

export function paintFx(scene: Phaser.Scene) {
  paint(scene, 'glow', 128, 128, (c) => radial(c, 64, 64, 64, 'rgba(255,255,255,A)', 1));
  paint(scene, 'dot', 6, 6, (c) => radial(c, 3, 3, 3, 'rgba(255,255,255,A)', 1));
  paint(scene, 'smoke', 128, 128, (c) => {
    const r = rng(5);
    for (let i = 0; i < 7; i++) radial(c, 40 + r() * 48, 40 + r() * 48, 30 + r() * 20, 'rgba(200,190,180,A)', 0.22);
  });
  paint(scene, 'shadow', 96, 20, (c) => {
    c.save(); c.scale(1, 20 / 96); radial(c, 48, 48, 48, 'rgba(0,0,0,A)', 0.75); c.restore();
  });
  paint(scene, 'cone', 280, 380, (c) => {
    for (let i = 0; i < 14; i++) {
      const k = 1 - i / 14;
      c.fillStyle = vgrad(c, 0, 380, [[0, 'rgba(255,255,255,0.07)'], [1, 'rgba(255,255,255,0)']]);
      c.beginPath();
      c.moveTo(140 - 18 * k, 0); c.lineTo(140 + 18 * k, 0); c.lineTo(140 + 140 * k, 380); c.lineTo(140 - 140 * k, 380);
      c.fill();
    }
  });
  // a horizontal beam (headlights, searchlights)
  paint(scene, 'beam', 256, 128, (c) => {
    const g = c.createRadialGradient(128, 64, 4, 128, 64, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
  });
  // vignette and scanlines in one texture: one full-screen pass instead of two
  paint(scene, 'overlay', W, H, (c) => {
    const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.62)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 2; y < H; y += 3) c.fillRect(0, y, W, 1);
  });
  paint(scene, 'grain', 128, 128, (c) => {
    const r = rng(7);
    const img = c.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
  paint(scene, 'streak', 2, 18, (c) => { c.fillStyle = vgrad(c, 0, 18, [[0, 'rgba(200,215,230,0)'], [1, 'rgba(200,215,230,0.7)']]); c.fillRect(0, 0, 2, 18); });
  paint(scene, 'leaf', 10, 6, (c) => { c.fillStyle = '#8a4a22'; c.beginPath(); c.ellipse(5, 3, 5, 2.5, 0.3, 0, Math.PI * 2); c.fill(); });
  paint(scene, 'book', 22, 8, (c) => { c.fillStyle = '#d9cba8'; c.fillRect(0, 2, 22, 6); c.fillStyle = '#6b2a1a'; c.fillRect(0, 0, 22, 3); });

  // fire: 6 frames of layered flame tongues, painted additively
  const t = paint(scene, 'flame', 64 * 6, 112, (c) => {
    for (let f = 0; f < 6; f++) {
      const r = rng(30 + f);
      c.save(); c.translate(f * 64 + 32, 108);
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const w = 10 + r() * 14, h = 40 + r() * 60, dx = (r() - 0.5) * 26, lean = (r() - 0.5) * 18;
        const g = c.createLinearGradient(0, 0, 0, -h);
        g.addColorStop(0, 'rgba(255,240,190,0.55)'); g.addColorStop(0.35, 'rgba(255,150,50,0.45)');
        g.addColorStop(0.75, 'rgba(200,50,20,0.25)'); g.addColorStop(1, 'rgba(120,20,10,0)');
        c.fillStyle = g;
        c.beginPath(); c.moveTo(dx - w, 0);
        c.quadraticCurveTo(dx - w * 0.6 + lean * 0.3, -h * 0.55, dx + lean, -h);
        c.quadraticCurveTo(dx + w * 0.6 + lean * 0.3, -h * 0.55, dx + w, 0);
        c.fill();
      }
      c.restore();
    }
  });
  for (let i = 0; i < 6; i++) t.add(i, 0, i * 64, 0, 64, 112);
  if (!scene.anims.exists('flame')) scene.anims.create({ key: 'flame', frames: [0, 1, 2, 3, 4, 5].map((i) => ({ key: 'flame', frame: i })), frameRate: 12, repeat: -1 });

  // TV-wall content: abstract "family" figures and colour fields that scroll; tinted per wall
  paint(scene, 'tv', 512, 200, (c) => {
    const r = rng(77);
    c.fillStyle = '#1a2a38'; c.fillRect(0, 0, 512, 200);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = `hsla(${Math.floor(r() * 360)},70%,${45 + r() * 20}%,0.55)`;
      c.fillRect(r() * 512, r() * 200, 30 + r() * 90, 20 + r() * 60);
    }
    for (let i = 0; i < 6; i++) { // smiling heads, all facing out
      const x = 40 + i * 82, y = 120;
      c.fillStyle = 'rgba(240,230,220,0.85)';
      c.beginPath(); c.arc(x, y - 40, 14, 0, Math.PI * 2); c.fill();
      c.fillRect(x - 18, y - 24, 36, 70);
      c.fillStyle = 'rgba(20,20,30,0.8)'; c.fillRect(x - 6, y - 38, 12, 2);
    }
  });
}

/** Fire at a spot: animated flame sprites, glow, embers and smoke. `warm` = the campfire's gentler fire. */
export function fireAt(scene: Phaser.Scene, x: number, y: number, size: number, warm = false, depth = 4) {
  const parts: Phaser.GameObjects.GameObject[] = [];
  const n = Math.max(1, Math.round(size));
  for (let i = 0; i < n; i++) {
    const f = scene.add.sprite(x + (i - (n - 1) / 2) * 34, y, 'flame', i % 6).setOrigin(0.5, 1)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(depth).setScale(warm ? 0.7 : 1 + Math.random() * 0.3);
    f.play({ key: 'flame', startFrame: i % 6 });
    if (warm) f.setTint(0xffc070);
    parts.push(f);
  }
  const glow = scene.add.image(x, y - 30, 'glow').setScale(1.6 + n * 0.5).setTint(warm ? 0xffb050 : 0xff6a2a)
    .setAlpha(warm ? 0.45 : 0.55).setBlendMode(Phaser.BlendModes.ADD).setDepth(depth - 0.5);
  scene.tweens.add({ targets: glow, alpha: (warm ? 0.3 : 0.38), yoyo: true, repeat: -1, duration: 180 + Math.random() * 120 });
  parts.push(glow);
  parts.push(scene.add.particles(x, y - 20, 'dot', {
    x: { min: -20 * n, max: 20 * n }, speedY: { min: -70, max: -30 }, speedX: { min: -15, max: 15 },
    lifespan: 1600, frequency: warm ? 220 : 90, scale: { min: 0.4, max: 0.9 }, alpha: { start: 0.9, end: 0 },
    tint: warm ? 0xffc070 : 0xff7a30, blendMode: Phaser.BlendModes.ADD,
  }).setDepth(depth + 0.5));
  if (!warm) {
    parts.push(scene.add.particles(x, y - 80, 'smoke', {
      x: { min: -20 * n, max: 20 * n }, speedY: { min: -30, max: -15 }, speedX: { min: 0, max: 12 },
      lifespan: 4000, frequency: 450, scale: { start: 0.6, end: 1.6 }, alpha: { start: 0.35, end: 0 }, tint: 0x3a2a24,
    }).setDepth(depth + 0.6));
  }
  return parts;
}
