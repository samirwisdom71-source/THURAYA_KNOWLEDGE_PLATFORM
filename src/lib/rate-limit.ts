import { createHash } from 'node:crypto';
import { query } from './db';

function hash(value:string) { return createHash('sha256').update(value).digest('hex'); }
export function requestIp(req: Request) {
  return (req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown').trim();
}
export async function checkRateLimit(scope:string,key:string,limit:number,windowMinutes:number) {
  const keyHash = hash(key);
  const r = await query<{hits:number}>(`INSERT INTO rate_limits(scope,key_hash,window_started_at,hits)
    VALUES($1,$2,now(),1)
    ON CONFLICT(scope,key_hash) DO UPDATE SET
      window_started_at = CASE WHEN rate_limits.window_started_at < now() - ($3 * interval '1 minute') THEN now() ELSE rate_limits.window_started_at END,
      hits = CASE WHEN rate_limits.window_started_at < now() - ($3 * interval '1 minute') THEN 1 ELSE rate_limits.hits + 1 END
    RETURNING hits`,[scope,keyHash,windowMinutes]);
  return (r.rows[0]?.hits ?? 1) <= limit;
}
