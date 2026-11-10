# LIVE PROGRESS — DO NOT INFER RESULTS

**Last updated:** 2026-11-09 (evening, local) by Claude Code (desktop app, Windows PC).
**Stage:** M1 vertical slice implemented. **M2 NOT authorized; stop and ask.**
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
