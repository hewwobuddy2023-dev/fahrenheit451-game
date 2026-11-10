import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-600.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-400-italic.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/special-elite/latin-400.css';
import Phaser from 'phaser';
import { paintCast } from './art/figures.ts';
import { paintFx } from './art/fx.ts';
import { EndScene } from './scenes/EndScene.ts';
import { MenuScene } from './scenes/MenuScene.ts';
import { RoomScene } from './scenes/RoomScene.ts';
import { C, H, K, W, params } from './view.ts';

class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  create() {
    paintFx(this);
    paintCast(this);
    document.getElementById('boot')?.remove();
    this.scene.start('menu');
  }
}

// Canvas text needs the fonts loaded first; a slow or blocked font must not stop the game (system fallbacks exist).
const fonts = ['500 20px Oswald', '600 20px Oswald', '700 20px Oswald', '400 20px "IBM Plex Sans"',
  'italic 400 20px "IBM Plex Sans"', '600 20px "IBM Plex Sans"', '400 20px "Special Elite"'];
await Promise.race([
  Promise.all(fonts.map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 4000)),
]).catch(() => undefined);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W * K,
  height: H * K,
  backgroundColor: C.ink,
  banner: false,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 3 },
  render: { antialias: true, powerPreference: 'low-power' },
  scene: [BootScene, MenuScene, RoomScene, EndScene],
});

if (params.has('debug')) {
  // QA hook: ?debug exposes the game and shows a frame-rate readout.
  Object.assign(window, { __game: game });
  const el = Object.assign(document.createElement('div'), { id: 'fps' });
  el.style.cssText = 'position:fixed;left:6px;bottom:6px;color:#f2a54a;font:12px monospace;z-index:9;pointer-events:none';
  document.body.append(el);
  setInterval(() => { el.textContent = `${game.loop.actualFps.toFixed(0)} fps  ·  zoom ${K}`; }, 500);
}
