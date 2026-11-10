# FAHRENHEIT 451: THE FIREMAN'S CHOICE — PREPRODUCTION

Status: proposed/selected design; **no implementation authorized**. School final due **2026-11-13**. Read `AGENTS.md` before any work. Read `PREPRODUCTION_MASTER.md` for full background and confirmed vs recommended decisions.

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

This package intentionally contains no app source, package.json, installed dependencies, or live deployment config; add only when implementation is authorized. Placeholder folders `assets`, `src`, `public`, `tests`, `.github/workflows` reserve expected structure. `.gitignore` is a defensive baseline.
