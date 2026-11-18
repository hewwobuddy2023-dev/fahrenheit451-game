// Content data shapes. Chapters are pure data built from these; the engine interprets them.
import type { SequenceDef } from '../ui/SequencePuzzle.ts';
import type { Flags } from '../state.ts';

export type Cond = (f: Flags) => boolean;

/** pose: a held gesture (art/figures.ts POSES) for this line; by: who performs it (npc id or 'montag'; default the speaker, or Montag for narration). */
export interface Line { who: string; text: string; pose?: string; by?: string }

export interface Choice {
  text: string;
  set?: Flags;
  reply?: Line[];
  again?: boolean;   // wrong answer: show reply, then offer the same choices again (sets nothing)
  next?: string;     // continue with another script (its lines, choices and set)
  when?: Cond;
  remember?: string;
  suspicion?: number; // with Script.suspicion: a wrong answer raises a visible meter by this much (1 or 2) instead of a free retry  // who will remember: shown only when a later scene reads this choice's flag (tests/callbacks.test.ts)
}

export interface Script {
  puzzle?: SequenceDef;
  lines: Line[];
  choices?: Choice[];
  set?: Flags;
  /** Cinematic framing: show this script's panel near the top so the speakers below stay in view. */
  top?: boolean;
  /** Set pieces: while the letterbox bars are closed, lines play as subtitles inside the bottom bar (nothing in frame is covered). */
  sub?: boolean;
  /** A watched conversation: it starts at 1 of 3. At 3 the `caught` beats play (lines, or scene steps between them) and the player restarts the first choice at 1. */
  suspicion?: { label: string; caught: (Line | { steps: Step[] })[] };
}

/** Cutscene steps, run in order by the room scene. */
export type Step =
  | { say: string }                                        // play a script
  | { walk: number; ms?: number }                          // move Montag to x
  | { npc: string; x?: number; face?: 1 | -1; show?: boolean; ms?: number }
  | { pose: string; p?: string }                           // npc id or 'montag' holds a gesture; no p = back to rest
  | { cam: number; ms?: number }                           // pan camera so x is centred
  | { follow: true }                                       // camera back on Montag
  | { wait: number }
  | { fade: 'out' | 'in'; ms?: number; color?: number }
  | { flash: number; ms?: number }
  | { fx: string }                                         // stage effect hook
  | { set: Flags }
  | { title: string; sub?: string }                        // in-world title over the scene
  | { still: number; label: string }                       // player must not move for ms
  | { prompt: string; ms: number; miss: string; strike?: string } // press ACT within ms; retry until met. Every 2nd miss plays `strike` (a needle hit, fade, retry) and the window shrinks by 200 ms (floor 1300)
  | { goto: string; x?: number }                           // room transition (checkpoints)
  | { ending: true }                                       // to the end scene
  | { if: Cond; then: Step[]; else?: Step[] };

export interface Hotspot {
  id: string;
  x: number;
  span?: [number, number];   // a wide prop (a pile, a row): in reach anywhere between these x; x is only its centre
  label: string;
  py?: number;               // prompt height (default 300)
  when?: Cond;               // present only when true
  script?: string;
  doneFlag?: string;
  doneScript?: string;
  requires?: string[];
  lockedScript?: string;
  required?: boolean;        // glows on the floor while it is part of the objective
  hold?: { flag: string; ms: number; fx?: 'hose' | 'flame' | 'pull'; target?: number; pressure?: boolean;
    sweep?: [number, number]; // the spray travels from one x to the other as the hold fills
    also?: Flags;            // extra flags set when the hold completes
    carry?: { x: number; y: number }; // a book travels from this point into Montag's hands and under his coat as the hold fills
  };
  watcher?: string;          // T2: blocked while this npc is watching
  watchedScript?: string;
  auto?: boolean;            // triggers on arrival, no key press
  steps?: Step[];            // run after the script (or alone)
  exit?: { room: string; x?: number };
  door?: boolean;            // the exit is a door: Montag walks to it and goes through (a knock of the latch) instead of cutting away
  vault?: boolean;           // a low obstacle: blocks walking; E / Space / VAULT hops over it
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
  scale?: number;            // overrides the figure's drawn size (default 1, or 0.9 for `back`)
  follow?: Cond;             // walks alongside Montag while true
  distracted?: Cond;         // faces away from Montag (towards the screens) even while answering
  pose?: (f: Flags) => string | undefined; // resting pose (e.g. seated) instead of standing idle
  gesture?: { p: string; every: number };  // small repeated action (dealing cards) while idle
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
  fail?: Step[];             // a short scene between the light snapping on and the fade (played for the first two catches in a visit)
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
  timer?: { ms: number; reset: number; label: string; when?: Cond; fail?: Step[] };
  /** Where Montag may walk while the player has control (a stair-split room: hall below, attic above). */
  walk?: (f: Flags) => [number, number];
  limp?: boolean;            // slower movement (after the Hound's needle)
  dark?: Cond;               // night-time darkness overlay
  objective: (f: Flags) => string;
  hotspots: Hotspot[];
  enter?: { key: string; steps: Step[]; when?: Cond }[]; // each runs once (flag `key`)
  /** Rooms with the quiet UI: no permanent control ribbon, quiet progress notes, a small hint pill. */
  quietUi?: boolean;
  /** Escalating hints for the current state: a nudge, then the precise target, then direct guidance. */
  hints?: (f: Flags) => [string, string, string];
  /** Short in-world lines spoken as the player passes; they never stop movement. */
  barks?: Bark[];
  /** Line shown on the chapter card when this room ends a chapter (instead of the journal count). */
  coda?: string;
  /** Loose furniture the kit does not draw (a bedside chair): an existing texture placed behind the actors. */
  props?: { tex: string; x: number; y: number; depth?: number; tint?: number }[];
}

export interface Bark { x: number; who: string; text: string; when?: Cond; cue?: string; fx?: string; range?: number }
