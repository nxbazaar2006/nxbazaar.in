import db from "@/lib/db";
import type { Prisma, UserRole } from "@prisma/client";

type LookupClient = Prisma.TransactionClient | typeof db;
type LookupSession = {
  user?: {
    id?: string | null;
    role?: UserRole | string | null;
  } | null;
} | null;

export type ProductIdentifierResult =
  | {
      type: "PRODUCT_CODE";
      productId: string;
      productCode: string;
    }
  | {
      type: "SKU";
      productId: string;
      variantId: string;
      sku: string;
      barcode: string;
    }
  | {
      type: "BARCODE";
      productId: string;
      variantId: string;
      sku: string;
      barcode: string;
    }
  | null;

export function normalizeProductIdentifier(identifier: string | null | undefined) {
  if (!identifier) return "";
  try {
    return decodeURIComponent(identifier).trim().toUpperCase();
  } catch {
    return identifier.trim().toUpperCase();
  }
}

function canAccessProduct(session: LookupSession | undefined, sellerId: string) {
  if (!session?.user?.id) return false;
  if (session.user.role === "ADMIN") return true;
  if ((session.user.role === "SELLER" || session.user.role === "FARMER") && session.user.id === sellerId) return true;
  return false;
}

export async function findProductByIdentifier(
  identifier: string,
  options: { prisma?: LookupClient; session?: LookupSession } = {},
): Promise<ProductIdentifierResult> {
  const prisma = options.prisma ?? db;
  const normalizedIdentifier = normalizeProductIdentifier(identifier);
  if (!normalizedIdentifier) return null;

  const product = await prisma.product.findUnique({
    where: { productCode: normalizedIdentifier },
    select: { id: true, productCode: true, userId: true },
  });

  if (product) {
    if (options.session && !canAccessProduct(options.session, product.userId)) return null;
    return {
      type: "PRODUCT_CODE",
      productId: product.id,
      productCode: product.productCode,
    };
  }

  const variant = await prisma.productVariant.findFirst({
    where: {
      OR: [{ sku: normalizedIdentifier }, { barcode: normalizedIdentifier }],
    },
    select: {
      id: true,
      productId: true,
      sku: true,
      barcode: true,
      product: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!variant) return null;
  if (options.session && !canAccessProduct(options.session, variant.product.userId)) return null;

  return {
    type: variant.sku === normalizedIdentifier ? "SKU" : "BARCODE",
    productId: variant.productId,
    variantId: variant.id,
    sku: variant.sku,
    barcode: variant.barcode,
  };
}
