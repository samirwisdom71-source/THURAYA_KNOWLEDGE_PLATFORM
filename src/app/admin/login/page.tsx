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
      <section className="loginCard loginCardCentered">
        <Link href="/ar" className="loginBrand">
          <img className="brandLogo" src={BRAND_LOGO} alt="ثريا الشامسي" />
        </Link>
        <span className="kicker">دخول خاص</span>
        <h1>تسجيل الدخول</h1>
        <p>هذه الصفحة لإدارة المحتوى والمراجعة فقط. الزوار يسألون ويتصفحون من الموقع العام دون حساب.</p>
        <LoginForm />
        <Link className="loginBack" href="/ar">العودة إلى الموقع</Link>
      </section>
    </div>
  );
}
