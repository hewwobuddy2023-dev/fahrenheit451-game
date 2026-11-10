// Pure game state: save schema, checkpoints and challenge rules. No Phaser here so Node can test it.

export type Flags = Record<string, boolean | string>;

export interface SaveData {
  v: 1;
  room: string;
  x: number;
  flags: Flags;
}

export const SAVE_KEY = 'f451.save';
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Returns null for missing, unparsable, wrong-version or malformed saves. Never throws. */
export function loadSave(store?: Store): SaveData | null {
  try {
    const raw = (store ?? localStorage).getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const ok =
      d && d.v === 1 && typeof d.room === 'string' && Number.isFinite(d.x) &&
      d.flags && typeof d.flags === 'object' && !Array.isArray(d.flags) &&
      Object.values(d.flags).every((f) => typeof f === 'boolean' || typeof f === 'string');
    return ok ? { v: 1, room: d.room, x: d.x, flags: d.flags } : null;
  } catch {
    return null;
  }
}

/** Storage can be full or blocked (private mode, managed devices); the game keeps running either way. */
export function writeSave(data: SaveData, store?: Store): boolean {
  try {
    (store ?? localStorage).setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(store?: Store): void {
  try { (store ?? localStorage).removeItem(SAVE_KEY); } catch { /* storage blocked: nothing to clear */ }
}

/** A challenge is complete when every flag it requires is set. Completion is always derived, never stored. */
export interface ChallengeRule { id: number; required: string[] }

export function isComplete(rule: ChallengeRule, flags: Flags): boolean {
  return rule.required.every((f) => !!flags[f]);
}

export function completedIds(rules: ChallengeRule[], flags: Flags): number[] {
  return rules.filter((r) => isComplete(r, flags)).map((r) => r.id);
}

/** Live session. Demo sessions never touch storage, so Presentation Mode cannot fake real progress. */
export class Session {
  room: string;
  x: number;
  flags: Flags;
  demo: boolean;
  private store: Store | undefined;

  constructor(data: SaveData, demo = false, store?: Store) {
    this.room = data.room;
    this.x = data.x;
    this.flags = { ...data.flags };
    this.demo = demo;
    this.store = store;
  }

  set(changes: Flags): void {
    Object.assign(this.flags, changes);
  }

  checkpoint(room: string, x: number): boolean {
    this.room = room;
    this.x = Math.round(x);
    if (this.demo) return true;
    return writeSave({ v: 1, room, x: this.x, flags: { ...this.flags } }, this.store);
  }
}
