import db from "@/lib/db";
import { Prisma, type HsnTaxType } from "@prisma/client";
import type { HsnCodeTaxRecord } from "@/types/hsn";

export type ResolvedProductHsn = {
  hsnCodeId: string;
  code: string;
  description: string;
  gstRate: Prisma.Decimal;
  cgstRate: Prisma.Decimal;
  sgstRate: Prisma.Decimal;
  igstRate: Prisma.Decimal;
  cessRate: Prisma.Decimal;
  taxType: HsnTaxType;
  source: "PRODUCT" | "SUBCATEGORY" | "CATEGORY";
};

const hsnSelect = {
  id: true,
  code: true,
  description: true,
  gstRate: true,
  cgstRate: true,
  sgstRate: true,
  igstRate: true,
  cessRate: true,
  taxType: true,
  status: true,
  effectiveTo: true,
  chapter: true,
} as const;

function mapHsn(hsn: HsnCodeTaxRecord | null | undefined, source: ResolvedProductHsn["source"]): ResolvedProductHsn | null {
  if (!hsn || hsn.status !== "ACTIVE") return null;
  if (hsn.effectiveTo && hsn.effectiveTo < new Date()) return null;
  return {
    hsnCodeId: hsn.id,
    code: hsn.code,
    description: hsn.description,
    gstRate: hsn.gstRate,
    cgstRate: hsn.cgstRate,
    sgstRate: hsn.sgstRate,
    igstRate: hsn.igstRate,
    cessRate: hsn.cessRate,
    taxType: hsn.taxType,
    source,
  };
}

export async function resolveProductHsn(productId: string): Promise<ResolvedProductHsn> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      taxMappingStatus: true,
      hsnOverrideEnabled: true,
      hsnCode: { select: hsnSelect },
      subCategory: { select: { hsnCode: { select: hsnSelect } } },
      category: { select: { hsnCode: { select: hsnSelect } } },
    },
  });

  if (!product) throw new Error("Product not found.");
  if (product.taxMappingStatus === "PENDING_REVIEW") {
    throw new Error(
      "Tax mapping is pending review for this product. Configure HSN/GST before publishing or invoicing."
    );
  }

  const resolved =
    (product.hsnOverrideEnabled ? mapHsn(product.hsnCode, "PRODUCT") : null) ??
    mapHsn(product.subCategory?.hsnCode, "SUBCATEGORY") ??
    mapHsn(product.category?.hsnCode, "CATEGORY");

  if (!resolved) throw new Error("No active HSN configured for this product.");
  return resolved;
}

export const getProductEffectiveHsn = resolveProductHsn;
