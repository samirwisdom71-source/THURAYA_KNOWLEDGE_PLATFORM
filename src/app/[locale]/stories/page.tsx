import { notFound } from 'next/navigation';
import { ContentListing } from '@/components/ContentListing';
import { getPublicContent } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { stills } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <ContentListing
      locale={locale}
      items={await getPublicContent('impact_story', { limit: 24 })}
      kicker={locale === 'ar' ? 'قصص الأثر' : 'IMPACT STORIES'}
      title={locale === 'ar' ? 'قصص الأثر' : 'Impact stories'}
      description={locale === 'ar' ? 'ملاحظات وتجارب شخصية عن المعرفة والتعلم والقرار والتقنية.' : 'Personal reflections on knowledge, learning, decisions and technology.'}
      image={stills.windowBooks}
      imageAlt={locale === 'ar' ? 'كتب صغيرة على حافة نافذة ونبات صغير' : 'Small books on a windowsill with a tiny plant'}
    />
  );
}
