# Ready-to-paste Claude Code prompt — review both Work sprints

Resume my existing **Fahrenheit 451: The Fireman's Choice** game. Deadline: Friday, November 13, 2026. Preserve my game, Phaser/TypeScript/Vite stack, 15 mandatory challenges, three endings, novel event order and GitHub Pages hosting. Do not restart or blindly merge.

Repository: https://github.com/hewwobuddy2023-dev/fahrenheit451-game
Original M2: `feat/m2-chapters`, verified checkpoint `94c45a3`.
Sprint 1: `work/overnight-mobile-qa`, verified base/head `19b9328`, draft PR #1 into M2: https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/1
Day 2: `work/day2-quality-sprint`, draft PR #2 into the Sprint 1 branch: https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/2
My expected original PC checkout: `C:\Users\gabe\Documents\Fahrenheit451Game`.

Read `AGENTS.md`, the **Day 2 section of `WORK_TO_CLAUDE_HANDOFF.md`**, `DAY2_QA_REPORT.md`, `QA_REPORT.md` (historical Sprint 1), `PERFORMANCE_AUDIT.md`, `TESTING.md` and both PR diffs/checks. Fetch actual current remote heads. Inspect my original checkout for uncommitted/unpushed work and preserve it. Use an isolated review worktree as the handoff describes; never reset/clean my checkout or force-push.

Review incremental Day 2 diff (`19b9328..Day2`) and cumulative result (`94c45a3..Day2`). Sprint 1 fixed scroll-factor hit targets, DIVE, quick Hound taps/cancellation, atomic checkpoints, legacy recovery, ending Continue, restart confirmation, a destroyed emitter crash and paused stillness; it added flame/river polish and school drafts.

Day 2 adds explicit focus suspension and active encounter time, local-only `?diagnostics`, real Chromium/WebKit test infrastructure, original gesture-unlocked synthesized ambience/cues with mute and separate settings, reduced motion, stage/cast/forest/ground polish, cinematic pose ownership, fresh-opening truck creation, a global cosmetic resolution fallback, consistent movement/deadlines at low FPS, frozen pause hazard phases and a brief `faber.tear` Defiance detail. Runtime dependency versions remain unchanged; Playwright is new and dev-only. Review audio cleanup, local preferences, font fallbacks, scale transitions and timing carefully.

Run:

```powershell
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

Separate evidence types. Deterministic Phaser simulations complete three full New Game→15/15 routes, all endings, retries, saves, slow-delta escape and render/input regressions. Native browser tests use browser-protocol inputs and read state; no debug progression calls. Their completed job results and failed initial evidence are in the Day 2 report. Trace screenshots caused severe headless GPU readback overhead in the first run; do not fabricate performance conclusions. Linux WebKit is not iOS. Test code existing is not evidence it passed.

**My physical iPhone's original total tap failure is still not conclusively closed.** Test the reviewed source on my phone through the local LAN URL; use `?diagnostics` on a failure. Verify early/repeated taps, fresh and old saves, all demo rows, holds, dialogue/choices, journal/pause, quick Hound retry, two-finger river DIVE, endings, rotation/toolbars/safe areas, lock/background/resume, mute and iOS audio. Check real Chromebook/school Wi-Fi, demanding scene FPS/lowres, five-minute stability, keyboard and timed presentation.

Inspect representative all-five-chapter native captures and staged before/after gallery. Canvas fallback omits some tints; staged flags/effect triggers are art fixtures, not earned challenge evidence. Preserve working fire/float systems. Do not add unrelated systems or untested dependencies under the deadline.

School requirements are not finished: two actual people must playtest; three exact short quotations need verified printed page numbers/edition; final statement must be 300–400 words after insertion; a 3–5-minute presentation must be rehearsed. Current prose is 308 words before quotations and the script has 331 quoted spoken words. Never claim these human tasks occurred. Do not publish the private MOBI or full novel.

After review, give a clear merge recommendation and the highest-priority remaining task. If both PRs pass and I approve: integrate #2 into the Work branch first, then review #1's expanded cumulative result. **Only merge #1 into M2 after my explicit release approval: pushes/merges to M2 can deploy Pages.** Do not merge or deploy automatically. If M2 or either Work base advanced, compare all heads and resolve conflicts on a separate review branch, rerun checks and preserve everyone else's work.
