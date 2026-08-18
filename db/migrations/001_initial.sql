CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  legacy_id text,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','published','archived','awaiting_image')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private','unlisted')),
  publish_date timestamptz,
  first_published_at timestamptz,
  show_publish_date boolean NOT NULL DEFAULT false,
  seeded_launch_library boolean NOT NULL DEFAULT false,
  data_ar jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_en jsonb NOT NULL DEFAULT '{}'::jsonb,
  private_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  translation_status text NOT NULL DEFAULT 'not_started' CHECK (translation_status IN ('not_started','pending','translated','reviewed','failed')),
  translation_source_hash text,
  manual_override_en boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_type, slug)
);
CREATE INDEX IF NOT EXISTS idx_content_public ON content_items(content_type,status,visibility);
CREATE INDEX IF NOT EXISTS idx_content_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_search_ar ON content_items USING gin (data_ar);

CREATE TABLE IF NOT EXISTS source_registry (
  source_key text PRIMARY KEY,
  title_ar text NOT NULL,
  official_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key text PRIMARY KEY,
  value_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('image','document','audio','video','other')),
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  private_path text NOT NULL,
  public_path text,
  sha256 text NOT NULL,
  alt_ar text,
  alt_en text,
  consent_status text NOT NULL DEFAULT 'not_applicable' CHECK (consent_status IN ('not_applicable','pending','confirmed','rejected')),
  public_safe_review boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public','private')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  download_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_public ON media_assets(visibility,public_safe_review);

CREATE TABLE IF NOT EXISTS public_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type text NOT NULL CHECK (submission_type IN ('ask_thuraya','challenge','contact')),
  locale text NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar','en')),
  name text,
  email text,
  content_slug text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  consent boolean NOT NULL DEFAULT false,
  moderation_status text NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending','approved','rejected','spam')),
  moderation_private_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submissions_queue ON public_submissions(submission_type,moderation_status,created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  locale text NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar','en')),
  consent boolean NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','unsubscribed','bounced')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  scope text NOT NULL,
  key_hash text NOT NULL,
  window_started_at timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY(scope,key_hash)
);

CREATE TABLE IF NOT EXISTS publication_crosslinks (
  publication_legacy_id text PRIMARY KEY,
  value_json jsonb NOT NULL
);
