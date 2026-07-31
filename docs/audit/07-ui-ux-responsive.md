# UI, UX and Responsive Design

The app has storefront and back-office UI, dashboard tables, checkout steps and product variant editing. Responsive utilities are present, but route-level error/not-found/empty states are thin, and dense product variant tables should receive dedicated responsive QA.

## Confirmed Defects

### NX-MED-004 - Medium - Cart consistency

- Classification: Confirmed defects
- Evidence: Lines 54-56 and 78-82 increment quantity without stock limits; AddToCartButton lines 11-18 dispatches simple products without stock checks.
- File path: redux/slices/cartSlice.ts:54
- Description: Cart can exceed available stock before checkout.
- Business impact: Customers experience late checkout failures and unreliable availability.
- Recommended solution: Carry stock and variant availability into cart items, cap quantity, and revalidate server-side before order placement.
- Verification steps: Product with stock 1 cannot be increased to quantity 2 in cart.
- Estimated complexity: Small

### NX-MED-005 - Medium - Client checkout totals

- Classification: Confirmed defects
- Evidence: Lines 41-45 compute subtotal from cart salePrice; lines 136-143 compute total as shipping plus subtotal only. No GST/discount/seller split is shown.
- File path: components/Checkout/StepForms/OrderSummary.tsx:41
- Description: Checkout UI totals do not include GST tax lines.
- Business impact: Customer-facing total may differ from statutory invoice/payment totals.
- Recommended solution: Fetch server-priced checkout quote including GST, shipping, discounts and grand total; render CGST/SGST/IGST breakdown.
- Verification steps: Checkout for taxable item displays matching tax and grand total returned by server quote API.
- Estimated complexity: Medium

### NX-MED-007 - Medium - App Router error states

- Classification: Architecture concerns
- Evidence: Only app/loading.tsx exists; repository inventory found no error.tsx or not-found.tsx files. Localized pages use notFound(), but no custom not-found boundary exists.
- File path: app/loading.tsx:1
- Description: Error and not-found handling is incomplete across route groups.
- Business impact: Users see generic failures and recovery paths during broken fetches or missing products/categories.
- Recommended solution: Add route-group error.tsx, not-found.tsx, and empty states for storefront and dashboard tables.
- Verification steps: Force product/category/order not found and API failure; UI shows branded actionable states.
- Estimated complexity: Medium

### NX-MED-010 - Medium - Image optimization

- Classification: Confirmed defects
- Evidence: Lines 52 and 69 use raw img tags with empty alt text; other raw img usage appears in BlogCard, blogs detail, Footer, RecentTrainings and OrderCard.
- File path: components/frontend/ProductImageCarousel.tsx:52
- Description: Key product/content images bypass next/image optimization and have weak alt text.
- Business impact: Slower LCP, poorer accessibility and less predictable image sizing.
- Recommended solution: Use next/image with stable dimensions/sizes and meaningful alt text for product/content images.
- Verification steps: Lighthouse image audits pass and product carousel images expose meaningful accessible names.
- Estimated complexity: Medium

## Optional Improvements

### NX-LOW-004 - Low - Accessibility

- Classification: Optional improvements
- Evidence: Lines 37-49 render input and error text, but do not set aria-invalid or aria-describedby linking the error.
- File path: components/FormInputs/TextInput.tsx:37
- Description: Form error accessibility can be improved.
- Business impact: Screen-reader users may not receive clear field error context.
- Recommended solution: Add stable error ids, aria-invalid and aria-describedby across form inputs.
- Verification steps: Accessibility test verifies errored fields announce labels and errors.
- Estimated complexity: Small

