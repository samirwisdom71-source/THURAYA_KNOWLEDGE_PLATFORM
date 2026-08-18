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
      items={await getPublicContent('community_content', { limit: 40 })}
      kicker={locale === 'ar' ? 'المجتمع' : 'COMMUNITY'}
      title={locale === 'ar' ? 'المجتمع' : 'Community'}
      description={locale === 'ar' ? 'الأسرة، التطوع، الاستدامة، التسامح وجودة الحياة في محتوى قريب من الممارسة.' : 'Family, volunteering, sustainability, tolerance and quality of life in practical content.'}
      image={stills.ceramic}
      imageAlt={locale === 'ar' ? 'إبريق خزفي وتين وكتان على حافة هادئة' : 'A ceramic jug, figs and linen on a quiet ledge'}
    />
  );
}
