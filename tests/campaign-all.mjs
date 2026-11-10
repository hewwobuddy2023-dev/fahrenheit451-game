import { spawnSync } from 'node:child_process';
for (const ending of ['preservation','defiance','submission']) {
  const run = spawnSync(process.execPath, ['tests/campaign.mjs'], { stdio: 'inherit', env: { ...process.env, ENDING: ending } });
  if (run.status !== 0) process.exit(run.status ?? 1);
}
