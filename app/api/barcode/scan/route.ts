import { db } from "@/lib/db";
import { findProductByIdentifier } from "@/lib/product-identifier";
import { NextResponse } from "next/server";
import { z } from "zod";

const scanSchema = z.object({
  code: z.string().trim().min(1).optional(),
  barcode: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = scanSchema.parse(await request.json());
    const code = parsed.code ?? parsed.barcode;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Scan code is required" },
        { status: 400 }
      );
    }

    const match = await findProductByIdentifier(code);

    if (!match) {
      return NextResponse.json(
        { success: false, error: "Product or variant not found" },
        { status: 404 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: match.productId },
      include: {
        images: true,
        translations: true,
      },
    });
    const variant =
      match.type === "PRODUCT_CODE"
        ? null
        : await db.productVariant.findUnique({
            where: { id: match.variantId },
            include: { values: true },
          });
    const history = await db.productHistory.findMany({
      where: {
        productId: match.productId,
        ...(match.type === "PRODUCT_CODE"
          ? {}
          : { OR: [{ variantId: match.variantId }, { variantId: null }] }),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: {
        matchType: match.type,
        variant,
        product,
        history,
        productDetailsPath: `/products/${match.productId}`,
        productHistoryPath:
          match.type === "PRODUCT_CODE"
            ? `/products/${match.productId}/history?source=scan`
            : `/products/${match.productId}/history?variantId=${match.variantId}&source=scan`,
        variantId: match.type === "PRODUCT_CODE" ? null : match.variantId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid barcode scan payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("BARCODE_SCAN_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Failed to scan barcode" },
      { status: 500 }
    );
  }
}
