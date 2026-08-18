'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/types';
import { TurnstileWidget } from './TurnstileWidget';

export function AskForm({locale}:{locale:Locale}) {
  const [msg,setMsg]=useState(''); const [sending,setSending]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setSending(true);setMsg('');const form=e.currentTarget;const fd=new FormData(form);const payload={name:fd.get('name'),email:fd.get('email'),question:fd.get('question'),consent:fd.get('consent')==='on',website:fd.get('website'),captchaToken:fd.get('cf-turnstile-response'),locale};const r=await fetch('/api/forms/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const j=await r.json().catch(()=>({}));setSending(false);setMsg(r.ok?(locale==='ar'?'وصل سؤالك وسيخضع للمراجعة قبل أي نشر.':'Your question was received and will be reviewed before any publication.'):(j.error||'Error')); if(r.ok)form.reset();}
  return <form className="formCard" onSubmit={submit}><div className="formGrid"><label>{locale==='ar'?'الاسم (اختياري)':'Name (optional)'}<input name="name"/></label><label>{locale==='ar'?'البريد (اختياري)':'Email (optional)'}<input type="email" name="email"/></label></div><label>{locale==='ar'?'سؤالك':'Your question'}<textarea name="question" required rows={5}/></label><input className="honeypot" name="website" tabIndex={-1}/><label className="check"><input type="checkbox" name="consent" required/><span>{locale==='ar'?'أوافق على معالجة السؤال وفق سياسة الخصوصية. لا ينشر الاسم أو البريد تلقائيًا.':'I consent to processing this question under the privacy policy. Name and email are never auto-published.'}</span></label><TurnstileWidget locale={locale}/><button className="btn primary" disabled={sending}>{sending?(locale==='ar'?'جارٍ الإرسال...':'Sending...'):(locale==='ar'?'أرسل السؤال':'Send question')}</button>{msg&&<div className="formMessage">{msg}</div>}</form>;
}
