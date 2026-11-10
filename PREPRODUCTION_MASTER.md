# FAHRENHEIT 451 — SHARED PREPRODUCTION HANDOFF

**Status:** Proposed design baseline for approval; **NOT authorization to implement**.  
**Prepared:** 2026-11-09. **Deadline:** 2026-11-13.  
**Primary runtime:** low-powered school Chromebook in Chrome, school Wi-Fi.  
**Development:** Claude Code + Codex on Windows first; independent cloud coding sessions on iPhone when PC is off.  
**Host:** GitHub Pages; optional v.gd redirect (never the only access path).  
**Working title:** *Fahrenheit 451: The Fireman's Choice*.

## 0. Decision authority and priorities

User-confirmed: short (~10–15 minutes), polished indie-style experience; gameplay quality and grading requirements are most important; eerie analog/retro atmosphere; suspense with occasional disturbing moments; exploration, conversations and consequential decisions; Montag story mostly faithful but interactive; 3 distinct endings; return to checkpoint when caught; no jumping; slower cinematic movement but responsive controls; meaningful objects plus occasional optional discoveries; earlier choices influence final options; optional exploration sacrificed first; free assets/tools only; two hours of personal QA available; coding agents may improve details independently but must obtain approval for major creative changes; **do not code before explicit authorization**.

Advisor-selected recommendations (subject to final approval): 2D side-view narrative exploration without jump physics; five compact chapters with 3 visible objectives each; one reusable dialogue system; one simple stealth encounter and one scripted chase; short original dialogue over gameplay, occasional illustrated cards or camera pan; subtle grain and CRT accents, not noisy full-screen VHS; minimal HUD with toggleable journal; default browser-local checkpoints; Presentation Mode with a curated 3–5-minute path. Maintain same core experience on Chromebook, PC and phone; phone touch controls secondary.

Scope hierarchy: (1) reliable opening, 15 novel-connected challenges in one full run, 3 conclusions, rulebook, actual 2-person playtest, 300–400-word connection statement with verified page-number citations, 3–5-minute demonstration; (2) legibility, device support, scene polish; (3) optional discoveries, extra animation and effects.

## 1. Production concept

**Premise:** Control Guy Montag across landmark moments of Ray Bradbury's novel. Explore a handful of small environments, inspect objects, make brief consequential decisions, solve a few thematically connected puzzles, escape state surveillance, and determine Montag's final response to censorship. The primary events track the novel; the alternate endings are explicitly labeled *adaptation outcomes*, not descriptions of Bradbury's canonical ending.

**Game loop:** arrive in scene → receive concise objective → move/look/inspect → dialogue, choice or simple puzzle → objective completion and feedback → transition/checkpoint → next scene.

**Presentation perspective:** 2D side-view rooms, no jumping, primarily horizontal movement; doors/scene exits are deliberate interactions rather than open-world traversal. Walking speed cinematic but not sluggish. Arrow keys or A/D to move, E/Enter/Space to interact/advance, Esc to pause; keyboard-only accessibility. Touch controls (left/right/interact/dialogue) for secondary mobile tests. Exact keymap and UI text to be tested.

## 2. Story fidelity and 15 required challenges

Source consulted: user-provided Simon & Schuster MOBI text of *Fahrenheit 451*. Its narrative has three parts (*The Hearth and the Salamander*, *The Sieve and the Sand*, *Burning Bright*). This file has no reliable fixed printed page map. The following are **original mechanics inspired by confirmed events**, not invented claims about what happens verbatim in the book. Do not claim a particular choice is canonical where it is not.

Each challenge must: (a) be encountered in an ordinary full playthrough; (b) require a discrete player action; (c) set a persistent completion flag; (d) appear by number, objective and book connection in the in-game journal; (e) have a QA test. Optional side content never replaces a mandatory challenge.

### Chapter 1 — The Hearth / introductions (roughly 2–3 min)
1. **Fireman's Duty:** Inspect the fire-station tools, receive a burning assignment, and confirm the official order. *Book connection:* Montag's work and government-approved book burning. **Complete:** interact with dispatch and acknowledge task.
2. **Clarisse's Question:** Walk with Clarisse, inspect one environmental clue of social isolation, and respond to her questioning of Montag's happiness. *Connection:* Clarisse's critical questioning. **Complete:** finish conversation and choose answer.
3. **Parlor Walls:** At home, inspect the parlor screens and an object indicating Mildred's alienation. *Connection:* Mildred, the parlor family and mediated distraction. **Complete:** inspect both marked points and speak to Mildred. The overdose incident may be conveyed sensitively in a brief non-graphic beat, not turned into a game reward.

### Chapter 2 — Books and disillusionment (roughly 2–3 min)
4. **The Woman's House:** During an assignment, inspect the scene and decide how Montag reacts to the woman's refusal to leave her books. *Connection:* the old woman's death as a turning point. **Complete:** inspect evidence, make response choice, proceed. Do not gamify her death as a timed rescue or portray an invented rescue as canonical.
5. **The Hidden Books:** Return home and locate Montag's concealed books while a small suspicion indicator threatens discovery. *Connection:* secretly keeping books. **Complete:** find the stash and conceal evidence before suspicion fills; retry at scene checkpoint on failure.
6. **Beatty's Argument:** Arrange or identify claims from Beatty's explanation of censorship, then respond to him. *Connection:* his account of conformity and anti-intellectualism. **Complete:** select the appropriate thematic relationship and finish conversation. This is an original analytical interaction, not verbatim book dialogue.

### Chapter 3 — The Sieve and the Sand (roughly 3 min)
7. **Find Faber:** Follow two environment clues to meet Faber and discuss what books offer beyond the physical object. *Connection:* Montag's alliance with Faber. **Complete:** reach Faber and interact with two ideas.
8. **The Sieve and the Sand:** In an intentionally brief attention/memory puzzle, retain a short paraphrased idea while intrusive advertisements appear. *Connection:* subway distraction and the metaphor of retaining knowledge. **Complete:** match the idea after one interference cycle, with a Story Mode accessibility retry.
9. **Poetry and Consequences:** Experience a short, original dialogue scene grounded in Montag reading poetry to Mildred's friends; choose a response to their distress. *Connection:* the *Dover Beach* episode and social consequences. **Complete:** choose and witness consequence. Do not reproduce the poem in full.

### Chapter 4 — Burning Bright / pursuit (roughly 3 min)
10. **At Montag's House:** Investigate the fire truck arrival and confront Beatty; dialogue and staging communicate the turning point without requiring elaborate combat. *Connection:* return to Montag's own house. **Complete:** speak and trigger scene progression.
11. **Break with Authority:** A brief escape encounter requiring hiding behind one or two readable obstacles or timing movement around a spotlight. *Connection:* Montag's rupture with the firemen. **Complete:** exit surveillance zone. On detection, restart local checkpoint.
12. **Mechanical Hound:** One scripted pursuit with clear anticipation, readable danger zones and forgiving checkpoint; avoid complex adaptive AI. *Connection:* state pursuit and Mechanical Hound. **Complete:** reach marked exit without capture.

### Chapter 5 — Memory / endings (roughly 2–3 min)
13. **Leaving the City:** Follow environmental cues toward the river and wilderness. *Connection:* escape beyond the city. **Complete:** navigate two markers and transition to river/wilderness.
14. **The Book People:** Meet Granger's group and complete a short idea-preservation pairing or memory exercise. *Connection:* people memorizing books for future generations. **Complete:** correctly connect idea and purpose, with no punitive failure.
15. **The Fireman's Choice:** Review consequential earlier decisions and make one final response to censorship. *Connection:* conformity, resistance and remembrance. **Complete:** view one full ending and record game completion. All three endings must be testable via legitimate choices or a clearly labeled demo/debug mode.

**Novel-event sequencing guardrail:** Clarisse, Mildred, the old woman and Beatty's explanations occur within Part One; Faber and the poetry episode in Part Two; Montag's home, Beatty confrontation, flight, Mechanical Hound, river and Granger in Part Three. The full exact dialogue is not a source to copy wholesale. Preserve sensitive story events without turning tragic events into scoring opportunities.

## 3. Endings and choice system

Three distinct 30–60-second conclusions: **Submission** (alternate, retreats into conformity), **Defiance** (alternate, prioritizes public confrontation with consequences), **Preservation** (closest to novel's final orientation, commits to remembering knowledge with Granger). Endings are adaptations and should be marked as such in presentation materials.

Use at most three meaningful stored choice flags along the route (e.g., responses to Clarisse, book concealment, response to poetry/Beatty). Earlier decisions modify dialogue and the framing/availability of final options. **Do not soft-lock any of the three endings for a first-time player**; if earlier choices gate an ending, clearly explain options and make them accessible through replay or a last-chapter checkpoint. Avoid deep branching levels. All fifteen objectives remain mandatory in each standard full playthrough.

## 4. Presentation and interface

A consistent charcoal/gray, muted cream and ember-red/orange palette; deliberate silhouettes; selected pre-rendered background layers; limited grain and TV interference for transitions, not gameplay-obscuring post-processing. Minimal HUD: current objective, interaction prompt, optional journal showing 1–15 completed; clear text contrast and sane sizing at Chromebook resolution. Dialogue boxes large enough to read, with optional portraits only where useful. The menu should have Play, Continue, Settings, Credits, and a separate **Presentation Mode**. Presentation Mode should rapidly demonstrate an early discussion, one inspection/puzzle, the Mechanical Hound, and an ending, then show the 15-objective journal; it must not falsify ordinary game completion.

Audio: only original, public-domain, CC-licensed (with appropriate attribution), or appropriately licensed sounds/music. Do not add audio streams or outside network calls needed for gameplay. Offer a mute control. No requirement for voice acting.

## 5. Technical baseline / targets

**Proposed (not yet installed):** Phaser 3 + TypeScript + Vite, single-player client-only static application; no server, accounts or backend. Lightweight 2D Canvas/WebGL compatible behavior; gracefully degrade if expensive effects aren't supported. Target logical 960×540 view adapted to Chrome viewport, including common 1366×768 school screens; keyboard at minimum, landscape touch overlay on phone. Target 60fps and stable playability around 30fps on low-end hardware; initial transfer budget aspirational <=20 MB compressed assets (measure, do not assume). Avoid video cutscenes, large texture atlases, continuous full-screen shaders, heavy particle effects, mandatory external APIs and giant libraries.

**Automatic quality:** start low or medium, optionally increase non-gameplay effects after stable frame measurements; avoid constant toggling. Render resolution, background movement, particles and grain can change; collision, physics, enemies, choice outcomes and puzzle timing cannot. Include an override in Settings only if cheap and tested. Use plain legible text even when effects disabled.

**State:** flags for 15 mandatory challenges, small set of choices, chapter/checkpoint, options, and ending viewed; browser localStorage with schema versioning and safe reset. Checkpoint before danger encounters. Optional scene-skip for demo must be marked as demo-only. Never report nonexistent save/cloud synchronization.

**Failure mode:** in stealth/chase, return to most recent in-chapter checkpoint, immediately retryable. Other dialogue/inspection challenges cannot cause soft-lock. Space and Enter should not accidentally advance multiple dialogue panels due to key-repeat.

**School delivery:** GitHub Pages static site at `https://<owner>.github.io/<repository>/` (actual URL TBD); Vite public base path set for repository deployment; deployment via GitHub Actions after successful build/checks; direct canonical URL shown in submission. A v.gd link is convenience only and may be blocked or unavailable; verify it separately on the actual Chromebook. GitHub Pages must be tested for network filtering on school Wi-Fi and for asset paths, HTTPS, starting from clean browser storage. Do not introduce Vercel, Cloudflare Pages or Surge (blocked by school). Backup plan should be realistic: offline access to local files on managed Chromebooks may be restricted, so do not assume a standalone `file://` build works.

## 6. Development workflow: Windows first, cloud fallback

- **Preferred:** Windows + local Claude Code or local Codex. The selected agent works in the versioned project, tests, commits and pushes each reviewed milestone.
- **When PC is off/unavailable:** Claude Code's cloud sessions or Codex Cloud work against the latest pushed GitHub state from the iPhone without remote desktop. Provision and test cloud environments before depending on them. Local unstaged/unpushed files are **not** available to cloud sessions.
- **Collaboration:** `main` is releasable; one agent/task branch at a time for overlapping changes; use pull requests or review before merge. Do not let two agents rewrite the same gameplay system concurrently. Agents can recommend improvements but must request approval for genre, scope, story, stack, or architecture shifts.
- **Living handoff:** keep `AGENTS.md` (agent contract), `GAME_SPEC.md`, `STORY.md`, `CHALLENGES.md`, `ART_DIRECTION.md`, `PROGRESS.md`, `TESTING.md`, `ASSET_MANIFEST.md` synced. This document can seed those files after authorization; it is not proof they already exist.
- **Copyright:** do not commit the full user-provided MOBI or its extracted text to a public repository. Keep book reference private. Brief verified quotations require appropriate page citations in the separate connection statement.
- **Quality gates:** report commands and results, actual preview URL, commit hash, what works, what does not, and next specific task. No false claims of tests, hosted links, two-person playtests or citation verification.

## 7. Milestones and exit criteria

**M0 (approval, no coding):** user accepts this design and Claude/Codex clarify only material implementation blockers. Confirm access to GitHub, local tools and cloud fallback; do not modify repo yet.

**M1 (vertical slice):** one scene with movement, proper camera, 1 meaningful challenge, dialogue, scene exit, checkpoint, valid 2D UI; local build/test passes and a GitHub Pages link loads on target Chrome. Avoid spending the full schedule perfecting the sample scene.

**M2 (complete campaign):** 15 objectives sequentially reachable, persistent journal, one standard complete playthrough, three endings; no softlocks; predictable checkpoints, basic touch input.

**M3 (polish):** background art/audio, coherent menus, transition effects, subtle CRT, optional quality scaling and accessibility; run Chromebook frame-rate/readability tests and smoke tests on iPhone/desktop.

**M4 (submission):** direct Pages link, checked on school Wi-Fi; rulebook (objective, setup, turns/controls, winning/ending, retry), 2 actual human playtests with observations, 300–400-word thematic statement with 3 verified short quotations and accurate printed page numbers from a matched edition, 3–5-minute presentation script and demo route. Include readable evidence of all 15 challenges.

**Date risk:** Today is Nov 9; deadline Nov 13. If M1 is incomplete by end of Nov 10, freeze aesthetic enhancements. If M2 is at risk by Nov 11, reduce optional exploration and scripted effects first, then simplify stealth. Do **not** remove the 15 challenges, rulebook, real playtests or presentation. If needed, fall back to clickable room exploration with decision/puzzle interactions rather than a broken movement game.

## 8. Unresolved issues to resolve before coding

1. GitHub repository owner/name and whether repo will be public (GitHub Pages plan implications).
2. School's actual Chromebook Chrome version, practical viewport and GitHub Pages access test (do not assume hosting permission guarantees client assets).
3. Source of first-pass art/music; require copyright-safe, technically lightweight assets and manifest.
4. Printed page-number source for three quotations; MOBI file does not establish fixed print pagination.
5. Whether teacher has restrictions on AI-assisted game creation; if unknown, avoid claiming there are none.
6. Whether 15 "challenges" must be equally substantial under teacher's rubric; current design treats all as discrete completable actions; make each obviously meaningful.
7. Exact grading date/time and any restrictions on teacher testing the link.

## 9. Coding-agent kickoff contract (for Claude Code or Codex)

You are reviewing a shared, approved-but-not-yet-implemented game proposal. **DO NOT CODE, install dependencies, modify repository or deploy until the user authorizes implementation.** Read this complete handoff; preserve confirmed user choices. Audit practical scope against Nov 13 and weak Chromebook constraints. Challenge any unsound assumption (especially 15 objectives in 10–15 minutes, three endings and low-end performance). Ask only unresolved high-impact technical questions, not a general creative interview. Recommend Phaser/TypeScript/Vite or briefly argue for an alternative, and produce milestone plan with tests and rollback points. When the user authorizes, implement M1 only; commit/push verified results; update `PROGRESS.md` with factual status; show direct GitHub Pages preview; await approval before major changes. The same rules apply whether the active agent is local Claude, local Codex, Claude Cloud or Codex Cloud.

## 10. Delivery and approval state

No source code, repository, website, gameplay build or deployment was created by this handoff. All technical settings above are targets, not benchmark results. **Explicit development authorization remains required.**
