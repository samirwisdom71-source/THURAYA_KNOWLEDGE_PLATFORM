import { AdminCopyHead, AdminShell } from '@/components/AdminShell';
import { SubmissionsManager } from '@/components/SubmissionsManager';
import { requireAdminPage } from '@/lib/admin-page';
import { query } from '@/lib/db';

export default async function Page() {
  const user = await requireAdminPage();
  const result = await query<{
    id: string; submission_type: string; locale: string; name: string | null; email: string | null;
    content_slug: string | null; payload: Record<string, unknown>; consent: boolean;
    moderation_status: string; moderation_private_notes?: string | null; created_at: string;
  }>(`SELECT id,submission_type,locale,name,email,content_slug,payload,consent,moderation_status,moderation_private_notes,created_at FROM public_submissions ORDER BY CASE moderation_status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 500`);
  return (
    <AdminShell user={user}>
      <AdminCopyHead page="submissions" />
      <SubmissionsManager initial={result.rows} />
    </AdminShell>
  );
}
