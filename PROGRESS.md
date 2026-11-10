# LIVE PROGRESS — DO NOT INFER RESULTS

**Last updated:** 2026-11-09 (evening, local) by Claude Code (desktop app, Windows PC).
**Stage:** M2 in progress on `feat/m2-chapters` (authorized 2026-11-09). M1 preserved as tag `m1-complete`.
**Local repo:** `C:\Users\gabe\Documents\Fahrenheit451Game`
**GitHub repo:** https://github.com/hewwobuddy2023-dev/fahrenheit451-game (public). Branches: `main` (docs only), `feat/m1-vertical-slice` (M1).
**GitHub Pages:** https://hewwobuddy2023-dev.github.io/fahrenheit451-game/ (deploy status below). The `github-pages` environment allows deploys from `main` and `feat/m1-vertical-slice`.
**Stack (pinned):** phaser 3.90.0, typescript 5.9.3, vite 6.4.6; fonts @fontsource/oswald, ibm-plex-sans, special-elite 5.3.0. Node 24.20.0 / npm 11.19.0 locally; CI uses Node 24.
**Novel:** private MOBI lives outside the repo (`Documents/F451_PRIVATE_REFERENCE/`). Not tracked; checked with `git ls-files | grep -iE 'mobi|epub|azw|kfx|novel|private|\.env|settings\.local'` → nothing.
**Playtests:** 0 human playtests.
**Rubric writing:** not started.

## Milestone log

| Milestone | Status | Commit | Build test | Browser test | Notes |
|---|---|---|---|---|---|
| M0 Design/preflight | Done | — | N/A | N/A | Approved by user 2026-11-09 |
| M1 Vertical slice | Implemented, awaiting user review | see `git log` on `feat/m1-vertical-slice` | Local + CI pass | Dev server, built-in browser pane (Chromium) | Details below |
| M2 15 challenges + endings | Not started | — | — | — | Needs approval |
| M3 Art and audio polish | Not started | — | — | — | — |
| M4 Submission | Not started | — | — | — | — |

## M1: what exists

- Title menu: Continue (disabled when no valid save), New Game, Presentation Mode (chapter select; Ch. 1 only, never saves), Credits.
- Fire station scene (2400 px wide, parallax city through windows, lamp light cones, dust, Hound kennel, dispatch board, Salamander truck). All art procedural (`src/art.ts`).
- Challenge 01 "Fireman's Duty" (data-driven, `src/content.ts`): inspect equipment rack + kerosene pump → dispatch teletype unlocks (red bulb pulses) → choose one of two acknowledgements (sets `c01.ack` and `c01.tone`) → board the truck → end-of-preview card.
- Optional hotspots: brass pole, history card, card game (Black/Stoneman), Beatty, Hound (growl effect).
- Journal (J): all 15 challenges, completion derived from flags. HUD objective panel and toast on completion.
- Save: `localStorage['f451.save']`, schema `v: 1` `{room, x, flags}`. Checkpoint on arrival and after each conversation. Corrupt or foreign saves are ignored (no crash). Flags apply only when a conversation finishes.
- Pause (Esc/P): Resume, Journal, Save & quit. Touch buttons (◀ ▶ ACT II) on touch devices; hidden while dialogue or menus are open.
- Render resolution: logical 960×540; canvas renders at zoom K (1–2×, by screen size × devicePixelRatio) so text stays sharp. `?lowres` forces 1×. `?debug` shows fps.

## M1: verified results (2026-11-09)

Local (Windows):
- `npm test` → 5 pass, 0 fail (corrupt saves, round-trip, blocked storage, Challenge 01 rule, demo never writes, content consistency).
- `npx tsc --noEmit` → no errors.
- `npm run build` → success; JS 1,532 KB raw / ~355 KB gzip; loaded latin fonts ~175 KB total. `dist/` 2.6 MB on disk (unused font subsets included, not downloaded).

Browser pane (Chromium, emulated 1366×768, dev server, NVIDIA GTX 1070 PC; **not a Chromebook**):
- Title renders, no console errors. ~222 fps when the pane is visible (meaningless for Chromebook).
- Real key presses: Enter starts game; pole-slide intro; E opens dialogue; Enter/Space advance; Down + Enter picks second choice; J journal; Esc pause/resume.
- Synthetic held-D keydown (1.5 s) → walked 316 → 560 at 175 px/s, walk cycle played, eased to stop, camera followed. (Tool taps are too short to walk, so the hold was a synthetic event.)
- Five synthetic auto-repeat Enter events during dialogue → no advance (key-repeat guard works).
- Player was **teleported via JS** between hotspots to save time; interactions themselves used real keys.
- Challenge 01: rack alone → 0/15; rack + pump → objective "Answer the dispatch teletype"; after choice → toast "CHALLENGE 01 COMPLETE", journal 1/15, save contains `c01.tone: "curious"`.
- Reload → Continue → same position (x 2000), flags and objective. Board truck → end card.
- Corrupted save string → Continue disabled, New Game selected, no crash.
- Presentation Mode → flags set in memory, `localStorage` unchanged.
- Emulated touch at 740×360: ACT button opens dialogue, tapping box advances/closes, touch buttons hide during dialogue.

GitHub Actions: run `42735631851` (commit `2cb767d`): build job (npm ci, test, build) and deploy job both succeeded.

Live Pages URL (production build, browser pane on this PC, fresh tab, empty storage):
- `…/fahrenheit451-game` (no trailing slash) redirects to `…/fahrenheit451-game/`.
- 9 requests, all HTTP 200: JS (351 KB transferred), CSS, 7 latin woff2 fonts. All 7 font faces report `loaded`. ~514 KB total first load.
- New Game → inspect rack (player teleported, real keys) → "CHECKPOINT SAVED" → reload → Continue → room at x 600 with `c01.rack` set and objective 1/2.

## Known gaps / deferred (not done in M1)

- **Chromebook performance not measured.** Do this first: open `…/fahrenheit451-game/?debug` on the school Chromebook, walk the station, note fps; then compare `?debug&lowres`. If fps < ~45 at default, add automatic resolution scaling (cap K) in M2. Auto quality scaling deliberately deferred until measured (user instruction).
- No audio, so no mute toggle yet. No Settings menu (ART_DIRECTION lists one).
- New Game overwrites an existing save without confirmation.
- Touch buttons also appear on touchscreen Chromebooks (harmless, may look busy).
- Not tested on a real iPhone or real Chromebook. 0 human playtests.
- `K` (render zoom) is chosen at load; resizing the window later only rescales.

## Blockers

1. User review/approval of M1 before M2.
2. School Chromebook + school Wi-Fi test of the Pages URL (user).
3. Printed edition page numbers for the three quotations (user).
4. Two human playtesters for Nov 12 (user).

## Next task

User reviews M1 at the Pages URL, runs the Chromebook `?debug` check, then authorizes M2 (`PROMPTS/02` style, M2 scope).

## M2 chapter log (branch `feat/m2-chapters`)

| Chapter | Challenges | Commit | Tests / typecheck / build | Browser run (dev server, built-in pane, this PC) |
|---|---|---|---|---|
| 1 | 01–03 | `de3b88e` | 7/7 pass · tsc clean · build OK (372 KB gz JS) | New game → burn (held-E soak, real-key ignition choice) → firehouse → Clarisse walk (held-D walking, 4 choices) → home night beat → parlor (walls, 3 talks, script). Journal 3/15. Reload + Continue restored room/x/flags without replaying the night scene. Player teleports and dialogue auto-advance used a debug helper in places. |
| 2 | 04–06 | (this commit) | 7/7 pass (rules ≤6 checked) · tsc clean · build OK | Continue from Ch1 save → firehouse (locked board, Hound growl, cards, alarm) → attic (E pressed while Beatty watching = blocked with his line; pressed when he looked away = hidden) → woman (plead) → night → Beatty visit with one wrong answer per beat (each retried) → chair, held E at vent 2.7 s, Mildred (wrong reply retried), 'stay still' with one deliberate move → Ch3. Journal 6/15. Debug helper used for teleports/dialogue advance. |
| 3 | 07–09 | (this commit) | 7/7 pass (rules ≤9) · tsc clean · build OK | Continue → phone locked until file-wallet → call → subway verse with 2 wrong jingle picks (retried) → Faber (tear pages) → earpiece → ladies (switch, press, book, apologise) → incinerator → Beatty's duel → arrival at Montag's house. Journal 9/15. Debug helper used. |
| 4 | 10–12 | (this commit) | 7/7 pass (rules ≤12) · tsc clean · build OK | Lawn (Mildred leaves) → held-E flame thrower on beds + 3 walls → Beatty cinematic (non-graphic white cut) → Hound prompt → books → boulevard. **Bug found and fixed:** a beam patrolling the only walk line can never be passed (14 catches, no progress); boulevard and alley now use timed lanes with safe gaps. After the fix: boulevard crossed in 22 s with 0 catches; Black's house (plant); Faber masking with 3 wrong picks retried; count-of-ten run reached the river, 0 catches. Journal 12/15. Walker helper sends synthetic held keys. |
| 5 | 13–15 + endings | (this commit) | 7/7 pass (all 15 rules achievable) · tsc clean · build OK | **NOT yet browser-tested** (usage limit reached). River, Granger's fire, recall, choice, shared bombing, 3 epilogues and the ending card are written but unplayed. |

**Next session:** browser-test Ch5 and all three endings; screenshots per chapter; deploy check of the Pages URL; final M2 report. M2 not declared complete.

## Work mobile checkpoint — 2026-11-09 (Phoenix)

Work branch: `work/overnight-mobile-qa`, based on verified remote M2 `94c45a3`.
Implementation is authorized by the owner's overnight request; the preproduction stop gate above is obsolete for this sprint.

- Reproduced scrolled-camera input failure in actual Phaser TouchManager under DOM/native Canvas simulation: container child hit targets retained inherited scroll factor 1. Explicit scroll factor 0 repairs touch buttons, dialogue, choices, journal and pause blockers. This does **not** conclusively explain the owner's title-screen Safari report; baseline title taps worked in simulation.
- Enlarged menu rows and choice targets; added DIVE, pointer-specific holds/cancellation, and event-latched Hound taps. Safer event-boundary saves and recovery of six legacy interrupted transition checkpoints; completed ending Continue returns to ending card. Storage getter exceptions now stay inside error handling.
- `npm test`: inherited 7 passed before edits; expanded suite pending final checkpoint. `npm run typecheck` passed after initial source edits. `npm run test:simulation`: New Game, dialogue taps, held movement, journal and pause passed at 844×390, 667×375, 390×844, and 1366×768/lowres. This is simulation, **not browser/iOS testing**.
- Local Chromium launch blocked by socket permission; cloud browser could not reach local server; WebKit executable absent. No physical phone/Chromebook or human playtest performed. No deployment or merge.
- Next: complete campaign simulation (all 15, Ch5 and three endings), add save/retry regressions, then review/build/push and create PR.

### Campaign checkpoint (after `4155f7e`)

- Actual Phaser simulation now completes an ordinary sequential 01–15 run with Preservation. Defiance and Submission each complete independently from the legitimate 14/15 campaign checkpoint. Chapter boundary saves Continue into Chapters 2–5; a completed ending reloads its ending card and returns to title.
- Fixed destroyed spray-emitter reuse across room restarts (reproduced crash at Chapter 2 vent after Chapter 1 hose), and paused stillness waits progressing behind the pause overlay. Stillness movement notices now appear once per held movement rather than every frame.
- Covered 15 wrong recall/dialogue picks, watching/looking-away book theft, one missed Hound prompt, stillness movement/reset plus six-second pause, boulevard capture/crossing, count-of-ten reset and full escape, river capture and two-finger dive crossing.
- Targeted regressions pass: corrupt/unknown-room saves, blocked localStorage getter through boot/checkpoint, all 5 Presentation Mode touch starts and quits without changing the normal save, two-finger release/cancel, keyboard movement/blur, repeated Enter suppression and interrupted ignition save rollback.
- Local checks: 9 unit tests, typecheck, build, 4 viewport touch configurations, campaign and regression suites all PASS. Added these simulation suites to PR CI. These are deterministic DOM/native Canvas simulations; fonts use system fallbacks, timestamps are advanced by the harness, and no browser engine/hardware FPS claim follows from them.
- Draft PR: https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/1. Initial PR CI run `42749692291` passed. No deployment.
- Next: reusable flame/river presentation polish, school drafts, performance/source audit and final Claude handoff; then full regression/CI review.

### Reusable polish checkpoint

Campaign verification commit `5d4a450` is pushed. PR CI run `42750416512` passed all newly added simulation suites plus unit/build checks.

- Added padded eight-frame flame cells with smoother phases and retained orange bodies; small floating surface silhouette/wake replaces walking in the water and returns to the civil walk/shadow on shore. Added real texture-edge and swim/shore regressions. Comparison captures are labeled Canvas simulations in `docs/qa`.
- Improved mobile control wording, objective wrapping/readability, larger chapter-select rows, and a cancel-first New Game confirmation before replacing an existing save. Safe-area sizing uses an inset inner parent because Phaser measures border-box bounds; padding would produce a wrong fit.
- Latin-only font CSS reduces production CSS from 12.50 kB to about 1.54 kB and removes unused font subsets from output. No runtime packages changed; new packages are test-only (`jsdom`, native Canvas, and explicitly declared `esbuild`).
- A cloud Chrome view of the existing deployed Pages baseline rendered the title and reached the opening after mouse/Enter inputs. Its low/throttled reported FPS is not a Chromebook benchmark. The Work branch was not served to that browser. No true WebKit or physical iPhone testing occurred.
- Latest local unit, typecheck, touch, campaign, regression and build checks passed before this documentation checkpoint; final CI result will be recorded in the handoff. No merge/deploy performed.
