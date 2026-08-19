import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminShell } from '@/components/AdminShell';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';
import type { ContentType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

type CountRow = { key: string; n: string };
type MonthRow = { month: string; n: string };
type RecentRow = { id: string; content_type: ContentType; slug: string; status: string; title: string | null; title_en: string | null; updated_at: string };

export default async function Page() {
  const user = await requireAdminPage();
  const [totals, byStatus, byType, submissions, submissionTypes, months, visibility, translation, mediaReview, recent] = await Promise.all([
    query<{ content: string; published: string; media: string; pending: string; subscribers: string }>(`
      SELECT
        (SELECT count(*)::text FROM content_items) AS content,
        (SELECT count(*)::text FROM content_items WHERE status='published') AS published,
        (SELECT count(*)::text FROM media_assets) AS media,
        (SELECT count(*)::text FROM public_submissions WHERE moderation_status='pending') AS pending,
        (SELECT count(*)::text FROM newsletter_subscribers WHERE status='active') AS subscribers
    `),
    query<CountRow>(`SELECT status AS key, count(*)::text AS n FROM content_items GROUP BY status ORDER BY n DESC`),
    query<CountRow>(`SELECT content_type AS key, count(*)::text AS n FROM content_items GROUP BY content_type ORDER BY n DESC`),
    query<CountRow>(`SELECT moderation_status AS key, count(*)::text AS n FROM public_submissions GROUP BY moderation_status ORDER BY n DESC`),
    query<CountRow>(`SELECT submission_type AS key, count(*)::text AS n FROM public_submissions GROUP BY submission_type ORDER BY n DESC`),
    query<MonthRow>(`SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, count(*)::text AS n FROM content_items GROUP BY 1 ORDER BY 1 ASC`),
    query<CountRow>(`SELECT visibility AS key, count(*)::text AS n FROM content_items GROUP BY visibility ORDER BY n DESC`),
    query<CountRow>(`SELECT COALESCE(translation_status,'unset') AS key, count(*)::text AS n FROM content_items GROUP BY 1 ORDER BY n DESC`),
    query<CountRow>(`SELECT CASE WHEN public_safe_review THEN 'reviewed' ELSE 'pending_review' END AS key, count(*)::text AS n FROM media_assets GROUP BY 1 ORDER BY n DESC`),
    query<RecentRow>(`SELECT id, content_type, slug, status, COALESCE(data_ar->>'title', data_ar->>'question', slug) AS title, COALESCE(NULLIF(data_en->>'title',''), NULLIF(data_en->>'question','')) AS title_en, updated_at FROM content_items ORDER BY updated_at DESC LIMIT 8`),
  ]);

  const row = totals.rows[0];
  return (
    <AdminShell user={user}>
      <AdminDashboard
        totals={{
          content: Number(row?.content || 0),
          published: Number(row?.published || 0),
          media: Number(row?.media || 0),
          pending: Number(row?.pending || 0),
          subscribers: Number(row?.subscribers || 0),
        }}
        byStatus={byStatus.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        byType={byType.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        submissions={submissions.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        submissionTypes={submissionTypes.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        months={months.rows.map((item) => ({ month: item.month, n: Number(item.n) }))}
        visibility={visibility.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        translation={translation.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        mediaReview={mediaReview.rows.map((item) => ({ key: item.key, n: Number(item.n) }))}
        recent={recent.rows.map((item) => ({ ...item, title: item.title || item.slug, titleEn: item.title_en || undefined }))}
      />
    </AdminShell>
  );
}
