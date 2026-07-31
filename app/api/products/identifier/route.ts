import { auth } from "@/auth";
import { findProductByIdentifier, normalizeProductIdentifier } from "@/lib/product-identifier-lookup";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const identifier = normalizeProductIdentifier(new URL(request.url).searchParams.get("identifier"));
  if (!identifier) return NextResponse.json({ message: "Identifier is required" }, { status: 400 });

  const result = await findProductByIdentifier(identifier, { session });
  if (!result) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  const variantQuery = result.type === "PRODUCT_CODE" ? "" : `?variantId=${result.variantId}`;
  const dashboardHistoryUrl = `/dashboard/products/${result.productId}/history${variantQuery}`;
  return NextResponse.json({
    result,
    historyUrl: dashboardHistoryUrl,
    dashboardHistoryUrl,
  });
}
