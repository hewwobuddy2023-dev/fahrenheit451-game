# 15 NOVEL-LINKED MANDATORY CHALLENGES (M2, approved 2026-11-09)

All 15 are required in an ordinary single run, in the novel's order, tracked by number in the journal. Completion is derived from flags (`src/content/challenges.ts` → `RULES`). Novel plot is not rewritten by player choices; only the two alternate endings diverge, and they are labelled as adaptations.

Mechanic types: **T1** inspect/choose · **T2** act while watched · **T3** hold to fill · **T4** telegraphed hazard · **T5** untimed recall. No mechanic relies on colour alone, on timed reading, or on inputs beyond left/right/up/down/act.

| ID | Ch | Novel source (Part) | Player action | Completion flags | Safeguard |
|---|---|---|---|---|---|
| 01 | 1 | Opening burn (P1) | T3 soak three book piles with the hose, then light the fire (tone choice) | `c01.p1 p2 p3 lit` | No fail state |
| 02 | 1 | First walk with Clarisse (P1) | Walk-and-talk; three stop-or-walk-on choices; she asks if he is happy | `c02.n1 n2 n3 asked` | All choices progress |
| 03 | 1 | Mildred and the parlor play (P1) | Inspect the three walls, try three times to talk through them, read the script's last page | `c03.w1 w2 w3 t3 script` | Overdose shown earlier as a short non-interactive beat |
| 04 | 2 | The old woman's house (P1) | T2 hide the falling book while Beatty isn't watching; plead or stay silent | `c04.book plea` | Blocked, not failed, while watched; her choice is fixed |
| 05 | 2 | Beatty's bedside visit (P1) | Three beats keeping the pillow book hidden while answering Beatty | `c05.done` | Wrong answer = retry the beat |
| 06 | 2 | The ventilator grill (P1) | Move the chair, T3 pull books from the vent, talk Mildred down, stay still while something sniffs at the door | `c06.chair vent millie still` | Moving restarts only the wait |
| 07 | 3 | Finding Faber (P2) | Find Faber in the file-wallet, phone him | `c07.file call` | — |
| 08 | 3 | The subway (P2) | T5 hold the verse (KJV Matthew 6:28) against the toothpaste jingle | `c08.verse` | Untimed, wrong picks retry |
| 09 | 3 | Dover Beach (P2) | With Faber in his ear: switch off the walls, read the poem, deal with the ladies, burn the book | `c09.off read burned` | Both tones progress |
| 10 | 4 | Montag's own house (P3) | T3 burn the beds and the three walls; the Beatty cinematic; T4 the Hound's leap | `c10.beds w1 w2 w3 beatty hound` | Beatty's death is a brief non-graphic cut; the leap repeats until met |
| 11 | 4 | The boulevard / Black's house (P3) | T4 cross under sweeping headlights; plant books or walk on | `c11.crossed choice` | Caught = back to the kerb |
| 12 | 4 | Faber's sprinklers / the count of ten (P3) | Pick the scent-masking steps; T4 reach the river before the count ends | `c12.mask river` | Timer resets the run only |
| 13 | 5 | The river and the land (P3) | T4 drift past searchlights (hold DOWN to go under); reach the railroad track | `c13.shore track` | Caught = back upstream a little |
| 14 | 5 | Granger's fire (P3) | T5 recall Ecclesiastes 3:1–2 (KJV) as his offering; meet the book people | `c14.recall met` | Untimed |
| 15 | 5 | The war and the morning (P3) | Choose Preservation / Defiance / Submission at the fire; the shared bombing; that ending's epilogue | `c15.ending seen` | All three always offered; earlier flags change wording and consequences |

## Changes from the pre-M2 table
- 01 is now the opening burn (was an equipment check that the novel doesn't have).
- 05 and 06 are swapped to match the novel: Beatty's bedside argument comes before the vent reveal. The claims-matching quiz is gone.
- 11–13 use the novel's own set pieces (the boulevard, the count of ten, the river) instead of an invented spotlight scene.
- Story/Normal difficulty is dropped; every failure resets locally and the recall challenges are untimed.

## Public-domain texts shown verbatim
King James Bible, Matthew 6:28 and Ecclesiastes 3:1–2 (1611; public domain in the US. Note: in the UK the KJV remains under Crown letters patent). Matthew Arnold, "Dover Beach" (1867; author died 1888; public domain). Alexander Pope, "A little learning is a dangerous thing" (1711; public domain). No sentences from Bradbury's novel are reproduced in the game.
