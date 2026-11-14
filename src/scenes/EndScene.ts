import Phaser from 'phaser';
import { controls, isTouch } from '../input.ts';
import { sound } from '../audio.ts';
import { RULES } from '../content.ts';
import { completedIds, Session } from '../state.ts';
import { addAtmosphere, C, FONT, H, W, onActions, setupCamera, text } from '../view.ts';

const ENDINGS: Record<string, { title: string; note: string }> = {
  preservation: { title: 'PRESERVATION', note: 'Closest to the novel: Montag stays with the book people and remembers.' },
  defiance: { title: 'DEFIANCE', note: 'An adaptation. In the novel, Montag stays with the book people.' },
  submission: { title: 'SUBMISSION', note: 'An adaptation. In the novel, Montag stays with the book people.' },
};

/** Final card: which ending was reached, whether it follows the novel, and the journal count. */
export class EndScene extends Phaser.Scene {
  private session!: Session;
  constructor() { super('end'); }

  init(d: { session: Session }) { this.session = d.session; }

  create() {
    setupCamera(this);
    sound.useScene('end');
    sound.cue('ending');
    const e = ENDINGS[String(this.session.flags['c15.ending'])] ?? { title: 'THE END', note: '' };
    const t = text(this, W / 2, H / 2 - 60, e.title, { fontFamily: FONT.type, fontSize: '44px' }).setOrigin(0.5).setLetterSpacing(6).setAlpha(0);
    const n = text(this, W / 2, H / 2 + 4, e.note, { fontSize: '17px', color: C.creamDim, align: 'center', wordWrap: { width: 640 } }).setOrigin(0.5).setAlpha(0);
    const done = completedIds(RULES, this.session.flags).length;
    const foot = text(this, W / 2, H - 120, `JOURNAL ${done}/15${this.session.demo ? '  ·  PRESENTATION MODE' : ''}`, { fontFamily: FONT.display, fontSize: '13px', color: C.amber })
      .setOrigin(0.5).setLetterSpacing(4).setAlpha(0);
    const back = text(this, W / 2, H - 84, controls('PRESS [E] TO RETURN TO THE TITLE'), { fontFamily: FONT.display, fontSize: '11px', color: C.muted })
      .setOrigin(0.5).setLetterSpacing(3).setAlpha(0);
    this.tweens.add({ targets: [t, n], alpha: 1, duration: 1400 });
    // Explore other outcomes: back to Granger's question in a Presentation Mode session that never writes the save
    const replay = text(this, W / 2, H - 56, isTouch() ? 'TAP HERE TO EXPLORE THE OTHER ENDINGS (NOT SAVED)' : 'PRESS R TO EXPLORE THE OTHER ENDINGS (NOT SAVED)',
      { fontFamily: FONT.display, fontSize: '11px', color: C.amber }).setOrigin(0.5).setLetterSpacing(3).setAlpha(0).setInteractive();
    this.tweens.add({ targets: [foot, back, replay], alpha: 1, duration: 800, delay: 1800 });
    addAtmosphere(this);
    let leaving = false;
    const leave = () => {
      if (leaving || back.alpha < 1) return;
      leaving = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('menu'));
    };
    const explore = () => {
      if (leaving || replay.alpha < 1) return;
      leaving = true;
      const flags = { ...this.session.flags };
      delete flags['c15.ending']; delete flags['c15.seen'];
      const session = new Session({ v: 1, room: 'camp', x: 1000, flags }, true);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('room', { session }));
    };
    onActions(this, (a) => { if (a === 'act') leave(); });
    this.input.keyboard?.on('keydown-R', explore);
    replay.on('pointerdown', explore);
    this.input.on('pointerdown', (_p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => { if (!over.includes(replay)) leave(); });
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
