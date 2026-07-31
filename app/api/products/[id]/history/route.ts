import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  findProductByIdentifier,
  normalizeProductIdentifier,
} from "@/lib/product-identifier";
import { ProductHistoryActions } from "@/lib/product-history";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const PRODUCT_HISTORY_ACTIONS = Object.values(ProductHistoryActions) as [
  string,
  ...string[],
];

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: z.enum(PRODUCT_HISTORY_ACTIONS).optional(),
  variantId: z.string().trim().optional(),
  search: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const actor = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!actor || actor.role === "USER") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const product = await db.product.findFirst({
      where: {
        OR: [{ id }, { productCode: id }],
      },
      select: { id: true, userId: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (actor.role === "SELLER" && product.userId !== actor.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = historyQuerySchema.parse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      action: searchParams.get("action") || undefined,
      variantId: searchParams.get("variantId") || undefined,
      search: searchParams.get("search") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
    });
    const normalizedSearch = query.search
      ? normalizeProductIdentifier(query.search)
      : null;
    const exactMatch = normalizedSearch
      ? await findProductByIdentifier(normalizedSearch)
      : null;
    const resolvedVariantId =
      query.variantId ??
      (exactMatch &&
      exactMatch.type !== "PRODUCT_CODE" &&
      exactMatch.productId === id
        ? exactMatch.variantId
        : undefined);
    const shouldApplyPartialSearch = Boolean(normalizedSearch && !exactMatch);
    const where: Prisma.ProductHistoryWhereInput = {
      productId: product.id,
      ...(query.action ? { action: query.action } : {}),
      ...(resolvedVariantId
        ? { OR: [{ variantId: resolvedVariantId }, { variantId: null }] }
        : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {}),
            },
          }
        : {}),
      ...(shouldApplyPartialSearch && normalizedSearch
        ? {
            AND: [
              ...(resolvedVariantId
                ? [{ OR: [{ variantId: resolvedVariantId }, { variantId: null }] }]
                : []),
              {
                OR: [
                  { sku: { contains: normalizedSearch, mode: "insensitive" } },
                  {
                    barcode: {
                      contains: normalizedSearch,
                      mode: "insensitive",
                    },
                  },
                  {
                    productCode: {
                      contains: normalizedSearch,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      db.productHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize,
      }),
      db.productHistory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid product history query", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("GET_PRODUCT_HISTORY_ERROR", error);
    return NextResponse.json(
      { success: false, error: "Failed to load product history" },
      { status: 500 }
    );
  }
}
