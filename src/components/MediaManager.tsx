'use client';

import { useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import type { MediaAsset } from '@/lib/types';

export function MediaManager({ initial }: { initial: MediaAsset[] }) {
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteReady, setDeleteReady] = useState<string | null>(null);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMsg('');
    const form = event.currentTarget;
    const response = await fetch('/api/admin/media', { method: 'POST', body: new FormData(form) });
    const payload = await response.json().catch(() => ({}));
    setUploading(false);
    if (!response.ok) {
      setMsg(payload.error || 'فشل الرفع');
      return;
    }
    setItems((prev) => [payload.item, ...prev.filter((item) => item.id !== payload.item.id)]);
    setMsg('تم رفع الملف وحفظ الأصل بصورة خاصة.');
    form.reset();
  }

  async function patch(id: string, changes: Record<string, unknown>) {
    setMsg('');
    const response = await fetch(`/api/admin/media/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(changes),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? payload.item : item)));
      setMsg('تم حفظ بيانات الملف.');
    } else setMsg(payload.error || 'تعذر التحديث');
  }

  async function remove(id: string) {
    if (deleteReady !== id) {
      setDeleteReady(id);
      setMsg('اضغطي أيقونة الحذف مرة ثانية للتأكيد. الملفات المستخدمة لن تُحذف.');
      return;
    }
    const response = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setDeleteReady(null);
      setMsg('تم حذف الملف.');
    } else setMsg(payload.error || 'لا يمكن حذف ملف مستخدم في محتوى.');
  }

  function localEdit(id: string, key: 'alt_ar' | 'alt_en', value: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }

  return (
    <>
      <form className="adminCard adminUpload" onSubmit={upload}>
        <div>
          <h2>رفع ملف</h2>
          <p className="muted">الصور تُحوَّل إلى WebP بلا EXIF/GPS. لا تصبح عامة تلقائيًا.</p>
        </div>
        <input type="file" name="file" required />
        <div className="formGrid">
          <label>Alt عربي<input name="altAr" /></label>
          <label>Alt English<input name="altEn" dir="ltr" /></label>
        </div>
        <label>
          حالة الموافقة
          <select name="consentStatus" defaultValue="not_applicable">
            <option value="not_applicable">غير مطلوبة</option>
            <option value="pending">بانتظار موافقة</option>
            <option value="confirmed">موافقة مؤكدة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </label>
        <IconButton name="upload" label={uploading ? 'جارٍ الرفع' : 'رفع وحفظ'} tone="gold" type="submit" disabled={uploading} />
        {msg ? <div className="formMessage">{msg}</div> : null}
      </form>
      <div className="mediaGrid">
        {items.map((item) => (
          <article className="mediaCard" key={item.id}>
            <div className="thumb">
              {item.kind === 'image'
                ? <img src={item.public_safe_review && item.visibility === 'public' ? `/api/media/${item.id}` : `/api/admin/media/${item.id}/preview`} alt={item.alt_ar || ''} />
                : <b>{item.kind.toUpperCase()}</b>}
            </div>
            <div className="body">
              <b>{item.original_name}</b>
              <p>{Math.round(item.size_bytes / 1024)} KB · تنزيلات: {Number(item.download_count || 0)}</p>
              <label>Alt عربي<input value={item.alt_ar || ''} onChange={(event) => localEdit(item.id, 'alt_ar', event.target.value)} /></label>
              <label>Alt English<input dir="ltr" value={item.alt_en || ''} onChange={(event) => localEdit(item.id, 'alt_en', event.target.value)} /></label>
              <label className="check">
                <input type="checkbox" checked={item.public_safe_review} onChange={(event) => patch(item.id, { publicSafeReview: event.target.checked })} />
                <span>مراجعة أمان عامة</span>
              </label>
              <label>
                الظهور
                <select value={item.visibility} onChange={(event) => patch(item.id, { visibility: event.target.value })}>
                  <option value="private">خاص</option>
                  <option value="public">عام</option>
                </select>
              </label>
              <label>
                الموافقة
                <select value={item.consent_status} onChange={(event) => patch(item.id, { consentStatus: event.target.value })}>
                  <option value="not_applicable">غير مطلوبة</option>
                  <option value="pending">معلقة</option>
                  <option value="confirmed">مؤكدة</option>
                  <option value="rejected">مرفوضة</option>
                </select>
              </label>
              <div className="iconRow">
                <IconButton name="save" label="حفظ النص البديل" tone="success" onClick={() => patch(item.id, { altAr: item.alt_ar || '', altEn: item.alt_en || '' })} />
                <IconButton name="eye" label="معاينة الأصل" href={`/api/admin/media/${item.id}/preview`} />
                {item.public_safe_review && item.visibility === 'public'
                  ? <IconButton name="download" label="تنزيل عام" href={`/api/media/${item.id}?download=1`} />
                  : null}
                <IconButton name="trash" label={deleteReady === item.id ? 'تأكيد الحذف' : 'حذف'} tone="danger" onClick={() => remove(item.id)} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
