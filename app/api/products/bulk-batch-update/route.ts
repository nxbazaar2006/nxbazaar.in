import { auth } from "@/auth";
import db from "@/lib/db";
import { generateSlug } from "@/lib/generateSlug";
import { assertAuthenticated } from "@/lib/security";
import { NextResponse } from "next/server";

export type ProductBatchUpdateItem = {
  id: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  categoryId?: string;
  subCategoryId?: string | null;
  userId?: string;
  brandId?: string | null;
  productPrice?: number;
  salePrice?: number;
  wholesalePrice?: number | null;
  wholesaleQty?: number | null;
  isWholesale?: boolean;
  productStock?: number;
  unit?: string | null;
  weight?: number | null;
  tags?: string[];
  imageUrl?: string | null;
  productImages?: string[];
  attributes?: Record<string, string>;
};

export type BulkBatchUpdatePayload = {
  updates: ProductBatchUpdateItem[];
};

export async function POST(request: Request) {
  const session = await auth();
  const denied = assertAuthenticated(session);
  if (denied) return denied;

  const body = (await request.json()) as BulkBatchUpdatePayload;
  const updates = (body.updates ?? []).filter((item) => Boolean(item && item.id));

  if (!updates.length) {
    return NextResponse.json({ success: false, message: "No updates provided." }, { status: 400 });
  }

  const ids = updates.map((u) => u.id);
  const canUpdateAll = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(String(session?.user?.role));

  const existingProducts = await db.product.findMany({
    where: {
      id: { in: ids },
      ...(canUpdateAll ? {} : { userId: session?.user?.id }),
    },
    select: { id: true },
  });

  const allowedIds = new Set(existingProducts.map((p) => p.id));
  const validUpdates = updates.filter((u) => allowedIds.has(u.id));

  if (!validUpdates.length) {
    return NextResponse.json({ success: false, message: "No authorized products to update." }, { status: 403 });
  }

  try {
    for (const item of validUpdates) {
      const data: Record<string, unknown> = {};

      if (typeof item.title === "string" && item.title.trim()) {
        data.title = item.title.trim();
        data.slug = generateSlug(item.title.trim());
      }
      if (item.description !== undefined) {
        data.description = item.description ? item.description.trim() : null;
      }
      if (typeof item.isActive === "boolean") {
        data.isActive = item.isActive;
      }
      if (typeof item.categoryId === "string" && item.categoryId.trim()) {
        data.categoryId = item.categoryId;
      }
      if (item.subCategoryId !== undefined) {
        data.subCategoryId = item.subCategoryId || null;
      }
      if (typeof item.userId === "string" && item.userId.trim()) {
        data.userId = item.userId;
      }
      if (item.brandId !== undefined) {
        data.brandId = item.brandId || null;
      }
      if (typeof item.productPrice === "number" && Number.isFinite(item.productPrice)) {
        data.productPrice = Math.max(0, item.productPrice);
      }
      if (typeof item.salePrice === "number" && Number.isFinite(item.salePrice)) {
        data.salePrice = Math.max(0, item.salePrice);
      }
      if (item.wholesalePrice !== undefined) {
        data.wholesalePrice =
          item.wholesalePrice !== null && Number.isFinite(item.wholesalePrice)
            ? Math.max(0, item.wholesalePrice)
            : null;
      }
      if (item.wholesaleQty !== undefined) {
        data.wholesaleQty =
          item.wholesaleQty !== null && Number.isFinite(item.wholesaleQty)
            ? Math.max(0, Math.round(item.wholesaleQty))
            : null;
      }
      if (typeof item.isWholesale === "boolean") {
        data.isWholesale = item.isWholesale;
      }
      if (typeof item.productStock === "number" && Number.isFinite(item.productStock)) {
        const stock = Math.max(0, Math.round(item.productStock));
        data.productStock = stock;
        data.qty = stock;
      }
      if (item.unit !== undefined) {
        data.unit = item.unit ? item.unit.trim() : null;
      }
      if (item.weight !== undefined) {
        data.weight = item.weight !== null && Number.isFinite(item.weight) ? item.weight : null;
      }
      if (Array.isArray(item.tags)) {
        data.tags = item.tags.map((t) => t.trim()).filter(Boolean);
      }
      if (item.imageUrl !== undefined) {
        data.imageUrl = item.imageUrl || null;
      }
      if (Array.isArray(item.productImages)) {
        data.productImages = item.productImages;
      }

      await db.product.update({
        where: { id: item.id },
        data,
      });

      // Handle attributes (Age Group, Color, Fit, Gender, Material, Neck Type, Pack Size, Pattern, RAM, Size, Sleeve Type, Storage, Style, Warranty, etc.)
      if (item.attributes && typeof item.attributes === "object") {
        for (const [attrName, attrValue] of Object.entries(item.attributes)) {
          if (!attrName || !attrValue || !attrValue.trim()) continue;
          const cleanName = attrName.trim();
          const cleanVal = attrValue.trim();
          const attrSlug = generateSlug(cleanName);
          const valSlug = generateSlug(cleanVal);

          const attribute = await db.productAttribute.upsert({
            where: {
              productId_slug: {
                productId: item.id,
                slug: attrSlug,
              },
            },
            create: {
              productId: item.id,
              name: cleanName,
              slug: attrSlug,
              isVariant: true,
            },
            update: {
              name: cleanName,
            },
          });

          await db.productAttributeValue.upsert({
            where: {
              attributeId_slug: {
                attributeId: attribute.id,
                slug: valSlug,
              },
            },
            create: {
              attributeId: attribute.id,
              value: cleanVal,
              slug: valSlug,
            },
            update: {
              value: cleanVal,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved changes for ${validUpdates.length} product(s).`,
      data: { updatedCount: validUpdates.length },
    });
  } catch (error) {
    console.error("Batch product update error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to batch update products." },
      { status: 500 }
    );
  }
}
