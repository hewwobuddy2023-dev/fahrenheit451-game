import Phaser from 'phaser';
import { settings } from './settings.ts';

// Logical layout is always 960x540. The canvas renders at zoom K so text stays sharp on the real screen.
export const W = 960;
export const H = 540;
export const FLOOR_TOP = 392;  // where back walls meet the floor
export const WALK_Y = 480;     // Montag's feet: the walk line, mid-floor

export const params = new URLSearchParams(location.search);
const fit = Math.min(innerWidth / W, innerHeight / H) * (devicePixelRatio || 1);
let saved = NaN;
try { saved = Number(localStorage.getItem('f451.k')); } catch { /* storage blocked */ }
/** Render zoom. Capped at 1.5 for Chromebooks; the governor may lower it and remembers that choice. */
export let K = params.has('lowres') ? 1 : Math.min(1.5, Math.max(1, Math.round(fit * 4) / 4), saved > 0 ? saved : 9);

/** Performance governor step: render at a lower resolution. Cosmetic only: gameplay is unchanged. */
export function lowerK(game: Phaser.Game): boolean {
  if (K <= 1) return false;
  K = Math.max(1, K - 0.25);
  try { localStorage.setItem('f451.k', String(K)); } catch { /* fine */ }
  game.scale.setGameSize(W * K, H * K);
  for (const s of game.scene.getScenes(true)) s.cameras.main.setZoom(K);
  return true;
}

export const C = {
  ink: '#0b0908',
  panel: 0x0d0a09,
  cream: '#ece1c8',
  creamDim: '#a99c86',
  muted: '#7a6e60',
  ember: '#e8682e',
  amber: '#f2a54a',
  red: '#c22a1f',
  emberN: 0xe8682e,
  amberN: 0xf2a54a,
  creamN: 0xece1c8,
  redN: 0xc22a1f,
  coldN: 0x7fd6c8,
};

export const FONT = {
  display: 'Oswald, "Arial Narrow", sans-serif',
  body: '"IBM Plex Sans", "Segoe UI", Roboto, sans-serif',
  type: '"Special Elite", "Courier New", monospace',
};

export function setupCamera(scene: Phaser.Scene): Phaser.Cameras.Scene2D.Camera {
  return scene.cameras.main.setZoom(K).setOrigin(0, 0);
}

export function text(
  scene: Phaser.Scene, x: number, y: number, s: string, style: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, s, { color: C.cream, fontFamily: FONT.body, fontSize: '16px', ...style, resolution: K });
}

export type Act = 'act' | 'up' | 'down' | 'pause' | 'journal' | 'back';
const KEYMAP: Record<string, Act> = {
  KeyE: 'act', Enter: 'act', NumpadEnter: 'act', Space: 'act',
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  Escape: 'pause', KeyP: 'pause', KeyJ: 'journal', Backspace: 'back',
};

/** One action per physical key press: held-key auto-repeat is ignored, so dialogue never double-advances. */
export function onActions(scene: Phaser.Scene, handler: (a: Act) => void): void {
  const kb = scene.input.keyboard!;
  kb.addCapture('SPACE,UP,DOWN,LEFT,RIGHT,TAB,BACKSPACE');
  kb.on('keydown', (e: KeyboardEvent) => {
    if (e.repeat) return;
    const a = KEYMAP[e.code];
    if (a) handler(a);
  });
}

/** Vignette + scanlines (one texture) and moving grain. Sits below UI so text is never obscured. */
export function addAtmosphere(scene: Phaser.Scene): void {
  scene.add.image(0, 0, 'overlay').setOrigin(0).setScrollFactor(0).setDepth(900);
  const grain = scene.add.tileSprite(0, 0, W, H, 'grain').setOrigin(0).setScrollFactor(0).setDepth(902).setAlpha(0.045);
  scene.time.addEvent({ delay: 90, loop: true, callback: () => { grain.setVisible(!settings.reducedMotion); if (!settings.reducedMotion) grain.setTilePosition(Math.random() * 128, Math.random() * 128); } });
}


/** Inspect sustained real frame rate on every scene, including the title/cinematics.
 * Only render resolution changes; elapsed gameplay, movement and hazards are untouched.
 */
export function installQualityGovernor(game: Phaser.Game) {
  let start: number | undefined, last = 0, lowWindows = 0;
  const sample = (time: number) => {
    if (start === undefined) { start = time; last = time; }
    if (K <= 1 || time - start < 4000 || time - last < 2500) return;
    last = time;
    if (document.hidden || !game.scene.getScenes(true).length) { lowWindows = 0; return; }
    lowWindows = game.loop.actualFps < 40 ? lowWindows + 1 : 0;
    if (lowWindows >= 2) { lowerK(game); lowWindows = 0; }
  };
  game.events.on('poststep', sample);
  game.events.once('destroy', () => game.events.off('poststep', sample));
}
