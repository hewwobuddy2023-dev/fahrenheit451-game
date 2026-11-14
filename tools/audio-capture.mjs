// Real-browser audio evidence: records the game's final mix (after the compressor) in Chromium and
// measures level per segment. Usage: node tools/audio-capture.mjs <baseURL> <outDir>
// This proves the synthesis produces signal at sane levels and gives a file a person can listen to.
// It does NOT prove a player heard it on their device.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const [base = 'http://localhost:5173', out = 'docs/qa/audio'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.goto(`${base}/?debug`);
await page.evaluate(() => localStorage.setItem('f451.options', JSON.stringify({ muted: false, volume: 1 })));
await page.reload();
await page.waitForFunction(() => window.__game?.scene.isActive('menu'), null, { timeout: 20000 });
await page.keyboard.press('ArrowDown'); // a real key gesture unlocks audio
await page.waitForFunction(() => window.__audio.status.state === 'running', null, { timeout: 5000 });

const segments = [
  ['ambience: burning house (fire crackle)', 'burn', [], 3000],
  ['hose spray, full flow then sputter', 'burn', [['spray', 1], ['wait', 1200], ['spray', 0.4], ['wait', 1200], ['spray', 0]], 2600],
  ['ignite whoosh', 'burn', [['cue', 'ignite']], 1600],
  ['ambience: parlor television', 'home1', [], 2500],
  ['footsteps', 'station1', [['cue', 'step'], ['wait', 300], ['cue', 'step'], ['wait', 300], ['cue', 'step'], ['wait', 300], ['cue', 'step']], 1500],
  ['Mechanical Hound', 'station2', [['cue', 'hound']], 1500],
  ['pursuit: car approaching, siren, caught', 'boulevard', [['cue', 'engine'], ['wait', 1300], ['cue', 'alarm'], ['wait', 500], ['cue', 'caught']], 3200],
  ['puzzle: wrong, page, complete', 'faber1', [['cue', 'wrong'], ['wait', 500], ['cue', 'page'], ['wait', 400], ['cue', 'complete']], 2000],
  ['ambience: river (water swell)', 'river', [], 4000],
  ['ambience: camp fire', 'camp', [], 3000],
  ['ending', 'end', [['cue', 'ending']], 3000],
];

const result = await page.evaluate(async (segments) => {
  const a = window.__audio, stream = a.tap();
  const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' }), chunks = [];
  rec.ondataavailable = (e) => chunks.push(e.data);
  rec.start();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const table = [];
  for (const [name, scene, actions, total] of segments) {
    a.useScene(scene);
    let rms = 0, peak = 0, n = 0;
    const meter = setInterval(() => { const s = a.sampleOutput(); rms += s.rms; peak = Math.max(peak, s.peak); n++; }, 40);
    const t0 = performance.now();
    for (const [op, v] of actions) { if (op === 'cue') a.cue(v); else if (op === 'spray') a.setSpray(v); else await sleep(v); }
    await sleep(Math.max(0, total - (performance.now() - t0)));
    clearInterval(meter);
    table.push({ name, scene, meanRms: +(rms / Math.max(1, n)).toFixed(4), peak: +peak.toFixed(3) });
  }
  // mute must silence the mix
  a.toggleMute(); await sleep(600); const muted = a.sampleOutput(); a.toggleMute();
  rec.stop(); await new Promise((r) => { rec.onstop = r; });
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { table, muted: { rms: +muted.rms.toFixed(5), peak: +muted.peak.toFixed(5) }, webm: btoa(bin), state: a.status.state };
}, segments);

await writeFile(`${out}/final-mix.webm`, Buffer.from(result.webm, 'base64'));
const lines = ['| Segment | Profile | Mean RMS | Peak |', '|---|---|---|---|', ...result.table.map((r) => `| ${r.name} | ${r.scene} | ${r.meanRms} | ${r.peak} |`)];
const md = `# Audio capture (Chromium, real Web Audio graph)\n\nRecorded from the final mix (post-compressor) with MediaRecorder: \`final-mix.webm\` (segments in table order).\nContext state: ${result.state}. Muted mix: RMS ${result.muted.rms}, peak ${result.muted.peak}.\n\n${lines.join('\n')}\n\nThis proves signal and levels in a real browser engine. It is not proof that a player heard it on a device.\n`;
await writeFile(`${out}/levels.md`, md);
console.log(md);
await browser.close();
