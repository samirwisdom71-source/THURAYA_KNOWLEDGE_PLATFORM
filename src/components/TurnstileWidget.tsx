'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({ locale }: { locale: 'ar' | 'en' }) {
  const [key, setKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/public/config', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setKey(typeof j.turnstileSiteKey === 'string' && j.turnstileSiteKey ? j.turnstileSiteKey : null))
      .catch(() => setKey(null));
  }, []);

  const renderWidget = useCallback(() => {
    if (!key || !hostRef.current || !window.turnstile) return;
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    }
    widgetId.current = window.turnstile.render(hostRef.current, {
      sitekey: key,
      theme: 'light',
      language: locale,
      'error-callback': () => true,
    });
  }, [key, locale]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.turnstile) setReady(true);
  }, []);

  useEffect(() => {
    if (ready) renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [ready, renderWidget]);

  if (!key) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={hostRef} className="cf-turnstile" />
    </>
  );
}
