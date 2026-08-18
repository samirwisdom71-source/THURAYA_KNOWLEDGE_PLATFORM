import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { getAdminUser } from '@/lib/auth';
import { dir, isLocale } from '@/lib/locale';
import { getSetting } from '@/lib/content';
export const dynamic = 'force-dynamic';
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;if(!isLocale(locale))notFound();
  const [siteNameAr,siteNameEn,brand,admin]=await Promise.all([getSetting('site_name_ar','ثريا الشامسي'),getSetting('site_name_en','Thuraya Al Shamsi'),getSetting<Record<string,unknown>>('brand',{}),getAdminUser()]);
  const siteName=locale==='ar'?String(siteNameAr):String(siteNameEn);
  const tagline=locale==='ar'?String(brand.tagline||''):String(brand.tagline_en||'');
  return <div lang={locale} dir={dir(locale)}><Nav locale={locale} siteName={siteName} tagline={tagline} signedIn={Boolean(admin)}/><main>{children}</main><Footer locale={locale} siteName={siteName} tagline={tagline}/></div>;
}
