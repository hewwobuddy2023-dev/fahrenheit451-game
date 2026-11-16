import Phaser from 'phaser';
import { CHALLENGES, RULES } from '../content.ts';
import { completedIds, type Flags } from '../state.ts';
import { FONT, W, H, text } from '../view.ts';
import { isTouch } from '../input.ts';
import { keyRow } from './Keycap.ts';

/** Montag's own words for each challenge, written once he has done it. Shown only after completion. */
const ENTRIES: Record<number, string> = {
  1: 'I burned a house of books, and I enjoyed it.',
  2: 'Clarisse asked if I was happy. I did not know.',
  3: 'Mildred lives behind the walls. She does not hear me.',
  4: 'She stayed with her books. I took one.',
  5: 'Beatty says people stopped reading. I wish he were wrong.',
  6: 'I showed Mildred what I had been hiding.',
  7: 'I called Faber. He was afraid, then he listened.',
  8: 'On the subway I tried to keep what I read. Most of it leaked.',
  9: 'I read the poem aloud. Their faces changed.',
  10: 'I must burn my own house before they come for it.',
  11: 'I ran across the lit road with nowhere to hide.',
  12: 'They counted to ten and I was still breathing.',
  13: 'The river took me. For once I let it.',
  14: 'Granger keeps books alive by memory. Now so do I.',
  15: 'The war is coming. I have to choose what to carry.',
};

const INK = '#2a221c', FAINT = '#8a7b64', RULE = 0xb9ab8a;

/** Full-screen notebook listing all 15 challenges. Completion is derived from flags, so it cannot drift. */
export function openJournal(scene: Phaser.Scene, flags: Flags, onClose: () => void): () => void {
  const done = new Set(completedIds(RULES, flags));
  const px = 110, py = 30, pw = W - 220, ph = H - 60;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.78).fillRect(0, 0, W, H);
  // paper: a slight drop shadow, cream sheet, faint ruled lines and a red margin
  g.fillStyle(0x000000, 0.5).fillRect(px + 6, py + 6, pw, ph);
  g.fillStyle(0xe8dcc0, 1).fillRect(px, py, pw, ph);
  g.lineStyle(1, RULE, 0.55);
  for (let y = py + 58; y < py + ph - 26; y += 26) g.lineBetween(px + 14, y + 0.5, px + pw - 14, y + 0.5);
  g.lineStyle(1, 0xc2665a, 0.5).lineBetween(px + 84, py + 12, px + 84, py + ph - 12);
  const parts: Phaser.GameObjects.GameObject[] = [g];
  parts.push(
    text(scene, px + 110, py + 26, "Montag's notebook", { fontFamily: FONT.type, fontSize: '22px', color: INK }),
    text(scene, px + pw - 40, py + 34, `${done.size} of 15 entries`, { fontFamily: FONT.type, fontSize: '13px', color: FAINT })
      .setOrigin(1, 0.5),
  );
  CHALLENGES.forEach((ch, i) => {
    const y = py + 66 + i * 26;
    const ok = done.has(ch.id);
    parts.push(
      text(scene, px + 36, y, String(ch.id).padStart(2, '0'), { fontFamily: FONT.type, fontSize: '13px', color: ok ? INK : FAINT }).setOrigin(0, 0.5),
      text(scene, px + 110, y, ch.title, { fontFamily: FONT.type, fontSize: '13px', color: ok ? INK : FAINT }).setOrigin(0, 0.5),
    );
    // an unwritten entry is a dotted line; a written one is Montag's own sentence
    parts.push(
      ok
        ? text(scene, px + 300, y, ENTRIES[ch.id], { fontFamily: FONT.type, fontSize: '13px', color: INK }).setOrigin(0, 0.5)
        : text(scene, px + 300, y, '. . . . . . . . . . . . . . . . . . . . . . . . . .', { fontFamily: FONT.type, fontSize: '13px', color: FAINT }).setOrigin(0, 0.5),
    );
  });
  // Closing hint sits under the paper, not on it.
  parts.push(...keyRow(scene, W / 2 + 90, H - 14, isTouch() ? [{ word: 'Tap to close' }] : [{ key: 'J' }, { key: 'Esc' }, { word: 'to close' }]));
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
