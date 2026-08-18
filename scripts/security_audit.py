#!/usr/bin/env python3
from pathlib import Path
import re,sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]
required=['.dockerignore','.gitignore','.env.example','src/lib/public-serializer.ts','src/lib/media.ts','src/lib/admin-content.ts','src/app/robots.ts','scripts/preflight.mjs']
for f in required:
    if not (ROOT/f).exists():errors.append(f'Missing {f}')
docker=(ROOT/'.dockerignore').read_text(encoding='utf-8')
for term in ['source_package_v1.0','storage/private']:
    if term not in docker:errors.append(f'.dockerignore must exclude {term}')
env=(ROOT/'.env.example').read_text(encoding='utf-8')
if re.search(r'OPENAI_API_KEY=sk-[A-Za-z0-9_-]{20,}',env):errors.append('Real-looking OPENAI_API_KEY found in .env.example')
if 'ADMIN_PASSWORD=ChangeMe' not in env:errors.append('Expected an obvious non-production admin password placeholder in .env.example')
# Block accidental real-looking secrets in runtime code.
for p in (ROOT/'src').rglob('*'):
    if p.suffix not in {'.ts','.tsx','.css'}:continue
    text=p.read_text(encoding='utf-8', errors='ignore')
    if re.search(r'sk-[A-Za-z0-9_-]{30,}',text):errors.append(f'Possible hardcoded API key: {p}')
serializer=(ROOT/'src/lib/public-serializer.ts').read_text(encoding='utf-8')
for key in ['award_alignment_internal','is_demo','admin_notes','moderation_private_notes','private_data']:
    if key not in serializer:errors.append(f'Public serializer missing protected key: {key}')
media_route=(ROOT/'src/app/api/media/[id]/route.ts').read_text(encoding='utf-8')
if 'mediaFilePath(asset,true)' not in media_route:errors.append('Public media route is not guarded')
# Session tokens must be random and stored only as a hash.
auth=(ROOT/'src/lib/auth.ts').read_text(encoding='utf-8')
for term in ["randomBytes(32)","createHash('sha256')",'httpOnly:true','sameSite:\'lax\'']:
    if term not in auth:errors.append(f'Admin session hardening missing: {term}')
preflight=(ROOT/'scripts/preflight.mjs').read_text(encoding='utf-8')
for term in ['CAPTCHA_MODE','TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY','https://']:
    if term not in preflight:errors.append(f'Production preflight check missing: {term}')
config=(ROOT/'next.config.ts').read_text(encoding='utf-8')
if 'Content-Security-Policy' not in config:errors.append('CSP header missing')
bootstrap=(ROOT/'scripts/create-admin.mjs').read_text(encoding='utf-8')
if "active admin already exists" not in bootstrap:errors.append('Admin bootstrap does not protect an existing admin account')
for p in (ROOT/'src').rglob('*.ts*'):
    text=p.read_text(encoding='utf-8', errors='ignore')
    if '07_STAGING_ONLY' in text:errors.append(f'Staging path referenced by runtime source: {p}')
if errors:
    print('SECURITY AUDIT FAILED');[print(' -',e) for e in errors];sys.exit(1)
print('SECURITY AUDIT PASSED')
