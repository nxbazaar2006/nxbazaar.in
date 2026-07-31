# Priority Roadmap

## P0 - Immediate Security and Data Integrity

1. Protect public mutation and list API routes with centralized auth/role/scope wrappers.
2. Fix password reset and email verification token validation immediately.
3. Derive checkout userId from the authenticated session and validate checkout payloads server-side.
4. Make stock decrement atomic and move checkout to seller-wise Inventory as source of truth.
5. Persist order, seller-order and invoice GST totals from immutable item tax snapshots.

## P1 - Deployment and Quality Gates

1. Self-host fonts so production builds do not require Google Fonts network access.
2. Remove typescript.ignoreBuildErrors and enforce typecheck/build in CI.
3. Add full Zod schemas for products, checkout, auth and admin CRUD APIs.
4. Add pnpm test with coverage for auth, checkout, tax, inventory and seller isolation.

## P2 - Marketplace Completion

1. Add payment provider webhook, refund, return and reconciliation workflows.
2. Complete localized storefront routes and metadata.
3. Add audit-log dashboards and immutable history views.
4. Consolidate overlapping UI and carousel dependencies after usage analysis.

## Severity Counts

- Critical: 6
- High: 10
- Medium: 15
- Low: 4
- Info: 2


## Build Fix Verification - 2026-07-25

Fixed findings:

- NX-HIGH-007: Fixed by removing the app/layout.tsx dependency on next/font/google, eliminating the restricted-network Google Fonts build failure.
- NX-HIGH-008: Fixed by removing typescript.ignoreBuildErrors from next.config.ts, restoring TypeScript enforcement during Next.js production builds.

Verification commands:

- node_modules\.bin\eslint.cmd .: passed
- node_modules\.bin\tsc.cmd --noEmit: passed
- node_modules\.bin\prisma.cmd validate: passed
- node_modules\.bin\next.cmd build: passed


## Security Fix Verification - 2026-07-25

Fixed Critical/High auth/security findings: NX-CRIT-001, NX-CRIT-002, NX-CRIT-003, NX-CRIT-004, NX-CRIT-005, NX-CRIT-006, NX-HIGH-001, NX-HIGH-002, NX-HIGH-003, NX-HIGH-009.

Verification commands all passed:

- node_modules\.bin\eslint.cmd .
- node_modules\.bin\tsc.cmd --noEmit
- node_modules\.bin\prisma.cmd validate
- npm test -- --test-reporter=spec
- node_modules\.bin\next.cmd build

Remaining Critical/High findings outside this request scope: inventory concurrency, seller-wise inventory source of truth, GST/order totals, and missing payment/refund workflow.

## Ecommerce Fix Verification - 2026-07-25

Fixed in this pass:

- NX-HIGH-004: Atomic checkout stock decrement added with conditional `updateMany` guards.
- NX-HIGH-006: Order GST totals and seller settlement totals are now persisted from item snapshots.

Partially fixed in this pass:

- NX-HIGH-005: Checkout now updates seller-wise `Inventory`, but full Inventory source-of-truth enforcement still needs a PostgreSQL partial unique index for simple-product rows after duplicate-data preflight.

No migration was created. Proposed migration plan for the remaining Inventory uniqueness gap: report duplicate `Inventory` rows where `productVariantId IS NULL`, merge or block duplicates, add a partial unique index on `(productId, sellerId) WHERE productVariantId IS NULL`, and roll back by dropping that index.

Verification commands all passed:

- `npm test -- --test-reporter=spec`
- `node_modules\.bin\eslint.cmd .`
- `node_modules\.bin\tsc.cmd --noEmit`
