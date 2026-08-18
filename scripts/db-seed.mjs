import './load-env.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
const { Client } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');
const seed = JSON.parse(await fs.readFile(path.join(process.cwd(),'content/generated/normalized_content_seed_ar.json'),'utf8'));
const client = new Client({ connectionString });
await client.connect();
await client.query('BEGIN');
try {
  for (const record of seed.records) {
    await client.query(`INSERT INTO content_items(
      content_type,legacy_id,slug,status,visibility,publish_date,show_publish_date,seeded_launch_library,data_ar,data_en,private_data,translation_status
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,'not_started')
    ON CONFLICT(content_type,slug) DO UPDATE SET
      legacy_id=EXCLUDED.legacy_id,
      data_ar=CASE WHEN content_items.seeded_launch_library THEN EXCLUDED.data_ar ELSE content_items.data_ar END,
      private_data=CASE WHEN content_items.seeded_launch_library THEN EXCLUDED.private_data ELSE content_items.private_data END,
      updated_at=now()`, [
      record.content_type, record.legacy_id, record.slug, record.status, record.visibility,
      record.publish_date, record.show_publish_date, record.seeded_launch_library,
      JSON.stringify(record.data_ar), JSON.stringify(record.data_en), JSON.stringify(record.private_data)
    ]);
  }
  for (const source of seed.source_registry) {
    await client.query(`INSERT INTO source_registry(source_key,title_ar,official_url) VALUES($1,$2,$3)
      ON CONFLICT(source_key) DO UPDATE SET title_ar=EXCLUDED.title_ar, official_url=EXCLUDED.official_url, updated_at=now()`,
      [source.key, source.title_ar, source.official_url]);
  }
  for (const [key,value] of Object.entries(seed.publication_crosslinks || {})) {
    await client.query(`INSERT INTO publication_crosslinks(publication_legacy_id,value_json) VALUES($1,$2::jsonb)
      ON CONFLICT(publication_legacy_id) DO UPDATE SET value_json=EXCLUDED.value_json`, [key, JSON.stringify(value)]);
  }
  const settings = {
    brand: seed.site_settings.brand,
    about_page_markdown_ar: seed.site_settings.about_page_markdown_ar,
    about_page_markdown_en: seed.site_settings.about_page_markdown_en,
    hero_asset_id: null,
    about_asset_id: null,
    site_name_ar: seed.site_settings.site_name_ar,
    site_name_en: seed.site_settings.site_name_en,
    hero_title_ar: seed.site_settings.brand?.hero || 'أشارك المعرفة لأصنع أثرًا يتجاوز حدود العمل',
    hero_title_en: 'I share knowledge to create impact beyond work',
    hero_lead_ar: 'الاستدامة • ابتكار مسؤول • جودة حياة • معرفة',
    hero_lead_en: 'Sustainability • Responsible innovation • Quality of life • Knowledge',
    home_featured: {
      issue_slug: 'family-sustainability-starts-at-home',
      article_slugs: ['sustainability-not-seasonal-campaign','ai-not-a-replacement-for-thinking','from-certificate-to-application'],
      minute_slug: 'ai-question-not-answer',
      story_slug: 'problem-before-technology',
      challenge_slug: 'one-hour-knowledge-volunteering',
      tool_slug: 'personal-learning-plan',
      publication_slug: 'smart-government-asset-management'
    }
  };
  for (const [key,value] of Object.entries(settings)) {
    await client.query(`INSERT INTO site_settings(setting_key,value_json) VALUES($1,$2::jsonb)
      ON CONFLICT(setting_key) DO NOTHING`, [key, JSON.stringify(value)]);
  }
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
await client.end();
console.log(`Seeded ${seed.records.length} normalized records, ${seed.source_registry.length} sources.`);
