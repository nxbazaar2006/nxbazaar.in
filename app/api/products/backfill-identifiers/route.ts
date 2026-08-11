import { auth } from "@/auth";
import db from "@/lib/db";
import { applyServerGeneratedProductIdentifiers } from "@/lib/product-identifiers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR", "SELLER"].includes(session.user.role || "")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const where = session.user.role === "SELLER" ? { userId: session.user.id } : undefined;

    const products = await db.product.findMany({
      where,
      include: {
        category: { select: { title: true } },
        subCategory: { select: { title: true } },
        variants: true,
      },
    });

    let updatedProductsCount = 0;
    let updatedVariantsCount = 0;

    for (const product of products) {
      const needsProductCode = !product.productCode;
      const needsProductSku = !product.sku;
      const needsProductBarcode = !product.barcode || !/^\d{12}$/.test(product.barcode);
      const needsVariantIdentifiers = product.variants.some((v) => !v.sku || !v.barcode || !/^\d{12}$/.test(v.barcode));

      if (
        needsProductCode ||
        needsProductSku ||
        needsProductBarcode ||
        needsVariantIdentifiers ||
        product.variants.length === 0
      ) {
        const payload: any = {
          variants: product.variants.map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            productCode: v.productCode,
            barcode: v.barcode,
            price: v.price,
            stock: v.stock,
          })),
        };

        if (payload.variants.length === 0) {
          payload.variants = [
            {
              title: product.title,
              price: product.salePrice || product.productPrice || 0,
              stock: product.productStock || 10,
            },
          ];
        }

        const productData: any = {
          userId: product.userId,
          title: product.title,
          productCode: product.productCode,
          sku: product.sku,
          barcode: product.barcode,
        };

        await applyServerGeneratedProductIdentifiers({
          prisma: db,
          payload,
          productData,
          existingProduct: product.productCode ? (product as any) : null,
          categoryTitle: product.category?.title || "",
          subCategoryTitle: product.subCategory?.title || "",
        });

        const firstVariant = payload.variants[0];

        await db.product.update({
          where: { id: product.id },
          data: {
            productCode: productData.productCode!,
            sku: productData.sku || firstVariant?.sku || null,
            barcode: productData.barcode || firstVariant?.barcode || null,
          },
        });

        updatedProductsCount++;

        for (const variant of payload.variants) {
          if (variant.id) {
            await db.productVariant.update({
              where: { id: variant.id },
              data: {
                sku: variant.sku,
                productCode: productData.productCode!,
                barcode: variant.barcode,
              },
            });
            updatedVariantsCount++;
          } else {
            await db.productVariant.create({
              data: {
                productId: product.id,
                title: variant.title || product.title,
                sku: variant.sku,
                productCode: productData.productCode!,
                barcode: variant.barcode,
                price: product.salePrice || product.productPrice || 0,
                stock: product.productStock || 10,
              },
            });
            updatedVariantsCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Backfilled identifiers (ProductCode, SKU, 12-digit Barcode) for ${updatedProductsCount} product(s) and ${updatedVariantsCount} variant(s).`,
      updatedProductsCount,
      updatedVariantsCount,
    });
  } catch (error) {
    console.error("BACKFILL_IDENTIFIERS_ERROR", error);
    return NextResponse.json(
      { success: false, message: "Failed to backfill product identifiers", error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
