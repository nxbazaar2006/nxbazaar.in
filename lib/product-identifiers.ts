import {
  generateVariantSku,
  createSkuCode,
  extractProduct3,
  createVariantSequence3,
  type SkuParts,
} from "@/lib/sku-generator";

const PRODUCT_NUMBER_WIDTH = 6;

export function normalizeCode(value: unknown, length = 3, fallback = "DEF"): string {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();

  if (!cleaned) return fallback.slice(0, length).toUpperCase();
  if (cleaned.length <= length) return cleaned.padEnd(length, "X");
  return cleaned.slice(0, length);
}

export function cleanIdentifier(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .toUpperCase();
}

type VariantValueItem = {
  attribute?: string;
  attributeSlug?: string;
  value?: string;
  valueSlug?: string;
  attributeValueSlug?: string;
};

type VariantInputItem = {
  id?: string;
  color?: string;
  size?: string;
  sku?: string;
  productCode?: string;
  barcode?: string;
  manufacturerBarcode?: string;
  values?: VariantValueItem[];
  [key: string]: unknown;
};

function extractVariantOption(variant: VariantInputItem, names: string[]): string {
  if (names.includes("color") && variant.color) return variant.color;
  if (names.includes("size") && variant.size) return variant.size;

  const matched = (variant?.values || []).find((val) => {
    const attribute = String(val?.attribute || val?.attributeSlug || "").toLowerCase();
    return names.some((name) => attribute.includes(name));
  });

  return matched?.value || matched?.valueSlug || matched?.attributeValueSlug || "";
}

export async function resolveVendorCode(prisma: any, userId: string): Promise<string> {
  if (!userId) return "V01";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      farmerProfile: { select: { code: true } },
      sellerProfile: { select: { id: true, code: true, storeName: true, displayName: true } },
    },
  });

  if (!user) return normalizeCode(userId, 3, "V01");

  if (user.sellerProfile?.code) {
    return normalizeCode(user.sellerProfile.code, 3, "V01");
  }

  if (user.sellerProfile?.id) {
    for (let sequence = 1; sequence <= 999; sequence += 1) {
      const code = `V${String(sequence).padStart(2, "0")}`;
      const existing = await prisma.sellerProfile.findUnique({
        where: { code },
        select: { id: true },
      });
      if (!existing) {
        await prisma.sellerProfile.update({
          where: { id: user.sellerProfile.id },
          data: { code },
        });
        return code;
      }
    }
  }

  if (user.farmerProfile?.code) {
    return normalizeCode(user.farmerProfile.code, 3, "V01");
  }

  return normalizeCode(user.name || user.email || user.id, 3, "V01");
}

export async function getNextProductSequence(prisma: any, prefix: string): Promise<number> {
  try {
    const record = await prisma.productSequence.upsert({
      where: { prefix },
      create: { prefix, lastSequence: 1 },
      update: { lastSequence: { increment: 1 } },
      select: { lastSequence: true },
    });
    return record.lastSequence;
  } catch {
    const existing = await prisma.product.findMany({
      where: { productCode: { startsWith: prefix } },
      select: { productCode: true },
      orderBy: { productCode: "desc" },
      take: 20,
    });
    let max = 0;
    for (const p of existing) {
      const match = (p.productCode || "").match(/(\d{6})$/);
      if (match) {
        max = Math.max(max, parseInt(match[1], 10));
      }
    }
    return max + 1;
  }
}

export async function getNextBarcodeSequence(prisma: any): Promise<string> {
  try {
    const record = await prisma.barcodeSequence.upsert({
      where: { id: "barcode" },
      create: { id: "barcode", lastSequence: 100000000001n },
      update: { lastSequence: { increment: 1n } },
      select: { lastSequence: true },
    });
    return String(record.lastSequence).padStart(12, "0");
  } catch (error) {
    try {
      const highestVariant = await prisma.productVariant.findFirst({
        where: { barcode: { not: "" } },
        select: { barcode: true },
        orderBy: { barcode: "desc" },
      });
      let next = 100000000001n;
      if (highestVariant?.barcode && /^\d{12}$/.test(highestVariant.barcode)) {
        next = BigInt(highestVariant.barcode) + 1n;
      }
      return String(next).padStart(12, "0");
    } catch {
      const timestampSeq = BigInt(Date.now()) * 100n + BigInt(Math.floor(Math.random() * 90) + 10);
      return String(timestampSeq).slice(-12).padStart(12, "1");
    }
  }
}

export async function generateProductCode(
  prisma: any,
  vendorCode: string,
  categoryTitle: string,
  subCategoryTitle: string
): Promise<string> {
  const categoryCode = normalizeCode(categoryTitle, 3, "CAT");
  const subCategoryCode = normalizeCode(subCategoryTitle, 3, "SUB");
  const prefix = `${vendorCode}-${categoryCode}-${subCategoryCode}`;

  const seq = await getNextProductSequence(prisma, prefix);
  const formattedSeq = String(seq).padStart(PRODUCT_NUMBER_WIDTH, "0");
  const candidate = `${prefix}-${formattedSeq}`;

  const existing = await prisma.product.findUnique({
    where: { productCode: candidate },
    select: { id: true },
  });

  if (!existing) {
    return candidate;
  }

  for (let offset = 1; offset <= 50; offset += 1) {
    const retrySeq = String(seq + offset).padStart(PRODUCT_NUMBER_WIDTH, "0");
    const retryCandidate = `${prefix}-${retrySeq}`;
    const collision = await prisma.product.findUnique({
      where: { productCode: retryCandidate },
      select: { id: true },
    });
    if (!collision) {
      return retryCandidate;
    }
  }

  throw new Error(`Failed to generate a unique ProductCode for prefix ${prefix}`);
}

type BuildSkuOptions = {
  vendorCode: string;
  categoryTitle: string;
  subCategoryTitle: string;
  productCode: string;
  variant: VariantInputItem;
  sequence: number;
};

export function buildVariantSku({
  vendorCode,
  categoryTitle,
  subCategoryTitle,
  productCode,
  variant,
  sequence,
}: BuildSkuOptions): string {
  const color = extractVariantOption(variant, ["color", "colour"]);
  const size = extractVariantOption(variant, ["size"]);

  return generateVariantSku({
    vendorCode,
    categoryTitle,
    subCategoryTitle,
    productCode,
    productSeq: productCode,
    color,
    size,
    variantNo: sequence,
  });
}

export async function generateUniqueVariantSku(
  prisma: any,
  options: BuildSkuOptions,
  reservedSkus: Set<string>
): Promise<string> {
  for (let seq = options.sequence; seq < options.sequence + 500; seq += 1) {
    const sku = buildVariantSku({ ...options, sequence: seq });
    if (reservedSkus.has(sku)) continue;

    const existing = await prisma.productVariant.findFirst({
      where: { OR: [{ sku }, { barcode: sku }] },
      select: { id: true },
    });

    if (!existing) return sku;
  }
  throw new Error("Unable to generate a unique variant SKU.");
}

export type ApplyIdentifiersParams = {
  prisma: any;
  payload: { variants?: VariantInputItem[]; [key: string]: unknown };
  productData: {
    userId: string;
    productCode?: string | null;
    sku?: string | null;
    barcode?: string | null;
    title: string;
    [key: string]: unknown;
  };
  existingProduct?: {
    id: string;
    productCode: string;
    sku?: string | null;
    barcode?: string | null;
    variants?: Array<{ id: string; sku: string; barcode: string; productCode?: string | null }>;
  } | null;
  categoryTitle?: string;
  subCategoryTitle?: string;
};

export async function applyServerGeneratedProductIdentifiers({
  prisma,
  payload,
  productData,
  existingProduct = null,
  categoryTitle = "",
  subCategoryTitle = "",
}: ApplyIdentifiersParams): Promise<void> {
  const vendorCode = await resolveVendorCode(prisma, productData.userId);

  const productCode =
    cleanIdentifier(existingProduct?.productCode) ||
    (await generateProductCode(prisma, vendorCode, categoryTitle, subCategoryTitle));

  productData.productCode = productCode;
  productData.sku = cleanIdentifier(existingProduct?.sku) || null;
  productData.barcode = existingProduct?.barcode || null;

  const existingVariants = existingProduct?.variants || [];
  const existingVariantById = new Map<string, { id: string; sku: string; barcode: string; productCode?: string | null }>(
    existingVariants.map((v) => [v.id, v])
  );

  const reserved = {
    sku: new Set<string>(),
    barcode: new Set<string>(),
  };

  if (!payload.variants || payload.variants.length === 0) {
    payload.variants = [
      {
        title: productData.title || "Default",
        price: Number(productData.salePrice || productData.productPrice || 0),
        stock: Number(productData.productStock || 0),
        isDefault: true,
      },
    ];
  }

  const nextVariantSequence = existingVariants.length + 1;
  const generatedVariants: VariantInputItem[] = [];

  for (let index = 0; index < (payload.variants || []).length; index += 1) {
    const variant = payload.variants![index];
    const existing = variant.id ? existingVariantById.get(variant.id) : null;

    let sku = cleanIdentifier(existing?.sku);
    let barcode = existing?.barcode || (variant.barcode ? String(variant.barcode).trim() : null);

    if (!sku) {
      const variantSeq = existing ? index + 1 : nextVariantSequence + index;
      sku = await generateUniqueVariantSku(
        prisma,
        {
          vendorCode,
          categoryTitle,
          subCategoryTitle,
          productCode,
          variant,
          sequence: variantSeq,
        },
        reserved.sku
      );
    }
    reserved.sku.add(sku);

    if (!barcode || !/^\d{12}$/.test(barcode)) {
      barcode = await getNextBarcodeSequence(prisma);
      while (reserved.barcode.has(barcode)) {
        barcode = await getNextBarcodeSequence(prisma);
      }
    }
    reserved.barcode.add(barcode);

    generatedVariants.push({
      ...variant,
      sku,
      productCode: existing?.productCode || productCode,
      barcode,
    });
  }

  payload.variants = generatedVariants;

  if (!productData.barcode && payload.variants.length > 0) {
    productData.barcode = payload.variants[0].barcode;
  }
  if (!productData.sku && payload.variants.length > 0) {
    productData.sku = payload.variants[0].sku;
  }
}
