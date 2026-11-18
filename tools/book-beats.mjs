// Captures of the book-accuracy additions: rain walk (ch1), bank/overdose (ch3), the bombing (ch5). Usage: node tools/book-beats.mjs <baseURL> <outDir> <which>
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const [base = 'http://localhost:5173', out = 'docs/qa/beats', which = 'rain'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const SETS = {
  rain: ['home1', 200, { 'e.home1': true, 'h1.day': true, 'c03.t1': true, 'c03.t2': true, 'c03.t3': true, 'c03.script': true, 'c01.lit': true, 'c02.asked': true }, 'rain'],
  rainroom: ['rain', 200, { 'c03.script': true, 'c03.t3': true }],
  burn: ['home4', 1330, { 'e.home4': true, 'c09.off': true, 'c09.read': true, 'c09.book': 'restraint' }],
  war: ['camp', 1000, { 'e.camp': true, 'cp.met': true, 'c14.met': true, 'c14.recall': true }],
};
const [room, x, flags] = SETS[which];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${base}/?debug`);
await page.evaluate(([room, x, flags]) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, [room, x, flags]);
await page.reload();
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 60000 });
await page.waitForTimeout(400); await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 60000 });
if (which === 'burn') { await page.evaluate(() => window.__qa.go(1330)); await page.keyboard.press('e'); }
if (which === 'war') { await page.evaluate(() => window.__qa.go(1000)); await page.keyboard.press('e'); }
for (let i = 0; i < 60; i++) {
  const m = await page.evaluate(() => { const q = window.__qa; const mode = q.mode(); if (mode === 'dialogue') { q.options().length ? q.choose(0) : q.adv(); } return mode + ':' + q.scene.room.id; });
  await page.screenshot({ path: `${out}/${which}-${String(i).padStart(2, '0')}.png` });
  await page.waitForTimeout(1100);
}
console.log('errors', errors); await browser.close();
