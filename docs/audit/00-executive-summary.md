# Nxbazaar.in Complete Read-Only Audit

Audit date: 2026-07-25

## Task 1 Update - 2026-07-25

Task 1 was completed for Auth.js v5 migration verification and AI MVP verification.

Completed:

- Auth.js v5 structure is active: root `auth.ts`, exported `handlers`, `auth`, `signIn`, `signOut`, and route handler exports.
- Declared and installed `next-auth` version is `5.0.0-beta.32`.
- Prisma Auth.js adapter models were added in a non-destructive migration.
- Credentials sign-in policy was fixed and tested.
- AI MVP routes were verified and targeted gaps were fixed for authorization, ownership, draft validation, and product-form draft workflow.
- Focused tests were added for auth policy and AI MVP safety.

Not completed:

- pnpm remains blocked by an external store/database permission problem at `C:\pnpm-store\v11`.
- Customer support assistant, review summary endpoint, category suggestion endpoint, streaming responses, and browser E2E AI tests remain future work.

Historical note from the original read-only audit: no application source files were modified in that pass, and the only files written were audit artifacts under docs/audit. Task 1 later modified auth, AI, Prisma, tests, and report files as summarized above. AGENTS.md was requested first; no AGENTS.md exists in the inspected repository tree, and .agents is empty.

## Repository Snapshot

- Files inspected: 411 outside .git, .next, node_modules, .pnpm-home and .pnpm-store.
- TypeScript/TSX files: 353.
- API route files: 46.
- App Router page files: 64.
- Main areas: app/(front-end), app/(back-office), app/[lang], app/api, components, lib, actions, redux, prisma, workers, scripts.

## Commands Executed

- Read AGENTS.md: FAILED - No AGENTS.md found anywhere outside .git, .next, node_modules, .pnpm-home, .pnpm-store.
- Inspect complete repository: PASSED - 411 files inspected outside generated/vendor/cache directories after docs/audit existed; 353 TS/TSX files, 46 API route files, 64 page files.
- pnpm --version / pnpm install / pnpm scripts: FAILED - pnpm invocation in this sandbox previously failed with "unable to open database file" and then hung when invoked in sequences. Direct local binaries were used for verification evidence.
- node_modules\.bin\eslint.cmd .: PASSED - Exit code 0.
- node_modules\.bin\tsc.cmd --noEmit: PASSED - Exit code 0.
- node_modules\.bin\prisma.cmd validate: PASSED - Exit code 0; schema at prisma/schema.prisma is valid.
- node_modules\.bin\prisma.cmd generate: PASSED - Exit code 0; Prisma Client v7.9.0 generated.
- node_modules\.bin\next.cmd build: FAILED - Exit code 1; next/font/google failed to fetch Inter from fonts.googleapis.com, import trace app/layout.tsx.
- node_modules\.bin\tsx.cmd scripts/test-translation-queue.ts: PASSED - Exit code 0; translation queue tests passed.
- node_modules\.bin\tsx.cmd scripts/check-redis.ts: FAILED - Exit code 1; REDIS_URL is not configured.

## Findings by Severity

- Critical: 6
- High: 10
- Medium: 15
- Low: 4
- Info: 2

## Top 10 Recommended Actions

1. Protect public mutation and list API routes with centralized auth/role/scope wrappers.
2. Fix password reset and email verification token validation immediately.
3. Derive checkout userId from the authenticated session and validate checkout payloads server-side.
4. Make stock decrement atomic and move checkout to seller-wise Inventory as source of truth.
5. Persist order, seller-order and invoice GST totals from immutable item tax snapshots.
6. Self-host fonts so production builds do not require Google Fonts network access.
7. Remove typescript.ignoreBuildErrors and enforce typecheck/build in CI.
8. Add payment provider webhook, refund, return and reconciliation workflows.
9. Add full Zod schemas for products, checkout, auth and admin CRUD APIs.
10. Add pnpm test with coverage for auth, checkout, tax, inventory and seller isolation.

## Audit Scope Coverage

Covered: repository structure, package scripts, dependency signals, App Router, component boundaries, TypeScript strictness, auth/session, ADMIN/SELLER/USER authorization, seller isolation, Prisma schema, indexes/uniqueness, API routes/server actions, Zod coverage, security, env handling, catalog workflows, HSN/GST, SKU/barcode generation, inventory/order consistency, cart/checkout/payment/refunds, product history/audit logs, multilingual implementation, states, UI/responsive, accessibility, SEO, image optimization, performance, tests, deployment readiness and missing marketplace features.


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

- Review status: Fixed in Task 1
- Evidence: Reopened `auth.ts` and `proxy.ts`; Auth.js v5 proxy protects `/admin`, `/seller`, `/dashboard`, `/account`, and `/checkout` with role checks.
- File path: auth.ts
- Description: Dashboard and protected route authorization now has role checks.
- Business impact: A normal USER should not access admin or seller-only routes through direct URLs.
- Recommended solution: Keep route-role matrix centralized in `auth.ts`/`canAccessDashboardPath` and add browser E2E coverage.
- Verification steps: Sign in as USER and request admin/seller dashboard URLs; expect 403/redirect.
- Reproducibility note: The original `withAuth` issue is no longer reproducible in live source after Task 1.
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

Fixed findings:

- NX-HIGH-004: Fixed with atomic conditional checkout stock decrements.
- NX-HIGH-006: Fixed with persisted order GST totals and seller settlement totals.

Partially fixed finding:

- NX-HIGH-005: Checkout now updates seller-wise Inventory rows, but full database enforcement still needs a duplicate-data preflight and PostgreSQL partial unique index for simple-product inventory rows.

No migration was created in this pass; the remaining schema change has no intended data loss but can fail if duplicate simple-product Inventory rows already exist.
