# Deployment & Operations

## متطلبات التشغيل

- Node.js 20.9+.
- PostgreSQL.
- تخزين دائم للمجلد المحدد في `STORAGE_DIR`.
- HTTPS في production.
- Cloudflare Turnstile في production للنماذج العامة.

## تشغيل Docker

```bash
cp .env.example .env
# عدل القيم الحساسة

docker compose up --build -d
```

### Production environment

اضبط على الأقل:

```env
APP_ENV=production
SITE_URL=https://thuraya-alshamsi.gate-digital.com
CAPTCHA_MODE=required
TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
POSTGRES_PASSWORD=...
```

`preflight.mjs` يمنع بدء production إذا كان SITE_URL غير HTTPS أو Turnstile غير مكتمل.

## قاعدة البيانات

عند بدء التطبيق:
1. `db-migrate.mjs` يطبق migrations غير المطبقة فقط.
2. `db-seed.mjs` يضيف الـ288 سجلًا normalized، ويحترم أي محتوى سبق تحريره في CMS.
3. `create-admin.mjs` ينشئ مديرًا فقط إذا لم يوجد مدير نشط أصلًا.

## التخزين

- `storage/private`: الأصول الأصلية ولا يجب تقديمه كstatic directory.
- `storage/public`: مشتقات الصور المعاد ترميزها؛ حتى هذه لا تُخدم مباشرة، بل عبر `/api/media/:id` مع فحص DB.

في الإنتاج استخدم volume دائم أو تخزينًا شبكيًا موثوقًا. لا تستخدم ephemeral filesystem إذا كانت الملفات مهمة.

## النسخ الاحتياطي

يتطلب `pg_dump`:

```bash
DATABASE_URL='...' STORAGE_DIR='/path/storage' npm run backup
```

ينتج مجلدًا يحوي `database.dump`, `storage.tar.gz`, و`SHA256SUMS`.

الاستعادة عملية تدميرية ومحمية بتأكيد صريح:

```bash
RESTORE_FROM=/path/backup \
CONFIRM_RESTORE=YES \
DATABASE_URL='...' \
STORAGE_DIR='/path/storage' \
sh scripts/restore.sh
```

اختبر الاستعادة دوريًا على بيئة منفصلة.

## المراقبة

- Health: `/api/health`.
- Audit: `/admin/audit`.
- يجب مراقبة PostgreSQL، مساحة التخزين، أخطاء 5xx، ونسخ backup.

## Staging

اضبط `APP_ENV=staging`. `robots.ts` يمنع الفهرسة بالكامل، وAdmin دائمًا noindex.

## ملاحظة أمنية

`source_package_v1.0` موجود في ZIP للمرجعية فقط ويحتوي مواد لا يجب شحنها ضمن runtime. `.dockerignore` يستبعده بالكامل من صورة Docker.
