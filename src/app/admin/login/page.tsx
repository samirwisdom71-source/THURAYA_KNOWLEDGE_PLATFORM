import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { getAdminUser } from '@/lib/auth';
import { BRAND_LOGO } from '@/lib/brand';

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
            <img className="brandLogo" src={BRAND_LOGO} alt="ثريا الشامسي" />
          </Link>
          <span className="kicker">دخول خاص</span>
          <h1>تسجيل الدخول</h1>
          <LoginForm />
          <Link className="loginBack" href="/ar">العودة إلى الموقع</Link>
        </section>
      </div>
    </div>
  );
}
