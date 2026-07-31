# Seller Feature Roadmap

## Seller Feature Matrix

| Feature | Classification | Stage | Priority |
| --- | --- | --- | --- |
| Seller dashboard access and isolation | Existing and complete | P0 | Critical |
| Seller product management | Existing but incomplete | P0 | Critical |
| Seller inventory management | Existing but incomplete | P0 | Critical |
| Seller orders and fulfillment | Existing but incomplete | P0 | High |
| Seller settlements and wallet | Existing but incomplete | P1 | High |
| Seller product history | Existing but incomplete | P1 | Medium |
| Seller returns/refunds handling | Missing and required for MVP | P1 | Medium |
| Seller analytics | Missing and recommended after MVP | P2 | Medium |

## P0 Required Before Production

### Seller Dashboard Access And Data Isolation

- User role: SELLER.
- Classification: Existing and complete.
- Current implementation evidence: `proxy.ts` route matrix; `app/api/sales/route.tsx` scopes non-admin sales to `vendorId=session.user.id`; fixed audit `NX-HIGH-003`.
- Business value: Sellers can operate without seeing other sellers' data.
- Security considerations: Every seller query must filter by seller id on the server.
- Database changes: None.
- API/server action changes: Maintain seller scoping on new product, order, payout and inventory routes.
- UI pages/components: `app/(back-office)/dashboard/vendor/orders/page.tsx`, sales dashboard.
- Required tests: Seller A cannot read or mutate Seller B resources.
- Dependencies: Auth session and roles.
- Complexity: Medium.
- Priority: P0 Critical.

### Seller Product Management

- Classification: Existing but incomplete.
- User role: SELLER.
- Current implementation evidence: Product dashboard/form exists under `app/(back-office)/dashboard/(catalogue)/products`; APIs exist under `app/api/products`; variant logic exists in `lib/product-variants.ts`; audit `NX-MED-003` confirms incomplete product validation.
- Business value: Sellers can onboard catalog inventory.
- Security considerations: Sellers can only create/edit their own products; product approval controls if required.
- Database changes: Optional partial unique indexes for simple product identifiers after duplicate preflight.
- API/server action changes: Full product Zod schema and consistent identifier normalization.
- UI pages/components: Product create/update forms, variant selector fields.
- Required tests: Seller ownership, validation errors, duplicate SKU/barcode, variant sync.
- Dependencies: Category/subcategory/HSN master data.
- Complexity: Medium.
- Priority: P0 Critical.

### Seller Inventory Management

- Classification: Existing but incomplete.
- User role: SELLER.
- Current implementation evidence: `Inventory` model exists; checkout updates Inventory partially; audit `NX-HIGH-005` remains partially fixed because Inventory is not fully source-of-truth and nullable composite uniqueness allows simple-product duplicates.
- Business value: Accurate seller stock, fewer oversells, better fulfillment.
- Security considerations: Seller inventory APIs must scope by seller id.
- Database changes: Partial unique index for simple-product Inventory rows; possible InventoryTransaction ledger table if adjustment history must be immutable.
- API/server action changes: Inventory adjustment endpoints with reason codes and audit records.
- UI pages/components: Seller stock management page, low-stock alerts.
- Required tests: Concurrent update, duplicate simple Inventory prevention, seller scope, adjustment history.
- Dependencies: Migration preflight, product/variant identifiers.
- Complexity: Large.
- Priority: P0 Critical.

### Seller Orders And Fulfillment

- Classification: Existing but incomplete.
- User role: SELLER.
- Current implementation evidence: `SellerOrder` and `Shipment` models exist; seller vendor orders page exists; checkout creates SellerOrder totals; fulfillment actions were not confirmed complete in audit.
- Business value: Sellers can fulfill their portion of marketplace orders.
- Security considerations: Seller sees only own SellerOrder and shipment records.
- Database changes: May need shipment event history and carrier metadata.
- API/server action changes: Seller order status and shipment tracking endpoints.
- UI pages/components: Vendor orders page, order detail, shipment controls.
- Required tests: Seller status transitions, shipment ownership, customer notification triggers.
- Dependencies: Order creation and seller split.
- Complexity: Medium.
- Priority: P0 High.

## P1 Required For Marketplace MVP

### Seller Settlements And Wallet

- Classification: Existing but incomplete.
- User role: SELLER.
- Current implementation evidence: `SellerWallet`, `WalletTransaction`, `SellerPayout`, and wallet dashboard exist; audit `NX-MED-015` notes seller wallet models exist but payment/refund workflows are incomplete.
- Business value: Seller payout transparency.
- Security considerations: Immutable ledger, no seller self-approval of payouts, refund reversals reflected.
- Database changes: Possible payout batch/reconciliation provider fields.
- API/server action changes: Seller payout request and wallet ledger read endpoints.
- UI pages/components: `app/(back-office)/dashboard/wallet/page.tsx`.
- Required tests: Balance calculation, payout request limits, refund reversal.
- Dependencies: Payment capture, refund lifecycle, SellerOrder totals.
- Complexity: Large.
- Priority: P1 High.

### Seller Product History

- Classification: Existing but incomplete.
- User role: SELLER.
- Current implementation evidence: `ProductHistory` model and product route writes exist; no reviewable seller UI confirmed by audit `NX-MED-013`.
- Business value: Sellers can audit catalog changes and resolve disputes.
- Security considerations: Sellers only see history for own products.
- Database changes: Optional indexes by sellerCode/createdAt.
- API/server action changes: Product history endpoint scoped by seller.
- UI pages/components: Product detail history tab.
- Required tests: Scope, append-only records, pagination.
- Dependencies: Product management.
- Complexity: Medium.
- Priority: P1 Medium.

### Seller Returns And Refund Handling

- Classification: Missing and required for MVP.
- User role: SELLER.
- Current implementation evidence: Audit `NX-HIGH-010` and `NX-MED-015` found no refund/return files or payment webhook routes.
- Business value: Enables post-purchase operations and customer support.
- Security considerations: Sellers can approve/reject only their SellerOrder items according to policy.
- Database changes: Return/RMA and refund linkage if not modeled.
- API/server action changes: Return request review, refund recommendation, restock endpoint.
- UI pages/components: Seller order return queue.
- Required tests: Seller scope, status transitions, restock correctness.
- Dependencies: Payment/refund lifecycle and Inventory.
- Complexity: Large.
- Priority: P1 Medium.

## P2 Important Growth Features

### Seller Analytics

- Classification: Missing and recommended after MVP.
- User role: SELLER.
- Current implementation evidence: Sales page exists, but audit only confirmed seller scoping, not full analytics.
- Business value: Helps sellers optimize inventory and pricing.
- Security considerations: Strict seller-only metrics.
- Database changes: Optional reporting tables/materialized views.
- API/server action changes: Seller metrics endpoint with date filters.
- UI pages/components: Seller dashboard charts.
- Required tests: Metrics scope and correctness.
- Dependencies: Order/payment correctness.
- Complexity: Medium.
- Priority: P2 Medium.
