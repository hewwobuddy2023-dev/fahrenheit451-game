/** Small local preferences, deliberately separate from normal/demo game progress. */
export const settings = {
  muted: false,
  reducedMotion: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
};
try {
  const saved = JSON.parse(localStorage.getItem('f451.options') ?? 'null');
  if (typeof saved?.muted === 'boolean') settings.muted = saved.muted;
  if (typeof saved?.reducedMotion === 'boolean') settings.reducedMotion = saved.reducedMotion;
} catch { /* managed browsers may disable storage */ }

export function setSetting(key: keyof typeof settings, value: boolean) {
  settings[key] = value;
  try { localStorage.setItem('f451.options', JSON.stringify(settings)); } catch { /* preferences stay in memory */ }
}
