import type Phaser from 'phaser';
import { sound } from './audio.ts';

/** Opt-in, on-device diagnostics. Bounded in memory; never sent or stored. No save contents. */
export function diagnostics(enabled: boolean) {
  if (!enabled) return { attach: (_game: Phaser.Game) => {} };
  const panel = document.createElement('pre');
  panel.id = 'diagnostics';
  panel.setAttribute('aria-live', 'off');
  panel.style.cssText = 'position:fixed;left:4px;top:4px;z-index:100;max-width:94vw;max-height:38vh;overflow:hidden;margin:0;padding:6px;background:#080808ed;color:#eee1c8;font:11px/1.35 monospace;pointer-events:none;white-space:pre-wrap';
  document.body.append(panel);
  const events: Record<string, number> = {};
  const errors: string[] = [];
  let game: Phaser.Game | undefined;
  let last = 'none', phaser = 0;
  const record = (e: Event) => {
    events[e.type] = (events[e.type] ?? 0) + 1;
    const p = e as PointerEvent;
    const t = (e as TouchEvent).changedTouches?.[0];
    last = `${e.type} ${Math.round(t?.clientX ?? p.clientX ?? 0)},${Math.round(t?.clientY ?? p.clientY ?? 0)} on ${(e.target as Element)?.tagName ?? '?'}`;
  };
  const types = ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel', 'mousedown'];
  for (const type of types) document.addEventListener(type, record, { capture: true, passive: true });
  const error = (message: string) => { errors.push(message.replace(/https?:\/\/\S+/g, '[url]').slice(0, 180)); if (errors.length > 4) errors.shift(); };
  window.addEventListener('error', (e) => error(e.message));
  window.addEventListener('unhandledrejection', (e) => error(String(e.reason?.message ?? e.reason)));
  const draw = () => {
    const canvas = game?.canvas, r = canvas?.getBoundingClientRect();
    const scenes = game?.scene.getScenes(true) ?? [];
    const pointer = game?.input.activePointer;
    panel.textContent = [
      `F451 DIAGNOSTICS — local only | ${game?.isBooted ? 'booted' : 'loading fonts / engine'}`,
      `viewport ${innerWidth}×${innerHeight} | visual ${Math.round(window.visualViewport?.width ?? innerWidth)}×${Math.round(window.visualViewport?.height ?? innerHeight)} | DPR ${devicePixelRatio}`,
      `orientation ${innerWidth > innerHeight ? 'landscape' : 'portrait'} | visibility ${document.visibilityState}`,
      `canvas ${canvas?.width ?? 0}×${canvas?.height ?? 0} | CSS ${r ? `${r.width.toFixed(1)}×${r.height.toFixed(1)} @ ${r.left.toFixed(1)},${r.top.toFixed(1)}` : 'none'}`,
      `renderer ${game?.renderer?.type ?? 'pending'} | scale ${game?.scale.displayScale.x.toFixed(3) ?? '?'} | FPS ${game?.loop.actualFps.toFixed(0) ?? '?'}`,
      `scene ${scenes.map(s => `${s.sys.settings.key} input:${s.input.enabled}`).join(', ') || 'none'} | manager ${game?.input.enabled ?? '?'}`,
      `Phaser downs ${phaser} | pointer ${pointer ? `${pointer.x.toFixed(0)},${pointer.y.toFixed(0)} down:${pointer.isDown}` : 'none'} | touch ${game?.device.input.touch ?? '?'}`,
      `DOM ${JSON.stringify(events)}\nlast ${last}`,
      `audio ${sound.status.state} | muted ${sound.status.muted} | voices ${sound.status.voices}`,
      ...errors.map(e => `ERROR ${e}`),
    ].join('\n');
  };
  draw();
  const timer = window.setInterval(draw, 400);
  return { attach(g: Phaser.Game) {
    game = g;
    g.events.on('ready', () => {
      g.scene.scenes.forEach(s => s.sys.events.on('start', () => {
        s.input.on('pointerdown', () => { phaser++; });
      }));
    });
    g.events.once('destroy', () => {
      clearInterval(timer); panel.remove();
      for (const type of types) document.removeEventListener(type, record, true);
    });
  } };
}
