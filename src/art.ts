// All art is painted once at boot with Canvas 2D, then drawn as plain textures. Nothing here runs per frame.
import Phaser from 'phaser';
import { W, H, FLOOR } from './view.ts';

type Ctx = CanvasRenderingContext2D;

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paint(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
  if (scene.textures.exists(key)) return scene.textures.get(key) as Phaser.Textures.CanvasTexture;
  const t = scene.textures.createCanvas(key, w, h)!;
  draw(t.context);
  t.refresh();
  return t;
}

function vgrad(c: Ctx, y0: number, y1: number, stops: [number, string][]) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

function radial(c: Ctx, x: number, y: number, r: number, col: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', String(a)));
  g.addColorStop(1, col.replace('A', '0'));
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

function speckle(c: Ctx, w: number, h: number, n: number, seed: number, alpha = 0.035) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    c.fillStyle = r() > 0.5 ? `rgba(255,235,200,${alpha})` : `rgba(0,0,0,${alpha * 2})`;
    c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

// ---------- characters ----------

export interface Fig {
  coat: string; rim: string; hat: 'helmet' | 'cap'; phase?: number; walking?: boolean;
  pipe?: boolean; armFwd?: boolean; badge?: string;
}

function figure(c: Ctx, x: number, y: number, o: Fig) {
  const p = o.phase ?? 0;
  const walk = !!o.walking;
  const bob = walk ? -Math.abs(Math.cos(p)) * 2.5 : 0;
  const seg = (a: number[]) => { c.beginPath(); c.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) c.lineTo(a[i], a[i + 1]); c.stroke(); };

  const pass = (col: string, dx: number, dy: number) => {
    c.save();
    c.translate(x + dx, y + dy + bob);
    c.fillStyle = c.strokeStyle = col;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const arm = (q: number, front: boolean) => {
      const a = o.armFwd && front ? 1.15 : walk ? -Math.sin(q) * 0.38 : 0.06;
      const ex = Math.sin(a) * 25, ey = -110 + Math.cos(a) * 25;
      const b = a + (o.armFwd && front ? 0.5 : 0.22);
      c.lineWidth = 9;
      seg([1, -110, ex, ey, ex + Math.sin(b) * 24, ey + Math.cos(b) * 24]);
    };
    arm(p + Math.PI, false);
    for (const q of [p + Math.PI, p]) {
      const th = walk ? Math.sin(q) * 0.42 : q === p ? 0.07 : -0.05;
      const sh = th - (walk ? Math.max(0, Math.cos(q)) * 0.55 : 0);
      const kx = Math.sin(th) * 31, ky = -64 + Math.cos(th) * 31;
      const fx = kx + Math.sin(sh) * 31, fy = ky + Math.cos(sh) * 31;
      c.lineWidth = 11;
      seg([0, -64, kx, ky, fx, fy]);
      c.beginPath(); c.roundRect(fx - 7, fy - 6, 19, 8, 3); c.fill();
    }
    // long fireman's coat with a slight flare and raised collar
    c.beginPath();
    c.moveTo(-12, -122); c.lineTo(10, -124); c.lineTo(15, -112); c.lineTo(19, -36);
    c.lineTo(-2, -32); c.lineTo(-19, -35); c.lineTo(-15, -112); c.closePath(); c.fill();
    arm(p, true);
    c.beginPath(); c.arc(3, -131, 10, 0, Math.PI * 2); c.fill();
    if (o.hat === 'helmet') {
      c.beginPath(); c.ellipse(-1, -133, 23, 4.5, -0.1, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(3, -136, 12, Math.PI, 0); c.fill();
      c.fillRect(8, -152, 7, 14); // front shield
    } else {
      c.fillRect(-8, -147, 22, 11);
      c.beginPath(); c.moveTo(12, -138); c.lineTo(24, -136); c.lineTo(12, -134); c.fill();
    }
    if (o.pipe) { c.lineWidth = 2; seg([12, -127, 21, -124]); c.fillRect(19, -129, 5, 6); }
    c.restore();
  };
  pass(o.rim, 2, -1);
  pass(o.coat, 0, 0);
  // details over the base silhouette
  c.save();
  c.translate(x, y + bob);
  c.fillStyle = 'rgba(214,150,70,0.55)';
  c.fillRect(-17, -48, 35, 3); // reflective coat stripe
  if (o.badge) { c.fillStyle = o.badge; c.fillRect(9, -150, 5, 9); }
  if (o.pipe) { c.fillStyle = '#ff8a3a'; c.fillRect(20, -129, 3, 2); }
  c.restore();
}

export const FIG_W = 70;
export const FIG_H = 162;

function sheet(scene: Phaser.Scene, key: string, frames: Fig[]) {
  const t = paint(scene, key, FIG_W * frames.length, FIG_H, (c) => {
    frames.forEach((f, i) => figure(c, i * FIG_W + 33, FIG_H - 4, f));
  });
  frames.forEach((_, i) => t.add(i, 0, i * FIG_W, 0, FIG_W, FIG_H));
}

// ---------- shared FX textures ----------

function fx(scene: Phaser.Scene) {
  paint(scene, 'glow', 128, 128, (c) => radial(c, 64, 64, 64, 'rgba(255,255,255,A)', 1));
  paint(scene, 'dot', 6, 6, (c) => radial(c, 3, 3, 3, 'rgba(255,255,255,A)', 1));
  paint(scene, 'cone', 280, 380, (c) => {
    for (let i = 0; i < 14; i++) {
      const k = 1 - i / 14;
      c.fillStyle = vgrad(c, 0, 380, [[0, 'rgba(255,255,255,0.07)'], [1, 'rgba(255,255,255,0)']]);
      c.beginPath();
      c.moveTo(140 - 18 * k, 0); c.lineTo(140 + 18 * k, 0); c.lineTo(140 + 140 * k, 380); c.lineTo(140 - 140 * k, 380);
      c.fill();
    }
  });
  paint(scene, 'vignette', W, H, (c) => {
    const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.32, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.62)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  });
  paint(scene, 'scan', 4, 3, (c) => { c.fillStyle = '#000'; c.fillRect(0, 2, 4, 1); });
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
}

// ---------- city skyline (menu and station windows) ----------

function skyline(scene: Phaser.Scene) {
  paint(scene, 'sky', 1500, H, (c) => {
    c.fillStyle = vgrad(c, 0, H, [[0, '#060609'], [0.45, '#140c0e'], [0.78, '#3e1a10'], [0.86, '#1c0d09'], [1, '#080505']]);
    c.fillRect(0, 0, 1500, H);
    radial(c, 330, 110, 70, 'rgba(236,225,200,A)', 0.16); // smog-veiled moon
    radial(c, 330, 110, 18, 'rgba(236,225,200,A)', 0.35);
    [[420, 0.45], [980, 0.35], [1320, 0.3]].forEach(([x, a]) => radial(c, x, 450, 260, 'rgba(232,104,46,A)', a));
    const r = rng(451);
    const towers = (col: string, minH: number, maxH: number, lit: number, base: number) => {
      for (let x = -20; x < 1500; ) {
        const w = 26 + r() * 70, h = minH + r() * (maxH - minH);
        c.fillStyle = col;
        c.fillRect(x, base - h, w, h + 100);
        if (r() > 0.6) c.fillRect(x + w / 2 - 1, base - h - 30 - r() * 30, 2, 40); // antenna
        if (r() > 0.75) { c.fillRect(x + 6, base - h - 10, w - 12, 10); }
        for (let wy = base - h + 10; wy < base - 8; wy += 11) {
          for (let wx = x + 5; wx < x + w - 6; wx += 9) {
            const v = r();
            if (v < lit) { c.fillStyle = 'rgba(242,165,74,0.55)'; c.fillRect(wx, wy, 3, 4); }
            else if (v < lit + 0.015) { c.fillStyle = 'rgba(120,170,190,0.6)'; c.fillRect(wx, wy, 3, 4); } // parlor-wall glow
          }
        }
        x += w + r() * 10;
      }
    };
    towers('#1b1213', 110, 240, 0.0, 440);
    towers('#0e0a0a', 60, 190, 0.05, 452);
    c.fillStyle = '#070404';
    c.fillRect(0, 452, 1500, 100);
  });
}

// ---------- fire station ----------

export const LAMPS = [470, 1110, 1520, 2010];
export const WINDOWS = [160, 760, 1300, 1900];
export const STATION_W = 2400;

function stationWall(scene: Phaser.Scene) {
  const RW = STATION_W;
  paint(scene, 'wall', RW, H, (c) => {
    // wall body
    c.fillStyle = vgrad(c, 0, FLOOR, [[0, '#211a17'], [1, '#141010']]);
    c.fillRect(0, 0, RW, FLOOR);
    for (let x = 0; x < RW; x += 200) { // riveted steel panels
      c.fillStyle = '#0d0a09'; c.fillRect(x, 56, 3, 270);
      c.fillStyle = 'rgba(120,96,80,0.35)';
      for (let y = 70; y < 320; y += 24) c.fillRect(x + 7, y, 2, 2);
    }
    // lower wainscot of glazed tile
    c.fillStyle = '#1a1412'; c.fillRect(0, 326, RW, FLOOR - 326);
    c.fillStyle = '#2b221e'; c.fillRect(0, 322, RW, 8);
    c.fillStyle = 'rgba(0,0,0,0.35)';
    for (let y = 352; y < FLOOR; y += 24) c.fillRect(0, y, RW, 1);
    for (let y = 330, row = 0; y < FLOOR; y += 24, row++) for (let x = (row % 2) * 24; x < RW; x += 48) c.fillRect(x, y, 1, 24);

    // painted bureau emblem
    c.save();
    c.globalAlpha = 0.5;
    c.strokeStyle = '#7d2513'; c.lineWidth = 6;
    c.beginPath(); c.arc(1030, 196, 92, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.arc(1030, 196, 80, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#8a2a14';
    c.font = '700 96px Oswald'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('451', 1030, 192);
    c.font = '500 13px Oswald';
    c.fillText('B U R E A U   O F   F I R E', 1030, 258);
    c.restore();
    const wr = rng(3); // worn paint: wall-coloured chips over the emblem
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(30,24,21,${wr() * 0.7})`; c.fillRect(930 + wr() * 200, 100 + wr() * 190, 1 + wr() * 3, 1 + wr() * 2); }

    // bay door at the far right
    c.fillStyle = '#1d1714'; c.fillRect(2120, 70, 280, FLOOR - 70);
    c.fillStyle = 'rgba(0,0,0,0.45)';
    for (let y = 80; y < FLOOR; y += 14) c.fillRect(2120, y, 280, 2);
    c.fillStyle = '#0c0908'; c.fillRect(2110, 62, 10, FLOOR - 62); c.fillRect(2110, 62, 290, 10);

    // tall arched windows cut through to the parallax city
    c.globalCompositeOperation = 'destination-out';
    for (const x of WINDOWS) { c.beginPath(); c.moveTo(x - 58, 300); c.lineTo(x - 58, 140); c.arc(x, 140, 58, Math.PI, 0); c.lineTo(x + 58, 300); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    for (const x of WINDOWS) {
      c.strokeStyle = '#0b0807'; c.lineWidth = 10;
      c.beginPath(); c.moveTo(x - 58, 300); c.lineTo(x - 58, 140); c.arc(x, 140, 58, Math.PI, 0); c.lineTo(x + 58, 300); c.closePath(); c.stroke();
      c.lineWidth = 4;
      c.beginPath(); c.moveTo(x, 82); c.lineTo(x, 300); c.stroke();
      for (const y of [150, 200, 250]) { c.beginPath(); c.moveTo(x - 58, y); c.lineTo(x + 58, y); c.stroke(); }
      c.fillStyle = '#2c231e'; c.fillRect(x - 68, 300, 136, 8); // sill
      c.fillStyle = 'rgba(160,190,200,0.12)'; c.fillRect(x - 66, 300, 132, 2);
    }

    // ceiling, trusses and pipes
    c.fillStyle = '#0c0908'; c.fillRect(0, 0, RW, 56);
    c.strokeStyle = '#1b1512'; c.lineWidth = 3;
    for (let x = 0; x < RW; x += 60) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 30, 50); c.lineTo(x + 60, 4); c.stroke(); }
    c.fillStyle = '#16110f'; c.fillRect(0, 48, RW, 8);
    for (const [y, h] of [[60, 8], [72, 5]]) {
      c.fillStyle = '#2a201b'; c.fillRect(0, y, RW, h);
      c.fillStyle = 'rgba(242,165,74,0.18)'; c.fillRect(0, y, RW, 1);
    }
    c.fillStyle = '#100c0b';
    for (let x = 90; x < RW; x += 300) c.fillRect(x, 56, 6, 24);
    // the pole's hole in the ceiling, lit from the bunks above
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(300, 52, 30, 7, 0, 0, Math.PI * 2); c.fill();
    radial(c, 300, 40, 50, 'rgba(242,165,74,A)', 0.25);

    // hanging lamps
    for (const x of LAMPS) {
      c.fillStyle = '#0a0807'; c.fillRect(x - 1, 56, 2, 56);
      c.beginPath(); c.moveTo(x - 6, 110); c.lineTo(x + 6, 110); c.lineTo(x + 22, 128); c.lineTo(x - 22, 128); c.fill();
      c.fillStyle = '#ffd08a'; c.fillRect(x - 10, 127, 20, 3);
      radial(c, x, 128, 26, 'rgba(255,200,120,A)', 0.5);
    }

    // floor: polished concrete with expansion joints and lamp reflections
    c.fillStyle = vgrad(c, FLOOR, H, [[0, '#2b221d'], [0.25, '#1a1412'], [1, '#090706']]);
    c.fillRect(0, FLOOR, RW, H - FLOOR);
    c.fillStyle = 'rgba(242,165,74,0.32)'; c.fillRect(0, FLOOR, RW, 1);
    c.fillStyle = 'rgba(0,0,0,0.5)';
    for (let x = 120; x < RW; x += 240) { c.beginPath(); c.moveTo(x, FLOOR); c.lineTo(x - 40, H); c.lineTo(x - 38, H); c.lineTo(x + 2, FLOOR); c.fill(); }
    for (const x of LAMPS) {
      const g = c.createLinearGradient(0, FLOOR, 0, H);
      g.addColorStop(0, 'rgba(242,165,74,0.16)'); g.addColorStop(1, 'rgba(242,165,74,0)');
      c.fillStyle = g; c.fillRect(x - 60, FLOOR, 120, H - FLOOR);
    }
    // hazard stripes in the bay
    c.save(); c.beginPath(); c.rect(2110, FLOOR + 2, 290, 10); c.clip();
    for (let x = 2090; x < RW; x += 22) { c.fillStyle = 'rgba(232,104,46,0.45)'; c.beginPath(); c.moveTo(x, FLOOR + 12); c.lineTo(x + 11, FLOOR + 2); c.lineTo(x + 20, FLOOR + 2); c.lineTo(x + 9, FLOOR + 12); c.fill(); }
    c.restore();
    speckle(c, RW, H, 26000, 11);
  });
}

function stationProps(scene: Phaser.Scene) {
  paint(scene, 'pole', 24, 420, (c) => {
    const g = c.createLinearGradient(6, 0, 18, 0);
    g.addColorStop(0, '#4a3016'); g.addColorStop(0.45, '#e6b866'); g.addColorStop(0.6, '#fff0c8'); g.addColorStop(1, '#5a3a18');
    c.fillStyle = g; c.fillRect(6, 0, 12, 412);
    c.fillStyle = '#2a1e14'; c.beginPath(); c.ellipse(12, 414, 12, 4, 0, 0, Math.PI * 2); c.fill();
  });

  paint(scene, 'rack', 170, 230, (c) => {
    c.fillStyle = '#24190f'; c.fillRect(8, 10, 154, 220);
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = 8; x < 162; x += 22) c.fillRect(x, 10, 1, 220);
    c.fillStyle = '#3a2a1c'; c.fillRect(0, 42, 170, 7); c.fillRect(0, 8, 170, 5);
    c.fillStyle = 'rgba(242,165,74,0.25)'; c.fillRect(0, 42, 170, 1);
    for (const x of [48, 120]) {
      // helmet on the shelf
      c.fillStyle = '#1c1614';
      c.beginPath(); c.ellipse(x, 40, 26, 5, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + 2, 38, 13, Math.PI, 0); c.fill();
      c.fillStyle = '#8a5a22'; c.fillRect(x + 8, 18, 9, 13);
      c.fillStyle = '#e8c27a'; c.font = '700 6px Oswald'; c.fillText('451', x + 8.5, 27);
      // coat on its hook
      c.fillStyle = '#5a4430'; c.fillRect(x - 2, 56, 5, 8);
      c.fillStyle = '#171211';
      c.beginPath(); c.moveTo(x - 18, 64); c.lineTo(x + 18, 64); c.lineTo(x + 26, 178); c.lineTo(x - 26, 178); c.fill();
      c.fillStyle = 'rgba(214,150,70,0.6)'; c.fillRect(x - 25, 158, 50, 4); c.fillRect(x - 21, 100, 42, 3);
      c.fillStyle = 'rgba(242,165,74,0.18)'; c.fillRect(x + 17, 66, 2, 110);
    }
    // hose coil with a bright brass nozzle
    c.strokeStyle = '#3b2a1e'; c.lineWidth = 7;
    for (const r of [24, 16]) { c.beginPath(); c.arc(84, 204, r, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = 'rgba(242,165,74,0.25)'; c.lineWidth = 1; c.beginPath(); c.arc(84, 204, 27, -1.2, 0.2); c.stroke();
    const g = c.createLinearGradient(100, 0, 140, 0); g.addColorStop(0, '#7a5220'); g.addColorStop(0.5, '#ffe2a0'); g.addColorStop(1, '#8a5a22');
    c.fillStyle = g; c.beginPath(); c.moveTo(104, 196); c.lineTo(142, 190); c.lineTo(142, 198); c.lineTo(104, 206); c.fill();
  });

  paint(scene, 'plaque', 110, 84, (c) => {
    c.fillStyle = '#3c2a18'; c.fillRect(0, 0, 110, 84);
    c.fillStyle = '#6b4c28'; c.fillRect(3, 3, 104, 78);
    c.fillStyle = '#cfc0a0'; c.fillRect(9, 9, 92, 66);
    c.fillStyle = '#7d2513'; c.fillRect(18, 16, 74, 5);
    c.fillStyle = 'rgba(40,30,20,0.55)';
    for (let y = 28; y < 64; y += 6) c.fillRect(16, y, 60 + ((y * 7) % 17), 2);
    c.strokeStyle = '#7d2513'; c.lineWidth = 2; c.beginPath(); c.arc(86, 60, 7, 0, Math.PI * 2); c.stroke();
  });

  paint(scene, 'table', 200, 96, (c) => {
    c.fillStyle = '#1a1310'; c.fillRect(30, 30, 6, 66); c.fillRect(164, 30, 6, 66);
    c.fillStyle = '#3a2a20'; c.fillRect(14, 22, 172, 10);
    c.fillStyle = 'rgba(242,165,74,0.35)'; c.fillRect(14, 22, 172, 1);
    const r = rng(9);
    for (let i = 0; i < 7; i++) { c.save(); c.translate(50 + r() * 100, 20); c.rotate((r() - 0.5) * 0.6); c.fillStyle = '#e4d6b6'; c.fillRect(-5, -2, 10, 3); c.restore(); }
  });

  paint(scene, 'pump', 250, 210, (c) => {
    c.fillStyle = '#16110f'; c.fillRect(0, 194, 250, 16);
    c.strokeStyle = '#5a4026'; c.lineWidth = 7;
    c.beginPath(); c.moveTo(20, 50); c.lineTo(230, 50); c.stroke();
    for (const x of [45, 125, 205]) {
      const g = c.createLinearGradient(x - 31, 0, x + 31, 0);
      g.addColorStop(0, '#3d0c08'); g.addColorStop(0.35, '#a52c1c'); g.addColorStop(0.55, '#c8422a'); g.addColorStop(1, '#4a0f0a');
      c.fillStyle = g;
      c.beginPath(); c.roundRect(x - 31, 26, 62, 170, [26, 26, 4, 4]); c.fill();
      c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(x - 8, 34, 4, 156);
      c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x - 31, 70, 62, 4); c.fillRect(x - 31, 166, 62, 4);
      c.fillStyle = '#d9cba8'; c.beginPath(); c.arc(x, 48, 9, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#1a1410'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 48); c.lineTo(x + 6, 43); c.stroke();
    }
    c.fillStyle = 'rgba(236,225,200,0.75)'; c.font = '600 11px Oswald'; c.textAlign = 'center';
    c.fillText('K E R O S E N E', 125, 124);
  });

  paint(scene, 'kennel', 230, 160, (c) => {
    c.fillStyle = '#2c231f'; c.beginPath(); c.moveTo(0, 160); c.lineTo(0, 50); c.arc(115, 50, 115, Math.PI, 0); c.lineTo(230, 160); c.fill();
    c.fillStyle = vgrad(c, 0, 160, [[0, '#020303'], [1, '#0a1112']]);
    c.beginPath(); c.moveTo(12, 160); c.lineTo(12, 56); c.arc(115, 56, 103, Math.PI, 0); c.lineTo(218, 160); c.fill();
    c.fillStyle = 'rgba(127,214,200,0.08)'; c.fillRect(12, 150, 206, 10);
    c.fillStyle = '#3a2f29'; for (let x = 70; x <= 160; x += 18) c.fillRect(x, 4, 8, 3);
  });

  paint(scene, 'hound', 180, 80, (c) => {
    const draw = (col: string, dx: number, dy: number) => {
      c.save(); c.translate(dx, dy); c.fillStyle = c.strokeStyle = col; c.lineCap = 'round';
      c.lineWidth = 3;
      for (const x of [66, 86, 110, 132]) { c.beginPath(); c.moveTo(x, 46); c.lineTo(x - 12, 56); c.lineTo(x - 16, 74); c.stroke(); c.beginPath(); c.moveTo(x + 4, 46); c.lineTo(x + 14, 58); c.lineTo(x + 10, 74); c.stroke(); }
      c.beginPath(); c.moveTo(56, 34); c.lineTo(90, 24); c.lineTo(150, 28); c.lineTo(168, 40); c.lineTo(140, 50); c.lineTo(62, 50); c.fill();
      c.beginPath(); c.moveTo(60, 30); c.lineTo(30, 38); c.lineTo(60, 48); c.fill();
      c.lineWidth = 1.5; c.beginPath(); c.moveTo(32, 39); c.lineTo(6, 43); c.stroke(); // the needle
      c.restore();
    };
    draw('rgba(127,214,200,0.45)', 1, -1);
    draw('#262c2d', 0, 0);
    c.fillStyle = 'rgba(160,200,200,0.12)'; for (let x = 70; x < 150; x += 10) c.fillRect(x, 30, 1, 18);
  });

  paint(scene, 'dispatch', 190, 230, (c) => {
    c.fillStyle = '#120e0c'; c.fillRect(20, 0, 150, 72);
    c.strokeStyle = '#2c231f'; c.lineWidth = 4; c.strokeRect(20, 0, 150, 72);
    c.fillStyle = '#d9cba8'; c.fillRect(32, 8, 66, 12);
    c.fillStyle = '#120e0c'; c.font = '600 9px Oswald'; c.fillText('D I S P A T C H', 36, 18);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) {
      c.fillStyle = (r * 7 + i) % 5 === 0 ? 'rgba(242,165,74,0.8)' : 'rgba(242,165,74,0.18)';
      c.beginPath(); c.arc(38 + i * 12, 34 + r * 12, 3, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#2a1f1b'; c.beginPath(); c.arc(150, 26, 12, 0, Math.PI * 2); c.fill(); // red bulb housing
    c.fillStyle = '#5a1510'; c.beginPath(); c.arc(150, 26, 8, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#3a2f29'; c.lineWidth = 1; for (let y = 50; y < 66; y += 3) { c.beginPath(); c.moveTo(130, y); c.lineTo(162, y); c.stroke(); }
    // desk and teletype
    c.fillStyle = '#2e231c'; c.fillRect(0, 142, 190, 10);
    c.fillStyle = 'rgba(242,165,74,0.3)'; c.fillRect(0, 142, 190, 1);
    c.fillStyle = '#19130f'; c.fillRect(10, 152, 170, 78);
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(20, 168, 70, 2); c.fillRect(100, 168, 70, 2);
    c.fillStyle = '#2c2420'; c.beginPath(); c.roundRect(46, 100, 104, 42, [10, 10, 2, 2]); c.fill();
    c.fillStyle = '#3d332d'; c.fillRect(56, 128, 84, 8);
    c.fillStyle = '#d9cba8'; c.beginPath(); c.roundRect(64, 88, 66, 16, 7); c.fill();
    c.fillRect(88, 136, 16, 34);
    c.fillStyle = 'rgba(40,30,20,0.55)'; for (let y = 142; y < 168; y += 5) c.fillRect(90, y, 8 + (y % 4), 1);
  });

  paint(scene, 'truck', 330, 250, (c) => {
    // ladder on the roof
    c.fillStyle = '#5a5048'; c.fillRect(10, 30, 320, 4); c.fillRect(10, 46, 320, 4);
    for (let x = 18; x < 330; x += 18) c.fillRect(x, 30, 3, 20);
    // body
    const g = vgrad(c, 56, 216, [[0, '#7a2116'], [0.5, '#5a160e'], [1, '#2a0a07']]);
    c.fillStyle = g; c.beginPath(); c.roundRect(0, 56, 330, 160, [14, 0, 0, 6]); c.fill();
    c.fillStyle = 'rgba(255,220,170,0.22)'; c.fillRect(0, 60, 330, 2);
    c.fillStyle = 'rgba(0,0,0,0.35)'; for (const x of [70, 150, 230]) c.fillRect(x, 70, 2, 110);
    c.fillStyle = '#b8a57e'; c.fillRect(0, 150, 330, 5); // chrome rail
    c.fillStyle = '#e4c37e'; c.font = '700 44px Oswald'; c.textAlign = 'center'; c.fillText('451', 190, 132);
    c.fillStyle = '#f2a54a'; c.beginPath(); c.arc(10, 100, 6, 0, Math.PI * 2); c.fill();
    for (const x of [70, 260]) {
      c.fillStyle = '#060404'; c.beginPath(); c.arc(x, 214, 36, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#3a302a'; c.beginPath(); c.arc(x, 214, 14, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(242,165,74,0.25)'; c.beginPath(); c.arc(x, 214, 36, -2.2, -1.4); c.lineTo(x, 214); c.fill();
    }
  });
}

/** Paint every texture the game uses. Called once from the boot scene. */
export function paintAll(scene: Phaser.Scene) {
  fx(scene);
  skyline(scene);
  stationWall(scene);
  stationProps(scene);
  const montag = { coat: '#1a1615', rim: 'rgba(242,165,74,0.85)', hat: 'helmet' as const, badge: '#c98a3a' };
  sheet(scene, 'montag', [montag, ...Array.from({ length: 8 }, (_, i) => ({ ...montag, walking: true, phase: (i / 8) * Math.PI * 2 }))]);
  sheet(scene, 'beatty', [{ coat: '#151212', rim: 'rgba(232,104,46,0.8)', hat: 'cap', pipe: true }]);
  sheet(scene, 'fireman', [{ coat: '#171313', rim: 'rgba(242,165,74,0.55)', hat: 'helmet', armFwd: true }]);
}
