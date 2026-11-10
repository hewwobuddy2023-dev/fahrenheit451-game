import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';

// Relative base works on GitHub Pages (/fahrenheit451-game/) and locally without a path rewrite.
export default defineConfig({
  base: './',
  define: { __BUILD_INFO__: JSON.stringify({ sha: process.env.F451_BUILD_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), date: new Date().toISOString(), environment: process.env.F451_ENV || 'candidate-local', version: 'phoenix-1' }) },
  build: { target: 'es2022', chunkSizeWarningLimit: 1600, assetsInlineLimit: 0 },
});
