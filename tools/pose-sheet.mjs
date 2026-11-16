// Contact sheet of the whole cast: idle, two walk frames, every gesture pose and its in-betweens, at game scale.
// Usage: node tools/pose-sheet.mjs <baseURL> <out.png> [zoom]
//   zoom 2 (default 1) redraws the sheet larger so profiles can be judged; `only` = comma list of cast keys, e.g. mildred,beatty;
//   `crop` = x,y,w,h of each frame (e.g. 20,10,70,70 for head close-ups); `pickFrames` = comma list of frame numbers.
import { chromium } from '@playwright/test';

const [base = 'http://localhost:5173', out = 'docs/qa/cast/cast.png', zoom = '1', only = '', crop = '', pickFrames = ''] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${base}/?debug`);
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
const png = await page.evaluate(([z, only, crop, pickFrames]) => {
  const want = only ? only.split(',').map((k) => 'fig:' + k) : null;
  const keys = window.__game.textures.getTextureKeys().filter((k) => k.startsWith('fig:') && k !== 'fig:montagFloat' && (!want || want.includes(k)));
  const frames = (k) => window.__game.textures.get(k).getFrameNames().length;
  const cols = Math.max(...keys.map(frames)) ;
  let fw = 110, fh = 212, label = 100, sx = 0, sy = 0;
  if (crop) { [sx, sy, fw, fh] = crop.split(',').map(Number); }
  // Default: idle, two walk frames and the held poses; in-betweens (16+N..) via pickFrames.
  const picks = keys.map((k) => { const n = frames(k); if (pickFrames) return pickFrames.split(',').map(Number).filter((f) => f < n); const np = Math.max(0, (n - 27) / 3); return [0, 6, 10, ...Array.from({ length: np }, (_, i) => 16 + i)]; });
  const wide = Math.max(...picks.map((p) => p.length));
  const rows = keys.length, perRow = Math.min(wide, 11), bands = Math.ceil(wide / perRow);
  const cv = document.createElement('canvas');
  cv.width = (label + perRow * fw) * z; cv.height = (rows * bands * fh + 10) * z;
  const c = cv.getContext('2d');
  c.scale(z, z);
  c.fillStyle = '#1a1614'; c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = '#cfc6b5'; c.font = '12px sans-serif';
  keys.forEach((k, r) => {
    const tex = window.__game.textures.get(k), src = tex.getSourceImage();
    picks[r].forEach((f, i) => {
      const fr = tex.get(String(f));
      const b = Math.floor(i / perRow), col = i % perRow, y = 10 + (r * bands + b) * fh;
      c.drawImage(src, fr.cutX + sx, fr.cutY + sy, Math.min(fw, fr.width - sx), fh, label + col * fw, y, fw, fh);
      c.fillStyle = 'rgba(207,198,181,0.5)'; c.fillText(String(f), label + col * fw + 2, y + 10);
    });
    c.fillStyle = '#cfc6b5'; c.fillText(k.slice(4), 8, 10 + r * bands * fh + fh / 2);
  });
  void cols;
  return cv.toDataURL('image/png');
}, [Number(zoom), only, crop, pickFrames]);
const { writeFile, mkdir } = await import('node:fs/promises');
await mkdir(out.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
await writeFile(out, Buffer.from(png.split(',')[1], 'base64'));
console.log('wrote', out, errors.length ? 'PAGE ERRORS: ' + errors.join('; ') : '');
await browser.close();
