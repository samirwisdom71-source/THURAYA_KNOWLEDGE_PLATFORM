import { NextResponse } from 'next/server';

function publicTurnstileSiteKey() {
  const key = (process.env.TURNSTILE_SITE_KEY || '').trim();
  if (!key || /REPLACE_WITH_|changeme|example/i.test(key)) return null;
  return key;
}

export async function GET() {
  return NextResponse.json(
    { turnstileSiteKey: publicTurnstileSiteKey() },
    { headers: { 'cache-control': 'no-store' } },
  );
}
