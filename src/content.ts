// Game content as data. M2 adds rooms, scripts and rules here; engine code should not need to change.
import type { ChallengeRule, Flags } from './state.ts';

export interface ChallengeInfo { id: number; title: string; part: 1 | 2 | 3; connection: string }

/** Journal entries for all 15 mandatory challenges (CHALLENGES.md is authoritative). */
export const CHALLENGES: ChallengeInfo[] = [
  { id: 1, title: "Fireman's Duty", part: 1, connection: 'Montag works as a fireman whose job is burning books.' },
  { id: 2, title: "Clarisse's Question", part: 1, connection: 'Clarisse asks Montag whether he is happy.' },
  { id: 3, title: 'Parlor Walls', part: 1, connection: 'Mildred lives through the parlor-wall screens.' },
  { id: 4, title: "The Woman's House", part: 1, connection: 'The old woman refuses to leave her books.' },
  { id: 5, title: 'The Hidden Books', part: 1, connection: 'Montag secretly keeps books at home.' },
  { id: 6, title: "Beatty's Argument", part: 1, connection: 'Beatty explains how censorship grew from conformity.' },
  { id: 7, title: 'Find Faber', part: 2, connection: 'Montag seeks the retired professor Faber.' },
  { id: 8, title: 'The Sieve and the Sand', part: 2, connection: 'Montag struggles to hold onto meaning amid distraction.' },
  { id: 9, title: 'Poetry and Consequences', part: 2, connection: "Montag reads poetry to Mildred's friends." },
  { id: 10, title: "At Montag's House", part: 3, connection: "The firemen are called to Montag's own house." },
  { id: 11, title: 'Break with Authority', part: 3, connection: 'Montag breaks with the firemen and flees.' },
  { id: 12, title: 'Mechanical Hound', part: 3, connection: 'The Mechanical Hound hunts Montag.' },
  { id: 13, title: 'Leaving the City', part: 3, connection: 'Montag escapes by the river into the country.' },
  { id: 14, title: 'The Book People', part: 3, connection: "Granger's group preserves books by memory." },
  { id: 15, title: "The Fireman's Choice", part: 3, connection: 'Montag decides how to answer censorship.' },
];

/** Completion rules. Only challenges that exist in the build have a rule. */
export const RULES: ChallengeRule[] = [
  { id: 1, required: ['c01.rack', 'c01.pump', 'c01.ack'] },
];

export interface Line { who: string; text: string }
export interface Choice { text: string; set: Flags; reply?: Line[] }
export interface Script { lines: Line[]; choices?: Choice[]; set?: Flags; fx?: 'houndGrowl' | 'alarm' }

export interface Hotspot {
  id: string;
  x: number;
  label: string;          // prompt verb, e.g. "Inspect equipment rack"
  script: string;
  required?: boolean;     // marks it as part of the objective
  doneFlag?: string;      // when set, doneScript plays instead
  doneScript?: string;
  requires?: string[];    // flags needed before script is available
  lockedScript?: string;
  exit?: string;          // scene to go to after the script, once requires are met
}

export interface RoomDef {
  id: string;
  chapter: string;
  width: number;
  spawnX: number;
  art: 'station';
  objective: (f: Flags) => string;
  hotspots: Hotspot[];
}

const N = ''; // narration

export const SCRIPTS: Record<string, Script> = {
  pole: { lines: [
    { who: N, text: 'The brass pole drops through the ceiling from the bunks above, worn smooth by a thousand alarms.' },
  ] },
  rack: { set: { 'c01.rack': true }, lines: [
    { who: N, text: 'Your helmet hangs where it always does. The numerals 451 are stamped above the brim.' },
    { who: 'MONTAG', text: 'Four hundred fifty-one degrees. Hot enough for paper to burn.' },
    { who: N, text: 'The brass nozzle of the kerosene hose is polished to a mirror. Someone takes pride in it.' },
  ] },
  rack_done: { lines: [{ who: N, text: 'Helmet, coat, hose. Everything is ready. Everything is always ready.' }] },
  plaque: { lines: [
    { who: N, text: 'A framed history card says the firemen were founded in 1790, with Benjamin Franklin the first of them.' },
    { who: 'MONTAG', text: 'Firemen have always started fires. Haven\'t they?' },
  ] },
  cards: { lines: [
    { who: 'STONEMAN', text: 'Deal you in, Montag?' },
    { who: 'BLACK', text: 'Leave him. He\'s got that look again.' },
    { who: N, text: 'They go back to their cards under the hanging lamp. Nobody looks up twice.' },
  ] },
  beatty: { lines: [
    { who: 'BEATTY', text: 'Restless tonight, Montag? A fireman with idle hands starts to think. Check your gear.' },
  ] },
  beatty_done: { lines: [
    { who: 'BEATTY', text: 'To the truck. The city sleeps easier when we work.' },
  ] },
  pump: { set: { 'c01.pump': true }, lines: [
    { who: N, text: 'Kerosene tanks, painted fire-engine red, line the wall. The gauge needle trembles at FULL.' },
    { who: 'MONTAG', text: 'I don\'t even smell it anymore. Maybe that should worry me.' },
  ] },
  pump_done: { lines: [{ who: N, text: 'The tanks tick quietly as they cool.' }] },
  hound: { fx: 'houndGrowl', lines: [
    { who: N, text: 'In its kennel the Mechanical Hound lies folded on eight thin legs. A faint light flickers in its eyes.' },
    { who: N, text: 'As you lean closer, a low electric growl rises from inside it.' },
    { who: 'MONTAG', text: 'It doesn\'t like me. A machine shouldn\'t care either way.' },
  ] },
  dispatch_locked: { lines: [
    { who: N, text: 'The dispatch teletype sits silent. Check the equipment rack and the kerosene pump before the next call.' },
  ] },
  dispatch: { fx: 'alarm', lines: [
    { who: N, text: 'The teletype clatters awake. A strip of paper unspools across the desk.' },
    { who: 'DISPATCH', text: 'ALARM. REPORT OF A CONCEALED LIBRARY. ADDRESS ON FILE. RESPOND AT ONCE.' },
    { who: 'BEATTY', text: 'Well, Montag? Confirm the order.' },
  ], choices: [
    { text: 'Confirm: "Montag, responding."', set: { 'c01.ack': true, 'c01.tone': 'dutiful' }, reply: [
      { who: 'BEATTY', text: 'Good man. Duty is a kind of comfort, isn\'t it? No questions, no worries.' },
    ] },
    { text: 'Confirm, but ask: "What\'s in those books, Captain?"', set: { 'c01.ack': true, 'c01.tone': 'curious' }, reply: [
      { who: 'BEATTY', text: 'Nothing worth losing sleep over. Confirm and move.' },
      { who: 'MONTAG', text: '...Confirmed.' },
    ] },
  ] },
  dispatch_done: { lines: [{ who: 'DISPATCH', text: 'ORDER CONFIRMED. SALAMANDER TO BAY DOOR.' }] },
  truck_locked: { lines: [{ who: N, text: 'The Salamander waits, engine cold. It does not roll without an order.' }] },
  truck: { lines: [{ who: N, text: 'You swing up onto the Salamander. The bay door groans open onto the night.' }] },
};

export const ROOMS: Record<string, RoomDef> = {
  station: {
    id: 'station',
    chapter: 'CHAPTER 1  ·  THE HEARTH AND THE SALAMANDER',
    width: 2400,
    spawnX: 300,
    art: 'station',
    objective: (f) => {
      const gear = Number(!!f['c01.rack']) + Number(!!f['c01.pump']);
      if (gear < 2) return `Inspect the equipment rack and kerosene pump (${gear}/2)`;
      if (!f['c01.ack']) return 'Answer the dispatch teletype';
      return 'Board the Salamander at the bay door';
    },
    hotspots: [
      { id: 'pole', x: 300, label: 'Look at the brass pole', script: 'pole' },
      { id: 'rack', x: 600, label: 'Inspect equipment rack', script: 'rack', required: true, doneFlag: 'c01.rack', doneScript: 'rack_done' },
      { id: 'plaque', x: 860, label: 'Read the history card', script: 'plaque' },
      { id: 'cards', x: 1110, label: 'Watch the card game', script: 'cards' },
      { id: 'beatty', x: 1290, label: 'Talk to Captain Beatty', script: 'beatty', doneFlag: 'c01.ack', doneScript: 'beatty_done' },
      { id: 'pump', x: 1520, label: 'Inspect kerosene pump', script: 'pump', required: true, doneFlag: 'c01.pump', doneScript: 'pump_done' },
      { id: 'hound', x: 1770, label: 'Approach the kennel', script: 'hound' },
      { id: 'dispatch', x: 2010, label: 'Answer the teletype', script: 'dispatch', required: true,
        requires: ['c01.rack', 'c01.pump'], lockedScript: 'dispatch_locked', doneFlag: 'c01.ack', doneScript: 'dispatch_done' },
      { id: 'truck', x: 2250, label: 'Board the Salamander', script: 'truck', requires: ['c01.ack'], lockedScript: 'truck_locked', exit: 'end' },
    ],
  },
};
