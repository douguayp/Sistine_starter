# AGENTS.md

This file gives coding agents an accurate working map for this repository.

## What This Repo Is

`sistine-starter-vibe-to-production` is a production-oriented AI SaaS starter for teaching AI coding and launching commercial AI products quickly.

The repo already includes:

- Better Auth email/password auth plus Google OAuth UI
- Credit-based billing with Creem subscriptions and one-time packs
- Volcano Engine integrations for chat, image generation, and video generation
- Admin screens for users, subscriptions, and credit operations
- Marketing pages, blog, docs-style messaging, and legal pages
- `next-intl` localization for English and Chinese

Optimize changes for two goals at the same time:

1. Keep the starter reusable for buyers and students.
2. Keep production data flows correct for auth, billing, credits, and generation history.

## Ground Rules

- Use `pnpm` for installs and scripts. `package-lock.json` exists, but `package.json` declares `pnpm` as the package manager.
- Prefer accurate docs over aspirational docs. If the code and docs disagree, fix the docs or fix the code.
- Do not reintroduce remote demo asset dependencies that the app can serve locally.
- Treat billing, credits, subscriptions, and auth as consistency-sensitive systems. Avoid "UI-only" updates that leave DB state drifting.

## Stack Snapshot

- Framework: Next.js 16.2.2 App Router
- React: 19
- Language: TypeScript with strict mode
- Styling: Tailwind CSS + Framer Motion
- Auth: Better Auth + Drizzle adapter
- Database: PostgreSQL + Drizzle ORM
- Payments: Creem
- AI provider: Volcano Engine / Doubao
- Email: Resend
- Optional storage: S3-compatible / Cloudflare R2 style config
- Testing: Vitest + Testing Library

## High-Level Repo Map

### App routes

- `app/[locale]/(marketing)`:
  landing page, pricing, contact, blog, legal pages
- `app/[locale]/(auth)`:
  login, signup, forgot password, reset password
- `app/[locale]/(protected)`:
  dashboard, profile, settings, credits
- `app/[locale]/(admin)`:
  admin pages for user and billing operations
- `app/[locale]/demo`:
  demo entry plus dedicated chat/image/video demo pages
- `app/api`:
  auth, chat, image, video, admin, payments, uploads, newsletter, cron

### Core library modules

- `lib/auth.ts`: Better Auth config and signup credit bonus hook
- `lib/auth/session.ts`: session/user resolution from headers
- `lib/auth/admin.ts`: admin authorization helpers
- `lib/db/schema.ts`: source of truth for tables
- `lib/credits.ts`: credit reads, deductions, refunds
- `lib/credit-compensation.ts`: refund-on-failure helper for paid AI actions
- `lib/payments/creem.ts`: checkout and webhook helpers
- `lib/billing/subscription.ts`: annual installment schedule logic
- `lib/r2-storage.ts`: storage mirroring and fallback behavior
- `lib/volcano-engine/*`: chat, image, and video provider wrappers
- `lib/email.ts`: resilient email sending and email templates

### Config and content

- `constants/billing.ts`: all plan keys, pack keys, prices, and Creem product IDs
- `constants/website.ts`: shared app/docs name and public URL config
- `messages/en.json`, `messages/zh.json`: user-facing translations
- `messages/seo.en.json`, `messages/seo.zh.json`: SEO translations
- `app/[locale]/(marketing)/blog/*/*.mdx`: blog content
- `content/docs/**/*.mdx`: source content for the built-in Fumadocs docs site
- `lib/blog-manifest.generated.ts`: generated file, do not edit by hand
- `public/fumadocs-style.css`: generated stylesheet synced from `fumadocs-ui`
- `public/starter`: local demo assets used by marketing and demo pages
- `.asset-sources/starter-demo`: source stills used to generate local demo videos

## Daily Commands

```bash
pnpm dev
pnpm dev:webpack
pnpm lint
pnpm test
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
pnpm admin:setup
pnpm generate:blog-manifest
```

Notes:

- `pnpm dev` runs `scripts/run-dev.mjs`, which launches Next dev with a cleaned environment and syncs the Fumadocs stylesheet first. It does not regenerate the blog manifest.
- `pnpm dev:webpack` is the safe fallback if Turbopack is too heavy on the current machine.
- `pnpm build` runs both `sync:fumadocs-style` and `generate:blog-manifest` before building.
- If you add, rename, or remove blog posts, regenerate the blog manifest before committing.

## Environment Variables

Use `.env.example` as the source of truth for required names.

The important groups are:

- Database: `DATABASE_URL`
- Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Optional Google auth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- AI: `VOLCANO_ENGINE_API_KEY`, `VOLCANO_ENGINE_API_URL`
- Payments: `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`
- Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- App URL: `NEXT_PUBLIC_APP_URL`
- Cron auth: `CRON_SECRET` or `CRON_JOBS_USERNAME` + `CRON_JOBS_PASSWORD`
- Storage: `STORAGE_*`

## Core Product Invariants

### 1. Auth and signup

- Better Auth is configured in `lib/auth.ts`.
- New signups receive a 300 credit registration bonus in the auth hook.
- If you change signup behavior, preserve the registration bonus flow unless the product decision explicitly changes it.
- Google OAuth is optional now. It is enabled only when both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are present.
- The login and signup forms should stay in sync with the server config: if the provider is disabled, the Google button should not render.

### 2. Credits and ledger integrity

- `user.credits` is the fast balance.
- `credit_ledger` is the audit trail.
- Any credit mutation should update both, ideally in one transaction.
- Chat currently costs 10 credits, image generation 20 credits, and video generation 50 credits.
- Paid AI routes use `createCreditCompensation(...)` to refund credits if provider work fails after deduction. Preserve that pattern.

### 3. Billing and subscriptions

- Plan keys and pack keys only come from `constants/billing.ts`.
- Creem webhook processing lives in `app/api/payments/creem/webhook/route.ts`.
- Annual plans use `subscription_credit_schedule` installments and are granted by `app/api/cron/subscription-grants/route.ts`.
- If you touch subscription logic, keep these records aligned:
  `user.planKey`, `payment`, `subscription`, `credit_ledger`, and `subscription_credit_schedule`.
- The admin subscription mutation endpoint is intentionally simple right now and only updates `user.planKey`. Do not assume that is sufficient for a real subscription migration.

### 4. AI generation flows

- Chat route: `app/api/chat/route.ts`
- Image route: `app/api/image/generate/route.ts`
- Video route: `app/api/video/generate/route.ts`
- Video status route: `app/api/video/status/route.ts`

Important behavior:

- Image generation is currently image-to-image only. The route requires both `prompt` and `imageUrl`.
- Video generation supports prompt-only or image-to-video input.
- Generation history is persisted in `generation_history`.
- If provider output is mirrored into R2 and that upload fails, the code often falls back to the provider URL instead of hard-failing.

### 5. Upload and storage behavior

- User uploads enter through `app/api/upload/image/route.ts`.
- Provider-generated media mirroring uses `lib/r2-storage.ts`.
- If storage is not configured:
  - upload route may return a data URL for testing
  - provider result mirroring may return the original provider URL
- Be careful when changing this behavior because demos and tests rely on graceful fallbacks.

### 6. i18n

- Locales are defined in `i18n.config.ts`.
- Locale routing is handled by `proxy.ts`.
- Translation loading is in `lib/i18n.ts`.
- The app URL strategy is `as-needed`, so default-locale routes use `/docs`, `/pricing`, etc. rather than `/en/...`.
- When changing user-facing copy, update both English and Chinese unless the task explicitly says otherwise.
- If you change SEO copy, update `messages/seo.en.json` and `messages/seo.zh.json` too.

### 7. Docs site

- The product ships an integrated docs site at `/docs` and `/zh/docs`.
- Docs content lives in `content/docs/**/*.mdx`.
- Docs routing and rendering live in `app/[locale]/docs/*`.
- `lib/source.ts` reads from generated `.source/*` output created by `fumadocs-mdx`.
- `public/fumadocs-style.css` is generated. Do not hand-edit it; update the sync script or upstream dependency instead.

## Current Known Gotchas

- Some API routes still emit known dynamic server usage warnings during `pnpm build`, especially:
  - `/api/auth/verify-email`
  - `/api/auth/verify-reset-token`
  - `/api/newsletter/unsubscribe`
  - `/api/user/admin-status`
  - `/api/user/credits/history`
- If you touch routes that read `request.url`, `headers`, cookies, or auth state, consider explicitly marking them dynamic.
- `app/api/upload/simple/route.ts` is demo-oriented and not the main production upload path.
- Demo assets were intentionally localized into `public/starter`. Do not switch them back to `offerget` or other third-party runtime URLs.
- Fumadocs ships Tailwind v4-oriented CSS, so the repo deliberately syncs that stylesheet into `public/` and loads it via `<link>` to avoid Tailwind v3/PostCSS conflicts.
- Turbopack can still feel heavy on some macOS setups. Prefer `pnpm dev:webpack` if local development becomes sluggish.

## Testing Expectations

Run the smallest useful set, but do verify your changes:

- `pnpm lint`:
  run for any UI, route, config, or translation change
- `pnpm test`:
  run for logic changes in billing, auth, credits, email, sessions, or utilities
- `pnpm build`:
  run when touching routing, middleware, auth, next config, env-sensitive code, or server routes

Current test coverage is concentrated in:

- `tests/components/*`
- `tests/constants/*`
- `tests/lib/*`

If you change billing, email, auth, or credit logic, add or update tests in `tests/lib`.

## Contributor Advice By Area

### Marketing and docs

- Keep README, `AGENTS.md`, and `.env.example` aligned with the actual code.
- Use real repo paths in docs. Do not reference missing files or imaginary folders.
- If you update product positioning, double-check marketing copy in both locales.

### Admin features

- Treat admin mutations as high-risk.
- Changing a user balance is not the same thing as changing the ledger.
- Changing a plan label is not the same thing as changing a subscription state.

### Billing

- Never invent plan keys.
- Never grant credits outside the ledger path unless you are intentionally repairing historical data.
- Preserve webhook idempotency.

### Generated content and assets

- Blog MDX is source content.
- `lib/blog-manifest.generated.ts` is derived output.
- `public/starter` contains committed local demo assets.
- `.asset-sources/starter-demo` contains source stills for the committed local demo videos.

## Preferred Change Style

- Make the smallest change that preserves product truth.
- Favor explicit invariants over convenience.
- If a route has environment-dependent fallbacks, document that behavior in code comments when you change it.
- If you discover a mismatch between UI copy, README, and code, fix the mismatch rather than leaving "TODO" drift behind.

## Before You Finish

Before wrapping a task, check:

1. Did you keep credits, billing, and subscription state internally consistent?
2. Did you update both locales if user-facing copy changed?
3. Did you avoid reintroducing external runtime demo assets?
4. Did you run the right validation commands for the area you touched?
5. Did you leave generated files and docs in sync with the codebase?


---

## Project Override: Can I Eat This? China

This repository is being adapted into **Can I Eat This? China**, a mobile-first Chinese menu dietary risk assistant for foreign travelers in China.

When the original Sistine starter rules conflict with this project SPEC, follow:

- `docs/SPEC_SISTINE.md`
- `docs/SPEC_SISTINE_CN.md`

The SPEC files are the source of truth for this product.

## Product Positioning

Can I Eat This? China helps users:

- set a Food Profile
- upload Chinese menu photos or QR ordering screenshots
- identify hidden ingredients and dietary risks
- group dishes into Better / Ask / Avoid / Unknown
- generate Chinese Ask Staff confirmation cards

This product is **not** a full menu translator.

## Core Product Rules

- Guest first.
- Do not force login for MVP core usage.
- Better Auth can remain, but login must be optional in MVP.
- Use Guest + Recovery Code.
- Use pass-based scan credits for this product.
- Do not rely on Sistine default user credits as the primary access system for menu scanning.
- Use one-time Passes only.
- No subscription.
- No auto-renewal.
- No lifetime plan.
- Do not require Google login.
- Do not require email verification during the restaurant usage flow.

## Scan Input Rules

- One scan supports up to 3 images.
- Supported inputs:
  - paper menu photo
  - menu book photo
  - restaurant wall menu photo
  - WeChat QR ordering screenshot
  - Alipay QR ordering screenshot
  - H5 ordering page screenshot
  - long screenshot
  - dish page screenshot

The product supports screenshots from QR ordering pages.

The product does **not** directly scan restaurant QR codes, parse restaurant QR codes, or crawl restaurant ordering systems.

## AI Rules

- Use Qwen-VL Flash for menu image triage.
- Do not use Sistine default Volcano Engine / Doubao AI modules for menu scanning unless explicitly instructed.
- Add a dedicated Qwen module for this product.
- Stage 1 must only do menu triage:
  - extract visible Chinese dish names
  - deduplicate dishes
  - classify dishes into Better / Ask / Avoid / Unknown
  - return one-line reason
  - return 1–3 risk tags
- Stage 1 must not generate long dish explanations.
- Stage 1 must not fully translate the menu.
- Stage 1 must not generate Ask Staff cards.
- Stage 2 dish deep analysis should only run when the user taps a dish.
- Ask Staff cards should only be generated when requested.

## Food Safety Wording Rules

Never say:

- safe to eat
- allergy-free
- guaranteed gluten-free
- this dish is halal
- this dish is vegan
- this dish is safe for celiac users

Use cautious wording:

- likely lower risk
- may contain
- likely contains
- ask staff before ordering
- avoid if severe allergy
- halal status cannot be guaranteed without restaurant certification
- cross-contamination may still be possible

Result pages must include the required disclaimer from the SPEC.

## Payment Rules

Use Creem, but adapt it to this product’s one-time Pass model.

Plans:

- 7-Day China Food Pass — $9.90 — 100 scan credits
- 30-Day China Food Pass — $29.90 — 300 scan credits
- Annual China Food Pass — $69.90 — 1000 scan credits

Payment success must create a pass, not a subscription.

Payment success must:

- create pass
- set starts_at and expires_at
- set total_scan_credits
- generate recovery_code
- store recovery_code_hash
- generate device-specific pass_token
- store pass_token_hash in pass_devices

Do not require user_id for Pass purchase.

## Database Rules

Implement this product’s tables in the existing Drizzle schema.

Required tables:

- passes
- pass_devices
- guest_usage
- scan_results
- ai_usage_logs

Optional later:

- scan_credit_ledger
- dish_knowledge
- dish_aliases

Do not use Supabase assumptions.

## Development Workflow

- Plan before coding.
- Do not implement the whole SPEC at once.
- First output a Sistine adaptation plan.
- Work in small P0 / P1 / P2 / P3 phases.
- After each implementation step, list changed files and explain what changed.
- Do not modify unrelated Sistine modules unless necessary.
- If modifying user-facing copy, update both English and Chinese locales when relevant.
- If touching billing, credits, auth, database schema, or webhook logic, treat it as high risk and explain the consistency impact.