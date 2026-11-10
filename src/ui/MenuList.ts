import Phaser from 'phaser';
import { C, FONT, text } from '../view.ts';

export interface Item { label: string; action: () => void; enabled?: boolean; note?: string }

/** Vertical list driven by keyboard (up/down/act) or pointer. Used by title, pause and chapter select. */
export class MenuList {
  sel = 0;
  readonly root: Phaser.GameObjects.Container;
  private rows: { t: Phaser.GameObjects.Text; n?: Phaser.GameObjects.Text; item: Item }[] = [];
  private bar: Phaser.GameObjects.Rectangle;
  private gap: number;

  constructor(scene: Phaser.Scene, x: number, y: number, items: Item[], gap = 46, size = 24) {
    this.gap = gap;
    this.root = scene.add.container(x, y).setScrollFactor(0).setDepth(1100);
    this.bar = scene.add.rectangle(-18, 0, 4, size + 6, C.emberN).setOrigin(0, 0.5);
    this.root.add(this.bar);
    items.forEach((item, i) => {
      const t = text(scene, 0, i * gap, item.label.toUpperCase(), {
        fontFamily: FONT.display, fontSize: `${size}px`, fontStyle: '500',
      }).setOrigin(0, 0.5).setLetterSpacing(3);
      const row: (typeof this.rows)[number] = { t, item };
      if (item.note) {
        row.n = text(scene, t.width + 14, i * gap + 1, item.note, { fontSize: '13px', color: C.muted }).setOrigin(0, 0.5);
        this.root.add(row.n);
      }
      if (item.enabled !== false) {
        t.setInteractive({ useHandCursor: true })
          .on('pointerover', () => this.select(i))
          .on('pointerdown', () => { this.select(i); this.choose(); });
      }
      this.root.add(t);
      this.rows.push(row);
    });
    this.root.setScrollFactor(0, 0, true); // children too, or pointer hit-tests drift with the camera
    this.sel = Math.max(0, items.findIndex((it) => it.enabled !== false));
    this.select(this.sel);
  }

  select(i: number) {
    this.sel = i;
    this.rows.forEach((r, j) => r.t.setColor(r.item.enabled === false ? C.muted : j === i ? C.amber : C.cream));
    this.bar.setY(i * this.gap);
  }

  move(d: number) {
    const n = this.rows.length;
    for (let k = 1; k <= n; k++) {
      const j = (this.sel + d * k + n) % n;
      if (this.rows[j].item.enabled !== false) return this.select(j);
    }
  }

  choose() {
    const it = this.rows[this.sel]?.item;
    if (it && it.enabled !== false) it.action();
  }

  destroy() { this.root.destroy(); }
}
