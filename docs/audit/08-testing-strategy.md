# Testing Strategy

Current verification has lint, typecheck, Prisma validation/generation and one translation queue script. There is no standard pnpm test script.

## Technical Debt

### NX-LOW-002 - Low - Package scripts

- Classification: Technical debt
- Evidence: Scripts include dev/build/start/lint/typecheck and translation/redis helpers, but no general "test" script.
- File path: package.json:6
- Description: There is no standard test command.
- Business impact: CI cannot run a unified regression suite for checkout, auth, inventory and tax logic.
- Recommended solution: Add a test runner and define pnpm test; keep test:translations as a targeted script.
- Verification steps: pnpm test runs unit/integration tests and exits nonzero on failures.
- Estimated complexity: Medium


## Recommended Coverage

1. Unit tests: GST calculation, HSN resolution, product variant validation, SKU/barcode generation, env validation and permission helpers.
2. API tests: users, password reset, verification, orders, HSN, catalog mutations, uploads and seller sales isolation.
3. Integration tests: checkout identity, stock concurrency, order totals, seller inventory and invoice snapshots.
4. UI tests: cart limits, checkout quote display, localized routes, dashboard empty/error states and accessibility basics.
