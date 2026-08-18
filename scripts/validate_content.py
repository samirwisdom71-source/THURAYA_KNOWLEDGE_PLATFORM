#!/usr/bin/env python3
from __future__ import annotations
import json,re,sys
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
NORM=ROOT/'content/generated/normalized_content_seed_ar.json'
PUB=ROOT/'content/generated/public_content_seed_ar.json'
PRIVATE={'award_alignment_internal','is_demo','admin_notes','moderation_private_notes','private_data'}
EXPECTED={'article':24,'monthly_issue':12,'challenge':12,'tool':18,'newsletter':12,'minute_knowledge':24,'ask_thuraya':30,'publication':6,'publication_tool':30,'publication_faq':48,'impact_story':12,'visual_journal':24,'inspired_source':18,'community_content':18}
REQUIRED={'article':['title','body_markdown'],'monthly_issue':['title','body_markdown'],'challenge':['title','goal','steps'],'tool':['title','purpose'],'newsletter':['title','opening'],'minute_knowledge':['title','body_markdown'],'ask_thuraya':['question','answer'],'publication':['title','executive_summary'],'publication_tool':['title','purpose'],'publication_faq':['question','answer'],'impact_story':['title','body_markdown'],'visual_journal':['title','caption','alt'],'inspired_source':['title','official_url'],'community_content':['title','body_markdown']}
errors=[]

def walk(v,path='root'):
    if isinstance(v,dict):
        for k,x in v.items():
            if k in PRIVATE or k.endswith('_internal'): errors.append(f'Private key leaked in public seed: {path}.{k}')
            walk(x,f'{path}.{k}')
    elif isinstance(v,list):
        for i,x in enumerate(v): walk(x,f'{path}[{i}]')

try:n=json.loads(NORM.read_text(encoding='utf-8'));p=json.loads(PUB.read_text(encoding='utf-8'))
except Exception as e:print('FAIL JSON',e);sys.exit(1)
records=n.get('records',[])
if len(records)!=288:errors.append(f'Expected 288 records, got {len(records)}')
counts=Counter(r.get('content_type') for r in records)
for k,v in EXPECTED.items():
    if counts[k]!=v:errors.append(f'{k}: expected {v}, got {counts[k]}')
seen=set(); slugs_by_value={}
for i,r in enumerate(records):
    ct=r.get('content_type');slug=r.get('slug','');key=(ct,slug)
    if key in seen:errors.append(f'Duplicate type+slug: {key}')
    seen.add(key);slugs_by_value.setdefault(slug,[]).append(ct)
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug):errors.append(f'Invalid slug {ct}:{slug}')
    if r.get('publish_date') is not None:errors.append(f'Seed publish_date must be null: {ct}:{slug}')
    d=r.get('data_ar',{})
    for f in REQUIRED.get(ct,[]):
        if d.get(f) in (None,'',[]):errors.append(f'Missing {f}: {ct}:{slug}')
    if r.get('private_data',{}).get('is_demo') is True:errors.append(f'Demo data in normalized production seed: {ct}:{slug}')
    if ct=='visual_journal':
        if r.get('status')!='awaiting_image':errors.append(f'Visual journal must await image: {slug}')
        if d.get('image_asset_id'):errors.append(f'Visual seed cannot invent image asset: {slug}')
        if d.get('public_safe_review') is not False:errors.append(f'Visual seed review must start false: {slug}')
    if ct=='publication':
        if d.get('full_document_public') is not False:errors.append(f'Publication full document must be private: {slug}')
        if d.get('full_document_asset_id') is not None:errors.append(f'Publication full document asset must not auto-attach: {slug}')
sources={s['key'] for s in n.get('source_registry',[])}
for r in records:
    if r.get('content_type')=='article':
        for k in r.get('data_ar',{}).get('source_keys',[]):
            if k not in sources:errors.append(f'Unresolved article source key {k} in {r["slug"]}')
walk(p)
for r in p.get('records',[]):
    if r.get('content_type')=='visual_journal':errors.append('Visual journal leaked into public seed without images')
if len(p.get('records',[]))!=264:errors.append(f'Public seed should contain 264 records (288-24 visual), got {len(p.get("records",[]))}')
# Global duplicate slugs are allowed only across distinct namespaces, but report the known collision as informational.
collisions={s:t for s,t in slugs_by_value.items() if len(t)>1}
if errors:
    print('CONTENT VALIDATION FAILED')
    for e in errors:print(' -',e)
    sys.exit(1)
print('CONTENT VALIDATION PASSED')
print('Records:',len(records),'Public:',len(p['records']),'Sources:',len(sources))
print('Cross-type slug collisions (namespaced, allowed):',collisions or 'none')
