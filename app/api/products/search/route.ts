import db from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchTerm = request.nextUrl.searchParams.get("search") || "";
  const sortBy = request.nextUrl.searchParams.get("sort");
  const min = request.nextUrl.searchParams.get("min");
  const max = request.nextUrl.searchParams.get("max");
  const page = request.nextUrl.searchParams.get("page") || "1";
  const pageSize = 12;

  const where: Prisma.ProductWhereInput = {
    OR: [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { productCode: { contains: searchTerm, mode: "insensitive" } },
      { sku: { contains: searchTerm, mode: "insensitive" } },
      { barcode: { contains: searchTerm, mode: "insensitive" } },
      { category: { title: { contains: searchTerm, mode: "insensitive" } } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      {
        variants: {
          some: {
            OR: [
              { sku: { contains: searchTerm, mode: "insensitive" } },
              { barcode: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
        },
      },
    ],
  };

  if (min && max) {
    where.salePrice = {
      gte: parseFloat(min),
      lte: parseFloat(max),
    };
  } else if (min) {
    where.salePrice = {
      gte: parseFloat(min),
    };
  } else if (max) {
    where.salePrice = {
      lte: parseFloat(max),
    };
  }

  try {
    const products = await db.product.findMany({
      where,
      include: {
        category: { include: { hsnCode: true } },
        subCategory: { include: { hsnCode: true } },
        hsnCode: true,
        variants: {
          where: { isActive: true },
          include: {
            values: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
      },
      skip: (parseInt(page, 10) - 1) * pageSize,
      take: pageSize,
      orderBy: {
        salePrice: sortBy === "asc" ? "asc" : "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("SEARCH_ROUTE_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to Fetch Products", error },
      { status: 500 }
    );
  }
}
