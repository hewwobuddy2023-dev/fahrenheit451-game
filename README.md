# Fahrenheit 451: The Fireman's Choice

A Phaser 3 / TypeScript narrative adventure: five chapters, fifteen required challenges and three endings. The broad chronology follows Ray Bradbury's novel; Defiance and Submission are alternate adaptations. School deadline: November 13, 2026.


[Production game](https://hewwobuddy2023-dev.github.io/fahrenheit451-game/) remains the older deployed version. **No preview has been deployed.** The review ZIP contains ready-built candidate and Day 2 baseline versions. See [separate preview instructions](docs//PREVIEW_SETUP.md); never overwrite production as a shortcut.

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
npm run test:mechanics
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


The existing workflow deploys pushes to main/M1/M2; PR jobs skip deployment. Any production integration needs owner release approval. The fifteen-challenge campaign, rulebook, two real playtests, a 300–400-word connection statement with three verified printed-page quotations, and a timed 3–5-minute presentation are separate acceptance requirements. Human tests, quotations/pages, real Chromebook/iPhone acceptance and rehearsal remain open.
