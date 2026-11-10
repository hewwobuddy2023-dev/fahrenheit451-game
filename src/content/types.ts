// Content data shapes. Chapters are pure data built from these; the engine interprets them.
import type { SequenceDef } from '../ui/SequencePuzzle.ts';
import type { Flags } from '../state.ts';

export type Cond = (f: Flags) => boolean;

export interface Line { who: string; text: string }

export interface Choice {
  text: string;
  set?: Flags;
  reply?: Line[];
  again?: boolean;   // wrong answer: show reply, then offer the same choices again (sets nothing)
  next?: string;     // continue with another script (its lines, choices and set)
  when?: Cond;
}

export interface Script {
  puzzle?: SequenceDef;
  lines: Line[];
  choices?: Choice[];
  set?: Flags;
}

/** Cutscene steps, run in order by the room scene. */
export type Step =
  | { say: string }                                        // play a script
  | { walk: number; ms?: number }                          // move Montag to x
  | { npc: string; x?: number; face?: 1 | -1; show?: boolean; ms?: number }
  | { cam: number; ms?: number }                           // pan camera so x is centred
  | { follow: true }                                       // camera back on Montag
  | { wait: number }
  | { fade: 'out' | 'in'; ms?: number; color?: number }
  | { flash: number; ms?: number }
  | { fx: string }                                         // stage effect hook
  | { set: Flags }
  | { title: string; sub?: string }                        // in-world title over the scene
  | { still: number; label: string }                       // player must not move for ms
  | { prompt: string; ms: number; miss: string }           // press ACT within ms; retry until met
  | { goto: string; x?: number }                           // room transition (checkpoints)
  | { ending: true }                                       // to the end scene
  | { if: Cond; then: Step[]; else?: Step[] };

export interface Hotspot {
  id: string;
  x: number;
  label: string;
  py?: number;               // prompt height (default 300)
  when?: Cond;               // present only when true
  script?: string;
  doneFlag?: string;
  doneScript?: string;
  requires?: string[];
  lockedScript?: string;
  required?: boolean;        // glows on the floor while it is part of the objective
  hold?: { flag: string; ms: number; fx?: 'hose' | 'flame' | 'pull'; target?: number; pressure?: boolean };
  watcher?: string;          // T2: blocked while this npc is watching
  watchedScript?: string;
  auto?: boolean;            // triggers on arrival, no key press
  steps?: Step[];            // run after the script (or alone)
  exit?: { room: string; x?: number };
}

export interface Npc {
  id: string;
  fig: string;               // figure sheet key
  name: string;              // speaker name used in scripts (for camera framing)
  x: number;
  face?: 1 | -1;
  when?: Cond;
  watch?: { period: number; on: number; phase?: number }; // T2 watcher rhythm (ms)
  back?: boolean;            // stands deeper in the room (behind the walk line)
  follow?: Cond;             // walks alongside Montag while true
}

export interface Hazard {
  id: string;
  from: number; to: number;  // the beam patrols between these x positions
  width: number;
  period: number;            // ms for one full there-and-back
  phase?: number;            // 0..1
  pulse?: number;            // lane mode: dangerous only for this many ms per period (a car crossing, a door opening)
  look: 'beam' | 'headlights' | 'searchlight' | 'doorlight';
  dive?: boolean;            // holding DOWN keeps Montag hidden (river)
  reset: number;             // x Montag returns to when caught
  when?: Cond;
}

export interface Light { x: number; y: number; color: number; r: number }

export interface RoomDef {
  id: string;
  chapter: number;
  label: string;             // HUD chapter line
  width: number;
  spawnX: number;
  kit: string;               // painter key in art/kits.ts
  npcs?: Npc[];
  lights?: Light[];
  hazards?: Hazard[];
  timer?: { ms: number; reset: number; label: string; when?: Cond };
  limp?: boolean;            // slower movement (after the Hound's needle)
  dark?: Cond;               // night-time darkness overlay
  objective: (f: Flags) => string;
  hotspots: Hotspot[];
  enter?: { key: string; steps: Step[]; when?: Cond }[]; // each runs once (flag `key`)
}
