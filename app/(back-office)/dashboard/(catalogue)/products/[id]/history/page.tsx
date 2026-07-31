import { auth } from "@/auth";
import ProductHistoryViewer from "@/components/backoffice/ProductHistoryViewer";
import ProductBarcodeActions from "@/components/ProductBarcodeActions";
import FormHeader from "@/components/backoffice/FormHeader";
import db from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

function canView(session, product: { userId: string }) {
  if (session?.user?.role === "ADMIN") return true;
  if (session?.user?.role === "SELLER" && product.userId === session.user.id) return true;
  return false;
}

export default async function ProductHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ variantId?: string; search?: string; action?: string; from?: string; to?: string; page?: string; source?: string }>;
}) {
  const [{ id }, query, session] = await Promise.all([params, searchParams, auth()]);
  if (!session?.user?.id) notFound();

  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      productCode: true,
      userId: true,
      variants: { select: { id: true, title: true, sku: true, barcode: true } },
    },
  });
  if (!product) notFound();
  if (!canView(session, product)) notFound();

  const selectedVariant = query.variantId ? product.variants.find((variant) => variant.id === query.variantId) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <FormHeader title={`${product.title} History`} />
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-700">
            <span className="rounded-md border px-3 py-1">Product Code: {product.productCode}</span>
            {selectedVariant ? (
              <>
                <span className="rounded-md border px-3 py-1">Selected Variant: {selectedVariant.title}</span>
                <span className="rounded-md border px-3 py-1">SKU: {selectedVariant.sku}</span>
                <span className="rounded-md border px-3 py-1">Barcode: {selectedVariant.barcode}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/products/scan" className="rounded-md border px-3 py-2 text-sm">
            Scan another barcode
          </Link>
          {selectedVariant ? (
            <Link href={`/dashboard/products/${product.id}/history`} className="rounded-md border px-3 py-2 text-sm">
              Clear variant filter
            </Link>
          ) : null}
          <Link href={`/products/${product.slug}`} className="rounded-md border px-3 py-2 text-sm">
            View product
          </Link>
          <Link href={`/dashboard/products/update/${product.id}`} className="rounded-md border px-3 py-2 text-sm">
            Edit Product
          </Link>
          <Link href="/dashboard/products" className="rounded-md border px-3 py-2 text-sm">
            Products
          </Link>
        </div>
      </div>
      <ProductHistoryViewer
        productId={product.id}
        productCode={product.productCode}
        initialVariantId={query.variantId || ""}
        initialSearch={query.search || ""}
        initialAction={query.action || ""}
        initialFrom={query.from || ""}
        initialTo={query.to || ""}
        selectedVariant={selectedVariant}
        canRestore={session.user.role === "ADMIN"}
      />
      {selectedVariant ? (
        <ProductBarcodeActions
          barcode={selectedVariant.barcode}
          title={`${product.title} - ${selectedVariant.title}`}
          productCode={product.productCode}
          sku={selectedVariant.sku}
        />
      ) : null}
    </div>
  );
}
