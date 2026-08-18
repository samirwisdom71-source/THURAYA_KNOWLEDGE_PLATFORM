# Test Report — v1.1

تاريخ التجهيز: 2026-08-17

## اختبارات تم تنفيذها ونجحت

- `python scripts/normalize_seed.py` — PASSED.
- `python scripts/validate_content.py` — PASSED: 288 records, 264 public-safe seed records, 14 sources.
- `python scripts/project_audit.py` — PASSED.
- `python scripts/security_audit.py` — PASSED.
- `node --check` لجميع scripts التنفيذية `.mjs` — PASSED.
- `python -m py_compile scripts/*.py` — PASSED.
- TypeScript syntax/type-shape pass باستخدام stubs محلية للـframework packages — PASSED بعد آخر جولة مراجعة؛ هذا لا يحل محل `next build` الفعلي.

## ملاحظة بيئة الاختبار

لم يمكن تنفيذ `npm install` ثم `next build` داخل بيئة التجهيز لأن الوصول من الحاوية إلى `registry.npmjs.org` فشل بـ `EAI_AGAIN`. لذلك لا يتم الادعاء بأن build dependency-resolved قد تم هنا. أول خطوة بعد فك الحزمة على جهاز/CI متصل بالإنترنت هي:

```bash
npm install
npm run typecheck
npm run build
```

ثم نفذ smoke test مع PostgreSQL حقيقي أو Docker Compose.

## اختبارات release المقترحة بعد توفر الشبكة

1. Build production.
2. تشغيل PostgreSQL وتطبيق migration + seed.
3. تسجيل الدخول وتغيير كلمة المرور ثم restart والتأكد أن bootstrap لا يعيدها.
4. إنشاء draft ثم publish والتأكد من first_published_at.
5. رفع صورة فيها metadata، ومقارنة المشتق WebP، ثم اختبار public-safe gate.
6. محاولة نشر Visual Journal بلا صورة مراجعة — يجب الرفض.
7. محاولة جعل Full Publication Document عامًا بلا review — يجب الرفض.
8. اختبار Turnstile required.
9. اختبار unsubscribe/moderation/rate limits.
10. Backup ثم restore في بيئة منفصلة.
