'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconButton } from '@/components/AdminIcon';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(payload.error || 'تعذر تسجيل الدخول. تحققي من البريد وكلمة المرور.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form className="formCard loginForm" onSubmit={submit}>
      <label>
        البريد الإلكتروني
        <input type="email" name="email" required autoComplete="username" placeholder="name@example.com" dir="ltr" />
      </label>
      <label>
        كلمة المرور
        <span className="loginPassword">
          <input type={showPassword ? 'text' : 'password'} name="password" required autoComplete="current-password" placeholder="••••••••••••" dir="ltr" />
          <IconButton
            name={showPassword ? 'eyeOff' : 'eye'}
            label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            onClick={() => setShowPassword((prev) => !prev)}
          />
        </span>
      </label>
      <button className="btn primary loginSubmit" disabled={loading}>
        {loading ? 'جارٍ التحقق...' : 'دخولي إلى لوحة الإدارة'}
      </button>
      {error ? <div className="formMessage error">{error}</div> : null}
    </form>
  );
}
