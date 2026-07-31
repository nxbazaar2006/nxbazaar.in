import { auth } from "@/auth";
import db from "@/lib/db";
import { assertAuthenticated } from "@/lib/security";
import { ProductStatus, TaxMappingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

async function validateActiveHsn(hsnCodeId?: string | null) {
  if (!hsnCodeId) return true;
  const hsn = await db.hsnCode.findFirst({
    where: {
      id: hsnCodeId,
      status: "ACTIVE",
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
    },
    select: { id: true },
  });
  return Boolean(hsn);
}

export type BulkUpdateProductPayload = {
  ids?: string[];
  isActive?: boolean;
  status?: ProductStatus;
  isWholesale?: boolean;
  categoryId?: string;
  subCategoryMode?: "unchanged" | "set" | "clear";
  subCategoryId?: string | null;
  brandMode?: "unchanged" | "set" | "clear";
  brandId?: string | null;
  hsnMode?: "unchanged" | "set" | "clear";
  hsnCodeId?: string | null;
  priceAdjustment?: {
    mode: "set" | "percent_change" | "amount_change";
    value: number;
  };
  stockAdjustment?: {
    mode: "set" | "add" | "subtract";
    value: number;
  };
};

export async function POST(request: Request) {
  const session = await auth();
  const denied = assertAuthenticated(session);
  if (denied) return denied;

  const body = (await request.json()) as BulkUpdateProductPayload;
  const ids = [...new Set((body.ids ?? []).filter(Boolean))];
  if (!ids.length) {
    return NextResponse.json({ success: false, message: "No products selected." }, { status: 400 });
  }

  if (body.hsnMode === "set" && !(await validateActiveHsn(body.hsnCodeId))) {
    return NextResponse.json(
      { success: false, message: "Selected HSN code is invalid, inactive, or expired." },
      { status: 400 }
    );
  }

  const canUpdateAll = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(String(session?.user?.role));
  const where = {
    id: { in: ids },
    ...(canUpdateAll ? {} : { userId: session?.user?.id }),
  };

  const simpleData: {
    isActive?: boolean;
    status?: ProductStatus;
    isWholesale?: boolean;
    categoryId?: string;
    subCategoryId?: string | null;
    brandId?: string | null;
    hsnCodeId?: string | null;
    hsnOverrideEnabled?: boolean;
    taxMappingStatus?: TaxMappingStatus;
  } = {};

  if (typeof body.isActive === "boolean") simpleData.isActive = body.isActive;
  if (body.status && Object.values(ProductStatus).includes(body.status)) simpleData.status = body.status;
  if (typeof body.isWholesale === "boolean") simpleData.isWholesale = body.isWholesale;

  if (body.categoryId) {
    simpleData.categoryId = body.categoryId;
    if (body.subCategoryMode === "set") {
      simpleData.subCategoryId = body.subCategoryId || null;
    } else if (body.subCategoryMode === "clear") {
      simpleData.subCategoryId = null;
    }
  } else if (body.subCategoryMode === "set") {
    simpleData.subCategoryId = body.subCategoryId || null;
  } else if (body.subCategoryMode === "clear") {
    simpleData.subCategoryId = null;
  }

  if (body.brandMode === "set") simpleData.brandId = body.brandId || null;
  if (body.brandMode === "clear") simpleData.brandId = null;

  if (body.hsnMode === "set") {
    simpleData.hsnCodeId = body.hsnCodeId || null;
    simpleData.hsnOverrideEnabled = true;
    simpleData.taxMappingStatus = TaxMappingStatus.MAPPED;
  }
  if (body.hsnMode === "clear") {
    simpleData.hsnCodeId = null;
    simpleData.hsnOverrideEnabled = false;
  }

  const hasPriceAdj = Boolean(body.priceAdjustment && Number.isFinite(body.priceAdjustment.value));
  const hasStockAdj = Boolean(body.stockAdjustment && Number.isFinite(body.stockAdjustment.value));
  const hasSimpleData = Object.keys(simpleData).length > 0;

  if (!hasSimpleData && !hasPriceAdj && !hasStockAdj) {
    return NextResponse.json({ success: false, message: "No valid changes selected." }, { status: 400 });
  }

  try {
    if (hasPriceAdj || hasStockAdj) {
      const targetProducts = await db.product.findMany({
        where,
        include: { variants: true },
      });

      const updates = targetProducts.map((product) => {
        const prodData: Record<string, unknown> = { ...simpleData };

        if (hasPriceAdj && body.priceAdjustment) {
          const { mode, value } = body.priceAdjustment;
          let newPrice = product.productPrice;
          let newSalePrice = product.salePrice;

          if (mode === "set") {
            newPrice = Math.max(0, value);
            newSalePrice = Math.max(0, value);
          } else if (mode === "percent_change") {
            const factor = 1 + value / 100;
            newPrice = Math.max(0, Math.round(product.productPrice * factor * 100) / 100);
            newSalePrice = Math.max(0, Math.round(product.salePrice * factor * 100) / 100);
          } else if (mode === "amount_change") {
            newPrice = Math.max(0, Math.round((product.productPrice + value) * 100) / 100);
            newSalePrice = Math.max(0, Math.round((product.salePrice + value) * 100) / 100);
          }

          prodData.productPrice = newPrice;
          prodData.salePrice = newSalePrice;
        }

        if (hasStockAdj && body.stockAdjustment) {
          const { mode, value } = body.stockAdjustment;
          let currentStock = product.productStock ?? 0;
          if (mode === "set") {
            currentStock = Math.max(0, Math.round(value));
          } else if (mode === "add") {
            currentStock = Math.max(0, Math.round(currentStock + value));
          } else if (mode === "subtract") {
            currentStock = Math.max(0, Math.round(currentStock - value));
          }
          prodData.productStock = currentStock;
          prodData.qty = currentStock;
        }

        const variantUpdates = product.variants.map((variant) => {
          const varData: Record<string, unknown> = {};
          if (hasPriceAdj && body.priceAdjustment) {
            const { mode, value } = body.priceAdjustment;
            const curVarPrice = Number(variant.price);
            let newVarPrice = curVarPrice;
            if (mode === "set") {
              newVarPrice = Math.max(0, value);
            } else if (mode === "percent_change") {
              newVarPrice = Math.max(0, Math.round(curVarPrice * (1 + value / 100) * 100) / 100);
            } else if (mode === "amount_change") {
              newVarPrice = Math.max(0, Math.round((curVarPrice + value) * 100) / 100);
            }
            varData.price = newVarPrice;
            varData.salePrice = newVarPrice;
          }

          if (hasStockAdj && body.stockAdjustment) {
            const { mode, value } = body.stockAdjustment;
            let curVarStock = variant.stock ?? 0;
            if (mode === "set") {
              curVarStock = Math.max(0, Math.round(value));
            } else if (mode === "add") {
              curVarStock = Math.max(0, Math.round(curVarStock + value));
            } else if (mode === "subtract") {
              curVarStock = Math.max(0, Math.round(curVarStock - value));
            }
            varData.stock = curVarStock;
          }

          return db.productVariant.update({
            where: { id: variant.id },
            data: varData,
          });
        });

        return [
          db.product.update({
            where: { id: product.id },
            data: prodData,
          }),
          ...variantUpdates,
        ];
      });

      const flattenedOps = updates.flat();
      await db.$transaction(flattenedOps);

      return NextResponse.json({
        success: true,
        message: `${targetProducts.length} products updated successfully.`,
        data: { updated: targetProducts.length },
      });
    }

    const result = await db.product.updateMany({ where, data: simpleData });
    return NextResponse.json({
      success: true,
      message: `${result.count} products updated successfully.`,
      data: { updated: result.count },
    });
  } catch (error) {
    console.error("Bulk product update error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update products." },
      { status: 500 }
    );
  }
}
