import { auth } from "@/auth";
import db from "@/lib/db";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function QrLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ productCode: string }>;
  searchParams: Promise<{ sku?: string; source?: string }>;
}) {
  const { productCode } = await params;
  const resolvedSearchParams = await searchParams;
  const sku = resolvedSearchParams.sku;
  const source = resolvedSearchParams.source || "CUSTOMER";

  // 1. Fetch Product & Variants
  const product = await db.product.findFirst({
    where: {
      OR: [{ productCode }, { id: productCode }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      productCode: true,
      variants: {
        select: { id: true, sku: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  let matchedVariantId: string | null = null;
  if (sku) {
    const matched = product.variants.find((v) => v.sku.toUpperCase() === sku.toUpperCase());
    if (matched) {
      matchedVariantId = matched.id;
    }
  }

  // 2. Anonymize IP address for privacy-safe tracking
  const reqHeaders = await headers();
  const rawIp = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || null;
  const ipHash = createHash("sha256").update(rawIp).digest("hex").slice(0, 16);

  // 3. Get Auth Session if logged in
  const session = await auth();
  const userId = session?.user?.id || null;

  // 4. Asynchronously record QR scan in ProductQrScan table
  try {
    await (db as any).productQrScan.create({
      data: {
        productId: product.id,
        variantId: matchedVariantId,
        productCode: product.productCode,
        sku: sku || null,
        userId,
        source,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
        ipHash,
      },
    });
  } catch (error) {
    console.error("Failed to record ProductQrScan:", error);
  }

  // 5. Redirect to canonical Product Detail Page
  const redirectTarget = sku
    ? `/products/${product.slug}?sku=${encodeURIComponent(sku)}`
    : `/products/${product.slug}`;

  redirect(redirectTarget);
}
