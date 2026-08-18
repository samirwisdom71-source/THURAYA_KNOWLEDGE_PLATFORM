'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/types';
import { TurnstileWidget } from './TurnstileWidget';

export function ChallengeForm({locale,slug}:{locale:Locale;slug:string}) {
  const [msg,setMsg]=useState(''); const [sending,setSending]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setSending(true);setMsg('');const form=e.currentTarget;const fd=new FormData(form);const body={contentSlug:slug,name:fd.get('name'),email:fd.get('email'),reflection:fd.get('reflection'),consent:fd.get('consent')==='on',website:fd.get('website'),captchaToken:fd.get('cf-turnstile-response'),locale};const r=await fetch('/api/forms/challenge',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));setSending(false);setMsg(r.ok?(locale==='ar'?'تم حفظ مشاركتك. لا تظهر للعامة إلا بعد المراجعة.':'Your participation was saved and is never public without review.'):(j.error||'Error'));if(r.ok)form.reset();}
  return <form className="formCard" onSubmit={submit}><div className="formGrid"><label>{locale==='ar'?'الاسم (اختياري)':'Name'}<input name="name"/></label><label>{locale==='ar'?'البريد (اختياري)':'Email'}<input type="email" name="email"/></label></div><label>{locale==='ar'?'ماذا تعلمت من التحدي؟':'What did you learn?'}<textarea name="reflection" rows={4} required/></label><input className="honeypot" name="website" tabIndex={-1}/><label className="check"><input type="checkbox" name="consent" required/><span>{locale==='ar'?'أوافق على حفظ مشاركتي للمراجعة.':'I consent to saving this participation for review.'}</span></label><TurnstileWidget locale={locale}/><button className="btn primary" disabled={sending}>{sending?(locale==='ar'?'جارٍ الحفظ...':'Saving...'):(locale==='ar'?'احفظ مشاركتي':'Save participation')}</button>{msg&&<div className="formMessage">{msg}</div>}</form>;
}
