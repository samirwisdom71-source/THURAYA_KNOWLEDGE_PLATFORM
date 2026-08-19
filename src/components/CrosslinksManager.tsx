'use client';

import { useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import { useAdminLocale } from '@/components/AdminShell';
import { adminCopy } from '@/lib/admin-i18n';

type Crosslink = { publication_legacy_id: string; value_json: { related_articles?: string[]; related_tools?: string[] } };
const lines = (value?: string[]) => (value || []).join('\n');
const split = (value: string) => value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);

export function CrosslinksManager({ initial }: { initial: Crosslink[] }) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState('');
  const [newKey, setNewKey] = useState('');

  function edit(index: number, key: 'related_articles' | 'related_tools', value: string) {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, value_json: { ...item.value_json, [key]: split(value) } } : item)));
  }

  async function save(item: Crosslink) {
    setMsg('');
    const response = await fetch('/api/admin/crosslinks', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(item),
    });
    const payload = await response.json().catch(() => ({}));
    setMsg(response.ok ? t.linksSaved : (payload.error || t.saveFailed));
  }

  function add() {
    const key = newKey.trim();
    if (!/^(?:\d+|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(key)) {
      setMsg(t.invalidPublicationId);
      return;
    }
    if (items.some((item) => item.publication_legacy_id === key)) {
      setMsg(t.publicationExists);
      return;
    }
    setItems((prev) => [...prev, { publication_legacy_id: key, value_json: { related_articles: [], related_tools: [] } }]);
    setNewKey('');
  }

  return (
    <>
      <div className="adminCard adminComposer">
        <h2>{t.linkPublication}</h2>
        <div className="adminFilter">
          <input dir="ltr" value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="Publication ID or slug" />
          <IconButton name="plus" label={t.add} tone="gold" onClick={add} />
        </div>
      </div>
      {msg ? <div className="formMessage">{msg}</div> : null}
      <div className="crosslinkGrid">
        {items.map((item, index) => (
          <section className="adminCard" key={item.publication_legacy_id}>
            <h2>{t.publication(item.publication_legacy_id)}</h2>
            <label>{t.relatedArticleSlugs}<textarea rows={5} dir="ltr" value={lines(item.value_json.related_articles)} onChange={(event) => edit(index, 'related_articles', event.target.value)} /></label>
            <label>{t.relatedToolIds}<textarea rows={5} dir="ltr" value={lines(item.value_json.related_tools)} onChange={(event) => edit(index, 'related_tools', event.target.value)} /></label>
            <IconButton name="save" label={t.saveLinks} tone="success" onClick={() => save(items[index])} />
          </section>
        ))}
      </div>
    </>
  );
}
