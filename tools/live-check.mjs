// Checks the LIVE published site (not localhost) in real Chromium.
// Usage: node tools/live-check.mjs <url> <expectedSha> [outDir]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [url = 'https://hewwobuddy2023-dev.github.io/fahrenheit451-game/', sha = '', out = 'docs/qa/live'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } }); // fresh profile: no cache, no save
const page = await ctx.newPage();
const errors = [], failed = [], results = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
page.on('requestfailed', (r) => failed.push(`FAILED ${r.url()} ${r.failure()?.errorText}`));
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`, detail); };
const bust = `cb=${Date.now()}`;
const canvasTap = async (x, y) => { const r = await page.locator('canvas').boundingBox(); await page.mouse.click(r.x + x / 960 * r.width, r.y + y / 540 * r.height); };
const mode = () => page.evaluate(() => window.__qa?.mode());
const settle = async () => { for (let i = 0; i < 120 && (await mode()) !== 'play'; i++) { await page.keyboard.press('e'); await page.waitForTimeout(250); } };

// 1. Load, build identity, assets
const t0 = Date.now();
const resp = await page.goto(`${url}?debug&diagnostics&${bust}`);
check('page responds over HTTPS', resp.ok() && url.startsWith('https://'), `${resp.status()}`);
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 });
check('title screen reached', true, `${Date.now() - t0} ms from navigation`);
const diag = await page.locator('#diagnostics').innerText().catch(() => '');
const buildLine = diag.split('\n').find((l) => l.startsWith('BUILD')) ?? '';
check('live build is the release commit', !!sha && buildLine.includes(sha), buildLine);
const assets = await page.evaluate(() => performance.getEntriesByType('resource').map((e) => [e.name.split('/').pop(), e.transferSize]));
check('JS, CSS, fonts and backdrop loaded', ['.js', '.css', '.woff2', '.webp'].every((ext) => assets.some(([n]) => n.includes(ext))), `${assets.length} resources, ${Math.round(assets.reduce((n, [, s]) => n + s, 0) / 1024)} KB transferred`);
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/1-title.jpg`, quality: 80 });

// 2. New Game with real input, keyboard movement and interaction
await canvasTap(430, 346);
await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
await settle();
const r0 = await page.evaluate(() => ({ room: window.__qa.scene.room.id, x: window.__qa.scene.player.x }));
check('New Game starts in the burn', r0.room === 'burn', JSON.stringify(r0));
await page.keyboard.down('d'); await page.waitForTimeout(900); await page.keyboard.up('d');
const x1 = await page.evaluate(() => window.__qa.scene.player.x);
check('keyboard movement (D)', x1 > r0.x + 60, `${Math.round(r0.x)} -> ${Math.round(x1)}`);
const touchUi = await page.evaluate(() => !!window.__qa.scene.hud.touchUi?.visible);
check('desktop shows no touch buttons', !touchUi);
await page.evaluate(() => window.__qa.go(900)); await page.waitForTimeout(300);
await page.keyboard.down('e'); await page.waitForTimeout(3500); await page.keyboard.up('e');
const p1 = await page.evaluate(() => window.__qa.scene.session.flags['c01.p1']);
check('hold E soaks the first book pile', p1 === true);
await page.screenshot({ path: `${out}/2-burn.jpg`, quality: 80 });

// 3. Continue after a reload restores the checkpoint
const saved = await page.evaluate(() => localStorage.getItem('f451.save'));
await page.reload(); await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 }); await page.waitForTimeout(600);
await canvasTap(430, 282);
await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });
const cont = await page.evaluate(() => ({ room: window.__qa.scene.room.id, p1: window.__qa.scene.session.flags['c01.p1'] }));
check('Continue restores the saved checkpoint', !!saved && cont.room === 'burn' && cont.p1 === true, JSON.stringify(cont));

// 4. Every chapter opens on the live build (save-seeded Continue, as a returning student would)
const starts = [['burn', 640, 1], ['station2', 2200, 2], ['home3', 900, 3], ['lawn', 640, 4], ['river', 200, 5]];
for (const [room, x, ch] of starts) {
  await page.evaluate(([room, x]) => localStorage.setItem('f451.save', JSON.stringify({ v: 1, room, x, flags: {} })), [room, x]);
  await page.reload(); await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 }); await page.waitForTimeout(600);
  await canvasTap(430, 282);
  await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 }); await page.waitForTimeout(800);
  const got = await page.evaluate(() => ({ room: window.__qa.scene.room.id, ch: window.__qa.scene.room.chapter }));
  check(`chapter ${ch} loads (${room})`, got.room === room && got.ch === ch);
  await page.screenshot({ path: `${out}/3-chapter${ch}.jpg`, quality: 80 });
}

// 5. A real chapter transition: finish chapter 1 at the front door and walk into chapter 2
const ch1Done = { 'e.home1': true, 'h1.day': true, 'c01.p1': true, 'c01.p2': true, 'c01.p3': true, 'c01.lit': true, 'c02.n1': 'look', 'c02.n2': 'look', 'c02.n3': 'look', 'c02.asked': true, 'c03.w1': true, 'c03.w2': true, 'c03.w3': true, 'c03.t3': true, 'c03.script': true };
await page.evaluate((flags) => localStorage.setItem('f451.save', JSON.stringify({ v: 1, room: 'home1', x: 200, flags })), ch1Done);
await page.reload(); await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 30000 }); await page.waitForTimeout(600);
await canvasTap(430, 282);
await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 }); await settle();
await page.evaluate(() => window.__qa.go(140)); await page.waitForTimeout(300);
await page.keyboard.press('e');
for (let i = 0; i < 60; i++) {
  const s = await page.evaluate(() => ({ room: window.__qa?.scene?.room?.id, mode: window.__qa?.mode() }));
  if (s.room === 'station2') break;
  if (s.mode !== 'play' && s.mode !== 'exit') await page.keyboard.press('e');
  await page.waitForTimeout(300);
}
const after = await page.evaluate(() => ({ room: window.__qa.scene.room.id, ch: window.__qa.scene.room.chapter }));
check('chapter 1 -> chapter 2 transition (chapter card, then the firehouse)', after.room === 'station2' && after.ch === 2, JSON.stringify(after));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/4-chapter2-arrival.jpg`, quality: 80 });

check('no console or page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
check('no failed requests', failed.length === 0, failed.slice(0, 5).join(' | '));
console.log(`\n${results.filter(Boolean).length}/${results.length} live checks passed`);
await browser.close();
process.exit(results.every(Boolean) ? 0 : 1);
