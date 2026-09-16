import fs from 'node:fs';
import crypto from 'node:crypto';
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
// Finish the one-time conversion of the source's inline supplementary heading.
// This guard prevents subsequent hand-edited Markdown from being rewritten.
const checkpointPath = 'content/.member-copy-v4.3.json';
const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
if (!checkpoint.supplementHeadingFormatted) {
  const file = 'content/bylaws.md';
  const source = fs.readFileSync(file, 'utf8');
  const digest = value => crypto.createHash('sha256').update(value).digest('hex');
  if (digest(source) !== checkpoint.files.bylaws) throw new Error('Bylaws changed after member-copy review; refusing to overwrite them.');
  const target = '\n제2조(경과조치)\n';
  if (source.split(target).length !== 2) throw new Error('Expected one supplementary heading.');
  const updated = source.replace(target, '\n\n### 제2조 경과조치\n');
  fs.writeFileSync(file, updated);
  checkpoint.files.bylaws = digest(updated);
  checkpoint.supplementHeadingFormatted = true;
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2) + '\n');
}
