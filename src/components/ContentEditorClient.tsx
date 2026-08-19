'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconButton } from '@/components/AdminIcon';
import { useAdminLocale } from '@/components/AdminShell';
import { adminCopy, adminStatus, adminVisibility, dateLocale } from '@/lib/admin-i18n';
import type { ContentItem, ContentType, FieldSpec, MediaAsset } from '@/lib/types';
import { contentFields, contentTypeLabels } from '@/lib/content-fields';

function toInput(v: unknown, t: FieldSpec['type']) {
  if (t === 'array') return Array.isArray(v) ? v.join('\n') : '';
  if (t === 'boolean') return Boolean(v);
  return v == null ? '' : String(v);
}
function fromInput(v: unknown, t: FieldSpec['type']) {
  if (t === 'array') return String(v).split('\n').map((x) => x.trim()).filter(Boolean);
  if (t === 'number') return v === '' ? null : Number(v);
  if (t === 'boolean') return Boolean(v);
  return String(v ?? '');
}

export function ContentEditorClient({ item, type }: { item?: ContentItem; type: ContentType }) {
  const router = useRouter();
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  const [tab, setTab] = useState<'ar' | 'en'>('ar');
  const [status, setStatus] = useState(item?.status || 'draft');
  const [visibility, setVisibility] = useState(item?.visibility || 'public');
  const [showPublishDate, setShowPublishDate] = useState(item?.show_publish_date || false);
  const [slug, setSlug] = useState(item?.slug || '');
  const [dataAr, setDataAr] = useState<Record<string, unknown>>(item?.data_ar || {});
  const [dataEn, setDataEn] = useState<Record<string, unknown>>(item?.data_en || {});
  const [manualOverrideEn, setManualOverrideEn] = useState(Boolean(item?.manual_override_en));
  const [privateData, setPrivateData] = useState(JSON.stringify(item?.private_data || {}, null, 2));
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [archiveArmed, setArchiveArmed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/media?limit=200').then((r) => r.json()).then((j) => setMedia(j.items || [])).catch(() => {});
  }, []);

  const fields = contentFields[type];
  const data = tab === 'ar' ? dataAr : dataEn;

  function setField(spec: FieldSpec, value: unknown) {
    const next = { ...data, [spec.key]: fromInput(value, spec.type) };
    if (tab === 'ar') setDataAr(next);
    else {
      setDataEn(next);
      setManualOverrideEn(true);
    }
  }

  async function save(nextStatus = status) {
    setSaving(true);
    setMsg('');
    let parsedPrivate = {};
    try {
      parsedPrivate = privateData ? JSON.parse(privateData) : {};
    } catch {
      setMsg(t.invalidPrivateJson);
      setSaving(false);
      return;
    }
    const body = { contentType: type, slug, status: nextStatus, visibility, showPublishDate, dataAr, dataEn, privateData: parsedPrivate, manualOverrideEn };
    const url = item ? `/api/admin/content/${item.id}` : '/api/admin/content';
    const r = await fetch(url, { method: item ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) {
      setMsg(j.error || t.saveFailed);
      return;
    }
    setStatus(j.item?.status || nextStatus);
    setMsg(t.savedOk);
    if (!item && j.item?.id) router.replace(`/admin/content/${j.item.id}`);
    router.refresh();
  }

  async function translate() {
    if (!item) {
      setMsg(t.saveFirstTranslate);
      return;
    }
    setSaving(true);
    setMsg('');
    const r = await fetch(`/api/admin/content/${item.id}/translate`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) {
      setMsg(j.error || t.translateFailed);
      return;
    }
    setDataEn(j.item.data_en || {});
    setManualOverrideEn(false);
    setTab('en');
    setMsg(t.translatedMsg);
  }

  async function archive() {
    if (!item) return;
    if (!archiveArmed) {
      setArchiveArmed(true);
      setMsg(t.archiveConfirm);
      return;
    }
    setSaving(true);
    const r = await fetch(`/api/admin/content/${item.id}`, { method: 'DELETE' });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) {
      setMsg(j.error || t.archiveFailed);
      return;
    }
    router.replace('/admin/content');
    router.refresh();
  }

  return (
    <div className="adminEditor">
      <section className="editorPanel">
        <div className="adminToolbar">
          <div>
            <span className="kicker">{contentTypeLabels[type][locale]}</span>
            <h2 style={{ margin: 0 }}>{item ? t.editContent : t.newContent}</h2>
          </div>
          <div className="iconRow editorActions">
            <IconButton name="save" label={saving ? t.saving : t.save} onClick={() => save()} disabled={saving} />
            <IconButton name="send" label={t.saveAndPublish} tone="gold" onClick={() => save('published')} disabled={saving} />
            {item && <IconButton name="globe" label={t.translateEn} onClick={translate} disabled={saving} />}
            {item && <IconButton name="trash" label={archiveArmed ? t.confirmArchive : t.archive} tone="danger" onClick={archive} disabled={saving} />}
          </div>
        </div>
        {msg ? <div className="formMessage">{msg}</div> : null}
        <div className="tabRow">
          <button className={`tabButton ${tab === 'ar' ? 'active' : ''}`} onClick={() => setTab('ar')}>العربية</button>
          <button className={`tabButton ${tab === 'en' ? 'active' : ''}`} onClick={() => setTab('en')}>English {manualOverrideEn ? t.manualMark : ''}</button>
        </div>
        <div className="fieldGrid">
          {fields.map((spec) => (
            <div className={`field ${['textarea', 'markdown', 'array'].includes(spec.type) ? 'wide' : ''}`} key={spec.key}>
              <label>{tab === 'ar' ? spec.labelAr : spec.labelEn}{spec.required ? ' *' : ''}</label>
              {spec.type === 'boolean' ? (
                <label className="check">
                  <input type="checkbox" checked={Boolean(data[spec.key])} onChange={(e) => setField(spec, e.target.checked)} />
                  <span>{Boolean(data[spec.key]) ? t.yes : t.no}</span>
                </label>
              ) : spec.type === 'asset' ? (
                <select value={String(data[spec.key] || '')} onChange={(e) => setField(spec, e.target.value)}>
                  <option value="">{t.noFile}</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.original_name} {m.public_safe_review && m.visibility === 'public' ? t.publicReviewed : t.privateUnreviewed}
                    </option>
                  ))}
                </select>
              ) : spec.type === 'textarea' || spec.type === 'markdown' || spec.type === 'array' ? (
                <textarea rows={spec.type === 'markdown' ? 12 : 5} value={String(toInput(data[spec.key], spec.type))} onChange={(e) => setField(spec, e.target.value)} />
              ) : (
                <input type={spec.type === 'number' ? 'number' : spec.type === 'url' ? 'url' : 'text'} value={String(toInput(data[spec.key], spec.type))} onChange={(e) => setField(spec, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </section>
      <aside className="editorPanel">
        <h3>{t.publishing}</h3>
        <div className="field"><label>Slug</label><input dir="ltr" value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
        <div className="field">
          <label>{t.status}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {Object.entries(adminStatus).map(([value, labels]) => <option key={value} value={value}>{labels[locale]}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t.visibility}</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as typeof visibility)}>
            {Object.entries(adminVisibility).map(([value, labels]) => <option key={value} value={value}>{labels[locale]}</option>)}
          </select>
        </div>
        <label className="check">
          <input type="checkbox" checked={showPublishDate} onChange={(e) => setShowPublishDate(e.target.checked)} />
          <span>{t.showRealDate}</span>
        </label>
        {item?.first_published_at ? <p className="muted">{t.firstPublished}: {new Date(item.first_published_at).toLocaleString(dateLocale(locale))} — {t.cannotEditDate}</p> : null}
        <label className="check">
          <input type="checkbox" checked={manualOverrideEn} onChange={(e) => setManualOverrideEn(e.target.checked)} />
          <span>{t.lockEnglish}</span>
        </label>
        <h3>{t.internalFields}</h3>
        <p className="muted">{t.internalHint}</p>
        <textarea className="jsonPrivate" value={privateData} onChange={(e) => setPrivateData(e.target.value)} />
      </aside>
    </div>
  );
}
