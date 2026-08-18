'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function TurnstileWidget({locale}:{locale:'ar'|'en'}) {
  const [key,setKey]=useState<string|null>(null);
  useEffect(()=>{fetch('/api/public/config',{cache:'no-store'}).then(r=>r.json()).then(j=>setKey(typeof j.turnstileSiteKey==='string'&&j.turnstileSiteKey?j.turnstileSiteKey:null)).catch(()=>setKey(null))},[]);
  if (!key) return null;
  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
    <div className="cf-turnstile" data-sitekey={key} data-theme="light" data-language={locale} />
  </>;
}
