> **Current review checkpoint:** M2 plus mobile/QA work is on `work/overnight-mobile-qa`, [PR #1](https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/1) into `feat/m2-chapters`. Read [Work handoff](WORK_TO_CLAUDE_HANDOFF.md), [QA evidence](QA_REPORT.md), and [Claude resume prompt](CLAUDE_RESUME_PROMPT.md). Main remains the earlier documentation branch. No Work changes have been deployed.

# FAHRENHEIT 451: THE FIREMAN'S CHOICE

Status: **Milestone 1 (vertical slice) implemented on `feat/m1-vertical-slice`; M2 not authorized.** School final due **2026-11-13**. Read `AGENTS.md` and `PROGRESS.md` before any work.

**Play:** https://hewwobuddy2023-dev.github.io/fahrenheit451-game/

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | A / D or arrow keys | on-screen arrow buttons |
| Interact / advance dialogue | E, Enter or Space (one press = one action; held keys don't repeat) | ACT button, or tap the dialogue box |
| Choose a response | Up / Down (or W / S), then E / Enter | tap the response |
| Journal | J (or the JOURNAL chip) | tap the JOURNAL chip |
| Pause | Esc or P | II button |

URL flags: `?debug` shows an fps readout and exposes `window.__game` for QA. `?lowres` forces 1× render resolution (use it to compare performance on a weak Chromebook).

## Develop

Requires Node 24 (tested with 24.20.0 / npm 11.19.0).

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # save/challenge/content unit tests (node:test)
npm run build      # typecheck + production build into dist/
```

Pushing to `main` or `feat/m1-vertical-slice` runs `.github/workflows/pages.yml`: tests, typecheck, build, deploy to GitHub Pages.

### Code map

- `src/content.ts`: the 15-challenge journal list, completion rules, dialogue scripts and room data. **M2 content goes here.**
- `src/state.ts`: versioned save, checkpoints, challenge rules (pure, unit-tested).
- `src/art.ts`: all art, painted once at boot with Canvas 2D (no image files). `src/stage.ts` places it.
- `src/scenes/`: title, room (movement, hotspots, dialogue flow, pause, journal), end card.
- `src/ui/`: dialogue box, HUD and touch buttons, journal, menu list.

## Working game concept

A 10–15-minute 2D side-view cinematic narrative adventure in which Guy Montag explores compact environments, interacts with key objects/characters, makes choices, solves short thematic puzzles, and survives limited scripted surveillance/Mechanical Hound encounters. Five gameplay chapters, three mandatory novel-linked challenges each, three distinct endings (two alternate, one aligned with the novel's preservation motif). All 15 challenges must be encountered in an ordinary complete run, all flag as completed, and all be visible in a journal.

### Device/platform

- School Chromebook Chrome is **primary**. No downloads, installation, account, or powerful GPU required; aim at 960x540 logical game space, legible at 1366x768.
- Windows PC is primary *development* device, with Claude Code and Codex locally.
- When PC is unavailable, use Claude Code Cloud / Codex Cloud from iPhone against pushed GitHub state, NOT remote desktop.
- GitHub Pages is sole planned production website; v.gd is an optional redirect only. School blocks Surge/Cloudflare/Vercel.
- Browser game must work with keyboard and be secondarily touch-testable from an iPhone landscape browser.

### Technology proposal, awaiting implementer's preflight

Phaser + TypeScript + Vite with lightweight static assets, simple localStorage state, optional automatic *cosmetic-only* quality scaling. Confirm chosen stable version during preflight; don't automatically switch major Phaser versions. No backend. GitHub Actions should build and deploy to GitHub Pages once explicitly authorized. Correct Vite `base` for `/<REPO>/` URLs.

## Before any code

1. Review `GAME_SPEC.md`, `STORY.md`, `CHALLENGES.md`, `ART_DIRECTION.md`, `TESTING.md`, `RUBRIC_AND_SUBMISSION.md`, and `AGENTS.md`.
2. Check `PROGRESS.md` and environment (Node/npm/Git/Claude/Codex/GitHub auth). **Do not silently install anything.**
3. Identify blockers and ask focused questions. Decide on asset style that a small team can execute by Nov 13.
4. Wait for user's **explicit permission to code**.

## Repo scaffold

See "Code map" above. `.gitignore` excludes `node_modules/`, `dist/`, env files, ebook formats (`*.mobi`, `*.epub`, `*.azw*`, `*.kfx`), the private reference folders and `.claude/settings.local.json`. The novel stays outside this repository.


## Day 2 review

Current isolated continuation: `work/day2-quality-sprint`, stacked draft PR #2 into the first Work branch (PR #1). Read `REVIEW_START_HERE.md`, `DAY2_QA_REPORT.md`, and the Day 2 Claude handoff. No merge/deployment performed. `npm run test:campaign:all` runs three complete simulated campaigns; `npm run test:browser` runs the production build through Chromium/WebKit. Physical iPhone/Chromebook tests, two actual human playtests, printed quotation verification and rehearsal remain owner work.

Press M to mute, or use title/pause settings. Reduced motion is available there. `?diagnostics` provides a local-only input/viewport/error panel for reporting phone failures. Background/focus loss pauses behind a return gesture. No audio/network service is required.
