# Ready-to-paste Claude Code resume prompt

You are resuming my existing **Fahrenheit 451: The Fireman’s Choice** project in Claude Code on my Windows PC. ChatGPT Work collaborated while the PC was unavailable. Review its changes before integrating them. Do not restart the game or assume main has current source.

Repository: https://github.com/hewwobuddy2023-dev/fahrenheit451-game
Original M2 branch/checkpoint: `feat/m2-chapters` at `94c45a3d38a1ec3c562631bd33fe851357a47eee`.
Work branch: `work/overnight-mobile-qa`.
Draft review PR: https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/1 (base M2).
Original PC checkout: `C:\Users\gabe\Documents\Fahrenheit451Game`.
Deadline: Friday, November 13, 2026.

First read current `AGENTS.md`, `WORK_TO_CLAUDE_HANDOFF.md`, `QA_REPORT.md`, `PROGRESS.md`, `TESTING.md`, and the PR diff/checks. The handoff gives the verified implementation SHAs, changed files, exact commands, tests and limitations. Fetch remote state and inspect my PC checkout for uncommitted/unpushed work. Preserve it. Use a separate review worktree as the handoff describes; never reset or clean my existing checkout.

Work repaired a reproducible camera-scroll touch hit-test mismatch caused by Phaser’s container helper skipping inherited scroll factors. It added DIVE, whole-row touch targets, wrapped dialogue choices, pointer-owned holds/cancellation and quick Hound tap latching. It made save checkpoints atomic across complete story events, recovered legacy interrupted transitions, caught localStorage getter failures, fixed completed-ending Continue, and added a cancel-first restart confirmation. It also fixed a destroyed spray-emitter reference crashing the Chapter 2 vent after Chapter 1 and paused stillness progression behind overlays.

Visual changes are restrained and reusable: padded smooth flame frames, a surface-floating river silhouette/wake instead of walking across water, a correct walking/shadow return at shore, clearer control wording/objectives, safe-area viewport sizing and Latin-only font CSS. Preserve the approved dark analog dystopia. No runtime dependency upgrade, engine change, full 3D or hosting switch occurred.

The automated evidence is substantial but limited: 9 unit tests, TypeScript, production build and actual Phaser DOM/native Canvas simulations pass. The simulation completes 01–15 in sequence and three endings independently, wrong-answer and Hound retries, stillness reset/pause, hazard captures/crossings, chapter Continue, all five Presentation chapter starts with normal-save isolation, storage errors, rapid inputs and restart confirmation. It uses synthetic touch events, fallback fonts and deterministic time. **It is not a browser or real iPhone test.** Work could not launch local Chromium, had no WebKit executable, and did not test my physical iPhone or Chromebook. Existing deployed Pages rendered in cloud Chrome, but that was the old baseline, not Work source.

My original report that nothing can be tapped on the real iPhone is still not conclusively closed. The scrolled-room failure is a verified fix; baseline title synthetic taps worked. Do not claim the phone is fixed solely because these tests pass.

Run from the isolated review checkout:

```powershell
npm ci
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign
npm run test:regression
npm run build
npm run dev -- --host 127.0.0.1
```

Inspect code and visual diffs; compare the labeled Canvas fixtures in `docs/qa` against actual browser rendering. Test the patched build in Chromium and true WebKit where available. Test real keyboard and synthetic browser touch, portrait/landscape/resizing and safe areas. Specifically test title New Game/Continue, all Presentation rows/Back, held movement/ACT, quick taps, dialogue choices, journal/pause, Hound miss/retry, two-finger river dive, shore animation, all ending cards/title returns and interrupted-save recovery. Ask me to test the real iPhone when a reviewed build is reachable through an approved route. Do not silently deploy it for that purpose.

Then validate on my actual school Chromebook and school Wi-Fi. Measure demanding scene FPS with debug/default and lowres, a five-minute scene, and escape fairness under reduced frame rates. Simulation FPS is not performance evidence. Prioritize critical compatibility defects over more art.

Review any conflicts with newer M2 or PC changes safely on an isolated branch, preserve both writers’ work, and rerun checks. Give me your findings, any blockers, and a specific merge recommendation. **Merge only after I explicitly approve.** Do not merge into main, force-push, delete branches/tags, overwrite my work or change GitHub Pages hosting. The current workflow deploys pushes/merges to M2, so treat integration as a potential release action and confirm approval before it occurs.

After acceptance, continue school readiness: two actual human playtests; verified matching-edition quotations/pages; personal revision of the connection statement and final word count; rulebook review; and a real timed 3–5-minute demonstration. Work supplied `RULEBOOK.md`, `CONNECTION_STATEMENT_DRAFT.md`, `PRESENTATION_SCRIPT.md`, `DEMO_ROUTE.md`, `PLAYTEST_FORM.md`, `RUBRIC_AUDIT.md` and `PERFORMANCE_AUDIT.md`. They contain placeholders and explicit unfinished requirements. Do not invent pages, playtests, benchmarks or rehearsal evidence, and never publish the complete novel.

One inherited narrative documentation mismatch is noted: `faber.tear` is stored but does not currently have its own ending branch, despite a STORY claim. Decide whether a small approved detail or a documentation correction is appropriate; preserve chronology, all fifteen challenges, all three available endings and shared city destruction.

No automatic five-hour continuation was configured. Keep logical commits, update the handoff/progress after verified milestones, and leave the next exact task recorded. Start by inspecting the PR and preparing the isolated review now.
