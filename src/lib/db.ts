import { Pool, type PoolClient, type QueryResultRow } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __thurayaPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured');
  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });
}

export const db = globalThis.__thurayaPool ?? createPool();
if (process.env.NODE_ENV !== 'production') globalThis.__thurayaPool = db;

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
