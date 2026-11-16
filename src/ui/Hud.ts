import Phaser from 'phaser';
import { C, FONT, W, H, text } from '../view.ts';
import { controls, isTouch, onInputMode } from '../input.ts';
import { keycap } from './Keycap.ts';

/** Objective note, journal chip, toasts and (on touch devices) on-screen buttons. */
export class Hud {
  touchLeft = false;
  touchRight = false;
  touchAct = false;
  touchDown = false;
  touchRun = false;
  private held = new Map<number, 'left' | 'right' | 'act' | 'down' | 'run'>();
  private diveUi?: Phaser.GameObjects.Container;
  private timer?: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private wantTouch = true;
  private lastObjective = '';
  private lastDone = 0;
  private rule: Phaser.GameObjects.Graphics;
  private chapter: Phaser.GameObjects.Text;
  private objective: Phaser.GameObjects.Text;
  private chipBg: Phaser.GameObjects.Graphics;
  private chipText: Phaser.GameObjects.Text;
  private chipKey: Phaser.GameObjects.Container;
  private chipHit: Phaser.GameObjects.Zone;
  private touchUi?: Phaser.GameObjects.Container;
  private toastRoot?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, chapter: string, opts: { demo: boolean; onJournal: () => void; onPause: () => void; onAct: () => void }) {
    this.scene = scene;
    // No panel: the objective is a plain note written on the page.
    this.rule = scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.chapter = text(scene, 34, 22, chapter, { fontSize: '13px', color: C.creamDim }).setScrollFactor(0).setDepth(1001).setShadow(0, 1, '#000000', 6, false, true);
    this.objective = text(scene, 34, 42, '', { fontFamily: FONT.type, fontSize: '17px', color: C.cream }).setScrollFactor(0).setDepth(1001)
      .setShadow(0, 1, '#000000', 6, false, true);

    this.chipBg = scene.add.graphics();
    this.chipText = text(scene, 0, 0, '', { fontSize: '14px', color: C.cream }).setOrigin(1, 0.5);
    this.chipKey = keycap(scene, 0, 0, 'J').c;
    this.chipHit = scene.add.zone(0, 0, 10, 10).setOrigin(0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', opts.onJournal);
    scene.add.container(0, 0, [this.chipBg, this.chipText, this.chipKey]).setScrollFactor(0).setDepth(1001);

    if (opts.demo) {
      text(scene, W - 24, 62, 'Chapter select, not saved', { fontSize: '12px', color: C.ember })
        .setOrigin(1, 0).setScrollFactor(0).setDepth(1001);
    }

    {
      const btn = (x: number, y: number, r: number, label: string) => {
        const c = scene.add.circle(x, y, r, 0x0d0a09, 0.55).setStrokeStyle(1.5, C.creamN, 0.45);
        // arrows are drawn shapes: the display font has no arrow glyphs
        const dir = label === '<' ? -1 : label === '>' ? 1 : 0;
        const t = dir
          ? (dir > 0 ? scene.add.triangle(x + 2, y, 0, 0, 0, 22, 16, 11, C.creamN, 0.9) : scene.add.triangle(x - 2, y, 16, 0, 16, 22, 0, 11, C.creamN, 0.9))
          : text(scene, x, y, label, { fontSize: '14px', fontStyle: '600' }).setOrigin(0.5);
        // Phaser's Container.setScrollFactor(..., true) skips inherited default
        // properties. Set this on each hit target explicitly or it drifts by cam.scrollX.
        c.setScrollFactor(0).setInteractive();
        return [c, t] as const;
      };
      const [l, lt] = btn(66, H - 62, 47, '<');
      const [r, rt] = btn(174, H - 62, 47, '>');
      const [a, at] = btn(W - 72, H - 66, 47, 'Act');
      const [p, pt] = btn(W - 46, 112, 32, 'II');
      const [d, dt] = btn(W - 184, H - 66, 47, 'Dive');
      const [u, ut] = btn(272, H - 62, 38, 'Run');
      const release = (p: Phaser.Input.Pointer) => { this.held.delete(p.id); this.syncTouch(); };
      for (const [obj, action] of [[l, 'left'], [r, 'right'], [a, 'act'], [d, 'down'], [u, 'run']] as const) {
        obj.on('pointerdown', (p: Phaser.Input.Pointer) => {
          this.held.set(p.id, action); this.syncTouch();
          if (action === 'act') opts.onAct();
        });
        obj.on('pointerout', release);
      }
      scene.input.on('pointerup', release);
      scene.input.on('pointerupoutside', release);
      const cancel = () => this.resetTouch();
      scene.game.canvas.addEventListener('touchcancel', cancel);
      scene.events.once('shutdown', () => {
        scene.input.off('pointerup', release);
        scene.input.off('pointerupoutside', release);
        scene.game.canvas.removeEventListener('touchcancel', cancel);
      });
      p.on('pointerdown', opts.onPause);
      this.diveUi = scene.add.container(0, 0, [d, dt]).setVisible(false);
      this.touchUi = scene.add.container(0, 0, [l, lt, r, rt, u, ut, a, at, p, pt, this.diveUi]).setScrollFactor(0, 0, true).setDepth(1001);
    }
    this.syncVisibility();
    const off = onInputMode(() => { this.syncVisibility(); this.setObjective(this.lastObjective, this.lastDone); });
    scene.events.once('shutdown', off);
  }

  /** Touch buttons show only in touch mode, and never while dialogue or menus own the screen. */
  private syncVisibility() {
    const on = this.wantTouch && isTouch();
    this.touchUi?.setVisible(on);
    if (!on) this.resetTouch();
  }

  /** Bottom edge of the objective note; the timer sits below it. */
  private noteBottom() { return this.objective.y + this.objective.height; }

  setObjective(s: string, done: number) {
    this.lastObjective = s; this.lastDone = done;
    this.objective.setText(controls(s));
    this.objective.setWordWrapWidth(W - 340);
    const y = this.noteBottom() + 5;
    this.rule.clear().lineStyle(1, C.emberN, 0.35).lineBetween(34, y, 34 + Math.min(this.objective.width, 260), y);
    this.layoutChip(done);
  }

  private layoutChip(done: number) {
    this.chipText.setText(`Journal ${done} of 15`);
    const right = W - 24, cy = 34, kw = 22;
    this.chipKey.setPosition(right - 12 - kw / 2, cy);
    this.chipText.setPosition(right - 12 - kw - 10, cy);
    const left = this.chipText.x - this.chipText.width - 14;
    this.chipBg.clear().fillStyle(C.panel, 0.7).fillRoundedRect(left, cy - 16, right - left, 32, 6);
    this.chipHit.setPosition(left, cy - 16).setSize(right - left, 32);
  }

  /** Quiet rooms: the objective steps aside while a conversation or cutscene owns the screen. */
  private focused = false;
  setFocus(on: boolean) {
    if (on === this.focused) return;
    this.focused = on;
    const parts = [this.rule, this.chapter, this.objective];
    this.scene.tweens.killTweensOf(parts);
    this.scene.tweens.add({ targets: parts, alpha: on ? 0 : 1, duration: on ? 160 : 320 });
  }

  /** Hide touch buttons while dialogue or menus own the screen, so they never overlap text. */
  showTouch(on: boolean) {
    this.wantTouch = on;
    this.syncVisibility();
  }

  showDive(on: boolean) { this.diveUi?.setVisible(on); }

  resetTouch() { this.held.clear(); this.syncTouch(); }

  private syncTouch() {
    const actions = new Set(this.held.values());
    this.touchLeft = actions.has('left'); this.touchRight = actions.has('right');
    this.touchAct = actions.has('act'); this.touchDown = actions.has('down'); this.touchRun = actions.has('run');
  }

  toast(title: string, sub: string) {
    this.toastRoot?.destroy();
    const s = this.scene;
    const t1 = text(s, W / 2, 104, title, { fontFamily: FONT.type, fontSize: '20px', color: C.amber }).setOrigin(0.5);
    const t2 = text(s, W / 2, 134, sub, { fontSize: '14px', color: C.creamDim }).setOrigin(0.5);
    const w = Math.max(t1.width, t2.width) + 80;
    const bg = s.add.graphics().fillStyle(C.panel, 0.9).fillRoundedRect(W / 2 - w / 2, 84, w, 70, 8)
      .fillStyle(C.emberN, 0.9).fillRect(W / 2 - w / 2, 96, 3, 46);
    const root = s.add.container(0, 0, [bg, t1, t2]).setScrollFactor(0, 0, true).setDepth(1150).setAlpha(0);
    this.toastRoot = root;
    s.tweens.chain({ targets: root, tweens: [
      { alpha: 1, duration: 300 }, { alpha: 1, duration: 2600 }, { alpha: 0, duration: 500, onComplete: () => root.destroy() },
    ] });
  }

  /** Countdown or meter readout under the objective note (text, so never colour-only). */
  setTimer(s: string | null) {
    if (s === null) { this.timer?.setVisible(false); return; }
    this.timer ??= text(this.scene, 34, 82, '', { fontSize: '15px', color: C.amber, backgroundColor: 'rgba(13,10,9,0.78)', padding: { x: 12, y: 5 } })
      .setScrollFactor(0).setDepth(1001);
    this.timer.setVisible(true).setText(s).setY(this.noteBottom() + 14);
  }

  note(s: string) {
    const t = text(this.scene, W - 24, 70, s, { fontSize: '12px', color: C.creamDim })
      .setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);
    this.scene.tweens.add({ targets: t, alpha: 0, delay: 1400, duration: 600, onComplete: () => t.destroy() });
  }
}
