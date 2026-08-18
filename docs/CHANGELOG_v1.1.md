# Changelog v1.1

- Normalized canonical content schema across all 288 records.
- Restored 14-source registry and article source-key validation.
- Public seed is generated and strips internal/private fields.
- Visual Journal lifecycle fixed to awaiting_image until real reviewed media exists.
- Added PostgreSQL-backed CMS, auth, sessions, audit, moderation, subscribers, settings, crosslinks, media, rate limits.
- Added bilingual public site and responsive RTL/LTR UI.
- Added private-original / reviewed-public media workflow with WebP re-encoding for images.
- Added no-backdating first-publish policy.
- Fixed cross-type slug collision with namespaced routes.
- Added runtime Turnstile configuration and production preflight.
- Added backup/restore, health endpoint, CSP/security headers, Docker deployment, and project/security/content audits.
