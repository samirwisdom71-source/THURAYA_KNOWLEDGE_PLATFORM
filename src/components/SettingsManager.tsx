'use client';
import { useMemo, useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import { useAdminLocale } from '@/components/AdminShell';
import { adminCopy } from '@/lib/admin-i18n';
import type { MediaAsset } from '@/lib/types';
type Settings = Record<string, unknown>;

function pretty(v: unknown) {
  try { return JSON.stringify(v ?? {}, null, 2); } catch { return '{}'; }
}

export function SettingsManager({ initial, media }: { initial: Settings; media: MediaAsset[] }) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  const [values, setValues] = useState(initial);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [brandJson, setBrandJson] = useState(() => pretty(initial.brand));
  const [featuredJson, setFeaturedJson] = useState(() => pretty(initial.home_featured));
  const safeMedia = useMemo(() => media.filter((x) => x.kind === 'image'), [media]);
  function set(k: string, v: unknown) { setValues((prev) => ({ ...prev, [k]: v })); }
  async function save() {
    setSaving(true);
    setMsg('');
    let brand: unknown, home_featured: unknown;
    try {
      brand = JSON.parse(brandJson);
      home_featured = JSON.parse(featuredJson);
    } catch {
      setSaving(false);
      setMsg(t.invalidJson);
      return;
    }
    const payload = { ...values, brand, home_featured };
    const r = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    setSaving(false);
    setMsg(r.ok ? t.settingsSaved : (j.error || t.saveFailed));
    if (r.ok) setValues(payload);
  }
  return (
    <div className="adminEditor">
      <section className="editorPanel">
        <h2>{t.identityPublic}</h2>
        <div className="field"><label>{t.siteNameAr}</label><input value={String(values.site_name_ar || '')} onChange={(e) => set('site_name_ar', e.target.value)} /></div>
        <div className="field"><label>{t.siteNameEn}</label><input dir="ltr" value={String(values.site_name_en || '')} onChange={(e) => set('site_name_en', e.target.value)} /></div>
        <div className="field"><label>{t.heroTitleAr}</label><input value={String(values.hero_title_ar || '')} onChange={(e) => set('hero_title_ar', e.target.value)} /></div>
        <div className="field"><label>{t.heroTitleEn}</label><input dir="ltr" value={String(values.hero_title_en || '')} onChange={(e) => set('hero_title_en', e.target.value)} /></div>
        <div className="field"><label>{t.heroLeadAr}</label><input value={String(values.hero_lead_ar || '')} onChange={(e) => set('hero_lead_ar', e.target.value)} /></div>
        <div className="field"><label>{t.heroLeadEn}</label><input dir="ltr" value={String(values.hero_lead_en || '')} onChange={(e) => set('hero_lead_en', e.target.value)} /></div>
        <div className="field"><label>{t.aboutAr}</label><textarea rows={18} value={String(values.about_page_markdown_ar || '')} onChange={(e) => set('about_page_markdown_ar', e.target.value)} /></div>
        <div className="field"><label>{t.aboutEn}</label><textarea dir="ltr" rows={18} value={String(values.about_page_markdown_en || '')} onChange={(e) => set('about_page_markdown_en', e.target.value)} /></div>
        <details className="advancedBox">
          <summary>{t.advancedSettings}</summary>
          <p className="muted">{t.advancedHint}</p>
          <div className="field"><label>Brand JSON</label><textarea className="jsonPrivate" rows={14} value={brandJson} onChange={(e) => setBrandJson(e.target.value)} /></div>
          <div className="field"><label>Home featured JSON</label><textarea className="jsonPrivate" rows={14} value={featuredJson} onChange={(e) => setFeaturedJson(e.target.value)} /></div>
        </details>
        <div className="adminStickyBar">
          <span className="muted">{t.saveBeforeLeave}</span>
          <IconButton name="save" label={saving ? t.saving : t.saveSettings} tone="gold" onClick={save} disabled={saving} />
        </div>
        {msg ? <div className="formMessage">{msg}</div> : null}
      </section>
      <aside className="editorPanel">
        <h3>{t.heroImages}</h3>
        <div className="field">
          <label>Hero</label>
          <select value={String(values.hero_asset_id || '')} onChange={(e) => set('hero_asset_id', e.target.value || null)}>
            <option value="">{t.noImage}</option>
            {safeMedia.map((x) => <option key={x.id} value={x.id}>{x.original_name} {x.public_safe_review ? '✓' : t.unreviewed}</option>)}
          </select>
        </div>
        <div className="field">
          <label>About image</label>
          <select value={String(values.about_asset_id || '')} onChange={(e) => set('about_asset_id', e.target.value || null)}>
            <option value="">{t.noImage}</option>
            {safeMedia.map((x) => <option key={x.id} value={x.id}>{x.original_name} {x.public_safe_review ? '✓' : t.unreviewed}</option>)}
          </select>
        </div>
        <p className="muted">{t.settingsMediaHint}</p>
      </aside>
    </div>
  );
}
