const BLOCKED_KEYS = new Set([
  'award_alignment_internal','is_demo','admin_notes','moderation_private_notes',
  'private_notes','internal_notes','private_data','password_hash','token_hash'
]);

export function stripPrivate<T>(input: T): T {
  if (Array.isArray(input)) return input.map(stripPrivate) as T;
  if (input instanceof Date) return input;
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key,value] of Object.entries(input as Record<string, unknown>)) {
      if (BLOCKED_KEYS.has(key) || key.endsWith('_internal')) continue;
      out[key] = stripPrivate(value);
    }
    return out as T;
  }
  return input;
}
