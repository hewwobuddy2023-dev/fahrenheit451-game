// Input mode: which controls the player is actually using. Decided by real input events, not by
// whether the device *could* take touch (Windows desktops and laptops often report touch support).
import { settings, setSetting } from './settings.ts';

export type InputMode = 'keyboard' | 'touch';

function guess(): InputMode {
  if (typeof matchMedia === 'function') return matchMedia('(pointer: coarse)').matches && !matchMedia('(any-hover: hover)').matches ? 'touch' : 'keyboard';
  return (navigator.maxTouchPoints ?? 0) > 0 ? 'touch' : 'keyboard'; // no media queries (old browsers, tests)
}

let detected: InputMode = guess();
const listeners = new Set<() => void>();

export const inputMode = (): InputMode => (settings.inputMode === 'auto' ? detected : settings.inputMode);
export const isTouch = () => inputMode() === 'touch';

/** Subscribe to input-mode changes; returns an unsubscribe function. */
export function onInputMode(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

function use(m: InputMode) {
  const before = inputMode();
  detected = m;
  if (inputMode() !== before) listeners.forEach((f) => f());
}

export function setInputPreference(p: 'auto' | 'keyboard' | 'touch') {
  const before = inputMode();
  setSetting('inputMode', p);
  if (inputMode() !== before) listeners.forEach((f) => f());
}

let installed = false;
/** Capture-phase listeners run before Phaser handles the same event, so HUD visibility is already right. */
export function installInputMode() {
  if (installed) return;
  installed = true;
  const opts = { capture: true, passive: true };
  window.addEventListener('touchstart', () => use('touch'), opts);
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') use('touch'); else if (e.pointerType === 'mouse') use('keyboard'); }, opts);
  window.addEventListener('keydown', (e) => { if (!e.repeat) use('keyboard'); }, opts);
}

/**
 * Replace control tokens with the active control's name. Content writes `[E]` and `[DOWN]`;
 * nothing else in the game should spell out a control.
 */
export function controls(s: string, mode: InputMode = inputMode()): string {
  const touch = mode === 'touch';
  return s
    .replace(/\bPress \[E\]/g, touch ? 'Tap ACT' : 'Press E')
    .replace(/\bPRESS \[E\]/g, touch ? 'TAP ACT' : 'PRESS E')
    .replace(/\[E\]/g, touch ? 'ACT' : 'E')
    .replace(/\[DOWN\]/g, touch ? 'DIVE' : 'S / DOWN')
    .replace(/\[SHIFT\]/g, touch ? 'RUN' : 'SHIFT')
    .replace(/\[SPACE\]/g, touch ? 'VAULT' : 'SPACE');
}
