// Beatty's death scene on the lawn, captured every ~350 ms. Usage: node tools/beatty-death.mjs <baseURL> <outDir>
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const [base = 'http://localhost:5173', out = 'docs/qa/beatty'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${base}/?debug`);
const flags = { 'e.home5': true, 'c10.beds': true, 'c10.w1': true, 'c10.w2': true, 'c10.w3': true, 'e.lawn': true, 'lw.gone': true };
await page.evaluate((flags) => { localStorage.setItem('f451.save', JSON.stringify({ v: 1, room: 'lawn2', x: 900, flags })); localStorage.setItem('f451.options', JSON.stringify({ muted: true })); }, flags);
await page.reload();
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 60000 });
await page.waitForTimeout(400); await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 60000 });
for (let i = 0; i < 90; i++) {
  const m = await page.evaluate(() => { const q = window.__qa; const mode = q.mode(); if (mode === 'dialogue') { q.options().length ? q.choose(0) : q.adv(); } return mode; });
  await page.screenshot({ path: `${out}/${String(i).padStart(2, '0')}-${m}.png` });
  await page.waitForTimeout(m === 'dialogue' ? 900 : 350);
  if (m === 'play' && i > 10) break;
}
console.log('errors', errors);
await browser.close();
