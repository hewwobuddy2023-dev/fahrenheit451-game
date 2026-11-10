# AGENT CONTRACT — CLAUDE CODE / CODEX / CLOUD SESSIONS

## Authority, safety, and continuity

1. **STOP GATE:** This workspace is currently preproduction. Do not generate game code, install dependencies, create remote repos, deploy, or modify GitHub until the user explicitly authorizes implementation.
2. `PREPRODUCTION_MASTER.md` + `GAME_SPEC.md` + `CHALLENGES.md` are the agreed direction, except where a newer explicit user decision supersedes them. Distinguish user's confirmed requirements from the consultant's provisional technical recommendations.
3. You are expected to exercise judgment: critique weak designs, propose simpler substitutes, optimize implementation details; **do not** silently change story structure, genre, core mechanics, performance goals, required challenge count, three endings, or hosting. Ask for approval of material changes.
4. User wants non-patronizing, concise but exact engineering discussions; full copyable prompts/commands; report what was **actually verified**, never pretend tests/links/playtests worked.
5. Preserve working code. Prefer small changes, tests, commits and rollback points. Never merge destructive changes or rewrite another agent's active branch without review.
6. Never put source ebook (MOBI), extracted full text, secrets, `.env`, API keys or private school materials in public repo. Brief, verified, attribution-safe quotations only where necessary; print edition page numbers unverified.

## Shared Git workflow after authorization

- `main`: stable releasable version only. `feat/m1-vertical-slice`, `feat/challenge-...`, `fix/...` for working changes.
- Each milestone: `git status` -> inspect diff -> run available build/lint/test/smoke checks -> commit -> push -> update `PROGRESS.md` with *commit hash* and verified output -> review/merge.
- Never push `02_PRIVATE_REFERENCE_DO_NOT_PUSH` or ebook. Do not commit browser session recordings without inspecting privacy, size and permissions.
- Use only one active writer for intersecting game files. Claude/Codex can alternate using same branch when safely synchronized; otherwise PRs.
- In cloud sessions: start by reading `AGENTS.md`, `PROGRESS.md`, latest merged commit, outstanding PRs; stop if local PC work is reported but not pushed.

## Default deliverable for every coding turn (after authorization)

1. What was changed (files/feature).
2. Command outputs for build/tests; distinguish simulated and real browser tests.
3. Measured bundle size / frame rate if actually collected.
4. Git branch and commit hash; push/PR/deploy status.
5. Known defects and concrete next action; update `PROGRESS.md`.

## Scope priorities

P0 mandatory: 15 novel-linked challenges across complete ordinary playthrough, 3 endings, accessible controls, Chromebook launch, rulebook, 2 real playtests, 300–400-word statement with 3 verified page-number quotes, 3–5-minute demonstration.
P1: checkpoint/retry, readable dialogue, concise journal, useful atmosphere, presentation mode, stability.
P2: additional animation, optional exploration, extra visual effects. CUT P2 first under deadline pressure.

## Multi-agent tool discipline

Use GitHub/Git, official Phaser docs, direct browser testing, and minimal relevant tools. Prior Roblox integrations such as Roblox Studio MCP, Rojo, Blender MCP, ForgeGUI/ForgeMCP are NOT required for this 2D browser project. Ponytail/Graphify/Claude-Mem may be reused **only after confirming installed/current and not hindering focus**. Never invent current installation state.
