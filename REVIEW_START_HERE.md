# Start here — complete Fahrenheit 451 Day 2 review

This package continues the existing Claude Code project. It contains the cumulative source, review build, reproducible tests, Git history/patches, actual QA evidence, staged art comparisons, school drafts and Claude handoff. Read `DAY2_QA_REPORT.md` for results and limitations; code being present is not evidence of a passed test.

For the quickest test, read `TEST_IT_FIRST.md` and double-click the top-level `START_GAME_WINDOWS.cmd` after extracting. The supplied build needs Node but no npm install.

## Source and review order

- Repository: https://github.com/hewwobuddy2023-dev/fahrenheit451-game
- Original M2: `feat/m2-chapters` at `94c45a3`.
- Day 2: `work/day2-quality-sprint`; draft PR #2 into Sprint 1: https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/2
- The archive's manifest records its exact final source SHA. Quick visual review is in `04_QA/FIVE_CHAPTER_STAGED_COMPARISON.jpg` and the native five-chapter contact sheet; full-resolution captures retain their source SHA/browser labels. A Git bundle and patches allow independent review even without repository access.

Read the Day 2 handoff first, then the Day 2 QA/performance report, `AGENTS.md`, game/story/challenge specs, both diffs and test results. Sprint 1's older QA report is retained as history. No merge or deployment has been authorized by this development request. Merging into M2 can deploy Pages.

## Suggested review prompt for another chatbot

> Review this existing Fahrenheit 451 Phaser/TypeScript project as an independent engineer. Do not rebuild it or automatically change/merge/deploy it. Read the exact source and evidence before reaching conclusions. Separate inherited work, Day 2 changes, failed initial browser checks, completed reruns and physical-device gaps. Verify branch ancestry and assess the incremental Day 2 diff plus the cumulative result against M2.
>
> Prioritize reproducible defects: native touch/scale/rotation; focus suspension and active encounter deadlines; atomic saves and Continue; 15/15 progression in ordinary play; three ending paths; scripted animation ownership; texture and listener cleanup; gesture-created audio, mute and lifecycle; renderer fallback; readable UI; demo save isolation. Review story order and the school's actual rubric. Do not fabricate a phone test, human playtest, quotation or printed page.
>
> Give findings by severity with file/line references, concrete trigger, impact, reproduction evidence and the smallest fix. Mark hypotheses as hypotheses. Identify the exact remaining acceptance work and recommend whether Claude should accept the two PRs. The owner must approve any integration that may deploy. Preserve existing code and source history.

## Reproduction

Use Node 24 and npm. From the source folder:

```sh
npm ci
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign:all
npm run test:regression
npm run test:day2
npm run test:cinematics
npm run build
npx playwright install chromium webkit
npm run test:browser
npm run dev -- --host 0.0.0.0
```

`npm run preview` serves the source checkout after its build. To inspect the supplied build directly, serve `02_PRODUCTION_BUILD/dist` with a local static HTTP server (for example, `python -m http.server 4173` from that folder). Opening `index.html` as a file is not the supported module-loading route. Browser tools download only for development tests; the built game has no runtime external service. `?diagnostics` shows local input/viewport/errors/audio without transmission; `?debug` exposes QA state; `?lowres` selects base resolution. None makes a normal game count as completed.

## Evidence labels and remaining work

- Deterministic simulations use actual Phaser under DOM/native Canvas, with accelerated time and static-hotspot teleportation. Their FPS inputs are test deltas, not benchmarks.
- Native CI captures identify their source commit/browser/viewport. Linux WebKit is not physical iOS. Initial failures are retained for comparison.
- Staged Canvas before/after art fixtures use explicit flags/effect triggers and do not prove earned progress. Canvas omits some WebGL tints.
- Source tests run three full New Game→15/15 routes and three endings. Full physical-browser campaigns and human enjoyment are different questions.
- The owner still needs physical iPhone acceptance, actual Chromebook/school-network performance, two real human playtests, three short verified page-numbered quotations and a timed 3–5-minute rehearsal. The statement's pre-quotation prose is 308 words; quoted speaking text is 331 words. These drafts require personal review.

The private novel, credentials, node_modules, browser binaries and redundant large tracing recordings are not part of the review package. Relevant screenshots, summaries and test outputs are retained. No automated restart has been configured.
