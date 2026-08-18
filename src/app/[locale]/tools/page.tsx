import { notFound } from 'next/navigation';
import { ContentListing } from '@/components/ContentListing';
import { getPublicContent } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { sectionHero } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [general, publication] = await Promise.all([
    getPublicContent('tool', { limit: 40 }),
    getPublicContent('publication_tool', { limit: 60 }),
  ]);
  return (
    <ContentListing
      locale={locale}
      items={[...general, ...publication]}
      kicker={locale === 'ar' ? 'الأدوات' : 'TOOLS'}
      title={locale === 'ar' ? 'الأدوات' : 'Tools'}
      description={locale === 'ar' ? 'أدوات عامة وأدوات مستخلصة من الإصدارات، ويمكن إرفاق ملفات قابلة للتحميل من لوحة الإدارة.' : 'General tools and publication tools, with downloadable files attachable from the admin CMS.'}
      image={sectionHero.tools}
      imageAlt={locale === 'ar' ? 'خطة ورقة واحدة وأقلام ومشابك ذهبية' : 'A one-page planner with pens and gold clips'}
    />
  );
}
