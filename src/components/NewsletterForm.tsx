'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/types';
import { TurnstileWidget } from './TurnstileWidget';

export function NewsletterForm({locale}:{locale:Locale}) {
  const [state,setState]=useState<'idle'|'sending'|'done'|'error'>('idle'); const [message,setMessage]=useState('');
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setState('sending');setMessage('');const form=e.currentTarget;const fd=new FormData(form);const body={email:fd.get('email'),consent:fd.get('consent')==='on',locale,website:fd.get('website'),captchaToken:fd.get('cf-turnstile-response')};const r=await fetch('/api/forms/newsletter',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(r.ok){setState('done');setMessage(locale==='ar'?'تم تسجيل اشتراكك بنجاح.':'You are subscribed.');form.reset();}else{setState('error');setMessage(j.error|| (locale==='ar'?'تعذر الاشتراك.':'Subscription failed.'));}}
  return <form className="formCard" onSubmit={submit}><label>{locale==='ar'?'البريد الإلكتروني':'Email'}<input type="email" name="email" required autoComplete="email"/></label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off"/><label className="check"><input type="checkbox" name="consent" required/><span>{locale==='ar'?'أوافق على استخدام بريدي لإرسال نشرة أثر ويمكنني إلغاء الاشتراك لاحقًا.':'I consent to receive the newsletter and can unsubscribe later.'}</span></label><TurnstileWidget locale={locale}/><button className="btn gold" disabled={state==='sending'}>{state==='sending'?(locale==='ar'?'جارٍ الحفظ...':'Saving...'):(locale==='ar'?'اشترك في نشرة أثر':'Subscribe')}</button>{message&&<div className={`formMessage ${state}`}>{message}</div>}</form>
}
