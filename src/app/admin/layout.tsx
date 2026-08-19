import type { Metadata } from 'next';
import { AdminLocaleProvider } from '@/components/AdminShell';
import { getAdminUiLocale } from '@/lib/admin-locale';

export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminUiLocale();
  return <AdminLocaleProvider initialLocale={locale}>{children}</AdminLocaleProvider>;
}
