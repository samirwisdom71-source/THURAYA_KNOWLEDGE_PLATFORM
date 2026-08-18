import type { ReactNode } from 'react';
import Link from 'next/link';
import { ContentCard } from './ContentCard';
import { CoverVisual } from './CoverVisual';
import { PageHero } from './PageHero';
import { Reveal } from './Reveal';
import { SearchBox } from './SearchBox';
import type { ContentItem, Locale } from '@/lib/types';
import { excerptOf, localizedData, titleOf } from '@/lib/content';
import { fallbackStill, itemAssetId } from '@/lib/visuals';

const detailRoute: Record<string, string> = {
  article: 'knowledge',
  monthly_issue: 'topics',
  challenge: 'challenges',
  newsletter: 'newsletter',
  publication: 'library',
  impact_story: 'stories',
  community_content: 'community',
};

export async function ContentListing({
  locale,
  items,
  title,
  description,
  kicker,
  image,
  imageAlt,
  showSearch = false,
  children,
}: {
  locale: Locale;
  items: ContentItem[];
  title: string;
  description: string;
  kicker: string;
  image: string;
  imageAlt: string;
  showSearch?: boolean;
  children?: ReactNode;
}) {
  const [lead, ...rest] = items;
  const leadData = lead ? localizedData(lead, locale) : null;
  const leadImage = lead ? fallbackStill(lead, 0, [image]) : '';
  const leadHref = lead
    ? (detailRoute[lead.content_type]
      ? `/${locale}/${detailRoute[lead.content_type]}/${lead.slug}`
      : `/${locale}/content/${lead.content_type}/${lead.slug}`)
    : '';

  return (
    <>
      <PageHero kicker={kicker} title={title} description={description} image={image} imageAlt={imageAlt}>
        {showSearch ? <SearchBox locale={locale} /> : null}
      </PageHero>
      <section className="section">
        <div className="container">
          {!items.length && (
            <div className="emptyState">{locale === 'ar' ? 'لا توجد مواد منشورة في هذا القسم حاليًا.' : 'No published items in this section yet.'}</div>
          )}
          {lead && leadData && (
            <Reveal>
              <Link href={leadHref} className="listingFeature">
                <CoverVisual
                  assetId={itemAssetId(leadData)}
                  fallbackSrc={leadImage}
                  alt={titleOf(lead, locale)}
                  className="listingFeatureMedia"
                  sizes="(max-width: 1050px) 92vw, 46vw"
                />
                <div className="listingFeatureBody">
                  <span className="kicker">{String(leadData.category ?? leadData.theme ?? leadData.type ?? '')}</span>
                  <h2>{titleOf(lead, locale)}</h2>
                  <p>{excerptOf(lead, locale, 220)}</p>
                  <em className="focusCta">{locale === 'ar' ? 'اقرأ المزيد' : 'Read more'}</em>
                </div>
              </Link>
            </Reveal>
          )}
          {rest.length > 0 && (
            <div className="grid3 listingGrid">
              {rest.map((item, index) => (
                <Reveal key={item.id} delay={index * 70}>
                  <ContentCard item={item} locale={locale} index={index + 1} excludeImages={[image, leadImage]} />
                </Reveal>
              ))}
            </div>
          )}
          {children}
        </div>
      </section>
    </>
  );
}
