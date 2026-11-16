import Phaser from 'phaser';
import { isTouch } from '../input.ts';
import { sound } from '../audio.ts';
import { RULES } from '../content.ts';
import { completedIds, Session } from '../state.ts';
import { keyRow } from '../ui/Keycap.ts';
import { skylineKey } from '../ui/Skyline.ts';
import { addAtmosphere, C, FONT, H, W, onActions, setupCamera, text } from '../view.ts';

/** Each ending closes on one line in the voice of the character who says it. */
const ENDINGS: Record<string, { title: string; line: string }> = {
  preservation: { title: 'Preservation', line: '"Keep them safe. Someone has to remember how to read them." (Faber)' },
  defiance: { title: 'Defiance', line: '"I know the way back now. This time I know what I am carrying." (Montag)' },
  submission: { title: 'Submission', line: '"I kept it in my head, where nobody can reach it." (Montag)' },
};

/** Final card: the ending reached, its closing line and the journal count. */
export class EndScene extends Phaser.Scene {
  private session!: Session;
  constructor() { super('end'); }

  init(d: { session: Session }) { this.session = d.session; }

  create() {
    setupCamera(this);
    sound.useScene('end');
    sound.cue('ending');
    // closing image: the same night skyline, dimmed, with an open book over the horizon
    this.add.tileSprite(0, 0, W, H, skylineKey(this)).setOrigin(0).setAlpha(0.3);
    this.add.graphics().fillStyle(0x000000, 0.55).fillRect(0, 0, W, H);
    const book = this.add.graphics().setAlpha(0);
    const cx = W / 2, by = H / 2 + 104;
    book.fillStyle(0xece1c8, 0.85)
      .fillPoints([{ x: cx - 4, y: by + 2 }, { x: cx - 150, y: by - 6 }, { x: cx - 150, y: by + 38 }, { x: cx - 4, y: by + 46 }], true)
      .fillPoints([{ x: cx + 4, y: by + 2 }, { x: cx + 150, y: by - 6 }, { x: cx + 150, y: by + 38 }, { x: cx + 4, y: by + 46 }], true);
    book.fillStyle(C.emberN, 0.8).fillRect(cx - 1, by, 2, 46);
    this.tweens.add({ targets: book, alpha: 1, duration: 1600, delay: 600 });

    const e = ENDINGS[String(this.session.flags['c15.ending'])] ?? { title: 'The end', line: '' };
    const t = text(this, W / 2, H / 2 - 70, e.title, { fontFamily: FONT.type, fontSize: '40px' }).setOrigin(0.5).setAlpha(0);
    const n = text(this, W / 2, H / 2 - 16, e.line, { fontFamily: FONT.type, fontSize: '17px', color: C.creamDim, align: 'center', wordWrap: { width: 680 } }).setOrigin(0.5).setAlpha(0);
    const done = completedIds(RULES, this.session.flags).length;
    const foot = text(this, W / 2, H - 120, `Journal ${done} of 15${this.session.demo ? '  ·  chapter select' : ''}`, { fontSize: '13px', color: C.amber })
      .setOrigin(0.5).setAlpha(0);
    const touch = isTouch();
    const back = keyRow(this, W / 2 + 96, H - 84, touch ? [{ word: 'Tap to return to the title' }] : [{ key: 'E' }, { word: 'to return to the title' }]);
    this.tweens.add({ targets: [t, n], alpha: 1, duration: 1400 });
    // Replay from Granger's question; this run never writes the save
    const replay = keyRow(this, W / 2 + 96, H - 52, touch ? [{ word: 'Tap here to try another ending' }] : [{ key: 'R' }, { word: 'to try another ending' }], C.amber);
    replay.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(0));
    const replayHit = this.add.zone(W / 2, H - 52, 380, 44).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: [foot, ...back, ...replay], alpha: 1, duration: 800, delay: 1800 });
    addAtmosphere(this);
    let leaving = false;
    const shown = () => (back[0] as unknown as Phaser.GameObjects.Components.Alpha).alpha >= 1;
    const leave = () => {
      if (leaving || !shown()) return;
      leaving = true;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('menu'));
    };
    const explore = () => {
      if (leaving || !shown()) return;
      leaving = true;
      const flags = { ...this.session.flags };
      delete flags['c15.ending']; delete flags['c15.seen'];
      const session = new Session({ v: 1, room: 'camp', x: 1000, flags }, true);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('room', { session }));
    };
    onActions(this, (a) => { if (a === 'act') leave(); });
    this.input.keyboard?.on('keydown-R', explore);
    replayHit.on('pointerdown', explore);
    this.input.on('pointerdown', (_p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => { if (!over.includes(replayHit)) leave(); });
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
}
