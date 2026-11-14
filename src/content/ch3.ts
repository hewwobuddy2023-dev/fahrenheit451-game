// Chapter 3 — The Sieve and the Sand (Part Two). Faber, the subway, Dover Beach, Beatty's duel of quotations.
// Public-domain texts: KJV Matthew 6:28; Matthew Arnold, "Dover Beach" (1867); Alexander Pope (1711).
import type { RoomDef, Script } from './types.ts';

const N = '';
const EAR = 'FABER (IN YOUR EAR)';

export const SCRIPTS3: Record<string, Script> = {
  f_open: { lines: [
    { who: N, text: 'You read all afternoon in the hall while the rain comes down. Mildred keeps glancing at the dead, grey parlor walls.' },
    { who: 'MILDRED', text: "Books aren't people. You read and I look around, and there isn't anybody." },
  ] },
  f_file: { set: { 'c07.file': true }, lines: [
    { who: N, text: 'In your file-wallet, under FUTURE INVESTIGATIONS, one name you never turned in.' },
    { who: N, text: 'An old man on a bench in a green park, a year ago. A hand over his coat pocket. He talked about the meaning of things, not things.' },
    { who: N, text: 'He wrote down his address for you. "For your file," he said, "in case you decide to be angry with me." Faber.' },
  ] },
  f_phone_locked: { lines: [{ who: N, text: 'Who would you even call?' }] },
  f_call: { lines: [
    { who: 'FABER', text: '...Yes? Mr. Montag?' },
  ], choices: [
    { text: '"How many copies of the Bible are left in the country?"', set: { 'c07.call': 'bible' }, reply: [
      { who: 'FABER', text: "I don't know what you're talking about! This is some kind of trap. I can't talk to just anyone!" },
      { who: N, text: 'The line goes dead.' }] },
    { text: '"I need to ask you about a book."', set: { 'c07.call': 'book' }, reply: [
      { who: 'FABER', text: 'A book? I have no books. None! You know that as well as I do.' },
      { who: N, text: 'The line goes dead.' }] },
  ] },
  f_leave: { lines: [
    { who: 'MILDRED', text: "The ladies are coming over tonight! And you have to give that book back to the Captain, don't you? He knows you took one." },
    { who: 'MONTAG', text: "He doesn't know which one. I'll need a copy first." },
  ] },
  f_leave_locked: { lines: [{ who: N, text: 'Not yet. Find the old man first.' }] },

  // ---- 08 The Sieve and the Sand (untimed recall) ----
  sb_1: { lines: [
    { who: N, text: 'You open the Bible on your knees. The advertisement keeps cutting across the words.' },
  ], puzzle: { title: 'The sieve and the sand', source: 'KJV Matthew 6:28 · Study the passage before the broadcast returns.',
    fragments: ['Consider the lilies of the field,', 'how they grow;', 'they toil not,', 'neither do they spin.'],
    distractions: ["Denham's Dentifrice!", 'Dandy dental detergent!'], interference: true },
    choices: [{ text: 'Hold on to the words.', next: 'sb_end' }] },
  sb_end: { set: { 'c08.verse': true }, lines: [
    { who: N, text: '"Consider the lilies of the field, how they grow; they toil not, neither do they spin." You have it. All of it.' },
    { who: 'TRAIN RADIO', text: "DENHAM'S DENTIFRICE!" },
  ], choices: [
    { text: '"Shut up! Shut up!"', set: { 'c08.shout': true }, reply: [{ who: N, text: 'The whole carriage turns to stare. Someone calls for the guard.' }, { who: 'TRAIN', text: 'Knoll View!' }] },
    { text: 'Hold the line, silently.', set: { 'c08.shout': false }, reply: [{ who: 'TRAIN', text: 'Knoll View!' }] },
  ] },

  // ---- Faber's house ----
  fb_door: { lines: [
    { who: 'FABER', text: 'Who is it?' },
    { who: 'MONTAG', text: 'Montag. Let me in. I\'m alone, I swear.' },
    { who: N, text: 'The door opens a crack. A very old man, white as his plaster walls, looking at the book under your arm. Slowly, his fear goes.' },
  ] },
  fb_talk: { lines: [
    { who: 'FABER', text: "May I? ...It's been a long time. Books smell like nutmeg, did you know? Some spice from a country far away." },
    { who: 'FABER', text: 'You are looking at a coward, Mr. Montag. I saw where things were going and said nothing. Why did you come?' },
    { who: 'MONTAG', text: "Nobody listens anymore. I can't talk to the walls, and my wife listens to the walls. I want someone to teach me to understand what I read." },
    { who: 'FABER', text: "It isn't the books you want. It's what was in them. Detail, life up close with its pores showing. Then time to think it over. Then the freedom to act on it." },
    { who: 'MONTAG', text: "Then help me. We could print more. Hide them in firemen's houses and turn in the alarms. Let the firemen burn each other." },
    { who: 'FABER', text: 'Go home, Montag. That kind of talk gets people burned. Good night.' },
  ], choices: [
    { text: 'Start tearing pages from the Bible.', set: { 'faber.tear': 'tear' }, next: 'fb_ear', reply: [
      { who: N, text: 'Your hands rip out the first page, then the next. Faber cries out as if you had struck him.' },
      { who: 'FABER', text: "Don't! All right. All right. What do you want?" },
      { who: 'MONTAG', text: 'Teach me.' }] },
    { text: '"Please. There is no one else."', set: { 'faber.tear': 'plead' }, next: 'fb_ear', reply: [
      { who: N, text: 'He looks at you a long time.' },
      { who: 'FABER', text: "...I almost let you walk out. I'm that afraid. Come here." }] },
  ] },
  fb_ear: { set: { 'faber.ear': true }, lines: [
    { who: 'FABER', text: 'I know a printer who has been out of work for forty years. That much I can do. And this.' },
    { who: N, text: 'In a back room full of coils and crystals, he hands you something green, no bigger than a bullet.' },
    { who: 'FABER', text: 'Put it in your ear. I will hear what you hear, and I will talk to you. Go to the firehouse tonight. We will listen to your Captain together.' },
  ] },

  // ---- 09 Dover Beach ----
  l_open: { lines: [
    { who: N, text: 'Mrs. Phelps and Mrs. Bowles arrive in a cloud of perfume and chatter. The walls are loud again.' },
    { who: 'MILDRED', text: "Doesn't everyone look nice!" },
    { who: EAR, text: 'Patience, Montag.' },
  ] },
  l_off: { set: { 'c09.off': true }, lines: [
    { who: N, text: 'You reach inside the wall and pull the main switch. The colour drains away like water from a bowl.' },
    { who: N, text: 'Three women turn and look at you with plain dislike.' },
  ] },
  l_talk: { lines: [
    { who: 'MONTAG', text: "When do you suppose the war will start? I notice your husbands aren't here tonight." },
    { who: 'MRS. PHELPS', text: 'Oh, the Army called Pete yesterday. Quick war, they said. Forty-eight hours and everybody home.' },
    { who: 'MRS. BOWLES', text: "It's always somebody else's husband who dies, isn't it?" },
    { who: EAR, text: 'Careful.' },
  ], choices: [
    { text: '"Have you ever known anyone who died in a war?"', set: { 'c09.b1': 'press' }, next: 'l_2', reply: [{ who: 'MRS. PHELPS', text: "Jumping off buildings, yes. In a war? Nobody. Nobody I know." }] },
    { text: 'Say nothing.', set: { 'c09.b1': 'quiet' }, next: 'l_2' },
  ] },
  l_2: { lines: [
    { who: 'MRS. BOWLES', text: 'I voted for the tall one last election. Such a nice-looking man.' },
    { who: 'MRS. PHELPS', text: 'The other one mumbled. And he was short.' },
  ], choices: [
    { text: 'Go and get a book.', set: { 'c09.book': 'outburst' }, remember: 'Mildred', next: 'l_3', reply: [{ who: EAR, text: 'Montag, no! You will ruin everything!' }, { who: 'MILDRED', text: "Guy! ...Ladies, every fireman gets to bring one book home a year, to show how silly the old days were. Isn't that right, dear?" }] },
    { text: 'Bite your tongue.', set: { 'c09.book': 'restraint' }, next: 'l_3', reply: [{ who: EAR, text: 'Good.' }, { who: 'MILDRED', text: "Guy has a surprise! Every fireman gets one old book a year, to show how silly it all was. Read us something, dear." }] },
  ] },
  l_3: { set: { 'c09.read': true }, lines: [
    { who: EAR, text: 'If you are going to read, then read. Slowly.' },
    { who: N, text: '"Dover Beach." Your mouth is numb. You begin low and stumbling, and your voice grows steadier.' },
    { who: 'MONTAG', text: 'Ah, love, let us be true\nTo one another! for the world, which seems\nTo lie before us like a land of dreams,' },
    { who: 'MONTAG', text: 'So various, so beautiful, so new,\nHath really neither joy, nor love, nor light,\nNor certitude, nor peace, nor help for pain;' },
    { who: 'MONTAG', text: 'And we are here as on a darkling plain\nSwept with confused alarms of struggle and flight,\nWhere ignorant armies clash by night.' },
    { who: N, text: 'Mrs. Phelps is crying. She does not know why.' },
    { who: 'MRS. BOWLES', text: 'You see? Poetry and tears, I always said so. You are a cruel man, Mr. Montag.' },
  ], choices: [
    { text: '"Go home. Think about your husbands, your children, how any of this happened."', set: { 'c09.outburst': true }, reply: [{ who: N, text: 'Doors slam. The house is empty.' }] },
    { text: 'Apologise and let them go.', set: { 'c09.outburst': false }, reply: [{ who: 'MONTAG', text: "I'm sorry. I don't know what I'm doing tonight." }, { who: N, text: 'They leave quickly, without saying goodbye.' }] },
  ] },
  l_burn: { set: { 'c09.burned': true }, lines: [
    { who: EAR, text: 'Now. The incinerator. Put the book in.' },
    { who: N, text: 'You drop it through the brass slot. In the bathroom, water runs.' },
    { who: N, text: 'You carry the rest of the books out to the bushes by the back fence. Just for tonight.' },
  ] },
  l_burn_locked: { lines: [{ who: N, text: 'Not yet.' }] },

  // ---- the firehouse: Beatty's duel of quotations ----
  st_duel: { lines: [
    { who: N, text: 'The kennel downstairs is empty tonight.' },
    { who: 'BEATTY', text: 'Well. The sheep comes back to the fold.' },
    { who: N, text: 'He holds out his hand. You give him the substitute book. He drops it in the trash without looking at the title.' },
    { who: 'BEATTY', text: 'Sit in for a hand. And keep your hands on the table, Montag. Not that we don\'t trust you.' },
    { who: 'BEATTY', text: 'I dreamed about you. We argued about books. You threw quotations at me, I threw them right back. "A little learning is a dangerous thing; drink deep, or taste not the Pierian spring."' },
    { who: 'BEATTY', text: 'Pope. You see? Books say anything. They turn on whoever trusts them.' },
    { who: EAR, text: "He's muddying the water. Don't let him in." },
  ], choices: [
    { text: 'Keep quiet.', set: { 'st.reply': 'quiet' } },
    { text: '"Then why did you read them?"', set: { 'st.reply': 'ask' }, remember: 'Beatty', reply: [{ who: 'BEATTY', text: "To know what I'm burning. I read enough to be sure." }] },
  ] },
  st_alarm: { lines: [
    { who: 'BEATTY', text: 'What a pulse! Like the day after a war.' },
    { who: N, text: 'The bell. Beatty reads the address, pockets it, and smiles.' },
    { who: 'BEATTY', text: "A special case. I'll drive." },
    { who: N, text: 'Beatty drives tonight, leaning into the wind, grinning. The Salamander slows. Stops.' },
    { who: 'MONTAG', text: "...This is my house." },
  ] },
};

export const ROOMS3: Record<string, RoomDef> = {
  home3: {
    id: 'home3', chapter: 3, label: '', width: 2600, spawnX: 900, kit: 'home',
    npcs: [{ id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1830, face: -1 }],
    objective: (f) => !f['c07.file'] ? 'Look in your file-wallet in the bedroom' : !f['c07.call'] ? 'Phone the name in the hall' : 'Take the subway to Faber',
    enter: [{ key: 'e.home3', steps: [{ title: 'CHAPTER THREE', sub: 'The Sieve and the Sand' }, { say: 'f_open' }] }],
    hotspots: [
      { id: 'file', x: 1000, label: 'Your file-wallet', required: true, script: 'f_file', doneFlag: 'c07.file', doneScript: 'f_file' },
      { id: 'phone', x: 290, label: 'The phone', required: true, requires: ['c07.file'], lockedScript: 'f_phone_locked', script: 'f_call', doneFlag: 'c07.call', doneScript: 'f_leave' },
      { id: 'door', x: 140, label: 'Leave for the subway', required: true, requires: ['c07.call'], lockedScript: 'f_leave_locked', script: 'f_leave', exit: { room: 'subway', x: 220 } },
    ],
  },

  subway: {
    id: 'subway', chapter: 3, label: '', width: 1400, spawnX: 220, kit: 'subway',
    npcs: [],
    objective: (f) => !f['c08.verse'] ? 'Sit down and read: hold on to the verse' : 'Get off at Knoll View',
    hotspots: [
      { id: 'read', x: 620, label: 'Open the Bible', required: true, script: 'sb_1', doneFlag: 'c08.verse', doneScript: 'sb_end',
        steps: [{ fx: 'shake' }, { wait: 400 }, { goto: 'faber1', x: 220 }] },
    ],
  },

  faber1: {
    id: 'faber1', chapter: 3, label: '', width: 1500, spawnX: 220, kit: 'faber',
    npcs: [{ id: 'faber', fig: 'faber', name: 'FABER', x: 640, face: -1 }],
    objective: (f) => !f['faber.ear'] ? 'Talk to Faber' : 'Go home. The ladies are coming',
    enter: [{ key: 'e.faber1', steps: [{ say: 'fb_door' }] }],
    hotspots: [
      { id: 'faber', x: 640, label: 'Talk to Faber', required: true, script: 'fb_talk', doneFlag: 'faber.ear', doneScript: 'fb_ear' },
      { id: 'out', x: 140, label: 'Go home', required: true, requires: ['faber.ear'], lockedScript: 'f_leave_locked', exit: { room: 'home4', x: 1450 } },
    ],
  },

  home4: {
    id: 'home4', chapter: 3, label: '', width: 2600, spawnX: 1450, kit: 'home',
    npcs: [
      { id: 'mildred', fig: 'mildred', name: 'MILDRED', x: 1830, face: 1 },
      { id: 'phelps', fig: 'lady1', name: 'MRS. PHELPS', x: 1990, face: -1, when: (f) => !f['c09.read'] },
      { id: 'bowles', fig: 'lady2', name: 'MRS. BOWLES', x: 2150, face: -1, when: (f) => !f['c09.read'] },
    ],
    objective: (f) => !f['c09.off'] ? 'Switch off the parlor walls' : !f['c09.read'] ? 'Talk to the ladies' : !f['c09.burned'] ? 'The kitchen incinerator' : '',
    enter: [{ key: 'e.home4', steps: [{ say: 'l_open' }] }],
    hotspots: [
      { id: 'switch', x: 1560, label: 'Switch off the walls', required: true, when: (f) => !f['c09.off'], script: 'l_off' },
      { id: 'ladies', x: 1990, label: 'Talk to the ladies', required: true, when: (f) => !!f['c09.off'] && !f['c09.read'], script: 'l_talk' },
      { id: 'incin', x: 1330, label: 'The incinerator', required: true, requires: ['c09.read'], lockedScript: 'l_burn_locked', script: 'l_burn',
        when: (f) => !f['c09.burned'], steps: [{ fade: 'out', ms: 900 }, { goto: 'station3', x: 316 }] },
    ],
  },

  station3: {
    id: 'station3', chapter: 3, label: '', width: 2400, spawnX: 316, kit: 'station',
    npcs: [
      { id: 'beatty', fig: 'beatty', name: 'BEATTY', x: 560, face: -1 },
      { id: 'black', fig: 'fireman', name: 'BLACK', x: 1060, face: 1, back: true },
      { id: 'stoneman', fig: 'fireman', name: 'STONEMAN', x: 1170, face: -1, back: true },
    ],
    objective: () => '',
    enter: [{ key: 'e.station3', steps: [
      { fx: 'poleSlide' }, { say: 'st_duel' }, { fx: 'alarm' }, { say: 'st_alarm' }, { fade: 'out', ms: 900 }, { goto: 'lawn', x: 640 },
    ] }],
    hotspots: [],
  },
};
