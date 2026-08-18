import './load-env.mjs';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

function run(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(file)} exited with ${code}`));
    });
  });
}

if ((process.env.APP_ENV || 'development') === 'production') {
  await run(path.join('scripts', 'preflight.mjs'));
}
await run(path.join('scripts', 'db-migrate.mjs'));
if (process.env.SKIP_SEED !== 'true') await run(path.join('scripts', 'db-seed.mjs'));
await run(path.join('scripts', 'create-admin.mjs'));

if (process.argv.includes('--migrate-only')) process.exit(0);

const server = existsSync('server.js') ? 'server.js' : null;
if (!server) throw new Error('server.js not found. Build the standalone app first.');
const child = spawn(process.execPath, [server], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
