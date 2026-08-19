import fs from 'node:fs';
import path from 'node:path';

function envCandidates() {
  const out = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
  ];
  if (process.env.THURAYA_ROOT) {
    out.push(path.resolve(process.env.THURAYA_ROOT, '.env'));
  }
  return out;
}

function loadEnvFile(envPath) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1);
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const envPath = envCandidates().find((candidate) => fs.existsSync(candidate));
if (envPath) loadEnvFile(envPath);
