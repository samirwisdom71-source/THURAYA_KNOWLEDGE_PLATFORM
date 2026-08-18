import { AdminPageHead } from '@/components/AdminIcon';
import { AdminShell } from '@/components/AdminShell';
import { SettingsManager } from '@/components/SettingsManager';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';
import type { MediaAsset } from '@/lib/types';

export default async function Page() {
  const user = await requireAdminPage();
  const [settings, media] = await Promise.all([
    query<{ setting_key: string; value_json: unknown }>('SELECT setting_key,value_json FROM site_settings'),
    query<MediaAsset>('SELECT * FROM media_assets ORDER BY created_at DESC'),
  ]);
  const initial = Object.fromEntries(settings.rows.map((row) => [row.setting_key, row.value_json]));
  return (
    <AdminShell user={user}>
      <AdminPageHead title="الإعدادات" subtitle="هوية الموقع والنصوص العامة وصور الـ Hero." />
      <SettingsManager initial={initial} media={media.rows} />
    </AdminShell>
  );
}
