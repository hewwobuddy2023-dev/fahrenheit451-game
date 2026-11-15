// Flag thin full-height vertical lines in captures (a column that differs from both neighbours on most rows).
// Usage: node tools/seam-scan.mjs <dir...>
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

for (const dir of process.argv.slice(2)) {
  let total = 0;
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.jpg'))) {
    const im = await loadImage(join(dir, f)), c = createCanvas(im.width, im.height).getContext('2d');
    c.drawImage(im, 0, 0);
    const { data } = c.getImageData(0, 0, im.width, im.height), W = im.width;
    const y0 = Math.round(im.height * 0.2), y1 = Math.round(im.height * 0.72), hits = [];
    const L = (x, y) => { const i = (y * W + x) * 4; return data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11; };
    for (let x = 4; x < W - 4; x++) {
      let n = 0, sign = 0;
      for (let y = y0; y < y1; y++) { const d = L(x, y) - (L(x - 2, y) + L(x + 2, y)) / 2; if (Math.abs(d) > 5 && Math.abs(L(x - 2, y) - L(x + 2, y)) < 6) { n++; sign += Math.sign(d); } }
      if (n > (y1 - y0) * 0.6 && Math.abs(sign) > n * 0.8) hits.push(x);
    }
    if (hits.length) { total += hits.length; console.log(`${dir}/${f}: ${hits.length} columns (${hits.slice(0, 6).join(',')})`); }
  }
  console.log(`${dir}: ${total} suspicious columns`);
}
