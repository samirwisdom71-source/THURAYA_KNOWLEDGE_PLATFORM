import { notFound } from 'next/navigation';
import { CoverVisual } from '@/components/CoverVisual';
import { getPublicBySlug, localizedData, titleOf } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { fallbackStill, itemAssetId } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const item = await getPublicBySlug('newsletter', slug);
  if (!item) notFound();
  const data = localizedData(item, locale);
  const title = titleOf(item, locale);
  const sections: Array<[string, string]> = [
    ['opening', locale === 'ar' ? 'افتتاحية' : 'Opening'],
    ['issue_summary', String(data.issue_title || (locale === 'ar' ? 'قضية العدد' : 'Issue'))],
    ['practical_idea', locale === 'ar' ? 'فكرة عملية' : 'Practical idea'],
    ['learned', locale === 'ar' ? 'ما تعلمته' : 'What I learned'],
    ['challenge', locale === 'ar' ? 'التحدي' : 'Challenge'],
    ['reflection_question', locale === 'ar' ? 'سؤال للتفكير' : 'Reflection'],
    ['closing', locale === 'ar' ? 'ختام' : 'Closing'],
  ];

  return (
    <>
      <section className="pageHero pageHeroVisual">
        <div className="container pageHeroGrid">
          <div className="pageHeroCopy">
            <span className="kicker">{locale === 'ar' ? 'نشرة أثر' : 'IMPACT NEWSLETTER'}</span>
            <h1>{title}</h1>
          </div>
          <CoverVisual
            assetId={itemAssetId(data)}
            fallbackSrc={fallbackStill(item)}
            alt={title}
            className="pageHeroMedia"
            sizes="(max-width: 1050px) 92vw, 46vw"
            priority
          />
        </div>
      </section>
      <section className="section">
        <div className="container articlePanel">
          {sections.map(([key, label]) => data[key] ? (
            <section key={key}>
              <h2>{label}</h2>
              <p>{String(data[key])}</p>
            </section>
          ) : null)}
        </div>
      </section>
    </>
  );
}
