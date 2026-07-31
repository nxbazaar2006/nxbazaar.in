import { findProductByIdentifier } from "@/lib/product-identifier";
import { NextResponse } from "next/server";
import { z } from "zod";

const lookupSchema = z.object({
  identifier: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  barcode: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = lookupSchema.parse(await request.json());
    const identifier = body.identifier ?? body.code ?? body.barcode;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Identifier is required" },
        { status: 400 }
      );
    }

    const result = await findProductByIdentifier(identifier);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const productHistoryPath =
      result.type === "PRODUCT_CODE"
        ? `/products/${result.productId}/history`
        : `/products/${result.productId}/history?variantId=${result.variantId}`;

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        productHistoryPath,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid lookup payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("PRODUCT_IDENTIFIER_LOOKUP_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  }
}
