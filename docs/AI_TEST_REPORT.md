# Nxbazaar.in AI Test Report

Date: 2026-07-25

## Task 1 Verification Update - 2026-07-25

### pnpm Commands

All requested pnpm commands still fail before project scripts run:

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm typecheck` | Failed | `unable to open database file` |
| `pnpm lint` | Failed | `unable to open database file` |
| `pnpm test` | Failed | `unable to open database file` |
| `pnpm build` | Failed | `unable to open database file` |
| `pnpm exec prisma validate` | Failed | `unable to open database file` |

Root cause evidence: `pnpm store path` resolves to `C:\pnpm-store\v11`, and a write test to `C:\pnpm-store` failed with `EPERM`. The failure occurs before TypeScript, ESLint, Prisma, tests, or Next.js run.

### Direct Fallback Commands

| Command | Result |
| --- | --- |
| `node_modules\\.bin\\tsc.cmd --noEmit` | Passed |
| `node_modules\\.bin\\eslint.cmd .` | Passed |
| `node_modules\\.bin\\prisma.cmd validate` | Passed |
| `node_modules\\.bin\\prisma.cmd generate` | Passed |
| `node_modules\\.bin\\next.cmd build` | Passed |
| `npm test -- --test-reporter=spec` | Passed, 37 tests |

### Task 1 Tests Added

- Credentials auth: unknown email, wrong password, inactive account, unverified seller, verified active seller, active user policy, and session field propagation.
- AI MVP: admin/moderator insights authorization, seller isolation, feedback ownership, AI disabled fallback, product draft not saving `Product`, malformed AI draft validation, and HSN/GST manual-review warning.

## Commands Run During Audit, Phase 1 Foundation, And AI MVP

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm typecheck` | Failed | `unable to open database file`; pnpm runner did not reach TypeScript diagnostics. |
| `node_modules\\.bin\\tsc.cmd --noEmit` | Passed | Direct TypeScript compiler completed successfully. |
| `node_modules\\.bin\\prisma.cmd validate` | Passed | Prisma schema is valid. |
| `node_modules\\.bin\\eslint.cmd .` | Passed | No lint errors after AI foundation files were added. |
| `node --import tsx --test tests/ai-foundation.test.ts` | Passed | 7 focused AI foundation tests passed. |
| `node --import tsx --test tests/*.test.ts` | Passed | 22 total tests passed across AI, ecommerce, and security suites. |
| `node_modules\\.bin\\next.cmd build` | Passed | Production build completed successfully. |

Latest run after AI MVP routes/components:

- `node_modules\\.bin\\tsc.cmd --noEmit`: passed.
- `node_modules\\.bin\\eslint.cmd .`: passed.
- `node --import tsx --test tests/*.test.ts`: passed, 22 tests.
- `node_modules\\.bin\\next.cmd build`: passed, 75 app routes including 6 AI routes.

## AI Foundation Tests Added

- AI config reads server-side environment flags.
- AI provider fails closed when disabled.
- AI request validation rejects unsupported features.
- Product search filters validate budget and attributes.
- Prompt-injection attempts are blocked before provider calls.
- Redaction masks sensitive values and hashes input deterministically.
- AI rate limits are feature-scoped.

## Required AI Tests Still To Add

- Provider adapter validates JSON output and rejects malformed provider responses.
- Product search filter parser extracts category, price, color, size, brand, tags, rating, and stock availability.
- Route-level tests for shopping assistant product grounding.
- Route-level tests that product generator returns draft content only and never auto-saves product records.
- Category/attribute suggestions mark HSN as manual review if no existing mapping matches.
- Support assistant can access only the authenticated customer's orders.
- Seller assistant can access only session seller products/orders/sales.
- Admin insights endpoint rejects non-admin users.

## Current Test Gap

AI foundation tests exist. Feature-level route, UI, streaming, seller-scope, customer-support order-scope, admin-insight aggregation, and PostgreSQL full-text search tests still need to be added with the next implementation phases.
