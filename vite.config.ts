import { defineConfig } from 'vite';

// Relative base works on GitHub Pages (/fahrenheit451-game/) and locally without a path rewrite.
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 1600, assetsInlineLimit: 0 },
});
