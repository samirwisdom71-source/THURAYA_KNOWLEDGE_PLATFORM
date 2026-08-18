#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / 'content/source/master_content_seed_ar.json'
PACKAGE1 = ROOT / 'content/source/package_01_seed_ar.json'
OUT = ROOT / 'content/generated/normalized_content_seed_ar.json'
PUBLIC = ROOT / 'content/generated/public_content_seed_ar.json'

PRIVATE_KEYS = {
    'award_alignment_internal', 'is_demo', 'admin_notes', 'moderation_private_notes',
    'private_notes', 'internal_notes'
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def common(item: dict[str, Any], content_type: str, index: int) -> dict[str, Any]:
    source_status = item.get('status') or item.get('publish_status') or 'draft'
    if content_type == 'visual_journal':
        status = 'awaiting_image'
    elif source_status == 'ready':
        # The launch library is public without a fabricated historical date.
        status = 'published'
    else:
        status = source_status
    legacy_id = item.get('id') or item.get('tool_id') or item.get('faq_id') or index
    slug = item.get('slug')
    if not slug:
        slug = re.sub(r'[^a-z0-9]+', '-', f'{content_type}-{legacy_id}'.lower()).strip('-')
    return {
        'content_type': content_type,
        'legacy_id': str(legacy_id),
        'slug': slug,
        'status': status,
        'visibility': item.get('visibility', 'public'),
        'publish_date': None,
        'show_publish_date': False,
        'seeded_launch_library': content_type != 'visual_journal',
        'data_ar': {},
        'data_en': {},
        'private_data': {},
    }


def split_private(item: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    public, private = {}, {}
    for k, v in item.items():
        if k in PRIVATE_KEYS or k.endswith('_internal'):
            private[k] = v
        else:
            public[k] = v
    return public, private


def normalize() -> dict[str, Any]:
    master = load(MASTER)
    package1 = load(PACKAGE1)
    content = master['content']
    records: list[dict[str, Any]] = []

    def add(ct: str, source: list[dict[str, Any]], mapper):
        for i, raw in enumerate(source, 1):
            clean, private = split_private(raw)
            row = common(clean, ct, i)
            row['private_data'] = private
            row['data_ar'] = mapper(clean)
            records.append(row)

    add('article', content['articles'], lambda x: {
        'title': x['title_ar'], 'category': x['category_ar'], 'reading_time': x.get('reading_time_ar'),
        'meta_description': x.get('meta_description_ar'), 'body_markdown': x['body_ar_markdown'],
        'source_keys': x.get('source_keys', []), 'hero_asset_id': None,
    })
    add('monthly_issue', content['monthly_issues'], lambda x: {
        'month_label': x.get('month'), 'theme': x.get('theme'), 'title': x.get('title'),
        'summary': x.get('summary'), 'body_markdown': x.get('content'), 'hero_asset_id': None,
    })
    add('challenge', content['monthly_challenges'], lambda x: {
        'month_label': x.get('month'), 'title': x.get('title'), 'duration': x.get('duration'),
        'goal': x.get('goal'), 'steps': x.get('steps', []), 'completion_rule': x.get('success'),
        'public_result_note': x.get('public_result'), 'hero_asset_id': None,
    })
    add('tool', content['general_tools'], lambda x: {
        'title': x.get('title'), 'category': x.get('category'), 'format': x.get('format'),
        'purpose': x.get('purpose'), 'fields': x.get('fields', []),
        'interactive_form_enabled': False, 'downloadable_asset_id': None,
    })
    add('newsletter', content['newsletter'], lambda x: {
        'month_label': x.get('month'), 'title': x.get('title'), 'opening': x.get('opening'),
        'issue_title': x.get('issue_title'), 'issue_summary': x.get('issue_summary'),
        'practical_idea': x.get('idea'), 'tool_of_issue': x.get('tool'), 'learned': x.get('learned'),
        'challenge': x.get('challenge'), 'reflection_question': x.get('reflection'),
        'closing': x.get('closing'), 'hero_asset_id': None,
    })
    add('minute_knowledge', content['minute_knowledge'], lambda x: {
        'title': x.get('title'), 'category': x.get('category'), 'body_markdown': x.get('content'),
        'hero_asset_id': None,
    })
    add('ask_thuraya', content['ask_thuraya'], lambda x: {
        'question': x.get('question'), 'answer': x.get('answer'), 'category': x.get('category'),
        'source_type': 'seed', 'moderation_status': 'approved',
    })
    add('publication', content['publication_pages'], lambda x: {
        'type': x.get('type_ar'), 'title': x.get('title_ar'), 'subtitle': x.get('subtitle_ar'),
        'meta_description': x.get('meta_description_ar'), 'executive_summary': x.get('executive_summary_ar'),
        'audience': x.get('audience_ar', []), 'key_ideas': x.get('key_ideas_ar', []),
        'author': x.get('author_ar'), 'publication_year': x.get('publication_year'),
        'cover_asset_id': None, 'summary_public': bool(x.get('summary_public', True)),
        'tools_public': bool(x.get('tools_public', True)), 'faq_public': bool(x.get('faq_public', True)),
        'full_document_public': False, 'full_document_asset_id': None,
    })
    add('publication_tool', content['publication_tools'], lambda x: {
        'publication_legacy_id': str(x.get('publication_id')), 'publication_slug': x.get('publication_slug'),
        'title': x.get('title_ar'), 'purpose': x.get('purpose_ar'), 'fields': x.get('fields_ar', []),
        'downloadable_asset_id': None,
    })
    add('publication_faq', content['publication_faqs'], lambda x: {
        'publication_legacy_id': str(x.get('publication_id')), 'publication_slug': x.get('publication_slug'),
        'question': x.get('question_ar'), 'answer': x.get('answer_ar'),
    })
    add('impact_story', content['impact_stories'], lambda x: {
        'title': x.get('title'), 'theme': x.get('theme'), 'body_markdown': x.get('body'),
        'hero_asset_id': None,
    })
    add('visual_journal', content['visual_journal'], lambda x: {
        'category': x.get('category'), 'title': x.get('title'), 'caption': x.get('caption'),
        'image_requirements': x.get('image_needed'), 'alt': x.get('alt'), 'image_asset_id': None,
        'consent_status': 'pending', 'public_safe_review': False,
    })
    add('inspired_source', content['inspired_sources'], lambda x: {
        'title': x.get('title'), 'organization': x.get('organization'), 'theme': x.get('theme'),
        'official_url': x.get('url'), 'personal_note': x.get('note'), 'official_source': True,
    })
    add('community_content', content['community_content'], lambda x: {
        'category': x.get('category'), 'title': x.get('title'), 'body_markdown': x.get('body'),
        'cta': x.get('cta'), 'hero_asset_id': None,
    })

    sources = []
    for key, source in package1.get('sources', {}).items():
        sources.append({'key': key, 'title_ar': source.get('title'), 'official_url': source.get('url')})

    result = {
        'schema_version': '1.1',
        'project': master['project'],
        'global_policies': master['global_policies'],
        'translation': master['translation'],
        'site_settings': {
            'brand': content['brand'],
            'about_page_markdown_ar': content['about_page_markdown'],
            'about_page_markdown_en': '',
            'hero_asset_id': None,
            'about_asset_id': None,
            'site_name_ar': master['project'].get('name_ar'),
            'site_name_en': 'Thuraya Al Shamsi',
        },
        'source_registry': sources,
        'publication_crosslinks': content.get('publication_crosslinks', {}),
        'records': records,
        'counts': master['counts'],
    }
    return result


def strip_private(value: Any) -> Any:
    if isinstance(value, list):
        return [strip_private(v) for v in value]
    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            if k in PRIVATE_KEYS or k == 'private_data' or k.endswith('_internal'):
                continue
            out[k] = strip_private(v)
        return out
    return value


def public_seed(data: dict[str, Any]) -> dict[str, Any]:
    public_records = []
    for row in data['records']:
        if row.get('visibility') != 'public':
            continue
        if row.get('content_type') == 'visual_journal':
            # Source package has no real reviewed images. Keep it out of public seed.
            continue
        public_records.append(strip_private(row))
    return {
        'schema_version': data['schema_version'],
        'project': strip_private(data['project']),
        'site_settings': strip_private(data['site_settings']),
        'source_registry': strip_private(data['source_registry']),
        'publication_crosslinks': strip_private(data['publication_crosslinks']),
        'records': public_records,
    }


if __name__ == '__main__':
    data = normalize()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    PUBLIC.write_text(json.dumps(public_seed(data), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Normalized {len(data["records"])} records -> {OUT}')
    print(f'Generated public seed -> {PUBLIC}')
