import type { ContentType } from './types';
import { contentFields } from './content-fields';

export function validateSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function validateContentData(type: ContentType, data: Record<string, unknown>) {
  const errors: string[] = [];
  for (const field of contentFields[type]) {
    if (!field.required) continue;
    const v = data[field.key];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) errors.push(field.key);
  }
  return errors;
}

export function sanitizeString(value: unknown, max = 20000) {
  return String(value ?? '').trim().slice(0,max);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
