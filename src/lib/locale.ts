import type { Locale } from './types';
export const locales: Locale[] = ['ar','en'];
export function isLocale(value: string): value is Locale { return value === 'ar' || value === 'en'; }
export function dir(locale: Locale) { return locale === 'ar' ? 'rtl' : 'ltr'; }
export function pick<T>(locale: Locale, ar: T, en?: T | null): T { return locale === 'en' && en ? en : ar; }
export const ui = {
  ar: {
    home:'الرئيسية', about:'عن ثريا', knowledge:'مركز المعرفة', topics:'قضايا الشهر', challenges:'التحديات', tools:'الأدوات', library:'المكتبة', newsletter:'نشرة أثر', ask:'اسأل ثريا', stories:'قصص الأثر', journal:'اليوميات', community:'المجتمع', inspiration:'مصادر ألهمتني', search:'بحث', explore:'استكشف', readMore:'اقرأ المزيد', subscribe:'اشترك', email:'البريد الإلكتروني', send:'إرسال', viewAll:'عرض الكل', noResults:'لا توجد نتائج', language:'English', privacy:'الخصوصية', sources:'المصادر', admin:'الإدارة', login:'تسجيل الدخول'
  },
  en: {
    home:'Home', about:'About', knowledge:'Knowledge', topics:'Monthly topics', challenges:'Challenges', tools:'Tools', library:'Library', newsletter:'Impact Newsletter', ask:'Ask Thuraya', stories:'Impact stories', journal:'Journal', community:'Community', inspiration:'Sources that inspire me', search:'Search', explore:'Explore', readMore:'Read more', subscribe:'Subscribe', email:'Email', send:'Send', viewAll:'View all', noResults:'No results', language:'العربية', privacy:'Privacy', sources:'Sources', admin:'Admin', login:'Sign in'
  }
} as const;
