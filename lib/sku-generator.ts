const SKU_SEGMENT_LENGTH = 3;
const VARIANT_SEQ_LENGTH = 3;

const CODE_OVERRIDES: Record<string, string> = {
  // Colors
  BLACK: "BLK",
  BLUE: "BLU",
  GREEN: "GRN",
  RED: "RED",
  WHITE: "WHT",
  YELLOW: "YEL",
  GREY: "GRY",
  GRAY: "GRY",
  PINK: "PNK",
  PURPLE: "PRP",
  ORANGE: "ORG",
  BROWN: "BRN",
  GOLD: "GLD",
  SILVER: "SLV",

  // Sizes
  S: "SML",
  SMALL: "SML",
  M: "MED",
  MEDIUM: "MED",
  L: "LRG",
  LARGE: "LRG",
  XL: "XLX",
  XXL: "XXL",
  XXXL: "3XL",
  XS: "XSM",
  FREE: "FRE",
  ONESIZE: "ONE",

  // Categories / Products
  CLOTHING: "CLT",
  ELECTRONICS: "ELC",
  IPHONE: "IPH",
  MOBILE: "MOB",
  PREMIUMTEE: "PRM",
  TSHIRT: "TSH",
};

export type SkuParts = {
  vendor?: string | null;
  vendorCode?: string | null;
  category?: string | null;
  categoryCode?: string | null;
  categoryTitle?: string | null;
  subCategory?: string | null;
  subCategoryCode?: string | null;
  subCategoryTitle?: string | null;
  product?: string | null;
  productTitle?: string | null;
  productCode?: string | null;
  productSeq?: number | string | null;
  color?: string | null;
  colorCode?: string | null;
  size?: string | null;
  sizeCode?: string | null;
  variantNo?: number | string;
  number?: number | string;
};

export function createSkuCode(value: string | null | undefined, fallback = "DEF"): string {
  const normalized = (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!normalized) {
    return fallback;
  }

  if (CODE_OVERRIDES[normalized]) {
    return CODE_OVERRIDES[normalized];
  }

  if (normalized.length <= SKU_SEGMENT_LENGTH) {
    return normalized.padEnd(SKU_SEGMENT_LENGTH, "X");
  }

  return normalized.slice(0, SKU_SEGMENT_LENGTH);
}

export function extractProduct3(productInput?: string | number | null): string {
  if (productInput == null) return "001";
  const str = String(productInput).trim();
  const digitsMatch = str.match(/\d+$/);
  if (digitsMatch) {
    const numStr = digitsMatch[0];
    return numStr.slice(-3).padStart(3, "0");
  }
  return createSkuCode(str, "PRD");
}

export function createVariantSequence3(value: number | string): string {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 1) {
    return "001";
  }
  return String(numericValue).padStart(VARIANT_SEQ_LENGTH, "0");
}

export function generateSku(input: SkuParts): string {
  const vendor = createSkuCode(input.vendorCode ?? input.vendor, "VND");
  const category = createSkuCode(input.categoryCode ?? input.categoryTitle ?? input.category, "CAT");
  const subCategory = createSkuCode(input.subCategoryCode ?? input.subCategoryTitle ?? input.subCategory, "SUB");
  const color = createSkuCode(input.colorCode ?? input.color, "DEF");
  const size = createSkuCode(input.sizeCode ?? input.size, "DEF");
  const seq = createVariantSequence3(input.variantNo ?? input.number ?? 1);

  return [vendor, category, subCategory, color, size, seq].join("-");
}

export function generateVariantSku(input: SkuParts): string {
  return generateSku(input);
}

export function generateInternalBarcode(sku: string): string {
  const cleanSku = (sku || "SKU").trim().toUpperCase();
  return `NXB-${cleanSku}`;
}

export function barcodeFromSku(sku: string): string {
  return generateInternalBarcode(sku);
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

