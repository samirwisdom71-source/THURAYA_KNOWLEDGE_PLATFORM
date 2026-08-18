import { notFound } from 'next/navigation';
import { ContentListing } from '@/components/ContentListing';
import { getPublicContent } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { sectionHero } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <ContentListing
      locale={locale}
      items={await getPublicContent('challenge', { limit: 24 })}
      kicker={locale === 'ar' ? 'التحديات' : 'CHALLENGES'}
      title={locale === 'ar' ? 'التحديات' : 'Challenges'}
      description={locale === 'ar' ? 'تجارب صغيرة قابلة للتطبيق، ومشاركات الجمهور تحفظ للمراجعة ولا تنشر تلقائيًا.' : 'Small practical experiments; audience submissions are moderated and never auto-published.'}
      image={sectionHero.challenges}
      imageAlt={locale === 'ar' ? 'عتبة صباح: حذاء وماء ومؤقت وقائمة صغيرة' : 'A dawn doorstep with shoes, water, a timer and a small checklist'}
    />
  );
}
