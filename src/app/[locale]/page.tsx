import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentCard } from '@/components/ContentCard';
import { HomeStillLife } from '@/components/HomeStillLife';
import { MediaVisual } from '@/components/MediaVisual';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { excerptOf, getFeatured, getPublicContent, getSetting, localizedData, titleOf } from '@/lib/content';
import { isLocale } from '@/lib/locale';

type HomeFeatured = {
  issue_slug?: string;
  article_slugs?: string[];
  minute_slug?: string;
  story_slug?: string;
  challenge_slug?: string;
  tool_slug?: string;
  publication_slug?: string;
};

const defaults: Required<HomeFeatured> = {
  issue_slug: 'family-sustainability-starts-at-home',
  article_slugs: ['sustainability-not-seasonal-campaign', 'ai-not-a-replacement-for-thinking', 'from-certificate-to-application'],
  minute_slug: 'ai-question-not-answer',
  story_slug: 'problem-before-technology',
  challenge_slug: 'one-hour-knowledge-volunteering',
  tool_slug: 'personal-learning-plan',
  publication_slug: 'smart-government-asset-management',
};

const focusAreas = [
  {
    image: '/home/sustainability.jpg',
    href: 'topics',
    ar: { title: 'الاستدامة', body: 'عادات صغيرة في البيت والعمل تصنع أثرًا يبقى.' },
    en: { title: 'Sustainability', body: 'Small habits at home and work that last.' },
  },
  {
    image: '/home/innovation.jpg',
    href: 'knowledge',
    ar: { title: 'الابتكار والذكاء الاصطناعي', body: 'تقنية تخدم التفكير، ولا تستبدل السؤال.' },
    en: { title: 'Innovation & AI', body: 'Technology that serves thinking, not replaces it.' },
  },
  {
    image: '/home/life.jpg',
    href: 'community',
    ar: { title: 'جودة الحياة', body: 'معرفة أقرب للإيقاع اليومي والهدوء.' },
    en: { title: 'Quality of life', body: 'Knowledge closer to daily rhythm and calm.' },
  },
  {
    image: '/home/knowledge.jpg',
    href: 'library',
    ar: { title: 'نشر المعرفة', body: 'أشارك ما أتعلمه ليصل أثره أبعد من مكان العمل.' },
    en: { title: 'Knowledge sharing', body: 'I share what I learn so the impact travels further.' },
  },
] as const;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [heroAsset, featured, heroAr, heroEn] = await Promise.all([
    getSetting<string | null>('hero_asset_id', null),
    getSetting<HomeFeatured>('home_featured', defaults),
    getSetting('hero_title_ar', 'أشارك المعرفة لأصنع أثرًا يتجاوز حدود العمل'),
    getSetting('hero_title_en', 'I share knowledge to create impact beyond work'),
  ]);

  const cfg = {
    ...defaults,
    ...featured,
    article_slugs: Array.isArray(featured.article_slugs) ? featured.article_slugs : defaults.article_slugs,
  };

  const [articles, issues, minutes, stories, challenges, tools, pubs, community, journal] = await Promise.all([
    getFeatured('article', cfg.article_slugs, 3),
    getFeatured('monthly_issue', [cfg.issue_slug], 1),
    getFeatured('minute_knowledge', [cfg.minute_slug], 1),
    getFeatured('impact_story', [cfg.story_slug], 1),
    getFeatured('challenge', [cfg.challenge_slug], 1),
    getFeatured('tool', [cfg.tool_slug], 1),
    getFeatured('publication', [cfg.publication_slug], 1),
    getPublicContent('community_content', { limit: 3 }),
    getPublicContent('visual_journal', { limit: 4 }),
  ]);

  const issue = issues[0];
  const minute = minutes[0];
  const story = stories[0];
  const challenge = challenges[0];
  const tool = tools[0];
  const pub = pubs[0];
  const issueData = issue ? localizedData(issue, locale) : null;
  const heroAlt = locale === 'ar'
    ? 'منضدة معرفة هادئة: دفتر مفتوح وكتب وأغصان زيتون'
    : 'A quiet study desk with an open notebook, books and olive branches';

  return (
    <>
      <section className="hero homeHero">
        <div className="container heroGrid">
          <div className="homeHeroCopy">
            <div className="badge homeBadge">
              <i />
              <span>{locale === 'ar' ? 'منصة شخصية للمعرفة والأثر المجتمعي' : 'A personal platform for knowledge and community impact'}</span>
            </div>
            <h1>{String(locale === 'ar' ? heroAr : heroEn)}</h1>
            <ul className="homePillars" aria-label={locale === 'ar' ? 'محاور المنصة' : 'Platform themes'}>
              {(locale === 'ar'
                ? ['الاستدامة', 'ابتكار مسؤول', 'جودة حياة', 'معرفة']
                : ['Sustainability', 'Responsible innovation', 'Quality of life', 'Knowledge']
              ).map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="heroActions">
              <Link className="btn primary" href={`/${locale}/knowledge`}>
                {locale === 'ar' ? 'استكشف مركز المعرفة' : 'Explore knowledge'}
              </Link>
              <Link className="btn secondary" href={`/${locale}/library`}>
                {locale === 'ar' ? 'تصفح مكتبتي' : 'Browse my library'}
              </Link>
            </div>
          </div>
          <div className="homeHeroFrame">
            {heroAsset
              ? <MediaVisual assetId={heroAsset} alt={heroAlt} className="heroMedia homeHeroMedia" />
              : <HomeStillLife src="/home/hero.jpg" alt={heroAlt} className="heroMedia homeHeroMedia" priority sizes="(max-width: 1050px) 92vw, 46vw" />}
            <span className="homeHeroGlow" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="section soft homeFocus">
        <div className="container">
          <Reveal>
            <SectionHeading
              kicker={locale === 'ar' ? 'مجالات الاهتمام' : 'FOCUS AREAS'}
              title={locale === 'ar' ? 'أفكار أتعلمها وأشاركها وأحوّلها إلى ممارسة' : 'Ideas I learn, share and turn into practice'}
            />
          </Reveal>
          <div className="homeFocusGrid">
            {focusAreas.map((area, index) => {
              const copy = locale === 'ar' ? area.ar : area.en;
              return (
                <Reveal key={area.image} delay={index * 90}>
                  <Link href={`/${locale}/${area.href}`} className={`focusCard ${index === 0 ? 'featured' : ''}`}>
                    <HomeStillLife
                      src={area.image}
                      alt={copy.title}
                      sizes={index === 0 ? '(max-width: 1050px) 92vw, 42vw' : '(max-width: 1050px) 92vw, 28vw'}
                    />
                    <span className="focusShade" aria-hidden="true" />
                    <span className="focusCopy">
                      <span className="kicker">0{index + 1}</span>
                      <h3>{copy.title}</h3>
                      <p>{copy.body}</p>
                      <em className="focusCta">{locale === 'ar' ? 'استكشف' : 'Explore'}</em>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {issue && issueData && (
        <section className="section homeFeatured">
          <div className="container">
            <Reveal>
              <div className="homeFeaturedSplit">
                <div className="homeFeaturedMedia">
                  {issueData.hero_asset_id
                    ? <MediaVisual assetId={issueData.hero_asset_id} alt={titleOf(issue, locale)} className="homeFeaturedVisual" />
                    : (
                      <HomeStillLife
                        src="/home/knowledge.jpg"
                        alt={locale === 'ar' ? 'كتب ودفتر على منضدة هادئة' : 'Books and a notebook on a quiet desk'}
                        sizes="(max-width: 1050px) 92vw, 46vw"
                      />
                    )}
                </div>
                <div className="homeFeaturedBody">
                  <span className="kicker">{locale === 'ar' ? 'قضية مختارة' : 'FEATURED TOPIC'}</span>
                  <h2>{titleOf(issue, locale)}</h2>
                  <p>{String(issueData.summary || '')}</p>
                  <Link className="btn gold" href={`/${locale}/topics/${issue.slug}`}>
                    {locale === 'ar' ? 'افتح القضية' : 'Open topic'}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="container">
          <Reveal>
            <SectionHeading
              kicker={locale === 'ar' ? 'معرفة عملية' : 'PRACTICAL KNOWLEDGE'}
              title={locale === 'ar' ? 'أحدث ما أشارك' : 'Latest knowledge'}
              href={`/${locale}/knowledge`}
              label={locale === 'ar' ? 'عرض الكل' : 'View all'}
            />
          </Reveal>
          <div className="grid3">
            {articles.map((item, index) => (
              <Reveal key={item.id} delay={index * 80}>
                <ContentCard item={item} locale={locale} index={index} excludeImages={['/home/hero.jpg','/home/knowledge.jpg']} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark homeBento">
        <div className="container">
          <Reveal>
            <SectionHeading
              kicker={locale === 'ar' ? 'بنتو المعرفة' : 'KNOWLEDGE BENTO'}
              title={locale === 'ar' ? 'فكرة، قصة، تحدٍ وأداة' : 'An idea, a story, a challenge and a tool'}
            />
          </Reveal>
          <div className="bento">
            {minute && (
              <Reveal className="feature">
                <div className="featurePanel feature homeMinute">
                  <span className="kicker">{locale === 'ar' ? 'دقيقة معرفة' : 'KNOWLEDGE MINUTE'}</span>
                  <h3>{titleOf(minute, locale)}</h3>
                  <p>{excerptOf(minute, locale, 280)}</p>
                  <Link className="btn gold" href={`/${locale}/content/${minute.content_type}/${minute.slug}`}>
                    {locale === 'ar' ? 'اقرأها' : 'Read it'}
                  </Link>
                </div>
              </Reveal>
            )}
            {story && <Reveal delay={70}><ContentCard item={story} locale={locale} compact index={0} excludeImages={['/home/life.jpg']} /></Reveal>}
            {challenge && <Reveal delay={110}><ContentCard item={challenge} locale={locale} compact index={1} excludeImages={['/home/innovation.jpg']} /></Reveal>}
            {tool && <Reveal delay={150}><ContentCard item={tool} locale={locale} compact index={2} excludeImages={['/home/knowledge.jpg']} /></Reveal>}
            {pub && <Reveal delay={190}><ContentCard item={pub} locale={locale} compact index={3} excludeImages={['/home/hero.jpg']} /></Reveal>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeading
              kicker={locale === 'ar' ? 'من المجتمع' : 'COMMUNITY'}
              title={locale === 'ar' ? 'معرفة أقرب للحياة اليومية' : 'Knowledge closer to everyday life'}
              href={`/${locale}/community`}
              label={locale === 'ar' ? 'المزيد' : 'More'}
            />
          </Reveal>
          <div className="grid3">
            {community.map((item, index) => (
              <Reveal key={item.id} delay={index * 80}>
                <ContentCard item={item} locale={locale} index={index} excludeImages={['/home/sustainability.jpg','/home/life.jpg']} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {journal.length > 0 && (
        <section className="section soft">
          <div className="container">
            <Reveal>
              <SectionHeading
                kicker={locale === 'ar' ? 'اليوميات البصرية' : 'VISUAL JOURNAL'}
                title={locale === 'ar' ? 'لحظات لها معنى' : 'Moments with meaning'}
                href={`/${locale}/journal`}
                label={locale === 'ar' ? 'اليوميات' : 'Journal'}
              />
            </Reveal>
            <div className="journalGrid">
              {journal.map((item, index) => {
                const data = localizedData(item, locale);
                return (
                  <Reveal key={item.id} className="journalItem" delay={index * 70}>
                    <MediaVisual assetId={data.image_asset_id} alt={String(data.alt || data.title || '')} />
                    <div>
                      <b>{titleOf(item, locale)}</b>
                      <p>{String(data.caption || '')}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section homeNewsletter">
        <div className="container">
          <Reveal>
            <div className="homeNewsletterCard">
              <HomeStillLife
                src="/home/life.jpg"
                alt={locale === 'ar' ? 'شرفة هادئة بنباتات ونور الصباح' : 'A quiet terrace with plants and morning light'}
                className="homeNewsletterArt"
                sizes="(max-width: 1050px) 92vw, 38vw"
              />
              <div className="homeNewsletterBody">
                <SectionHeading
                  kicker={locale === 'ar' ? 'نشرة أثر' : 'IMPACT NEWSLETTER'}
                  title={locale === 'ar' ? 'رسالة معرفية هادئة ومفيدة' : 'A thoughtful, useful knowledge note'}
                  body={locale === 'ar'
                    ? 'محتوى دوري يجمع فكرة عملية، أداة، ما تعلمته وسؤالًا للتفكير.'
                    : 'A periodic note with one practical idea, one tool, one lesson and one question.'}
                />
                <NewsletterForm locale={locale} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
