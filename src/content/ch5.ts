// Chapter 5 — The Fire That Warms (end of Part Three). The river, Granger's fire, the war, three endings.
// Public-domain text: KJV Ecclesiastes 3:1-2. Preservation follows the novel; Defiance and Submission are adaptations.
import type { Flags } from '../state.ts';
import type { RoomDef, Script, Step } from './types.ts';

const N = '';
const looked = (f: Flags) => ['c02.n1', 'c02.n2', 'c02.n3'].filter((k) => f[k] === 'look').length >= 2;

export const SCRIPTS5: Record<string, Script> = {
  rv_open: { lines: [
    { who: N, text: 'The current takes you. Behind you, helicopters sweep the water with white light.' },
    { who: N, text: 'Hold DOWN as a light reaches you. Release in the dark to breathe. You cannot stay under forever.' },
  ] },
  rv_shore: { set: { 'c13.shore': true }, lines: [
    { who: N, text: 'Your heel touches stones. The river has carried you to the bank, far out of the city.' },
    { who: N, text: 'The land rushes at you: hay, pine, cold earth, a thousand smells at once. Stars, more than you have seen in years.' },
    { who: N, text: 'Two eyes in the dark ahead. The Hound!' },
    { who: N, text: '...A deer bolts away through the leaves.' },
  ] },
  rv_track: { set: { 'c13.track': true }, lines: [
    { who: N, text: 'Your foot strikes something that rings: a rail. An old railroad track, rusting beside the river.' },
    { who: N, text: 'For no reason you can name, you are sure Clarisse once walked here.' },
  ] },
  rv_locked: { lines: [{ who: N, text: 'Follow the river to the shore first.' }] },

  cp_see: { lines: [
    { who: N, text: 'Firelight ahead. A small fire, and hands held out to it.' },
    { who: N, text: 'You have never seen fire used this way. Not to destroy anything. For warmth.' },
  ] },
  cp_meet: { lines: [
    { who: 'GRANGER', text: "It's all right. You can come out now. You're welcome here." },
    { who: N, text: 'Five old men in blue denim. One hands you a tin cup of coffee.' },
    { who: 'GRANGER', text: "Drink this as well. It changes the scent of your sweat. With the Hound after you, you'll want to smell like two other people." },
    { who: 'GRANGER', text: 'We watched the chase. Look.' },
  ] },
  cp_tv: { set: { 'cp.met': true }, lines: [
    { who: 'ANNOUNCER', text: 'There he is! The search is over!' },
    { who: N, text: 'On the tiny screen, the Hound leaps at a man out for a walk. The camera never shows his face clearly.' },
    { who: 'GRANGER', text: "They lost you at the river and couldn't admit it. So they found someone walking alone and finished the show." },
    { who: 'GRANGER', text: 'Welcome back from the dead, Montag.' },
  ] },

  // ---- 14 The Book People (untimed recall) ----
  cp_offer: { lines: [
    { who: 'GRANGER', text: 'What do you have to offer?' },
    { who: 'MONTAG', text: 'Part of Ecclesiastes. Let me try.' },
  ], puzzle: { title: 'What you carry', source: 'KJV Ecclesiastes 3:1–2 · Read, then preserve the sequence.',
    fragments: ['To every thing there is a season,', 'and a time to every purpose under the heaven:', 'a time to be born, and a time to die;', 'a time to plant, and a time to pluck up that which is planted;'],
    distractions: ['Consider the lilies of the field,', "Denham's does it!"] },
    choices: [{ text: 'Offer the passage to Granger.', next: 'ec_end' }] },
  ec_end: { set: { 'c14.recall': true }, lines: [
    { who: N, text: '"To every thing there is a season, and a time to every purpose under the heaven..." It comes back whole, without trying.' },
    { who: 'GRANGER', text: 'There. You see? Nothing is ever really lost.' },
  ], choices: [{ text: '"Who are you people?"', next: 'cp_people' }] },
  cp_people: { set: { 'c14.met': true }, lines: [
    { who: 'GRANGER', text: 'Teachers, once. Writers, a preacher. We read the books and burned them ourselves, so nobody could find them on us. We keep them up here instead.' },
    { who: 'GRANGER', text: "I am Plato's Republic. Mr. Simmons there is Marcus Aurelius. Others carry Swift, Darwin, Thoreau, the Gospels." },
    { who: 'BOOK PERSON', text: "We're only the covers. The books are what matter." },
    { who: 'GRANGER', text: "Thousands of us on the old tracks. When the cities want them back, we'll be here." },
  ] },

  // ---- 15 The Fireman's Choice ----
  in_angry: { lines: [{ who: N, text: "Part of you is still on that boulevard, still at Black's door, wanting every firehouse in the city to burn." }] },
  in_tired: { lines: [{ who: N, text: 'Part of you only wants to be nobody. Officially, you already are: Guy Montag is dead.' }] },
  in_quiet: { lines: [{ who: N, text: 'You think of Clarisse, and of the woman on her porch, and of the verse that came back.' }] },
  cp_choice: { lines: [
    { who: 'GRANGER', text: 'The war is starting. We wait it out here. Then we walk back toward whatever is left, and start remembering out loud.' },
    { who: 'GRANGER', text: "You don't owe us anything, Montag. Which way will you walk?" },
  ], choices: [
    { text: 'Stay. Remember with them.', set: { 'c15.ending': 'preservation' }, reply: [{ who: 'GRANGER', text: 'Then sit. Rest. You are a book now; walk carefully.' }] },
    { text: "Go back tonight. Finish what you started at Black's house: every firehouse.", when: (f) => !!f['c11.plant'], set: { 'c15.ending': 'defiance' }, reply: [{ who: 'GRANGER', text: "I struck a fireman once, years ago. I understand. Go carefully." }] },
    { text: "Go back tonight. Faber's plan: plant the books, turn in the alarms.", when: (f) => !f['c11.plant'], set: { 'c15.ending': 'defiance' }, reply: [{ who: 'GRANGER', text: 'Rage was all we had once, too. Go carefully.' }] },
    { text: 'Let Montag stay dead. Walk away alone, and keep quiet.', set: { 'c15.ending': 'submission' }, reply: [{ who: 'GRANGER', text: "Nobody will stop you. I hope you find somewhere quiet." }] },
  ] },
  war: { lines: [
    { who: N, text: 'Before anyone can move, the jets go over, too fast to see.' },
    { who: N, text: 'Far down the river, the city seems to stand up in the air for an instant. Then it falls. The sound comes after.' },
    { who: 'MONTAG', text: 'Millie...' },
    { who: N, text: 'In that instant you remember, at last, where the two of you met. Chicago. A long time ago.' },
  ] },

  ep_pres: { lines: [
    { who: N, text: 'At dawn someone lights a small fire and fries a little bacon. Granger looks into the flames.' },
    { who: 'GRANGER', text: "There was an old bird that burned itself up and rose out of the ashes, again and again. We do the same. But we can remember what we did. That's the difference." },
    { who: 'GRANGER', text: "If anyone asks what we're doing, tell them: we're remembering." },
    { who: N, text: 'They walk upstream toward the city, to help. Granger nods you to the front. The verse waits in you for noon.' },
  ] },
  ep_pres_dew: { lines: [{ who: N, text: 'There is dew on the grass. This time you stop, and look.' }] },
  ep_pres_woman: { lines: [{ who: N, text: "You think of the woman's match, and keep walking." }] },

  ep_def: { lines: [
    { who: N, text: 'You go anyway, into what is left of the city, with your plan and your anger.' },
    { who: N, text: 'There are no firehouses left to burn. There are survivors, and you start telling them what was in the books.' },
    { who: N, text: 'A few listen. More pick up stones, the way Faber said they would.' },
  ] },
  ep_def_black: { lines: [{ who: N, text: "Somewhere under the ash is Black's house, and the books you left there. You did that. It changed nothing, and you would do it again." }] },
  ep_def_faber: { lines: [{ who: N, text: "You remember tearing Faber's pages to make him listen. In the square, you wait for an answer before you speak again." }] },
  ep_def_end: { lines: [{ who: N, text: 'You never learn whether Faber reached St. Louis. You keep talking, in a different square each day. It is not finished.' }] },

  ep_sub: { lines: [
    { who: N, text: 'When the dust settles, you walk away from the fire, south, alone. Nobody follows. Officially, Guy Montag is dead.' },
    { who: N, text: 'In a small town that the war missed, you rent a room with a wall that talks, and you put a Seashell in your ear.' },
    { who: N, text: 'Some nights a line about lilies drifts up through the noise. You turn the volume up until it is gone.' },
  ] },
  ep_sub_eager: { lines: [{ who: N, text: 'It is easier, the way the old job was easier. That is what frightens you, a little, and then not at all.' }] },
};

const ending: Step[] = [
  { if: (f) => !!f['c11.plant'] || f['c09.outburst'] === true, then: [{ say: 'in_angry' }],
    else: [{ if: (f) => f['c01.tone'] === 'eager' && f['c09.outburst'] !== true, then: [{ say: 'in_tired' }], else: [{ say: 'in_quiet' }] }] },
  { say: 'cp_choice' },
  { fx: 'tvOff' }, { wait: 300 }, { fx: 'bombs' }, { wait: 1800 }, { say: 'war' }, { wait: 800 }, { fx: 'dawn' },
  { if: (f) => f['c15.ending'] === 'preservation', then: [
    { say: 'ep_pres' },
    { if: looked, then: [{ say: 'ep_pres_dew' }] },
    { if: (f) => f['c04.plea'] === 'plead', then: [{ say: 'ep_pres_woman' }] },
  ] },
  { if: (f) => f['c15.ending'] === 'defiance', then: [
    { say: 'ep_def' }, { if: (f) => !!f['c11.plant'], then: [{ say: 'ep_def_black' }] },
    { if: (f) => f['faber.tear'] === 'tear', then: [{ say: 'ep_def_faber' }] }, { say: 'ep_def_end' },
  ] },
  { if: (f) => f['c15.ending'] === 'submission', then: [
    { say: 'ep_sub' }, { if: (f) => f['c01.tone'] === 'eager', then: [{ say: 'ep_sub_eager' }] },
  ] },
  { set: { 'c15.seen': true } }, { wait: 600 }, { ending: true },
];

export const ROOMS5: Record<string, RoomDef> = {
  river: {
    id: 'river', chapter: 5, label: '', width: 2400, spawnX: 200, kit: 'forest:river',
    hazards: [
      { id: 'sl1', from: 480, to: 980, width: 150, period: 5200, look: 'searchlight', dive: true, reset: 300, when: (f) => !f['c13.shore'] },
      { id: 'sl2', from: 1040, to: 1420, width: 150, period: 4400, phase: 0.4, look: 'searchlight', dive: true, reset: 1000, when: (f) => !f['c13.shore'] },
    ],
    objective: (f) => !f['c13.shore'] ? 'Reach shore. Short dives under lights; release DOWN in the dark to breathe' : !f['c13.track'] ? 'Find your way in the dark' : 'Follow the track',
    enter: [{ key: 'e.river', steps: [{ title: 'CHAPTER FIVE', sub: 'The Fire That Warms' }, { say: 'rv_open' }] }],
    hotspots: [
      { id: 'shore', x: 1560, label: '', auto: true, when: (f) => !f['c13.shore'], script: 'rv_shore', steps: [{ flash: 0x101820, ms: 300 }] },
      { id: 'track', x: 2000, label: '', auto: true, when: (f) => !!f['c13.shore'] && !f['c13.track'], script: 'rv_track' },
      { id: 'on', x: 2320, label: 'Follow the track', required: true, requires: ['c13.track'], lockedScript: 'rv_locked', exit: { room: 'camp', x: 200 } },
    ],
  },

  camp: {
    id: 'camp', chapter: 5, label: '', width: 1800, spawnX: 200, kit: 'forest:camp',
    npcs: [
      { id: 'granger', fig: 'granger', name: 'GRANGER', x: 1090, face: -1 },
      { id: 'simmons', fig: 'bookman', name: 'BOOK PERSON', x: 900, face: 1 },
      { id: 'b2', fig: 'bookman', name: 'MR. SIMMONS', x: 1180, face: -1, back: true },
      { id: 'b3', fig: 'bookman', name: 'REVEREND', x: 960, face: 1, back: true },
    ],
    objective: (f) => !f['cp.met'] ? 'Go toward the fire' : !f['c14.met'] ? 'Talk to Granger' : !f['c15.ending'] ? 'Granger is waiting for your answer' : '',
    enter: [{ key: 'e.camp', steps: [{ say: 'cp_see' }] }],
    hotspots: [
      { id: 'fire', x: 760, label: '', auto: true, when: (f) => !f['cp.met'], script: 'cp_meet', steps: [{ fx: 'tvOn' }, { say: 'cp_tv' }, { fx: 'tvOff' }] },
      { id: 'granger', x: 1000, label: 'Talk to Granger', required: true, when: (f) => !!f['cp.met'] && !f['c14.met'], script: 'cp_offer' },
      { id: 'choice', x: 1000, label: 'Answer Granger', required: true, when: (f) => !!f['c14.met'] && !f['c15.seen'], steps: ending },
    ],
  },
};
