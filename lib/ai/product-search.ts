import db from "@/lib/db";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { ProductSearchFilters } from "./types";

const colourWords = [
  "black",
  "white",
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
  "brown",
  "grey",
  "gray",
  "silver",
  "gold",
  "काला",
  "काली",
  "पांढरा",
  "पांढरी",
  "सफेद",
  "लाल",
  "निळा",
  "नीला",
];

const sizePattern = /\b(xs|s|m|l|xl|xxl|xxxl|[0-9]{1,2})\b/i;

export type AiProductCardData = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  salePrice: number;
  productPrice: number;
  stock: number;
  category: string;
  subCategory: string | null;
  brand: string | null;
  tags: string[];
};

export type ProductSearchResult = {
  query: string;
  normalizedQuery: string;
  filters: ProductSearchFilters;
  products: AiProductCardData[];
  resultCount: number;
  searchMode: "keyword" | "full_text";
};

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

function extractBudget(query: string) {
  const normalized = query.replace(/,/g, "");
  const under = normalized.match(/(?:under|below|less than|within|andar|अंदर|खाली|पेक्षा कमी)\s*(?:rs\.?|₹|inr)?\s*(\d{2,7})/i);
  const rupeeBefore = normalized.match(/(?:₹|rs\.?|inr)\s*(\d{2,7})\s*(?:ke andar|under|below|तक)/i);
  const max = under?.[1] ?? rupeeBefore?.[1];
  return max ? Number(max) : undefined;
}

export function extractProductSearchFilters(query: string): ProductSearchFilters {
  const normalized = normalizeQuery(query);
  const colour = colourWords.find((word) => normalized.includes(word));
  const size = normalized.match(sizePattern)?.[1];
  const maxPrice = extractBudget(normalized);
  const tags = normalized
    .split(/\s+/)
    .filter((word) => word.length > 2 && !["under", "below", "andar", "within", "best"].includes(word))
    .slice(0, 12);

  return {
    maxPrice,
    colour,
    size,
    tags,
    inStock: /\b(in stock|available|availability|stock)\b/i.test(normalized) ? true : undefined,
  };
}

function buildProductWhere(query: string, filters: ProductSearchFilters): Prisma.ProductWhereInput {
  const terms = normalizeQuery(query)
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .slice(0, 8);

  const searchableTerms = terms.length ? terms : [normalizeQuery(query)].filter(Boolean);
  const orFilters: Prisma.ProductWhereInput[] = searchableTerms.flatMap((term) => [
    { title: { contains: term, mode: "insensitive" as const } },
    { description: { contains: term, mode: "insensitive" as const } },
    { tags: { has: term } },
    { category: { title: { contains: term, mode: "insensitive" as const } } },
    { subCategory: { title: { contains: term, mode: "insensitive" as const } } },
    { brand: { title: { contains: term, mode: "insensitive" as const } } },
  ]);

  const andFilters: Prisma.ProductWhereInput[] = [{ isActive: true }];
  if (orFilters.length) andFilters.push({ OR: orFilters });
  if (filters.maxPrice !== undefined) andFilters.push({ salePrice: { lte: filters.maxPrice } });
  if (filters.minPrice !== undefined) andFilters.push({ salePrice: { gte: filters.minPrice } });
  if (filters.inStock) {
    andFilters.push({
      OR: [{ productStock: { gt: 0 } }, { variants: { some: { isActive: true, stock: { gt: 0 } } } }],
    });
  }

  const attributeTerms = [filters.colour, filters.size].filter(Boolean) as string[];
  if (attributeTerms.length) {
    andFilters.push({
      OR: attributeTerms.flatMap((term) => [
        { tags: { has: term } },
        { attributes: { some: { values: { some: { value: { contains: term, mode: "insensitive" } } } } } },
        {
          variants: {
            some: {
              values: {
                some: { attributeValue: { value: { contains: term, mode: "insensitive" } } },
              },
            },
          },
        },
      ]),
    });
  }

  return { AND: andFilters };
}

async function findFullTextProductIds(query: string, limit: number) {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  return db.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "Product"
    WHERE "isActive" = true
      AND to_tsvector(
        'simple',
        coalesce("title", '') || ' ' ||
        coalesce("description", '') || ' ' ||
        array_to_string("tags", ' ')
      ) @@ plainto_tsquery('simple', ${normalized})
    ORDER BY ts_rank(
      to_tsvector(
        'simple',
        coalesce("title", '') || ' ' ||
        coalesce("description", '') || ' ' ||
        array_to_string("tags", ' ')
      ),
      plainto_tsquery('simple', ${normalized})
    ) DESC
    LIMIT ${Math.min(Math.max(limit, 1), 20)}
  `.catch(() => []);
}

function toCard(product: {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  salePrice: number;
  productPrice: number;
  productStock: number | null;
  tags: string[];
  category: { title: string };
  subCategory: { title: string } | null;
  brand: { title: string } | null;
  variants: Array<{ stock: number; isActive: boolean }>;
}): AiProductCardData {
  const variantStock = product.variants
    .filter((variant) => variant.isActive)
    .reduce((total, variant) => total + variant.stock, 0);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    imageUrl: product.imageUrl,
    salePrice: Number(product.salePrice),
    productPrice: Number(product.productPrice),
    stock: product.variants.length ? variantStock : product.productStock ?? 0,
    category: product.category.title,
    subCategory: product.subCategory?.title ?? null,
    brand: product.brand?.title ?? null,
    tags: product.tags,
  };
}

export async function searchProductsFromDatabase(query: string, limit = 8): Promise<ProductSearchResult> {
  const normalizedQuery = normalizeQuery(query);
  const filters = extractProductSearchFilters(query);
  const fullTextRows = await findFullTextProductIds(query, limit);
  const fullTextIds = fullTextRows.map((row) => row.id);
  const where =
    fullTextIds.length > 0
      ? { AND: [{ id: { in: fullTextIds } }, buildProductWhere(query, filters)] }
      : buildProductWhere(query, filters);
  const products = await db.product.findMany({
    where,
    include: {
      category: { select: { title: true } },
      subCategory: { select: { title: true } },
      brand: { select: { title: true } },
      variants: { select: { stock: true, isActive: true } },
    },
    orderBy: [{ salePrice: "asc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(limit, 1), 20),
  });

  return {
    query,
    normalizedQuery,
    filters,
    products: products.map(toCard),
    resultCount: products.length,
    searchMode: fullTextIds.length > 0 ? "full_text" : "keyword",
  };
}

export async function writeProductSearchLog(result: ProductSearchResult, userId?: string | null) {
  const id = randomUUID();
  await db.$executeRaw`
    INSERT INTO "ProductSearchLog"
      ("id", "userId", "query", "normalizedQuery", "extractedFilters", "resultCount", "zeroResults", "aiEnhanced", "searchMode", "createdAt")
    VALUES
      (${id}, ${userId ?? null}, ${result.query}, ${result.normalizedQuery}, ${JSON.stringify(result.filters)}::jsonb, ${result.resultCount}, ${result.resultCount === 0}, true, ${result.searchMode}, CURRENT_TIMESTAMP)
  `;
}
