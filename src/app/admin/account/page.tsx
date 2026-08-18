import { AdminShell } from '@/components/AdminShell';
import { AccountManager } from '@/components/AccountManager';
import { requireAdminPage } from '@/lib/admin-page';

export default async function Page() {
  const user = await requireAdminPage();
  return (
    <AdminShell user={user}>
      <AccountManager initial={{ name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }} />
    </AdminShell>
  );
}
