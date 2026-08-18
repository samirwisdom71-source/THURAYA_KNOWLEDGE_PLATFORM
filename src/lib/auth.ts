import { cookies } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { publicAvatarUrl } from './admin-avatar';
import { query } from './db';

const COOKIE_NAME = 'thuraya_admin_session';
const SESSION_DAYS = 7;

function sessionCookieSecure() {
  return /^https:\/\//i.test(process.env.SITE_URL || '');
}

function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password,salt,64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}
function verifyPassword(password: string, encoded: string) {
  const [scheme,salt,expected] = encoded.split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(password,salt,64);
  const exp = Buffer.from(expected,'hex');
  return actual.length === exp.length && timingSafeEqual(actual,exp);
}

export interface AdminUser { id:string; email:string; name:string; role:'admin'|'editor'; avatarUrl:string|null; }

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  const r = await query<AdminUser & {password_hash:string;active:boolean}>(`SELECT id,email,name,role,password_hash,active FROM admin_users WHERE email=$1 LIMIT 1`,[email.toLowerCase()]);
  const user = r.rows[0];
  if (!user?.active || !verifyPassword(password,user.password_hash)) return null;
  return {id:user.id,email:user.email,name:user.name,role:user.role,avatarUrl:null};
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now()+SESSION_DAYS*86400000);
  await query('INSERT INTO admin_sessions(user_id,token_hash,expires_at) VALUES($1,$2,$3)',[userId,tokenHash,expires]);
  const store = await cookies();
  store.set(COOKIE_NAME,token,{httpOnly:true,secure:sessionCookieSecure(),sameSite:'lax',path:'/',expires});
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) await query('DELETE FROM admin_sessions WHERE token_hash=$1',[hashToken(token)]).catch(()=>{});
  store.set(COOKIE_NAME,'',{httpOnly:true,secure:sessionCookieSecure(),sameSite:'lax',path:'/',expires:new Date(0)});
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const r = await query<AdminUser & {avatar_path:string|null;updated_at:string}>(`SELECT u.id,u.email,u.name,u.role,u.avatar_path,u.updated_at FROM admin_sessions s JOIN admin_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true LIMIT 1`,[hashToken(token)]);
  if (!r.rows[0]) return null;
  await query('UPDATE admin_sessions SET last_seen_at=now() WHERE token_hash=$1',[hashToken(token)]).catch(()=>{});
  const row = r.rows[0];
  return {id:row.id,email:row.email,name:row.name,role:row.role,avatarUrl:row.avatar_path?publicAvatarUrl(row.updated_at):null};
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return;
  try {
    if (new URL(origin).host !== host) throw new Error('Cross-origin mutation rejected');
  } catch {
    throw new Error('Invalid origin');
  }
}

export async function requireAdminApi() {
  const user = await getAdminUser();
  if (!user) throw Object.assign(new Error('Unauthorized'),{status:401});
  return user;
}
