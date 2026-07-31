import { auth } from "@/auth";
import db from "@/lib/db";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const sku = body.sku || null;
    const source = body.source || "CUSTOMER";

    const product = await db.product.findFirst({
      where: { OR: [{ id }, { productCode: id }] },
      select: { id: true, productCode: true, variants: { select: { id: true, sku: true } } },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    let matchedVariantId: string | null = null;
    if (sku) {
      const matched = product.variants.find((v) => v.sku.toUpperCase() === String(sku).toUpperCase());
      if (matched) matchedVariantId = matched.id;
    }

    const reqHeaders = await headers();
    const rawIp = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || null;
    const ipHash = createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

    const session = await auth();
    const userId = session?.user?.id || null;

    const scanRecord = await (db as any).productQrScan.create({
      data: {
        productId: product.id,
        variantId: matchedVariantId,
        productCode: product.productCode,
        sku: sku || null,
        userId,
        source,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
        ipHash,
      },
    });

    return NextResponse.json({ success: true, scanId: scanRecord.id });
  } catch (error) {
    console.error("Failed to record QR scan API:", error);
    return NextResponse.json({ success: false, message: "Failed to record scan." }, { status: 500 });
  }
}
