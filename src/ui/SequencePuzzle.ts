import Phaser from 'phaser';
import { controls } from '../input.ts';
import { sound } from '../audio.ts';
import { C, FONT, W, H, text } from '../view.ts';

export interface SequenceDef { title: string; source: string; fragments: string[]; distractions: string[]; interference?: boolean }
/** Untimed, source-first ordered reconstruction. No story flags live in this UI. Drawn like the dialogue panel. */
export class SequencePuzzle {
  private root?: Phaser.GameObjects.Container;
  private phase: 'study' | 'assemble' = 'study';
  private selected: string[] = [];
  private cards: string[];
  private index = 0;
  private attempts = 0;
  private hintLevel = 0;
  private message = '';
  private bad = false;   // the last pick was wrong: the panel flashes red once
  /** Interference puzzles: the line you could not recall is drowned out by the jingle until you read the source again. */
  private drowned?: string;
  constructor(privateScene: Phaser.Scene, privateDef: SequenceDef, privateDone: () => void, privatePause: () => void) {
    this.scene = privateScene; this.def = privateDef; this.done = privateDone; this.pause = privatePause;
    // Stable mixed order, deliberately unrelated to the answer order. No random unfairness on retry.
    this.cards = [...privateDef.fragments, ...privateDef.distractions];
    this.cards = [this.cards[2], this.cards[4], this.cards[0], this.cards[5], this.cards[3], this.cards[1]].filter(Boolean);
    this.draw();
  }
  private scene: Phaser.Scene;
  private def: SequenceDef;
  private done: () => void;
  private pause: () => void;
  get state() { return { phase: this.phase, selected: [...this.selected], cards: [...this.cards], attempts: this.attempts, drowned: this.drowned }; }
  action(a: 'act' | 'up' | 'down' | 'back' | 'hint') {
    if (a === 'back') { this.phase = 'study'; this.selected = []; this.message = ''; this.drowned = undefined; }
    else if (a === 'hint') {
      this.message = ['Read the source as an ordered thought, not as separate answers.', 'Choose the next fragment after the last line you placed.', `Next: ${this.def.fragments[this.selected.length] ?? this.def.fragments[0]}`][Math.min(2, this.hintLevel++)];
    } else if (a === 'up' || a === 'down') this.index = (this.index + (a === 'up' ? -1 : 1) + this.cards.length) % this.cards.length;
    else if (this.phase === 'study') { this.phase = 'assemble'; this.selected = []; this.index = 0; }
    else return this.pick(this.index);
    this.draw();
  }
  private pick(i: number) {
    const word = this.cards[i];
    if (word === this.drowned || this.selected.includes(word)) { sound.cue('wrong'); this.bad = true; this.draw(); return; }
    sound.cue('page'); this.selected.push(word); this.message = '';
    if (this.selected.length === this.def.fragments.length) {
      if (this.selected.every((word, i) => word === this.def.fragments[i])) { this.destroy(); sound.cue('complete'); this.done(); return; }
      this.attempts++; sound.cue('caught'); this.bad = true;
      const miss = this.selected.findIndex((w, k) => w !== this.def.fragments[k]);
      if (this.def.interference) this.drowned = this.def.fragments[miss];
      this.selected = [];
    }
    this.draw();
  }
  private draw() {
    this.root?.destroy();
    const s = this.scene, parts: Phaser.GameObjects.GameObject[] = [];
    const X = 32, Y = 24, PW = W - 64, PH = H - 48;
    const studying = this.phase === 'study';
    // the scene dims behind a dark panel with an ember edge, the same frame as the dialogue box
    parts.push(s.add.rectangle(0, 0, W, H, 0x000000, 0.45).setOrigin(0));
    parts.push(s.add.graphics().fillStyle(C.panel, 0.96).fillRect(X, Y, PW, PH)
      .lineStyle(1, C.emberN, 0.55).strokeRect(X + 0.5, Y + 0.5, PW - 1, PH - 1)
      .fillStyle(C.emberN, 0.9).fillRect(X, Y, 3, PH));
    const label = (x: number, y: number, value: string, size = 18, color = C.cream) => {
      const t = text(s, x, y, value, { fontSize: `${size}px`, color, wordWrap: { width: 830 }, lineSpacing: 5 }); parts.push(t); return t;
    };
    label(60, 36, this.def.title.toUpperCase(), 24, C.amber).setFontFamily(FONT.display).setLetterSpacing(4);
    const button = (x: number, y: number, w: number, h: number, value: string, fn: () => void, chosen = false, display = true, placed = false) => {
      const box = s.add.rectangle(x, y, w, h, C.emberN, chosen ? 0.2 : 0.05).setOrigin(0)
        .setStrokeStyle(chosen ? 2 : 1, chosen ? C.amberN : C.emberN, chosen ? 1 : 0.35).setScrollFactor(0).setInteractive({ useHandCursor: true }).on('pointerdown', fn);
      const t = text(s, x + 16, y + h / 2, value, display
        ? { fontFamily: FONT.display, fontSize: '16px', color: chosen ? C.amber : C.cream, wordWrap: { width: w - 28 } }
        : { fontSize: '17px', color: placed ? C.muted : chosen ? C.amber : C.cream, lineSpacing: 2, wordWrap: { width: w - 60 } })
        .setOrigin(0, 0.5).setLetterSpacing(display ? 2 : 0);
      parts.push(box, t);
    };
    button(792, 36, 108, 44, 'PAUSE', this.pause);
    if (studying) {
      label(60, 76, this.def.source, 14, C.creamDim);
      label(60, 130, this.def.fragments.join('\n'), 25);
      button(60, 420, 470, 58, controls('[E]') + '   ▸', () => this.action('act'), true);
    } else {
      // the verse becomes slots: each placed line fills the next one, in order. A wrong order empties them with a red flash.
      const n = this.def.fragments.length, sw = (PW - 56) / n;
      for (let i = 0; i < n; i++) {
        const filled = i < this.selected.length, x = X + 28 + i * sw;
        parts.push(s.add.rectangle(x, 100, sw - 10, 78, filled ? C.amberN : C.creamN, filled ? 0.14 : 0.04).setOrigin(0).setStrokeStyle(filled ? 2 : 1, filled ? C.amberN : C.creamN, filled ? 0.9 : 0.25));
        parts.push(filled
          ? text(s, x + 10, 139, this.selected[i], { fontSize: '13px', color: C.cream, wordWrap: { width: sw - 30 } }).setOrigin(0, 0.5)
          : text(s, x + (sw - 10) / 2, 139, String(i + 1), { fontFamily: FONT.display, fontSize: '26px', color: C.creamDim }).setOrigin(0.5).setAlpha(0.35));
      }
      this.cards.forEach((word, i) => {
        const at = this.selected.indexOf(word), dead = word === this.drowned, cx = 60 + (i % 2) * 425, cy = 201 + Math.floor(i / 2) * 75;
        button(cx, cy, 412, 65, dead ? '▒▒▒▒▒▒▒▒▒▒▒▒' : word, () => this.pick(i), i === this.index, false, at >= 0);
        if (at >= 0) parts.push(text(s, cx + 390, cy + 32, String(at + 1), { fontFamily: FONT.display, fontSize: '22px', color: C.amber }).setOrigin(0.5));
      });
      button(60, 443, 200, 54, '↺   BKSP', () => this.action('back'));
      button(276, 443, 150, 54, '?   H', () => this.action('hint'));
      if (this.message) label(450, 456, this.message, 14, C.amber); // only an asked-for hint puts words here
    }
    if (this.bad) {
      this.bad = false;
      const flash = s.add.rectangle(0, 0, W, H, 0xc02818, 0.35).setOrigin(0).setScrollFactor(0).setDepth(1260);
      s.tweens.add({ targets: flash, alpha: 0, duration: 380, onComplete: () => flash.destroy() });
    }
    this.root = s.add.container(0, 0, parts).setScrollFactor(0, 0, true).setDepth(1250);
  }
  destroy() { this.root?.destroy(); this.root = undefined; }
}
