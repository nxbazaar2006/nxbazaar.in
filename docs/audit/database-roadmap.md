# Database And Engineering Roadmap

## Database Feature Matrix

| Feature | Classification | Stage | Priority |
| --- | --- | --- | --- |
| Auth/user role schema | Existing and complete | P0 | Critical |
| Product, variant and HSN schema | Existing but incomplete | P0 | Critical |
| Inventory uniqueness and source of truth | Existing but incomplete | P0 | Critical |
| Order item snapshots and seller orders | Existing and complete | P0 | Critical |
| Payment/refund persistence | Existing but incomplete | P0 | Critical |
| Audit/history persistence | Existing but incomplete | P1 | Medium |
| Localization persistence | Existing but incomplete | P1 | Medium |
| Reporting/query performance | Missing and recommended after MVP | P2 | Medium |

## P0 Required Before Production

### Auth And Role Data Model

- Classification: Existing and complete.
- User role: ADMIN, SELLER, USER.
- Current implementation evidence: `UserRole` enum, `User`, profiles and Auth.js adapter models in `prisma/schema.prisma`; security findings are fixed.
- Business value: Foundational access control.
- Security considerations: Enforce role checks in code; do not rely only on schema.
- Database changes: Optional token expiry/hash fields for stronger recovery tokens.
- API/server action changes: Continue sanitized selects and role guards.
- UI pages/components: Login/register/dashboard.
- Required tests: Role scoping and sanitized responses.
- Dependencies: Auth.js.
- Complexity: Medium.
- Priority: P0 Critical.

### Product, Variant And HSN Integrity

- Classification: Existing but incomplete.
- User role: ADMIN, SELLER.
- Current implementation evidence: `Product`, `ProductVariant`, `Category`, `SubCategory`, `HsnCode`, and HSN history models exist; variant SKU/productCode/barcode are unique; simple product identifiers are nullable and not unique; audit `NX-MED-003`.
- Business value: Accurate catalog, tax and fulfillment data.
- Security considerations: Seller ownership and admin-only HSN governance.
- Database changes: Consider partial unique indexes for non-null `Product.sku`, `Product.productCode`, `Product.barcode` after duplicate preflight.
- API/server action changes: Shared Zod product schema and identifier normalization.
- UI pages/components: Product/HSN/category forms.
- Required tests: Duplicate identifier preflight, HSN relation validation.
- Dependencies: Migration strategy and data cleanup.
- Complexity: Medium.
- Priority: P0 Critical.

### Inventory Uniqueness And Source Of Truth

- Classification: Existing but incomplete.
- User role: SELLER, ADMIN.
- Current implementation evidence: `Inventory` model exists with `@@unique([productId, productVariantId, sellerId])`; audit `NX-HIGH-005` notes PostgreSQL nullable uniqueness gap; checkout partially updates Inventory.
- Business value: Prevents oversell and seller stock drift.
- Security considerations: Seller-scoped inventory reads/writes.
- Database changes: Add partial unique index on `Inventory(productId, sellerId) WHERE productVariantId IS NULL`; preflight duplicate rows first. Optional immutable InventoryTransaction ledger.
- API/server action changes: Inventory adjustment endpoint and checkout reliance on Inventory as source-of-truth.
- UI pages/components: Seller/admin inventory management.
- Required tests: Duplicate simple Inventory rejection, concurrent checkout, adjustment audit.
- Dependencies: Product/variant stock backfill.
- Complexity: Large.
- Priority: P0 Critical.

### Order Item Snapshots And Seller Orders

- Classification: Existing and complete.
- User role: USER, SELLER, ADMIN.
- Current implementation evidence: `Order`, `OrderItem`, and `SellerOrder` fields exist; checkout persists price/tax snapshots and seller totals; `tests/ecommerce.test.ts`.
- Business value: Accurate invoices, settlement and reporting.
- Security considerations: Do not mutate historical item price/tax snapshots after checkout.
- Database changes: Optional Invoice model for legal invoice numbering.
- API/server action changes: Preserve snapshot reads in order/invoice APIs.
- UI pages/components: Order, invoice and seller order pages.
- Required tests: Snapshot immutability, invoice totals, seller split.
- Dependencies: GST helper and checkout.
- Complexity: Medium.
- Priority: P0 Critical.

### Payment And Refund Persistence

- Classification: Existing but incomplete.
- User role: USER, SELLER, ADMIN.
- Current implementation evidence: `Payment`, `SellerWallet`, `WalletTransaction`, `SellerPayout` models exist; audit `NX-HIGH-010` confirms no provider webhook/refund routes.
- Business value: Required for paid marketplace operations.
- Security considerations: Idempotency, webhook signature verification, refund authorization, immutable ledger.
- Database changes: Add `Refund` and `PaymentProviderEvent`/idempotency tables if existing Payment fields are insufficient.
- API/server action changes: Payment intent, webhook, refund, reconciliation jobs.
- UI pages/components: Checkout payment, admin payments, seller wallet.
- Required tests: Signature verification, duplicate events, ledger math.
- Dependencies: Provider selection and order totals.
- Complexity: Large.
- Priority: P0 Critical.

## P1 Required For Marketplace MVP

### Audit And History Persistence

- Classification: Existing but incomplete.
- User role: ADMIN, SELLER.
- Current implementation evidence: `AuditLog` and `ProductHistory` exist; product routes write history; no dashboard UI confirmed.
- Business value: Traceability and dispute support.
- Security considerations: Immutable append-only records and seller-scoped views.
- Database changes: Add standardized event enum and indexes if needed.
- API/server action changes: Paginated audit reads and write helpers for all critical flows.
- UI pages/components: Audit dashboard/history tabs.
- Required tests: Append-only, scope, redaction.
- Dependencies: Product/order/payment workflows.
- Complexity: Medium.
- Priority: P1 Medium.

### Localization Persistence

- Classification: Existing but incomplete.
- User role: USER, ADMIN.
- Current implementation evidence: Translation models and `TranslationJob` exist; localized routes are partial; audit `NX-MED-014`.
- Business value: English/Hindi/Marathi coverage.
- Security considerations: Sanitize translated content and protect translation admin actions.
- Database changes: Add missing translation tables only after route/content gap analysis.
- API/server action changes: Language-aware APIs and queue retry actions.
- UI pages/components: Localized storefront and translation job dashboard.
- Required tests: Fallback, localized slugs, queue idempotency.
- Dependencies: Redis/queue environment.
- Complexity: Medium.
- Priority: P1 Medium.

## P2 Important Growth Features

### Reporting And Slow Query Performance

- Classification: Missing and recommended after MVP.
- User role: ADMIN, SELLER.
- Current implementation evidence: Audit requested performance review; schema has indexes for common relations/statuses, but no dedicated reporting tables/materialized views were confirmed.
- Business value: Faster dashboards and operational reports at scale.
- Security considerations: Aggregates must respect seller scope.
- Database changes: Add composite indexes/materialized views based on measured slow queries, not guesses.
- API/server action changes: Select only needed columns, paginate admin lists, cache public catalog reads.
- UI pages/components: Admin and seller analytics dashboards.
- Required tests: Query plans for high-traffic routes, pagination, seller-scope metrics.
- Dependencies: Production-like data volume and query logs.
- Complexity: Medium.
- Priority: P2 Medium.

## Migration Policy For Roadmap Items

- Run duplicate-data preflight before adding unique indexes.
- Prefer additive migrations for P0 unless data cleanup is explicitly planned.
- Document rollback SQL for each index/table migration.
- For payment/refund ledger migrations, never delete financial records in rollback; disable code paths and preserve data.
