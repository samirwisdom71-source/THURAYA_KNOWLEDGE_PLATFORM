import Link from 'next/link';
import type { ContentItem, Locale } from '@/lib/types';
import { excerptOf, localizedData, titleOf } from '@/lib/content';
import { fallbackStill, itemAssetId } from '@/lib/visuals';
import { CoverVisual } from './CoverVisual';

const detailRoute: Record<string, string> = {
  article: 'knowledge',
  monthly_issue: 'topics',
  challenge: 'challenges',
  newsletter: 'newsletter',
  publication: 'library',
  impact_story: 'stories',
  community_content: 'community',
};

export async function ContentCard({
  item,
  locale,
  compact = false,
  index = 0,
  excludeImages = [],
}: {
  item: ContentItem;
  locale: Locale;
  compact?: boolean;
  index?: number;
  excludeImages?: string[];
}) {
  const data = localizedData(item, locale);
  const route = detailRoute[item.content_type];
  const href = route ? `/${locale}/${route}/${item.slug}` : `/${locale}/content/${item.content_type}/${item.slug}`;
  const title = titleOf(item, locale);
  const label = String(data.category ?? data.theme ?? data.type ?? '');
  return (
    <article className={`contentCard ${compact ? 'compact' : ''}`}>
      <div className="cardVisual">
        <CoverVisual
          assetId={itemAssetId(data)}
          fallbackSrc={fallbackStill(item, index, excludeImages)}
          alt={title}
          className="cardCover"
        />
        {label ? <span>{label}</span> : null}
      </div>
      <div className="cardBody">
        <div className="eyebrow">{String(data.category ?? data.theme ?? data.month_label ?? '')}</div>
        <h3><Link href={href}>{title}</Link></h3>
        <p>{excerptOf(item, locale, compact ? 110 : 180)}</p>
        <Link className="textLink cardMore" href={href}><span>{locale === 'ar' ? 'اقرأ المزيد' : 'Read more'}</span></Link>
      </div>
    </article>
  );
}
