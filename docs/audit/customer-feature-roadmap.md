# Customer Feature Roadmap

## Customer Feature Matrix

| Feature | Classification | Stage | Priority |
| --- | --- | --- | --- |
| Registration, login and password reset | Existing and complete | P0 | Critical |
| Product discovery and localized product/category pages | Existing but incomplete | P1 | High |
| Cart and checkout | Existing but incomplete | P0 | Critical |
| Payment and refunds | Missing and required for MVP | P0 | Critical |
| Order history and invoice access | Existing but incomplete | P0 | High |
| Wishlist and reviews | Missing and required for MVP | P1 | Medium |
| Returns/support workflow | Missing and required for MVP | P1 | Medium |
| SEO/social sharing | Existing but incomplete | P2 | Medium |

## P0 Required Before Production

### Account Registration, Login And Recovery

- Classification: Existing and complete.
- User role: USER.
- Current implementation evidence: Auth routes exist under `app/api/users`; login/register/reset pages exist; fixed audit findings `NX-CRIT-003`, `NX-CRIT-004`; `tests/security.test.ts`.
- Business value: Customers can create accounts and recover access.
- Security considerations: Token validation, rate limits, sanitized responses.
- Database changes: Token expiry/hash fields are recommended later but not required by the fixed audit scope.
- API/server action changes: Continue using token checks and rate limits.
- UI pages/components: Login, register, forgot/reset password pages.
- Required tests: Invalid token rejection, token reuse rejection, rate limits.
- Dependencies: Auth.js.
- Complexity: Medium.
- Priority: P0 Critical.

### Cart And Checkout

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: Cart page and checkout page exist; order API derives user from session and persists tax totals; audit `NX-MED-004` confirms cart can exceed stock and `NX-MED-005` confirms checkout UI lacks GST quote display.
- Business value: Core customer purchase path.
- Security considerations: Server recalculates prices/taxes; client totals are not trusted.
- Database changes: None beyond Inventory source-of-truth migration.
- API/server action changes: Add checkout quote endpoint; return stock/tax/price validation messages.
- UI pages/components: `app/(front-end)/cart/page.tsx`, `app/(front-end)/checkout/page.tsx`, `components/Checkout/StepForms/OrderSummary.tsx`.
- Required tests: Cart quantity limits, quote display, checkout rejects stale stock.
- Dependencies: Product stock, GST helper, checkout route.
- Complexity: Medium.
- Priority: P0 Critical.

### Payment And Refunds

- Classification: Missing and required for MVP.
- User role: USER.
- Current implementation evidence: Audit `NX-HIGH-010` confirms payment/refund workflows are placeholders; `PaymentMethodForm` has UI choices but no provider/webhook/refund route.
- Business value: Customers can pay reliably and receive refunds.
- Security considerations: Payment status only from signed provider webhook; refund requests scoped to order owner.
- Database changes: Refund/return records and provider event/idempotency storage.
- API/server action changes: Payment intent, webhook, refund request endpoint.
- UI pages/components: Checkout payment step, order detail refund action.
- Required tests: Webhook signature, duplicate webhook, refund ownership.
- Dependencies: Payment provider and order totals.
- Complexity: Large.
- Priority: P0 Critical.

### Order History And Invoice Access

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: `app/api/orders/user/[id]/route.tsx` owner/admin guard is fixed; order confirmation and invoice pages exist; audit `NX-MED-006` flags invoice route protection and invoice data accuracy concerns.
- Business value: Customers can track purchases and download GST invoice.
- Security considerations: Customer sees only own orders/invoices.
- Database changes: Optional Invoice model for immutable invoice numbers.
- API/server action changes: Scoped invoice fetch endpoint.
- UI pages/components: Order confirmation, order history, invoice view.
- Required tests: User A cannot view User B invoice; invoice totals match snapshots.
- Dependencies: Order totals and payment status.
- Complexity: Medium.
- Priority: P0 High.

## P1 Required For Marketplace MVP

### Product Discovery And Localization

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: Storefront product/category pages and localized `[lang]` product/category pages exist; audit `NX-MED-014` confirms localization is partial.
- Business value: Customers can browse and buy in English, Hindi and Marathi.
- Security considerations: Sanitize localized content and query params.
- Database changes: Translation models already exist; add missing translated fields only after gap analysis.
- API/server action changes: Consistent localized response shape for products/categories/search.
- UI pages/components: Storefront, language switcher, search and category filters.
- Required tests: Language fallback, localized URLs, search result safety.
- Dependencies: Translation jobs and metadata.
- Complexity: Medium.
- Priority: P1 High.

### Wishlist And Reviews

- Classification: Missing and required for MVP.
- User role: USER.
- Current implementation evidence: `Wishlist` and `Review` models exist in Prisma, but audit `NX-MED-015` found no complete wishlist/review implementation.
- Business value: Improves retention and trust.
- Security considerations: Reviews limited to purchasers; moderation for abuse.
- Database changes: Existing models may be sufficient for first release.
- API/server action changes: Wishlist CRUD, review create/update/moderation endpoints.
- UI pages/components: Wishlist page, product review section.
- Required tests: Auth required, purchase verification, moderation visibility.
- Dependencies: Order history and product pages.
- Complexity: Medium.
- Priority: P1 Medium.

### Returns And Support Workflow

- Classification: Missing and required for MVP.
- User role: USER.
- Current implementation evidence: Audit `NX-MED-015` found no return/refund implementation files; support page exists but not confirmed as transactional support workflow.
- Business value: Customer trust and post-sale support.
- Security considerations: Return requests scoped to purchased items and allowed windows.
- Database changes: Return/RMA model and status history.
- API/server action changes: Return request and status endpoints.
- UI pages/components: Order detail return action and support status page.
- Required tests: Return window, ownership, seller/admin status transitions.
- Dependencies: Payment/refund workflow.
- Complexity: Large.
- Priority: P1 Medium.

## P2 Important Growth Features

### SEO And Social Sharing

- Classification: Existing but incomplete.
- User role: USER.
- Current implementation evidence: Product share button exists; audit `NX-MED-009` identifies metadata gaps and `NX-MED-010` identifies image optimization gaps.
- Business value: Improves acquisition and share conversion.
- Security considerations: Metadata must not expose private seller/admin data.
- Database changes: Optional SEO fields.
- API/server action changes: None if pages fetch existing content.
- UI pages/components: Product/category/blog pages.
- Required tests: Metadata and JSON-LD validity.
- Dependencies: Product content quality.
- Complexity: Medium.
- Priority: P2 Medium.
