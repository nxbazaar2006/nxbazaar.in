import db from "@/lib/db";
import { buildProductQrUrl, buildVariantQrUrl } from "@/lib/qr/build-qr-url";
import { generateQrPngBuffer, generateQrSvg } from "@/lib/qr/generate-qr";
import { qrQuerySchema } from "@/lib/qr/qr-validation";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const parsed = qrQuerySchema.safeParse({
      productCode: id,
      sku: searchParams.get("sku"),
      format: searchParams.get("format") || "png",
      size: searchParams.get("size") || "512",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid QR parameters", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { sku, format, size } = parsed.data;

    // 1. Verify Product exists (support lookups by product ID or productCode)
    const product = await db.product.findFirst({
      where: {
        OR: [{ id }, { productCode: id }],
      },
      select: { id: true, title: true, productCode: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    // 2. If SKU is passed, verify Variant exists and belongs to Product
    if (sku) {
      const variant = await db.productVariant.findFirst({
        where: { sku, productId: product.id },
        select: { id: true, sku: true },
      });

      if (!variant) {
        return NextResponse.json(
          { success: false, message: `Variant SKU "${sku}" does not belong to product "${product.productCode}".` },
          { status: 400 }
        );
      }
    }

    // 3. Construct Target QR URL
    const targetUrl = sku
      ? buildVariantQrUrl(product.productCode, sku)
      : buildProductQrUrl(product.productCode);

    // 4. Generate SVG or PNG response
    if (format === "svg") {
      const svgString = await generateQrSvg(targetUrl, { width: size });
      return new Response(svgString, {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }

    const pngBuffer = await generateQrPngBuffer(targetUrl, { width: size });
    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Content-Disposition": `inline; filename="${sku || product.productCode}-qr.png"`,
      },
    });
  } catch (error) {
    console.error("QR Route Error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate QR code." }, { status: 500 });
  }
}
