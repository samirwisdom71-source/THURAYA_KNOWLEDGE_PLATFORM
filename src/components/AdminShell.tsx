'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AdminIcon, AdminPageHead } from '@/components/AdminIcon';
import { ADMIN_LOCALE_COOKIE, adminCopy } from '@/lib/admin-i18n';
import type { AdminUser } from '@/lib/auth';
import type { Locale } from '@/lib/types';

type AdminLocaleContextValue = { locale: Locale; setLocale: (next: Locale) => void };

const AdminLocaleContext = createContext<AdminLocaleContextValue>({
  locale: 'ar',
  setLocale: () => {},
});

export function useAdminLocale() {
  return useContext(AdminLocaleContext).locale;
}

function writeLocaleCookie(next: Locale) {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ADMIN_LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  window.localStorage.setItem(ADMIN_LOCALE_COOKIE, next);
}

export function AdminLocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_LOCALE_COOKIE);
    const hasCookie = document.cookie.split('; ').some((part) => part.startsWith(`${ADMIN_LOCALE_COOKIE}=`));
    if (!hasCookie && (saved === 'ar' || saved === 'en') && saved !== initialLocale) {
      writeLocaleCookie(saved);
      setLocaleState(saved);
      router.refresh();
    }
  }, [initialLocale, router]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    writeLocaleCookie(next);
    router.refresh();
  }

  return <AdminLocaleContext.Provider value={{ locale, setLocale }}>{children}</AdminLocaleContext.Provider>;
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

export function AdminCopyHead({
  page,
  count,
  actions,
}: {
  page: 'content' | 'media' | 'submissions' | 'subscribers' | 'sources' | 'crosslinks' | 'settings' | 'audit' | 'new';
  count?: number;
  actions?: ReactNode;
}) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  const titlesMap = {
    content: t.contentTitle,
    media: t.mediaTitle,
    submissions: t.submissionsTitle,
    subscribers: t.subscribersTitle,
    sources: t.sourcesTitle,
    crosslinks: t.crosslinksTitle,
    settings: t.settingsTitle,
    audit: t.auditTitle,
    new: t.newContent,
  };
  const subtitles: Record<typeof page, string> = {
    content: t.contentSubtitle(count ?? 0),
    media: t.mediaSub,
    submissions: t.submissionsSub,
    subscribers: t.subscribersSub,
    sources: t.sourcesSub,
    crosslinks: t.crosslinksSub,
    settings: t.settingsSub,
    audit: t.auditSubtitle(count ?? 0),
    new: t.newContentSub,
  };
  return <AdminPageHead title={titlesMap[page]} subtitle={subtitles[page]} actions={actions} />;
}

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const pathname = usePathname() || '/admin';
  const { locale, setLocale } = useContext(AdminLocaleContext);

  const initial = (user.name || user.email || 'T').trim().charAt(0).toUpperCase();
  const role = user.role === 'admin' ? (locale === 'ar' ? 'مديرة المحتوى' : 'Admin') : (locale === 'ar' ? 'محررة' : 'Editor');

  return (
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
            <button type="button" className={locale === 'ar' ? 'is-active' : ''} onClick={() => setLocale('ar')}>العربية</button>
            <button type="button" className={locale === 'en' ? 'is-active' : ''} onClick={() => setLocale('en')}>English</button>
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
  );
}
