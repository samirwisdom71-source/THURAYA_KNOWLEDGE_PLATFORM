'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHead, IconButton } from '@/components/AdminIcon';
import { useAdminLocale } from '@/components/AdminShell';

type AccountUser = { name: string; email: string; role: 'admin' | 'editor'; avatarUrl: string | null };

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  revealLabel,
  hideLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  revealLabel: string;
  hideLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <label className="accountField">
      <span>{label}</span>
      <span className="accountInput">
        <input
          type={open ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
        />
        <IconButton
          name={open ? 'eyeOff' : 'eye'}
          label={open ? hideLabel : revealLabel}
          onClick={() => setOpen((prev) => !prev)}
        />
      </span>
    </label>
  );
}

export function AccountManager({ initial }: { initial: AccountUser }) {
  const locale = useAdminLocale();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const ar = locale === 'ar';
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  const initialMark = (name || email || 'T').trim().charAt(0).toUpperCase();
  const roleLabel = initial.role === 'admin' ? (ar ? 'مديرة المحتوى' : 'Admin') : (ar ? 'محررة' : 'Editor');
  const mismatch = Boolean(newPassword || confirm) && newPassword !== confirm;
  const short = Boolean(newPassword) && newPassword.length < 12;
  const canSave = name.trim().length >= 2 && Boolean(currentPassword) && !mismatch && !short && !saving;

  async function uploadPhoto(file: File) {
    setPhotoBusy(true);
    setMsg('');
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/admin/account/avatar', { method: 'POST', body });
    const payload = await response.json().catch(() => ({}));
    setPhotoBusy(false);
    if (response.ok) {
      setAvatarUrl(payload.avatarUrl || '/api/admin/account/avatar');
      setOk(true);
      setMsg(ar ? 'تم تحديث صورة الحساب.' : 'Profile photo updated.');
      router.refresh();
    } else {
      setOk(false);
      setMsg(payload.error || (ar ? 'تعذر رفع الصورة' : 'Photo upload failed'));
    }
  }

  async function removePhoto() {
    setPhotoBusy(true);
    setMsg('');
    const response = await fetch('/api/admin/account/avatar', { method: 'DELETE' });
    const payload = await response.json().catch(() => ({}));
    setPhotoBusy(false);
    if (response.ok) {
      setAvatarUrl(null);
      setOk(true);
      setMsg(ar ? 'تم حذف صورة الحساب.' : 'Profile photo removed.');
      router.refresh();
    } else {
      setOk(false);
      setMsg(payload.error || (ar ? 'تعذر حذف الصورة' : 'Could not remove photo'));
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (mismatch) {
      setOk(false);
      setMsg(ar ? 'كلمتا المرور الجديدتان غير متطابقتين.' : 'The new passwords do not match.');
      return;
    }
    if (short) {
      setOk(false);
      setMsg(ar ? 'كلمة المرور الجديدة يجب أن تكون 12 حرفًا على الأقل.' : 'New password must be at least 12 characters.');
      return;
    }
    setSaving(true);
    setMsg('');
    const response = await fetch('/api/admin/account', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, email, currentPassword, newPassword }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    if (response.ok) {
      setOk(true);
      setMsg(ar ? 'تم تحديث الحساب.' : 'Account updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } else {
      setOk(false);
      setMsg(payload.error || (ar ? 'تعذر التحديث' : 'Update failed'));
    }
  }

  return (
    <>
      <AdminPageHead
        title={ar ? 'حسابي' : 'My account'}
        subtitle={ar ? 'حدّثي الاسم أو البريد أو كلمة المرور من مكان واحد.' : 'Update your name, email, or password in one place.'}
      />
      <form className="accountLayout" onSubmit={save}>
        <aside className="adminCard accountHero">
          <div className="accountHeroWho">
            <div className="accountPhoto">
              <button type="button" className="accountAvatar" onClick={() => fileRef.current?.click()} disabled={photoBusy} aria-label={ar ? 'رفع صورة الحساب' : 'Upload profile photo'}>
                {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initialMark}</span>}
              </button>
              <div className="iconRow">
                <IconButton name="upload" label={photoBusy ? (ar ? 'جارٍ الرفع' : 'Uploading') : (ar ? 'رفع صورة' : 'Upload photo')} tone="gold" onClick={() => fileRef.current?.click()} disabled={photoBusy} />
                {avatarUrl ? <IconButton name="trash" label={ar ? 'حذف الصورة' : 'Remove photo'} tone="danger" onClick={removePhoto} disabled={photoBusy} /> : null}
              </div>
              <input ref={fileRef} className="visuallyHidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(file); event.target.value = ''; }} />
            </div>
            <div>
              <span className="kicker">THURAYA CMS</span>
              <h2>{name || initial.name}</h2>
              <span className={`status ${initial.role === 'admin' ? 'approved' : 'ready'}`}>{roleLabel}</span>
              <p dir="ltr">{email || initial.email}</p>
            </div>
          </div>
        </aside>
        <div className="accountStack">
          <section className="adminCard accountPanel">
            <header>
              <span className="kicker">{ar ? 'الهوية' : 'Profile'}</span>
              <h3>{ar ? 'بيانات الحساب' : 'Account details'}</h3>
            </header>
            <div className="formGrid">
              <label className="accountField">
                <span>{ar ? 'الاسم' : 'Name'}</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} autoComplete="name" />
              </label>
              <label className="accountField">
                <span>{ar ? 'البريد' : 'Email'}</span>
                <input dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
              </label>
            </div>
          </section>
          <section className="adminCard accountPanel">
            <header>
              <span className="kicker">{ar ? 'الأمان' : 'Security'}</span>
              <h3>{ar ? 'كلمة المرور' : 'Password'}</h3>
            </header>
            <PasswordField
              label={ar ? 'كلمة المرور الحالية' : 'Current password'}
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
              revealLabel={ar ? 'إظهار كلمة المرور' : 'Show password'}
              hideLabel={ar ? 'إخفاء كلمة المرور' : 'Hide password'}
            />
            <div className="formGrid">
              <div>
                <PasswordField
                  label={ar ? 'كلمة المرور الجديدة' : 'New password'}
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                  revealLabel={ar ? 'إظهار كلمة المرور' : 'Show password'}
                  hideLabel={ar ? 'إخفاء كلمة المرور' : 'Hide password'}
                />
                {newPassword ? <small className={short ? 'accountHint is-warn' : 'accountHint is-ok'}>{newPassword.length}/12</small> : null}
              </div>
              <div>
                <PasswordField
                  label={ar ? 'تأكيد الجديدة' : 'Confirm new password'}
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  revealLabel={ar ? 'إظهار كلمة المرور' : 'Show password'}
                  hideLabel={ar ? 'إخفاء كلمة المرور' : 'Hide password'}
                />
                {confirm ? <small className={mismatch ? 'accountHint is-warn' : 'accountHint is-ok'}>{mismatch ? (ar ? 'غير متطابقتين' : 'Do not match') : (ar ? 'متطابقتان' : 'Match')}</small> : null}
              </div>
            </div>
          </section>
        </div>
        <div className="adminStickyBar">
          <span className="muted">{ar ? 'الحفظ يحدّث الحساب بعد التحقق من كلمة المرور الحالية.' : 'Saving updates the account after verifying the current password.'}</span>
          <IconButton name="save" label={saving ? (ar ? 'جارٍ الحفظ' : 'Saving') : (ar ? 'حفظ الحساب' : 'Save account')} tone="gold" type="submit" disabled={!canSave} />
        </div>
        {msg ? <div className={`formMessage ${ok ? 'done' : 'error'}`}>{msg}</div> : null}
      </form>
    </>
  );
}
