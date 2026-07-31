# Database, Prisma, Relations and Query Performance

Prisma validation passed. The schema includes products, variants, HSN codes, orders, order items, seller orders, inventory, payments, seller wallets/payouts and audit logs. Indexes and uniqueness constraints exist for several high-value relations: product slug, variant sku/barcode/productCode, inventory product/variant/seller uniqueness, order status/payment indexes, seller order uniqueness and wallet seller uniqueness.

## Confirmed Defects

### NX-HIGH-004 - High - Inventory consistency

- Classification: Confirmed defects
- Evidence: Lines 81-87 check variant.stock then decrement in a separate update; lines 125-131 do the same for product.productStock.
- File path: app/api/orders/route.tsx:81
- Description: Stock check and decrement are not atomic.
- Business impact: Concurrent purchases can oversell the last unit.
- Recommended solution: Use conditional updateMany with stock >= quantity inside the transaction or row-level locking/serializable transactions.
- Verification steps: Run two concurrent checkout requests for the final unit; only one should commit.
- Estimated complexity: Medium

### NX-HIGH-005 - High - Seller-wise inventory

- Classification: Confirmed defects
- Evidence: Inventory model exists at lines 589-608 with sellerId, quantity and reservedQty, but checkout decrements ProductVariant.stock/Product.productStock in app/api/orders/route.tsx lines 84-87 and 129-131.
- File path: prisma/schema.prisma:589
- Description: Checkout bypasses the seller-wise Inventory table.
- Business impact: Marketplace stock, seller dashboards, and fulfillment can diverge from actual sellable inventory.
- Recommended solution: Make Inventory the source of truth, reserve stock before payment, and decrement seller-specific rows atomically.
- Verification steps: Checkout should update Inventory.quantity/reservedQty for the correct seller/product/variant.
- Estimated complexity: Large

### NX-HIGH-006 - High - GST/order totals

- Classification: Confirmed defects
- Evidence: Order model has subtotal/tax/grandTotal at prisma/schema.prisma lines 996-1003; checkout creates order items at lines 172-174 and sales at 177-197, but never updates Order totals.
- File path: app/api/orders/route.tsx:172
- Description: Order-level tax and grand totals remain default zero.
- Business impact: Invoices, admin reporting, payment reconciliation and GST returns can be wrong.
- Recommended solution: Aggregate item subtotal, taxable values, CGST/SGST/IGST/cess, discounts and shipping inside the transaction and persist Order and SellerOrder totals.
- Verification steps: Create taxable order and verify Order.subtotal, taxTotal and grandTotal equal item sums.
- Estimated complexity: Medium

## Missing Features

### NX-MED-013 - Medium - Product audit logs

- Classification: Missing features
- Evidence: AuditLog model exists at lines 1268-1276, and ProductHistory exists in schema, but feature inventory found no audit/history routes or dashboard pages outside schema/product history writes.
- File path: prisma/schema.prisma:1268
- Description: Audit trail is modeled but not exposed as a reviewable admin/seller feature.
- Business impact: Operational teams cannot trace changes, investigate disputes or satisfy audit requirements efficiently.
- Recommended solution: Create audit log service and dashboards for product, order, inventory, HSN and user role changes.
- Verification steps: Changing product/HSN/order status creates visible immutable audit entries with actor and before/after values.
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

## Ecommerce Data Fix Verification - 2026-07-25

Fixed findings:

- NX-HIGH-004: Fixed. Checkout now uses conditional `updateMany` guards for variant stock and simple product stock in `app/api/orders/route.tsx`, requiring `stock >= quantity` or `productStock >= quantity` before decrementing.
- NX-HIGH-006: Fixed. Checkout now persists `Order` aggregate subtotal, taxable, CGST, SGST, IGST, tax and grand total fields from immutable item tax snapshots, creates `SellerOrder` settlement totals, and links order items to the seller order.

Partially fixed finding:

- NX-HIGH-005: Partially fixed. Checkout now updates seller-wise `Inventory` rows in the same transaction and rejects checkout when an existing seller inventory row lacks quantity. No migration was created because PostgreSQL can still allow duplicate simple-product `Inventory` rows under the nullable `productVariantId` composite unique constraint. The safe schema follow-up is a duplicate preflight, then a partial unique index on `Inventory(productId, sellerId) WHERE productVariantId IS NULL`; rollback is dropping that partial index.

Verification commands:

- `node_modules\.bin\eslint.cmd app/api/orders/route.tsx lib/orders/checkout-calculations.ts`: passed
- `npm test -- --test-reporter=spec`: passed, 15 tests
- `node_modules\.bin\eslint.cmd .`: passed
- `node_modules\.bin\tsc.cmd --noEmit`: passed
