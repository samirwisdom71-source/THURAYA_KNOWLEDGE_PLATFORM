#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]
def require(path):
    if not (ROOT/path).exists(): errors.append(f"missing: {path}")
for p in [
 'src/app/admin/content/page.tsx','src/app/admin/media/page.tsx','src/app/admin/settings/page.tsx','src/app/admin/sources/page.tsx','src/app/admin/crosslinks/page.tsx','src/app/admin/account/page.tsx',
 'src/app/api/health/route.ts','src/app/api/forms/newsletter/route.ts','src/app/api/forms/ask/route.ts','src/app/api/forms/challenge/route.ts','src/app/api/media/[id]/route.ts',
 'db/migrations/001_initial.sql','content/generated/normalized_content_seed_ar.json','content/generated/public_content_seed_ar.json'
]: require(p)
public=json.loads((ROOT/'content/generated/public_content_seed_ar.json').read_text(encoding='utf-8'))
blob=json.dumps(public,ensure_ascii=False)
for key in ['award_alignment_internal','is_demo','private_data','moderation_private_notes']:
    if key in blob: errors.append(f'public seed leaks {key}')
normalized=json.loads((ROOT/'content/generated/normalized_content_seed_ar.json').read_text(encoding='utf-8'))
records=normalized.get('records',[])
if len(records)!=288: errors.append(f'expected 288 normalized records, got {len(records)}')
for r in records:
    if r.get('content_type')=='visual_journal' and r.get('status')=='published': errors.append(f"visual journal unexpectedly published: {r.get('slug')}")
route=(ROOT/'src/app/[locale]/content/[type]/[slug]/page.tsx').exists()
if not route: errors.append('generic namespaced route missing')
content_api=(ROOT/'src/app/api/admin/content/[id]/route.ts').read_text(encoding='utf-8')
if re.search(r'body\.(?:first_published_at|publish_date)',content_api): errors.append('content API accepts client-controlled publish dates')
dockerignore=(ROOT/'.dockerignore').read_text(encoding='utf-8')
if 'source_package_v1.0' not in dockerignore: errors.append('source package is not excluded from Docker build context')
all_src='\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in (ROOT/'src').rglob('*') if p.suffix in {'.ts','.tsx'})
if 'window.confirm(' in all_src or 'alert(' in all_src: errors.append('browser popup found in UI')
if errors:
    print('PROJECT AUDIT FAILED')
    for e in errors: print('-',e)
    sys.exit(1)
print('PROJECT AUDIT PASSED')
print(f'Records: {len(records)} | Public seed: {len(public.get("records",[]))} | Sources: {len(normalized.get("source_registry",[]))}')
