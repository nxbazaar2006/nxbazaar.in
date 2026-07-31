import { generateVariantSku } from "@/lib/sku-generator";

const PRODUCT_NUMBER_WIDTH = 6;

const cleanIdentifier = (value: unknown) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .toUpperCase();

function variantValues(variant) {
  return (variant?.values || []).map((value) => value?.value || value?.valueSlug || value?.attributeValueSlug || "VAR");
}

function variantOption(variant, names: string[]) {
  const matched = (variant?.values || []).find((value) => {
    const attribute = String(value?.attribute || value?.attributeSlug || "").toLowerCase();
    return names.some((name) => attribute.includes(name));
  });
  return matched?.value || matched?.valueSlug || matched?.attributeValueSlug || "";
}

function normalizeVendorCode(value: unknown) {
  return createIdentifierCode(value, "VND");
}

function createIdentifierCode(value: unknown, fallback: string) {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-/g, "")
    .toUpperCase();
  return (cleaned || fallback).slice(0, 3);
}

function buildVendorCode(sequence: number) {
  return `V${String(Math.max(1, sequence)).padStart(3, "0")}`;
}

function productCodePrefix(vendorCode: string, categoryCode: string, subCategoryCode: string) {
  return `${vendorCode}-${categoryCode}-${subCategoryCode}-`;
}

function parseProductNumber(productCode: string, prefix: string) {
  const match = productCode.match(new RegExp(`^${prefix}(\\d{${PRODUCT_NUMBER_WIDTH}})$`));
  return match ? Number(match[1]) : 0;
}

async function generateUniqueSellerCode(prisma) {
  for (let sequence = 1; sequence <= 999; sequence += 1) {
    const code = buildVendorCode(sequence);
    const existing = await prisma.sellerProfile.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error("Unable to generate a unique seller code.");
}

export async function resolveVendorCode(prisma, userId: string) {
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

  if (!user) return normalizeVendorCode(userId);

  const sellerCode = normalizeVendorCode(user.sellerProfile?.code);
  if (sellerCode) return sellerCode;

  if (user.sellerProfile?.id) {
    const code = await generateUniqueSellerCode(prisma);
    await prisma.sellerProfile.update({
      where: { id: user.sellerProfile.id },
      data: { code },
    });
    return code;
  }

  const farmerCode = normalizeVendorCode(user.farmerProfile?.code);
  if (farmerCode) return farmerCode;

  return normalizeVendorCode(user.name || user.email || user.id);
}

async function nextProductNumber(prisma, prefix: string) {
  const products = await prisma.product.findMany({
    where: { productCode: { startsWith: prefix } },
    select: { productCode: true },
    orderBy: { productCode: "desc" },
    take: 25,
  });
  const maxNumber = products.reduce((max, product) => {
    return Math.max(max, parseProductNumber(product.productCode || "", prefix));
  }, 0);
  return maxNumber + 1;
}

async function generateUniqueProductCode(prisma, vendorCode: string, categoryTitle: string, subCategoryTitle: string) {
  const categoryCode = createIdentifierCode(categoryTitle, "CAT");
  const subCategoryCode = createIdentifierCode(subCategoryTitle, "SUB");
  const prefix = productCodePrefix(vendorCode, categoryCode, subCategoryCode);
  let productNumber = await nextProductNumber(prisma, prefix);
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const value = `${prefix}${String(productNumber).padStart(PRODUCT_NUMBER_WIDTH, "0")}`;
    const existing = await prisma.product.findUnique({ where: { productCode: value }, select: { id: true } });
    if (!existing) return value;
    productNumber += 1;
  }
  throw new Error("Unable to generate a unique product code.");
}

function buildServerVariantSku({ vendorCode, productTitle, categoryTitle, subCategoryTitle, variant, sequence }) {
  const color = variantOption(variant, ["color", "colour"]) || variantValues(variant)[0] || "CLR";
  const size = variantOption(variant, ["size"]) || variantValues(variant)[1] || "SIZE";
  return generateVariantSku({
    vendor: vendorCode,
    category: categoryTitle || "CAT",
    subCategory: subCategoryTitle || "SUBCAT",
    product: productTitle || "PRODUCT",
    color,
    size,
    variantNo: sequence,
  });
}

async function generateUniqueVariantSku(prisma, options, reservedSkus) {
  for (let sequence = options.sequence; sequence < options.sequence + 1000; sequence += 1) {
    const sku = buildServerVariantSku({ ...options, sequence });
    if (reservedSkus.has(sku)) continue;
    const existing = await prisma.productVariant.findFirst({
      where: { OR: [{ sku }, { barcode: sku }] },
      select: { id: true },
    });
    if (!existing) return sku;
  }
  throw new Error("Unable to generate a unique variant SKU.");
}

export async function applyServerGeneratedProductIdentifiers({
  prisma,
  payload,
  productData,
  existingProduct = null,
  categoryTitle = "",
  subCategoryTitle = "",
}) {
  const vendorCode = await resolveVendorCode(prisma, productData.userId);
  const productCode =
    cleanIdentifier(existingProduct?.productCode) ||
    (await generateUniqueProductCode(prisma, vendorCode, categoryTitle, subCategoryTitle));

  productData.productCode = productCode;
  productData.sku = cleanIdentifier(existingProduct?.sku) || null;
  productData.barcode = cleanIdentifier(existingProduct?.barcode) || null;

  const existingVariantById = new Map<string, any>((existingProduct?.variants || []).map((variant) => [variant.id, variant]));
  const reserved = {
    sku: new Set<string>(),
    barcode: new Set<string>(),
  };

  const generatedVariants = [];
  for (const [index, variant] of (payload.variants || []).entries()) {
    const existingVariant = variant.id ? existingVariantById.get(variant.id) : null;
    let sku = cleanIdentifier(existingVariant?.sku);
    const variantProductCode = cleanIdentifier(existingVariant?.productCode) || null;
    let barcode = cleanIdentifier(existingVariant?.barcode);

    if (!sku) {
      sku = await generateUniqueVariantSku(
        prisma,
        {
          vendorCode,
          productTitle: productData.title,
          categoryTitle,
          subCategoryTitle,
          variant,
          sequence: index + 1,
        },
        reserved.sku,
      );
    }
    reserved.sku.add(sku);

    if (!barcode || reserved.barcode.has(barcode)) barcode = sku;
    reserved.barcode.add(barcode);

    generatedVariants.push({
      ...variant,
      sku,
      productCode: variantProductCode,
      barcode,
    });
  }

  payload.variants = generatedVariants;
}
