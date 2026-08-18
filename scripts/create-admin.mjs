import './load-env.mjs';
import pg from 'pg';
import { hashPassword } from './password.mjs';
const { Client } = pg;
const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'مدير المحتوى' } = process.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
const client = new Client({ connectionString: DATABASE_URL });
await client.connect();
const existing = await client.query("SELECT id,email FROM admin_users WHERE role='admin' AND active=true ORDER BY created_at LIMIT 1");
if (existing.rowCount) {
  console.log(`Admin bootstrap skipped; active admin already exists: ${existing.rows[0].email}`);
  await client.end();
  process.exit(0);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  await client.end();
  throw new Error('No active admin exists. ADMIN_EMAIL and ADMIN_PASSWORD are required for first bootstrap.');
}
if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');
if (process.env.NODE_ENV === 'production' && /ChangeMe|example\.com/i.test(`${ADMIN_PASSWORD} ${ADMIN_EMAIL}`)) throw new Error('Replace the example admin credentials before production bootstrap.');
const passwordHash = hashPassword(ADMIN_PASSWORD);
await client.query(`INSERT INTO admin_users(email,name,password_hash,role,active)
 VALUES($1,$2,$3,'admin',true)`,[ADMIN_EMAIL.toLowerCase(), ADMIN_NAME, passwordHash]);
await client.end();
console.log(`Initial admin created: ${ADMIN_EMAIL}`);
