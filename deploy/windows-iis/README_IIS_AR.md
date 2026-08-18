# نشر منصة ثريا على Windows Server + IIS

هذه الحزمة تجهّز Production بدون Docker وبدون iisnode وبدون static export.
IIS يعمل Reverse Proxy فقط. Next.js يعمل كعملية Node.js مستقلة على `127.0.0.1:3000`.

لا تنشر إلى الإنترنت قبل:

1. ملء `D:\Thuraya\.env` من `.env.production.example`
2. إنشاء قاعدة بيانات Production بمستخدم تطبيق غير `postgres`
3. تثبيت شهادة HTTPS
4. إغلاق المنفذ 3000 على الجدار الناري

## هيكل المجلدات

```
D:\Thuraya\
  app\                 أدوات الخدمة وweb.config الخاص بـ IIS
    iis\web.config
    winsw\
  releases\            كل إصدار مبني بشكل مستقل
  current\             Junction إلى الإصدار النشط (releases\<id>\run)
  storage\             دائم: الصور والملفات. لا يُحذف عند التحديث
    private\
    public\
  backups\
  logs\
  .env                 أسرار Production. خارج كل Release
```

`STORAGE_DIR=D:\Thuraya\storage` يجب أن يبقى خارج `releases\` و`current\`.

## متطلبات السيرفر

- Windows Server مع IIS
- Node.js 20.9 أو أحدث في PATH
- Python 3 في PATH (مطلوب لـ `content:validate` أثناء البناء)
- PostgreSQL 16/17 مع `pg_dump` و`pg_restore`
- وحدات IIS:
  - URL Rewrite
  - Application Request Routing (ARR)
- موقع IIS يشير إلى `D:\Thuraya\app\iis` فقط، وليس إلى سورس Next.js

## PostgreSQL Production

لا تستخدم عنقود التطوير على المنفذ 5433 كما هو.

على السيرفر، من `psql` بحساب إداري (مرة واحدة):

```sql
CREATE ROLE thuraya_app LOGIN PASSWORD 'ضع_كلمة_مرور_قوية_هنا';
CREATE DATABASE thuraya OWNER thuraya_app;
REVOKE ALL ON DATABASE thuraya FROM PUBLIC;
GRANT CONNECT ON DATABASE thuraya TO thuraya_app;
```

ثم الاتصال بقاعدة `thuraya`:

```sql
GRANT ALL ON SCHEMA public TO thuraya_app;
ALTER SCHEMA public OWNER TO thuraya_app;
```

المستخدم `thuraya_app` يملك القاعدة لتشغيل migrations عند كل تحديث.
لا تستخدم حساب `postgres` superuser في `DATABASE_URL`.

`DATABASE_URL` يبقى فقط داخل `D:\Thuraya\.env`.

بعد أول نشر:

```powershell
cd D:\Thuraya\current
# أو من مجلد المصدر قبل التبديل
$env:Path = "C:\Program Files\PostgreSQL\17\bin;" + $env:Path
# حمّل المتغيرات من D:\Thuraya\.env ثم:
node scripts\db-migrate.mjs
node scripts\db-seed.mjs
node scripts\create-admin.mjs
```

`create-admin.mjs` ينشئ مديرًا فقط إذا لم يوجد مدير نشط.

## متغيرات البيئة المطلوبة

انسخ `.env.production.example` إلى `D:\Thuraya\.env` وعبّئ القيم الحقيقية هناك.

الأساسي:

- `APP_ENV=production`
- `SITE_URL=https://DOMAIN`
- `DATABASE_URL=...`
- `STORAGE_DIR=D:\Thuraya\storage`
- `CAPTCHA_MODE=required`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `LISTEN_HOST=127.0.0.1`
- `PORT=3000`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` لأول تشغيل فقط

لا تضبط `NODE_ENV` في `.env`. `next start` وstandalone يضبطانه `production`.

`SITE_URL` يجب أن يبدأ بـ `https://`. كوكي الجلسة يصبح:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` عندما يكون `SITE_URL` على HTTPS

التطبيق يعتمد على `SITE_URL` و`X-Forwarded-Proto` من IIS حتى يفهم أن الزائر على HTTPS رغم أن Node يستمع HTTP محليًا.

## إعداد IIS

1. ثبّت URL Rewrite و ARR.
2. من ARR فعّل Proxy:

```powershell
& "$env:windir\system32\inetsrv\appcmd.exe" set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"True" /commit:apphost
```

3. اسمح بـ server variables في IIS على مستوى الموقع أو الخادم:

- `HTTP_X_FORWARDED_PROTO`
- `HTTP_X_FORWARDED_HOST`
- `HTTP_X_FORWARDED_FOR`
- `HTTP_X_FORWARDED_PORT`

4. أنشئ موقعًا في IIS:

- Physical path: `D:\Thuraya\app\iis`
- Binding: `https://thuraya-alshamsi.gate-digital.com` بالشهادة
- Binding اختياري لـ HTTP على المنفذ 80 لتحويله إلى HTTPS

5. انسخ `web.config` إلى `D:\Thuraya\app\iis\web.config` (`deploy-update.ps1` يفعل ذلك).

6. حجم الرفع مضبوط على 30 MB في `web.config` (`maxAllowedContentLength=31457280`) لأن التطبيق يرفض ما فوق 25 MB. يمكن تغيير الرقم دون تعديل كود الموقع.

7. لا تفتح المنفذ 3000 على الجدار الناري. لا تربط IIS مباشرة على 3000.

8. WebSocket معطّل في `web.config` لأن المشروع لا يحتاجه.

9. سجّل IIS و`D:\Thuraya\logs` لمراقبة 5xx.

### HTTPS checklist

- Domain binding على 443
- شهادة SSL صالحة
- HTTP → HTTPS في `web.config`
- ARR Proxy enabled
- URL Rewrite installed
- `preserveHostHeader=True` حتى تبقى Host هي الدومين (مهم للكوكي وSame-Origin)
- Request size 30 MB
- Logging مفعّل
- Security headers في IIS + headers التطبيق
- WebSocket يبقى مغلقًا

## تثبيت الخدمة

من PowerShell كمسؤول:

```powershell
cd <repo>\deploy\windows-iis
.\install-service.ps1
```

هذا يحمّل WinSW، ينشئ خدمة `ThurayaKnowledge`، يبدأها تلقائيًا بعد Restart، ويعيد تشغيلها إذا انهارت.
الحساب الافتراضي: `NT AUTHORITY\Local Service` بصلاحيات محدودة على `storage` و`logs` وملف `.env`.

تشغيل/إيقاف:

```powershell
.\start-production.ps1
.\stop-production.ps1
.\restart-production.ps1
.\health-check.ps1
.\uninstall-service.ps1
```

للاختبار المحلي بدون الخدمة:

```powershell
.\start-production.ps1 -LocalProject
.\health-check.ps1
.\stop-production.ps1
```

## Backup

```powershell
.\backup.ps1
```

ينتج مجلدًا في `D:\Thuraya\backups\thuraya-<timestamp>` يحتوي:

- `database.dump`
- `storage.zip`
- `env.runtime` (حسّاس)
- `env.schema.example`
- `config.metadata.json` (أسماء المتغيرات فقط وليست قيمها في الـJSON)
- `SHA256SUMS`

السكربت لا يحتوي كلمات مرور.

## Restore

عملية حساسة ولا تعمل بصمت:

```powershell
.\restore.ps1 -RestoreFrom D:\Thuraya\backups\thuraya-YYYYMMDDTHHMMSSZ -ConfirmRestore
```

ثم اكتب `YES`. بعدها أعد تشغيل الخدمة وافحص `/api/health`.

## النشر من GitHub

لا تنسخ المشروع يدويًا إلى السيرفر. ارفع الكود إلى مستودع GitHub ثم اسحبه على السيرفر.

من جهاز التطوير مرة واحدة:

```powershell
git init
git add .
git commit -m "Initial Thuraya production source"
git branch -M main
git remote add origin https://github.com/ORG/thuraya-knowledge-platform.git
git push -u origin main
```

لا ترفع `.env` ولا `storage` ولا `07_STAGING_ONLY`. أسرار الإنتاج تبقى في `D:\Thuraya\.env` على السيرفر فقط.

على السيرفر ثبّت Git، ثم من PowerShell كمسؤول:

```powershell
cd D:\src\thuraya\deploy\windows-iis
# أول مرة بعد clone، أو من أي نسخة موجودة:
.\deploy-from-github.ps1 -RepoUrl https://github.com/ORG/thuraya-knowledge-platform.git -Branch main -RepoDir D:\src\thuraya
```

السكربت يعمل `git clone` أو `git pull` ثم `deploy-update.ps1`. الهجرة لا تعيد إنشاء قاعدة موجودة ولا تعيد تطبيق هجرة مطبّقة.

للتحديثات التالية بعد أي `git push`:

```powershell
.\deploy-from-github.ps1 -RepoUrl https://github.com/ORG/thuraya-knowledge-platform.git
```

المستودع الخاص يحتاج Deploy Key أو Personal Access Token على السيرفر. لا تحفظ التوكن داخل المشروع.

## تحديث إصدار من مجلد محلي

```powershell
.\deploy-update.ps1 -Source C:\path\to\new\source
```

الترتيب:

1. Backup
2. نسخ المصدر إلى `releases\<id>`
3. `npm install`
4. preflight + migration
5. `npm run build`
6. إيقاف الخدمة
7. تبديل `current` إلى `releases\<id>\run`
8. تشغيل + health check

إذا فشل Health Check لا تُحذف النسخة القديمة. السكربت يطبع أوامر Rollback.

## Rollback

```powershell
.\stop-production.ps1
Remove-Item D:\Thuraya\current -Force
New-Item -ItemType Junction -Path D:\Thuraya\current -Target 'D:\Thuraya\releases\<previous>\run'
.\start-production.ps1
.\health-check.ps1
```

البيانات و`storage` و`.env` لا تُمس أثناء Rollback.

## ما لا يُستخدم

- Docker في هذا المسار
- iisnode
- `npm run dev` في Production
- static export
- فتح `0.0.0.0:3000` للعامة
