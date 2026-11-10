import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';

// A source ZIP has no .git directory. It must still build without pretending to know its SHA.
let sourceSha = process.env.F451_BUILD_SHA || 'source-archive';
if (!process.env.F451_BUILD_SHA && existsSync('.git')) {
  try { sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* manifest identifies archive provenance */ }
}

// Relative base works on GitHub Pages (/fahrenheit451-game/) and locally without a path rewrite.
export default defineConfig({
  base: './',
  define: { __BUILD_INFO__: JSON.stringify({ sha: sourceSha, date: new Date().toISOString(), environment: process.env.F451_ENV || 'candidate-local', version: 'phoenix-1' }) },
  build: { target: 'es2022', chunkSizeWarningLimit: 1600, assetsInlineLimit: 0 },
});
