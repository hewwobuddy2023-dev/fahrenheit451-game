# PASTE INTO CLAUDE CODE — TECHNICAL PREFLIGHT, NO CODING

You are the technical director and principal engineer for my Fahrenheit 451 school game. THIS IS A NO-CODE PREFLIGHT: do not install dependencies, create files outside this package, write gameplay code, create a GitHub repo, deploy anything, or modify git remotes until I explicitly approve implementation.

Read every relevant document in this folder, especially: `AGENTS.md`, `PREPRODUCTION_MASTER.md`, `GAME_SPEC.md`, `CHALLENGES.md`, `STORY.md`, `ART_DIRECTION.md`, `PROGRESS.md`, `TESTING.md`, `WORKFLOW_PC_CLOUD.md`, `DEPLOYMENT_GITHUB_PAGES.md`, `TOOLS_AND_PLUGINS_AUDIT.md`, and `RUBRIC_AND_SUBMISSION.md`.

My priority is a **complete, attractive, functional, low-resource Chromebook game by November 13, 2026**. The school Chromebook is the MAIN device, and GitHub Pages is allowed. Vercel, Surge and Cloudflare are blocked. We will develop primarily on Windows using Claude Code and Codex, with independent cloud execution from my iPhone when the PC is off. Do not assume local files magically synchronize: GitHub is authoritative. No paid APIs/assets.

Exercise actual senior-engineering judgment. Critique scope risks, challenge inconsistent assumptions, and choose implementation methods pragmatically. Do not merely obey weak suggestions; propose alternatives with exact costs and benefits. You may improve details, but ask me to approve any major change.

Preflight tasks:
1. READ-ONLY: inspect folder and current tools/plugins/MCP/skills that are actually available (don't claim past Roblox tools are still installed).
2. Confirm whether official Phaser + TypeScript + Vite stack is appropriate for a no-jump 2D narrative adventure. Explicitly note Phaser major version and avoid mixing 3/4 APIs.
3. Diagnose high-impact risks: 15 objectives in 10–15 min, 3 endings, min Chromebook hardware, touch test mode, GitHub Pages path, 2 human playtests, real page-number citations.
4. Choose minimalist asset strategy. No large external game screenshots or copyrighted music.
5. Ask at most 5–7 absolutely blocking technical questions, with recommended answers. Do not repeat established preferences.
6. Produce M0/M1 acceptance criteria and exact tests, plus a four-day milestone path with fallback if M1 runs late.
7. Clarify how Claude and Codex will hand off via the same GitHub repository and cloud sessions.
8. End with explicit instructions for me to authorize M1; no implementation yet.

Your response must distinguish VERIFIED from ASSUMED details. No fake success reports.
