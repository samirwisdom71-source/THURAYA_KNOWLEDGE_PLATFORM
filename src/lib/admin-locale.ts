import { cookies } from 'next/headers';
import { ADMIN_LOCALE_COOKIE } from './admin-i18n';
import type { Locale } from './types';

export async function getAdminUiLocale(): Promise<Locale> {
  const value = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  return value === 'en' ? 'en' : 'ar';
}
