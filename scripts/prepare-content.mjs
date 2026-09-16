import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const migrations = [
  ['content/.migration.json', 'scripts/migrate.py'],
  ['content/.member-copy-v4.3.json', 'scripts/publish-member-copy.py'],
];
for (const [marker, script] of migrations) {
  if (fs.existsSync(marker)) continue;
  const result = spawnSync(process.platform === 'win32' ? 'python' : 'python3', [script], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
