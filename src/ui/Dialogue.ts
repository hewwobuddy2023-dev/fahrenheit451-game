import Phaser from 'phaser';
import { SequencePuzzle } from './SequencePuzzle.ts';
import { sound } from '../audio.ts';
import { C, FONT, W, text } from '../view.ts';
import type { Choice, Line, Script } from '../content/types.ts';
import type { Flags } from '../state.ts';

const BOX = { x: 80, y: 384, w: W - 160, h: 140 };
const STEP = 3;   // characters revealed per tick
const TICK = 55;  // ms per tick (~55 chars/s, ~18 text redraws/s)

/**
 * Dialogue box with typewriter text and choices.
 * advance(): finishes the current line, else shows the next one, else confirms the highlighted choice.
 * Choices may retry (`again`), continue into another script (`next`), or be hidden by flags (`when`).
 * All flags set along the way are collected and handed back only when the conversation ends.
 */
export class Dialogue {
  open = false;
  puzzle?: SequencePuzzle;
  onSpeaker?: (who: string) => void;
  private scene: Phaser.Scene;
  private touch: boolean;
  private panel: Phaser.GameObjects.Graphics;
  private root: Phaser.GameObjects.Container;
  private name: Phaser.GameObjects.Text;
  private nameBg: Phaser.GameObjects.Rectangle;
  private body: Phaser.GameObjects.Text;
  private more: Phaser.GameObjects.Triangle;
  private choiceRows: Phaser.GameObjects.Container[] = [];
  private queue: Line[] = [];
  private full = '';
  private shown = 0;
  private typing?: Phaser.Time.TimerEvent;
  private script?: Script;
  private choices?: Choice[];
  private retry?: Choice[];
  private sel = 0;
  private acc: Flags = {};
  private flags: Flags = {};
  private lookup: (k: string) => Script = () => ({ lines: [] });
  private done?: (acc: Flags) => void;

  constructor(scene: Phaser.Scene, touch: boolean) {
    this.scene = scene;
    this.touch = touch;
    const g = this.panel = scene.add.graphics();
    this.paintPanel(BOX.y);
    const hit = scene.add.zone(BOX.x, BOX.y, BOX.w, BOX.h).setOrigin(0).setScrollFactor(0).setInteractive();
    hit.on('pointerdown', () => { if (!this.choices) this.advance(); });
    this.nameBg = scene.add.rectangle(BOX.x, BOX.y - 26, 10, 26, C.panel, 0.93).setOrigin(0);
    this.name = text(scene, BOX.x + 16, BOX.y - 13, '', { fontFamily: FONT.display, fontSize: '15px', fontStyle: '600', color: C.ember })
      .setOrigin(0, 0.5).setLetterSpacing(3);
    this.body = text(scene, BOX.x + 28, BOX.y + 20, '', { fontSize: '19px', lineSpacing: 7, wordWrap: { width: BOX.w - 70 } });
    this.more = scene.add.triangle(BOX.x + BOX.w - 26, BOX.y + BOX.h - 20, 0, 0, 12, 0, 6, 8, C.amberN);
    scene.tweens.add({ targets: this.more, y: '+=4', yoyo: true, repeat: -1, duration: 500 });
    const hint = text(scene, BOX.x + BOX.w - 44, BOX.y + BOX.h - 21, touch ? 'TAP' : 'E / ENTER', { fontFamily: FONT.display, fontSize: '11px', color: C.muted })
      .setOrigin(1, 0.5).setLetterSpacing(2);
    this.root = scene.add.container(0, 0, [g, hit, this.nameBg, this.name, this.body, this.more, hint])
      .setScrollFactor(0, 0, true).setDepth(1200).setVisible(false);
  }

  play(script: Script, flags: Flags, lookup: (k: string) => Script, done: (acc: Flags) => void) {
    this.flags = flags;
    this.lookup = lookup;
    this.done = done;
    this.acc = {};
    this.open = true;
    this.root.setVisible(true).setAlpha(0);
    this.scene.tweens.add({ targets: this.root, alpha: 1, duration: 140 });
    this.begin(script);
  }

  advance() {
    if (!this.open) return;
    if (this.puzzle) return this.puzzle.action('act');
    if (this.choices) return this.pick();
    if (this.shown < this.full.length) return this.finishLine();
    this.next();
  }

  move(d: number) {
    if (this.puzzle) return this.puzzle.action(d < 0 ? 'up' : 'down');
    if (!this.choices) return;
    this.sel = (this.sel + d + this.choices.length) % this.choices.length;
    this.paintChoices();
  }

  /** QA hook: choose option i directly. */
  choose(i: number) {
    if (!this.choices) return false;
    this.sel = Math.min(i, this.choices.length - 1);
    this.pick();
    return true;
  }

  get choosing() { return !!this.choices; }
  get options() { return this.choices?.map((c) => c.text) ?? []; }
  get current() { return this.full; }

  private begin(script: Script) {
    this.script = script;
    if (script.set) Object.assign(this.acc, script.set);
    this.queue = [...script.lines];
    this.retry = undefined;
    this.next();
  }

  private next() {
    const line = this.queue.shift();
    if (line) return this.show(line);
    if (this.script?.puzzle) {
      const def = this.script.puzzle;
      this.script = { ...this.script, puzzle: undefined };
      this.root.setVisible(false);
      this.puzzle = new SequencePuzzle(this.scene, def, () => { this.puzzle = undefined; this.root.setVisible(true); this.next(); });
      this.scene.events.once('shutdown', () => { this.puzzle?.destroy(); this.puzzle = undefined; });
      return;
    }
    if (this.retry) return this.showChoices(this.retry);
    if (this.script?.choices) {
      const list = this.script.choices.filter((c) => !c.when || c.when({ ...this.flags, ...this.acc }));
      this.script = { ...this.script, choices: undefined };
      if (list.length) return this.showChoices(list);
    }
    this.close();
  }

  private show(line: Line) {
    sound.cue('page');
    this.paintPanel(BOX.y);
    this.name.setY(BOX.y - 13);
    this.nameBg.setY(BOX.y - 26);
    const narr = !line.who;
    this.name.setText(line.who);
    this.nameBg.setVisible(!narr).setSize(this.name.width + 32, 26);
    this.body.setColor(narr ? C.creamDim : C.cream).setFontStyle(narr ? 'italic' : 'normal');
    this.full = this.touch ? line.text.replace('Hold DOWN', 'Hold DIVE') : line.text;
    this.shown = 0;
    this.body.setText('');
    this.more.setVisible(false);
    this.onSpeaker?.(line.who);
    this.typing?.remove();
    this.typing = this.scene.time.addEvent({
      delay: TICK, repeat: Math.ceil(this.full.length / STEP) - 1,
      callback: () => {
        this.shown = Math.min(this.full.length, this.shown + STEP);
        this.body.setText(this.full.slice(0, this.shown));
        if (this.shown >= this.full.length) this.more.setVisible(true);
      },
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
    this.full = '';
    this.body.setText('');
    this.name.setText('YOUR RESPONSE');
    this.nameBg.setVisible(true).setSize(this.name.width + 32, 26);
    this.more.setVisible(false);
    const gap = 68;
    const top = Math.min(BOX.y, BOX.y + BOX.h - choices.length * gap - 24);
    this.paintPanel(top);
    this.name.setY(top - 13);
    this.nameBg.setY(top - 26);
    this.choiceRows = choices.map((c, i) => {
      const y = top + 12 + gap / 2 + i * gap;
      const bg = this.scene.add.rectangle(BOX.x + 16, y, BOX.w - 32, gap - 4, C.emberN, 0).setOrigin(0, 0.5);
      const t = text(this.scene, BOX.x + 40, y, c.text, { fontSize: '18px', lineSpacing: 3, wordWrap: { width: BOX.w - 88 } }).setOrigin(0, 0.5);
      bg.setScrollFactor(0).setInteractive({ useHandCursor: true })
        .on('pointerover', () => { this.sel = i; this.paintChoices(); })
        .on('pointerdown', () => { this.sel = i; this.pick(); });
      const row = this.scene.add.container(0, 0, [bg, t]).setScrollFactor(0, 0, true);
      this.root.add(row);
      return row;
    });
    this.paintChoices();
  }

  private paintPanel(y: number) {
    const h = BOX.y + BOX.h - y;
    this.panel.clear().fillStyle(C.panel, 0.96).fillRect(BOX.x, y, BOX.w, h)
      .lineStyle(1, C.emberN, 0.55).strokeRect(BOX.x + 0.5, y + 0.5, BOX.w - 1, h - 1)
      .fillStyle(C.emberN, 0.9).fillRect(BOX.x, y, 3, h);
  }

  private paintChoices() {
    this.choiceRows.forEach((row, i) => {
      const [bg, t] = row.list as [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text];
      bg.setFillStyle(C.emberN, i === this.sel ? 0.22 : 0).setStrokeStyle(i === this.sel ? 1 : 0, C.emberN, 0.7);
      t.setColor(i === this.sel ? C.amber : C.creamDim).setText((i === this.sel ? '›  ' : '   ') + this.choices![i].text);
    });
  }

  private pick() {
    sound.cue('ui');
    const list = this.choices!;
    const c = list[this.sel];
    this.choices = undefined;
    this.choiceRows.forEach((r) => r.destroy());
    this.choiceRows = [];
    this.queue = [...(c.reply ?? [])];
    if (c.again) { this.retry = list; return this.next(); }
    if (c.set) Object.assign(this.acc, c.set);
    this.retry = undefined;
    if (c.next) {
      const after = this.lookup(c.next);
      this.queue.push(...after.lines);
      this.script = { ...after, lines: [] };
      if (after.set) Object.assign(this.acc, after.set);
    }
    this.next();
  }

  private close() {
    this.open = false;
    this.typing?.remove();
    this.root.setVisible(false);
    const d = this.done;
    this.done = undefined;
    d?.(this.acc);
  }
}
