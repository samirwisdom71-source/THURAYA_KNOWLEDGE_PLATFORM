export type Locale = 'ar' | 'en';
export type ContentStatus = 'draft' | 'ready' | 'published' | 'archived' | 'awaiting_image';
export type Visibility = 'public' | 'private' | 'unlisted';

export type ContentType =
  | 'article' | 'monthly_issue' | 'challenge' | 'tool' | 'newsletter'
  | 'minute_knowledge' | 'ask_thuraya' | 'publication' | 'publication_tool'
  | 'publication_faq' | 'impact_story' | 'visual_journal' | 'inspired_source'
  | 'community_content';

export interface ContentItem {
  id: string;
  content_type: ContentType;
  legacy_id: string | null;
  slug: string;
  status: ContentStatus;
  visibility: Visibility;
  publish_date: string | null;
  first_published_at: string | null;
  show_publish_date: boolean;
  seeded_launch_library: boolean;
  data_ar: Record<string, unknown>;
  data_en: Record<string, unknown>;
  private_data?: Record<string, unknown>;
  translation_status: string;
  translation_source_hash: string | null;
  manual_override_en: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  kind: 'image' | 'document' | 'audio' | 'video' | 'other';
  original_name: string;
  mime_type: string;
  size_bytes: number;
  private_path: string;
  public_path: string | null;
  sha256: string;
  alt_ar: string | null;
  alt_en: string | null;
  consent_status: 'not_applicable' | 'pending' | 'confirmed' | 'rejected';
  public_safe_review: boolean;
  visibility: 'public' | 'private';
  metadata: Record<string, unknown>;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export type FieldType = 'text' | 'textarea' | 'markdown' | 'array' | 'number' | 'boolean' | 'url' | 'asset';
export interface FieldSpec { key: string; labelAr: string; labelEn: string; type: FieldType; required?: boolean; }
