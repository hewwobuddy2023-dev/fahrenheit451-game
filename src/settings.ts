/** Small local preferences, deliberately separate from normal/demo game progress. */
export const settings = {
  muted: false,
  volume: 0.75,
  assistedHose: false,
  analog: true,
  reducedMotion: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
};
try {
  const saved = JSON.parse(localStorage.getItem('f451.options') ?? 'null');
  if (typeof saved?.volume === 'number' && Number.isFinite(saved.volume)) settings.volume = Math.max(0, Math.min(1, saved.volume));
  for (const key of ['assistedHose', 'analog'] as const) if (typeof saved?.[key] === 'boolean') settings[key] = saved[key];
  if (typeof saved?.muted === 'boolean') settings.muted = saved.muted;
  if (typeof saved?.reducedMotion === 'boolean') settings.reducedMotion = saved.reducedMotion;
} catch { /* managed browsers may disable storage */ }

export function setSetting<T extends keyof typeof settings>(key: T, value: typeof settings[T]) {
  settings[key] = value;
  try { localStorage.setItem('f451.options', JSON.stringify(settings)); } catch { /* preferences stay in memory */ }
}
