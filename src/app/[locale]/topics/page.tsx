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
      items={await getPublicContent('monthly_issue', { limit: 24 })}
      kicker={locale === 'ar' ? 'قضايا الشهر' : 'MONTHLY TOPICS'}
      title={locale === 'ar' ? 'قضايا الشهر' : 'Monthly topics'}
      description={locale === 'ar' ? 'أرشيف موضوعي من القضايا العملية؛ ليس أرشيفًا زمنيًا مصطنعًا.' : 'A thematic archive of practical issues, not a fabricated historical timeline.'}
      image={sectionHero.topics}
      imageAlt={locale === 'ar' ? 'طاولة بيت فيها زيت زيتون وتمر وخطة عادات مكتوبة' : 'A home table with olive oil, dates and a handwritten habit list'}
    />
  );
}
