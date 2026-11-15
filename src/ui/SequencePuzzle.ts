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
      this.attempts++; this.selected = []; this.message = 'The order slipped. Try again, or read the source. No earlier progress was lost.'; sound.cue('caught');
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
    // the phase tag says what to do now: read first, then recall from memory
    parts.push(text(s, 60, 74, studying ? 'STUDY  ·  READ THE VERSE' : 'RECALL  ·  FROM MEMORY',
      { fontFamily: FONT.display, fontSize: '13px', color: C.ember, backgroundColor: '#1a1210', padding: { x: 10, y: 5 } }).setLetterSpacing(3));
    label(60, 108, studying ? this.def.source : this.def.interference ? 'Let the advertising pass. Nothing is timed.' : 'Nothing is timed. Take your time.', 15, C.creamDim);
    const button = (x: number, y: number, w: number, h: number, value: string, fn: () => void, chosen = false, display = true, placed = false) => {
      const box = s.add.rectangle(x, y, w, h, C.emberN, chosen ? 0.2 : 0.05).setOrigin(0)
        .setStrokeStyle(1, C.emberN, chosen ? 0.9 : 0.35).setScrollFactor(0).setInteractive({ useHandCursor: true }).on('pointerdown', fn);
      const shown = display ? value : (chosen ? '›  ' : '   ') + value;
      const t = text(s, x + 14, y + h / 2, shown, display
        ? { fontFamily: FONT.display, fontSize: '16px', color: chosen ? C.amber : C.cream, wordWrap: { width: w - 28 } }
        : { fontSize: '17px', color: placed ? C.muted : chosen ? C.amber : C.cream, lineSpacing: 2, wordWrap: { width: w - 28 } })
        .setOrigin(0, 0.5).setLetterSpacing(display ? 2 : 0);
      parts.push(box, t);
    };
    button(792, 36, 108, 44, 'PAUSE', this.pause);
    if (studying) {
      label(60, 150, this.def.fragments.join('\n'), 23);
      label(60, 330, 'Read the passage as one thought. You can come back to it at any time.', 16, C.creamDim);
      button(60, 420, 470, 58, controls('BEGIN RECALL  ·  PRESS [E]'), () => this.action('act'), true);
    } else {
      label(60, 142, `${this.selected.length} of ${this.def.fragments.length} placed`, 18, C.amber);
      if (this.message) label(60, 170, this.message, 14, C.amber);
      this.cards.forEach((word, i) => button(60 + (i % 2) * 425, 201 + Math.floor(i / 2) * 75, 412, 65,
        `${this.selected.includes(word) ? 'PLACED · ' : ''}${word}`, () => this.pick(i), i === this.index, false, this.selected.includes(word)));
      button(60, 443, 320, 54, 'READ AGAIN  ·  BACKSPACE', () => this.action('back'));
      button(396, 443, 200, 54, 'HINT  ·  H', () => this.action('hint'));
      label(617, 456, '↑ / ↓ select\nE / Enter place', 13, C.creamDim);
    }
    this.root = s.add.container(0, 0, parts).setScrollFactor(0, 0, true).setDepth(1250);
  }
  destroy() { this.root?.destroy(); this.root = undefined; }
}
