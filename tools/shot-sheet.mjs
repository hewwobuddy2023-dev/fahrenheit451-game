// Tile shots into labelled contact sheets so a room can be eyeballed quickly.
// Usage: node tools/shot-sheet.mjs <outFile> <cols> <cellWidth> <image...>
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { basename } from 'node:path';
const [outFile, cols, cw, ...files] = process.argv.slice(2);
const imgs = await Promise.all(files.map(loadImage));
const cellW = Number(cw), cellH = Math.round(cellW * imgs[0].height / imgs[0].width), n = Number(cols);
const rows = Math.ceil(imgs.length / n);
const cv = createCanvas(cellW * n, (cellH + 18) * rows), c = cv.getContext('2d');
c.fillStyle = '#222'; c.fillRect(0, 0, cv.width, cv.height); c.font = '13px sans-serif'; c.fillStyle = '#ddd';
imgs.forEach((im, i) => { const x = (i % n) * cellW, y = Math.floor(i / n) * (cellH + 18); c.drawImage(im, x, y + 18, cellW, cellH); c.fillText(basename(files[i], '.jpg'), x + 4, y + 13); });
writeFileSync(outFile, cv.toBuffer('image/jpeg'));
