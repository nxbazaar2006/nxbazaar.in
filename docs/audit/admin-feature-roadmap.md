# Admin Feature Roadmap

## Admin Feature Matrix

| Feature | Classification | Stage | Priority |
| --- | --- | --- | --- |
| Admin dashboard RBAC | Existing and complete | P0 | Critical |
| Staff/user management | Existing and complete | P0 | High |
| Category/subcategory/HSN management | Existing but incomplete | P0 | Critical |
| Product approval and governance | Existing but incomplete | P0 | High |
| Order and invoice oversight | Existing but incomplete | P0 | High |
| Payment/refund/reconciliation operations | Missing and required for MVP | P0 | Critical |
| Seller settlement and payout management | Existing but incomplete | P1 | High |
| Audit-log dashboard | Existing but incomplete | P1 | Medium |
| Translation job operations | Existing but incomplete | P1 | Medium |
| Analytics and growth reporting | Existing but incomplete | P2 | Medium |

## P0 Required Before Production

### Admin Dashboard RBAC

- User role: ADMIN.
- Current implementation evidence: `proxy.ts` route matrix; `lib/security.ts`; fixed audit finding `NX-HIGH-002`; `tests/security.test.ts`.
- Business value: Protects privileged operations.
- Security considerations: Keep server-side data scoping on every admin API.
- Database changes: None.
- API/server action changes: Apply `assertAdmin` to new admin routes.
- UI pages/components: `app/(back-office)/dashboard/*`.
- Required tests: Non-admin receives 403 for admin paths and APIs.
- Dependencies: Auth.js session.
- Complexity: Medium.
- Priority: P0 Critical.

### Staff And User Management

- Classification: Existing and complete.
- User role: ADMIN.
- Current implementation evidence: `app/api/staffs/route.tsx`, `app/api/users/route.tsx`, dashboard staff/customer pages; fixed findings `NX-CRIT-001`, `NX-CRIT-002`.
- Business value: Admin can manage marketplace users safely.
- Security considerations: Passwords and tokens must never be returned; admin-only reads/writes.
- Database changes: None currently required.
- API/server action changes: Add pagination/filtering if datasets grow.
- UI pages/components: Staff and customer dashboard pages.
- Required tests: Sanitized user response, admin-only access, pagination once added.
- Dependencies: Auth and roles.
- Complexity: Small.
- Priority: P0 High.

### HSN, Category And Subcategory Governance

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: HSN routes under `app/api/hsn-codes`, HSN dashboard under `app/(back-office)/dashboard/hsn-codes`, category/subcategory dashboards, `lib/hsn/resolve-product-hsn.ts`; audit `NX-MED-003` flags incomplete product validation.
- Business value: Correct statutory GST assignment and catalog taxonomy.
- Security considerations: Admin-only mutation; HSN imports must validate file content and reject malformed rows.
- Database changes: Optional indexes for search/import reporting if query profiling requires them.
- API/server action changes: Full Zod validation for HSN imports and product category/HSN consistency.
- UI pages/components: HSN code forms, category/subcategory forms.
- Required tests: HSN status, category/subcategory relation, import validation, unauthorized mutation.
- Dependencies: Product validation and HSN master data.
- Complexity: Medium.
- Priority: P0 Critical.

### Product Approval And Governance

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: `ProductStatus`, `approvedAt`, `approvedById`, `approvalNote` exist in `prisma/schema.prisma`; product dashboards exist; product audit history writes exist, but approval workflow completeness is not confirmed in audit.
- Business value: Marketplace quality control and compliance.
- Security considerations: Sellers cannot approve own products unless business policy allows it; all status changes audited.
- Database changes: No immediate change; may add review checklist fields later.
- API/server action changes: Admin approval/rejection endpoint with audit log.
- UI pages/components: Product detail/review screen in dashboard.
- Required tests: Seller cannot approve; admin approval creates history.
- Dependencies: Product validation, audit logging.
- Complexity: Medium.
- Priority: P0 High.

### Order, Invoice And Dispute Oversight

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: `app/(back-office)/dashboard/orders/page.tsx`, invoice page, `Order`, `OrderItem`, `SellerOrder` models; audit `NX-MED-006` flags invoice access and snapshot concerns.
- Business value: Admin support and GST reporting.
- Security considerations: Admin access allowed, but seller/customer invoice access must be scoped.
- Database changes: Possible Invoice/CreditNote model when statutory numbering is finalized.
- API/server action changes: Scoped invoice/order detail APIs, status transition endpoints.
- UI pages/components: Orders dashboard and invoice page.
- Required tests: Invoice totals, status transition rules, access boundaries.
- Dependencies: Payment/refund lifecycle.
- Complexity: Medium.
- Priority: P0 High.

### Payment, Refund And Reconciliation Operations

- Classification: Missing and required for MVP.
- User role: ADMIN.
- Current implementation evidence: Audit `NX-HIGH-010`; `Payment` model exists but no payment provider API/webhook/refund route found.
- Business value: Required to operate money movement and resolve disputes.
- Security considerations: Webhook signature verification, idempotency, strict refund permissions.
- Database changes: Provider event log, refund records, idempotency keys.
- API/server action changes: Webhook, refund, reconciliation and admin override endpoints.
- UI pages/components: Payments dashboard should show real payments, refunds and failures.
- Required tests: Signature rejection, duplicate webhook, refund role checks.
- Dependencies: Payment provider, order totals.
- Complexity: Large.
- Priority: P0 Critical.

## P1 Required For Marketplace MVP

### Seller Settlement And Payout Management

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: `SellerOrder`, `SellerWallet`, `WalletTransaction`, `SellerPayout` models exist; wallet dashboard exists; checkout creates SellerOrder totals, but payout workflow is not confirmed complete.
- Business value: Enables seller trust and marketplace operations.
- Security considerations: Immutable ledger entries, admin approval controls, payout audit trail.
- Database changes: May need payout batch and reconciliation fields.
- API/server action changes: Payout request, approval, rejection and paid status endpoints.
- UI pages/components: Admin payout queue and seller wallet.
- Required tests: Ledger balances, payout status transitions, admin-only approval.
- Dependencies: Payment capture and refund lifecycle.
- Complexity: Large.
- Priority: P1 High.

### Audit-Log Dashboard

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: `AuditLog` and `ProductHistory` models exist; audit `NX-MED-013` confirms no dashboard view.
- Business value: Compliance, support and fraud investigation.
- Security considerations: Admin global view; redact sensitive values.
- Database changes: Standardized event enums and indexes may be useful.
- API/server action changes: Paginated audit read endpoint.
- UI pages/components: Audit log dashboard with filters.
- Required tests: Append-only records, redaction, pagination.
- Dependencies: Event writers in product/order/HSN/user flows.
- Complexity: Medium.
- Priority: P1 Medium.

### Translation Job Operations

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: `TranslationJob` model, worker scripts, and `app/(back-office)/dashboard/translation-jobs/page.tsx` exist.
- Business value: Manage English/Hindi/Marathi content readiness.
- Security considerations: Admin-only retry/cancel; avoid exposing provider errors with secrets.
- Database changes: None immediately required.
- API/server action changes: Retry/cancel/requeue operations with audit logs.
- UI pages/components: Translation jobs dashboard.
- Required tests: Retry permissions, idempotent queueing.
- Dependencies: Redis/queue configuration.
- Complexity: Medium.
- Priority: P1 Medium.

## P2 Important Growth Features

### Analytics And Growth Reporting

- Classification: Existing but incomplete.
- User role: ADMIN.
- Current implementation evidence: Chart dependencies exist and dashboard chart components exist, but audit did not confirm production-grade metrics.
- Business value: Track GMV, seller performance, inventory health and tax reports.
- Security considerations: Admin-only aggregated metrics; seller views scoped.
- Database changes: Optional materialized views or reporting tables.
- API/server action changes: Metrics endpoints with date filters and caching.
- UI pages/components: Admin dashboard charts.
- Required tests: Metric query correctness and role scoping.
- Dependencies: Payment/order correctness.
- Complexity: Medium.
- Priority: P2 Medium.
