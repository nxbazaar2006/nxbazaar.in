const PRODUCT_NUMBER_LENGTH = 6;

type ProductCodeClient = {
  product: {
    findMany(args: {
      where: { productCode: { startsWith: string } };
      select: { productCode: true };
    }): Promise<Array<{ productCode: string | null }>>;
    findUnique(args: {
      where: { productCode: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
  user: {
    findUnique(args: {
      where: { id: string };
      select: { sellerProfile: { select: { code: true } } };
    }): Promise<{ sellerProfile: { code: string | null } | null } | null>;
  };
};

export function normalizeVendorCode(value: string | null | undefined): string {
  const code = (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!code) {
    throw new Error("SellerProfile.code is required to generate a product code.");
  }

  return code;
}

export function formatProductNumber(value: number): string {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("Product number must be a positive integer.");
  }

  return String(value).padStart(PRODUCT_NUMBER_LENGTH, "0");
}

export function buildProductCode(vendorCode: string, productNumber: number): string {
  return [
    normalizeVendorCode(vendorCode),
    formatProductNumber(productNumber),
  ].join("-");
}

export function barcodeFromVariantSku(sku: string): string {
  const barcode = sku.trim();

  if (!barcode) {
    throw new Error("Variant SKU is required to generate a barcode.");
  }

  return barcode;
}

function productNumberFromCode(productCode: string, prefix: string): number | null {
  if (!productCode.startsWith(prefix)) return null;

  const suffix = productCode.slice(prefix.length);

  return /^\d{6}$/.test(suffix) ? Number(suffix) : null;
}

export async function generateUniqueProductCode({
  db,
  vendorCode,
}: {
  db: ProductCodeClient;
  vendorCode: string;
}): Promise<string> {
  const normalizedVendorCode = normalizeVendorCode(vendorCode);
  const prefix = `${normalizedVendorCode}-`;
  const products = await db.product.findMany({
    where: {
      productCode: {
        startsWith: prefix,
      },
    },
    select: {
      productCode: true,
    },
  });
  const maxProductNumber = products.reduce((max, product) => {
    const productNumber = product.productCode
      ? productNumberFromCode(product.productCode, prefix)
      : null;

    return productNumber ? Math.max(max, productNumber) : max;
  }, 0);

  for (
    let productNumber = maxProductNumber + 1;
    productNumber <= maxProductNumber + 1000;
    productNumber += 1
  ) {
    const productCode = buildProductCode(normalizedVendorCode, productNumber);
    const existing = await db.product.findUnique({
      where: { productCode },
      select: { id: true },
    });

    if (!existing) {
      return productCode;
    }
  }

  throw new Error("Unable to generate a globally unique product code.");
}

export async function generateUniqueProductCodeForSeller({
  db,
  sellerId,
}: {
  db: ProductCodeClient;
  sellerId: string;
}): Promise<string> {
  const seller = await db.user.findUnique({
    where: { id: sellerId },
    select: {
      sellerProfile: {
        select: {
          code: true,
        },
      },
    },
  });

  return generateUniqueProductCode({
    db,
    vendorCode: seller?.sellerProfile?.code ?? "",
  });
}

export function stripManualProductIdentity<T extends Record<string, unknown>>(
  value: T
): Omit<T, "productCode" | "barcode"> {
  const { productCode: _productCode, barcode: _barcode, ...safeValue } = value;

  return safeValue;
}

export function stripManualVariantIdentity<T extends Record<string, unknown>>(
  value: T
): Omit<T, "barcode"> {
  const { barcode: _barcode, ...safeValue } = value;

  return safeValue;
}
