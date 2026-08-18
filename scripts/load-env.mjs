import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) process.exit(0);
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 1) continue;
  const key = line.slice(0, i).trim();
  const value = line.slice(i + 1);
  if (key && process.env[key] === undefined) process.env[key] = value;
}
