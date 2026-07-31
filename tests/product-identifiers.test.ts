import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { barcodeFromSku, createSkuCode, generateSku } from "../lib/sku-generator";

describe("product identifier formatting", () => {
  it("builds uppercase 3-character codes where possible", () => {
    assert.equal(createSkuCode("Vaibhav Store"), "VAI");
    assert.equal(createSkuCode("Black"), "BLK");
    assert.equal(createSkuCode("M"), "M");
    assert.equal(createSkuCode("XL"), "XLX");
  });

  it("generates variant SKUs with a 6-digit sequence", () => {
    assert.equal(
      generateSku({
        vendor: "Vaibhav Store",
        category: "T Shirt",
        subCategory: "Men",
        color: "Black",
        size: "M",
        variantNo: 4,
      }),
      "VAI-TSH-MEN-BLK-M-000004"
    );
  });

  it("uses the SKU as the Code128 barcode value", () => {
    const sku = "VAI-TSH-MEN-BLK-L-000005";
    assert.equal(barcodeFromSku(sku), sku);
  });
});
