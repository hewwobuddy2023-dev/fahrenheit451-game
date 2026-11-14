// One verification command: runs every required suite in order and exits non-zero if ANY fails.
// Usage: npm run verify            (simulation + unit + typecheck + build)
//        npm run verify -- --browser   (also the native Playwright suite: Chromium + WebKit)
// Never pipe this into grep before committing: the pipe would hide the exit status.
import { spawnSync } from 'node:child_process';

const steps = [
  ['typecheck', 'npx', ['tsc', '--noEmit']],
  ['unit', 'node', ['--test', 'tests/*.test.ts']],
  ['input', 'node', ['tests/input.mjs']],
  ['simulation', 'node', ['tests/simulation.mjs']],
  ['regression', 'node', ['tests/regression.mjs']],
  ['day2', 'node', ['tests/day2.mjs']],
  ['cinematics', 'node', ['tests/cinematics.mjs']],
  ['phoenix', 'node', ['tests/phoenix.mjs']],
  ['campaign:all', 'node', ['tests/campaign-all.mjs']],
  ['build', 'npx', ['vite', 'build']],
];
if (process.argv.includes('--browser')) steps.push(['browser', 'npx', ['playwright', 'test']]);

const results = [];
for (const [name, cmd, args] of steps) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  const ok = r.status === 0;
  results.push([name, ok, Math.round((Date.now() - t0) / 1000)]);
  console.log(`\n${ok ? 'PASS' : 'FAIL'} ${name} (exit ${r.status}, ${results.at(-1)[2]} s)\n`);
}
console.log('==== verify summary ====');
for (const [name, ok, s] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${s}s`);
const failed = results.filter(([, ok]) => !ok).map(([n]) => n);
console.log(failed.length ? `FAILED: ${failed.join(', ')}` : 'ALL REQUIRED SUITES PASSED');
process.exit(failed.length ? 1 : 0);
