import Phaser from 'phaser';
import { SequencePuzzle } from './SequencePuzzle.ts';
import { sound } from '../audio.ts';
import { controls, isTouch, onInputMode } from '../input.ts';
import { C, H, W, text } from '../view.ts';
import { keycap } from './Keycap.ts';
import type { Choice, Line, Script, Step } from '../content/types.ts';
import type { Flags } from '../state.ts';

const BOX = { x: 80, y: 384, w: W - 160, h: 140 };
const BOTTOM = BOX.y + BOX.h; // the panel grows upward from here, only as tall as its text
const MIN_H = 70;             // one line of text plus the advance hint
const TOP = 72;               // framed scripts: panel top sits just under the journal chip
const SUB_Y = H - 24;         // subtitles: centred in the 48 px letterbox bar
const STEP = 3;   // characters revealed per tick
const START_SUSPICION = 1; // Beatty is already a little curious when he sits down
const ARM_MS = 400; // choices ignore confirm presses this long after appearing
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
  onPause?: () => void;
  onSpeaker?: (who: string) => void;
  /** Runs scene steps in the middle of a conversation (the panel hides until they finish). */
  onSteps?: (steps: Step[]) => Promise<void>;
  /** True while the scene's letterbox bars are closed (set pieces can then use subtitles). */
  subtitles?: () => boolean;
  private scene: Phaser.Scene;
  private armedAt = 0;
  private panel: Phaser.GameObjects.Graphics;
  private root: Phaser.GameObjects.Container;
  private name: Phaser.GameObjects.Text;
  private nameBg: Phaser.GameObjects.Rectangle;
  private body: Phaser.GameObjects.Text;
  private more: Phaser.GameObjects.Triangle;
  private hit: Phaser.GameObjects.Zone;
  private hint: Phaser.GameObjects.Text;
  private hintKey: Phaser.GameObjects.Container;
  private boxParts: Phaser.GameObjects.GameObject[];
  private sub: Phaser.GameObjects.Text;
  private subName: Phaser.GameObjects.Text;
  private out!: Phaser.GameObjects.Text;
  private choiceRows: Phaser.GameObjects.Container[] = [];
  private queue: (Line | { steps: Step[] })[] = [];
  private staging = false;
  private caughtReset = false;
  private panelTop = BOX.y;
  private full = '';
  private shown = 0;
  private typing?: Phaser.Time.TimerEvent;
  private script?: Script;
  private choices?: Choice[];
  private retry?: Choice[];
  private retrySel = 0;
  private watch?: Script['suspicion'];
  private suspicion = 0;
  private firstChoices?: Choice[];
  private meter?: Phaser.GameObjects.Container;
  private sel = 0;
  private acc: Flags = {};
  private flags: Flags = {};
  private lookup: (k: string) => Script = () => ({ lines: [] });
  private done?: (acc: Flags) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const g = this.panel = scene.add.graphics();
    this.paintPanel(BOX.y);
    const hit = this.hit = scene.add.zone(BOX.x, BOX.y, BOX.w, BOX.h).setOrigin(0).setScrollFactor(0).setInteractive();
    hit.on('pointerdown', () => { if (!this.choices) this.advance(); });
    this.nameBg = scene.add.rectangle(BOX.x, BOX.y - 26, 10, 26, C.panel, 0.93).setOrigin(0);
    this.name = text(scene, BOX.x + 16, BOX.y - 13, '', { fontSize: '16px', fontStyle: '600', color: C.ember })
      .setOrigin(0, 0.5);
    this.body = text(scene, BOX.x + 28, BOX.y + 20, '', { fontSize: '19px', lineSpacing: 7, wordWrap: { width: BOX.w - 70 } });
    this.more = scene.add.triangle(BOX.x + BOX.w - 26, BOX.y + BOX.h - 20, 0, 0, 12, 0, 6, 8, C.amberN);
    scene.tweens.add({ targets: this.more, y: '+=4', yoyo: true, repeat: -1, duration: 500 });
    const hint = this.hint = text(scene, BOX.x + BOX.w - 44, BOX.y + BOX.h - 21, '', { fontSize: '13px', color: C.creamDim })
      .setOrigin(1, 0.5);
    this.hintKey = keycap(scene, 0, 0, 'E').c;
    const label = () => { hint.setText(isTouch() ? 'Tap to continue' : 'Continue'); this.hintKey.setVisible(!isTouch()); this.placeHint(hint.x, hint.y); };
    label();
    scene.events.once('shutdown', onInputMode(label));
    this.sub = text(scene, 0, SUB_Y, '', { fontSize: '19px' }).setOrigin(0, 0.5);
    this.subName = text(scene, 0, SUB_Y, '', { fontSize: '16px', fontStyle: '600', color: C.ember }).setOrigin(0, 0.5);
    this.boxParts = [g, this.nameBg, this.name, this.body, this.more];
    this.root = scene.add.container(0, 0, [g, hit, this.nameBg, this.name, this.body, this.more, hint, this.hintKey, this.sub, this.subName])
      .setScrollFactor(0, 0, true).setDepth(1200).setVisible(false);
    this.out = this.body;
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
    if (!this.open || this.staging) return;
    if (this.puzzle) return this.puzzle.action('act');
    if (this.choices) return this.pick();
    if (this.shown < this.full.length) return this.finishLine();
    this.next();
  }

  move(d: number) {
    if (this.staging) return;
    if (this.puzzle) return this.puzzle.action(d < 0 ? 'up' : 'down');
    if (!this.choices) return;
    this.sel = (this.sel + d + this.choices.length) % this.choices.length;
    this.paintChoices();
  }

  /** QA hook: choose option i directly. */
  choose(i: number) {
    if (!this.choices || this.staging) return false;
    this.sel = Math.min(i, this.choices.length - 1);
    this.armedAt = 0; // QA hook: an explicit, deliberate pick
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
    this.watch = script.suspicion; this.suspicion = START_SUSPICION; this.caughtReset = false; this.firstChoices = undefined; this.meter?.setVisible(false);
    this.next();
  }

  private next() {
    const line = this.queue.shift();
    if (line && 'steps' in line) return this.stage(line.steps);
    if (line) return this.show(line);
    if (this.script?.puzzle) {
      const def = this.script.puzzle;
      this.script = { ...this.script, puzzle: undefined };
      this.root.setVisible(false);
      this.puzzle = new SequencePuzzle(this.scene, def, () => { this.puzzle = undefined; this.root.setVisible(true); this.next(); }, () => this.onPause?.());
      this.scene.events.once('shutdown', () => { this.puzzle?.destroy(); this.puzzle = undefined; });
      return;
    }
    if (this.caughtReset) { this.caughtReset = false; this.suspicion = START_SUSPICION; } // the meter shows 3/3 through the consequence, then starts over
    if (this.retry) return this.showChoices(this.retry, this.retrySel);
    if (this.script?.choices) {
      const list = this.script.choices.filter((c) => !c.when || c.when({ ...this.flags, ...this.acc }));
      this.script = { ...this.script, choices: undefined };
      if (list.length) return this.showChoices(list);
    }
    this.close();
  }

  private stage(steps: Step[]) {
    this.staging = true;
    this.root.setVisible(false); this.meter?.setVisible(false);
    void (this.onSteps?.(steps) ?? Promise.resolve()).then(() => { this.staging = false; this.root.setVisible(true).setAlpha(1); this.next(); });
  }

  /** Subtitle mode hides the panel and types into the letterbox bar; tapping anywhere advances. */
  private setSub(on: boolean) {
    this.boxParts.forEach((p) => (p as Phaser.GameObjects.Image).setVisible(!on));
    this.sub.setVisible(on).setText(''); this.subName.setVisible(on);
    if (on) this.body.setText(''); // the hidden panel must not keep the previous line
    // the tap target stays the full original box even when the drawn panel is shorter (easier on touch screens)
    if (on) { this.hit.setPosition(0, 0).setSize(W, H); this.placeHint(W - 26, SUB_Y); }
    else { this.hit.setPosition(BOX.x, BOX.y).setSize(BOX.w, BOX.h); this.placeHint(BOX.x + BOX.w - 44, BOTTOM - 21); }
  }

  /** Right edge of the hint text at (x, y); its key cap sits just left of the words. */
  private placeHint(x: number, y: number) {
    this.hint.setPosition(x, y);
    this.hintKey.setPosition(x - this.hint.width - 20, y);
  }

  private show(line: Line) {
    sound.cue('page');
    const narr = !line.who;
    this.full = controls(line.text);
    const sub = !!this.script?.sub && !!this.subtitles?.();
    this.setSub(sub);
    const target = sub ? this.sub : this.body;
    target.setColor(narr ? C.creamDim : C.cream).setFontStyle(narr ? 'italic' : 'normal');
    // measure the whole line once so the frame never resizes while it types
    target.setText(this.full);
    const fw = target.width, th = target.height;
    target.setText('');
    if (sub) {
      this.root.setY(0);
      this.subName.setText(narr ? '' : line.who);
      const nw = narr ? 0 : this.subName.width + 14, x0 = Math.max(24, W / 2 - (nw + fw) / 2);
      this.subName.setX(x0); this.sub.setX(x0 + nw);
    } else {
      const h = Math.max(MIN_H, th + 46), y = BOTTOM - h;
      this.paintPanel(y);
      this.body.setY(y + 18);
      this.name.setY(y - 13);
      this.nameBg.setY(y - 26);
      this.root.setY(this.script?.top ? TOP - y : 0);
      this.name.setText(line.who);
      this.nameBg.setVisible(!narr).setSize(this.name.width + 32, 26);
    }
    this.out = target;
    if (!narr) this.scene.events.emit('speaker', line.who);
    this.scene.events.emit('line', line);
    this.shown = 0;
    this.more.setVisible(false);
    this.onSpeaker?.(line.who);
    this.typing?.remove();
    this.typing = this.scene.time.addEvent({
      delay: TICK, repeat: Math.ceil(this.full.length / STEP) - 1,
      callback: () => {
        this.shown = Math.min(this.full.length, this.shown + STEP);
        this.out.setText(this.full.slice(0, this.shown));
        if (this.shown >= this.full.length) this.more.setVisible(this.out === this.body);
      },
    });
  }

  private finishLine() {
    this.typing?.remove();
    this.shown = this.full.length;
    this.out.setText(this.full);
    this.more.setVisible(this.out === this.body);
  }

  /** `keep` is the row to keep highlighted after a wrong answer; the cursor never jumps to another option. */
  private showChoices(choices: Choice[], keep = 0) {
    this.firstChoices ??= choices;
    this.setSub(false);
    this.root.setY(0); // choices always sit at the bottom, where touch players expect them
    this.choices = choices;
    this.sel = keep;
    // A key press that dismissed the previous line must not also confirm a choice.
    this.armedAt = this.scene.time.now + ARM_MS;
    this.full = '';
    this.body.setText('');
    this.name.setText('Your response');
    this.nameBg.setVisible(true).setSize(this.name.width + 32, 26);
    this.more.setVisible(false);
    const gap = 68;
    const top = Math.min(BOX.y, BOX.y + BOX.h - choices.length * gap - 24);
    this.paintPanel(top);
    this.paintMeter(); // above the panel, never over the choice rows
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
    this.panelTop = y;
    this.meter?.setY(y - 22);
    const h = BOTTOM - y;
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
    if (this.scene.time.now < this.armedAt) return;
    const list = this.choices!;
    const c = list[this.sel];
    sound.cue(c.again ? 'wrong' : 'ui');
    if (c.remember) {
      // restrained emphasis: a quiet line above the dialogue box that fades on its own
      const t = text(this.scene, W / 2, BOX.y - 26, `${c.remember} will remember that.`, { fontSize: '15px', fontStyle: '600', color: C.amber })
        .setOrigin(0.5).setScrollFactor(0).setDepth(1300).setAlpha(0);
      this.scene.tweens.add({ targets: t, alpha: 1, duration: 300, hold: 1800, yoyo: true, onComplete: () => t.destroy() });
    }
    this.choices = undefined;
    this.choiceRows.forEach((r) => r.destroy());
    this.choiceRows = [];
    this.queue = [...(c.reply ?? [])];
    if (c.again) {
      this.retry = list; this.retrySel = list.indexOf(c);
      if (c.suspicion && this.watch) {
        this.suspicion += c.suspicion;
        if (this.suspicion >= 3) {
          // a real setback: the scene plays its consequence and the conversation goes back to its first decision
          this.queue.push(...this.watch.caught);
          this.suspicion = 3; this.caughtReset = true; this.retry = this.firstChoices; this.retrySel = 0;
          sound.cue('caught');
        }
        this.scene.events.emit('fail');
        this.paintMeter();
      }
      this.scene.cameras.main.flash(160, 120, 30, 20);
      return this.next();
    }
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

  /** Three eyes above the panel, no words: each one that opens is Beatty looking harder. The third is the catch. */
  private paintMeter() {
    if (!this.watch) return;
    if (!this.meter) {
      const eyes = [0, 1, 2].map((i) => this.scene.add.image(i * 54, 0, 'cue:eye0').setScale(0.72));
      this.meter = this.scene.add.container(BOX.x + BOX.w - 120, 0, eyes).setScrollFactor(0).setDepth(1300);
    }
    this.meter.setY(this.panelTop - 30).setVisible(true);
    (this.meter.list as Phaser.GameObjects.Image[]).forEach((e, i) => e.setTexture(i >= this.suspicion ? 'cue:eye0' : i >= 2 ? 'cue:eye2' : 'cue:eye1'));
  }

  private close() {
    this.meter?.setVisible(false);
    this.open = false;
    this.typing?.remove();
    this.root.setVisible(false);
    this.scene.events.emit('line', null);
    const d = this.done;
    this.done = undefined;
    d?.(this.acc);
  }
}
