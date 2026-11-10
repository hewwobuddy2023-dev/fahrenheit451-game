import type Phaser from 'phaser';

/** Freeze the complete scene, including scripted waits, until an explicit return gesture. */
export function guardFocus(game: Phaser.Game) {
  let paused: string[] = [];
  let panel: HTMLDivElement | undefined;
  const resume = () => {
    if (!panel || document.hidden) return;
    panel.remove(); panel = undefined;
    for (const key of paused) if (game.scene.isPaused(key)) game.scene.resume(key);
    paused = [];
    game.canvas.focus({ preventScroll: true });
  };
  const freeze = () => {
    if (panel || !game.isBooted) return;
    paused = game.scene.getScenes(true).map(s => s.sys.settings.key);
    if (!paused.length) return;
    for (const key of paused) game.scene.pause(key);
    panel = document.createElement('div');
    panel.id = 'focus-guard';
    panel.style.cssText = 'position:fixed;inset:0;z-index:80;background:#080706dd;display:grid;place-items:center';
    const button = document.createElement('button');
    button.id = 'focus-resume';
    button.textContent = 'Game paused · Tap or press Enter to return';
    button.style.cssText = 'max-width:85vw;padding:24px;border:1px solid #e8682e;background:#0d0a09;color:#ece1c8;font:18px/1.5 system-ui;cursor:pointer';
    button.addEventListener('click', resume);
    panel.append(button); document.body.append(panel);
  };
  const visibility = () => { if (document.hidden) freeze(); };
  const key = (e: KeyboardEvent) => {
    if (panel && ['Enter', 'Space', 'Escape', 'KeyE'].includes(e.code)) {
      e.preventDefault(); e.stopImmediatePropagation(); resume();
    }
  };
  game.canvas.tabIndex = 0;
  game.canvas.setAttribute('aria-label', 'Fahrenheit 451 game. Move with A and D, interact with E, journal J, pause Escape.');
  game.events.on('blur', freeze);
  game.events.on('hidden', freeze);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('keydown', key, true);
  game.events.once('destroy', () => {
    panel?.remove(); document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('keydown', key, true);
  });
}
