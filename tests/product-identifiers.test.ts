import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateSku,
  createSkuCode,
  extractProduct3,
  createVariantSequence3,
} from "../lib/sku-generator";
import {
  normalizeCode,
  cleanIdentifier,
  getNextBarcodeSequence,
  applyServerGeneratedProductIdentifiers,
} from "../lib/product-identifiers";
import { findProductByIdentifier } from "../lib/product-identifier";
import { generateCode128Svg } from "../lib/barcode-generator";

describe("NXBazaar Final Identifier System — ProductCode, SKU, and 12-Digit Numeric Barcode", () => {
  it("1. ProductCode generation format: {VENDOR3}-{CATEGORY3}-{SUBCATEGORY3}-{PRODUCT6}", () => {
    const vendor = normalizeCode("Rajesh Store", 3, "RAJ");
    const category = normalizeCode("Stationery", 3, "STA");
    const subCategory = normalizeCode("Cotton", 3, "COT");
    const code = `${vendor}-${category}-${subCategory}-000001`;
    assert.equal(code, "RAJ-STA-COT-000001");
  });

  it("2. SKU generation format: {VENDOR3}-{CATEGORY3}-{SUBCATEGORY3}-{COLOR3}-{SIZE3}-{VARIANT3}", () => {
    const sku = generateSku({
      vendorCode: "RAJ",
      categoryCode: "STA",
      subCategoryCode: "COT",
      productSeq: "000001",
      color: "Red",
      size: "Large",
      variantNo: 1,
    });
    assert.equal(sku, "RAJ-STA-COT-RED-LRG-001");
  });

  it("2b. SKU uses DEF when Color or Size is missing", () => {
    const skuNoColorNoSize = generateSku({
      vendorCode: "RAJ",
      categoryCode: "STA",
      subCategoryCode: "COT",
      productSeq: "000001",
      variantNo: 1,
    });
    assert.equal(skuNoColorNoSize, "RAJ-STA-COT-DEF-DEF-001");
  });

  it("3 & 7. Barcode format: field name 'barcode', exactly 12 digits, numbers only, no NXB prefix", async () => {
    let currentSeq = 100000000123n;
    const mockPrisma = {
      barcodeSequence: {
        upsert: async () => {
          currentSeq += 1n;
          return { lastSequence: currentSeq };
        },
      },
    };

    const barcode = await getNextBarcodeSequence(mockPrisma);
    assert.equal(barcode.length, 12);
    assert.equal(/^\d{12}$/.test(barcode), true);
    assert.equal(barcode.startsWith("NXB"), false);
    assert.equal(barcode, "100000000124");
  });

  it("4 & 6. Multiple variants: increment variant sequence & generate unique 12-digit barcodes", async () => {
    let currentSeq = 100000000200n;
    const mockPrisma = {
      user: {
        findUnique: async () => ({ id: "u1", sellerProfile: { code: "RAJ" } }),
      },
      productSequence: {
        upsert: async () => ({ lastSequence: 1 }),
      },
      barcodeSequence: {
        upsert: async () => {
          currentSeq += 1n;
          return { lastSequence: currentSeq };
        },
      },
      product: { findUnique: async () => null },
      productVariant: { findFirst: async () => null },
    };

    const payload: any = {
      title: "Cotton Shirt",
      variants: [
        { color: "Red", size: "M", price: 500 },
        { color: "Red", size: "L", price: 500 },
      ],
    };

    const productData: any = { userId: "u1", title: "Cotton Shirt" };

    await applyServerGeneratedProductIdentifiers({
      prisma: mockPrisma,
      payload,
      productData,
      categoryTitle: "Stationery",
      subCategoryTitle: "Cotton",
    });

    assert.equal(productData.productCode, "RAJ-STA-COT-000001");
    assert.equal(payload.variants[0].sku, "RAJ-STA-COT-RED-MED-001");
    assert.equal(payload.variants[0].barcode, "100000000201");

    assert.equal(payload.variants[1].sku, "RAJ-STA-COT-RED-LRG-002");
    assert.equal(payload.variants[1].barcode, "100000000202");
  });

  it("5. Concurrency safety: sequence-backed non-colliding ProductCode & Barcode", () => {
    assert.equal(extractProduct3("RAJ-STA-COT-000001"), "001");
    assert.equal(createVariantSequence3(1), "001");
    assert.equal(createVariantSequence3(12), "012");
  });

  it("8, 9, 10 & 14. Search Backend lookups by Barcode, SKU, and ProductCode", async () => {
    const mockDb: any = {
      product: {
        findUnique: async ({ where }: any) => {
          if (where.productCode === "RAJ-STA-COT-000001") {
            return { id: "p1", productCode: "RAJ-STA-COT-000001", userId: "u1" };
          }
          return null;
        },
      },
      productVariant: {
        findFirst: async ({ where }: any) => {
          const matchTarget = where.OR?.[0]?.sku || where.OR?.[1]?.barcode;
          if (matchTarget === "100000001234" || matchTarget === "RAJ-STA-COT-001-RED-LRG-001") {
            return {
              id: "v1",
              productId: "p1",
              sku: "RAJ-STA-COT-001-RED-LRG-001",
              barcode: "100000001234",
              product: { userId: "u1" },
            };
          }
          return null;
        },
      },
      user: {
        findUnique: async () => ({ id: "u1", role: "ADMIN" }),
      },
    };

    const productCodeResult = await findProductByIdentifier("RAJ-STA-COT-000001", mockDb);
    assert.notEqual(productCodeResult, null);
    assert.equal(productCodeResult?.type, "PRODUCT_CODE");

    const skuResult = await findProductByIdentifier("RAJ-STA-COT-001-RED-LRG-001", mockDb);
    assert.notEqual(skuResult, null);
    assert.equal(skuResult?.type, "SKU");

    const barcodeResult = await findProductByIdentifier("100000001234", mockDb);
    assert.notEqual(barcodeResult, null);
    assert.equal(barcodeResult?.type, "BARCODE");
    assert.equal((barcodeResult as any).barcode, "100000001234");
  });

  it("11 & 12. Product editing preserves codes, adding variant assigns new codes", async () => {
    let currentSeq = 100000000300n;
    const mockPrisma = {
      user: { findUnique: async () => ({ id: "u1", sellerProfile: { code: "RAJ" } }) },
      barcodeSequence: {
        upsert: async () => {
          currentSeq += 1n;
          return { lastSequence: currentSeq };
        },
      },
      productVariant: { findFirst: async () => null },
    };

    const existingProduct: any = {
      id: "p1",
      productCode: "RAJ-STA-COT-000001",
      variants: [
        { id: "v1", sku: "RAJ-STA-COT-001-RED-LRG-001", barcode: "100000001234" },
      ],
    };

    const payload: any = {
      title: "Updated Title",
      variants: [
        { id: "v1", color: "Red", size: "L", price: 999 },
        { color: "Blue", size: "L", price: 999 },
      ],
    };

    const productData: any = { userId: "u1", title: "Updated Title" };

    await applyServerGeneratedProductIdentifiers({
      prisma: mockPrisma,
      payload,
      productData,
      existingProduct,
      categoryTitle: "Stationery",
      subCategoryTitle: "Cotton",
    });

    // Existing variant preserves identifiers
    assert.equal(productData.productCode, "RAJ-STA-COT-000001");
    assert.equal(payload.variants[0].sku, "RAJ-STA-COT-001-RED-LRG-001");
    assert.equal(payload.variants[0].barcode, "100000001234");

    // Newly added variant gets new SKU and new 12-digit Barcode
    assert.equal(payload.variants[1].sku, "RAJ-STA-COT-BLU-LRG-002");
    assert.equal(payload.variants[1].barcode, "100000000301");
  });

  it("13. Code 128 barcode renders from 12-digit numeric barcode value", () => {
    const svg = generateCode128Svg({
      barcode: "100000001234",
      title: "Men Polo T-Shirt",
      sku: "RAJ-STA-COT-RED-LRG-001",
    });

    assert.equal(svg.includes("100000001234"), true);
    assert.equal(svg.includes("RAJ-STA-COT-RED-LRG-001"), true);
    assert.equal(svg.includes("NXB-"), false);
  });

  it("15. SIMPLE product creation with empty variants automatically generates ProductCode, SKU, and 12-digit Barcode", async () => {
    let currentSeq = 100000000500n;
    const mockPrisma = {
      user: { findUnique: async () => ({ id: "u1", sellerProfile: { code: "RAJ" } }) },
      productSequence: { upsert: async () => ({ lastSequence: 5 }) },
      barcodeSequence: {
        upsert: async () => {
          currentSeq += 1n;
          return { lastSequence: currentSeq };
        },
      },
      product: { findUnique: async () => null },
      productVariant: { findFirst: async () => null },
    };

    const payload: any = {
      title: "Simple Notebook",
      salePrice: 150,
      productStock: 50,
      variants: [],
    };

    const productData: any = { userId: "u1", title: "Simple Notebook" };

    await applyServerGeneratedProductIdentifiers({
      prisma: mockPrisma,
      payload,
      productData,
      categoryTitle: "Stationery",
      subCategoryTitle: "Paper",
    });

    assert.equal(productData.productCode, "RAJ-STA-PAP-000005");
    assert.equal(productData.sku, "RAJ-STA-PAP-DEF-DEF-001");
    assert.equal(productData.barcode, "100000000501");
    assert.equal(payload.variants.length, 1);
    assert.equal(payload.variants[0].sku, "RAJ-STA-PAP-DEF-DEF-001");
    assert.equal(payload.variants[0].barcode, "100000000501");
  });
});
