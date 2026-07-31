import { auth } from "@/auth";
import db from "@/lib/db";

type ProductIdentifierClient = {
  product: {
    findUnique(args: {
      where: { productCode: string };
      select: {
        id: true;
        productCode: true;
        userId: true;
      };
    }): Promise<{ id: string; productCode: string | null; userId: string } | null>;
  };
  productVariant: {
    findFirst(args: {
      where: {
        OR: Array<{ sku: string } | { barcode: string }>;
      };
      select: {
        id: true;
        productId: true;
        sku: true;
        barcode: true;
        product: {
          select: {
            userId: true;
          };
        };
      };
    }): Promise<{
      id: string;
      productId: string;
      sku: string | null;
      barcode: string | null;
      product: { userId: string };
    } | null>;
  };
  user: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; role: true };
    }): Promise<{ id: string; role: string } | null>;
  };
};

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

export function normalizeProductIdentifier(identifier: string): string | null {
  let decoded = identifier;

  try {
    decoded = decodeURIComponent(identifier);
  } catch {
    decoded = identifier;
  }

  const normalized = decoded.trim().toUpperCase();

  return normalized.length > 0 ? normalized : null;
}

async function canAccessProduct(
  tx: ProductIdentifierClient,
  productOwnerId: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return false;

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role === "USER") return false;
  if (user.role === "ADMIN") return true;

  return user.role === "SELLER" && productOwnerId === user.id;
}

export async function findProductByIdentifier(
  identifier: string,
  tx: ProductIdentifierClient = db
): Promise<ProductIdentifierResult> {
  const normalizedIdentifier = normalizeProductIdentifier(identifier);

  if (!normalizedIdentifier) {
    return null;
  }

  const product = await tx.product.findUnique({
    where: {
      productCode: normalizedIdentifier,
    },
    select: {
      id: true,
      productCode: true,
      userId: true,
    },
  });

  if (product) {
    if (!(await canAccessProduct(tx, product.userId))) {
      return null;
    }

    return {
      type: "PRODUCT_CODE",
      productId: product.id,
      productCode: product.productCode ?? normalizedIdentifier,
    };
  }

  const variant = await tx.productVariant.findFirst({
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

  if (!variant) {
    return null;
  }

  if (!(await canAccessProduct(tx, variant.product.userId))) {
    return null;
  }

  return {
    type: variant.sku === normalizedIdentifier ? "SKU" : "BARCODE",
    productId: variant.productId,
    variantId: variant.id,
    sku: variant.sku ?? "",
    barcode: variant.barcode ?? "",
  };
}
