import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}
export function verifyPassword(password, encoded) {
  const [scheme, salt, expected] = encoded.split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const exp = Buffer.from(expected, 'hex');
  return actual.length === exp.length && timingSafeEqual(actual, exp);
}
