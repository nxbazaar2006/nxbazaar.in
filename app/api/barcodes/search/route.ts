import { auth } from "@/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") || "").trim();

    const role = session.user.role || "";
    const userId = session.user.id;
    const isSeller = !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role);

    const productOwnerFilter = isSeller ? { userId } : undefined;

    if (!query) {
      const recentVariants = await db.productVariant.findMany({
        where: {
          product: productOwnerFilter,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              productCode: true,
              imageUrl: true,
            },
          },
        },
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      const formatted = recentVariants.map((v) => ({
        id: v.id,
        productId: v.productId,
        productTitle: v.product.title,
        variantTitle: v.title,
        productCode: v.productCode || v.product.productCode || "—",
        sku: v.sku || "—",
        barcode: v.barcode || "—",
        price: v.price,
        stock: v.stock,
        imageUrl: v.imageUrl || v.product.imageUrl || "",
      }));

      return NextResponse.json({ success: true, data: formatted });
    }

    const normalized = query.toUpperCase();

    const variants = await db.productVariant.findMany({
      where: {
        product: productOwnerFilter,
        OR: [
          { barcode: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { productCode: { contains: query, mode: "insensitive" } },
          { title: { contains: query, mode: "insensitive" } },
          { product: { productCode: { contains: query, mode: "insensitive" } } },
          { product: { title: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productCode: true,
            imageUrl: true,
          },
        },
      },
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const formatted = variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      productTitle: v.product.title,
      variantTitle: v.title,
      productCode: v.productCode || v.product.productCode || "—",
      sku: v.sku || "—",
      barcode: v.barcode || "—",
      price: v.price,
      stock: v.stock,
      imageUrl: v.imageUrl || v.product.imageUrl || "",
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("BARCODE_SEARCH_ERROR", error);
    return NextResponse.json(
      { success: false, message: "Failed to search barcodes", error: String(error) },
      { status: 500 }
    );
  }
}
