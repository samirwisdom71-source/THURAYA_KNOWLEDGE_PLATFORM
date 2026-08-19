'use client';

import { Fragment, useMemo, useState } from 'react';
import { IconButton } from '@/components/AdminIcon';
import { useAdminLocale } from '@/components/AdminShell';
import { adminCopy, dateLocale } from '@/lib/admin-i18n';

type Sub = {
  id: string;
  submission_type: string;
  locale: string;
  name: string | null;
  email: string | null;
  content_slug: string | null;
  payload: Record<string, unknown>;
  consent: boolean;
  moderation_status: string;
  moderation_private_notes?: string | null;
  created_at: string;
};

function bodyText(item: Sub) {
  const question = item.payload.question;
  const reflection = item.payload.reflection;
  if (typeof question === 'string' && question.trim()) return question.trim();
  if (typeof reflection === 'string' && reflection.trim()) return reflection.trim();
  const extra = Object.entries(item.payload)
    .filter(([key, value]) => !['question', 'reflection', 'name', 'email', 'website'].includes(key) && value != null && String(value).trim())
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`);
  return extra.join('\n') || '—';
}

function excerpt(text: string, limit = 140) {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length > limit ? `${compact.slice(0, limit).trim()}…` : compact;
}

export function SubmissionsManager({ initial }: { initial: Sub[] }) {
  const locale = useAdminLocale();
  const t = adminCopy[locale];
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const typeLabels: Record<string, string> = { ask_thuraya: t.askThuraya, challenge: t.challenge };
  const statusLabels: Record<string, string> = { pending: t.pending, approved: t.approved, rejected: t.rejected, spam: t.spam };

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.moderation_status === filter)),
    [filter, items],
  );

  async function save(id: string, status: string, notes?: string) {
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, moderation_status: status, moderation_private_notes: notes ?? item.moderation_private_notes } : item)));
      setMsg(t.savedReview);
    } else setMsg(payload.error || t.saveFailed);
  }

  function setNotes(id: string, notes: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, moderation_private_notes: notes } : item)));
  }

  return (
    <>
      <div className="adminFilter">
        <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label={t.filterStatus}>
          <option value="all">{t.all}</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <span className="muted">{t.submissionsCount(visible.length)}</span>
      </div>
      {msg ? <div className="formMessage">{msg}</div> : null}
      <div className="tableWrap adminTableCard">
        <table className="adminTable subTable">
          <thead>
            <tr>
              <th>{t.type}</th>
              <th className="subColBody">{t.body}</th>
              <th>{t.sender}</th>
              <th>{t.status}</th>
              <th>{t.date}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => {
              const text = bodyText(item);
              const open = openId === item.id;
              return (
                <Fragment key={item.id}>
                  <tr className={open ? 'is-open' : undefined}>
                    <td>
                      <b>{typeLabels[item.submission_type] || item.submission_type}</b>
                      <small className="muted">{item.locale.toUpperCase()}</small>
                    </td>
                    <td className="subColBody">
                      <button type="button" className="subExcerpt" onClick={() => setOpenId(open ? null : item.id)}>
                        <span>{excerpt(text)}</span>
                        {item.content_slug ? <small>{item.content_slug}</small> : null}
                      </button>
                    </td>
                    <td>
                      <b>{item.name || t.unnamed}</b>
                      {item.email ? <small dir="ltr">{item.email}</small> : null}
                      <small className="muted">{item.consent ? t.consentSaved : t.noConsent}</small>
                    </td>
                    <td><span className={`status ${item.moderation_status}`}>{statusLabels[item.moderation_status] || item.moderation_status}</span></td>
                    <td>
                      <b>{new Date(item.created_at).toLocaleDateString(dateLocale(locale))}</b>
                      <small className="muted">{new Date(item.created_at).toLocaleTimeString(dateLocale(locale), { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                    <td>
                      <div className="iconRow">
                        <IconButton
                          name="chevron"
                          label={open ? t.hideDetails : t.showContent}
                          className={open ? 'is-rotated' : undefined}
                          onClick={() => setOpenId(open ? null : item.id)}
                        />
                        <IconButton name="check" label={t.approve} tone="success" onClick={() => save(item.id, 'approved', item.moderation_private_notes || '')} />
                        <IconButton name="x" label={t.reject} tone="danger" onClick={() => save(item.id, 'rejected', item.moderation_private_notes || '')} />
                        <IconButton name="ban" label={t.markSpam} onClick={() => save(item.id, 'spam', item.moderation_private_notes || '')} />
                        <IconButton name="undo" label={t.returnReview} onClick={() => save(item.id, 'pending', item.moderation_private_notes || '')} />
                      </div>
                    </td>
                  </tr>
                  {open ? (
                    <tr className="subDetailRow">
                      <td colSpan={6}>
                        <div className="subDetail">
                          <div>
                            <span className="kicker">{item.submission_type === 'challenge' ? t.submissionText : t.questionText}</span>
                            <p>{text}</p>
                          </div>
                          <div>
                            <span className="kicker">{t.privateNotes}</span>
                            <textarea
                              value={item.moderation_private_notes || ''}
                              onChange={(event) => setNotes(item.id, event.target.value)}
                              placeholder={t.privateNotesPh}
                              rows={4}
                            />
                            <IconButton name="save" label={t.saveNote} tone="gold" onClick={() => save(item.id, item.moderation_status, item.moderation_private_notes || '')} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {!visible.length && <div className="emptyState">{t.noSubmissions}</div>}
    </>
  );
}
