// Keyboard-only Chapter 1 playthrough from New Game, the way a student plays it (no teleports, no QA hooks
// driving progress). Records a video and logs objectives, prompts, timings and stalls.
// Usage: node tools/ch1-playthrough.mjs [baseURL] [outDir]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/ch1-playthrough'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: out, size: { width: 1280, height: 720 } } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
// read-only observation of what the player would see
const see = () => page.evaluate(() => { const s = window.__qa?.scene; return s ? { room: s.room.id, mode: window.__qa.mode(), x: Math.round(s.player.x), objective: s.hud.objective.text, prompt: s.prompt.visible ? s.promptText.text : '', line: s.dialogue?.open ? s.dialogue.body.text : '', options: window.__qa.options() } : {}; });

await page.goto(`${base}/?debug`);
await page.evaluate(() => { localStorage.clear(); });
await page.reload();
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 20000 });
await page.waitForTimeout(1200);
await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowUp'); // find New Game the way a player does
await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__game.scene.isActive('room'), null, { timeout: 20000 });

const seen = new Set();
let last = '', lastChange = Date.now(), dialogueMs = 0, walkMs = 0, choices = 0;
// The player's policy: read the objective; if a prompt is up, use it (hold for HOLD prompts); if dialogue is up,
// read it (about 3 s per line, longer for long lines) then press E; pick the first choice; otherwise walk
// toward wherever the objective suggests (right unless the objective names the door / Beatty).
for (let step = 0; step < 900; step++) {
  const v = await see();
  if (!v.room) { await page.waitForTimeout(200); continue; }
  const key = `${v.room}|${v.mode}|${v.objective}|${v.prompt}|${v.line}`;
  if (key !== last) { last = key; lastChange = Date.now(); }
  if (v.room === 'station2') { log('REACHED CHAPTER 2'); break; }
  if (Date.now() - lastChange > 20000) { log('STALL', JSON.stringify(v)); break; }
  const tag = `${v.room}:${v.objective}`;
  if (!seen.has(tag)) { seen.add(tag); log('OBJECTIVE', v.room, '→', JSON.stringify(v.objective)); await page.screenshot({ path: `${out}/${String(seen.size).padStart(2, '0')}-${v.room}.jpg`, quality: 70 }); }
  if (v.mode === 'dialogue') {
    if (v.options.length) { choices++; log('CHOICE', JSON.stringify(v.options)); await page.waitForTimeout(2500); await page.keyboard.press('e'); }
    else { const ms = Math.min(4500, 1200 + v.line.length * 35); dialogueMs += ms; await page.waitForTimeout(ms); const full = (await see()).line; if (full && !seen.has('l:' + full)) { seen.add('l:' + full); log('  LINE', JSON.stringify(full.slice(0, 90))); } await page.keyboard.press('e'); }
    continue;
  }
  if (v.mode !== 'play') { await page.waitForTimeout(250); continue; }
  if (v.prompt) {
    if (!seen.has('p:' + v.room + v.prompt)) { seen.add('p:' + v.room + v.prompt); log('PROMPT', JSON.stringify(v.prompt)); }
    if (/^HOLD/.test(v.prompt)) { await page.keyboard.down('e'); await page.waitForTimeout(3000); await page.keyboard.up('e'); }
    else if (/Look|Watch|Listen|Turn|Talk|Take|Light|Read|Leave|Go|Hang/i.test(v.prompt) && !seen.has('used:' + v.room + v.prompt + v.objective)) {
      seen.add('used:' + v.room + v.prompt + v.objective); // a player does not repeat an action that changed nothing
      await page.keyboard.press('e'); await page.waitForTimeout(500);
    }
    const after = await see();
    if (after.mode !== 'play' || after.objective !== v.objective) continue; // the prompt did something; look again before walking
  }
  // a student walks toward what the objective names and what they can see on screen (Mildred on the sofa, the door)
  const left = /Beatty|door|Leave for work/i.test(v.objective) || /Take the igniter/.test(v.objective) || (/Mildred|script/i.test(v.objective) && v.x > 1880);
  const dir = left ? 'a' : 'd';
  await page.keyboard.down(dir); await page.waitForTimeout(450); await page.keyboard.up(dir); walkMs += 450;
}
const total = (Date.now() - t0) / 1000;
log(`DONE in ${total.toFixed(0)} s: reading ≈ ${(dialogueMs / 1000).toFixed(0)} s, walking ≈ ${(walkMs / 1000).toFixed(0)} s, choices ${choices}`);
log(errors.length ? `ERRORS: ${errors.join(' | ')}` : 'no console errors');
await ctx.close(); await browser.close();
