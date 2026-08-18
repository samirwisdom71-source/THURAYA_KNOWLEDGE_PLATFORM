import { AdminPageHead } from '@/components/AdminIcon';
import { AdminShell } from '@/components/AdminShell';
import { MediaManager } from '@/components/MediaManager';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';
import type { MediaAsset } from '@/lib/types';

export default async function Page() {
  const user = await requireAdminPage();
  const result = await query<MediaAsset>('SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 300');
  return (
    <AdminShell user={user}>
      <AdminPageHead title="الصور والملفات" subtitle="الأصل يبقى خاصًا حتى تُراجع الصورة وتُجعل عامة." />
      <MediaManager initial={result.rows} />
    </AdminShell>
  );
}
