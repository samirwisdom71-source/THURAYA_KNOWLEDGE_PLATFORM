import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { ui } from '@/lib/locale';
export function Footer({locale,siteName,tagline}:{locale:Locale;siteName:string;tagline?:string}) { const t=ui[locale]; return <footer className="siteFooter"><div className="container footerGrid">
  <div><div className="footerBrand"><img src="/brand/thuraya-mark.svg" alt=""/><div><b>{siteName}</b><p>{tagline|| (locale==='ar'?'منصة شخصية للمعرفة والاستدامة والأثر المجتمعي.':'A personal platform for knowledge, sustainability and community impact.')}</p></div></div></div>
  <div><h3>{t.knowledge}</h3><Link href={`/${locale}/knowledge`}>{t.knowledge}</Link><Link href={`/${locale}/tools`}>{t.tools}</Link><Link href={`/${locale}/library`}>{t.library}</Link></div>
  <div><h3>{locale==='ar'?'تواصل معرفي':'Connect'}</h3><Link href={`/${locale}/newsletter`}>{t.newsletter}</Link><Link href={`/${locale}/ask-thuraya`}>{t.ask}</Link><Link href={`/${locale}/community`}>{t.community}</Link></div>
  <div><h3>{locale==='ar'?'حول المنصة':'About'}</h3><Link href={`/${locale}/about`}>{t.about}</Link><Link href={`/${locale}/inspiration`}>{t.inspiration}</Link><Link href={`/${locale}/privacy`}>{t.privacy}</Link></div>
</div><div className="container footerBottom"><span>© {new Date().getFullYear()} {siteName}</span><span>{locale==='ar'?'المحتوى يعبر عن منصة شخصية ولا يمثل أي جهة عمل.':'This is a personal platform and does not represent an employer.'}</span></div></footer> }
