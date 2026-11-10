# PC-FIRST, PHONE-SECOND AGENT SWITCHING

## Primary

Windows PC: prefer local Claude Code; local Codex when Claude usage exhausted. Keep Git repo local. Stop only after a **working commit is pushed** when you anticipate leaving the PC.

## Fallback without switching on PC

From iPhone, launch a *cloud execution* session (not remote control) in Claude Code Cloud or Codex Cloud using the same GitHub repo. Agent must pull latest pushed state and read `AGENTS.md`, `PROGRESS.md`. It cannot see local uncommitted or unpushed files, nor use any Windows-only install or secret.

## Handoff steps

1. Current agent confirms tests and commit hash; pushes the branch; updates `PROGRESS.md`.
2. New agent checks branch, commit and PR status and whether another task is active.
3. New agent verifies what is missing or broken rather than assuming prior agent is right.
4. After changes, run tests again, commit/push, and report results.
5. Avoid two concurrent agents editing same game files. If concurrent work is necessary, isolate independent tasks and merge via review.

## First-session setup checklist (requires separate authorization)

- [ ] Git installed and user identity configured.
- [ ] Node/npm appropriate version, lockfile included.
- [ ] Local Claude Code works in project directory.
- [ ] Local Codex works in same repo (credentials remain outside repo).
- [ ] GitHub CLI/credential access available OR standard Git remote authenticated.
- [ ] GitHub repo exists; Pages action and direct preview tested.
- [ ] Claude Code Cloud repo connection and task execution confirmed.
- [ ] Codex Cloud environment created and tested against same repo.
- [ ] Phone can view cloud task updates, PR/commits, live preview and latest PROGRESS.md.
- [ ] No secrets or complete book are in Git history.

## No unnecessary orchestration

Use a single active agent for implementation. Avoid extra MCP servers, dozens of agents or tools that do not accelerate this 4-day project. User previously has several Roblox-oriented integrations; they are not automatically useful in a browser game.
