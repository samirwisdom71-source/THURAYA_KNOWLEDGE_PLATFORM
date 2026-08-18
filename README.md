# THURAYA Knowledge Platform — Full Implementation v1.1

منصة شخصية ثنائية اللغة (AR/EN) للمعرفة والاستدامة والأثر المجتمعي، مع CMS داخلي متكامل وقاعدة PostgreSQL وإدارة صور وملفات ومراجعة خصوصية ونشر.

## ما تم تنفيذه

- موقع عام: Home, About, Knowledge, Monthly Topics, Challenges, Tools, Library, Newsletter, Ask Thuraya, Impact Stories, Visual Journal, Community, Inspiration, Privacy.
- RTL/LTR حقيقي، تنقل Responsive، Mobile menu، وتبديل لغة يحافظ على نفس المسار.
- CMS داخلي على `/admin` لإدارة جميع أنواع المحتوى الأربعة عشر.
- إنشاء/تعديل/حفظ مسودة/نشر/أرشفة، مع العربية والإنجليزية والحقول الداخلية المنفصلة.
- Media Library للصور وPDF/DOCX/XLSX/TXT/CSV: الأصل Private، والصور العامة يعاد ترميزها WebP دون EXIF/GPS.
- Public-safe review + consent status + visibility قبل عرض الميديا للعامة.
- Visual Journal لا يُنشر قبل صورة حقيقية مراجعة وآمنة.
- الملفات الكاملة للإصدارات Private افتراضيًا، ولا تصبح عامة إلا بعد مراجعة الميديا.
- Newsletter subscribers، Ask Thuraya، Challenge submissions، moderation queue، private notes، CSV export.
- Source Registry قابل للإضافة والتعديل وربط المقالات بالمصادر الرسمية.
- Publication Crosslinks قابلة للتعديل من CMS.
- Site settings وHero وAbout والصور الرئيسية وHome Featured قابلة للتعديل من قاعدة البيانات.
- Admin account قابل لتغيير الاسم والبريد وكلمة المرور.
- Audit Log لكل التغييرات الإدارية المهمة.
- Rate limiting + honeypot + Cloudflare Turnstile runtime configuration.
- Optional OpenAI-based English translation with manual override.
- Sitemap, robots, admin noindex, security headers, CSP، وhealth endpoint.
- Backup/restore scripts لقاعدة البيانات والتخزين.

## معالجة ملاحظات v1.0

- تم توحيد الـSchema للـ288 سجلًا في `content/generated/normalized_content_seed_ar.json`.
- تم استرجاع وربط 14 مصدرًا رسميًا من Package 01.
- تم توليد Public Seed آليًا بدل ملف يدوي مستقل.
- Visual Journal أصبح `awaiting_image` إلى أن توجد صورة فعلية مراجعة.
- `award_alignment_internal`, `is_demo`, `private_data` وغيرها لا تدخل Public Seed/API.
- `one-hour-impact` المتكرر بين نوعين لا يسبب تعارضًا لأن الـgeneric routes تستخدم `/content/<type>/<slug>`.
- تاريخ أول نشر للسجلات الجديدة Server-owned ولا يمكن إدخاله أو backdate من الـCMS.

## البنية

- `src/app` — Next.js App Router pages + API routes.
- `src/components` — Public UI + CMS components.
- `src/lib` — DB, auth, content, media, validation, translation, security helpers.
- `db/migrations` — PostgreSQL schema.
- `scripts` — normalize, validate, security/project audit, migration, seed, admin bootstrap, backup/restore.
- `content/source` — مصادر المحتوى اللازمة للتطبيع.
- `content/generated` — Normalized/Public seeds generated from source.
- `source_package_v1.0` — الحزمة الأصلية للمرجعية فقط؛ مستبعدة من Docker production context.

## أوامر مهمة

```bash
npm run content:normalize
npm run content:validate
npm run security:audit
npm run project:audit
npm run db:migrate
npm run db:seed
npm run db:admin
npm run dev
npm run build
npm run backup
```

راجع `START_HERE.md` و`docs/ADMIN_GUIDE_AR.md` و`docs/DEPLOYMENT.md`.
