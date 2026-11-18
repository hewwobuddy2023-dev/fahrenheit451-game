// Chapter 5 — The Fire That Warms (end of Part Three). The river, Granger's fire, the war, three endings.
// Public-domain text: KJV Ecclesiastes 3:1-2. Preservation, Defiance and Submission are the three endings.
import type { Flags } from '../state.ts';
import type { RoomDef, Script, Step } from './types.ts';

const N = '';
const looked = (f: Flags) => ['c02.n1', 'c02.n2', 'c02.n3'].filter((k) => f[k] === 'look').length >= 2;

export const SCRIPTS5: Record<string, Script> = {
  rv_open: { lines: [
    { who: N, text: 'The current has you. Behind, helicopters walk their white lights over the water.' },
  ] },
  rv_found: { lines: [
    { who: N, text: 'The white light finds you. Someone across the water: "There! In the river!" You let go, and the current takes you back the way you came.' },
  ] },
  rv_shore: { set: { 'c13.shore': true }, lines: [
    { who: N, text: 'Your heel hits stones. The bank. The country smells of cut hay, and there are more stars than you knew.' },
    { who: N, text: 'Two eyes in the dark ahead. The Hound!' },
    { who: N, text: '...A deer goes off through the leaves.' },
  ] },
  rv_track: { set: { 'c13.track': true }, lines: [
    { who: N, text: 'Your foot rings against a rail, old and rusted, running along the river.' },
  ] },
  rv_locked: { lines: [{ who: N, text: 'Nothing under your feet but mud. Keep looking for the track.' }] },

  cp_see: { lines: [
    { who: N, text: 'Firelight ahead. A small fire, and hands held out to it.' },
    { who: N, text: "You didn't know a fire could just sit there." },
  ] },
  cp_meet: { lines: [
    { who: 'GRANGER', text: "It's all right. Come out. Nobody here is going to shout." },
    { who: N, text: 'Five old men in blue denim. One holds out a tin cup of coffee.' },
    { who: 'GRANGER', text: "Drink that too; it changes your sweat. With the Hound after you, you'll want to smell like two other men." },
    { who: 'GRANGER', text: 'We watched your chase. Come and look.' },
  ] },
  cp_tv: { set: { 'cp.met': true }, lines: [
    { who: 'ANNOUNCER', text: 'There he is! The search is over!' },
    { who: N, text: 'On the tiny screen the Hound leaps on a man out for a walk. The camera never gets his face.' },
    { who: 'GRANGER', text: "They lost you at the river and couldn't say so. So they found some fellow walking alone and finished the show." },
    { who: 'GRANGER', text: 'Welcome back from the dead, Montag.' },
  ] },

  // ---- 14 The Book People (untimed recall) ----
  cp_offer: { lines: [
    { who: 'GRANGER', text: 'What have you got to offer?' },
    { who: 'MONTAG', text: "Part of Ecclesiastes, and a little Revelation. I've tried to hold on to it. Let me try again." },
  ], puzzle: { title: 'What you carry', source: 'KJV Ecclesiastes 3:1–2 · Read, then preserve the sequence.',
    fragments: ['To every thing there is a season,', 'and a time to every purpose under the heaven:', 'a time to be born, and a time to die;', 'a time to plant, and a time to pluck up that which is planted;'],
    distractions: ['Consider the lilies of the field,', "Denham's does it!"] },
    choices: [{ text: 'Offer the passage to Granger.', next: 'ec_end' }] },
  ec_end: { set: { 'c14.recall': true }, lines: [
    { who: N, text: '"To every thing there is a season, and a time to every purpose under the heaven..."' },
    { who: 'MONTAG', text: 'That is as far as it goes. The rest is gone when I turn my head.' },
    { who: 'GRANGER', text: "Stop trying so hard. Let it alone and it will come when you need it." },
  ], choices: [{ text: '"Who are you people?"', next: 'cp_people' }] },
  cp_people: { set: { 'c14.met': true }, lines: [
    { who: 'GRANGER', text: 'Teachers, once. Writers, a preacher. We read the books, then burned them ourselves so nobody could find them on us. Now we keep them up here.' },
    { who: 'GRANGER', text: "I carry the Republic. Mr. Simmons there has Marcus Aurelius. Over there, Swift, Darwin, Thoreau, the Gospels." },
    { who: 'BOOK PERSON', text: "I'm only the binding. You want the pages." },
    { who: 'REVEREND', text: 'That book of Ecclesiastes. The only other copy I know of is with a man named Harris, in Youngstown.' },
    { who: 'GRANGER', text: 'Then until we find Harris, Montag, you are the Book of Ecclesiastes.' },
    { who: 'GRANGER', text: 'There are thousands of us along the old railroad tracks. If the cities ever want them back, they know where to ask.' },
  ] },

  // ---- 15 The Fireman's Choice ----
  in_angry: { lines: [{ who: N, text: "Black's front door, then the sirens. You still want every firehouse in the city to burn." }] },
  in_tired: { lines: [{ who: N, text: "You are tired in a way sleep won't touch. Montag is dead, officially. It would be restful to leave him that way." }] },
  in_quiet: { lines: [{ who: N, text: 'Clarisse on her porch. The verse from the train, still in your head.' }] },
  cp_choice: { lines: [
    { who: 'GRANGER', text: "The war's about to start. We sit it out here, then walk back toward whatever is left and start remembering out loud." },
    { who: 'GRANGER', text: "You owe us nothing, Montag. Which way are you walking?" },
  ], choices: [
    { text: 'Stay. Remember with them.', set: { 'c15.ending': 'preservation' }, reply: [{ who: 'GRANGER', text: "Then sit down. Eat something. You're a book now, so mind where you put your feet." }] },
    { text: "Go back tonight. Finish what you started at Black's house: every firehouse.", when: (f) => !!f['c11.plant'], set: { 'c15.ending': 'defiance' }, reply: [{ who: 'GRANGER', text: "I hit a fireman once, years ago. I understand. Go carefully." }] },
    { text: "Go back tonight. Faber's plan: plant the books, turn in the alarms.", when: (f) => !f['c11.plant'], set: { 'c15.ending': 'defiance' }, reply: [{ who: 'GRANGER', text: 'Rage was all we had once, too. Go carefully.' }] },
    { text: 'Let Montag stay dead. Walk away alone, and keep quiet.', set: { 'c15.ending': 'submission' }, reply: [{ who: 'GRANGER', text: "Nobody will stop you. I hope you find a quiet place." }] },
  ] },
  // the bombs, as the novel has them: the others, Mildred in her hotel room, Chicago, the city in the air, then the verse
  war1: { sub: true, lines: [
    { who: N, text: 'The jets are over you before anyone has looked up.' },
    { who: 'MONTAG', text: 'Run! Faber! Clarisse!' },
    { who: N, text: 'Clarisse is dead. Faber is on a bus somewhere, the highway still ahead of it.' },
    { who: 'MONTAG', text: 'Millie. Get out of there!' },
    { who: N, text: 'In her hotel room she leans toward the parlor wall, as if she could climb in.' },
    { who: N, text: 'The wall says her name. It says nothing about the bomb.' },
    { who: N, text: 'The first one lands. For an instant she sees her own face in the dark glass.' },
    { who: N, text: 'She looks up, and the hotel comes down.' },
  ] },
  war2: { sub: true, lines: [
    { who: 'MONTAG', text: 'Chicago. We met in Chicago.' },
    { who: N, text: 'Down the river the city stands up in the air for a second, then falls.' },
    { who: N, text: 'The sound of it arrives after.' },
  ] },
  war_recall: { sub: true, lines: [
    { who: N, text: 'Face down in the dust, you reach for it, and the Preacher is there.' },
    { who: N, text: '"To every thing there is a season, and a time to every purpose under the heaven."' },
    { who: N, text: 'There is no jingle in it anywhere.' },
    { who: 'GRANGER', text: 'There.' },
  ] },

  ep_pres: { lines: [
    { who: N, text: 'At dawn someone lights a small fire and fries a little bacon. Granger looks into the flames.' },
    { who: 'GRANGER', text: "There was a bird once that burned itself to ash and climbed out of the pile, over and over. We're something like it. Only we can remember what we did last time." },
    { who: 'GRANGER', text: "If anyone asks what we're up to, say we're remembering." },
    { who: 'GRANGER', text: 'And when we get back, the first thing we build is a mirror, a big one, and we stand in front of it a good long while.' },
    { who: N, text: 'Someone kicks dirt over the fire. They start upstream toward the city, and Granger nods you to the front.' },
    { who: 'BOOK PERSON', text: 'Montag. Anything you want to say, once we get there?' },
    { who: 'MONTAG', text: 'When we reach the city.' },
  ] },
  ep_pres_dew: { lines: [{ who: N, text: "There's dew on the grass. You stop and look at it." }] },
  ep_pres_woman: { lines: [{ who: N, text: "You think of the woman's match, and keep walking." }] },
  ep_def: { lines: [
    { who: N, text: "You go back anyway, with your plan and your temper. There's no firehouse left to burn." },
    { who: N, text: 'There are survivors, though, and you tell them what was in the books. A few listen. More pick up stones.' },
  ] },
  ep_def_black: { lines: [{ who: N, text: "Black's house is under the ash somewhere, with the books you left in his kitchen. It changed nothing. You would do it again." }] },
  ep_def_faber: { lines: [{ who: N, text: "You remember tearing Faber's pages. In the square you wait for an answer after every question." }] },
  ep_def_end: { lines: [{ who: N, text: "Nobody tells you whether Faber's bus reached St. Louis. You talk in a different square each day." }] },

  ep_sub: { lines: [
    { who: N, text: 'South, alone, once the dust has settled. Nobody calls after you.' },
    { who: N, text: 'A town the war skipped. A rented room with a talking wall, and a Seashell in your ear.' },
    { who: N, text: 'Some nights a line about lilies comes up through the noise. You turn the dial.' },
  ] },
  ep_sub_eager: { lines: [{ who: N, text: 'It is easier. Like the old job, you think, and then you stop thinking.' }] },
};

const ending: Step[] = [
  { if: (f) => !!f['c11.plant'] || f['c09.outburst'] === true, then: [{ say: 'in_angry' }],
    else: [{ if: (f) => f['c01.tone'] === 'eager' && f['c09.outburst'] !== true, then: [{ say: 'in_tired' }], else: [{ say: 'in_quiet' }] }] },
  { say: 'cp_choice' },
  { fx: 'tvOff' }, { wait: 300 }, { fx: 'closeIn' }, { fx: 'bombs' }, { wait: 1800 }, { say: 'war1' }, { wait: 500 }, { say: 'war2' }, { wait: 600 }, { say: 'war_recall' }, { fx: 'closeOut' }, { wait: 800 }, { fx: 'dawn' },
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
    failTip: 'Under when it comes. Up when it goes.',
    id: 'river', chapter: 5, label: '', width: 2400, spawnX: 200, kit: 'forest:river',
    hazards: [
      { id: 'sl1', from: 480, to: 980, width: 150, period: 5200, look: 'searchlight', dive: true, reset: 300, fail: [{ say: 'rv_found' }], when: (f) => !f['c13.shore'] },
      { id: 'sl2', from: 1040, to: 1420, width: 150, period: 4400, phase: 0.4, look: 'searchlight', dive: true, reset: 1000, fail: [{ say: 'rv_found' }], when: (f) => !f['c13.shore'] },
    ],
    quietUi: true,
    objective: (f) => !f['c13.shore'] ? 'Reach the far shore' : !f['c13.track'] ? 'Find the railroad track' : 'Follow the track',
    hints: (f) => {
      if (!f['c13.shore']) return ['The current has you. Keep swimming toward the far bank.', 'The bank is ahead to the right. Lights sweep the water between you and it.', 'When a light reaches you, hold [DOWN] to sink under it. Let go in the dark to breathe.'];
      if (!f['c13.track']) return ['You made it to the bank. Look around.', 'The rail track runs along the bank, further right.', 'Walk right along the bank until you find the track.'];
      return ['The track leads toward the camp.', 'Keep walking right along the rail.', 'Walk to the end of the track and press [E] to follow it.'];
    },
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
      { id: 'b2', fig: 'bookman2', name: 'MR. SIMMONS', x: 1180, face: -1, back: true },
      { id: 'b3', fig: 'bookman3', name: 'REVEREND', x: 960, face: 1, back: true },
    ],
    quietUi: true,
    objective: (f) => !f['cp.met'] ? 'Go toward the fire' : !f['c14.met'] ? 'Talk to Granger' : !f['c15.ending'] ? 'Answer Granger' : 'Stay by the fire.',
    hints: (f) => {
      if (!f['cp.met']) return ['Someone is waiting ahead, near a fire.', 'The fire is ahead to the right.', 'Walk right toward the firelight and stop there.'];
      if (!f['c14.met']) return ['These people want to know what you know.', 'Granger is in the middle of the camp, by the fire.', 'Walk to Granger and press [E]. He will ask what you can offer.'];
      return ['Granger is still waiting for your answer.', 'Granger is by the fire in the middle of the camp.', 'Walk to Granger and press [E] to answer.'];
    },
    enter: [{ key: 'e.camp', steps: [{ say: 'cp_see' }] }],
    hotspots: [
      { id: 'fire', x: 760, label: '', auto: true, when: (f) => !f['cp.met'], script: 'cp_meet', steps: [{ fx: 'tvOn' }, { say: 'cp_tv' }, { fx: 'tvOff' }] },
      { id: 'granger', x: 1000, label: 'Talk to Granger', required: true, when: (f) => !!f['cp.met'] && !f['c14.met'], script: 'cp_offer' },
      { id: 'choice', x: 1000, label: 'Answer Granger', required: true, when: (f) => !!f['c14.met'] && !f['c15.seen'], steps: ending },
    ],
  },
};
