import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
if (!fs.existsSync('content/.migration.json')) {
  const result = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['scripts/migrate.py'], { stdio:'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
