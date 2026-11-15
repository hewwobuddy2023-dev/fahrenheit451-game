# Fahrenheit 451: The Fireman's Choice

A short 2D narrative adventure based on Ray Bradbury's novel *Fahrenheit 451*. Play Guy Montag through five chapters and fifteen challenges, and choose one of three endings. Built with Phaser 3, TypeScript and Vite. It runs in the browser with no account, backend or install for players.

## Run it

Requires Node 24.

```sh
npm install
npm run dev       # local dev server
npm run build     # typecheck and production build into dist/
npm run verify    # typecheck, unit tests, simulation and campaign suites, build
```

`npm run verify -- --browser` also runs the Playwright suite (Chromium and WebKit). Run `npx playwright install chromium webkit` once first.

On Windows, `START_GAME_WINDOWS.cmd` installs dependencies if needed and starts the dev server.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | A/D or left/right | Arrow buttons |
| Interact / advance dialogue | E, Enter or Space | ACT or tap the dialogue |
| Run | Shift | RUN |
| Choose a response | Up/down, then E | Tap a row |
| Hint | H | ? |
| Dive (river) | Down / S | DIVE |
| Journal / pause | J / Esc or P | JOURNAL / II |
| Mute | M | Settings |

See `RULEBOOK.md` for the full rules. Adding `?diagnostics` to the URL shows a small build, input and audio readout.

## Project layout

- `src/content/` room, script and challenge data for all five chapters
- `src/scenes/`, `src/ui/` title, room, ending, HUD, dialogue, journal
- `src/art/`, `src/world/` painted sets, characters and effects, drawn at runtime
- `src/audio.ts` synthesized sound
- `tests/` unit tests, deterministic campaign runs and browser tests
- `tools/` capture and check scripts

## Credits

Based on *Fahrenheit 451* by Ray Bradbury (1953). Dialogue is original or paraphrased. Engine: Phaser 3 (MIT). Fonts: Oswald and IBM Plex Sans (SIL OFL 1.1), Special Elite (Apache 2.0). Licenses are in `public/licenses/`. See `ASSET_MANIFEST.md` for asset details.
