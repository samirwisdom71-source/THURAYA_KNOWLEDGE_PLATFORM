import type { ContentType, FieldSpec } from './types';

export const contentTypeLabels: Record<ContentType, { ar: string; en: string }> = {
  article: { ar: 'مقال', en: 'Article' },
  monthly_issue: { ar: 'قضية شهر', en: 'Monthly issue' },
  challenge: { ar: 'تحدٍ', en: 'Challenge' },
  tool: { ar: 'أداة', en: 'Tool' },
  newsletter: { ar: 'نشرة أثر', en: 'Newsletter' },
  minute_knowledge: { ar: 'دقيقة معرفة', en: 'Knowledge minute' },
  ask_thuraya: { ar: 'اسأل ثريا', en: 'Ask Thuraya' },
  publication: { ar: 'إصدار', en: 'Publication' },
  publication_tool: { ar: 'أداة إصدار', en: 'Publication tool' },
  publication_faq: { ar: 'FAQ إصدار', en: 'Publication FAQ' },
  impact_story: { ar: 'قصة أثر', en: 'Impact story' },
  visual_journal: { ar: 'يوميات بصرية', en: 'Visual journal' },
  inspired_source: { ar: 'مصدر ألهمني', en: 'Inspired source' },
  community_content: { ar: 'محتوى مجتمعي', en: 'Community content' },
};

const f = (key: string, labelAr: string, labelEn: string, type: FieldSpec['type'] = 'text', required = false): FieldSpec => ({ key, labelAr, labelEn, type, required });

export const contentFields: Record<ContentType, FieldSpec[]> = {
  article: [f('title','العنوان','Title','text',true),f('category','التصنيف','Category'),f('reading_time','وقت القراءة','Reading time'),f('meta_description','وصف SEO','SEO description','textarea'),f('body_markdown','المحتوى','Content','markdown',true),f('source_keys','مفاتيح المصادر','Source keys','array'),f('hero_asset_id','صورة المقال','Hero image','asset')],
  monthly_issue: [f('month_label','الشهر','Month'),f('theme','المحور','Theme'),f('title','العنوان','Title','text',true),f('summary','الملخص','Summary','textarea'),f('body_markdown','المحتوى','Content','markdown',true),f('hero_asset_id','الصورة','Hero image','asset')],
  challenge: [f('month_label','الشهر','Month'),f('title','العنوان','Title','text',true),f('duration','المدة','Duration'),f('goal','الهدف','Goal','textarea'),f('steps','الخطوات','Steps','array'),f('completion_rule','قاعدة الإكمال','Completion rule','textarea'),f('public_result_note','ملاحظة النتائج العامة','Public result note','textarea'),f('hero_asset_id','الصورة','Hero image','asset')],
  tool: [f('title','العنوان','Title','text',true),f('category','التصنيف','Category'),f('format','الصيغة','Format'),f('purpose','الغرض','Purpose','textarea'),f('fields','الحقول','Fields','array'),f('interactive_form_enabled','نموذج تفاعلي','Interactive form','boolean'),f('downloadable_asset_id','ملف التحميل','Download file','asset')],
  newsletter: [f('month_label','الشهر','Month'),f('title','العنوان','Title','text',true),f('opening','الافتتاحية','Opening','textarea'),f('issue_title','عنوان القضية','Issue title'),f('issue_summary','ملخص القضية','Issue summary','textarea'),f('practical_idea','فكرة عملية','Practical idea','textarea'),f('tool_of_issue','أداة العدد','Tool of issue'),f('learned','ما تعلمته','What I learned','textarea'),f('challenge','التحدي','Challenge'),f('reflection_question','سؤال للتفكير','Reflection question','textarea'),f('closing','الخاتمة','Closing','textarea'),f('hero_asset_id','الصورة','Hero image','asset')],
  minute_knowledge: [f('title','العنوان','Title','text',true),f('category','التصنيف','Category'),f('body_markdown','المحتوى','Content','markdown',true),f('hero_asset_id','الصورة','Hero image','asset')],
  ask_thuraya: [f('question','السؤال','Question','textarea',true),f('answer','الإجابة','Answer','markdown',true),f('category','التصنيف','Category'),f('source_type','المصدر','Source type'),f('moderation_status','حالة المراجعة','Moderation status')],
  publication: [f('type','النوع','Type'),f('title','العنوان','Title','text',true),f('subtitle','العنوان الفرعي','Subtitle'),f('meta_description','وصف SEO','SEO description','textarea'),f('executive_summary','الملخص التنفيذي','Executive summary','markdown'),f('audience','الجمهور','Audience','array'),f('key_ideas','الأفكار الرئيسية','Key ideas','array'),f('author','المؤلف','Author'),f('publication_year','سنة الإصدار','Publication year','number'),f('cover_asset_id','الغلاف','Cover','asset'),f('summary_public','الملخص عام','Public summary','boolean'),f('tools_public','الأدوات عامة','Public tools','boolean'),f('faq_public','الأسئلة عامة','Public FAQ','boolean'),f('full_document_public','الملف الكامل عام','Public full document','boolean'),f('full_document_asset_id','الملف الكامل','Full document','asset')],
  publication_tool: [f('publication_legacy_id','رقم الإصدار','Publication ID'),f('publication_slug','Slug الإصدار','Publication slug'),f('title','العنوان','Title','text',true),f('purpose','الغرض','Purpose','textarea'),f('fields','الحقول','Fields','array'),f('downloadable_asset_id','ملف التحميل','Download file','asset')],
  publication_faq: [f('publication_legacy_id','رقم الإصدار','Publication ID'),f('publication_slug','Slug الإصدار','Publication slug'),f('question','السؤال','Question','textarea',true),f('answer','الإجابة','Answer','textarea',true)],
  impact_story: [f('title','العنوان','Title','text',true),f('theme','المحور','Theme'),f('body_markdown','القصة','Story','markdown',true),f('hero_asset_id','الصورة','Hero image','asset')],
  visual_journal: [f('category','التصنيف','Category'),f('title','العنوان','Title','text',true),f('caption','التعليق','Caption','textarea',true),f('image_requirements','متطلبات الصورة','Image requirements','textarea'),f('alt','النص البديل','Alt text','text',true),f('image_asset_id','الصورة','Image','asset'),f('consent_status','حالة الموافقة','Consent status'),f('public_safe_review','مراجعة الأمان العام','Public safe review','boolean')],
  inspired_source: [f('title','العنوان','Title','text',true),f('organization','الجهة','Organization'),f('theme','المحور','Theme'),f('official_url','الرابط الرسمي','Official URL','url',true),f('personal_note','ملاحظتي','Personal note','textarea'),f('official_source','مصدر رسمي','Official source','boolean')],
  community_content: [f('category','التصنيف','Category'),f('title','العنوان','Title','text',true),f('body_markdown','المحتوى','Content','markdown',true),f('cta','الدعوة للتفاعل','CTA','textarea'),f('hero_asset_id','الصورة','Hero image','asset')],
};

export const allContentTypes = Object.keys(contentTypeLabels) as ContentType[];
