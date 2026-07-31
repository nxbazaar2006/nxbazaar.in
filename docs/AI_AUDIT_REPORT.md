# Nxbazaar.in AI Audit Report

Date: 2026-07-25

## Task 1 Update - 2026-07-25

This report was rechecked against the current repository state after Auth.js v5 and AI MVP verification work. Earlier statements that AI routes were missing or that live auth used `authOptions`/`withAuth` are now stale.

- Auth now uses Auth.js v5 structure: root `auth.ts`, exported `handlers`, `auth`, `signIn`, and `signOut`.
- Declared and installed `next-auth` version is `5.0.0-beta.32`; `@auth/prisma-adapter` is used.
- Live code no longer references `getServerSession(authOptions)`, `withAuth`, `next-auth/middleware`, `NEXTAUTH_SECRET`, or `@next-auth/prisma-adapter`.
- Prisma schema now includes Auth.js adapter models `Account`, `Session`, and `VerificationToken`; `User.password` is nullable for OAuth accounts.
- Credentials login now normalizes email, uses bcrypt comparison, rejects missing password records, rejects inactive accounts, and rejects unverified `ADMIN`, `MODERATOR`, `SELLER`, and `FARMER` accounts. Current active `USER` verification behavior is preserved.
- AI MVP routes now exist for shopping assistant, product search, product generation, admin insights, seller assistant, and feedback.
- `product-generate` validates generated draft JSON and does not create/update `Product` records.
- `feedback` validates conversation/message ownership when IDs are supplied.
- `admin-insights` allows `ADMIN` and `MODERATOR`; `seller-assistant` scopes data to `session.user.id`.
- `NewProductForm` now has draft-only AI generation with editable preview, Apply Draft, Discard Draft, tags/attributes editing, and HSN/GST manual-review warning. Applying an AI draft forces `isActive=false`.

Remaining AI gaps after Task 1: customer support assistant, review summary endpoint, category suggestion endpoint, streaming responses, Redis/shared rate limiting, and browser E2E coverage.

## Scope

This audit covers the current Nxbazaar.in codebase before implementing production AI features. It reviewed repository structure, Prisma schema, authentication, role guards, dashboards, products, orders, categories, search, support, and existing AI-related artifacts.

## Executive Summary

Nxbazaar.in is not ready for production AI support yet. The ecommerce foundation is present: Next.js App Router, Prisma/PostgreSQL, Auth.js, role-aware dashboard routing, product/category/HSN relations, order snapshots, GST calculations, inventory updates, translations, and some audit/analytics tables.

The AI layer was mostly missing at audit start. There were no live AI chat/search/generation route handlers in the filesystem, no AI UI components, and no full-text search implementation. Existing AI traces were limited to product AI metadata and analytics/request-log style models. Phase 1 foundation now adds server-only AI provider/safety/rate-limit/validator modules and additive AI persistence models, but user-facing AI features are still not enabled.

No destructive change was performed during this audit. After the audit, Phase 1 foundation implementation was completed as an additive change.

## Current Condition

### Repository And Stack

- `package.json` uses Next.js 16, React 19, TypeScript, Prisma 7, PostgreSQL adapter, Auth.js/NextAuth v5, Tailwind CSS v4, Redux Toolkit, React Hook Form, Zod, Chart.js, BullMQ, Redis, and pnpm.
- Scripts available: `dev`, `build`, `lint`, `typecheck`, `test`, Redis helpers, translation worker scripts, and `postinstall`.
- `AGENTS.md` was requested but is not present at repository root.

Evidence:

- `package.json` scripts and dependencies.
- Root scan includes `app`, `components`, `lib`, `prisma`, `redux`, `tests`, `workers`, `docs`.

### Authentication And Roles

Auth.js is configured with credentials auth, Google auth, Prisma adapter, JWT sessions, and role/status propagation into session.

Evidence:

- `auth.ts` exports `handlers`, `auth`, `signIn`, and `signOut`.
- `auth.ts` uses `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET`.
- `lib/auth-credentials.ts` normalizes email, loads users by email, and verifies password with bcrypt.
- `lib/auth-policy.ts` rejects inactive accounts and unverified privileged accounts.
- `auth.ts` copies `id`, `email`, `role`, `status`, and `emailVerified` into session/JWT.

Role access exists for dashboards.

Evidence:

- `proxy.ts` exports the Auth.js v5 proxy function from `auth.ts`.
- `auth.ts` protects `/admin`, `/seller`, `/dashboard`, `/account`, and `/checkout`.
- `auth.ts` delegates dashboard access decisions to `canAccessDashboardPath`.
- `lib/security.ts:132` allows admin/moderator full dashboard access.
- `lib/security.ts:139` scopes `USER` dashboard prefixes.
- `lib/security.ts:140` scopes `SELLER` and `FARMER` dashboard prefixes.

### Product, Category, HSN, And Search

Product relations are suitable for AI product retrieval, but search remains keyword-based and does not use PostgreSQL full-text search.

Evidence:

- `prisma/schema.prisma:307` defines `Product`.
- `prisma/schema.prisma:328` stores `categoryId`.
- `prisma/schema.prisma:330` stores `subCategoryId`.
- `prisma/schema.prisma:332` stores `hsnCodeId`.
- `prisma/schema.prisma:375` defines product translations.
- `prisma/schema.prisma:521` and `prisma/schema.prisma:555` define product attributes and variants.
- `app/api/search/route.tsx:35` uses `findMany` with `contains`.
- `app/api/products/search/route.tsx:12` builds `OR` filters using `contains`.
- `app/api/products/search/route.tsx:48` includes active variants.

### Orders, Inventory, And Seller Isolation

Order creation uses a transaction and snapshots price, HSN, GST, commission, seller payable, and inventory stock. Customer order fetch derives authorization from session.

Evidence:

- `app/api/orders/route.tsx:14` validates checkout payload with Zod.
- `app/api/orders/route.tsx:40` checks authenticated session.
- `app/api/orders/route.tsx:124` creates order in a Prisma transaction.
- `app/api/orders/route.tsx:168` and `app/api/orders/route.tsx:236` decrement stock with `updateMany` stock guards.
- `app/api/orders/route.tsx:217` stores `hsnCode`.
- `app/api/orders/route.tsx:227` stores GST amounts.
- `app/api/orders/user/[id]/route.tsx:10` loads session.
- `app/api/orders/user/[id]/route.tsx:12` checks `canAccessUserResource`.

Seller dashboard isolation is not consistently server-side. Some pages fetch broad datasets and filter in the component.

Evidence:

- `app/(back-office)/dashboard/vendor/orders/page.tsx:18` fetches all sales via `getData("sales")`.
- `app/(back-office)/dashboard/vendor/orders/page.tsx:25` filters seller sales after fetch.

AI seller assistant endpoints must not reuse broad client/page filtering patterns.

### Customer Support

Support is static and does not access authenticated order data.

Evidence:

- `app/(front-end)/support/page.tsx:1` renders `Support`.
- `components/frontend/Support.tsx:15` renders static support cards.
- `components/frontend/Support.tsx:67` renders a keyword search form placeholder.

### Existing AI Artifacts

Some AI-adjacent database structures exist, but requested AI architecture is not present.

Evidence:

- `prisma/schema.prisma:346` has `Product.aiGenerated`.
- `prisma/schema.prisma:347` has `Product.aiConfidence`.
- `prisma/schema.prisma:348` has `Product.aiMetadata`.
- `prisma/schema.prisma:1287` defines `AIRequestLog`.
- `prisma/schema.prisma:1322` defines `SearchHistory`.
- `prisma/schema.prisma:1338` defines `ProductRecommendation`.
- `prisma/migrations/20260717103000_add_ai_foundation/migration.sql` creates `AIRequestLog`, `ProductView`, `SearchHistory`, and `ProductRecommendation`.
- `app/api/ai/product-generate/route.ts` is present.
- `app/api/ai/product-search/route.ts` is present.
- `app/api/ai/shopping-assistant/route.ts` is present.
- `app/api/ai/admin-insights/route.ts` is present.
- `app/api/ai/seller-assistant/route.ts` is present.
- `app/api/ai/feedback/route.ts` is present.
- `app/api/ai/support-chat/route.ts` is still not present.

## Confirmed Problems To Fix Before AI Feature Build

### AI-001: Missing Provider Abstraction

Severity: High

Status: Fixed in Phase 1 foundation.

The requested files `lib/ai/provider.ts`, `lib/ai/prompts.ts`, `lib/ai/types.ts`, `lib/ai/validators.ts`, `lib/ai/rate-limit.ts`, and `lib/ai/safety.ts` were absent at audit start.

Business impact: AI endpoints would either duplicate provider logic or risk exposing provider details and secrets.

Recommended fix: Add a server-only provider abstraction with typed request/response contracts, safety checks, model config, logging, and disabled-mode fallbacks.

### AI-002: Missing AI Persistence Models

Severity: High

Status: Fixed in Phase 1 foundation.

Requested models were absent at audit start: `AiConversation`, `AiMessage`, `AiUsage`, `AiGeneration`, `AiFeedback`, `ProductSearchLog`, and `AiInsight`.

Business impact: No reliable AI audit history, usage accounting, feedback loop, conversation continuity, or search analytics.

Recommended fix: Add additive Prisma models and migration. Do not delete or rename existing `AIRequestLog`/`SearchHistory` until compatibility is planned.

### AI-003: Search Is Not Production-Ready For Natural Language

Severity: High

Search endpoints use `contains` filters and do not parse budget/category/color/size/brand/rating/stock availability into safe Prisma filters.

Business impact: AI shopping assistant cannot reliably answer product discovery queries without inventing or over-fetching.

Recommended fix: Build deterministic filter extraction first, PostgreSQL full-text search second, and leave extension points for pgvector later.

### AI-004: Missing AI Route Authorization Surface

Severity: High

AI MVP endpoints now exist for shopping, product search, product generation, seller assistant, admin insights, and feedback. Customer-support, review-summary, and category-suggestion endpoints remain absent.

Business impact: New AI features could accidentally leak seller/customer/admin data if built without strict guards.

Recommended fix: Create endpoint-specific guards that derive `userId`/`sellerId` only from the server session.

### AI-005: AI Logs Must Avoid Secrets And PII

Severity: High

Existing `AIRequestLog` supports metadata and error messages but there is no redaction utility or AI-specific logging policy.

Business impact: Prompts may include phone, email, address, order details, payment status, or provider errors.

Recommended fix: Add redaction/masking in `lib/ai/safety.ts` and store hashed prompt fingerprints plus safe metadata only.

### AI-006: Seller Dashboard Patterns Need Server-Side Scoping Before AI Reuse

Severity: Medium

Seller order page fetches all sales then filters by seller in the page.

Business impact: AI seller assistant must not be built on broad fetches that could leak cross-seller data.

Recommended fix: Build dedicated seller-scoped aggregation functions where `sellerId` comes from the session.

### AI-007: pnpm Runner Fails In Current Environment

Severity: Medium

`pnpm typecheck` failed with `unable to open database file`, while direct `tsc --noEmit` passed.

Business impact: CI/local parity is unclear until pnpm store/config issue is fixed.

Recommended fix: Fix pnpm store/database access before relying on `pnpm` verification in this workspace.

## Security Risks

- AI prompt injection could ask the assistant to ignore database-only constraints.
- Product assistant could hallucinate product, price, stock, GST, delivery, refund, or seller information if not grounded strictly in Prisma data.
- Customer support AI could leak another user’s order if order queries accept client-provided `userId`.
- Seller assistant could leak competitor data if analytics are not scoped by session seller ID.
- Admin insights may expose sensitive financial or seller performance data if dashboard role checks are incomplete.
- AI request logs can accidentally store addresses, phone numbers, emails, payment details, tokens, or raw provider errors.
- Rate limiting currently exists in `lib/security.ts`, but production AI should use a dedicated AI limiter backed by Redis when available.
- API keys must remain server-only; no AI provider code should be imported by client components.

## Files To Create

Core AI:

- `lib/ai/provider.ts`
- `lib/ai/prompts.ts`
- `lib/ai/types.ts`
- `lib/ai/validators.ts`
- `lib/ai/rate-limit.ts`
- `lib/ai/safety.ts`
- `lib/ai/product-search.ts`
- `lib/ai/audit-log.ts`
- `lib/ai/insights.ts`

API routes:

- `app/api/ai/shopping-assistant/route.ts`
- `app/api/ai/product-search/route.ts`
- `app/api/ai/product-generate/route.ts`
- `app/api/ai/category-suggestions/route.ts`
- `app/api/ai/review-summary/route.ts`
- `app/api/ai/support-chat/route.ts`
- `app/api/ai/admin-insights/route.ts`
- `app/api/ai/seller-assistant/route.ts`
- `app/api/ai/feedback/route.ts`

UI components:

- `components/ai/AiChatButton.tsx`
- `components/ai/AiChatPanel.tsx`
- `components/ai/AiMessageBubble.tsx`
- `components/ai/AiProductCard.tsx`
- `components/ai/AiSearchBar.tsx`
- `components/ai/AiGenerateButton.tsx`
- `components/ai/AiContentPreview.tsx`
- `components/ai/AiInsightCard.tsx`
- `components/ai/AiFeedbackButtons.tsx`

Tests:

- `tests/ai-provider.test.ts`
- `tests/ai-safety.test.ts`
- `tests/ai-product-search.test.ts`
- `tests/ai-authz.test.ts`
- `tests/ai-support-scope.test.ts`

Docs:

- `docs/AI_ARCHITECTURE.md`
- `docs/AI_SECURITY.md`
- `docs/AI_SETUP_GUIDE.md`
- `docs/AI_TEST_REPORT.md`

## Files To Modify

- `.env.example`: add `AI_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_ENABLED`; do not touch `.env`.
- `prisma/schema.prisma`: add AI persistence models and indexes.
- `app/layout.tsx` or front-end layout: mount floating shopping assistant client shell only if `AI_ENABLED`.
- `components/backoffice/NewProductForm.tsx`: add AI generate button and editable preview.
- `app/(back-office)/dashboard/page.tsx`: add admin AI insights section for admins only.
- `components/backoffice/FarmerDashboard.tsx`: add seller AI assistant entry point for seller/farmer roles.
- Search UI/API surfaces: add `AiSearchBar` and route fallback to normal search when AI is disabled.
- Product detail page: add review summary if approved reviews exist.

## Database Changes

All changes should be additive and non-destructive.

Proposed models:

- `AiConversation`: conversation owner, role scope, feature, status, metadata, timestamps.
- `AiMessage`: conversation messages with role, redacted content, citations/product refs, token counts.
- `AiUsage`: per-request provider/model/token/latency/status usage.
- `AiGeneration`: draft product/SEO/translation generation with review status and actor.
- `AiFeedback`: thumbs up/down and reason for AI responses.
- `ProductSearchLog`: normalized query, extracted filters, result count, zero-result marker, language, user/session.
- `AiInsight`: admin/seller insight snapshots from database aggregations.

Migration risk:

- Low if additive only.
- Moderate if introducing PostgreSQL full-text generated columns or GIN indexes on large product tables; use concurrent/manual SQL where needed in production.
- No existing data should be deleted or reset.

Rollback plan:

- First rollback AI code paths by `AI_ENABLED=false`.
- Then drop new AI-only tables/indexes only after exporting logs if needed.
- Do not roll back product/order/category schema.

## Implementation Phases

### P0: Foundation And Safety

- Add env example keys.
- Add `lib/ai` provider abstraction, validators, safety, rate limit, and audit logging.
- Add additive Prisma models and migration.
- Add tests for provider disabled mode, safety redaction, prompt-injection blocking, rate limits, and role guards.

### P1: Marketplace MVP AI

- Semantic product search with deterministic filters and PostgreSQL full-text search.
- Shopping assistant grounded only in product database query results.
- Product description generator with editable preview and no auto-save.
- Category/attribute suggestions with manual HSN review when mapping is uncertain.

### P2: Operations And Growth

- Customer support assistant using session-scoped order data.
- Admin AI insights from database aggregations.
- Seller AI assistant with session-scoped product/order/review analytics.
- Product review summary with approved review count.

### P3: Future Enhancements

- pgvector embeddings.
- Personalized recommendations from view/search/purchase history.
- Streaming token usage dashboards.
- Multimodal product image analysis, only after file safety controls are mature.

## First Safe Implementation Step

Completed as Phase 1 foundation:

1. Add server-only AI config, provider, types, validators, safety, rate-limit, and audit-log modules.
2. Add `.env.example` AI keys without editing `.env`.
3. Add additive Prisma models and migration.
4. Add tests for disabled mode, redaction, prompt-injection checks, role checks, and rate limiting.

Do not build UI chat or generation flows before this foundation is in place.

## Phase 1 Foundation Implemented

- Added `.env.example` AI keys: `AI_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, and `AI_ENABLED`.
- Added `lib/ai/provider.ts`, `lib/ai/prompts.ts`, `lib/ai/types.ts`, `lib/ai/validators.ts`, `lib/ai/rate-limit.ts`, `lib/ai/safety.ts`, and `lib/ai/audit-log.ts`.
- Added additive Prisma models and migration `20260725120000_add_ai_production_foundation`.
- Added `tests/ai-foundation.test.ts`.
- No AI UI, chat, generation route, semantic search route, admin insights route, or seller assistant route was enabled in this phase.

## AI MVP Implemented After Foundation

- Added product-grounded AI shopping assistant route and floating storefront chat panel.
- Added semantic product-search route with deterministic budget/colour/size/stock filter extraction and `ProductSearchLog` writes.
- Added admin/seller/farmer product generation route that returns an editable draft and stores an AI generation audit draft without saving to `Product`.
- Added admin-only insights endpoint using database aggregations.
- Added seller/farmer assistant endpoint scoped to `session.user.id`.
- Added feedback endpoint and reusable AI UI components under `components/ai`.

## Verification Snapshot

- `pnpm typecheck`: failed with `unable to open database file`.
- `node_modules\\.bin\\tsc.cmd --noEmit`: passed.
- `node_modules\\.bin\\prisma.cmd validate`: passed.
- `node_modules\\.bin\\eslint.cmd .`: passed.
- `node --import tsx --test tests/*.test.ts`: passed, 22 tests.
- `node_modules\\.bin\\next.cmd build`: passed.
