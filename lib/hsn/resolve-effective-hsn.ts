import { decimalToNumber } from "@/lib/hsn/validation";
import type { HsnCodeTaxRecord } from "@/types/hsn";

type EffectiveHsnSource = "PRODUCT" | "SUBCATEGORY" | "CATEGORY";

export function resolveEffectiveHsn({
  productHsn,
  productOverrideEnabled,
  categoryHsn,
  subCategoryHsn,
}: {
  productHsn?: HsnCodeTaxRecord | null;
  productOverrideEnabled?: boolean;
  categoryHsn?: HsnCodeTaxRecord | null;
  subCategoryHsn?: HsnCodeTaxRecord | null;
}) {
  const source: EffectiveHsnSource | null = productOverrideEnabled && productHsn ? "PRODUCT" : subCategoryHsn ? "SUBCATEGORY" : categoryHsn ? "CATEGORY" : null;
  const hsn = productOverrideEnabled && productHsn ? productHsn : subCategoryHsn ?? categoryHsn ?? null;
  if (!hsn) return { hsn: null, source: null };
  return {
    hsn: {
      ...hsn,
      gstRate: decimalToNumber(hsn.gstRate),
      cgstRate: decimalToNumber(hsn.cgstRate),
      sgstRate: decimalToNumber(hsn.sgstRate),
      igstRate: decimalToNumber(hsn.igstRate),
      cessRate: decimalToNumber(hsn.cessRate),
    },
    source,
  };
}
