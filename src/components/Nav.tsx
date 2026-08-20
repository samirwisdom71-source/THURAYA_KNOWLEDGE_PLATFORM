'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { Locale } from '@/lib/types';
import { BRAND_LOGO } from '@/lib/brand';
import { ui } from '@/lib/locale';

export function Nav({locale,siteName,tagline,signedIn=false}:{locale:Locale;siteName:string;tagline?:string;signedIn?:boolean}) {
  const [open,setOpen]=useState(false); const t=ui[locale]; const pathname=usePathname()||`/${locale}`;
  const targetLocale=locale==='ar'?'en':'ar';
  const languageHref=pathname.replace(/^\/(ar|en)(?=\/|$)/,`/${targetLocale}`);
  const items = [['knowledge',t.knowledge],['topics',t.topics],['challenges',t.challenges],['tools',t.tools],['library',t.library],['newsletter',t.newsletter],['ask-thuraya',t.ask]];
  const homeHref=`/${locale}`;
  return <header className="siteHeader"><div className="container navBar">
    <Link href={homeHref} className={`brand${pathname===homeHref?' is-active':''}`}><img className="brandLogo" src={BRAND_LOGO} alt={siteName}/><span><b>{siteName}</b><small>{tagline|| (locale==='ar'?'معرفة • استدامة • أثر':'Knowledge • Sustainability • Impact')}</small></span></Link>
    <nav className={open?'navLinks open':'navLinks'} aria-label={locale==='ar'?'التنقل الرئيسي':'Main navigation'}>
      {items.map(([path,label])=>{
        const href=`/${locale}/${path}`;
        const active=pathname===href||pathname.startsWith(`${href}/`);
        return <Link key={path} href={href} className={active?'is-active':''} onClick={()=>setOpen(false)}>{label}</Link>;
      })}
    </nav>
    <div className="navActions"><Link className="langChip" href={languageHref}>{t.language}</Link><Link className="loginChip" href={signedIn?'/admin':'/admin/login'}>{signedIn?t.admin:t.login}</Link><button className="menuButton" aria-expanded={open} aria-label={locale==='ar'?'فتح القائمة':'Open menu'} onClick={()=>setOpen(!open)}><span/><span/><span/></button></div>
  </div></header>;
}
