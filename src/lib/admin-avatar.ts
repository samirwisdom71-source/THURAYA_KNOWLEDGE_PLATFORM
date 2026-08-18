import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { query } from './db';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024;

function storageRoot() {
  return path.resolve(process.env.STORAGE_DIR || './storage');
}

export function avatarFilePath(userId: string) {
  return path.join(storageRoot(), 'private', 'avatars', `${userId}.webp`);
}

export async function saveAdminAvatar(userId: string, file: File) {
  if (file.size <= 0 || file.size > MAX_BYTES) throw new Error('حجم الصورة غير مسموح. الحد 5 ميغابايت.');
  if (!ALLOWED.has(file.type)) throw new Error('صيغة الصورة غير مدعومة. استخدمي JPG أو PNG أو WebP.');
  const dest = avatarFilePath(userId);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize(320, 320, { fit: 'cover', position: 'attention' })
    .webp({ quality: 86 })
    .toFile(dest);
  await fs.chmod(dest, 0o600).catch(() => undefined);
  await query('UPDATE admin_users SET avatar_path=$2, updated_at=now() WHERE id=$1', [userId, dest]);
  return dest;
}

export async function removeAdminAvatar(userId: string, storedPath?: string | null) {
  const dest = storedPath || avatarFilePath(userId);
  await fs.unlink(dest).catch(() => undefined);
  await query('UPDATE admin_users SET avatar_path=NULL, updated_at=now() WHERE id=$1', [userId]);
}

export function publicAvatarUrl(updatedAt?: string | Date | null) {
  const stamp = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `/api/admin/account/avatar?v=${stamp}`;
}
