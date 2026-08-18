import { query } from './db';
import type { ContentItem, ContentType, Locale } from './types';
import { stripPrivate } from './public-serializer';

const PUBLIC_WHERE = `status='published' AND visibility='public'`;

export async function getPublicContent(contentType: ContentType, options: { limit?: number; offset?: number; search?: string } = {}) {
  const limit = Math.min(Math.max(options.limit ?? 100,1),200);
  const offset = Math.max(options.offset ?? 0,0);
  const values: unknown[] = [contentType];
  let where = `content_type=$1 AND ${PUBLIC_WHERE}`;
  if (options.search?.trim()) {
    values.push(`%${options.search.trim()}%`);
    where += ` AND (data_ar::text ILIKE $${values.length} OR data_en::text ILIKE $${values.length} OR slug ILIKE $${values.length})`;
  }
  values.push(limit, offset);
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE ${where} ORDER BY COALESCE(first_published_at,created_at) DESC, legacy_id NULLS LAST LIMIT $${values.length-1} OFFSET $${values.length}`, values);
  return result.rows.map(stripPrivate);
}

export async function getPublicBySlug(contentType: ContentType, slug: string) {
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE content_type=$1 AND slug=$2 AND ${PUBLIC_WHERE} LIMIT 1`, [contentType,slug]);
  return result.rows[0] ? stripPrivate(result.rows[0]) : null;
}

export async function getPublicAnyBySlug(slug: string) {
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE slug=$1 AND ${PUBLIC_WHERE} ORDER BY created_at LIMIT 1`, [slug]);
  return result.rows[0] ? stripPrivate(result.rows[0]) : null;
}

export async function getFeatured(type: ContentType, slugs: string[], limit = slugs.length) {
  if (!slugs.length) return [];
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE content_type=$1 AND slug = ANY($2::text[]) AND ${PUBLIC_WHERE}`, [type, slugs]);
  const bySlug = new Map(result.rows.map(r => [r.slug,r]));
  return slugs.map(s => bySlug.get(s)).filter(Boolean).slice(0,limit).map(v => stripPrivate(v!));
}

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  try {
    const result = await query<{value_json:T}>('SELECT value_json FROM site_settings WHERE setting_key=$1',[key]);
    return result.rows[0]?.value_json ?? fallback;
  } catch {
    return fallback;
  }
}

export function localizedData(item: ContentItem, locale: Locale): Record<string, unknown> {
  if (locale === 'en' && item.data_en && Object.keys(item.data_en).length) return item.data_en;
  return item.data_ar;
}

export function titleOf(item: ContentItem, locale: Locale): string {
  const d = localizedData(item,locale);
  return String(d.title ?? d.question ?? d.issue_title ?? item.slug);
}

export function excerptOf(item: ContentItem, locale: Locale, length = 190): string {
  const d = localizedData(item,locale);
  const raw = String(d.summary ?? d.meta_description ?? d.purpose ?? d.caption ?? d.personal_note ?? d.answer ?? d.body_markdown ?? d.executive_summary ?? '');
  return raw.replace(/[#*_>`\[\]-]/g,' ').replace(/\s+/g,' ').trim().slice(0,length);
}

export async function searchPublic(term: string, limit = 40) {
  const q = `%${term.trim()}%`;
  const result = await query<ContentItem>(`SELECT * FROM content_items WHERE ${PUBLIC_WHERE} AND (slug ILIKE $1 OR data_ar::text ILIKE $1 OR data_en::text ILIKE $1) ORDER BY updated_at DESC LIMIT $2`,[q,limit]);
  return result.rows.map(stripPrivate);
}

export async function getSourcesForArticle(item: ContentItem) {
  const keys = Array.isArray(item.data_ar?.source_keys) ? item.data_ar.source_keys.map(String) : [];
  if (!keys.length) return [];
  const result = await query<{source_key:string;title_ar:string;official_url:string}>('SELECT source_key,title_ar,official_url FROM source_registry WHERE source_key = ANY($1::text[]) AND active=true',[keys]);
  const byKey = new Map(result.rows.map(r => [r.source_key,r]));
  return keys.map(k => byKey.get(k)).filter(Boolean);
}

export async function getPublicationChildren(publicationSlug: string) {
  const [tools,faqs] = await Promise.all([
    query<ContentItem>(`SELECT * FROM content_items WHERE content_type='publication_tool' AND status='published' AND visibility='public' AND data_ar->>'publication_slug'=$1 ORDER BY legacy_id`,[publicationSlug]),
    query<ContentItem>(`SELECT * FROM content_items WHERE content_type='publication_faq' AND status='published' AND visibility='public' AND data_ar->>'publication_slug'=$1 ORDER BY legacy_id`,[publicationSlug]),
  ]);
  return {tools:tools.rows.map(stripPrivate),faqs:faqs.rows.map(stripPrivate)};
}

export async function getChallengeActualCount(slug:string) {
  const r = await query<{count:string}>(`SELECT count(*)::text count FROM public_submissions WHERE submission_type='challenge' AND content_slug=$1 AND moderation_status <> 'spam'`,[slug]);
  return Number(r.rows[0]?.count || 0);
}

export async function getPublicationRelated(publicationLegacyId: string) {
  const rel = await query<{value_json:{related_articles?:string[];related_tools?:string[]}}>('SELECT value_json FROM publication_crosslinks WHERE publication_legacy_id=$1',[publicationLegacyId]);
  const value=rel.rows[0]?.value_json||{};
  const articleSlugs=Array.isArray(value.related_articles)?value.related_articles:[];
  const toolIds=Array.isArray(value.related_tools)?value.related_tools:[];
  const [articles,tools]=await Promise.all([
    articleSlugs.length?query<ContentItem>(`SELECT * FROM content_items WHERE content_type='article' AND slug=ANY($1::text[]) AND ${PUBLIC_WHERE}`,[articleSlugs]):Promise.resolve({rows:[]} as any),
    toolIds.length?query<ContentItem>(`SELECT * FROM content_items WHERE content_type='publication_tool' AND legacy_id=ANY($1::text[]) AND ${PUBLIC_WHERE}`,[toolIds]):Promise.resolve({rows:[]} as any),
  ]);
  const bySlug=new Map((articles.rows as ContentItem[]).map(x=>[x.slug,x]));
  const byId=new Map((tools.rows as ContentItem[]).map(x=>[x.legacy_id,x]));
  return {articles:articleSlugs.map(s=>bySlug.get(s)).filter(Boolean).map(x=>stripPrivate(x!)),tools:toolIds.map(id=>byId.get(id)).filter(Boolean).map(x=>stripPrivate(x!))};
}
