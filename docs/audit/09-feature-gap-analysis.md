# Feature Gap Analysis

## Implemented Foundations

- App Router storefront, dashboard and localized route groups.
- Prisma models for roles, products, variants, inventory, orders, seller orders, payments, wallets and audit logs.
- HSN/GST calculation helper and HSN assignment validation.
- Translation queue infrastructure and English/Hindi/Marathi language constants.

## Missing Features

### NX-HIGH-010 - High - Payment/refund flow

- Classification: Missing features
- Evidence: Lines 52-95 present Cash On Delivery and Credit Card radio options only; feature inventory found no refund files, no payment provider route, and payments dashboard page lines 6-11 loads categories data.
- File path: components/Checkout/StepForms/PaymentMethodForm.tsx:52
- Description: Payment and refund workflows are placeholders/incomplete.
- Business impact: Orders cannot be reliably paid, refunded, reconciled, or settled for sellers.
- Recommended solution: Implement payment provider integration, payment status webhook, refund model/API, idempotency and reconciliation dashboards.
- Verification steps: End-to-end payment succeeds, webhook updates Payment/Order, refund creates auditable records.
- Estimated complexity: Large

### NX-MED-013 - Medium - Product audit logs

- Classification: Missing features
- Evidence: AuditLog model exists at lines 1268-1276, and ProductHistory exists in schema, but feature inventory found no audit/history routes or dashboard pages outside schema/product history writes.
- File path: prisma/schema.prisma:1268
- Description: Audit trail is modeled but not exposed as a reviewable admin/seller feature.
- Business impact: Operational teams cannot trace changes, investigate disputes or satisfy audit requirements efficiently.
- Recommended solution: Create audit log service and dashboards for product, order, inventory, HSN and user role changes.
- Verification steps: Changing product/HSN/order status creates visible immutable audit entries with actor and before/after values.
- Estimated complexity: Large

### NX-MED-014 - Medium - Multilingual completeness

- Classification: Missing features
- Evidence: Language files exist and app/[lang] routes exist, but root layout hardcodes lang="en" and scan found metadata only in app/layout.tsx; not all front-end routes have [lang] equivalents.
- File path: lib/i18n/languages.ts:1
- Description: English/Hindi/Marathi implementation is partial.
- Business impact: Localized users may hit English-only pages, incorrect metadata and inconsistent URL coverage.
- Recommended solution: Define locale middleware/routing, localized layouts, metadata, and complete translation coverage for storefront flows.
- Verification steps: For en/hi/mr, product/category/cart/checkout/support pages render translated UI and correct lang metadata.
- Estimated complexity: Large

### NX-MED-015 - Medium - Marketplace features

- Classification: Missing features
- Evidence: Payment and seller wallet models exist, but feature inventory found no refund files, no wishlist/review/returns implementation files, and no payment provider API/webhook routes.
- File path: prisma/schema.prisma:1102
- Description: Important marketplace workflows are missing or only represented in schema.
- Business impact: Customer trust, seller operations and support workflows are incomplete for production marketplace use.
- Recommended solution: Prioritize refunds/returns, reviews, wishlist, payment webhooks, seller settlements and support dispute workflows.
- Verification steps: End-to-end tests cover payment, refund, return, review and seller payout lifecycle.
- Estimated complexity: Large


## Optional Improvements

- Add AGENTS.md for persistent repo instructions.
- Add dependency/bundle audit scripts.
- Document role matrix and marketplace workflow states.


## Critical/High Revalidation - 2026-07-25

Reviewed 16 Critical/High findings by reopening the cited code. Status counts: Confirmed: 16. No application code was modified.

### NX-CRIT-001 - Critical - API authorization

- Review status: Confirmed
- Evidence: Reopened app/api/staffs/route.tsx. Lines 3-16 export POST and parse request JSON including password; lines 17-29 build and return newStaff including password; the file imports only NextResponse and has no getServerSession/authOptions/role check.
- File path: app/api/staffs/route.tsx:3
- Description: Staff creation is publicly callable and does not hash the supplied password before returning the created object.
- Business impact: Unauthenticated users can create staff-like records or poison staff data; plaintext password handling would compromise accounts if wired to persistence.
- Recommended solution: Require ADMIN session, validate input with Zod, hash passwords with bcrypt, persist through Prisma intentionally, and return a sanitized response.
- Verification steps: Unauthenticated POST /api/staffs should return 401; USER/SELLER should return 403; ADMIN creation should store a bcrypt hash and omit password in response.
- Reproducibility note: Unauthenticated POST can reach handler code path; no application-level auth check exists in the route.
- Estimated complexity: Medium

### NX-CRIT-002 - Critical - API authorization

- Review status: Confirmed
- Evidence: Reopened app/api/users/route.tsx. Lines 86-93 export GET, call db.user.findMany({ orderBy: { createdAt: "desc" } }), and return users; no session or ADMIN role guard appears in the GET handler.
- File path: app/api/users/route.tsx:86
- Description: The users list endpoint exposes all user records publicly.
- Business impact: Customer, seller, admin and credential-adjacent account data can be enumerated by unauthenticated clients.
- Recommended solution: Protect with ADMIN-only authorization, select minimal fields, paginate, and avoid returning password/verificationToken fields.
- Verification steps: Unauthenticated GET /api/users returns 401; non-admin returns 403; admin response excludes password and tokens.
- Reproducibility note: Unauthenticated GET can reach handler code path and would return all selected Prisma User fields.
- Estimated complexity: Small

### NX-CRIT-003 - Critical - Authentication and account verification

- Review status: Confirmed
- Evidence: Reopened app/api/users/verify/route.tsx. Lines 4-6 export PUT and read only id from request JSON; lines 21-28 update emailVerified: true; verificationToken is never read or compared.
- File path: app/api/users/verify/route.tsx:4
- Description: Email verification can be completed by knowing or guessing a user id.
- Business impact: Attackers can mark accounts verified without mailbox control, weakening seller/customer onboarding trust.
- Recommended solution: Require id plus verification token, store token expiry, use constant-time comparison or hashed tokens, clear token after use.
- Verification steps: PUT /api/users/verify with only an id should fail; valid id+token succeeds once and cannot be reused.
- Reproducibility note: Submitting an existing user id is sufficient for the handler to mark the account verified.
- Estimated complexity: Medium

### NX-CRIT-004 - Critical - Password reset

- Review status: Confirmed
- Evidence: Reopened app/api/users/update-password/route.tsx. Lines 4-6 export PUT and read password,id; lines 21-30 hash and update password; no session, reset token, token expiry, or ownership check exists.
- File path: app/api/users/update-password/route.tsx:4
- Description: Password reset trusts client-supplied id and has no token validation.
- Business impact: Anyone who can call the endpoint can change another account password if they know the user id.
- Recommended solution: Require a valid unexpired reset token tied to the user, hash and store token server-side, invalidate after use, and rate-limit attempts.
- Verification steps: PUT /api/users/update-password with id+password and no token must fail; valid token succeeds once.
- Reproducibility note: Submitting an existing user id and new password is sufficient for the handler to change that account password.
- Estimated complexity: Medium

### NX-CRIT-005 - Critical - API authorization

- Review status: Confirmed
- Evidence: Reopened app/api/orders/user/[id]/route.tsx. Lines 4-5 read params.id; lines 7-15 run db.order.findMany({ where: { userId: id }, include: { orderItems: true } }) and return it; no session/owner/admin check exists.
- File path: app/api/orders/user/[id]/route.tsx:4
- Description: Customer order lookup trusts the URL user id.
- Business impact: Any caller can retrieve another customer order history by changing the id.
- Recommended solution: Require session; allow ADMIN or session.user.id === params.id; sellers should use seller-scoped order APIs.
- Verification steps: USER A requesting USER B orders should receive 403; unauthenticated request should receive 401.
- Reproducibility note: Changing the URL user id changes the queried order owner without caller verification.
- Estimated complexity: Small

### NX-CRIT-006 - Critical - Checkout identity

- Review status: Confirmed
- Evidence: Reopened app/api/orders/route.tsx. Lines 6-21 parse checkoutFormData.userId from request JSON; lines 39-52 create the Order using that userId; no getServerSession import/use exists in this route.
- File path: app/api/orders/route.tsx:6
- Description: Order creation trusts the client-supplied user id.
- Business impact: Orders can be created under another account, corrupting order ownership, invoice ownership, and customer history.
- Recommended solution: Require getServerSession and derive userId from session.user.id; reject mismatched body ids; validate checkout data server-side.
- Verification steps: Authenticated USER A posting body userId of USER B should create under USER A or fail with 403.
- Reproducibility note: A request body controls the order userId field because the route does not derive identity from a session.
- Estimated complexity: Medium

### NX-HIGH-001 - High - Admin/catalog API authorization

- Review status: Confirmed
- Evidence: Reopened app/api/categories/route.tsx. Lines 21-24 export POST and parse category fields; lines 58-89 create and return a Category; no session or ADMIN check exists. Prior scan also found unauthenticated mutation handlers in banners, coupons, markets, HSN, subcategories, trainings, orders and users.
- File path: app/api/categories/route.tsx:6
- Description: Back-office mutation APIs are largely public.
- Business impact: Unauthenticated users can alter catalog, promotions, tax master, and content data.
- Recommended solution: Add deny-by-default auth wrappers for route handlers and enforce ADMIN/SELLER ownership per resource.
- Verification steps: Unauthenticated POST/PUT/DELETE against catalog routes should return 401; wrong role should return 403.
- Reproducibility note: Unauthenticated catalog mutation handlers can reach Prisma create/update/delete logic unless blocked outside the route.
- Estimated complexity: Large

### NX-HIGH-002 - High - Dashboard authorization

- Review status: Confirmed
- Evidence: Reopened proxy.ts. Lines 3-9 call withAuth with only signIn pages; lines 11-13 match /dashboard/:path*. There is no authorized callback checking token.role or per-route role matrix.
- File path: proxy.ts:3
- Description: Dashboard routing requires login but not role authorization.
- Business impact: A normal USER can potentially access admin or seller pages by URL if page-level checks are absent.
- Recommended solution: Define route-to-role matrix and enforce it in middleware or dashboard layouts plus server-side data access.
- Verification steps: Sign in as USER and request admin/seller dashboard URLs; expect 403/redirect.
- Reproducibility note: Middleware only proves authentication for dashboard URLs; role authorization is not enforced there.
- Estimated complexity: Medium

### NX-HIGH-003 - High - Seller data isolation

- Review status: Confirmed
- Evidence: Reopened app/(back-office)/dashboard/vendor/orders/page.tsx and app/api/sales/route.tsx. Vendor page lines 18-25 fetch all sales via getData("sales") then filter in page code. Sales API lines 4-11 returns db.sale.findMany() without auth/seller scoping.
- File path: app/(back-office)/dashboard/vendor/orders/page.tsx:18
- Description: Seller order filtering is performed after fetching all seller sales data.
- Business impact: Seller data can leak over the API and increases blast radius if a client can call /api/sales directly.
- Recommended solution: Move seller filtering into authenticated server/API query: ADMIN gets all, SELLER gets where vendorId=session.user.id.
- Verification steps: SELLER GET /api/sales should return only own sales; direct API response must not contain other sellers.
- Reproducibility note: Direct GET /api/sales can reach an unscoped sales query; seller isolation is not enforced at the data boundary.
- Estimated complexity: Medium

### NX-HIGH-004 - High - Inventory consistency

- Review status: Confirmed
- Evidence: Reopened app/api/orders/route.tsx. Variable products: lines 81-87 check variant.stock then separately update decrement. Simple products: lines 125-131 check productStock then separately update decrement. Neither update has a stock >= quantity condition.
- File path: app/api/orders/route.tsx:81
- Description: Stock check and decrement are not atomic.
- Business impact: Concurrent purchases can oversell the last unit.
- Recommended solution: Use conditional updateMany with stock >= quantity inside the transaction or row-level locking/serializable transactions.
- Verification steps: Run two concurrent checkout requests for the final unit; only one should commit.
- Reproducibility note: The non-atomic read/check/update pattern is present in code; a concurrent checkout test is still required to observe oversell in a live DB.
- Estimated complexity: Medium

### NX-HIGH-005 - High - Seller-wise inventory

- Review status: Confirmed
- Evidence: Reopened prisma/schema.prisma and checkout route. Inventory model lines 589-608 has sellerId, quantity and reservedQty with @@unique([productId, productVariantId, sellerId]). Checkout route decrements productVariant.stock at lines 84-87 or product.productStock at lines 129-131 and never updates Inventory.
- File path: prisma/schema.prisma:589
- Description: Checkout bypasses the seller-wise Inventory table.
- Business impact: Marketplace stock, seller dashboards, and fulfillment can diverge from actual sellable inventory.
- Recommended solution: Make Inventory the source of truth, reserve stock before payment, and decrement seller-specific rows atomically.
- Verification steps: Checkout should update Inventory.quantity/reservedQty for the correct seller/product/variant.
- Reproducibility note: Checkout code path bypasses the seller-wise Inventory model entirely.
- Estimated complexity: Large

### NX-HIGH-006 - High - GST/order totals

- Review status: Confirmed
- Evidence: Reopened prisma/schema.prisma and checkout route. Order model lines 996-1003 define subtotal, discountTotal, taxableTotal, cgstTotal, sgstTotal, igstTotal, taxTotal and grandTotal defaults. Checkout route creates order items at lines 172-174 and sales at 177-197, then returns the order at line 204 without updating those aggregate fields.
- File path: app/api/orders/route.tsx:172
- Description: Order-level tax and grand totals remain default zero.
- Business impact: Invoices, admin reporting, payment reconciliation and GST returns can be wrong.
- Recommended solution: Aggregate item subtotal, taxable values, CGST/SGST/IGST/cess, discounts and shipping inside the transaction and persist Order and SellerOrder totals.
- Verification steps: Create taxable order and verify Order.subtotal, taxTotal and grandTotal equal item sums.
- Reproducibility note: Order aggregate tax/total fields remain their schema defaults during the observed create-order path.
- Estimated complexity: Medium

### NX-HIGH-007 - High - Production build

- Review status: Confirmed
- Evidence: Reopened app/layout.tsx and reran node_modules\.bin\next.cmd build. app/layout.tsx lines 1 and 5 import/use Inter from next/font/google. Build exited 1 with next/font error: Failed to fetch Inter from Google Fonts, import trace ./app/layout.tsx.
- File path: app/layout.tsx:1
- Description: Production build depends on network access to Google Fonts.
- Business impact: CI or deployment with restricted egress cannot produce a build artifact.
- Recommended solution: Self-host the font with next/font/local or remove external font dependency.
- Verification steps: Run next build with network disabled; build should pass.
- Reproducibility note: Fresh local build in restricted network failed with the cited Google Fonts error.
- Estimated complexity: Small

### NX-HIGH-008 - High - Deployment quality gate

- Review status: Confirmed
- Evidence: Reopened next.config.ts. Lines 16-18 set typescript: { ignoreBuildErrors: true }.
- File path: next.config.ts:16
- Description: Production builds are configured to ignore TypeScript errors.
- Business impact: Broken typed contracts can ship to production even when typecheck fails.
- Recommended solution: Remove ignoreBuildErrors and enforce typecheck before build in CI.
- Verification steps: Introduce a type error in a branch; next build should fail.
- Reproducibility note: Configuration explicitly tells Next.js to allow production builds despite TypeScript errors.
- Estimated complexity: Small

### NX-HIGH-009 - High - Upload security

- Review status: Confirmed
- Evidence: Reopened app/api/uploadthing/core.tsx. Lines 8-49 define multiple Uploadthing file routes directly from createUploadthing; no middleware is chained to require session/role metadata, and onUploadComplete returns hard-coded uploadedBy: "JB".
- File path: app/api/uploadthing/core.tsx:8
- Description: Uploadthing routes lack authenticated ownership/role checks.
- Business impact: Unauthenticated or wrong-role users may upload images into application storage and associate misleading ownership metadata.
- Recommended solution: Add Uploadthing middleware that requires session and route-specific roles; return real user id metadata.
- Verification steps: Unauthenticated upload attempts fail; successful uploads contain session user id.
- Reproducibility note: Upload route authorization is absent in the FileRouter definition; an end-to-end upload attempt should be added once Uploadthing credentials are configured.
- Estimated complexity: Medium

### NX-HIGH-010 - High - Payment/refund flow

- Review status: Confirmed
- Evidence: Reopened components/Checkout/StepForms/PaymentMethodForm.tsx and payment dashboard. Payment form lines 52-95 only renders Cash On Delivery and Credit Card choices and advances Redux state. app/(back-office)/dashboard/payments/page.tsx lines 6-11 loads categories data into payment columns. File inventory found no app/api payment, refund or webhook routes and no refund files.
- File path: components/Checkout/StepForms/PaymentMethodForm.tsx:52
- Description: Payment and refund workflows are placeholders/incomplete.
- Business impact: Orders cannot be reliably paid, refunded, reconciled, or settled for sellers.
- Recommended solution: Implement payment provider integration, payment status webhook, refund model/API, idempotency and reconciliation dashboards.
- Verification steps: End-to-end payment succeeds, webhook updates Payment/Order, refund creates auditable records.
- Reproducibility note: Payment/refund flow is incomplete in code and route inventory.
- Estimated complexity: Large

