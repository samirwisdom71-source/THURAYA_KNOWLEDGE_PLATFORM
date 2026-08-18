import Link from 'next/link';
import { AdminPageHead } from '@/components/AdminIcon';
import { AdminShell } from '@/components/AdminShell';
import { requireAdminPage } from '@/lib/admin-page';
import { allContentTypes, contentTypeLabels } from '@/lib/content-fields';

export default async function Page() {
  const user = await requireAdminPage();
  return (
    <AdminShell user={user}>
      <AdminPageHead title="محتوى جديد" subtitle="اختاري النوع. يمكن حفظه كمسودة قبل النشر." />
      <div className="typeGrid">
        {allContentTypes.map((type, index) => (
          <Link key={type} className="adminCard typeChoice" href={`/admin/new/${type}`} style={{ animationDelay: `${index * 40}ms` }}>
            <span className="kicker">{type}</span>
            <b>{contentTypeLabels[type].ar}</b>
            <span>{contentTypeLabels[type].en}</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
