// Contact sheet of the Chapter 1 cast: idle frame plus every gesture pose, on a dark backdrop at game scale.
// Usage: node tools/pose-sheet.mjs <baseURL> <out.png>
import { chromium } from '@playwright/test';

const [base = 'http://localhost:5173', out = 'docs/qa/ch1-v2/poses.png'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
await page.goto(`${base}/?debug`);
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
const png = await page.evaluate(() => {
  const cast = ['montag', 'beatty', 'fireman', 'clarisse', 'mildred'];
  const names = ['idle', 'reach', 'pointUp', 'hold', 'recoil', 'seated', 'seatedLook'];
  const fw = 90, fh = 212, cv = document.createElement('canvas');
  cv.width = 110 + names.length * fw; cv.height = 30 + cast.length * fh;
  const c = cv.getContext('2d');
  c.fillStyle = '#1a1614'; c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = '#cfc6b5'; c.font = '13px sans-serif';
  names.forEach((n, i) => c.fillText(n, 110 + i * fw + 6, 18));
  cast.forEach((k, r) => {
    const src = window.__game.textures.get('fig:' + k).getSourceImage();
    c.fillText(k, 8, 30 + r * fh + fh / 2);
    names.forEach((_, i) => c.drawImage(src, (i ? 15 + i : 0) * fw, 0, fw, fh, 110 + i * fw, 30 + r * fh, fw, fh));
  });
  return cv.toDataURL('image/png');
});
const { writeFile, mkdir } = await import('node:fs/promises');
await mkdir(out.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
await writeFile(out, Buffer.from(png.split(',')[1], 'base64'));
console.log('wrote', out);
await browser.close();
