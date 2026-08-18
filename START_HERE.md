# ابدأ من هنا — منصة ثريا للمعرفة v1.1

هذه نسخة تنفيذ كاملة مبنية من حزمة المحتوى الأصلية بعد تطبيع الـSchema وإغلاق مشاكل الخصوصية والنشر والميديا والمراجع.

## تشغيل سريع محليًا بـ Docker

1. انسخ `.env.example` إلى `.env`.
2. غيّر فورًا `ADMIN_EMAIL` و`ADMIN_PASSWORD` و`POSTGRES_PASSWORD`.
3. اترك `APP_ENV=development` و`CAPTCHA_MODE=optional` للتجربة المحلية.
4. شغّل:
   ```bash
   docker compose up --build
   ```
5. افتح الموقع: `http://localhost:3000/ar`
6. لوحة الإدارة: `http://localhost:3000/admin`
7. فحص الصحة: `http://localhost:3000/api/health`

> أول تشغيل فقط ينشئ حساب المدير من متغيرات البيئة. بعد وجود مدير نشط، إعادة تشغيل الحاوية لا تعيد كلمة المرور ولا تنشئ مديرًا جديدًا.

## قبل الإنتاج

راجع `docs/DEPLOYMENT.md` و`docs/TEST_REPORT.md`. الإنتاج يتطلب HTTPS وTurnstile في وضع `required`، وقاعدة بيانات ونسخ احتياطي دائمين.
