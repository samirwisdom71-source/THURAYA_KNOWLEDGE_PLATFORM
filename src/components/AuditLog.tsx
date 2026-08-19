'use client';

import { AdminCopyHead, useAdminLocale } from '@/components/AdminShell';
import { adminCopy, dateLocale } from '@/lib/admin-i18n';

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: unknown;
  created_at: string;
  email: string | null;
};

export function AuditLog({ rows }: { rows: AuditRow[] }) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  return (
    <>
      <AdminCopyHead page="audit" count={rows.length} />
      <div className="adminAudit">
        {rows.map((row) => (
          <article className="adminCard adminAuditItem" key={row.id}>
            <header>
              <b>{row.action}</b>
              <small>{new Date(row.created_at).toLocaleString(dateLocale(locale))}</small>
            </header>
            <p>{row.email || 'system'} · {row.entity_type}</p>
            {row.entity_id ? <small className="muted" dir="ltr">{row.entity_id}</small> : null}
            <pre>{JSON.stringify(row.changes, null, 2)}</pre>
          </article>
        ))}
      </div>
      {!rows.length && <div className="emptyState">{t.noEvents}</div>}
    </>
  );
}
