import { auth } from "@/auth";
import db from "@/lib/db";
import { findProductByIdentifier, normalizeProductIdentifier } from "@/lib/product-identifier-lookup";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const code = normalizeProductIdentifier(new URL(request.url).searchParams.get("code"));
  if (!code) return NextResponse.json({ message: "Barcode is required" }, { status: 400 });

  const match = await findProductByIdentifier(code, { session });
  if (!match) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  const product = await db.product.findUnique({
    where: { id: match.productId },
    include: {
      category: true,
      subCategory: true,
      variants: true,
      history: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  const matchedVariant =
    match.type === "PRODUCT_CODE"
      ? null
      : product.variants.find((variant) => variant.id === match.variantId) ?? null;
  const productQuery = match.type === "PRODUCT_CODE" ? "?source=scan" : `?variantId=${match.variantId}&source=scan`;
  const dashboardHistoryUrl = `/dashboard/products/${product.id}/history${productQuery}`;

  return NextResponse.json({
    product,
    matchedVariant,
    match,
    historyUrl: dashboardHistoryUrl,
    dashboardHistoryUrl,
  });
}
