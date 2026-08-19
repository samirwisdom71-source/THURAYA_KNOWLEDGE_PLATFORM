import { AdminShell } from '@/components/AdminShell';
import { NewContentPicker } from '@/components/NewContentPicker';
import { requireAdminPage } from '@/lib/admin-page';

export default async function Page() {
  const user = await requireAdminPage();
  return (
    <AdminShell user={user}>
      <NewContentPicker />
    </AdminShell>
  );
}
