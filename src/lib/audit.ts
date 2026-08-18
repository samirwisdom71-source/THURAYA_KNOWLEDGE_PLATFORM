import { createHash } from 'node:crypto';
import { query } from './db';
import type { AdminUser } from './auth';
export async function audit(user: AdminUser | null, action:string, entityType:string, entityId:string|null, changes:Record<string,unknown>={}, ip?:string) {
  const ipHash = ip ? createHash('sha256').update(ip).digest('hex') : null;
  await query('INSERT INTO audit_log(admin_user_id,action,entity_type,entity_id,changes,ip_hash) VALUES($1,$2,$3,$4,$5::jsonb,$6)',[user?.id ?? null,action,entityType,entityId,JSON.stringify(changes),ipHash]);
}
