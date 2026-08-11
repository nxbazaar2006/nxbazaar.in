import { auth } from "@/auth";
import db from "@/lib/db";
import { BarcodeManagementView, VariantSearchRecord } from "@/components/barcode/barcode-management-view";

function toPlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default async function BarcodesPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const role = session.user.role || "";
  const id = session.user.id;
  const canViewAll = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role);

  const productOwnerFilter = canViewAll ? undefined : { userId: id };

  const variants = await db.productVariant.findMany({
    where: {
      product: productOwnerFilter,
    },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          productCode: true,
          imageUrl: true,
        },
      },
    },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const initialVariants: VariantSearchRecord[] = toPlainData(
    variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      productTitle: v.product.title,
      variantTitle: v.title,
      productCode: v.productCode || v.product.productCode || "—",
      sku: v.sku || "—",
      barcode: v.barcode || "—",
      price: v.price,
      stock: v.stock,
      imageUrl: v.imageUrl || v.product.imageUrl || "",
    }))
  );

  return <BarcodeManagementView initialVariants={initialVariants} />;
}
