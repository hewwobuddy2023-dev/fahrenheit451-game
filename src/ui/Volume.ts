import Phaser from 'phaser';
import { sound } from '../audio.ts';
import { setSetting, settings } from '../settings.ts';
import { C } from '../view.ts';

const LEVELS = [0.2, 0.4, 0.6, 0.8, 1];

/** Five rising bars: tap one to set the volume. Each target is 44 px tall for touch. */
export function volumeBars(scene: Phaser.Scene, x: number, y: number): { root: Phaser.GameObjects.Container; step: () => void; paint: () => void } {
  const g = scene.add.graphics();
  const root = scene.add.container(x, y, [g]).setScrollFactor(0, 0, true).setDepth(1296);
  const current = () => LEVELS.reduce((b, v, i) => (Math.abs(v - settings.volume) < Math.abs(LEVELS[b] - settings.volume) ? i : b), 0);
  const paint = () => {
    const cur = current();
    g.clear();
    LEVELS.forEach((_, i) => { const h = 8 + i * 4; g.fillStyle(i <= cur ? C.emberN : 0x3a2f29, 1).fillRect(i * 22 + 2, 12 - h, 10, h); });
  };
  const set = (i: number) => { setSetting('volume', LEVELS[i]); sound.refresh(); paint(); };
  LEVELS.forEach((_, i) => {
    const z = scene.add.zone(i * 22 - 4, -22, 22, 44).setOrigin(0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => set(i));
    root.add(z);
  });
  paint();
  /** Keyboard: step to the next level, wrapping to the quietest. */
  const step = () => set((current() + 1) % LEVELS.length);
  return { root, step, paint };
}
