import { AdminCopyHead, AdminShell } from '@/components/AdminShell';
import { SourcesManager } from '@/components/SourcesManager';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';

export default async function Page() {
  const user = await requireAdminPage();
  const result = await query<{ source_key: string; title_ar: string; official_url: string; active: boolean }>('SELECT source_key,title_ar,official_url,active FROM source_registry ORDER BY source_key');
  return (
    <AdminShell user={user}>
      <AdminCopyHead page="sources" />
      <SourcesManager initial={result.rows} />
    </AdminShell>
  );
}
