const SKU_SEGMENT_LENGTH = 3;
const VARIANT_NUMBER_LENGTH = 6;

const CODE_OVERRIDES: Record<string, string> = {
  BLACK: "BLK",
  BLUE: "BLU",
  CLOTHING: "CLT",
  ELECTRONICS: "ELC",
  IPHONE: "IPH",
  LARGE: "LRG",
  MEDIUM: "MED",
  MOBILE: "MOB",
  PREMIUMTEE: "PRM",
  SMALL: "SML",
  TSHIRT: "TSH",
  WHITE: "WHT",
  XL: "XLX",
  XXL: "XXL",
};

export type SkuParts = {
  vendor?: string | null;
  vendorCode?: string | null;
  category?: string | null;
  categoryCode?: string | null;
  subCategory?: string | null;
  subCategoryCode?: string | null;
  product?: string | null;
  productTitle?: string | null;
  productCode?: string | null;
  color?: string | null;
  colorCode?: string | null;
  size?: string | null;
  sizeCode?: string | null;
  variantNo?: number | string;
  number?: number | string;
};

export function createSkuCode(value: string | null | undefined): string {
  const normalized = (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (CODE_OVERRIDES[normalized]) {
    return CODE_OVERRIDES[normalized];
  }

  if (normalized.length <= SKU_SEGMENT_LENGTH) {
    return normalized || "XXX";
  }

  return normalized.slice(0, SKU_SEGMENT_LENGTH);
}

export function createVariantNumber(value: number | string): string {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new Error("Variant number must be a positive integer.");
  }

  return String(numericValue).padStart(VARIANT_NUMBER_LENGTH, "0");
}

export function generateSku(input: SkuParts): string {
  return [
    createSkuCode(input.vendor ?? input.vendorCode),
    createSkuCode(input.category ?? input.categoryCode),
    createSkuCode(input.subCategory ?? input.subCategoryCode),
    createSkuCode(input.color ?? input.colorCode),
    createSkuCode(input.size ?? input.sizeCode),
    createVariantNumber(input.variantNo ?? input.number ?? 1),
  ].join("-");
}

export function generateVariantSku(input: SkuParts): string {
  return generateSku(input);
}

export function barcodeFromSku(sku: string): string {
  return sku;
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
