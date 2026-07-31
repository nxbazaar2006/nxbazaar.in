# Critical/High Remediation Plan

Review date: 2026-07-25

All 16 Critical/High findings in audit-findings.json were re-opened against source code and marked Confirmed. No application source files were modified.

## Recommended Fix Order

1. Account takeover fixes: NX-CRIT-004, NX-CRIT-003.
2. Public data exposure fixes: NX-CRIT-002, NX-CRIT-005, NX-HIGH-003.
3. Public mutation fixes: NX-CRIT-001, NX-HIGH-001, NX-HIGH-009.
4. Checkout identity and ownership: NX-CRIT-006.
5. Inventory and order financial correctness: NX-HIGH-004, NX-HIGH-005, NX-HIGH-006.
6. Dashboard role authorization: NX-HIGH-002.
7. Deployment gates: NX-HIGH-007, NX-HIGH-008.
8. Payment/refund production workflow: NX-HIGH-010.

## Dependencies Between Fixes

- Central auth helpers should be built before route-by-route API fixes so every handler returns consistent 401/403 responses.
- Password reset and email verification need token schema/expiry decisions before UI and email templates are updated.
- Checkout identity must be fixed before payment webhooks and refund flows trust Order.userId.
- Seller-wise Inventory source-of-truth work should precede concurrency fixes, otherwise atomic updates may be implemented against soon-to-be-deprecated stock columns.
- GST aggregate persistence depends on finalized checkout quote logic and seller order split rules.
- Dashboard role middleware depends on a documented ADMIN/SELLER/USER route matrix.

## Database Migration Risks

- Password reset and verification hardening may require new fields such as hashed reset token, reset token expiry, verification token expiry and consumed timestamps. Existing tokens need invalidation or migration.
- Inventory source-of-truth work may require backfilling Inventory rows from Product.productStock and ProductVariant.stock. Double-writing during migration can create drift if not carefully sequenced.
- Order totals may need a backfill for historical orders from OrderItem snapshots; historical records with missing tax snapshots may need a manual reconciliation state.
- Payment/refund implementation may require new Refund, PaymentEvent/WebhookEvent, idempotency key and transaction tables.
- Adding unique constraints for order numbers, payment provider references or inventory records can fail if current data has duplicates.

## Regression Risks

- Stricter auth can break dashboard pages and forms that currently call APIs without credentials or role context.
- Seller scoping can hide data from admins or support users if role exceptions are incomplete.
- Checkout identity changes can break guest checkout assumptions if guest checkout is a planned feature.
- Inventory migration can cause stock mismatches, oversell prevention false negatives, or hidden products if stock rows are missing.
- GST total fixes can change invoice totals and require accounting reconciliation for existing orders.
- Removing Google Fonts or TypeScript build suppression can reveal unrelated build issues that were previously masked.

## Required Tests

- Auth/API tests: unauthenticated, USER, SELLER and ADMIN access for users, orders, sales, catalog, staff, HSN and upload routes.
- Account tests: reset password requires valid unexpired token, token is single-use, verify email requires matching token.
- Seller isolation tests: Seller A cannot read/update Seller B sales, products, orders, inventory or uploads.
- Checkout tests: session user owns created order; body userId mismatch fails; order totals equal item tax snapshots.
- Inventory concurrency tests: two simultaneous checkouts for final stock unit result in one success and one failure.
- GST tests: intra-state CGST/SGST, inter-state IGST, nil/exempt/non-GST and rounding cases.
- Upload tests: anonymous upload fails, wrong role fails, successful upload records session user id metadata.
- Build tests: lint, typecheck, prisma validate/generate, test suite and next build pass in CI with restricted network.

## Rollback Approach

- Ship security guards behind small, route-scoped commits so individual endpoints can be reverted without touching schema.
- For token schema changes, deploy additive columns first, write both old/new paths only if needed, then cut over and invalidate legacy tokens.
- For inventory migration, take a pre-migration stock snapshot, run a dry-run backfill report, deploy read path changes before write path changes, and keep a rollback script that restores Product/ProductVariant stock from the snapshot.
- For order total backfills, write idempotent scripts and store reconciliation logs; avoid overwriting historical invoices without an audit record.
- For build changes, keep font assets and config changes isolated so the app can revert to prior font behavior if rendering regressions appear.
- For payment/refund flows, use provider sandbox and idempotency keys; rollback by disabling webhooks and payment methods while preserving recorded events.


## Security Fix Verification - 2026-07-25

Fixed Critical/High auth/security findings: NX-CRIT-001, NX-CRIT-002, NX-CRIT-003, NX-CRIT-004, NX-CRIT-005, NX-CRIT-006, NX-HIGH-001, NX-HIGH-002, NX-HIGH-003, NX-HIGH-009.

Verification commands all passed:

- node_modules\.bin\eslint.cmd .
- node_modules\.bin\tsc.cmd --noEmit
- node_modules\.bin\prisma.cmd validate
- npm test -- --test-reporter=spec
- node_modules\.bin\next.cmd build

Remaining Critical/High findings outside this request scope: inventory concurrency, seller-wise inventory source of truth, GST/order totals, and missing payment/refund workflow.
