# Nxbazaar.in MVP Feature Roadmap

Source basis: `docs/audit/audit-findings.json`, `prisma/schema.prisma`, App Router pages under `app/`, API routes under `app/api/`, and tests under `tests/`. This roadmap does not list invented completed features; items marked complete are backed by implementation evidence.

## Classification Summary

| Feature | Role | Classification | Stage | Priority |
| --- | --- | --- | --- | --- |
| Role-based authentication and dashboard access | ADMIN, SELLER, USER | Existing and complete | P0 | Critical |
| Catalog CRUD with categories/subcategories/HSN | ADMIN, SELLER | Existing but incomplete | P0 | Critical |
| Product variants and identifiers | ADMIN, SELLER | Existing but incomplete | P0 | High |
| Checkout identity and order creation | USER | Existing but incomplete | P0 | Critical |
| Atomic stock decrement | SELLER, USER | Existing and complete | P0 | Critical |
| Seller-wise inventory source of truth | SELLER, ADMIN | Existing but incomplete | P0 | Critical |
| GST item and order totals | USER, SELLER, ADMIN | Existing and complete | P0 | Critical |
| Payment, refund and webhook lifecycle | USER, SELLER, ADMIN | Missing and required for MVP | P0 | Critical |
| Invoice access and invoice snapshots | USER, SELLER, ADMIN | Existing but incomplete | P0 | High |
| Product validation and cart quote parity | USER, SELLER | Existing but incomplete | P1 | High |
| English/Hindi/Marathi storefront | USER | Existing but incomplete | P1 | Medium |
| Reviews, wishlist and returns | USER, SELLER | Missing and required for MVP | P1 | Medium |
| Audit-log review UI | ADMIN, SELLER | Existing but incomplete | P1 | Medium |
| SEO, metadata and product structured data | USER | Existing but incomplete | P1 | Medium |
| Dependency and bundle pruning | All | Missing and recommended after MVP | P2 | Low |

## P0 Required Before Production

### Role-Based Authentication And Dashboard Access

- Classification: Existing and complete.
- User role: ADMIN, SELLER, USER.
- Current implementation evidence: `proxy.ts` enforces dashboard role boundaries; `lib/security.ts` centralizes role helpers; auth/security findings `NX-CRIT-001` through `NX-CRIT-006`, `NX-HIGH-001`, `NX-HIGH-002`, `NX-HIGH-003`, `NX-HIGH-009` are marked fixed in `docs/audit/audit-findings.json`; `tests/security.test.ts` covers role and owner checks.
- Business value: Prevents cross-role data exposure and protects admin/seller operations.
- Security considerations: Keep deny-by-default route guards; continue owner checks on server data access, not only middleware.
- Database changes: None required for the current fixed scope.
- API/server action changes: Extend same guard pattern to any new route or server action.
- UI pages/components: Dashboard route groups under `app/(back-office)/dashboard`.
- Required tests: Route-level 401/403 tests for every new admin/seller/customer API.
- Dependencies: Auth.js session/JWT configuration, `lib/security.ts`.
- Complexity: Medium.
- Priority: P0 Critical.

### Catalog CRUD With HSN Mapping

- Classification: Existing but incomplete.
- User role: ADMIN, SELLER.
- Current implementation evidence: Product/category/subcategory dashboards and APIs exist under `app/(back-office)/dashboard/(catalogue)` and `app/api/products`, `app/api/categories`, `app/api/subcategories`; HSN APIs exist under `app/api/hsn-codes`; HSN relation validation exists in `lib/validations/product.ts`. Audit `NX-MED-003` confirms product validation is incomplete.
- Business value: Enables sellers/admins to publish compliant products with category/subcategory HSN and GST.
- Security considerations: Admin-only HSN/category writes; seller product ownership checks; prevent sellers from assigning products to another seller.
- Database changes: No immediate required change for CRUD; product SKU/barcode uniqueness for simple products should be evaluated before production.
- API/server action changes: Add full shared Zod schema for product prices, stock, SKU, barcode, SEO fields, HSN override and variants.
- UI pages/components: `components/backoffice/NewProductForm.tsx`, product/category/subcategory dashboard pages.
- Required tests: Product create/update validation, HSN mismatch rejection, seller ownership, duplicate identifiers.
- Dependencies: HSN master data, product variant sync.
- Complexity: Medium.
- Priority: P0 Critical.

### Product Variants And Identifiers

- Classification: Existing but incomplete.
- User role: SELLER, ADMIN.
- Current implementation evidence: `prisma/schema.prisma` has `ProductVariant` with unique `sku`, `productCode`, `barcode`; `lib/product-variants.ts` validates duplicate combinations and syncs variants; product routes call `assertUniqueVariantIdentifiers`. Simple `Product.sku`, `Product.productCode`, and `Product.barcode` are nullable and not database-unique.
- Business value: Prevents fulfillment, barcode and marketplace catalog conflicts.
- Security considerations: Sellers must only edit their own product/variant records.
- Database changes: Consider unique partial indexes for non-null simple product SKU/productCode/barcode after duplicate preflight.
- API/server action changes: Normalize identifiers consistently on create/update and reject duplicates across simple and variant products.
- UI pages/components: Product form and variant selector.
- Required tests: Duplicate SKU/productCode/barcode rejection; variant combination uniqueness; update preserves historical order items.
- Dependencies: Product validation schema, migration preflight.
- Complexity: Medium.
- Priority: P0 High.

### Checkout, Inventory And GST Totals

- Classification: Existing but incomplete.
- User role: USER, SELLER, ADMIN.
- Current implementation evidence: `app/api/orders/route.tsx` now derives `userId` from session, conditionally decrements stock, updates seller Inventory, persists Order totals and creates SellerOrder rows; `lib/orders/checkout-calculations.ts` and `tests/ecommerce.test.ts` cover GST totals. Audit `NX-HIGH-005` remains partially fixed for full Inventory source-of-truth.
- Business value: Accurate stock, seller settlement, order reporting and GST invoices.
- Security considerations: Checkout must never trust client price, quantity, user id or seller id; all prices/taxes must be recalculated server-side.
- Database changes: Add partial unique index for simple-product Inventory rows after duplicate-data preflight.
- API/server action changes: Add server checkout quote endpoint so UI totals match final order totals before submission.
- UI pages/components: `components/Checkout/StepForms/OrderSummary.tsx`, checkout route.
- Required tests: Concurrent final-unit checkout, checkout quote parity, seller Inventory updates, Order/SellerOrder totals.
- Dependencies: Inventory uniqueness migration, product HSN mapping.
- Complexity: Large.
- Priority: P0 Critical.

### Payment, Refund And Webhook Lifecycle

- Classification: Missing and required for MVP.
- User role: USER, SELLER, ADMIN.
- Current implementation evidence: Audit `NX-HIGH-010` confirms no payment provider route, refund route or webhook route; `components/Checkout/StepForms/PaymentMethodForm.tsx` renders payment choices only; `prisma/schema.prisma` has `Payment`, `SellerWallet`, `WalletTransaction`, and payout models.
- Business value: Required for paid marketplace transactions, seller payout reconciliation and customer refunds.
- Security considerations: Verify webhook signatures, enforce idempotency, never trust client payment status, protect refund actions by role.
- Database changes: Add refund/return records if not modeled sufficiently; add idempotency keys and provider event storage if missing.
- API/server action changes: Payment intent/order authorization route, webhook route, refund route, reconciliation jobs.
- UI pages/components: Checkout payment step, payment dashboard, refund/admin order actions, seller wallet page.
- Required tests: Webhook signature validation, duplicate webhook idempotency, refund authorization, order/payment status transitions.
- Dependencies: Payment provider selection, checkout identity and totals.
- Complexity: Large.
- Priority: P0 Critical.

### Invoice Accuracy And Access

- Classification: Existing but incomplete.
- User role: USER, SELLER, ADMIN.
- Current implementation evidence: Invoice page exists at `app/(back-office)/dashboard/orders/[id]/invoice/page.tsx`; `components/Order/SalesInvoice.tsx` renders invoices; audit `NX-MED-006` flags weak route protection and previously incomplete order totals.
- Business value: Required for GST-compliant invoices and customer/seller records.
- Security considerations: Owner/admin/seller-scoped invoice access; immutable tax and seller snapshots.
- Database changes: Consider explicit Invoice model if legal invoice numbering, IRN/e-way-bill or credit notes are required.
- API/server action changes: Invoice fetch must enforce customer owner, seller participant or admin.
- UI pages/components: Invoice page and order details.
- Required tests: Unauthorized invoice access denied; invoice totals equal order item snapshots.
- Dependencies: Order totals and payment status.
- Complexity: Medium.
- Priority: P0 High.

## P1 Required For Marketplace MVP

### Checkout Quote And Cart Stock Validation

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: Audit `NX-MED-004` confirms cart quantity can exceed stock before checkout; `NX-MED-005` confirms checkout UI subtotal excludes GST lines.
- Business value: Prevents customer surprise and checkout failures.
- Security considerations: Quote is display-only; checkout must still recalculate server-side.
- Database changes: None.
- API/server action changes: Add `/api/checkout/quote` or server action returning item price/tax/stock status.
- UI pages/components: Cart and checkout summary.
- Required tests: Out-of-stock cart warning, GST line display, stale quote handling.
- Dependencies: GST helper, product/variant stock.
- Complexity: Medium.
- Priority: P1 High.

### Multilingual Storefront Completion

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: `lib/i18n/languages.ts`, `app/[lang]/product/[slug]/page.tsx`, `app/[lang]/category/[slug]/page.tsx`, and translation jobs exist; audit `NX-MED-014` confirms route and metadata coverage is partial.
- Business value: Supports English, Hindi and Marathi customers.
- Security considerations: Sanitize translated HTML/content; preserve canonical/alternate links.
- Database changes: No immediate change; translations models already exist for key entities.
- API/server action changes: Ensure localized APIs consistently accept normalized language.
- UI pages/components: Localized storefront routes, language switcher.
- Required tests: Locale routing, fallback language, metadata alternates.
- Dependencies: Translation job processing and content coverage.
- Complexity: Medium.
- Priority: P1 Medium.

### Reviews, Wishlist And Returns

- Classification: Missing and required for MVP.
- User role: USER, SELLER, ADMIN.
- Current implementation evidence: `prisma/schema.prisma` includes `Wishlist` and `Review` models, but audit `NX-MED-015` found no complete wishlist/review/returns implementation files and no refund files.
- Business value: Customer trust, retention, post-order support.
- Security considerations: Reviews only from purchasers; returns/refunds scoped to order ownership and seller participation.
- Database changes: Add Return/RMA model and refund relation if missing.
- API/server action changes: Wishlist CRUD, review moderation, return request workflow.
- UI pages/components: Product reviews, wishlist page, order return actions, admin moderation.
- Required tests: Purchase-verified review, return status transitions, seller/admin moderation.
- Dependencies: Payment/refund lifecycle, order status model.
- Complexity: Large.
- Priority: P1 Medium.

### Audit-Log Review UI

- Classification: Existing but incomplete.
- User role: ADMIN, SELLER.
- Current implementation evidence: `ProductHistory` and `AuditLog` exist in `prisma/schema.prisma`; product routes write product history; audit `NX-MED-013` confirms no dashboard/review surface.
- Business value: Dispute investigation, catalog governance and compliance traceability.
- Security considerations: Sellers see only own product/order history; admins see all.
- Database changes: May need standardized event types and indexes by actor/entity.
- API/server action changes: Audit query endpoints with role scoping and pagination.
- UI pages/components: Admin audit log dashboard, product history tab.
- Required tests: Actor/entity scope, immutable append-only behavior.
- Dependencies: Product/order/admin workflows.
- Complexity: Medium.
- Priority: P1 Medium.

## P2 Important Growth Features

### SEO And Structured Data Completion

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: Audit `NX-MED-009` flagged generic root metadata and missing per-page metadata; product/category pages exist.
- Business value: Better organic discovery and product sharing.
- Security considerations: Escape/sanitize user-supplied product descriptions in metadata and JSON-LD.
- Database changes: Optional SEO fields if current product/category translations are insufficient.
- API/server action changes: None if page loaders fetch enough data.
- UI pages/components: Product/category/blog pages.
- Required tests: Metadata snapshot tests, JSON-LD validity.
- Dependencies: Product/category content quality.
- Complexity: Medium.
- Priority: P2 Medium.

### Performance And Dependency Pruning

- Classification: Missing and recommended after MVP.
- User role: All.
- Current implementation evidence: Audit `NX-LOW-003` finds overlapping Flowbite/Radix stacks and multiple carousel libraries; product image optimization finding `NX-MED-010` shows raw image usage.
- Business value: Faster storefront and lower maintenance cost.
- Security considerations: Removing unused dependencies reduces supply-chain surface.
- Database changes: None.
- API/server action changes: Query pagination and select/include tuning where route profiling shows slow calls.
- UI pages/components: Carousel/image-heavy storefront components.
- Required tests: Build, visual smoke, bundle analysis, route timing budgets.
- Dependencies: Usage audit and replacement plan.
- Complexity: Medium.
- Priority: P2 Low.

## P3 Optional Enhancements

### AI-Assisted Catalog Operations

- Classification: Optional future enhancement.
- User role: ADMIN, SELLER.
- Current implementation evidence: Some `app/api/ai/...` files appear in the working tree, but audit scope did not confirm production readiness.
- Business value: Faster product onboarding and support responses.
- Security considerations: Prompt injection, data leakage, approval workflow for generated catalog content.
- Database changes: Existing AI metadata fields on Product may be enough for initial provenance.
- API/server action changes: Harden AI routes behind roles and rate limits.
- UI pages/components: Product form suggestions and admin insights.
- Required tests: Authorization, provenance, rejection/approval flow.
- Dependencies: Stable product validation and audit logs.
- Complexity: Large.
- Priority: P3 Low.
