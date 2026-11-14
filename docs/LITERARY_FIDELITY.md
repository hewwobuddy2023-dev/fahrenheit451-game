# Literary fidelity matrix — novel vs game (2026-11-13)

**Source:** the user's own ebook (MOBI, SHA-256 `4fb3ec89…5f33`), checked by searching the private extracted text. Neither the book nor the extracted text is in this repository.

**Structure:** the novel has **three** parts. The game's **five chapters** are playable divisions only:
- Chapters 1–2 cover Part One.
- Chapter 3 covers Part Two.
- Chapters 4–5 cover Part Three.

**Quotation policy:**
- Only the short, verified phrases in the citation ledger below appear word for word.
- Everything else is original adaptation dialogue.
- Paraphrase is never shown as a Bradbury quotation.

**Status key:**
- **OK**: matches the novel.
- **ADAPT**: deliberate, labelled change.
- **FIXED**: corrected in this pass.
- **GAP**: known and still open.

## Part One: The Hearth and the Salamander (game chapters 1–2)

| # | Novel event | Game scene / file | Status | Note / correction |
|---|---|---|---|---|
| 1 | Montag burns books and enjoys it; he sprays kerosene | `burn` / `ch1.ts`, hose meter | OK | Objective says "spray kerosene". Spray is tinted kerosene-amber, not water. |
| 2 | Clarisse meets Montag at night; she notices moon, dew and billboards | `corner` / `ch1.ts` | OK | Observation choices (`c02.n1–3`) are read in the Preservation epilogue. |
| 3 | Clarisse asks "Are you happy?" | `c_happy` / `ch1.ts` | OK | Exact short quote. |
| 4 | Clarisse is a thoughtful neighbour, not a romance | `ch1.ts` | OK | No romantic framing found. |
| 5 | Mildred's sleeping-pill overdose; technicians; denial the next morning | `home1` / `ch1.ts` | OK | Handled in dialogue, with no minigame. |
| 6 | The firehouse, the Hound's hostility, the rule book "history" | `station2` / `ch2.ts` | FIXED | The 1790 / Franklin claim is now explicitly framed as the rule book's own history, which nobody can check. |
| 7 | The old woman quotes Latimer to Ridley | `attic` / `ch2.ts` | OK | The Latimer line is a 1555 historical quotation. |
| 8 | She strikes the match herself | `a_match` / `ch2.ts` | OK | |
| 9 | Beatty identifies the Latimer reference (he is educated) | `a_match` / `ch2.ts` | FIXED | Added Beatty's identification in original wording, plus Montag's realisation. |
| 10 | Mildred reports, uncertainly, that Clarisse was hit by a car | `h2` / `ch2.ts` | OK | Reported, never shown. |
| 11 | Beatty's lecture; "A book is a loaded gun in the house next door." | `p_3` / `ch2.ts` | FIXED | The paraphrase was replaced with the exact verified sentence; the follow-up line is original. |
| 12 | The book under the pillow; Mildred nearly exposes it | `p_*` / `ch2.ts` | FIXED | Wrong answers raise a visible 'BEATTY'S SUSPICION n/3' meter. At 3/3 Beatty nearly checks the pillow and the scene restarts at its first decision; there is no free retry. |
| 13 | Montag shows Mildred the hidden books | `home2` / `ch2.ts` | OK | |

## Part Two: The Sieve and the Sand (game chapter 3)

| # | Novel event | Game scene / file | Status | Note / correction |
|---|---|---|---|---|
| 14 | Montag remembers Faber and phones him | `home3` / `ch3.ts` | OK | |
| 15 | Subway: Denham's Dentifrice ad drowns "Consider the lilies" | `subway` / `ch3.ts` | OK | KJV (public domain). Reconstruction puzzle with ad interference. |
| 16 | Faber: three missing things, in order | `fb_three1–3` / `ch3.ts` | FIXED | Was one paraphrased line. Now a three-step inference with real wrong answers, using the verified phrases "quality of information", "leisure to digest it" and "the right to carry out actions". Faber then ties the first two to the subway and the Dover Beach scene. |
| 17 | Faber gives Montag the green earpiece | `fb_ear` / `ch3.ts` | OK | |
| 18 | The parlor ladies; Dover Beach; Mrs. Phelps cries, Mrs. Bowles is angry | `home4` / `ch3.ts` | OK | Both reactions are present. |
| 19 | Beatty's duel of quotations at the firehouse; the alarm is Montag's house | `station3` / `ch3.ts` | OK | |

## Part Three: Burning Bright (game chapters 4–5)

| # | Novel event | Game scene / file | Status | Note / correction |
|---|---|---|---|---|
| 20 | Mildred leaves; Montag burns his own house with the flamethrower | `home5` / `ch4.ts` | OK | The wife-turned-in-the-alarm callback appears on the lawn. |
| 21 | Beatty finds the earpiece and threatens Faber; Montag kills Beatty | `lawn2` / `ch4.ts` | OK | Not graphic (flash and fade). |
| 22 | The Hound injects Montag's leg; he burns it; he limps | `lawn2` / `ch4.ts` | OK | Running Hound sprite; `limp` slows movement and caps sprint. |
| 23 | Boulevard; joyriders nearly hit him | `boulevard` / `ch4.ts` | OK | |
| 24 | Books planted at Black's house | `bv_black` / `ch4.ts` | ADAPT | Offered as a choice, not as unquestionably right. The Defiance epilogue says it "changed nothing". |
| 25 | Faber; river; scent; the Hound search | `faber2` / `run` / `river` | OK | |
| 26 | TV announces the capture of an innocent man | `cp_tv` / `ch5.ts` | OK | |
| 27 | Book People: memorised books | `cp_people` / `ch5.ts` | OK | |
| 28 | The city is bombed; Montag remembers where he met Mildred (Chicago) | `war` / `ch5.ts` | OK | |
| 29 | The phoenix: remembering mistakes | `ep_pres` / `ch5.ts` | OK | Paraphrased, not quoted. |
| 30 | The mirror factory | `ep_pres` / `ch5.ts` | FIXED | Added; the only verbatim part is the short phrase "a mirror factory". |
| 31 | Final line: "When we reach the city." | `ep_pres` / `ch5.ts` | FIXED | Added as Montag's closing line in the Preservation ending. |
| 32 | The novel has one ending | `EndScene.ts` | ADAPT | Preservation is labelled "closest to the novel". Defiance and Submission are labelled adaptations, and the replay is marked "not saved". |

## Citation ledger for the connection statement

All excerpts were verified in the user's ebook. **Page numbers are blank on purpose**: the ebook has no printed pages. Fill them in from the teacher-approved print edition only.

| Excerpt | Part | Speaker / context | Print page |
|---|---|---|---|
| "It was a pleasure to burn." | One | Opening narration | ___ |
| "Are you happy?" | One | Clarisse | ___ |
| "A book is a loaded gun in the house next door." | One | Beatty | ___ |
| "quality of information" | Two | Faber | ___ |
| "When we reach the city." | Three | Montag, last line | ___ |

**Needed from you:** the print edition's ISBN and page numbers, or your teacher's permission to cite ebook part and chapter instead.
