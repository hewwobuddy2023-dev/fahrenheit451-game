import Phaser from 'phaser';
import { sound } from '../audio.ts';
import { C, FONT, W, H, text } from '../view.ts';

export interface SequenceDef { title: string; source: string; fragments: string[]; distractions: string[]; interference?: boolean }
/** Untimed, source-first ordered reconstruction. No story flags live in this UI. */
export class SequencePuzzle {
  private root?: Phaser.GameObjects.Container;
  private phase: 'study' | 'assemble' = 'study';
  private selected: string[] = [];
  private cards: string[];
  private index = 0;
  private attempts = 0;
  private hintLevel = 0;
  private message = '';
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
  get state() { return { phase: this.phase, selected: [...this.selected], cards: [...this.cards], attempts: this.attempts }; }
  action(a: 'act' | 'up' | 'down' | 'back' | 'hint') {
    if (a === 'back') { this.phase = 'study'; this.selected = []; this.message = ''; }
    else if (a === 'hint') {
      this.message = ['Read the source as an ordered thought, not as separate answers.', 'Choose the next fragment after the last line you placed.', `Next: ${this.def.fragments[this.selected.length] ?? this.def.fragments[0]}`][Math.min(2, this.hintLevel++)];
    } else if (a === 'up' || a === 'down') this.index = (this.index + (a === 'up' ? -1 : 1) + this.cards.length) % this.cards.length;
    else if (this.phase === 'study') { this.phase = 'assemble'; this.selected = []; this.index = 0; }
    else return this.pick(this.index);
    this.draw();
  }
  private pick(i: number) {
    const word = this.cards[i];
    if (this.selected.includes(word)) { this.message = 'Already placed. Choose another fragment, or read the source again.'; this.draw(); return; }
    sound.cue('page'); this.selected.push(word); this.message = '';
    if (this.selected.length === this.def.fragments.length) {
      if (this.selected.every((word, i) => word === this.def.fragments[i])) { this.destroy(); sound.cue('complete'); this.done(); return; }
      this.attempts++; this.selected = []; this.message = 'The order slipped. Try again — or read the source. No earlier progress was lost.'; sound.cue('caught');
    }
    this.draw();
  }
  private draw() {
    this.root?.destroy();
    const s = this.scene, parts: Phaser.GameObjects.GameObject[] = [];
    const bg = s.add.graphics().fillStyle(0x04070a, 0.97).fillRoundedRect(32, 24, W - 64, H - 48, 12)
      .lineStyle(1, this.def.interference ? 0x7aa8ad : C.amberN, 0.7).strokeRoundedRect(32, 24, W - 64, H - 48, 12);
    parts.push(bg);
    const label = (x: number, y: number, value: string, size = 18, color = C.cream) => {
      const t = text(s, x, y, value, { fontSize: `${size}px`, color, wordWrap: { width: 830 }, lineSpacing: 5 });parts.push(t);return t;
    };
    label(60, 45, this.def.title.toUpperCase(), 24, C.amber).setFontFamily(FONT.display);
    label(60, 83, this.phase === 'study' ? this.def.source : `RECONSTRUCT ${this.selected.length}/${this.def.fragments.length}  ·  ${this.def.interference ? 'Let the advertising pass.' : 'Take your time.'}`, 15, C.creamDim);
    const button = (x: number, y: number, w: number, h: number, value: string, fn: () => void, chosen = false) => {
      const box = s.add.rectangle(x, y, w, h, chosen ? 0x35434a : 0x192126).setOrigin(0).setStrokeStyle(1, chosen ? C.amberN : 0x567078, 0.8).setScrollFactor(0).setInteractive({ useHandCursor: true }).on('pointerdown', fn);
      const t = text(s, x + 12, y + h / 2, value, { fontSize: '18px', color: C.cream, wordWrap: { width: w - 24 }, lineSpacing: 2 }).setOrigin(0, 0.5);
      parts.push(box, t);
    };
    button(792, 42, 108, 44, 'PAUSE', this.pause);
    if (this.phase === 'study') {
      label(65, 145, this.def.fragments.join('\n'), 23);
      label(65, 330, 'Study at your own pace. Then rebuild the order from memory.\nYou can read this again at any time. No timer.', 16, C.creamDim);
      button(245, 423, 470, 60, 'BEGIN RECALL  ·  E / ENTER / TAP', () => this.action('act'), true);
    } else {
      label(60, 116, this.selected.length ? this.selected.join(' / ') : 'Place four fragments in the order you studied.', 16);
      this.cards.forEach((word, i) => button(60 + (i % 2) * 425, 201 + Math.floor(i / 2) * 75, 412, 65, `${this.selected.includes(word) ? 'PLACED · ' : ''}${word}`, () => this.pick(i), i === this.index));
      button(60, 443, 320, 54, 'READ AGAIN  ·  BACKSPACE', () => this.action('back'));
      button(396, 443, 200, 54, 'HINT  ·  H', () => this.action('hint'));
      label(617, 456, '↑ / ↓ select\nE / Enter place', 13, C.creamDim);
      if (this.message) label(60, 158, this.message, 14, C.amber);
    }
    this.root = s.add.container(0, 0, parts).setScrollFactor(0, 0, true).setDepth(1250);
  }
  destroy() { this.root?.destroy(); this.root = undefined; }
}
