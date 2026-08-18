'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AdminIcon } from '@/components/AdminIcon';
import type { AdminUser } from '@/lib/auth';
import type { Locale } from '@/lib/types';

const AdminLocaleContext = createContext<Locale>('ar');
export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}

const nav = [
  ['/admin', 'لوحة التحكم', 'Dashboard'],
  ['/admin/content', 'المحتوى', 'Content'],
  ['/admin/media', 'الصور والملفات', 'Media'],
  ['/admin/submissions', 'المشاركات', 'Submissions'],
  ['/admin/subscribers', 'المشتركون', 'Subscribers'],
  ['/admin/sources', 'المصادر', 'Sources'],
  ['/admin/crosslinks', 'روابط الإصدارات', 'Crosslinks'],
  ['/admin/settings', 'الإعدادات', 'Settings'],
  ['/admin/account', 'حسابي', 'Account'],
  ['/admin/audit', 'سجل التدقيق', 'Audit log'],
] as const;

const titles: Record<string, { ar: string; en: string }> = {
  '/admin': { ar: 'لوحة التحكم', en: 'Dashboard' },
  '/admin/content': { ar: 'المحتوى', en: 'Content' },
  '/admin/media': { ar: 'الصور والملفات', en: 'Media' },
  '/admin/submissions': { ar: 'المشاركات', en: 'Submissions' },
  '/admin/subscribers': { ar: 'المشتركون', en: 'Subscribers' },
  '/admin/sources': { ar: 'المصادر', en: 'Sources' },
  '/admin/crosslinks': { ar: 'روابط الإصدارات', en: 'Crosslinks' },
  '/admin/settings': { ar: 'الإعدادات', en: 'Settings' },
  '/admin/account': { ar: 'حسابي', en: 'Account' },
  '/admin/audit': { ar: 'سجل التدقيق', en: 'Audit log' },
  '/admin/new': { ar: 'محتوى جديد', en: 'New content' },
};

function pageTitle(pathname: string, locale: Locale) {
  const exact = titles[pathname];
  if (exact) return exact[locale];
  const match = Object.keys(titles).sort((a, b) => b.length - a.length).find((key) => pathname.startsWith(`${key}/`));
  return match ? titles[match][locale] : titles['/admin'][locale];
}

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const pathname = usePathname() || '/admin';
  const [locale, setLocale] = useState<Locale>('ar');

  useEffect(() => {
    const saved = window.localStorage.getItem('thuraya_admin_locale');
    if (saved === 'ar' || saved === 'en') setLocale(saved);
  }, []);

  function changeLocale(next: Locale) {
    setLocale(next);
    window.localStorage.setItem('thuraya_admin_locale', next);
  }

  const initial = (user.name || user.email || 'T').trim().charAt(0).toUpperCase();
  const role = user.role === 'admin' ? (locale === 'ar' ? 'مديرة المحتوى' : 'Admin') : (locale === 'ar' ? 'محررة' : 'Editor');

  return (
    <AdminLocaleContext.Provider value={locale}>
      <div className="adminApp" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
        <header className="adminHeader">
          <Link href="/admin" className="adminHeaderBrand">
            <img src="/brand/thuraya-mark.svg" alt="" />
            <span>
              <b>{locale === 'ar' ? 'إدارة ثريا' : 'Thuraya CMS'}</b>
              <small>{pageTitle(pathname, locale)}</small>
            </span>
          </Link>
          <div className="adminHeaderTools">
            <div className="adminLang" role="group" aria-label={locale === 'ar' ? 'اللغة' : 'Language'}>
              <button type="button" className={locale === 'ar' ? 'is-active' : ''} onClick={() => changeLocale('ar')}>العربية</button>
              <button type="button" className={locale === 'en' ? 'is-active' : ''} onClick={() => changeLocale('en')}>English</button>
            </div>
            <a className="adminSiteLink" href={locale === 'en' ? '/en' : '/ar'} target="_blank" rel="noreferrer">
              {locale === 'ar' ? 'عرض الموقع' : 'View site'}
            </a>
            <Link href="/admin/account" className="adminUser" title={locale === 'ar' ? 'حسابي' : 'Account'} aria-label={locale === 'ar' ? 'حسابي' : 'Account'}>
              {user.avatarUrl
                ? <img className="adminUserMark" src={user.avatarUrl} alt="" />
                : <span className="adminUserMark" aria-hidden="true">{initial}</span>}
              <span>
                <b>{user.name}</b>
                <small>{role}</small>
              </span>
            </Link>
          </div>
        </header>
        <div className="adminShell">
          <aside className="adminSidebar">
            <nav className="adminNav" aria-label={locale === 'ar' ? 'تنقل الإدارة' : 'Admin navigation'}>
              {nav.map(([href, ar, en]) => {
                const active = href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
                return <Link key={href} href={href} className={active ? 'is-active' : ''}>{locale === 'ar' ? ar : en}</Link>;
              })}
            </nav>
            <form className="adminSidebarOut" action="/api/admin/logout" method="post">
              <button type="submit">
                <AdminIcon name="logout" />
                <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</span>
              </button>
            </form>
          </aside>
          <main className="adminMain">{children}</main>
        </div>
      </div>
    </AdminLocaleContext.Provider>
  );
}
