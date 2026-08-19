'use client';

import { AdminCopyHead, useAdminLocale } from '@/components/AdminShell';
import { IconButton } from '@/components/AdminIcon';
import { adminCopy, adminStatus, adminTranslation, adminVisibility, dateLocale, labelOf } from '@/lib/admin-i18n';
import { allContentTypes, contentTypeLabels } from '@/lib/content-fields';
import { titleOf } from '@/lib/content-text';
import type { ContentItem } from '@/lib/types';

export function ContentManager({
  items,
  filters,
}: {
  items: ContentItem[];
  filters: { type?: string; q?: string; status?: string };
}) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];

  return (
    <>
      <AdminCopyHead
        page="content"
        count={items.length}
        actions={<IconButton name="plus" label={t.addContent} tone="gold" href="/admin/new" />}
      />
      <form className="adminFilter" action="/admin/content">
        <select name="type" defaultValue={filters.type || ''} aria-label={t.type}>
          <option value="">{t.allTypes}</option>
          {allContentTypes.map((type) => <option key={type} value={type}>{contentTypeLabels[type][locale]}</option>)}
        </select>
        <select name="status" defaultValue={filters.status || ''} aria-label={t.status}>
          <option value="">{t.allStatuses}</option>
          {Object.entries(adminStatus).map(([value, labels]) => (
            <option key={value} value={value}>{labels[locale]}</option>
          ))}
        </select>
        <input name="q" defaultValue={filters.q || ''} placeholder={t.searchPlaceholder} />
        <IconButton name="search" label={t.filter} type="submit" />
      </form>
      <div className="tableWrap adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>{t.type}</th>
              <th>{t.title}</th>
              <th>{t.status}</th>
              <th>{t.visibility}</th>
              <th>{t.translation}</th>
              <th>{t.updated}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{contentTypeLabels[item.content_type][locale]}</td>
                <td>
                  <b>{titleOf(item, locale)}</b>
                  <small className="muted" style={{ display: 'block', direction: 'ltr' }}>{item.slug}</small>
                </td>
                <td><span className={`status ${item.status}`}>{labelOf(adminStatus, item.status, locale)}</span></td>
                <td>{labelOf(adminVisibility, item.visibility, locale)}</td>
                <td>{labelOf(adminTranslation, item.translation_status, locale)}</td>
                <td>{new Date(item.updated_at).toLocaleDateString(dateLocale(locale))}</td>
                <td><IconButton name="edit" label={t.edit} href={`/admin/content/${item.id}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!items.length && <div className="emptyState">{t.noRows}</div>}
    </>
  );
}
