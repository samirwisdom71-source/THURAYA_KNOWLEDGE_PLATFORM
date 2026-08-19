'use client';

import { useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import { AdminCopyHead, useAdminLocale } from '@/components/AdminShell';
import { adminCopy, dateLocale } from '@/lib/admin-i18n';

type Subscriber = { id: string; email: string; locale: string; status: 'active' | 'unsubscribed' | 'bounced'; consent: boolean; created_at: string };

export function SubscribersPageHead() {
  const locale = useAdminLocale();
  return <AdminCopyHead page="subscribers" actions={<IconButton name="export" label={adminCopy[locale].exportCsv} href="/api/admin/subscribers/export" />} />;
}

export function SubscribersManager({ initial }: { initial: Subscriber[] }) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState('');
  const statusLabels: Record<Subscriber['status'], string> = {
    active: t.active,
    unsubscribed: t.unsubscribed,
    bounced: t.bounced,
  };

  async function save(id: string, status: Subscriber['status']) {
    const response = await fetch(`/api/admin/subscribers/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      setMsg(t.savedSubscriber);
    } else setMsg(payload.error || t.saveFailed);
  }

  return (
    <>
      {msg ? <div className="formMessage">{msg}</div> : null}
      <div className="tableWrap adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>{t.email}</th>
              <th>{t.language}</th>
              <th>{t.status}</th>
              <th>{t.consent}</th>
              <th>{t.date}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td dir="ltr">{item.email}</td>
                <td>{item.locale}</td>
                <td>
                  <select className="adminSelect" value={item.status} onChange={(event) => save(item.id, event.target.value as Subscriber['status'])}>
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </td>
                <td>{item.consent ? t.yes : t.no}</td>
                <td>{new Date(item.created_at).toLocaleString(dateLocale(locale))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!items.length && <div className="emptyState">{t.noSubscribers}</div>}
    </>
  );
}
