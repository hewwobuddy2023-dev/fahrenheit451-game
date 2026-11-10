# Fahrenheit 451: The Fireman's Choice

A Phaser 3 / TypeScript narrative adventure: five chapters, fifteen required challenges and three endings. The broad chronology follows Ray Bradbury's novel; Defiance and Submission are alternate adaptations. School deadline: November 13, 2026.

**Current development is the reversible Phoenix candidate**, `work/cinematic-gameplay-rebuild`, draft [PR #3](https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/3) into Day 2. Read [Phoenix handoff](docs/phoenix/WORK_TO_CLAUDE_FINAL_HANDOFF.md), [QA results](docs/phoenix/QA_RESULTS.md), [rollback](docs/PROJECT_PHOENIX_ROLLBACK.md) and [progress](PROGRESS.md). Passing automation does not establish fun, a physical-device benchmark or school-submission readiness.

[Production game](https://hewwobuddy2023-dev.github.io/fahrenheit451-game/) remains the older deployed version. **No Phoenix preview has been deployed.** The review ZIP contains ready-built candidate and Day 2 baseline versions. See [separate preview instructions](docs/phoenix/PREVIEW_SETUP.md); never overwrite production as a shortcut.

## Play and controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | A/D or left/right | Hold arrow buttons |
| Interact / dialogue | E, Enter or Space | ACT or dialogue panel |
| Hose | Hold to build FLOW; release to vent | Pulse ACT; same pressure gauge |
| Response / memory card | Up/down, then E/Enter | Tap a full row/card |
| Read memory source again | Backspace during puzzle | READ AGAIN |
| Optional hint | H | ? or HINT |
| River dive | Short Down/S holds; release to recover breath | DIVE, plus movement with second finger |
| Journal / pause | J / Esc or P | JOURNAL / II |
| Mute | M | Sound in title settings/pause |

Settings → Audio & accessibility includes sound check, volume presets, assisted hose and analog-effect toggle. Reduced motion is in title/pause settings. Sound requires a tap/key gesture; unsupported audio never prevents play. Checkpoints commit whole events, and interrupted conversations restart from the previous safe checkpoint. All five Presentation Mode starts preserve the normal save and label seeded demo progress.

## Develop and verify

Node 24 and npm. No runtime network service, account, commercial music or external audio IDs.

```sh
npm ci
npm test
npm run typecheck
npm run test:simulation
npm run test:campaign:all
npm run test:regression
npm run test:day2
npm run test:cinematics
npm run test:phoenix
npm run build
npx playwright install chromium webkit
npm run test:browser
npm run dev -- --host 0.0.0.0
```

Linux may need Playwright's `--with-deps`. Tests distinguish pure units, deterministic Phaser/Canvas simulation and native Chromium/Linux-WebKit input. The latter is not physical iOS. `npm run test:gallery` produces staged fixtures, not earned-progress evidence.

The review ZIP's Windows launcher serves its prebuilt candidate without npm install. In a source checkout, `node tools/serve-review.cjs` serves `dist` after building. Add a root path and optional port to compare a separate baseline. Opening `index.html` as a file is unsupported.

`?diagnostics`: local-only build/input/viewport/audio/error readout. `?debug`: QA hooks and FPS. `?lowres`: 960×540 base rendering. None grants normal challenge completion. Preferences and story progress use separate local browser keys; no telemetry is transmitted.

## Source map

- `src/content/`: room/event/script data, all fifteen rules and three endings.
- `src/state.ts`, `checkpoints.ts`: v1 saves, event checkpoints and legacy recovery.
- `src/scenes/`: title, room interpreter, ending.
- `src/ui/`: touch HUD, dialogue, journal, menus and ordered recall.
- `src/gameplay/`: time-based hose pressure and finite dive state.
- `src/art/`, `world/`, `assets/`: original procedural sets/cast/effects plus one compressed original generated city layer.
- `src/audio.ts`, `settings.ts`, `focus.ts`, `diagnostics.ts`: local synthesis, preferences and browser lifecycle.
- `tests/`: units, deterministic campaigns/regressions/fixtures and native browser tests.

## Integration and school requirements

Stack: M2 → draft #1 / Sprint 1 → draft #2 / Day 2 → draft #3 / Phoenix. Backup branch `backup/pre-cinematic-rebuild-20261110` preserves Day 2 `74f0b2c`. Owner/Claude can reject the candidate or cherry-pick reviewed improvements. No force push, tag deletion or automatic merge.

The existing workflow deploys pushes to main/M1/M2; PR jobs skip deployment. Any production integration needs owner release approval. The fifteen-challenge campaign, rulebook, two real playtests, a 300–400-word connection statement with three verified printed-page quotations, and a timed 3–5-minute presentation are separate acceptance requirements. Human tests, quotations/pages, real Chromebook/iPhone acceptance and rehearsal remain open.
