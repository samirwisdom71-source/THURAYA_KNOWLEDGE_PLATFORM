# CMS CONTENT MODELS

## Common Fields
`id, slug, status, visibility, publish_date, show_publish_date, created_at, updated_at, author, locale_status`

## Article
`title_ar, category_ar, meta_description_ar, body_ar_markdown, source_keys[], related_content[]`

## MonthlyIssue
`month_label_ar, theme_ar, title_ar, summary_ar, content_ar, hero_image`

## Challenge
`title_ar, duration_ar, goal_ar, steps_ar[], completion_rule_ar, actual_participant_count, actual_completion_count, actual_feedback_count, is_demo`

## Tool
`title_ar, category_ar, purpose_ar, fields_ar[], interactive_form_enabled, downloadable_file_url, download_count`

## NewsletterIssue
`title_ar, opening_ar, issue_title_ar, issue_summary_ar, practical_idea_ar, tool_of_issue, learned_ar, challenge, reflection_question_ar, closing_ar`

## MinuteKnowledge
`title_ar, category_ar, body_ar`

## AskThuraya
`question_ar, answer_ar, category_ar, source_type=seed|public_submission, moderation_status`

## Publication
`type_ar, title_ar, subtitle_ar, executive_summary_ar, audience_ar[], key_ideas_ar[], cover_image, summary_public, tools_public, faq_public, full_document_public, full_document_url`

## PublicationFAQ
`publication_id, question_ar, answer_ar, order`

## ImpactStory
`title_ar, theme_ar, body_ar, hero_image, award_alignment_internal`

## VisualJournal
`category_ar, title_ar, caption_ar, image_url, alt_ar, consent_status, public_safe_review, status, award_alignment_internal`

## InspiredSource
`title_ar, organization_ar, theme_ar, official_url, personal_note_ar, official_source=true`

## CommunityContent
`category_ar, title_ar, body_ar, cta_ar, award_alignment_internal`

## Translation Fields
يفضل تخزين:
`title_en, body_en, translation_status, translation_source_hash, manual_override_en`

## Internal Fields
هذه الحقول لا تخرج من Public Serializer:
`award_alignment_internal, is_demo, admin_notes, moderation_private_notes`
