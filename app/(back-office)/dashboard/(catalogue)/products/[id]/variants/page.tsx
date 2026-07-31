import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getProductVariantManager } from "@/actions/product-variants";
import PageHeader from "@/components/backoffice/PageHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ProductVariantManager = nextDynamic(
  () => import("@/components/product-variants/product-variant-manager"),
  {
    loading: () => (
      <div className="liquid-card rounded-[28px] p-6 text-sm text-white/70">
        Loading variant management workspace...
      </div>
    ),
  },
);

export default async function ProductVariantManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProductVariantManager(id);

  if (!result.success) notFound();

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        heading={`${result.data.product.title} Variants`}
        className="mb-0"
      />
      <ProductVariantManager
        product={result.data.product}
        hsnCodes={result.data.hsnCodes}
      />
    </div>
  );
}
