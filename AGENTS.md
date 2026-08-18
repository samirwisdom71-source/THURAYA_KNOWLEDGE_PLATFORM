# AGENTS.md — Thuraya Public Personal Website

Read `00_MASTER_CONTROL/README_FIRST_AR.md` before modifying the project.

Non-negotiable:
1. Public personal knowledge platform; never employer website.
2. Never add internal employer data, KPIs, savings, contracts, employee records, internal screenshots or emails.
3. Never backdate publication dates.
4. Never ship demo metrics to production.
5. `award_alignment_internal` is admin/private only and must never reach public serialization.
6. Arabic is source of truth; RTL first. English is translated/cached with manual override.
7. Production content comes from `04_MASTER_SEED/master_content_seed_ar.json`.
8. `07_STAGING_ONLY` must be excluded from production builds.
9. Visual Journal items require a real public-safe image before publishing.
10. Run validation scripts before every production build.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
