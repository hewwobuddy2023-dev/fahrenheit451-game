import Phaser from 'phaser';
import { C, FONT, text } from '../view.ts';

/** A small drawn key cap. Keys read as keys, not as words. Returns the cap and its width. */
export function keycap(scene: Phaser.Scene, x: number, y: number, label: string): { c: Phaser.GameObjects.Container; w: number } {
  const t = text(scene, 0, 0, label, { fontFamily: FONT.display, fontSize: '12px', color: C.cream }).setOrigin(0.5).setLetterSpacing(1);
  const w = Math.max(22, Math.round(t.width + 12)), h = 22;
  const g = scene.add.graphics()
    .fillStyle(0x000000, 0.6).fillRoundedRect(-w / 2, -h / 2 + 2, w, h, 4)   // shadow under the cap
    .fillStyle(0x221c19, 1).fillRoundedRect(-w / 2, -h / 2, w, h - 2, 4)
    .lineStyle(1, C.creamN, 0.45).strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 3, 4);
  return { c: scene.add.container(x, y, [g, t]), w };
}

/** A row of keys and short words, right-aligned at rightX, vertically centred on y. Returns its parts. */
export function keyRow(scene: Phaser.Scene, rightX: number, y: number, parts: ({ key: string } | { word: string })[], color: string = C.creamDim): Phaser.GameObjects.GameObject[] {
  const out: Phaser.GameObjects.GameObject[] = [];
  let x = rightX;
  for (const p of [...parts].reverse()) {
    if ('key' in p) {
      const k = keycap(scene, 0, y, p.key);
      k.c.setX(x - k.w / 2); x -= k.w + 6;
      out.push(k.c);
    } else {
      const t = text(scene, x, y, p.word, { fontSize: '13px', color }).setOrigin(1, 0.5);
      out.push(t); x -= t.width + 6;
    }
    x -= 6;
  }
  return out;
}
