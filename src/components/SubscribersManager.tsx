'use client';

import { useState } from 'react';

type Subscriber = { id: string; email: string; locale: string; status: 'active' | 'unsubscribed' | 'bounced'; consent: boolean; created_at: string };

const statusAr: Record<Subscriber['status'], string> = { active: 'نشط', unsubscribed: 'ألغى الاشتراك', bounced: 'مرتد' };

export function SubscribersManager({ initial }: { initial: Subscriber[] }) {
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState('');

  async function save(id: string, status: Subscriber['status']) {
    const response = await fetch(`/api/admin/subscribers/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      setMsg('تم حفظ حالة المشترك.');
    } else setMsg(payload.error || 'تعذر الحفظ');
  }

  return (
    <>
      {msg ? <div className="formMessage">{msg}</div> : null}
      <div className="tableWrap adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>البريد</th>
              <th>اللغة</th>
              <th>الحالة</th>
              <th>الموافقة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td dir="ltr">{item.email}</td>
                <td>{item.locale}</td>
                <td>
                  <select className="adminSelect" value={item.status} onChange={(event) => save(item.id, event.target.value as Subscriber['status'])}>
                    {Object.entries(statusAr).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </td>
                <td>{item.consent ? 'نعم' : 'لا'}</td>
                <td>{new Date(item.created_at).toLocaleString('ar-AE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!items.length && <div className="emptyState">لا مشتركين بعد. العداد يبدأ من الصفر.</div>}
    </>
  );
}
