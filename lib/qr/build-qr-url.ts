const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://nxbazaar.in";

export function buildProductQrUrl(productCode: string): string {
  const cleanCode = String(productCode || "").trim();
  return `${BASE_URL}/p/${encodeURIComponent(cleanCode)}`;
}

export function buildVariantQrUrl(productCode: string, sku: string): string {
  const cleanCode = String(productCode || "").trim();
  const cleanSku = String(sku || "").trim();
  if (!cleanSku) return buildProductQrUrl(cleanCode);
  return `${BASE_URL}/p/${encodeURIComponent(cleanCode)}?sku=${encodeURIComponent(cleanSku)}`;
}
