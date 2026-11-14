import Phaser from 'phaser';
import { CHALLENGES, RULES } from '../content.ts';
import { completedIds, type Flags } from '../state.ts';
import { C, FONT, W, H, text } from '../view.ts';

/** Full-screen journal listing all 15 challenges. Completion is derived from flags, so it cannot drift. */
export function openJournal(scene: Phaser.Scene, flags: Flags, onClose: () => void): () => void {
  const done = new Set(completedIds(RULES, flags));
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.78).fillRect(0, 0, W, H);
  g.fillStyle(C.panel, 0.97).fillRect(40, 30, W - 80, H - 60);
  g.lineStyle(1, C.emberN, 0.5).strokeRect(40.5, 30.5, W - 81, H - 61);
  g.lineStyle(1, 0x3a2f29, 1).lineBetween(70, 92, W - 70, 92);
  const parts: Phaser.GameObjects.GameObject[] = [g];
  parts.push(
    text(scene, 70, 50, 'CASE JOURNAL', { fontFamily: FONT.type, fontSize: '28px' }),
    text(scene, W - 70, 66, `${done.size} / 15 COMPLETE`, { fontFamily: FONT.display, fontSize: '16px', color: C.amber })
      .setOrigin(1, 0.5).setLetterSpacing(3),
  );
  CHALLENGES.forEach((ch, i) => {
    const col = i < 8 ? 0 : 1;
    const x = 76 + col * 430;
    const y = 112 + (i % 8) * 46;
    const ok = done.has(ch.id);
    const mark = scene.add.graphics();
    if (ok) mark.fillStyle(C.emberN, 1).fillCircle(x + 6, y + 9, 6);
    else mark.lineStyle(1.5, 0x6f6457, 1).strokeCircle(x + 6, y + 9, 5.5);
    parts.push(
      mark,
      text(scene, x + 22, y, String(ch.id).padStart(2, '0'), { fontFamily: FONT.display, fontSize: '16px', color: ok ? C.amber : C.muted }),
      text(scene, x + 50, y, ch.title, { fontSize: '16px', fontStyle: '600', color: ok ? C.cream : C.creamDim }),
      text(scene, x + 50, y + 21, ok ? ch.connection : `Part ${ch.part}  ·  not yet completed`, {
        fontSize: '12px', color: ok ? C.creamDim : C.muted, wordWrap: { width: 360 },
      }),
    );
  });
  parts.push(text(scene, W / 2, H - 50, 'J / ESC / TAP TO CLOSE', { fontFamily: FONT.display, fontSize: '12px', color: C.muted })
    .setOrigin(0.5).setLetterSpacing(3));
  // The close zone lives outside the fading container: Phaser skips hit tests on objects that do not
  // render yet, so a quick tap during the 150 ms fade-in (long on slow devices) was silently lost.
  const hit = scene.add.zone(0, 0, W, H).setOrigin(0).setScrollFactor(0).setDepth(1301).setInteractive();
  const root = scene.add.container(0, 0, parts).setScrollFactor(0, 0, true).setDepth(1300).setAlpha(0);
  scene.tweens.add({ targets: root, alpha: 1, duration: 150 });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    root.destroy(); hit.destroy();
    onClose();
  };
  hit.on('pointerdown', close);
  return close;
}
