'use client';

import { useState } from 'react';
import { IconButton } from '@/components/AdminIcon';

type Source = { source_key: string; title_ar: string; official_url: string; active: boolean };

export function SourcesManager({ initial }: { initial: Source[] }) {
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState('');
  const [newItem, setNewItem] = useState<Source>({ source_key: '', title_ar: '', official_url: 'https://', active: true });

  async function save(source: Source) {
    if (!/^[a-z0-9_-]+$/.test(source.source_key)) {
      setMsg('مفتاح المصدر: حروف إنجليزية صغيرة أو أرقام أو شرطة.');
      return;
    }
    const response = await fetch(`/api/admin/sources/${encodeURIComponent(source.source_key)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(source),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setMsg('تم حفظ المصدر.');
      setItems((prev) => (prev.some((item) => item.source_key === source.source_key)
        ? prev.map((item) => (item.source_key === source.source_key ? source : item))
        : [...prev, source].sort((a, b) => a.source_key.localeCompare(b.source_key))));
    } else setMsg(payload.error || 'تعذر الحفظ');
  }

  async function add() {
    await save(newItem);
    if (/^[a-z0-9_-]+$/.test(newItem.source_key) && newItem.title_ar && newItem.official_url.startsWith('https://')) {
      setNewItem({ source_key: '', title_ar: '', official_url: 'https://', active: true });
    }
  }

  return (
    <>
      <div className="adminCard adminComposer">
        <h2>مصدر جديد</h2>
        <div className="formGrid">
          <label>المفتاح<input dir="ltr" value={newItem.source_key} onChange={(event) => setNewItem({ ...newItem, source_key: event.target.value })} placeholder="source_key" /></label>
          <label>العنوان<input value={newItem.title_ar} onChange={(event) => setNewItem({ ...newItem, title_ar: event.target.value })} /></label>
        </div>
        <label>الرابط الرسمي HTTPS<input dir="ltr" value={newItem.official_url} onChange={(event) => setNewItem({ ...newItem, official_url: event.target.value })} /></label>
        <IconButton name="plus" label="إضافة المصدر" tone="gold" onClick={add} />
      </div>
      {msg ? <div className="formMessage">{msg}</div> : null}
      <div className="tableWrap adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>المفتاح</th>
              <th>العنوان</th>
              <th>الرابط</th>
              <th>نشط</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.source_key}>
                <td dir="ltr">{item.source_key}</td>
                <td><input value={item.title_ar} onChange={(event) => setItems(items.map((row, rowIndex) => (rowIndex === index ? { ...row, title_ar: event.target.value } : row)))} /></td>
                <td><input dir="ltr" value={item.official_url} onChange={(event) => setItems(items.map((row, rowIndex) => (rowIndex === index ? { ...row, official_url: event.target.value } : row)))} /></td>
                <td><input type="checkbox" checked={item.active} onChange={(event) => setItems(items.map((row, rowIndex) => (rowIndex === index ? { ...row, active: event.target.checked } : row)))} /></td>
                <td>
                  <div className="iconRow">
                    <IconButton name="save" label="حفظ" tone="success" onClick={() => save(items[index])} />
                    <IconButton name="link" label="فتح الرابط" href={item.official_url} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
