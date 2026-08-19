'use client';

import { useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import { useAdminLocale } from '@/components/AdminShell';
import { adminCopy } from '@/lib/admin-i18n';
import type { MediaAsset } from '@/lib/types';

export function MediaManager({ initial }: { initial: MediaAsset[] }) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
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
      setMsg(payload.error || t.uploadFailed);
      return;
    }
    setItems((prev) => [payload.item, ...prev.filter((item) => item.id !== payload.item.id)]);
    setMsg(t.uploadedPrivate);
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
      setMsg(t.savedMedia);
    } else setMsg(payload.error || t.updateFailed);
  }

  async function remove(id: string) {
    if (deleteReady !== id) {
      setDeleteReady(id);
      setMsg(t.confirmDeleteHint);
      return;
    }
    const response = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setDeleteReady(null);
      setMsg(t.deletedFile);
    } else setMsg(payload.error || t.cannotDeleteUsed);
  }

  function localEdit(id: string, key: 'alt_ar' | 'alt_en', value: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }

  return (
    <>
      <form className="adminCard adminUpload" onSubmit={upload}>
        <div>
          <h2>{t.uploadFile}</h2>
          <p className="muted">{t.uploadHint}</p>
        </div>
        <input type="file" name="file" required />
        <div className="formGrid">
          <label>{t.altAr}<input name="altAr" /></label>
          <label>{t.altEn}<input name="altEn" dir="ltr" /></label>
        </div>
        <label>
          {t.consentStatus}
          <select name="consentStatus" defaultValue="not_applicable">
            <option value="not_applicable">{t.consentNa}</option>
            <option value="pending">{t.consentPending}</option>
            <option value="confirmed">{t.consentConfirmed}</option>
            <option value="rejected">{t.consentRejected}</option>
          </select>
        </label>
        <IconButton name="upload" label={uploading ? t.uploading : t.uploadSave} tone="gold" type="submit" disabled={uploading} />
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
              <p>{Math.round(item.size_bytes / 1024)} KB · {t.downloads}: {Number(item.download_count || 0)}</p>
              <label>{t.altAr}<input value={item.alt_ar || ''} onChange={(event) => localEdit(item.id, 'alt_ar', event.target.value)} /></label>
              <label>{t.altEn}<input dir="ltr" value={item.alt_en || ''} onChange={(event) => localEdit(item.id, 'alt_en', event.target.value)} /></label>
              <label className="check">
                <input type="checkbox" checked={item.public_safe_review} onChange={(event) => patch(item.id, { publicSafeReview: event.target.checked })} />
                <span>{t.publicSafeReview}</span>
              </label>
              <label>
                {t.visibility}
                <select value={item.visibility} onChange={(event) => patch(item.id, { visibility: event.target.value })}>
                  <option value="private">{locale === 'ar' ? 'خاص' : 'Private'}</option>
                  <option value="public">{locale === 'ar' ? 'عام' : 'Public'}</option>
                </select>
              </label>
              <label>
                {t.consent}
                <select value={item.consent_status} onChange={(event) => patch(item.id, { consentStatus: event.target.value })}>
                  <option value="not_applicable">{t.consentNa}</option>
                  <option value="pending">{t.consentPending}</option>
                  <option value="confirmed">{t.consentConfirmed}</option>
                  <option value="rejected">{t.consentRejected}</option>
                </select>
              </label>
              <div className="iconRow">
                <IconButton name="save" label={t.saveAlt} tone="success" onClick={() => patch(item.id, { altAr: item.alt_ar || '', altEn: item.alt_en || '' })} />
                <IconButton name="eye" label={t.previewOriginal} href={`/api/admin/media/${item.id}/preview`} />
                {item.public_safe_review && item.visibility === 'public'
                  ? <IconButton name="download" label={t.publicDownload} href={`/api/media/${item.id}?download=1`} />
                  : null}
                <IconButton name="trash" label={deleteReady === item.id ? t.confirmDelete : t.delete} tone="danger" onClick={() => remove(item.id)} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
