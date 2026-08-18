import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { getAdminUser } from '@/lib/auth';

export const metadata = {
  robots: { index: false, follow: false },
  title: 'تسجيل الدخول | ثريا',
};

export default async function Page() {
  if (await getAdminUser()) redirect('/admin');

  return (
    <div className="loginPage" dir="rtl" lang="ar">
      <div className="loginShell">
        <aside className="loginVisual" aria-hidden="true">
          <img src="/login/study.jpg" alt="" />
          <div className="loginVisualShade" />
          <div className="loginVisualCopy">
            <span>منصة ثريا المعرفية</span>
            <p>مساحة هادئة لإدارة المعرفة قبل أن تصل إلى العامة.</p>
          </div>
        </aside>
        <section className="loginCard">
          <Link href="/ar" className="loginBrand">
            <img src="/brand/thuraya-mark.svg" alt="" />
            <span>ثريا الشامسي</span>
          </Link>
          <span className="kicker">دخول خاص</span>
          <h1>تسجيل الدخول</h1>
          <p>هذه الصفحة لإدارة المحتوى والمراجعة فقط. الزوار يسألون ويتصفحون من الموقع العام دون حساب.</p>
          <LoginForm />
          <Link className="loginBack" href="/ar">العودة إلى الموقع</Link>
        </section>
      </div>
    </div>
  );
}
