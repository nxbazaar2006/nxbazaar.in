import { auth } from "@/auth";
import { db } from "@/lib/db";
import { findProductByIdentifier } from "@/lib/product-identifier";
import { BarcodeActions } from "@/components/products/barcode-actions";
import { ProductHistoryTable } from "@/components/products/product-history-table";
import { ProductHistoryActions } from "@/lib/product-history";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type ProductHistoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    action?: string;
    variantId?: string;
    search?: string;
    from?: string;
    to?: string;
  }>;
};

const PAGE_SIZE = 20;

function actionGroupWhere(action?: string): Prisma.ProductHistoryWhereInput {
  if (!action || action === "ALL") return {};
  if (action === "PRODUCT_UPDATES") {
    return {
      action: {
        in: [
          ProductHistoryActions.PRODUCT_UPDATED,
          ProductHistoryActions.PRODUCT_ACTIVATED,
          ProductHistoryActions.PRODUCT_DEACTIVATED,
          ProductHistoryActions.CATEGORY_CHANGED,
          ProductHistoryActions.SUBCATEGORY_CHANGED,
        ],
      },
    };
  }
  if (action === "VARIANT_UPDATES") {
    return {
      action: {
        in: [
          ProductHistoryActions.VARIANT_UPDATED,
          ProductHistoryActions.VARIANT_CREATED,
          ProductHistoryActions.VARIANT_DELETED,
        ],
      },
    };
  }
  if (action === "PRICE_CHANGES") return { action: ProductHistoryActions.PRICE_CHANGED };
  if (action === "STOCK_CHANGES") return { action: ProductHistoryActions.STOCK_CHANGED };
  if (action === "AI_DRAFT_CHANGES") {
    return { action: ProductHistoryActions.AI_DRAFT_APPLIED };
  }

  return Object.values(ProductHistoryActions).includes(
    action as (typeof ProductHistoryActions)[keyof typeof ProductHistoryActions]
  )
    ? {
        action:
          action as (typeof ProductHistoryActions)[keyof typeof ProductHistoryActions],
      }
    : {};
}

export default async function ProductHistoryPage({
  params,
  searchParams,
}: ProductHistoryPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const actor = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!actor || actor.role === "USER") redirect("/");

  const { slug } = await params;
  const query = await searchParams;
  const product = await db.product.findFirst({
    where: {
      OR: [{ id: slug }, { slug }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      productCode: true,
      userId: true,
      variants: {
        select: {
          id: true,
          title: true,
          sku: true,
          barcode: true,
        },
      },
    },
  });

  if (!product) notFound();
  if (actor.role === "SELLER" && product.userId !== actor.id) redirect("/");

  const page = Math.max(Number(query.page ?? 1), 1);
  const search = query.search?.trim();
  const exactMatch = search ? await findProductByIdentifier(search) : null;
  const productPath = `/products/${product.slug ?? product.id}`;

  if (exactMatch?.type === "PRODUCT_CODE") {
    redirect(`/products/${product.slug ?? exactMatch.productId}/history`);
  }

  if (
    exactMatch &&
    (exactMatch.type as string) !== "PRODUCT_CODE" &&
    exactMatch.productId !== product.id
  ) {
    redirect(
      `/products/${exactMatch.productId}/history?variantId=${exactMatch.variantId}&search=${encodeURIComponent(search ?? "")}`
    );
  }

  if (
    exactMatch &&
    (exactMatch.type as string) !== "PRODUCT_CODE" &&
    exactMatch.productId === product.id &&
    !query.variantId
  ) {
    redirect(
      `${productPath}/history?variantId=${exactMatch.variantId}&search=${encodeURIComponent(search ?? "")}`
    );
  }

  const shouldApplyPartialSearch = Boolean(search && !exactMatch);
  const selectedVariant = query.variantId
    ? product.variants.find((variant) => variant.id === query.variantId)
    : exactMatch && (exactMatch.type as string) !== "PRODUCT_CODE"
      ? product.variants.find((variant) => variant.id === exactMatch.variantId)
      : null;
  const where: Prisma.ProductHistoryWhereInput = {
    productId: product.id,
    ...actionGroupWhere(query.action),
    ...(query.variantId
      ? { OR: [{ variantId: query.variantId }, { variantId: null }] }
      : {}),
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
    ...(shouldApplyPartialSearch && search
      ? {
          AND: [
            ...(query.variantId
              ? [{ OR: [{ variantId: query.variantId }, { variantId: null }] }]
              : []),
            {
              OR: [
                { sku: { contains: search, mode: "insensitive" } },
                { barcode: { contains: search, mode: "insensitive" } },
                { productCode: { contains: search, mode: "insensitive" } },
              ],
            },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    db.productHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.productHistory.count({ where }),
  ]);
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Product History</h1>
          <p className="text-sm text-muted-foreground">
            Product Code: {product.productCode}
          </p>
          {selectedVariant ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Selected Variant · SKU: {selectedVariant.sku ?? "-"} · Barcode:{" "}
              {selectedVariant.barcode ?? "-"}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {query.variantId ? (
            <Link className="rounded-md border px-3 py-2 text-sm" href={`${productPath}/history`}>
              Clear variant filter
            </Link>
          ) : null}
          <Link className="rounded-md border px-3 py-2 text-sm" href={productPath}>
            View product
          </Link>
          <Link className="rounded-md border px-3 py-2 text-sm" href={`${productPath}/edit`}>
            Edit product
          </Link>
          {selectedVariant ? (
            <BarcodeActions
              barcode={selectedVariant.barcode}
              label={selectedVariant.sku ?? "barcode"}
            />
          ) : null}
        </div>
      </div>

      <form className="grid gap-3 rounded-lg border p-4 md:grid-cols-6">
        <select name="action" defaultValue={query.action ?? "ALL"} className="rounded-md border bg-background px-3 py-2">
          <option value="ALL">All actions</option>
          <option value="PRODUCT_UPDATES">Product updates</option>
          <option value="VARIANT_UPDATES">Variant updates</option>
          <option value="PRICE_CHANGES">Price changes</option>
          <option value="STOCK_CHANGES">Stock changes</option>
          <option value="AI_DRAFT_CHANGES">AI Draft changes</option>
        </select>
        <select name="variantId" defaultValue={query.variantId ?? ""} className="rounded-md border bg-background px-3 py-2">
          <option value="">All variants</option>
          {product.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.sku ?? variant.title}
            </option>
          ))}
        </select>
        <input name="search" defaultValue={query.search ?? ""} placeholder="Search by Product Code, SKU, or Barcode" className="rounded-md border bg-background px-3 py-2 md:col-span-2" />
        <input name="from" type="date" defaultValue={query.from ?? ""} className="rounded-md border bg-background px-3 py-2" />
        <input name="to" type="date" defaultValue={query.to ?? ""} className="rounded-md border bg-background px-3 py-2" />
        <button type="submit" className="rounded-md border px-3 py-2 md:col-start-6">
          Filter
        </button>
      </form>

      <ProductHistoryTable
        rows={rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        }))}
        canRestore={actor.role === "ADMIN"}
      />

      <div className="flex items-center justify-between text-sm">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link className="rounded-md border px-3 py-2" href={`?page=${page - 1}`}>
              Previous
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link className="rounded-md border px-3 py-2" href={`?page=${page + 1}`}>
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
