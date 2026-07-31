import { generateSlug } from "@/lib/generateSlug";
import { ProductHistoryAction } from "@prisma/client";
import { createChangedFieldHistory, createProductHistory, historyBase } from "@/lib/product-history";

export const normalizeName = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

export const toCode = (value = "", length = 3) => {
  const cleaned = String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (cleaned || "VAR").slice(0, length);
};

export const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const cartesianProduct = (groups) =>
  groups.reduce(
    (acc, group) => acc.flatMap((items) => group.map((item) => [...items, item])),
    [[]]
  );

export function buildVariantSku({ vendorCode, productCode, values, sequence }) {
  const parts = [
    toCode(vendorCode || "VND"),
    toCode(productCode || "PRD"),
    ...values.map((value) => toCode(value, 4)),
    String(sequence).padStart(3, "0"),
  ];
  return parts.filter(Boolean).join("-");
}

export function normalizeAttributePayload(attributes = []) {
  return attributes
    .map((attribute, attributeIndex) => {
      const name = String(attribute.name || "").trim();
      const slug = generateSlug(name);
      const seenValues = new Set();
      const values = (attribute.values || [])
        .map((value, valueIndex) => {
          const rawValue =
            typeof value === "string" ? value : value?.value ?? value?.label ?? "";
          const cleanValue = String(rawValue).trim();
          const valueSlug = generateSlug(cleanValue);
          if (!cleanValue || seenValues.has(valueSlug)) return null;
          seenValues.add(valueSlug);
          return {
            id: value?.id,
            value: cleanValue,
            slug: valueSlug,
            colorCode: value?.colorCode || null,
            imageUrl: value?.imageUrl || null,
            position: value?.position ?? valueIndex,
          };
        })
        .filter(Boolean);

      return name
        ? {
            id: attribute.id,
            name,
            slug,
            position: attribute.position ?? attributeIndex,
            isVariant: attribute.isVariant !== false,
            values,
          }
        : null;
    })
    .filter(Boolean);
}

export function variantCombinationKey(values = []) {
  return values
    .map((value) => `${generateSlug(value.attribute || value.attributeSlug || "")}:${generateSlug(value.value || value.valueSlug || "")}`)
    .sort()
    .join("|");
}

export function validateProductVariantPayload({ productType, attributes, variants }) {
  const errors = [];
  const normalizedAttributes = normalizeAttributePayload(attributes);
  const attributeNames = new Set();

  normalizedAttributes.forEach((attribute) => {
    const nameKey = normalizeName(attribute.name);
    if (attributeNames.has(nameKey)) {
      errors.push(`Duplicate attribute name: ${attribute.name}`);
    }
    attributeNames.add(nameKey);

    if (attribute.isVariant && attribute.values.length === 0) {
      errors.push(`Attribute ${attribute.name} must have at least one value.`);
    }
  });

  const variantAttributes = normalizedAttributes.filter((attribute) => attribute.isVariant);
  if (productType === "VARIABLE" && variantAttributes.length === 0) {
    errors.push("Variable Product requires minimum one variant attribute.");
  }

  const combinationKeys = new Set();
  const skuKeys = new Set();
  const productCodeKeys = new Set();
  const barcodeKeys = new Set();
  let defaultCount = 0;

  (variants || []).forEach((variant, index) => {
    const label = variant.title || `Variant ${index + 1}`;
    if (!String(variant.sku || "").trim()) {
      errors.push(`${label}: Variant SKU is required.`);
    }
    if (toNumber(variant.price, 0) < 0) {
      errors.push(`${label}: Price cannot be negative.`);
    }
    if (toNumber(variant.stock, 0) < 0) {
      errors.push(`${label}: Stock cannot be negative.`);
    }
    if (variant.isDefault) {
      defaultCount += 1;
      if (variant.isActive === false) {
        errors.push("Default variant must be active.");
      }
    }

    const combinationKey = variantCombinationKey(variant.values || []);
    if (combinationKey) {
      if (combinationKeys.has(combinationKey)) {
        errors.push(`Duplicate variant combination: ${label}`);
      }
      combinationKeys.add(combinationKey);
    }

    const skuKey = normalizeName(variant.sku);
    if (skuKey) {
      if (skuKeys.has(skuKey)) errors.push(`Duplicate variant SKU: ${variant.sku}`);
      skuKeys.add(skuKey);
    }
    const productCodeKey = normalizeName(variant.productCode);
    if (productCodeKey) {
      if (productCodeKeys.has(productCodeKey)) {
        errors.push(`Duplicate variant product code: ${variant.productCode}`);
      }
      productCodeKeys.add(productCodeKey);
    }
    const barcodeKey = normalizeName(variant.barcode);
    if (barcodeKey) {
      if (barcodeKeys.has(barcodeKey)) errors.push(`Duplicate variant barcode: ${variant.barcode}`);
      barcodeKeys.add(barcodeKey);
    }
  });

  if (productType === "VARIABLE" && (variants || []).length === 0) {
    errors.push("Variable Product requires at least one variant.");
  }
  if (defaultCount > 1) {
    errors.push("Only one default variant is allowed.");
  }

  return { errors, attributes: normalizedAttributes };
}

export async function assertUniqueVariantIdentifiers(prisma, variants, productId) {
  const checks = [
    ["sku", (variants || []).map((variant) => variant.sku).filter(Boolean)],
    ["productCode", (variants || []).map((variant) => variant.productCode).filter(Boolean)],
    ["barcode", (variants || []).map((variant) => variant.barcode).filter(Boolean)],
  ];

  for (const [field, values] of checks) {
    if (!values.length) continue;
    const existing = await prisma.productVariant.findFirst({
      where: {
        [field]: { in: values },
        productId: { not: productId || "__new__" },
      },
      select: { [field]: true },
    });
    if (existing?.[field]) {
      throw new Error(`Variant ${field} already exists: ${existing[field]}`);
    }
  }
}

export async function syncProductAttributesAndVariants({
  prisma,
  productId,
  productType,
  attributes,
  variants,
  actor,
}) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, title: true, productCode: true, userId: true },
  });
  if (!product) throw new Error("Product not found while syncing variants.");

  const baseHistory = historyBase({ ...product, actor });
  const normalizedAttributes = normalizeAttributePayload(attributes);

  await prisma.variantAttributeValue.deleteMany({ where: { productVariant: { productId } } });
  await prisma.productAttributeValue.deleteMany({ where: { attribute: { productId } } });
  await prisma.productAttribute.deleteMany({ where: { productId } });

  const attributeValueIdByKey = new Map();
  const attributeIdBySlug = new Map();

  for (const attribute of normalizedAttributes) {
    const createdAttribute = await prisma.productAttribute.create({
      data: { productId, name: attribute.name, slug: attribute.slug, position: attribute.position, isVariant: attribute.isVariant },
    });
    attributeIdBySlug.set(attribute.slug, createdAttribute.id);

    for (const value of attribute.values) {
      const createdValue = await prisma.productAttributeValue.create({
        data: { attributeId: createdAttribute.id, value: value.value, slug: value.slug, colorCode: value.colorCode, imageUrl: value.imageUrl, position: value.position },
      });
      attributeValueIdByKey.set(attribute.slug + ":" + value.slug, createdValue.id);
    }
  }

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId },
    include: { orderItems: { select: { id: true }, take: 1 }, values: { include: { attribute: true, attributeValue: true } } },
  });
  const existingVariantById: Map<string, (typeof existingVariants)[number]> = new Map(existingVariants.map((variant) => [variant.id, variant]));

  if (productType !== "VARIABLE") {
    for (const existingVariant of existingVariants.filter((variant) => variant.isActive)) {
      await prisma.productVariant.update({ where: { id: existingVariant.id }, data: { isActive: false } });
      await createProductHistory(prisma, { ...baseHistory, variantId: existingVariant.id, sku: existingVariant.sku, barcode: existingVariant.barcode, action: ProductHistoryAction.VARIANT_UPDATED, field: "isActive", oldValue: true, newValue: false, note: "Variant deactivated because product type is not VARIABLE." });
    }
    return;
  }

  const incomingIds = (variants || []).map((variant) => variant.id).filter(Boolean);
  for (const existingVariant of existingVariants) {
    if (!incomingIds.includes(existingVariant.id)) {
      if (existingVariant.orderItems.length > 0) {
        await prisma.productVariant.update({ where: { id: existingVariant.id }, data: { isActive: false } });
        await createProductHistory(prisma, { ...baseHistory, variantId: existingVariant.id, sku: existingVariant.sku, barcode: existingVariant.barcode, action: ProductHistoryAction.VARIANT_UPDATED, field: "isActive", oldValue: true, newValue: false, note: "Variant preserved because orders exist." });
      } else {
        const oldSnapshot = variantSnapshot(existingVariant);
        await prisma.productVariant.delete({ where: { id: existingVariant.id } });
        await createProductHistory(prisma, { ...baseHistory, variantId: existingVariant.id, sku: existingVariant.sku, barcode: existingVariant.barcode, action: ProductHistoryAction.VARIANT_DELETED, oldValue: oldSnapshot, newValue: null });
      }
    }
  }

  for (const variant of variants || []) {
    const data = {
      productId,
      title: variant.title || (variant.values || []).map((value) => value.value).join(" / "),
      sku: String(variant.sku || "").trim().toUpperCase(),
      productCode: variant.productCode ? String(variant.productCode).trim().toUpperCase() : null,
      barcode: String(variant.barcode || variant.sku || "").trim().toUpperCase(),
      price: toNumber(variant.price, 0),
      comparePrice: toNumber(variant.comparePrice, 0),
      costPrice: toNullableNumber(variant.costPrice),
      stock: Math.max(0, Math.trunc(toNumber(variant.stock, 0))),
      lowStockAt: Math.max(0, Math.trunc(toNumber(variant.lowStockAt, 5))),
      weight: toNullableNumber(variant.weight),
      length: toNullableNumber(variant.length),
      width: toNullableNumber(variant.width),
      height: toNullableNumber(variant.height),
      imageUrl: variant.imageUrl || null,
      status: variant.status || (variant.isActive === false ? "INACTIVE" : "ACTIVE"),
      taxClass: variant.taxClass || "TAXABLE",
      hsnCodeId: variant.hsnCodeId || null,
      gstRate: toNullableNumber(variant.gstRate),
      reservedStock: Math.max(0, Math.trunc(toNumber(variant.reservedStock, 0))),
      incomingStock: Math.max(0, Math.trunc(toNumber(variant.incomingStock, 0))),
      isDefault: Boolean(variant.isDefault),
      isActive: variant.isActive !== false,
    };

    const previousVariant = variant.id ? existingVariantById.get(variant.id) ?? null : null;
    const savedVariant = variant.id ? await prisma.productVariant.update({ where: { id: variant.id }, data }) : await prisma.productVariant.create({ data });

    if (!previousVariant) {
      const snapshot = variantSnapshot(savedVariant);
      await createProductHistory(prisma, { ...baseHistory, variantId: savedVariant.id, sku: savedVariant.sku, barcode: savedVariant.barcode, action: ProductHistoryAction.VARIANT_CREATED, oldValue: null, newValue: snapshot });
      await createProductHistory(prisma, { ...baseHistory, variantId: savedVariant.id, sku: savedVariant.sku, barcode: savedVariant.barcode, action: ProductHistoryAction.SKU_GENERATED, field: "sku", oldValue: null, newValue: savedVariant.sku });
      await createProductHistory(prisma, { ...baseHistory, variantId: savedVariant.id, sku: savedVariant.sku, barcode: savedVariant.barcode, action: ProductHistoryAction.BARCODE_GENERATED, field: "barcode", oldValue: null, newValue: savedVariant.barcode });
    } else {
      const variantBase = { ...baseHistory, variantId: savedVariant.id, sku: savedVariant.sku, barcode: savedVariant.barcode };
      const changes: Array<[string, unknown, unknown, ProductHistoryAction]> = [
        ["title", previousVariant.title, savedVariant.title, ProductHistoryAction.VARIANT_UPDATED],
        ["price", previousVariant.price, savedVariant.price, ProductHistoryAction.PRICE_CHANGED],
        ["comparePrice", previousVariant.comparePrice, savedVariant.comparePrice, ProductHistoryAction.PRICE_CHANGED],
        ["costPrice", previousVariant.costPrice, savedVariant.costPrice, ProductHistoryAction.PRICE_CHANGED],
        ["stock", previousVariant.stock, savedVariant.stock, ProductHistoryAction.STOCK_CHANGED],
        ["reservedStock", previousVariant.reservedStock, savedVariant.reservedStock, ProductHistoryAction.STOCK_CHANGED],
        ["incomingStock", previousVariant.incomingStock, savedVariant.incomingStock, ProductHistoryAction.STOCK_CHANGED],
        ["lowStockAt", previousVariant.lowStockAt, savedVariant.lowStockAt, ProductHistoryAction.VARIANT_UPDATED],
        ["weight", previousVariant.weight, savedVariant.weight, ProductHistoryAction.VARIANT_UPDATED],
        ["length", previousVariant.length, savedVariant.length, ProductHistoryAction.VARIANT_UPDATED],
        ["width", previousVariant.width, savedVariant.width, ProductHistoryAction.VARIANT_UPDATED],
        ["height", previousVariant.height, savedVariant.height, ProductHistoryAction.VARIANT_UPDATED],
        ["imageUrl", previousVariant.imageUrl, savedVariant.imageUrl, ProductHistoryAction.VARIANT_UPDATED],
        ["status", previousVariant.status, savedVariant.status, ProductHistoryAction.VARIANT_UPDATED],
        ["taxClass", previousVariant.taxClass, savedVariant.taxClass, ProductHistoryAction.VARIANT_UPDATED],
        ["hsnCodeId", previousVariant.hsnCodeId, savedVariant.hsnCodeId, ProductHistoryAction.VARIANT_UPDATED],
        ["gstRate", previousVariant.gstRate, savedVariant.gstRate, ProductHistoryAction.VARIANT_UPDATED],
        ["isDefault", previousVariant.isDefault, savedVariant.isDefault, ProductHistoryAction.VARIANT_UPDATED],
        ["isActive", previousVariant.isActive, savedVariant.isActive, ProductHistoryAction.VARIANT_UPDATED],
        ["sku", previousVariant.sku, savedVariant.sku, ProductHistoryAction.VARIANT_UPDATED],
        ["barcode", previousVariant.barcode, savedVariant.barcode, ProductHistoryAction.VARIANT_UPDATED],
      ];
      for (const [field, oldValue, newValue, action] of changes) {
        await createChangedFieldHistory(prisma, variantBase, String(field), oldValue, newValue, action);
      }
    }

    for (const value of variant.values || []) {
      const attributeSlug = generateSlug(value.attribute || value.attributeSlug || "");
      const valueSlug = generateSlug(value.value || value.valueSlug || "");
      const attributeId = attributeIdBySlug.get(attributeSlug);
      const attributeValueId = attributeValueIdByKey.get(attributeSlug + ":" + valueSlug);
      if (!attributeId || !attributeValueId) throw new Error("Invalid variant attribute value for " + savedVariant.sku);
      await prisma.variantAttributeValue.create({ data: { productVariantId: savedVariant.id, attributeId, attributeValueId } });
    }
  }
}

function variantSnapshot(variant) {
  return {
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    productCode: variant.productCode,
    barcode: variant.barcode,
    price: variant.price,
    comparePrice: variant.comparePrice,
    costPrice: variant.costPrice,
    stock: variant.stock,
    lowStockAt: variant.lowStockAt,
    weight: variant.weight,
    length: variant.length,
    width: variant.width,
    height: variant.height,
    imageUrl: variant.imageUrl,
    status: variant.status,
    taxClass: variant.taxClass,
    hsnCodeId: variant.hsnCodeId,
    gstRate: variant.gstRate,
    reservedStock: variant.reservedStock,
    incomingStock: variant.incomingStock,
    isDefault: variant.isDefault,
    isActive: variant.isActive,
  };
}
