import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = String(session?.user?.role || "");

    if (!session?.user?.id || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role)) {
      return NextResponse.json({ success: false, message: "Only administrators can regenerate barcodes." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { variantId?: string; productId?: string };
    const { variantId, productId } = body;

    if (!variantId && !productId) {
      return NextResponse.json({ success: false, message: "Variant ID or Product ID is required." }, { status: 400 });
    }

    if (variantId) {
      const existing = await db.productVariant.findUnique({ where: { id: variantId }, select: { id: true, barcode: true } });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Product Variant not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        message: "Barcode is generated from the SKU and cannot be regenerated.",
        data: {
          variantId: existing.id,
          barcode: existing.barcode,
          barcodeType: "CODE128",
        },
      }, { status: 409 });
    }

    if (productId) {
      const existing = await db.product.findUnique({ where: { id: productId }, select: { id: true, barcode: true } });
      if (!existing) {
        return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        message: "Barcode is generated from the SKU and cannot be regenerated.",
        data: {
          productId: existing.id,
          barcode: existing.barcode,
          barcodeType: "CODE128",
        },
      }, { status: 409 });
    }

    return NextResponse.json({ success: false, message: "Invalid request payload." }, { status: 400 });
  } catch (error) {
    console.error("Barcode regeneration error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to regenerate barcode." },
      { status: 500 }
    );
  }
}
