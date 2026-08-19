import type { ContentItem, Locale } from './types';

export function localizedData(item: ContentItem, locale: Locale): Record<string, unknown> {
  if (locale === 'en' && item.data_en && Object.keys(item.data_en).length) return item.data_en;
  return item.data_ar;
}

export function titleOf(item: ContentItem, locale: Locale): string {
  const d = localizedData(item, locale);
  return String(d.title ?? d.question ?? d.issue_title ?? item.slug);
}

export function excerptOf(item: ContentItem, locale: Locale, length = 190): string {
  const d = localizedData(item, locale);
  const raw = String(d.summary ?? d.meta_description ?? d.purpose ?? d.caption ?? d.personal_note ?? d.answer ?? d.body_markdown ?? d.executive_summary ?? '');
  return raw
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/[#*_>`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, length);
}
