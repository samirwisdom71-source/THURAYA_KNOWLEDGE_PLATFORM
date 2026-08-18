'use client';
import { useMemo, useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import type { MediaAsset } from '@/lib/types';
type Settings=Record<string,unknown>;

function pretty(v:unknown){try{return JSON.stringify(v??{},null,2)}catch{return '{}'}}

export function SettingsManager({initial,media}:{initial:Settings;media:MediaAsset[]}){
  const [values,setValues]=useState(initial); const [msg,setMsg]=useState(''); const [saving,setSaving]=useState(false);
  const [brandJson,setBrandJson]=useState(()=>pretty(initial.brand));
  const [featuredJson,setFeaturedJson]=useState(()=>pretty(initial.home_featured));
  const safeMedia=useMemo(()=>media.filter(x=>x.kind==='image'),[media]);
  function set(k:string,v:unknown){setValues(prev=>({...prev,[k]:v}))}
  async function save(){
    setSaving(true);setMsg('');
    let brand:unknown,home_featured:unknown;
    try{brand=JSON.parse(brandJson);home_featured=JSON.parse(featuredJson)}catch{setSaving(false);setMsg('JSON الهوية أو اختيارات الصفحة الرئيسية غير صالح.');return;}
    const payload={...values,brand,home_featured};
    const r=await fetch('/api/admin/settings',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({})); setSaving(false); setMsg(r.ok?'تم حفظ الإعدادات':(j.error||'تعذر الحفظ')); if(r.ok)setValues(payload);
  }
  return <div className="adminEditor">
    <section className="editorPanel">
      <h2>هوية ومحتوى عام</h2>
      <div className="field"><label>اسم الموقع بالعربية</label><input value={String(values.site_name_ar||'')} onChange={e=>set('site_name_ar',e.target.value)}/></div>
      <div className="field"><label>Site name English</label><input dir="ltr" value={String(values.site_name_en||'')} onChange={e=>set('site_name_en',e.target.value)}/></div>
      <div className="field"><label>عنوان Hero — عربي</label><input value={String(values.hero_title_ar||'')} onChange={e=>set('hero_title_ar',e.target.value)}/></div>
      <div className="field"><label>Hero title — English</label><input dir="ltr" value={String(values.hero_title_en||'')} onChange={e=>set('hero_title_en',e.target.value)}/></div>
      <div className="field"><label>سطر Hero — عربي</label><input value={String(values.hero_lead_ar||'')} onChange={e=>set('hero_lead_ar',e.target.value)}/></div>
      <div className="field"><label>Hero lead — English</label><input dir="ltr" value={String(values.hero_lead_en||'')} onChange={e=>set('hero_lead_en',e.target.value)}/></div>
      <div className="field"><label>محتوى صفحة عن ثريا — عربي</label><textarea rows={18} value={String(values.about_page_markdown_ar||'')} onChange={e=>set('about_page_markdown_ar',e.target.value)}/></div>
      <div className="field"><label>About page — English</label><textarea dir="ltr" rows={18} value={String(values.about_page_markdown_en||'')} onChange={e=>set('about_page_markdown_en',e.target.value)}/></div>
      <details className="advancedBox"><summary>إعدادات متقدمة قابلة للتحرير</summary><p className="muted">هذه البيانات محفوظة في قاعدة البيانات. استخدمها لتعديل الهوية واختيارات الصفحة الرئيسية دون تغيير الكود.</p><div className="field"><label>Brand JSON</label><textarea className="jsonPrivate" rows={14} value={brandJson} onChange={e=>setBrandJson(e.target.value)}/></div><div className="field"><label>Home featured JSON</label><textarea className="jsonPrivate" rows={14} value={featuredJson} onChange={e=>setFeaturedJson(e.target.value)}/></div></details>
      <div className="adminStickyBar">
        <span className="muted">احفظي التغييرات قبل المغادرة.</span>
        <IconButton name="save" label={saving?'جارٍ الحفظ':'حفظ الإعدادات'} tone="gold" onClick={save} disabled={saving}/>
      </div>
      {msg&&<div className="formMessage">{msg}</div>}
    </section>
    <aside className="editorPanel"><h3>صور رئيسية</h3>
      <div className="field"><label>Hero</label><select value={String(values.hero_asset_id||'')} onChange={e=>set('hero_asset_id',e.target.value||null)}><option value="">بدون صورة</option>{safeMedia.map(x=><option key={x.id} value={x.id}>{x.original_name} {x.public_safe_review?'✓':'(غير مراجع)'}</option>)}</select></div>
      <div className="field"><label>About image</label><select value={String(values.about_asset_id||'')} onChange={e=>set('about_asset_id',e.target.value||null)}><option value="">بدون صورة</option>{safeMedia.map(x=><option key={x.id} value={x.id}>{x.original_name} {x.public_safe_review?'✓':'(غير مراجع)'}</option>)}</select></div>
      <p className="muted">حتى لو تم اختيار صورة هنا، لن تُعرض للعامة إلا إذا كانت Public ومراجعة الأمان = نعم.</p>
    </aside>
  </div>;
}
