import { notFound } from 'next/navigation';
import { ContentListing } from '@/components/ContentListing';
import { NewsletterForm } from '@/components/NewsletterForm';
import { getPublicContent } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { sectionHero } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const items = await getPublicContent('newsletter', { limit: 24 });
  return (
    <ContentListing
      locale={locale}
      items={items}
      kicker={locale === 'ar' ? 'نشرة أثر' : 'IMPACT NEWSLETTER'}
      title={locale === 'ar' ? 'نشرة أثر' : 'Impact Newsletter'}
      description={locale === 'ar' ? 'أرشيف النشرة ومكان الاشتراك في الأعداد القادمة.' : 'Newsletter archive and subscription for future issues.'}
      image={sectionHero.newsletter}
      imageAlt={locale === 'ar' ? 'مكتب كتابة ورسالة وشاي في ضوء الصباح' : 'A writing desk with a letter and morning tea'}
    >
      <div className="listingSubscribe">
        <h2>{locale === 'ar' ? 'اشترك' : 'Subscribe'}</h2>
        <p>{locale === 'ar' ? 'رسالة معرفية هادئة: فكرة، أداة، درس، وسؤال.' : 'A quiet knowledge note: one idea, one tool, one lesson, one question.'}</p>
        <NewsletterForm locale={locale} />
      </div>
    </ContentListing>
  );
}
