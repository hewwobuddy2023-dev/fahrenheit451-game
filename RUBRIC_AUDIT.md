# Rubric audit — November 10, 2026 (Phoenix)

Deadline: Friday, November 13, 2026. Draft status; no grade or completion claim is made.

| Requirement | Points | Evidence available | Still required |
|---|---:|---|---|
| Fully playable game; fifteen novel-linked challenges; written rules; two people playtest | 25 total | All 15 implemented; sequential Phaser simulation reaches 15/15; three endings independently simulated; `RULEBOOK.md` draft; tests run in PR CI | Owner/Claude browser review, real iPhone verification, Chromebook/school Wi-Fi validation, **two actual human playtests**, review rulebook against accepted build |
| Theme connection statement, 300–400 words, three accurate page-numbered quotations | 15 | `CONNECTION_STATEMENT_DRAFT.md`, theme and mechanic explanations | Owner revise; three verified quotations; matching paginated edition/ISBN; final word count |
| Class demonstration, 3–5 minutes | 10 | `DEMO_ROUTE.md` and `PRESENTATION_SCRIPT.md`; all five Presentation chapter starts are touch-simulated and save-isolated | Timed human rehearsal on class hardware; accepted Pages release; fallback recording if teacher allows |

## Readiness by area

- **Implementation:** complete campaign in source and deterministic simulation; no critical campaign softlock remains in covered routes. This is not proof of every timing/input combination in browsers.
- **Automated quality:** unit, typecheck, build and Phaser simulation evidence is recorded in `QA_REPORT.md` and PR checks.
- **Mobile:** a camera-scroll hit-test defect is reproduced and repaired; missing dive control and quick-tap handling are repaired. The reported total title-screen failure on the physical iPhone is not conclusively reproduced or resolved.
- **Visuals:** reusable flame/river improvements; review actual WebGL/Safari appearance. Canvas simulation captures use fallback fonts.
- **Classroom readiness:** conditional on actual Chromebook performance/network and rehearsal. No Chromebook FPS or download-over-school-Wi-Fi measurement exists.
- **Rubric compliance:** incomplete. Human playtests and verified citations remain mandatory, independent of code quality.

## Suggested remaining schedule — owner actions, not scheduled automations

- Nov 10: Claude reviews PR, runs browser/WebKit checks, owner checks iPhone and Chromebook. Approve integration only after review.
- Nov 11: two actual playtests; fix any blockers; verify quotations/pages; revise the statement.
- Nov 12: rehearse the 3–5-minute route on the school device and check final Pages deployment. Prepare any teacher-approved backup.
- Nov 13: final launch check and submission.


## Day 2 changes

Three separate simulated New Game runs now reach 15/15, one for each ending. Audio, reduced motion, focus suspension, cinematic pose repair, native browser test infrastructure and an eleven-scene composition pass are implemented on the isolated Day 2 branch. Native browser results and their limits belong in `DAY2_QA_REPORT.md`; do not infer success from a test file existing.

Mandatory owner work remains: **two actual people playtest**, **three accurate short quotations with verified printed pages**, personal review of the statement and **a timed Chromebook rehearsal**. No tool can substitute automated runs for these rubric requirements. A review ZIP and two draft PRs do not constitute a submitted or deployed release.
