import { AdminPageHead, IconButton } from '@/components/AdminIcon';
import { AdminShell } from '@/components/AdminShell';
import { SubscribersManager } from '@/components/SubscribersManager';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';

export default async function Page() {
  const user = await requireAdminPage();
  const result = await query<{ id: string; email: string; locale: string; status: 'active' | 'unsubscribed' | 'bounced'; consent: boolean; created_at: string }>('SELECT id,email,locale,status,consent,created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 1000');
  return (
    <AdminShell user={user}>
      <AdminPageHead
        title="المشتركون"
        subtitle="بيانات فعلية فقط. يمكن تغيير الحالة أو تصدير القائمة."
        actions={<IconButton name="export" label="تصدير CSV" href="/api/admin/subscribers/export" />}
      />
      <SubscribersManager initial={result.rows} />
    </AdminShell>
  );
}
