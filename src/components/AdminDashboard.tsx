'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { contentTypeLabels } from '@/lib/content-fields';
import type { ContentType } from '@/lib/types';
import { useAdminLocale } from './AdminShell';

export type NamedCount = { key: string; n: number };
export type MonthCount = { month: string; n: number };
export type RecentItem = { id: string; content_type: ContentType; slug: string; status: string; title: string; titleEn?: string; updated_at: string };

const statusLabel: Record<string, { ar: string; en: string }> = {
  published: { ar: 'منشور', en: 'Published' },
  draft: { ar: 'مسودة', en: 'Draft' },
  ready: { ar: 'جاهز', en: 'Ready' },
  awaiting_image: { ar: 'بانتظار صورة', en: 'Awaiting image' },
  archived: { ar: 'مؤرشف', en: 'Archived' },
  pending: { ar: 'بانتظار المراجعة', en: 'Pending' },
  approved: { ar: 'معتمد', en: 'Approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  spam: { ar: 'غير صالح', en: 'Spam' },
  public: { ar: 'عام', en: 'Public' },
  private: { ar: 'خاص', en: 'Private' },
  unlisted: { ar: 'غير مدرج', en: 'Unlisted' },
  reviewed: { ar: 'مراجع', en: 'Reviewed' },
  pending_review: { ar: 'لم يُراجع', en: 'Not reviewed' },
  ask_thuraya: { ar: 'اسأل ثريا', en: 'Ask Thuraya' },
  challenge: { ar: 'تحدٍ', en: 'Challenge' },
  not_started: { ar: 'بلا ترجمة', en: 'Not started' },
  translated: { ar: 'مترجم', en: 'Translated' },
  unset: { ar: 'غير محدد', en: 'Unset' },
};

const palette = ['#123F3A', '#1D665E', '#3A8E86', '#C8A76A', '#8B6B3A', '#91364B', '#425A5B', '#6FA89F', '#D4B483', '#0E3430'];

const statusColor: Record<string, string> = {
  published: '#1c6d50',
  draft: '#C8A76A',
  ready: '#3A8E86',
  awaiting_image: '#91364B',
  archived: '#748382',
  pending: '#C8A76A',
  approved: '#1c6d50',
  rejected: '#9c2d35',
  spam: '#748382',
  public: '#1c6d50',
  private: '#425A5B',
  unlisted: '#C8A76A',
  reviewed: '#1c6d50',
  pending_review: '#C8A76A',
};

function labelOf(key: string, locale: 'ar' | 'en') {
  return statusLabel[key]?.[locale] || key;
}

function colorOf(key: string, index = 0) {
  return statusColor[key] || palette[index % palette.length];
}

function empty(locale: 'ar' | 'en') {
  return <p className="muted">{locale === 'ar' ? 'لا بيانات بعد.' : 'No data yet.'}</p>;
}

function Donut({ items }: { items: NamedCount[] }) {
  const total = items.reduce((sum, item) => sum + item.n, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg className="adminDonut" viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r={radius} className="adminDonutTrack" />
      {items.filter((item) => item.n > 0).map((item, index) => {
        const length = total ? (item.n / total) * circumference : 0;
        const circle = (
          <circle
            key={item.key}
            cx="80"
            cy="80"
            r={radius}
            className="adminDonutArc"
            stroke={colorOf(item.key, index)}
            strokeDasharray={`${length} ${circumference}`}
            strokeDashoffset={-offset}
          />
        );
        offset += length;
        return circle;
      })}
      <text x="80" y="84" textAnchor="middle" className="adminDonutValue">{total}</text>
    </svg>
  );
}

function Columns({ items, locale }: { items: { key: string; label: string; n: number }[]; locale: 'ar' | 'en' }) {
  const max = Math.max(1, ...items.map((item) => item.n));
  if (!items.length) return empty(locale);
  return (
    <div className="adminCols" role="img" aria-label={locale === 'ar' ? 'أعمدة' : 'Columns'}>
      {items.map((item, index) => (
        <div key={item.key} className="adminCol" style={{ '--delay': `${index * 50}ms` } as CSSProperties}>
          <b>{item.n}</b>
          <div className="adminColTrack">
            <i style={{ '--col-h': `${(item.n / max) * 100}%`, background: colorOf(item.key, index) } as CSSProperties} />
          </div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function AreaLine({ points, locale }: { points: MonthCount[]; locale: 'ar' | 'en' }) {
  if (!points.length) return empty(locale);
  const width = 420;
  const height = 150;
  const max = Math.max(1, ...points.map((point) => point.n));
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const dots = points.map((point, index) => {
    const x = points.length > 1 ? index * step : width / 2;
    const y = height - (point.n / max) * (height - 24) - 12;
    return { ...point, x, y };
  });
  const line = dots.map((dot) => `${dot.x},${dot.y}`).join(' ');
  const area = `0,${height} ${line} ${dots[dots.length - 1].x},${height}`;
  return (
    <div>
      <svg className="adminArea" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D665E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1D665E" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon className="adminAreaFill" points={area} fill="url(#areaFill)" />
        <polyline className="adminSparkLine" points={line} />
        {dots.map((dot) => <circle key={dot.month} className="adminAreaDot" cx={dot.x} cy={dot.y} r="4" />)}
      </svg>
      <div className="dashMonths">
        {points.map((point) => <span key={point.month}>{point.month}<b>{point.n}</b></span>)}
      </div>
    </div>
  );
}

function Gauge({ value, total, locale }: { value: number; total: number; locale: 'ar' | 'en' }) {
  const ratio = total ? value / total : 0;
  const r = 70;
  const c = Math.PI * r;
  return (
    <div className="adminGauge">
      <svg viewBox="0 0 180 110" aria-hidden="true">
        <path d="M20 100 A70 70 0 0 1 160 100" className="adminGaugeTrack" />
        <path d="M20 100 A70 70 0 0 1 160 100" className="adminGaugeArc" strokeDasharray={`${ratio * c} ${c}`} />
      </svg>
      <div>
        <b>{Math.round(ratio * 100)}%</b>
        <span>{locale === 'ar' ? `${value} من ${total} منشور` : `${value} of ${total} published`}</span>
      </div>
    </div>
  );
}

function Waffle({ items, locale }: { items: NamedCount[]; locale: 'ar' | 'en' }) {
  const total = items.reduce((sum, item) => sum + item.n, 0);
  if (!total) return empty(locale);
  const cells = items.flatMap((item, index) => {
    const count = Math.max(0, Math.round((item.n / total) * 100));
    return Array.from({ length: count }, (_, cell) => ({ key: `${item.key}-${cell}`, color: colorOf(item.key, index) }));
  }).slice(0, 100);
  while (cells.length < 100) cells.push({ key: `empty-${cells.length}`, color: '#EDF5F2' });
  return (
    <div>
      <div className="adminWaffle" aria-hidden="true">
        {cells.map((cell) => <i key={cell.key} style={{ background: cell.color }} />)}
      </div>
      <ul className="dashLegend">
        {items.map((item, index) => (
          <li key={item.key}><i style={{ background: colorOf(item.key, index) }} />{labelOf(item.key, locale)} <b>{item.n}</b></li>
        ))}
      </ul>
    </div>
  );
}

function PolarPies({ items, locale }: { items: NamedCount[]; locale: 'ar' | 'en' }) {
  const total = items.reduce((sum, item) => sum + item.n, 0);
  if (!total) return empty(locale);
  let angle = -90;
  const slices = items.filter((item) => item.n > 0).map((item, index) => {
    const sweep = (item.n / total) * 360;
    const start = angle;
    angle += sweep;
    const large = sweep > 180 ? 1 : 0;
    const s = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return [80 + 62 * Math.cos(rad), 80 + 62 * Math.sin(rad)];
    };
    const [x1, y1] = s(start);
    const [x2, y2] = s(start + sweep);
    return { item, index, d: `M80 80 L${x1} ${y1} A62 62 0 ${large} 1 ${x2} ${y2} Z` };
  });
  return (
    <div className="dashDonutWrap">
      <svg className="adminPie" viewBox="0 0 160 160" aria-hidden="true">
        {slices.map((slice) => <path key={slice.item.key} d={slice.d} fill={colorOf(slice.item.key, slice.index)} className="adminPieSlice" />)}
        <circle cx="80" cy="80" r="28" fill="#fff" />
        <text x="80" y="85" textAnchor="middle" className="adminPieValue">{total}</text>
      </svg>
      <ul className="dashLegend">
        {items.map((item, index) => (
          <li key={item.key}><i style={{ background: colorOf(item.key, index) }} />{labelOf(item.key, locale)} <b>{item.n}</b></li>
        ))}
      </ul>
    </div>
  );
}

function Stacked({ items, locale }: { items: NamedCount[]; locale: 'ar' | 'en' }) {
  const total = items.reduce((sum, item) => sum + item.n, 0);
  if (!total) return empty(locale);
  return (
    <div>
      <div className="adminStack" aria-hidden="true">
        {items.filter((item) => item.n > 0).map((item, index) => (
          <i key={item.key} style={{ width: `${(item.n / total) * 100}%`, background: colorOf(item.key, index) }} title={`${item.key} ${item.n}`} />
        ))}
      </div>
      <ul className="dashLegend">
        {items.map((item, index) => (
          <li key={item.key}><i style={{ background: colorOf(item.key, index) }} />{labelOf(item.key, locale)} <b>{item.n}</b></li>
        ))}
      </ul>
    </div>
  );
}

export function AdminDashboard({
  totals,
  byStatus,
  byType,
  submissions,
  submissionTypes,
  months,
  visibility,
  translation,
  mediaReview,
  recent,
}: {
  totals: { content: number; published: number; media: number; pending: number; subscribers: number };
  byStatus: NamedCount[];
  byType: NamedCount[];
  submissions: NamedCount[];
  submissionTypes: NamedCount[];
  months: MonthCount[];
  visibility: NamedCount[];
  translation: NamedCount[];
  mediaReview: NamedCount[];
  recent: RecentItem[];
}) {
  const locale = useAdminLocale();
  const cards = [
    { n: totals.content, ar: 'كل السجلات', en: 'All records', href: '/admin/content', hint: locale === 'ar' ? 'في قاعدة البيانات' : 'In the database' },
    { n: totals.published, ar: 'منشور الآن', en: 'Published now', href: '/admin/content?status=published', hint: locale === 'ar' ? 'ظاهر للعامة' : 'Visible publicly' },
    { n: totals.media, ar: 'الصور والملفات', en: 'Media files', href: '/admin/media', hint: locale === 'ar' ? 'في المكتبة' : 'In the library' },
    { n: totals.pending, ar: 'بانتظار المراجعة', en: 'Awaiting review', href: '/admin/submissions', hint: locale === 'ar' ? 'مشاركات فعلية' : 'Actual submissions' },
    { n: totals.subscribers, ar: 'مشتركون فعليون', en: 'Actual subscribers', href: '/admin/subscribers', hint: locale === 'ar' ? 'يبدأ من الصفر' : 'Starts from zero' },
  ];

  return (
    <div className="dash">
      <div className="dashIntro">
        <div>
          <span className="kicker">{locale === 'ar' ? 'نظرة على العمل' : 'Working overview'}</span>
          <h1>{locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</h1>
          <p>{locale === 'ar' ? 'الأرقام هنا فعلية من قاعدة البيانات.' : 'These numbers are actual database counts.'}</p>
        </div>
        <Link className="btn primary" href="/admin/new">{locale === 'ar' ? 'إضافة محتوى' : 'Add content'}</Link>
      </div>

      <div className="dashKpis">
        {cards.map((card, index) => (
          <Link key={card.href} href={card.href} className="dashKpi" style={{ '--delay': `${index * 70}ms` } as CSSProperties}>
            <b>{card.n}</b>
            <span>{locale === 'ar' ? card.ar : card.en}</span>
            <small>{card.hint}</small>
          </Link>
        ))}
      </div>

      <div className="dashCharts">
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'حالة المحتوى' : 'Content status'}</h2>
            <p>{locale === 'ar' ? 'حلقة توزيع حسب حالة النشر.' : 'Ring chart by publishing state.'}</p>
          </header>
          <div className="dashDonutWrap">
            <Donut items={byStatus} />
            <ul className="dashLegend">
              {byStatus.map((item, index) => (
                <li key={item.key}><i style={{ background: colorOf(item.key, index) }} />{labelOf(item.key, locale)} <b>{item.n}</b></li>
              ))}
            </ul>
          </div>
        </section>
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'نسبة المنشور' : 'Publish rate'}</h2>
            <p>{locale === 'ar' ? 'مقياس من السجلات الفعلية.' : 'A gauge from actual records.'}</p>
          </header>
          <Gauge value={totals.published} total={totals.content} locale={locale} />
        </section>
      </div>

      <div className="dashCharts">
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'الإنشاء عبر الأشهر' : 'Created by month'}</h2>
            <p>{locale === 'ar' ? 'خط ومساحة حسب شهر الإنشاء.' : 'Area and line by creation month.'}</p>
          </header>
          <AreaLine points={months} locale={locale} />
        </section>
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'أنواع المشاركات' : 'Submission types'}</h2>
            <p>{locale === 'ar' ? 'رسم دائري لأسئلة الجمهور والتحديات.' : 'Pie chart of questions and challenges.'}</p>
          </header>
          <PolarPies items={submissionTypes} locale={locale} />
        </section>
      </div>

      <div className="dashCharts dashChartsWide">
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'أنواع المحتوى' : 'Content types'}</h2>
            <p>{locale === 'ar' ? 'أعمدة رأسية لكل نوع.' : 'Vertical columns for each type.'}</p>
          </header>
          <Columns
            items={byType.map((item) => ({
              key: item.key,
              n: item.n,
              label: contentTypeLabels[item.key as ContentType]?.[locale] || item.key,
            }))}
            locale={locale}
          />
        </section>
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'حالة المراجعة' : 'Moderation'}</h2>
            <p>{locale === 'ar' ? 'شريط مكدّس لمشاركات الجمهور.' : 'Stacked bar of public submissions.'}</p>
          </header>
          <Stacked items={submissions} locale={locale} />
        </section>
      </div>

      <div className="dashCharts">
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'الترجمة' : 'Translation'}</h2>
            <p>{locale === 'ar' ? 'شبكة 100 مربع حسب حالة الترجمة.' : 'A 100-cell waffle by translation state.'}</p>
          </header>
          <Waffle items={translation} locale={locale} />
        </section>
        <section className="dashPanel">
          <header>
            <h2>{locale === 'ar' ? 'الملفات المراجعة' : 'Reviewed media'}</h2>
            <p>{locale === 'ar' ? 'شريط مكدّس للصور والملفات.' : 'Stacked bar for media review.'}</p>
          </header>
          <Stacked items={mediaReview} locale={locale} />
          <header style={{ marginTop: 22 }}>
            <h2>{locale === 'ar' ? 'ظهور المحتوى' : 'Visibility'}</h2>
          </header>
          <Stacked items={visibility} locale={locale} />
        </section>
      </div>

      <section className="dashPanel">
        <header>
          <h2>{locale === 'ar' ? 'آخر التحديثات' : 'Latest updates'}</h2>
        </header>
        <div className="dashRecent dashRecentWide">
          {recent.map((item) => (
            <Link key={item.id} href={`/admin/content/${item.id}`} className="dashRecentItem">
              <span className={`status ${item.status}`}>{labelOf(item.status, locale)}</span>
              <b>{(locale === 'en' && item.titleEn) || item.title || item.slug}</b>
              <small>{contentTypeLabels[item.content_type][locale]} · {new Date(item.updated_at).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-GB')}</small>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
