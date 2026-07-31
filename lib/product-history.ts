import type { Prisma } from "@prisma/client";

export const ProductHistoryActions = {
  PRODUCT_CREATED: "PRODUCT_CREATED",
  PRODUCT_UPDATED: "PRODUCT_UPDATED",
  PRODUCT_DELETED: "PRODUCT_DELETED",
  PRODUCT_RESTORED: "PRODUCT_RESTORED",
  PRODUCT_ACTIVATED: "PRODUCT_ACTIVATED",
  PRODUCT_DEACTIVATED: "PRODUCT_DEACTIVATED",
  VARIANT_CREATED: "VARIANT_CREATED",
  VARIANT_UPDATED: "VARIANT_UPDATED",
  VARIANT_DELETED: "VARIANT_DELETED",
  PRICE_CHANGED: "PRICE_CHANGED",
  STOCK_CHANGED: "STOCK_CHANGED",
  CATEGORY_CHANGED: "CATEGORY_CHANGED",
  SUBCATEGORY_CHANGED: "SUBCATEGORY_CHANGED",
  SKU_GENERATED: "SKU_GENERATED",
  BARCODE_GENERATED: "BARCODE_GENERATED",
  AI_DRAFT_APPLIED: "AI_DRAFT_APPLIED",
  BULK_UPDATE: "BULK_UPDATE",
} as const;

export type ProductHistoryAction =
  (typeof ProductHistoryActions)[keyof typeof ProductHistoryActions];

type ProductHistoryTransaction = {
  productHistory: {
    create(args: {
      data: {
        productId: string;
        productTitle: string;
        productCode: string | null;
        variantId: string | null;
        sku: string | null;
        barcode: string | null;
        action: ProductHistoryAction;
        field: string | null;
        oldValue: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
        newValue: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
        changedByUserId: string | null;
        changedByUserCode: string | null;
        changedByName: string | null;
        changedByRole: string | null;
        sellerId: string | null;
        sellerCode: string | null;
        note: string | null;
      };
    }): Promise<unknown>;
  };
  user: {
    findUnique(args: {
      where: { id: string };
      select: {
        id: true;
        name: true;
        role: true;
        profile: { select: { username: true } };
        sellerProfile: { select: { code: true } };
      };
    }): Promise<{
      id: string;
      name: string | null;
      role: string;
      profile: { username: string | null } | null;
      sellerProfile: { code: string | null } | null;
    } | null>;
  };
};

export type CreateProductHistoryInput = {
  productId: string;
  productTitle?: string | null;
  title?: string | null;
  productCode?: string | null;

  variantId?: string | null;
  sku?: string | null;
  barcode?: string | null;

  action: ProductHistoryAction;
  field?: string | null;

  oldValue?: unknown;
  newValue?: unknown;

  changedByUserId?: string | null;
  changedByUserCode?: string | null;
  changedByName?: string | null;
  changedByRole?: string | null;

  sellerId?: string | null;
  sellerCode?: string | null;

  note?: string | null;
};

export type ProductHistoryActor = {
  changedByUserId: string | null;
  changedByUserCode: string | null;
  changedByName: string | null;
  changedByRole: string | null;
  sellerId: string | null;
  sellerCode: string | null;
};

export function toHistoryJson(
  value: unknown
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === undefined || value === null || value === "") {
    return null as unknown as Prisma.NullableJsonNullValueInput;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function historyValuesEqual(oldValue: unknown, newValue: unknown) {
  return JSON.stringify(toHistoryJson(oldValue)) === JSON.stringify(toHistoryJson(newValue));
}

export async function resolveProductHistoryActor(
  tx: ProductHistoryTransaction,
  fallbackUserId?: string | null
): Promise<ProductHistoryActor> {
  const userId = fallbackUserId ?? null;

  if (!userId) {
    return {
      changedByUserId: null,
      changedByUserCode: null,
      changedByName: null,
      changedByRole: null,
      sellerId: null,
      sellerCode: null,
    };
  }

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      profile: { select: { username: true } },
      sellerProfile: { select: { code: true } },
    },
  });

  return {
    changedByUserId: user?.id ?? userId,
    changedByUserCode: user?.profile?.username ?? user?.id ?? userId,
    changedByName: user?.name ?? null,
    changedByRole: user?.role ?? null,
    sellerId: user?.role === "SELLER" ? user.id : null,
    sellerCode: user?.sellerProfile?.code ?? null,
  };
}

export async function historyActorFromSession(
  txOrSession: any,
  fallbackUserId?: string | null
): Promise<ProductHistoryActor> {
  if (txOrSession?.user) {
    const user = txOrSession.user;
    return {
      changedByUserId: user.id ?? null,
      changedByUserCode: user.email ?? user.id ?? null,
      changedByName: user.name ?? null,
      changedByRole: user.role ?? null,
      sellerId: user.role === "SELLER" ? user.id : null,
      sellerCode: null,
    };
  }
  return resolveProductHistoryActor(txOrSession, fallbackUserId);
}

export function historyBase(input: {
  productId?: string;
  id?: string;
  productTitle?: string | null;
  title?: string | null;
  productCode?: string | null;
  variantId?: string | null;
  sku?: string | null;
  barcode?: string | null;
  actor?: Partial<ProductHistoryActor> | null;
  changedByUserId?: string | null;
  changedByUserCode?: string | null;
  changedByName?: string | null;
  changedByRole?: string | null;
  sellerId?: string | null;
  sellerCode?: string | null;
}) {
  return {
    productId: input.productId ?? input.id ?? "",
    productTitle: input.productTitle ?? input.title ?? "",
    productCode: input.productCode ?? null,
    variantId: input.variantId ?? null,
    sku: input.sku ?? null,
    barcode: input.barcode ?? null,
    changedByUserId:
      input.changedByUserId ?? input.actor?.changedByUserId ?? null,
    changedByUserCode:
      input.changedByUserCode ?? input.actor?.changedByUserCode ?? null,
    changedByName: input.changedByName ?? input.actor?.changedByName ?? null,
    changedByRole: input.changedByRole ?? input.actor?.changedByRole ?? null,
    sellerId: input.sellerId ?? input.actor?.sellerId ?? null,
    sellerCode: input.sellerCode ?? input.actor?.sellerCode ?? null,
  };
}

export async function createProductHistory(
  tx: ProductHistoryTransaction,
  input: CreateProductHistoryInput
) {
  await tx.productHistory.create({
    data: {
      productId: input.productId,
      productTitle: input.productTitle ?? input.title ?? "",
      productCode: input.productCode ?? null,
      variantId: input.variantId ?? null,
      sku: input.sku ?? null,
      barcode: input.barcode ?? null,
      action: input.action,
      field: input.field ?? null,
      oldValue: toHistoryJson(input.oldValue),
      newValue: toHistoryJson(input.newValue),
      changedByUserId: input.changedByUserId ?? null,
      changedByUserCode: input.changedByUserCode ?? null,
      changedByName: input.changedByName ?? null,
      changedByRole: input.changedByRole ?? null,
      sellerId: input.sellerId ?? null,
      sellerCode: input.sellerCode ?? null,
      note: input.note ?? null,
    },
  });
}

export async function createChangedFieldHistory(
  tx: ProductHistoryTransaction,
  inputOrBase: any,
  field?: string,
  oldValue?: unknown,
  newValue?: unknown,
  action?: ProductHistoryAction
) {
  if (field !== undefined) {
    if (historyValuesEqual(oldValue, newValue)) return;
    await createProductHistory(tx, {
      ...inputOrBase,
      action: action ?? (ProductHistoryActions.PRODUCT_UPDATED as any),
      field,
      oldValue,
      newValue,
    });
    return;
  }

  const changes = inputOrBase?.changes || [];
  for (const change of changes) {
    if (historyValuesEqual(change.oldValue, change.newValue)) {
      continue;
    }

    await createProductHistory(tx, {
      ...inputOrBase,
      action: change.action ?? inputOrBase.action,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
    });
  }
}

export function productFieldAction(field: string, newValue: unknown) {
  if (field === "categoryId") return ProductHistoryActions.CATEGORY_CHANGED;
  if (field === "subCategoryId") return ProductHistoryActions.SUBCATEGORY_CHANGED;
  if (field === "isActive") {
    return newValue
      ? ProductHistoryActions.PRODUCT_ACTIVATED
      : ProductHistoryActions.PRODUCT_DEACTIVATED;
  }

  return ProductHistoryActions.PRODUCT_UPDATED;
}

export function variantFieldAction(field: string) {
  if (field === "price" || field === "salePrice" || field === "wholesalePrice") {
    return ProductHistoryActions.PRICE_CHANGED;
  }

  if (field === "stock") {
    return ProductHistoryActions.STOCK_CHANGED;
  }

  return ProductHistoryActions.VARIANT_UPDATED;
}

export type ProductCreationHistorySnapshot = {
  id: string;
  title: string;
  productCode?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  userId?: string | null;
  brand?: unknown;
  tags?: unknown;
  isActive?: boolean | null;
  status?: unknown;
};

export type VariantCreationHistorySnapshot = {
  id: string;
  title?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price?: unknown;
  salePrice?: unknown;
  stock?: unknown;
  isActive?: boolean | null;
  attributes?: unknown;
};

export async function recordProductCreatedHistory(
  tx: ProductHistoryTransaction,
  input: {
    product: ProductCreationHistorySnapshot;
    variants?: VariantCreationHistorySnapshot[];
    actor: ProductHistoryActor;
    sellerId?: string | null;
    sellerCode?: string | null;
  }
) {
  const sellerId = input.sellerId ?? input.product.userId ?? input.actor.sellerId;
  const sellerCode = input.sellerCode ?? input.actor.sellerCode;

  await createProductHistory(tx, {
    productId: input.product.id,
    productTitle: input.product.title,
    productCode: input.product.productCode,
    action: ProductHistoryActions.PRODUCT_CREATED,
    oldValue: null,
    newValue: {
      title: input.product.title,
      productCode: input.product.productCode,
      categoryId: input.product.categoryId,
      subCategoryId: input.product.subCategoryId,
      sellerId,
      brand: input.product.brand,
      tags: input.product.tags,
      status: input.product.status ?? input.product.isActive,
    },
    ...input.actor,
    sellerId,
    sellerCode,
  });

  for (const variant of input.variants ?? []) {
    await createProductHistory(tx, {
      productId: input.product.id,
      productTitle: input.product.title,
      productCode: input.product.productCode,
      variantId: variant.id,
      sku: variant.sku,
      barcode: variant.barcode,
      action: ProductHistoryActions.VARIANT_CREATED,
      oldValue: null,
      newValue: variant,
      ...input.actor,
      sellerId,
      sellerCode,
    });

    if (variant.sku) {
      await createProductHistory(tx, {
        productId: input.product.id,
        productTitle: input.product.title,
        productCode: input.product.productCode,
        variantId: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        action: ProductHistoryActions.SKU_GENERATED,
        field: "sku",
        oldValue: null,
        newValue: variant.sku,
        ...input.actor,
        sellerId,
        sellerCode,
      });
    }

    if (variant.barcode) {
      await createProductHistory(tx, {
        productId: input.product.id,
        productTitle: input.product.title,
        productCode: input.product.productCode,
        variantId: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        action: ProductHistoryActions.BARCODE_GENERATED,
        field: "barcode",
        oldValue: null,
        newValue: variant.barcode,
        ...input.actor,
        sellerId,
        sellerCode,
      });
    }
  }
}

export async function recordProductFieldChanges(
  tx: ProductHistoryTransaction,
  input: {
    productId: string;
    productTitle: string;
    productCode?: string | null;
    actor: ProductHistoryActor;
    sellerId?: string | null;
    sellerCode?: string | null;
    changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  }
) {
  await createChangedFieldHistory(tx, {
    productId: input.productId,
    productTitle: input.productTitle,
    productCode: input.productCode,
    action: ProductHistoryActions.PRODUCT_UPDATED,
    ...input.actor,
    sellerId: input.sellerId ?? input.actor.sellerId,
    sellerCode: input.sellerCode ?? input.actor.sellerCode,
    changes: input.changes.map((change) => ({
      ...change,
      action: productFieldAction(change.field, change.newValue),
    })),
  });
}

export async function recordVariantFieldChanges(
  tx: ProductHistoryTransaction,
  input: {
    productId: string;
    productTitle: string;
    productCode?: string | null;
    variantId: string;
    sku?: string | null;
    barcode?: string | null;
    actor: ProductHistoryActor;
    sellerId?: string | null;
    sellerCode?: string | null;
    changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>;
  }
) {
  await createChangedFieldHistory(tx, {
    productId: input.productId,
    productTitle: input.productTitle,
    productCode: input.productCode,
    variantId: input.variantId,
    sku: input.sku,
    barcode: input.barcode,
    action: ProductHistoryActions.VARIANT_UPDATED,
    ...input.actor,
    sellerId: input.sellerId ?? input.actor.sellerId,
    sellerCode: input.sellerCode ?? input.actor.sellerCode,
    changes: input.changes.map((change) => ({
      ...change,
      action: variantFieldAction(change.field),
    })),
  });
}
