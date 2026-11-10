import type { ChallengeRule } from '../state.ts';

export interface ChallengeInfo { id: number; title: string; part: 1 | 2 | 3; connection: string }

export const CHAPTERS = [
  'The Hearth and the Salamander',
  'A Book Under the Pillow',
  'The Sieve and the Sand',
  'Burning Bright',
  'The Fire That Warms',
];

/** Journal entries (CHALLENGES.md is authoritative). Connections describe the novel; no quotations. */
export const CHALLENGES: ChallengeInfo[] = [
  { id: 1, title: 'The Burn', part: 1, connection: 'The novel opens with Montag burning a house of books, and enjoying it.' },
  { id: 2, title: "Clarisse's Question", part: 1, connection: 'Clarisse notices the world and asks Montag whether he is happy.' },
  { id: 3, title: 'Parlor Walls', part: 1, connection: 'Mildred lives inside the TV walls and cannot hear her husband.' },
  { id: 4, title: "The Woman's House", part: 1, connection: 'An old woman stays with her books; Montag takes one.' },
  { id: 5, title: "Beatty's Argument", part: 1, connection: 'Beatty explains how people chose to stop reading.' },
  { id: 6, title: 'The Hidden Books', part: 1, connection: 'Montag shows Mildred the books he has hidden for a year.' },
  { id: 7, title: 'Find Faber', part: 2, connection: 'Montag calls the old professor he never reported.' },
  { id: 8, title: 'The Sieve and the Sand', part: 2, connection: 'On the subway, Montag tries to hold on to what he reads.' },
  { id: 9, title: 'Dover Beach', part: 2, connection: "Montag reads a poem to Mildred's friends." },
  { id: 10, title: "Montag's House", part: 3, connection: 'Montag is made to burn his own house; Beatty dies.' },
  { id: 11, title: 'The Boulevard', part: 3, connection: 'Running from the city, Montag crosses a wide, lit road.' },
  { id: 12, title: 'The Count of Ten', part: 3, connection: 'The Mechanical Hound and the whole city hunt Montag.' },
  { id: 13, title: 'The River', part: 3, connection: 'The river carries Montag out of the city.' },
  { id: 14, title: 'The Book People', part: 3, connection: "Granger's group keeps books alive by memory." },
  { id: 15, title: "The Fireman's Choice", part: 3, connection: 'The war comes; Montag decides what to carry forward.' },
];

export const RULES: ChallengeRule[] = [
  { id: 1, required: ['c01.p1', 'c01.p2', 'c01.p3', 'c01.lit'] },
  { id: 2, required: ['c02.n1', 'c02.n2', 'c02.n3', 'c02.asked'] },
  { id: 3, required: ['c03.w1', 'c03.w2', 'c03.w3', 'c03.t3', 'c03.script'] },
  { id: 4, required: ['c04.book', 'c04.plea'] },
  { id: 5, required: ['c05.done'] },
  { id: 6, required: ['c06.chair', 'c06.vent', 'c06.millie', 'c06.still'] },
  { id: 7, required: ['c07.file', 'c07.call'] },
  { id: 8, required: ['c08.verse'] },
  { id: 9, required: ['c09.off', 'c09.read', 'c09.burned'] },
  { id: 10, required: ['c10.beds', 'c10.w1', 'c10.w2', 'c10.w3', 'c10.beatty', 'c10.hound'] },
  { id: 11, required: ['c11.crossed', 'c11.choice'] },
  { id: 12, required: ['c12.mask', 'c12.river'] },
  { id: 13, required: ['c13.shore', 'c13.track'] },
  { id: 14, required: ['c14.recall', 'c14.met'] },
  { id: 15, required: ['c15.ending', 'c15.seen'] },
];
