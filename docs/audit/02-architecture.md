# Architecture and App Router

The project uses App Router route groups for storefront, back-office dashboard and localized pages. API routes and server actions are mixed with direct Prisma calls in route handlers and component-driven fetch helpers. Translation workers and Redis queue code are separated under workers/lib.

## Architecture Concerns

### NX-MED-008 - Medium - Server/client boundaries

- Classification: Technical debt
- Evidence: Static scan found React Redux hooks in components/Checkout/NavButtons.tsx and components/Onboarding/NavButtons.tsx without a top-level "use client" directive.
- File path: components/Checkout/NavButtons.tsx:5
- Description: Some hook-using components rely on being imported only from client parents instead of declaring their own client boundary.
- Business impact: Future server imports can cause App Router build/runtime errors.
- Recommended solution: Add explicit "use client" to hook-using components or split server/client components clearly.
- Verification steps: Import components from server page in a test branch; build should not fail due missing client directive.
- Estimated complexity: Small

### NX-INFO-001 - Info - Repository structure

- Classification: Architecture concerns
- Evidence: Repository has route groups for app/(front-end), app/(back-office), app/[lang], API routes, lib, actions, redux, workers and Prisma migrations.
- File path: app/(back-office)/dashboard:1
- Description: The high-level structure matches a Next.js App Router marketplace, but domain boundaries are split across routes, actions and components.
- Business impact: Feature work can become inconsistent unless domain services and auth policies are centralized.
- Recommended solution: Document module boundaries and centralize domain services for checkout, catalog, tax, inventory and auth.
- Verification steps: New features can be implemented through documented service APIs with tests.
- Estimated complexity: Medium

## Confirmed Defects

### NX-MED-007 - Medium - App Router error states

- Classification: Architecture concerns
- Evidence: Only app/loading.tsx exists; repository inventory found no error.tsx or not-found.tsx files. Localized pages use notFound(), but no custom not-found boundary exists.
- File path: app/loading.tsx:1
- Description: Error and not-found handling is incomplete across route groups.
- Business impact: Users see generic failures and recovery paths during broken fetches or missing products/categories.
- Recommended solution: Add route-group error.tsx, not-found.tsx, and empty states for storefront and dashboard tables.
- Verification steps: Force product/category/order not found and API failure; UI shows branded actionable states.
- Estimated complexity: Medium

