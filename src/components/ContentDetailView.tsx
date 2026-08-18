import Link from 'next/link';
import { Markdown } from '@/lib/markdown';
import { getSourcesForArticle, localizedData, titleOf } from '@/lib/content';
import { fallbackStill, itemAssetId } from '@/lib/visuals';
import type { ContentItem, Locale } from '@/lib/types';
import { ChallengeForm } from './ChallengeForm';
import { CoverVisual } from './CoverVisual';

function textBody(d: Record<string, unknown>) {
  return String(d.body_markdown ?? d.executive_summary ?? d.answer ?? d.content ?? d.caption ?? '');
}

function formatPublishDate(value: unknown, locale: Locale) {
  const date = value instanceof Date ? value : new Date(String(value ?? ''));
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-AE' : 'en-GB', { dateStyle: 'medium' }).format(date);
}

export async function ContentDetailView({ item, locale, challengeCount }: { item: ContentItem; locale: Locale; challengeCount?: number }) {
  const data = localizedData(item, locale);
  const sources = item.content_type === 'article' ? await getSourcesForArticle(item) : [];
  const title = titleOf(item, locale);
  const category = String(data.category ?? data.theme ?? data.type ?? data.month_label ?? '');
  const published = item.show_publish_date ? formatPublishDate(item.first_published_at, locale) : null;

  return (
    <>
      <section className="pageHero pageHeroVisual">
        <div className="container pageHeroGrid">
          <div className="pageHeroCopy">
            <div className="breadcrumbs">
              <Link href={`/${locale}`}>{locale === 'ar' ? 'الرئيسية' : 'Home'}</Link> / {category}
            </div>
            <span className="kicker">{category}</span>
            <h1>{title}</h1>
            {data.summary ? <p>{String(data.summary)}</p> : null}
            <div className="metaStrip">
              {data.reading_time ? <span className="metaChip">{String(data.reading_time)}</span> : null}
              {published ? <span className="metaChip">{published}</span> : null}
            </div>
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
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container contentLayout">
          <article className="articlePanel">
            <Markdown text={textBody(data)} />
            {item.content_type === 'challenge' && (
              <>
                <h2>{locale === 'ar' ? 'خطوات التحدي' : 'Challenge steps'}</h2>
                <ol>{Array.isArray(data.steps) && data.steps.map((step, index) => <li key={index}>{String(step)}</li>)}</ol>
                {data.completion_rule && (
                  <div className="privacyBox">
                    <b>{locale === 'ar' ? 'قاعدة الإكمال' : 'Completion rule'}</b>
                    <p>{String(data.completion_rule)}</p>
                  </div>
                )}
                <h2>{locale === 'ar' ? 'شارك تجربتك' : 'Share your experience'}</h2>
                <ChallengeForm locale={locale} slug={item.slug} />
              </>
            )}
          </article>
          <aside className="sidePanel">
            <h3>{locale === 'ar' ? 'عن هذه المادة' : 'About this item'}</h3>
            {category && <p>{category}</p>}
            {challengeCount && challengeCount > 0 ? (
              <div className="statActual">
                <b>{challengeCount}</b>
                <span>{locale === 'ar' ? 'مشاركة فعلية محفوظة' : 'actual saved participations'}</span>
              </div>
            ) : null}
            {sources.length > 0 && (
              <>
                <h3>{locale === 'ar' ? 'مصادر مرتبطة' : 'Related sources'}</h3>
                <div className="sourceList">
                  {sources.map((source) => (
                    <a key={source!.source_key} href={source!.official_url} target="_blank" rel="noopener noreferrer">{source!.title_ar}</a>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
