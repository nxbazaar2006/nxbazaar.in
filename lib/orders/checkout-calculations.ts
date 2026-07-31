export type CheckoutCalculationItem = {
  vendorId: string;
  subtotal: number;
  discount?: number | null;
  taxableValue: number;
  cgstAmount?: number | null;
  sgstAmount?: number | null;
  igstAmount?: number | null;
  taxAmount?: number | null;
  commissionAmount?: number | null;
};

export type OrderTotals = {
  subtotal: number;
  discountTotal: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
};

export type SellerOrderTotals = OrderTotals & {
  sellerId: string;
  shippingTotal: number;
  commissionTotal: number;
  sellerPayable: number;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateOrderTotals(
  items: CheckoutCalculationItem[],
  shippingCost = 0
): OrderTotals {
  const totals = items.reduce(
    (acc, item) => {
      acc.subtotal += item.subtotal;
      acc.discountTotal += item.discount ?? 0;
      acc.taxableTotal += item.taxableValue;
      acc.cgstTotal += item.cgstAmount ?? 0;
      acc.sgstTotal += item.sgstAmount ?? 0;
      acc.igstTotal += item.igstAmount ?? 0;
      acc.taxTotal += item.taxAmount ?? 0;
      return acc;
    },
    {
      subtotal: 0,
      discountTotal: 0,
      taxableTotal: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
    }
  );

  return {
    subtotal: roundMoney(totals.subtotal),
    discountTotal: roundMoney(totals.discountTotal),
    taxableTotal: roundMoney(totals.taxableTotal),
    cgstTotal: roundMoney(totals.cgstTotal),
    sgstTotal: roundMoney(totals.sgstTotal),
    igstTotal: roundMoney(totals.igstTotal),
    taxTotal: roundMoney(totals.taxTotal),
    grandTotal: roundMoney(totals.taxableTotal + totals.taxTotal + shippingCost),
  };
}

export function calculateSellerOrderTotals(
  items: CheckoutCalculationItem[]
): SellerOrderTotals[] {
  const grouped = new Map<string, CheckoutCalculationItem[]>();
  for (const item of items) {
    const sellerItems = grouped.get(item.vendorId) ?? [];
    sellerItems.push(item);
    grouped.set(item.vendorId, sellerItems);
  }

  return Array.from(grouped.entries()).map(([sellerId, sellerItems]) => {
    const totals = calculateOrderTotals(sellerItems, 0);
    const commissionTotal = roundMoney(
      sellerItems.reduce((sum, item) => sum + (item.commissionAmount ?? 0), 0)
    );

    return {
      ...totals,
      sellerId,
      shippingTotal: 0,
      commissionTotal,
      sellerPayable: roundMoney(totals.taxableTotal + totals.taxTotal - commissionTotal),
    };
  });
}
