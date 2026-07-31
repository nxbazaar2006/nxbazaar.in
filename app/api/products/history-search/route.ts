import { auth } from "@/auth";
import db from "@/lib/db";
import { normalizeProductIdentifier } from "@/lib/product-identifier-lookup";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function productOwnerWhere(session): Prisma.ProductWhereInput {
  if (session?.user?.role === "ADMIN") return {};
  if ((session?.user?.role === "SELLER" || session?.user?.role === "FARMER") && session.user.id) {
    return { userId: session.user.id };
  }
  return { id: "__not_allowed__" };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role === "USER") return NextResponse.json({ items: [] });

  const raw = new URL(request.url).searchParams.get("search");
  const search = normalizeProductIdentifier(raw);
  if (!search) return NextResponse.json({ items: [] });

  const ownerWhere = productOwnerWhere(session);
  const products = await db.product.findMany({
    where: {
      AND: [
        ownerWhere,
        {
          OR: [
            { title: { contains: raw?.trim() || search, mode: "insensitive" } },
            { productCode: { contains: search, mode: "insensitive" } },
            { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
            { variants: { some: { barcode: { contains: search, mode: "insensitive" } } } },
          ],
        },
      ],
    },
    select: {
      id: true,
      title: true,
      productCode: true,
      variants: {
        where: {
          OR: [
            { sku: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, sku: true, barcode: true },
        take: 5,
      },
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  const items = products.flatMap((product) => {
    const productItem = {
      type: "PRODUCT",
      label: `Product · ${product.productCode}`,
      description: product.title,
      href: `/dashboard/products/${product.id}/history`,
    };
    const variantItems = product.variants.map((variant) => ({
      type: "VARIANT",
      label: `Variant · ${variant.title}`,
      description: `SKU · ${variant.sku}`,
      href: `/dashboard/products/${product.id}/history?variantId=${variant.id}`,
      sku: variant.sku,
      barcode: variant.barcode,
    }));
    return [productItem, ...variantItems];
  });

  return NextResponse.json({ items });
}
