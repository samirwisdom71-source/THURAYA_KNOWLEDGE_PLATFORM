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
      items={await getPublicContent('publication', { limit: 12 })}
      kicker={locale === 'ar' ? 'المكتبة' : 'LIBRARY'}
      title={locale === 'ar' ? 'المكتبة' : 'Library'}
      description={locale === 'ar' ? 'ستة إصدارات معرفية: الملخص والأفكار والأدوات والأسئلة عامة، والملف الكامل يبقى خاصًا إلا بعد اعتماد صريح.' : 'Six knowledge publications. Summaries, ideas, tools and FAQs are public; full documents stay private unless explicitly approved.'}
      image={sectionHero.library}
      imageAlt={locale === 'ar' ? 'ملفات قماشية ومجلد أخضر ونظارة قراءة' : 'Cloth portfolios, a green volume and reading glasses'}
    />
  );
}
