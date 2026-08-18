import { AdminPageHead } from '@/components/AdminIcon';
import { AdminShell } from '@/components/AdminShell';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: unknown;
  created_at: string;
  email: string | null;
};

export default async function Page() {
  const user = await requireAdminPage();
  const result = await query<AuditRow>(`SELECT a.id,a.action,a.entity_type,a.entity_id,a.changes,a.created_at,u.email FROM audit_log a LEFT JOIN admin_users u ON u.id=a.admin_user_id ORDER BY a.created_at DESC LIMIT 500`);
  return (
    <AdminShell user={user}>
      <AdminPageHead title="سجل التدقيق" subtitle={`${result.rows.length} حدث محفوظ.`} />
      <div className="adminAudit">
        {result.rows.map((row) => (
          <article className="adminCard adminAuditItem" key={row.id}>
            <header>
              <b>{row.action}</b>
              <small>{new Date(row.created_at).toLocaleString('ar-AE')}</small>
            </header>
            <p>{row.email || 'system'} · {row.entity_type}</p>
            {row.entity_id ? <small className="muted" dir="ltr">{row.entity_id}</small> : null}
            <pre>{JSON.stringify(row.changes, null, 2)}</pre>
          </article>
        ))}
      </div>
      {!result.rows.length && <div className="emptyState">لا أحداث بعد.</div>}
    </AdminShell>
  );
}
