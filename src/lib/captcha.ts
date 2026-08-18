export async function verifyCaptcha(token: string | null, ip?: string) {
  const mode = process.env.CAPTCHA_MODE || (process.env.NODE_ENV === 'production' ? 'required' : 'optional');
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return mode !== 'required';
  if (!token) return false;
  const body = new URLSearchParams({secret,response:token});
  if (ip && ip !== 'unknown') body.set('remoteip',ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,cache:'no-store'});
  if (!res.ok) return false;
  const json = await res.json() as {success?:boolean};
  return Boolean(json.success);
}
