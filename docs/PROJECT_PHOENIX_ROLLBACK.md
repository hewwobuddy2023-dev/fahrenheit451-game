# Phoenix recovery and selective review

Baseline SHA: `74f0b2c78294b6dbbe94f1069a7f347654fb0f18`.

Remote backup branch: `backup/pre-cinematic-rebuild-20261110`, created at that exact commit. A local lightweight tag with the same name is also preserved in the review Git bundle. The connected GitHub interface supports branch creation but not tag publication; do not describe the local tag as a remote tag. Existing M1 tag unchanged.

Candidate: `work/cinematic-gameplay-rebuild`, based on Day 2. Its draft PR targets `work/day2-quality-sprint`. Earlier branches/PRs stay unchanged. The previous Day 2 ZIP/build remains independently available.

## Reject the entire candidate

No reset, force push or deletion is needed. Leave the draft PR unmerged. Review/play baseline in a NEW worktree (choose an unused destination):

```sh
git fetch origin
git worktree add --detach ../F451-BaselineReview 74f0b2c78294b6dbbe94f1069a7f347654fb0f18
cd ../F451-BaselineReview
npm ci
npm run build
npm run preview -- --host 0.0.0.0
```

This does not alter another checkout, saves or production Pages. If the candidate has a separate preview, keep its previous build/archive and change only that preview after review. Never roll back the production host without owner authorization.

## Accept individual changes

```sh
git fetch origin
git log --oneline 74f0b2c..origin/work/cinematic-gameplay-rebuild
git diff --stat 74f0b2c..origin/work/cinematic-gameplay-rebuild
```

Create another review branch from Day 2 and cherry-pick only inspected commits, in dependency order. Inspect interdependent input/puzzle/content/tests/art files together. Run unit/type/build, simulations, all campaigns and native tests after selection; compare captures and use the real-device checklist. Do not cherry-pick a mechanic without its content/tests. Claude may reject or rewrite any weak implementation.

If all stacked PRs eventually pass review, integration order is Phoenix → Day 2 → Sprint 1 → M2. No merge is authorized by the development request. M2/main/M1 pushes can deploy the existing live game. Owner must approve any production release.
