import './load-env.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const alreadyApplied = {
  '001_initial.sql': `SELECT to_regclass('public.admin_users') IS NOT NULL AS ok`,
  '002_admin_avatar.sql': `SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='admin_users' AND column_name='avatar_path'
  ) AS ok`,
};

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, '')).trim();
  if (!database) throw new Error('DATABASE_URL must include a database name');
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(database)) throw new Error(`Unsafe database name: ${database}`);
  return { parsed, database };
}

function adminConnectionString(url) {
  const { parsed } = parseDatabaseUrl(url);
  const admin = new URL(parsed);
  admin.pathname = `/${process.env.POSTGRES_ADMIN_DB || 'postgres'}`;
  return admin.toString();
}

async function databaseExists(admin, database) {
  const result = await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [database]);
  return Boolean(result.rowCount);
}

async function ensureDatabase() {
  const { database } = parseDatabaseUrl(connectionString);
  const target = new Client({ connectionString });
  try {
    await target.connect();
    await target.end();
    console.log(`Database "${database}" already exists. Skipping create.`);
    return;
  } catch (error) {
    const missing = error && (error.code === '3D000' || /does not exist/i.test(String(error.message || '')));
    if (!missing) throw error;
  }

  const admin = new Client({ connectionString: adminConnectionString(connectionString) });
  await admin.connect();
  try {
    if (await databaseExists(admin, database)) {
      console.log(`Database "${database}" already exists. Skipping create.`);
      return;
    }
    console.log(`Database "${database}" not found. Creating...`);
    await admin.query(`CREATE DATABASE ${database}`);
    console.log(`Created database "${database}".`);
  } finally {
    await admin.end();
  }
}

async function markApplied(client, name) {
  await client.query('INSERT INTO schema_migrations(name) VALUES($1) ON CONFLICT (name) DO NOTHING', [name]);
}

async function isRecorded(client, name) {
  const result = await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
  return Boolean(result.rowCount);
}

async function schemaLooksApplied(client, name) {
  const sql = alreadyApplied[name];
  if (!sql) return false;
  const result = await client.query(sql);
  return Boolean(result.rows[0]?.ok);
}

await ensureDatabase();

const client = new Client({ connectionString });
await client.connect();
await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);

const dir = path.join(process.cwd(), 'db', 'migrations');
const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.sql')).sort();
let applied = 0;
let skipped = 0;

for (const name of files) {
  if (await isRecorded(client, name)) {
    console.log(`Migration ${name} already applied. Skipping.`);
    skipped += 1;
    continue;
  }
  if (await schemaLooksApplied(client, name)) {
    await markApplied(client, name);
    console.log(`Migration ${name} already present in schema. Recorded and skipped.`);
    skipped += 1;
    continue;
  }

  const sql = await fs.readFile(path.join(dir, name), 'utf8');
  console.log(`Applying ${name}`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await markApplied(client, name);
    await client.query('COMMIT');
    applied += 1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

await client.end();
console.log(`Database migrations complete. applied=${applied} skipped=${skipped}`);
