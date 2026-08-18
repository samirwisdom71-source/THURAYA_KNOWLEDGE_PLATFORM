# IMPLEMENTATION SEQUENCE

## المرحلة 0 — حماية المشروع
- إنشاء Git repository.
- Development / Staging / Production.
- حماية Staging من الفهرسة.
- Environment variables منفصلة.
- تفعيل قواعد Cursor الموجودة في الحزمة.

## المرحلة 1 — Design System
- إعادة بناء Design Baseline كمكونات.
- Arabic RTL أولًا.
- Responsive/Mobile First.
- صور كبيرة + Bento + Editorial Layout.
- اختبار Contrast وKeyboard.

## المرحلة 2 — CMS + Database
بناء Content Models كما في الملف المخصص.
لا تدخل المحتوى يدويًا قبل تثبيت Schema.

## المرحلة 3 — Import Master Seed
- Import `master_content_seed_ar.json`.
- فحص Duplicate Slugs/IDs.
- لا يتم استيراد مجلد `07_STAGING_ONLY` إلى Production.

## المرحلة 4 — صفحات المحتوى
بالترتيب:
Home → About → Knowledge → Topics → Challenges → Tools → Library → Newsletter → Ask Thuraya → Stories → Journal → Community → Inspiration.

## المرحلة 5 — Translation
- العربية Source of Truth.
- EN auto translation on Publish.
- Cache.
- Manual Override.
- RTL/LTR كامل.

## المرحلة 6 — الصور
- رفع الصورة الشخصية.
- رفع أغلفة الكتب.
- إدخال صور Visual Journal الحقيقية فقط.
- Remove EXIF/GPS.
- WebP/AVIF.

## المرحلة 7 — Forms & Interaction
- Newsletter.
- Ask Thuraya.
- Challenges.
- Tool interactions.
- Consent + CAPTCHA + Rate Limiting.

## المرحلة 8 — SEO
- Metadata.
- Sitemap.
- hreflang.
- OG images.
- Structured Data المناسب.
- Canonical.

## المرحلة 9 — Analytics
Production actual only.
لا تُظهر عدادات عامة قبل وجود بيانات حقيقية كافية، ويمكن إبقاؤها مخفية حتى ذلك الوقت.

## المرحلة 10 — UAT + Go Live
تشغيل `validate_master_seed.py` و`preproduction_guard.py`.
ثم UAT كامل قبل النشر.
