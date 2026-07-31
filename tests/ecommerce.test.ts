import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateOrderTotals,
  calculateSellerOrderTotals,
} from "../lib/orders/checkout-calculations";
import { calculateGst } from "../lib/tax/gst";

describe("GST calculations", () => {
  it("splits intrastate taxable GST into CGST and SGST", () => {
    const tax = calculateGst({
      taxableAmount: 1000,
      gstRate: 18,
      sellerStateCode: "MH",
      customerStateCode: "MH",
      taxTreatment: "TAXABLE",
    });

    assert.equal(tax.cgstAmount, 90);
    assert.equal(tax.sgstAmount, 90);
    assert.equal(tax.igstAmount, 0);
    assert.equal(tax.totalTax, 180);
  });

  it("uses IGST for interstate taxable GST", () => {
    const tax = calculateGst({
      taxableAmount: 1000,
      gstRate: 18,
      sellerStateCode: "MH",
      customerStateCode: "KA",
      taxTreatment: "TAXABLE",
    });

    assert.equal(tax.cgstAmount, 0);
    assert.equal(tax.sgstAmount, 0);
    assert.equal(tax.igstAmount, 180);
    assert.equal(tax.totalTax, 180);
  });

  it("does not add tax for exempt treatment", () => {
    const tax = calculateGst({
      taxableAmount: 1000,
      gstRate: 18,
      sellerStateCode: "MH",
      customerStateCode: "KA",
      taxTreatment: "EXEMPT",
    });

    assert.equal(tax.totalTax, 0);
  });
});

describe("checkout total snapshots", () => {
  const items = [
    {
      vendorId: "seller-a",
      subtotal: 1000,
      taxableValue: 1000,
      cgstAmount: 90,
      sgstAmount: 90,
      igstAmount: 0,
      taxAmount: 180,
      commissionAmount: 50,
    },
    {
      vendorId: "seller-b",
      subtotal: 500,
      taxableValue: 500,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 60,
      taxAmount: 60,
      commissionAmount: 25,
    },
  ];

  it("persists order totals from immutable item tax snapshots", () => {
    assert.deepEqual(calculateOrderTotals(items, 40), {
      subtotal: 1500,
      discountTotal: 0,
      taxableTotal: 1500,
      cgstTotal: 90,
      sgstTotal: 90,
      igstTotal: 60,
      taxTotal: 240,
      grandTotal: 1780,
    });
  });

  it("builds seller settlement totals from the same item snapshots", () => {
    assert.deepEqual(calculateSellerOrderTotals(items), [
      {
        sellerId: "seller-a",
        subtotal: 1000,
        discountTotal: 0,
        taxableTotal: 1000,
        cgstTotal: 90,
        sgstTotal: 90,
        igstTotal: 0,
        taxTotal: 180,
        grandTotal: 1180,
        shippingTotal: 0,
        commissionTotal: 50,
        sellerPayable: 1130,
      },
      {
        sellerId: "seller-b",
        subtotal: 500,
        discountTotal: 0,
        taxableTotal: 500,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 60,
        taxTotal: 60,
        grandTotal: 560,
        shippingTotal: 0,
        commissionTotal: 25,
        sellerPayable: 535,
      },
    ]);
  });
});
