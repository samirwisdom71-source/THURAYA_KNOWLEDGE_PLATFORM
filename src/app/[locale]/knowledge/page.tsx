import { notFound } from 'next/navigation';
import { ContentCard } from '@/components/ContentCard';
import { PageHero } from '@/components/PageHero';
import { Reveal } from '@/components/Reveal';
import { SearchBox } from '@/components/SearchBox';
import { SectionHeading } from '@/components/SectionHeading';
import { getPublicContent } from '@/lib/content';
import { isLocale } from '@/lib/locale';
import { sectionHero } from '@/lib/visuals';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [articles, minutes, tools, qa, stories] = await Promise.all([
    getPublicContent('article', { limit: 24 }),
    getPublicContent('minute_knowledge', { limit: 12 }),
    getPublicContent('tool', { limit: 9 }),
    getPublicContent('ask_thuraya', { limit: 9 }),
    getPublicContent('impact_story', { limit: 9 }),
  ]);
  const mixed = [...tools.slice(0, 3), ...qa.slice(0, 3), ...stories.slice(0, 3)];
  const hero = sectionHero.knowledge;

  return (
    <>
      <PageHero
        kicker={locale === 'ar' ? 'مركز المعرفة' : 'KNOWLEDGE HUB'}
        title={locale === 'ar' ? 'مركز المعرفة' : 'Knowledge hub'}
        description={locale === 'ar' ? 'مقالات، دقائق معرفة، أدوات، أسئلة وأجوبة وقصص أثر في مكان واحد.' : 'Articles, knowledge minutes, tools, Q&A and impact stories in one place.'}
        image={hero}
        imageAlt={locale === 'ar' ? 'ركن مكتبة هادئ وكتب ومخطوطة مفتوحة' : 'A quiet library alcove with books and an open manuscript'}
      >
        <SearchBox locale={locale} />
      </PageHero>
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeading title={locale === 'ar' ? 'المقالات' : 'Articles'} />
          </Reveal>
          <div className="grid3">
            {articles.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ContentCard item={item} locale={locale} index={index} excludeImages={[hero]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <Reveal>
            <SectionHeading title={locale === 'ar' ? 'دقيقة معرفة' : 'Knowledge minutes'} />
          </Reveal>
          <div className="grid3">
            {minutes.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ContentCard item={item} locale={locale} compact index={index} excludeImages={[hero]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeading title={locale === 'ar' ? 'أدوات وأسئلة وقصص' : 'Tools, Q&A and stories'} />
          </Reveal>
          <div className="grid3">
            {mixed.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ContentCard item={item} locale={locale} compact index={index} excludeImages={[hero]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
