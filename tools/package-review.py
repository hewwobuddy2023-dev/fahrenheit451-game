"""Recover a review package using the read-only GitHub build runner; never deploy."""
from pathlib import Path
import subprocess, shutil, json, hashlib, tarfile, io, os
root=Path.cwd(); out=root/'review-package'; baseline=root.parent/'f451-baseline'
out.mkdir(exist_ok=False)
def git(*args): return subprocess.check_output(['git',*args],cwd=root)
def copy(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)
head=git('rev-parse','HEAD').decode().strip()
base='74f0b2c78294b6dbbe94f1069a7f347654fb0f18'
tracked=git('ls-files','-z').decode().strip('\0').split('\0')
for name in tracked:
 p=root/name
 if p.is_file():copy(p,out/'01_SOURCE/fahrenheit451-game'/name)
for name in ['CRITICAL_AUDIT.md','QA_RESULTS.md','CHALLENGE_REDESIGN_MATRIX.md','VISUAL_DIRECTION.md','AUDIO_DIAGNOSIS.md','PREVIEW_SETUP.md']:
 copy(root/'docs/phoenix'/name,out/'00_READ_FIRST'/name)
for name in ['RULEBOOK.md','CONNECTION_STATEMENT_DRAFT.md','PLAYTEST_FORM.md','PRESENTATION_SCRIPT.md','DEMO_ROUTE.md','RUBRIC_AUDIT.md']:
 copy(root/name,out/'05_SCHOOL'/name)
for name in ['WORK_TO_CLAUDE_FINAL_HANDOFF.md','FABLE_REVIEW_PROMPT.md','OPUS_IMPLEMENTATION_CONTINUATION.md']:
 copy(root/'docs/phoenix'/name,out/'06_CLAUDE'/name)
for name in ['WORK_TO_CLAUDE_HANDOFF.md','CLAUDE_RESUME_PROMPT.md']:
 copy(root/name,out/'06_CLAUDE'/name)
copy(root/'docs/PROJECT_PHOENIX_ROLLBACK.md',out/'06_CLAUDE/PROJECT_PHOENIX_ROLLBACK.md')
shutil.copytree(root/'dist',out/'02_PRODUCTION_BUILD/dist')
shutil.copytree(baseline/'dist',out/'07_BASELINE/dist')
shutil.copytree(root.parent/'f451-native-verified/dist',out/'09_NATIVE_VERIFIED_PHOENIX/dist')
(out/'09_NATIVE_VERIFIED_PHOENIX/COMMIT.txt').write_text('c98d1270c5948cc97e09a0baa962420fe0eb66e0'+chr(10)+'32/32 native checks passed at Actions run 42872448765. This checkpoint includes all new gameplay/art/audio; it predates optional-image timeout and archive-metadata follow-ups.'+chr(10))
with tarfile.open(fileobj=io.BytesIO(git('archive',base))) as t:
 t.extractall(out/'07_BASELINE/source',filter='data')
(out/'07_BASELINE/BASELINE_COMMIT.txt').write_text(base+'\n')
(out/'03_GIT').mkdir()
# Preserve remote rollback branch. A bundle-local backup tag is exact, with no remote tag mutation.
subprocess.run(['git','tag','backup/pre-cinematic-rebuild-20261110',base],cwd=root,check=True)
refs=[head,'refs/remotes/origin/work/cinematic-gameplay-rebuild','refs/remotes/origin/work/day2-quality-sprint','refs/remotes/origin/work/overnight-mobile-qa','refs/remotes/origin/feat/m2-chapters','refs/remotes/origin/main','refs/remotes/origin/backup/pre-cinematic-rebuild-20261110','refs/tags/backup/pre-cinematic-rebuild-20261110','refs/tags/m1-complete']
bundle=out/'03_GIT/F451_ALL_WORK_HISTORY.bundle'
subprocess.run(['git','bundle','create',str(bundle),*refs],cwd=root,check=True)
subprocess.run(['git','bundle','verify',str(bundle)],cwd=root,check=True)
for name,ancestor in [('PHOENIX.patch',base),('ALL_WORK.patch','94c45a3d38a1ec3c562631bd33fe851357a47eee')]:
 (out/'03_GIT'/name).write_bytes(git('diff','--binary',ancestor,head))
(out/'03_GIT/COMMITS.txt').write_bytes(git('log','--oneline','--decorate','--all'))
(out/'03_GIT/CHANGED_FILES.txt').write_bytes(git('diff','--name-status',base,head))
shutil.copytree(root/'docs/qa/day2-phoenix-candidate',out/'04_EVIDENCE/after')
shutil.copytree(baseline/'docs/qa/day2-phoenix-baseline',out/'04_EVIDENCE/before')
for folder in (root/'review-native').iterdir():
 for f in folder.rglob('*'):
  if not f.is_file() or 'test-results' not in f.parts:continue
  if f.suffix not in ['.json','.md','.wav','.png']:continue
  if folder.name=='access-c98d127' and f.suffix=='.png':continue
  copy(f,out/'04_EVIDENCE'/folder.name/f.relative_to(folder))
samples=sorted((out/'04_EVIDENCE').rglob('original-fire-offline-render.wav'))
if samples:copy(samples[-1],out/'00_READ_FIRST/AUDIO_CHECK.wav')
copy(root/'src/assets/phoenix-city.webp',out/'08_ORIGINAL_ASSET/phoenix-city.webp')
copy(root/'docs/phoenix/ASSET_PROVENANCE.md',out/'08_ORIGINAL_ASSET/ASSET_PROVENANCE.md')
for file in root.glob('*-build.log'):copy(file,out/'04_EVIDENCE'/file.name)
for file in root.glob('*-gallery.log'):copy(file,out/'04_EVIDENCE'/file.name)
# Official gh CLI handles authentication/redirects; secrets never enter the package.
jobs=[('build-98e5aa2',130036548760),('browser-98e5aa2',130036548385),('browser-c98d127',130026935226),('failed-build-8a70ce3',130035790691)]
for label,job in jobs:
 p=out/'04_EVIDENCE'/(label+'.log')
 with p.open('wb') as stream:
  result=subprocess.run(['gh','api',f'repos/hewwobuddy2023-dev/fahrenheit451-game/actions/jobs/{job}/logs'],stdout=stream,stderr=subprocess.PIPE)
 if result.returncode: p.write_text('Log unavailable via API at packaging time; see the run and FINAL_NATIVE_RUN.json.'+chr(10))
run=json.loads(subprocess.check_output(['gh','api','repos/hewwobuddy2023-dev/fahrenheit451-game/actions/runs/42875205788']))
(out/'04_EVIDENCE/FINAL_NATIVE_RUN.json').write_text(json.dumps({k:run.get(k) for k in ['id','html_url','head_sha','status','conclusion','created_at','updated_at']},indent=2)+'\n')
# Actual Playwright result, not an inherited claim.
reports=list((out/'04_EVIDENCE/final-98e5aa2').rglob('browser-results.json'))
native_source='98e5aa2'
if not reports:
 reports=list((out/'04_EVIDENCE/access-c98d127').rglob('browser-results.json'));native_source='c98d127'
assert len(reports)==1
native=json.loads(reports[0].read_text())
stats=native['stats']
(out/'04_EVIDENCE/FINAL_NATIVE_STATS.json').write_text(json.dumps(stats,indent=2)+'\n')
copy(root/'START_GAME_WINDOWS.cmd',out/'START_GAME_WINDOWS.cmd')
(out/'START_BASELINE_WINDOWS.cmd').write_text('@echo off\nsetlocal\ncd /d "%~dp0"\nnode "01_SOURCE\\fahrenheit451-game\\tools\\serve-review.cjs" "07_BASELINE\\dist" 4174\npause\n')
(out/'START_NATIVE_VERIFIED_WINDOWS.cmd').write_text('@echo off\nsetlocal\ncd /d "%~dp0"\nnode "01_SOURCE\\fahrenheit451-game\\tools\\serve-review.cjs" "09_NATIVE_VERIFIED_PHOENIX\\dist" 4175\npause\n')
(out/'TEST_THIS_FIRST.md').write_text("""# Test the supplied build
Extract this whole ZIP first. Node.js 24 is needed on the serving PC, but npm install is not needed for the supplied build.

1. For the last fully native-verified Phoenix build, double-click START_NATIVE_VERIFIED_WINDOWS.cmd and use http://localhost:4175/ (c98d127, 32/32 native checks).
2. To review the latest startup follow-up instead, double-click START_GAME_WINDOWS.cmd on Windows (4173). Its last native run had 29 passes, 2 WebKit stalled-image assertion failures and 1 skipped case. It is not declared fully passed.
Keep the chosen server window open and use its printed port in Chrome.
3. Phone: open the printed LAN URL on the same trusted Wi-Fi. Windows firewall must permit private-network access.
4. Optional: START_BASELINE_WINDOWS.cmd serves preserved Day 2 at http://localhost:4174/ for comparison, with a separate save.
5. Stop a server with Ctrl+C. Do not open index.html directly as a file.

Linux/macOS, from this extracted folder:
node 01_SOURCE/fahrenheit451-game/tools/serve-review.cjs 02_PRODUCTION_BUILD/dist 4173

Quick play: New Game; move right; pulse E/ACT through FLOW and release to vent. Try H/? hints, journal, pause, and sound check in Settings > Audio & accessibility. Check all five Presentation starts. In recall, study, try a wrong order, READ AGAIN, HINT and PAUSE. In river, use short DIVE holds and release in darkness to recover breath. Normal play must earn all 15 gates; seeded demo progress is labeled.

Read 00_READ_FIRST/QA_RESULTS.md and the actual FINAL_NATIVE_STATS.json; passing simulations are not human tests. Use the full physical-device checklist there. Append ?diagnostics if tapping fails.

Give this entire ZIP to another chatbot. Begin with 06_CLAUDE/FABLE_REVIEW_PROMPT.md and WORK_TO_CLAUDE_FINAL_HANDOFF.md. Full current/baseline source/builds and Git bundle/diffs are supplied.

No production deployment or public Phoenix preview. No verified iPhone/Chromebook benchmark, human playtest, measured 25-30-minute duration, printed quotation pages or timed rehearsal. The local workspace became unavailable during final upload; this package was regenerated by an isolated GitHub runner. The original generated full PNG and scratch-only local logs were not recovered; the exact game WebP and independently rerun source-specific CI evidence are included.
""")
status_note='\n\nFINAL OBSERVED RESULT: Runtime 98e5aa2, run 42875205788: 29 native passes, 2 WebKit stalled-image assertion failures, 1 skipped case. Both failures reached the title with the city texture present where the harness expected absence. This does not demonstrate a blocked menu, but the claimed forced fallback timing is unproven. An additional error outside a test is retained in the full native log. The last completely passing native checkpoint is c98d127 (32/32), supplied prebuilt on port 4175. Build/unit/full campaign simulation checks pass. Do not describe the latest native rerun as successful.\n'
for dest in [out/'00_READ_FIRST/QA_RESULTS.md',out/'06_CLAUDE/WORK_TO_CLAUDE_FINAL_HANDOFF.md']:
 with dest.open('a') as f:f.write(status_note)
parts=['# Text convenience copy of all source and tests\nAuthoritative paths remain in 01_SOURCE.\n']
for name in tracked:
 if name.startswith(('src/','tests/','tools/','.github/')) or name in ['index.html','package.json','vite.config.ts','playwright.config.ts']:
  try:parts.append('\n\n===== '+name+' =====\n'+(root/name).read_text())
  except UnicodeError:pass
(out/'00_READ_FIRST/ALL_SOURCE_AND_TESTS.txt').write_text(''.join(parts))
js=next((root/'dist/assets').glob('index-*.js'))
(out/'04_EVIDENCE/BUILD_METRICS.json').write_text(json.dumps({'source':head,'dist_bytes':sum(p.stat().st_size for p in (root/'dist').rglob('*') if p.is_file()),'js_bytes':js.stat().st_size,'city_bytes':(root/'src/assets/phoenix-city.webp').stat().st_size,'real_hardware_benchmark':False},indent=2)+'\n')
assert len(list((out/'04_EVIDENCE/before').glob('*.webp')))==11
assert len(list((out/'04_EVIDENCE/after').glob('*.webp')))==11
meta={'head':head,'fully_native_verified_source':'c98d1270c5948cc97e09a0baa962420fe0eb66e0','latest_runtime_source':'98e5aa2df89efe36008eaeb60798ec5a35cc8793','baseline':base,'branch':'work/cinematic-gameplay-rebuild','pr':'https://github.com/hewwobuddy2023-dev/fahrenheit451-game/pull/3','production_deployed':False,'preview_deployed':False,'native_stats':stats,'native_report_source':native_source,'recovery':'GitHub runner after local workspace unavailability','files':[]}
for p in sorted(out.rglob('*')):
 if p.is_file():
  assert not any(s in p.parts for s in ['node_modules','.git'])
  assert p.suffix.lower() not in ['.epub','.mobi','.azw','.azw3','.pem','.key']
  meta['files'].append({'path':str(p.relative_to(out)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'MANIFEST.json').write_text(json.dumps(meta,indent=2)+'\n')
for f in meta['files']:
 p=out/f['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==f['sha256']
print(json.dumps({'head':head,'files':len(meta['files']),'bytes':sum(f['bytes'] for f in meta['files']),'native_stats':stats,'manifest':'PASS','git_bundle':'PASS','deployment':False},indent=2))
