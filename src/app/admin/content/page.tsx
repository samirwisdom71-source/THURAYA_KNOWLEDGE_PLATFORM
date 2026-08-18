import { AdminPageHead, IconButton } from '@/components/AdminIcon';
import { AdminShell } from '@/components/AdminShell';
import { requireAdminPage } from '@/lib/admin-page';
import { allContentTypes, contentTypeLabels } from '@/lib/content-fields';
import { query } from '@/lib/db';
import type { ContentItem, ContentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const statusAr: Record<string, string> = {
  published: 'منشور',
  draft: 'مسودة',
  ready: 'جاهز',
  awaiting_image: 'بانتظار صورة',
  archived: 'مؤرشف',
};
const visibilityAr: Record<string, string> = { public: 'عام', private: 'خاص', unlisted: 'غير مفهرس' };
const translationAr: Record<string, string> = {
  not_started: 'بدون ترجمة',
  translated: 'مترجمة',
  reviewed: 'مراجعة يدوية',
  pending: 'قيد الترجمة',
  failed: 'فشلت',
  unset: 'غير محددة',
};

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
    where += ` AND (slug ILIKE $${values.length} OR data_ar::text ILIKE $${values.length})`;
  }
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE ${where} ORDER BY content_type, updated_at DESC LIMIT 400`, values);

  return (
    <AdminShell user={user}>
      <AdminPageHead
        title="المحتوى"
        subtitle={`${result.rows.length} سجل`}
        actions={<IconButton name="plus" label="إضافة محتوى" tone="gold" href="/admin/new" />}
      />
      <form className="adminFilter" action="/admin/content">
        <select name="type" defaultValue={sp.type || ''}>
          <option value="">كل الأنواع</option>
          {allContentTypes.map((type) => <option key={type} value={type}>{contentTypeLabels[type].ar}</option>)}
        </select>
        <select name="status" defaultValue={sp.status || ''}>
          <option value="">كل الحالات</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
          <option value="ready">جاهز</option>
          <option value="awaiting_image">بانتظار صورة</option>
          <option value="archived">مؤرشف</option>
        </select>
        <input name="q" defaultValue={sp.q || ''} placeholder="بحث في العنوان أو الـ slug" />
        <IconButton name="search" label="تصفية" type="submit" />
      </form>
      <div className="tableWrap adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>النوع</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th>الظهور</th>
              <th>الترجمة</th>
              <th>آخر تحديث</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {result.rows.map((item) => (
              <tr key={item.id}>
                <td>{contentTypeLabels[item.content_type].ar}</td>
                <td>
                  <b>{String(item.data_ar?.title || item.data_ar?.question || item.slug)}</b>
                  <small className="muted" style={{ display: 'block', direction: 'ltr' }}>{item.slug}</small>
                </td>
                <td><span className={`status ${item.status}`}>{statusAr[item.status] || item.status}</span></td>
                <td>{visibilityAr[item.visibility] || item.visibility}</td>
                <td>{translationAr[item.translation_status] || item.translation_status}</td>
                <td>{new Date(item.updated_at).toLocaleDateString('ar-AE')}</td>
                <td><IconButton name="edit" label="تعديل" href={`/admin/content/${item.id}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!result.rows.length && <div className="emptyState">لا توجد سجلات مطابقة.</div>}
    </AdminShell>
  );
}
