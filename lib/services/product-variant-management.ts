import db from "@/lib/db";
import { generateSlug } from "@/lib/generateSlug";
import {
  buildVariantSku,
  cartesianProduct,
  normalizeAttributePayload,
  toNullableNumber,
  toNumber,
  variantCombinationKey,
} from "@/lib/product-variants";
import type {
  AttributeInput,
  BulkVariantDeleteInput,
  BulkVariantUpdateInput,
  GenerateVariantsInput,
  ProductAttributeInput,
  VariantInput,
} from "@/lib/validations/product-variants";

type DbClient = typeof db;

function cleanCode(value: unknown) {
  return String(value || "").trim().toUpperCase();
}

function serializeDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : value ?? null;
}

function serializeNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeVariantRow(variant: any) {
  const inventoryRows = variant.variantInventories ?? [];
  const stock = variant.stock ?? inventoryRows.reduce((sum: number, item: any) => sum + Number(item.stock || 0), 0);
  const reservedStock =
    variant.reservedStock ?? inventoryRows.reduce((sum: number, item: any) => sum + Number(item.reservedStock || 0), 0);
  const incomingStock =
    variant.incomingStock ?? inventoryRows.reduce((sum: number, item: any) => sum + Number(item.incomingStock || 0), 0);

  return {
    ...variant,
    price: serializeNumber(variant.price) ?? 0,
    comparePrice: serializeNumber(variant.comparePrice),
    costPrice: serializeNumber(variant.costPrice),
    gstRate: serializeNumber(variant.gstRate),
    stock,
    reservedStock,
    incomingStock,
    availableStock: Math.max(0, stock - reservedStock),
    createdAt: serializeDate(variant.createdAt),
    updatedAt: serializeDate(variant.updatedAt),
    values: (variant.values ?? []).map((entry: any) => ({
      id: entry.id,
      attribute: entry.attribute?.name,
      attributeSlug: entry.attribute?.slug,
      value: entry.attributeValue?.value,
      valueSlug: entry.attributeValue?.slug,
      colorCode: entry.attributeValue?.colorCode,
    })),
    images: (variant.images ?? []).map((image: any) => ({
      ...image,
      createdAt: serializeDate(image.createdAt),
      updatedAt: serializeDate(image.updatedAt),
    })),
    variantInventories: inventoryRows.map((item: any) => ({
      ...item,
      availableStock: Math.max(0, Number(item.stock || 0) - Number(item.reservedStock || 0)),
      createdAt: serializeDate(item.createdAt),
      updatedAt: serializeDate(item.updatedAt),
    })),
  };
}

export async function getProductVariantManagementData(productId: string) {
  const product = await (db as any).product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      productCode: true,
      sku: true,
      barcode: true,
      userId: true,
      productType: true,
      hsnCodeId: true,
      hsnCode: { select: { id: true, code: true, description: true, gstRate: true } },
      user: {
        select: {
          id: true,
          vendorCode: true,
          sellerProfile: { select: { code: true, storeName: true } },
        },
      },
      attributes: {
        orderBy: { position: "asc" },
        include: { values: { orderBy: { position: "asc" } } },
      },
      variants: {
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        include: {
          hsnCode: { select: { id: true, code: true, description: true, gstRate: true } },
          values: { include: { attribute: true, attributeValue: true } },
          images: { orderBy: { position: "asc" } },
          variantInventories: { orderBy: { warehouseCode: "asc" } },
          history: { orderBy: { createdAt: "desc" }, take: 25 },
        },
      },
    },
  });

  if (!product) return null;

  const hsnCodes = await (db as any).hsnCode.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, code: true, description: true, gstRate: true },
    orderBy: { code: "asc" },
    take: 250,
  });

  return {
    product: {
      ...product,
      vendorCode: product.user?.sellerProfile?.code || product.user?.vendorCode || "VND",
      variants: product.variants.map(normalizeVariantRow),
    },
    hsnCodes: hsnCodes.map((item) => ({
      ...item,
      gstRate: serializeNumber(item.gstRate),
    })),
  };
}

export async function upsertAttributeMaster(input: AttributeInput) {
  const slug = input.slug || generateSlug(input.name);
  const data = {
    name: input.name.trim(),
    slug,
    inputType: input.inputType,
    isVariant: input.isVariant,
    isFilterable: input.isFilterable,
    isRequired: input.isRequired,
    isActive: input.isActive,
  };

  return (db as any).$transaction(async (tx: any) => {
    const attribute = input.id
      ? await tx.attribute.update({ where: { id: input.id }, data })
      : await tx.attribute.upsert({
          where: { slug },
          update: data,
          create: data,
        });

    const activeValueIds: string[] = [];
    for (const [index, value] of input.values.entries()) {
      const valueSlug = value.slug || generateSlug(value.value);
      const saved = value.id
        ? await tx.attributeValue.update({
            where: { id: value.id },
            data: {
              value: value.value.trim(),
              slug: valueSlug,
              colorCode: value.colorCode || null,
              imageUrl: value.imageUrl || null,
              position: value.position ?? index,
              isActive: value.isActive,
            },
          })
        : await tx.attributeValue.upsert({
            where: { attributeId_slug: { attributeId: attribute.id, slug: valueSlug } },
            update: {
              value: value.value.trim(),
              colorCode: value.colorCode || null,
              imageUrl: value.imageUrl || null,
              position: value.position ?? index,
              isActive: value.isActive,
            },
            create: {
              attributeId: attribute.id,
              value: value.value.trim(),
              slug: valueSlug,
              colorCode: value.colorCode || null,
              imageUrl: value.imageUrl || null,
              position: value.position ?? index,
              isActive: value.isActive,
            },
          });
      activeValueIds.push(saved.id);
    }

    if (input.id && activeValueIds.length > 0) {
      await tx.attributeValue.updateMany({
        where: { attributeId: attribute.id, id: { notIn: activeValueIds } },
        data: { isActive: false },
      });
    }

    return attribute;
  });
}

export async function deleteAttributeMaster(id: string) {
  return (db as any).attribute.update({ where: { id }, data: { isActive: false } });
}

export function buildVariantDrafts(input: GenerateVariantsInput, existingVariants: any[] = []) {
  const attributes = normalizeAttributePayload(input.attributes).filter(
    (attribute: ProductAttributeInput) => attribute.isVariant && attribute.values.length > 0,
  );
  const groups = attributes.map((attribute: ProductAttributeInput) =>
    attribute.values.map((value: any) => ({
      attribute: attribute.name,
      attributeSlug: attribute.slug,
      value: value.value,
      valueSlug: value.slug,
    })),
  );

  if (groups.length === 0 || groups.some((group: any[]) => group.length === 0)) return [];

  const existingKeys = new Set(existingVariants.map((variant) => variantCombinationKey(variant.values ?? [])));
  const generatedKeys = new Set<string>();

  return cartesianProduct(groups)
    .map((combination: any[], index: number) => {
      const key = variantCombinationKey(combination);
      if (existingKeys.has(key) || generatedKeys.has(key)) return null;
      generatedKeys.add(key);

      const values = combination.map((item) => item.value);
      const title = values.join(" / ");
      const sku = buildVariantSku({
        vendorCode: input.vendorCode || "VND",
        productCode: input.productCode || "PRD",
        values,
        sequence: existingVariants.length + index + 1,
      });

      return {
        productId: input.productId,
        title,
        sku,
      barcode: sku,
      productCode: "",
        price: input.basePrice,
        comparePrice: input.baseComparePrice ?? input.basePrice,
        costPrice: input.baseCostPrice ?? null,
        stock: input.defaultStock,
        lowStockAt: input.lowStockAt,
        status: "ACTIVE",
        taxClass: input.taxClass,
        hsnCodeId: input.hsnCodeId || null,
        gstRate: input.gstRate ?? null,
        isDefault: existingVariants.length === 0 && index === 0,
        isActive: true,
        values: combination,
        inventory: [],
        images: [],
      };
    })
    .filter(Boolean);
}

async function syncVariantChildren(tx: any, variantId: string, input: VariantInput) {
  await tx.variantImage.deleteMany({ where: { variantId } });
  for (const [index, image] of input.images.entries()) {
    await tx.variantImage.create({
      data: {
        variantId,
        url: image.url,
        altText: image.altText || null,
        position: image.position ?? index,
        isPrimary: image.isPrimary || index === 0,
      },
    });
  }

  for (const item of input.inventory) {
    await tx.variantInventory.upsert({
      where: { variantId_warehouseCode: { variantId, warehouseCode: item.warehouseCode } },
      update: {
        warehouseName: item.warehouseName || null,
        stock: item.stock,
        reservedStock: item.reservedStock,
        incomingStock: item.incomingStock,
        lowStockAt: item.lowStockAt,
      },
      create: {
        variantId,
        warehouseCode: item.warehouseCode,
        warehouseName: item.warehouseName || null,
        stock: item.stock,
        reservedStock: item.reservedStock,
        incomingStock: item.incomingStock,
        lowStockAt: item.lowStockAt,
      },
    });
  }
}

export async function upsertProductVariant(input: VariantInput) {
  return (db as any).$transaction(async (tx: any) => {
    const previous = input.id
      ? await tx.productVariant.findUnique({ where: { id: input.id } })
      : null;

    const data = {
      productId: input.productId,
      title: input.title || input.values.map((value) => value.value).join(" / ") || input.sku,
      sku: cleanCode(input.sku),
      barcode: cleanCode(input.sku),
      productCode: input.productCode ? cleanCode(input.productCode) : null,
      price: toNumber(input.price, 0),
      comparePrice: toNullableNumber(input.comparePrice),
      costPrice: toNullableNumber(input.costPrice),
      stock: Math.max(0, Math.trunc(toNumber(input.stock, 0))),
      reservedStock: Math.max(0, Math.trunc(toNumber(input.reservedStock, 0))),
      incomingStock: Math.max(0, Math.trunc(toNumber(input.incomingStock, 0))),
      lowStockAt: Math.max(0, Math.trunc(toNumber(input.lowStockAt, 5))),
      weight: toNullableNumber(input.weight),
      length: toNullableNumber(input.length),
      width: toNullableNumber(input.width),
      height: toNullableNumber(input.height),
      imageUrl: input.imageUrl || null,
      status: input.status,
      taxClass: input.taxClass,
      hsnCodeId: input.hsnCodeId || null,
      gstRate: toNullableNumber(input.gstRate),
      isDefault: input.isDefault,
      isActive: input.isActive && input.status === "ACTIVE",
    };

    if (previous) {
      data.sku = previous.sku;
      data.barcode = previous.barcode;
      data.productCode = previous.productCode;
    }

    const variant = input.id
      ? await tx.productVariant.update({ where: { id: input.id }, data })
      : await tx.productVariant.create({ data });

    if (input.isDefault) {
      await tx.productVariant.updateMany({
        where: { productId: input.productId, id: { not: variant.id } },
        data: { isDefault: false },
      });
    }

    await syncVariantChildren(tx, variant.id, input);
    await tx.variantHistory.create({
      data: {
        variantId: variant.id,
        action: previous ? "VARIANT_UPDATED" : "VARIANT_CREATED",
        oldValue: previous ?? null,
        newValue: variant,
      },
    });

    return variant;
  });
}

export async function persistGeneratedVariants(input: GenerateVariantsInput, variants: VariantInput[]) {
  return (db as any).$transaction(async (tx: any) => {
    const saved = [];
    for (const variantInput of variants) {
      const variant = await upsertProductVariantWithClient(tx, variantInput);
      saved.push(variant);
    }
    return saved;
  });
}

async function upsertProductVariantWithClient(tx: DbClient, input: VariantInput) {
  const previous = input.id ? await (tx as any).productVariant.findUnique({ where: { id: input.id } }) : null;
  const variant = await (tx as any).productVariant.upsert({
    where: { sku: cleanCode(input.sku) },
    update: {
      price: toNumber(input.price, 0),
      comparePrice: toNullableNumber(input.comparePrice),
      costPrice: toNullableNumber(input.costPrice),
      stock: Math.max(0, Math.trunc(toNumber(input.stock, 0))),
      lowStockAt: Math.max(0, Math.trunc(toNumber(input.lowStockAt, 5))),
      taxClass: input.taxClass,
      hsnCodeId: input.hsnCodeId || null,
      gstRate: toNullableNumber(input.gstRate),
      status: input.status,
      isActive: input.isActive,
    },
    create: {
      productId: input.productId,
      title: input.title || input.values.map((value) => value.value).join(" / ") || input.sku,
      sku: cleanCode(input.sku),
      barcode: cleanCode(input.sku),
      productCode: null,
      price: toNumber(input.price, 0),
      comparePrice: toNullableNumber(input.comparePrice),
      costPrice: toNullableNumber(input.costPrice),
      stock: Math.max(0, Math.trunc(toNumber(input.stock, 0))),
      lowStockAt: Math.max(0, Math.trunc(toNumber(input.lowStockAt, 5))),
      taxClass: input.taxClass,
      hsnCodeId: input.hsnCodeId || null,
      gstRate: toNullableNumber(input.gstRate),
      status: input.status,
      isDefault: input.isDefault,
      isActive: input.isActive,
    },
  });
  await syncVariantChildren(tx as any, variant.id, input);
  await (tx as any).variantHistory.create({
    data: {
      variantId: variant.id,
      action: previous ? "VARIANT_UPDATED" : "VARIANT_CREATED",
      oldValue: previous ?? null,
      newValue: variant,
    },
  });
  return variant;
}

export async function bulkUpdateVariants(input: BulkVariantUpdateInput) {
  return (db as any).$transaction(async (tx: any) => {
    const data = Object.fromEntries(
      Object.entries(input.data).filter(([, value]) => value !== undefined),
    );
    if ("status" in data) data.isActive = data.status === "ACTIVE";
    const result = await tx.productVariant.updateMany({
      where: { productId: input.productId, id: { in: input.ids } },
      data,
    });
    await tx.variantHistory.createMany({
      data: input.ids.map((variantId) => ({
        variantId,
        action: "BULK_UPDATED",
        newValue: data,
      })),
    });
    return result;
  });
}

export async function bulkDeleteVariants(input: BulkVariantDeleteInput) {
  return (db as any).$transaction(async (tx: any) => {
    const locked = await tx.productVariant.findMany({
      where: { productId: input.productId, id: { in: input.ids }, orderItems: { some: {} } },
      select: { id: true },
    });
    const lockedIds = new Set(locked.map((item: any) => item.id));
    const deletableIds = input.ids.filter((id) => !lockedIds.has(id));

    if (deletableIds.length) {
      await tx.productVariant.deleteMany({
        where: { productId: input.productId, id: { in: deletableIds } },
      });
    }
    if (lockedIds.size) {
      await tx.productVariant.updateMany({
        where: { productId: input.productId, id: { in: Array.from(lockedIds) } },
        data: { status: "INACTIVE", isActive: false },
      });
    }

    return {
      deleted: deletableIds.length,
      deactivated: lockedIds.size,
    };
  });
}
