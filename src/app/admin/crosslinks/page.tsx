import { AdminCopyHead, AdminShell } from '@/components/AdminShell';
import { CrosslinksManager } from '@/components/CrosslinksManager';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';

export default async function Page() {
  const user = await requireAdminPage();
  const result = await query<{ publication_legacy_id: string; value_json: { related_articles?: string[]; related_tools?: string[] } }>('SELECT publication_legacy_id,value_json FROM publication_crosslinks ORDER BY publication_legacy_id');
  return (
    <AdminShell user={user}>
      <AdminCopyHead page="crosslinks" />
      <CrosslinksManager initial={result.rows} />
    </AdminShell>
  );
}
