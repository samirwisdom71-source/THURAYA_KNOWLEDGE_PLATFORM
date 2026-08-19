import { AdminShell } from '@/components/AdminShell';
import { ContentManager } from '@/components/ContentManager';
import { requireAdminPage } from '@/lib/admin-page';
import { allContentTypes } from '@/lib/content-fields';
import { query } from '@/lib/db';
import type { ContentItem, ContentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; q?: string; status?: string }> }) {
  const user = await requireAdminPage();
  const sp = await searchParams;
  const values: unknown[] = [];
  let where = '1=1';
  if (sp.type && allContentTypes.includes(sp.type as ContentType)) {
    values.push(sp.type);
    where += ` AND content_type=$${values.length}`;
  }
  if (sp.status) {
    values.push(sp.status);
    where += ` AND status=$${values.length}`;
  }
  if (sp.q) {
    values.push(`%${sp.q}%`);
    where += ` AND (slug ILIKE $${values.length} OR data_ar::text ILIKE $${values.length} OR data_en::text ILIKE $${values.length})`;
  }
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE ${where} ORDER BY content_type, updated_at DESC LIMIT 400`, values);

  return (
    <AdminShell user={user}>
      <ContentManager items={result.rows} filters={sp} />
    </AdminShell>
  );
}
