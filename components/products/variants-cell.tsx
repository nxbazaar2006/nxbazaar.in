import { Badge } from "@/components/ui/badge";

export type ProductTableVariantRow = {
  id: string;
  sku: string | null;
  title?: string | null;
  price: number | string;
  stock: number | null;
  attributeValues?: Array<{
    attributeValue: {
      value: string;
      attribute?: {
        name: string;
      } | null;
    };
  }>;
  attributes?: Array<{
    name?: string | null;
    value: string;
  }>;
};

function variantAttributeLabel(variant: ProductTableVariantRow) {
  const attributeValues =
    variant.attributeValues
      ?.map(({ attributeValue }) => attributeValue.value)
      .filter(Boolean)
      .join(" / ") ||
    variant.attributes
      ?.map((attribute) => attribute.value)
      .filter(Boolean)
      .join(" / ");

  return attributeValues || variant.title || variant.sku || "Variant";
}

export function VariantsCell({
  variants,
}: {
  variants: ProductTableVariantRow[];
}) {
  if (!variants?.length) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        No variants
      </Badge>
    );
  }

  const visibleVariants = variants.slice(0, 2);
  const remainingCount = variants.length - visibleVariants.length;

  return (
    <div className="min-w-[220px] space-y-1.5">
      {visibleVariants.map((variant) => {
        const variantName = variantAttributeLabel(variant);
        const stock = Number(variant.stock ?? 0);

        return (
          <div
            key={variant.id}
            className="flex items-center justify-between gap-3 rounded-md border px-2 py-1.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{variantName}</p>

              <p className="truncate text-[11px] text-muted-foreground">
                {variant.sku || "No SKU"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs font-semibold">
                ₹{Number(variant.price).toLocaleString("en-IN")}
              </p>

              <p
                className={
                  stock > 0
                    ? "text-[11px] text-emerald-600"
                    : "text-[11px] text-destructive"
                }
              >
                Stock: {stock}
              </p>
            </div>
          </div>
        );
      })}

      {remainingCount > 0 ? (
        <Badge variant="secondary" className="text-[11px]">
          +{remainingCount} more
        </Badge>
      ) : null}
    </div>
  );
}
