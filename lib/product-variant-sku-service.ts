import { generateSku } from "@/lib/sku-generator";

type ProductVariantSkuClient = {
  productVariant: {
    findFirst(args: {
      where: {
        OR: Array<{ sku?: string } | { barcode?: string }>;
      };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
};

export type ProductVariantSkuContext = {
  vendor: string;
  category: string;
  subCategory: string;
  product: string;
  color: string;
  size: string;
};

export type GeneratedVariantIdentity = {
  sku: string;
  barcode: string;
  variantNo: number;
};

export async function generateUniqueVariantIdentity({
  db,
  context,
  startAt = 1,
  reservedSkus = new Set<string>(),
}: {
  db: any;
  context: ProductVariantSkuContext;
  startAt?: number;
  reservedSkus?: Set<string>;
}): Promise<GeneratedVariantIdentity> {
  for (let variantNo = startAt; variantNo < startAt + 1000; variantNo += 1) {
    const sku = generateSku({
      ...context,
      variantNo,
    });

    if (reservedSkus.has(sku)) {
      continue;
    }

    const barcode = sku;

    const existing = await db.productVariant.findFirst({
      where: {
        OR: [{ sku }, { barcode }],
      },
      select: { id: true },
    });

    if (!existing) {
      reservedSkus.add(sku);
      return { sku, barcode, variantNo };
    }
  }

  throw new Error("Unable to generate a globally unique SKU.");
}
