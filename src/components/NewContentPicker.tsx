'use client';

import Link from 'next/link';
import { AdminCopyHead, useAdminLocale } from '@/components/AdminShell';
import { allContentTypes, contentTypeLabels } from '@/lib/content-fields';

export function NewContentPicker() {
  const locale = useAdminLocale();
  return (
    <>
      <AdminCopyHead page="new" />
      <div className="typeGrid">
        {allContentTypes.map((type, index) => (
          <Link key={type} className="adminCard typeChoice" href={`/admin/new/${type}`} style={{ animationDelay: `${index * 40}ms` }}>
            <span className="kicker">{type}</span>
            <b>{contentTypeLabels[type][locale]}</b>
            <span>{contentTypeLabels[type][locale === 'ar' ? 'en' : 'ar']}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
