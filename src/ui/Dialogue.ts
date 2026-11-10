import Phaser from 'phaser';
import { C, FONT, W, text } from '../view.ts';
import type { Choice, Line, Script } from '../content.ts';

const BOX = { x: 80, y: 384, w: W - 160, h: 140 };
const CPS = 55; // typewriter characters per second

/**
 * Dialogue box with typewriter text and choices.
 * advance(): finishes the current line, else shows the next one, else confirms the highlighted choice.
 */
export class Dialogue {
  open = false;
  private root: Phaser.GameObjects.Container;
  private name: Phaser.GameObjects.Text;
  private nameBg: Phaser.GameObjects.Rectangle;
  private body: Phaser.GameObjects.Text;
  private more: Phaser.GameObjects.Triangle;
  private hint: Phaser.GameObjects.Text;
  private choiceRows: Phaser.GameObjects.Container[] = [];
  private queue: Line[] = [];
  private full = '';
  private shown = 0;
  private typing?: Phaser.Time.TimerEvent;
  private script?: Script;
  private choices?: Choice[];
  private sel = 0;
  private chosen?: Choice;
  private done?: (c?: Choice) => void;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, touch: boolean) {
    this.scene = scene;
    const g = scene.add.graphics();
    g.fillStyle(C.panel, 0.92).fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
    g.lineStyle(1, C.emberN, 0.55).strokeRect(BOX.x + 0.5, BOX.y + 0.5, BOX.w - 1, BOX.h - 1);
    g.fillStyle(C.emberN, 0.9).fillRect(BOX.x, BOX.y, 3, BOX.h);
    const hit = scene.add.zone(BOX.x, BOX.y, BOX.w, BOX.h).setOrigin(0).setInteractive();
    hit.on('pointerdown', () => { if (!this.choices) this.advance(); });
    this.nameBg = scene.add.rectangle(BOX.x, BOX.y - 26, 10, 26, C.panel, 0.92).setOrigin(0);
    this.name = text(scene, BOX.x + 16, BOX.y - 13, '', {
      fontFamily: FONT.display, fontSize: '15px', fontStyle: '600', color: C.ember,
    }).setOrigin(0, 0.5).setLetterSpacing(3);
    this.body = text(scene, BOX.x + 28, BOX.y + 22, '', {
      fontSize: '19px', lineSpacing: 7, wordWrap: { width: BOX.w - 70 },
    });
    this.more = scene.add.triangle(BOX.x + BOX.w - 26, BOX.y + BOX.h - 20, 0, 0, 12, 0, 6, 8, C.amberN);
    scene.tweens.add({ targets: this.more, y: '+=4', yoyo: true, repeat: -1, duration: 500 });
    this.hint = text(scene, BOX.x + BOX.w - 44, BOX.y + BOX.h - 21, touch ? 'TAP' : 'E / ENTER', {
      fontFamily: FONT.display, fontSize: '11px', color: C.muted,
    }).setOrigin(1, 0.5).setLetterSpacing(2);
    this.root = scene.add.container(0, 0, [g, hit, this.nameBg, this.name, this.body, this.more, this.hint])
      .setScrollFactor(0, 0, true).setDepth(1200).setVisible(false);
  }

  play(script: Script, done: (chosen?: Choice) => void) {
    this.script = script;
    this.done = done;
    this.chosen = undefined;
    this.queue = [...script.lines];
    this.open = true;
    this.root.setVisible(true).setAlpha(0);
    this.scene.tweens.add({ targets: this.root, alpha: 1, duration: 140 });
    this.next();
  }

  advance() {
    if (!this.open) return;
    if (this.choices) return this.pick();
    if (this.shown < this.full.length) return this.finishLine();
    this.next();
  }

  move(d: number) {
    if (!this.choices) return;
    this.sel = (this.sel + d + this.choices.length) % this.choices.length;
    this.paintChoices();
  }

  private next() {
    const line = this.queue.shift();
    if (line) return this.show(line);
    if (this.script?.choices && !this.chosen) return this.showChoices(this.script.choices);
    this.close();
  }

  private show(line: Line) {
    const narr = !line.who;
    this.name.setText(line.who);
    this.nameBg.setVisible(!narr).setSize(this.name.width + 32, 26);
    this.body.setColor(narr ? C.creamDim : C.cream).setFontStyle(narr ? 'italic' : 'normal');
    this.full = line.text;
    this.shown = 0;
    this.body.setText('');
    this.more.setVisible(false);
    this.typing?.remove();
    this.typing = this.scene.time.addEvent({
      delay: 1000 / CPS, repeat: this.full.length - 1,
      callback: () => { this.shown++; this.body.setText(this.full.slice(0, this.shown)); if (this.shown >= this.full.length) this.more.setVisible(true); },
    });
  }

  private finishLine() {
    this.typing?.remove();
    this.shown = this.full.length;
    this.body.setText(this.full);
    this.more.setVisible(true);
  }

  private showChoices(choices: Choice[]) {
    this.choices = choices;
    this.sel = 0;
    this.body.setText('');
    this.name.setText('YOUR RESPONSE');
    this.nameBg.setVisible(true).setSize(this.name.width + 32, 26);
    this.more.setVisible(false);
    this.choiceRows = choices.map((c, i) => {
      const y = BOX.y + 30 + i * 40;
      const bg = this.scene.add.rectangle(BOX.x + 16, y, BOX.w - 32, 34, C.emberN, 0).setOrigin(0, 0.5);
      const t = text(this.scene, BOX.x + 40, y, c.text, { fontSize: '18px' }).setOrigin(0, 0.5);
      bg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => { this.sel = i; this.paintChoices(); })
        .on('pointerdown', () => { this.sel = i; this.pick(); });
      const row = this.scene.add.container(0, 0, [bg, t]).setScrollFactor(0, 0, true);
      this.root.add(row);
      return row;
    });
    this.paintChoices();
  }

  private paintChoices() {
    this.choiceRows.forEach((row, i) => {
      const [bg, t] = row.list as [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text];
      bg.setFillStyle(C.emberN, i === this.sel ? 0.22 : 0).setStrokeStyle(i === this.sel ? 1 : 0, C.emberN, 0.7);
      t.setColor(i === this.sel ? C.amber : C.creamDim).setText((i === this.sel ? '›  ' : '   ') + this.choices![i].text);
    });
  }

  private pick() {
    const c = this.choices![this.sel];
    this.chosen = c;
    this.choices = undefined;
    this.choiceRows.forEach((r) => r.destroy());
    this.choiceRows = [];
    this.queue = [...(c.reply ?? [])];
    this.next();
  }

  private close() {
    this.open = false;
    this.typing?.remove();
    this.root.setVisible(false);
    const d = this.done;
    this.done = undefined;
    d?.(this.chosen);
  }
}
