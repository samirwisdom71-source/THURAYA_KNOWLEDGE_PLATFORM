import { AdminShell } from '@/components/AdminShell';
import { AuditLog } from '@/components/AuditLog';
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
      <AuditLog rows={result.rows} />
    </AdminShell>
  );
}
