import { auth } from "@/auth";
import { getHsnCodes } from "@/actions/hsn-code";
import ProductBulkDataTable from "@/components/backoffice/ProductBulkDataTable";
import PageHeader from "@/components/backoffice/PageHeader";
import ProductHeaderActions from "@/components/backoffice/ProductHeaderActions";
import db from "@/lib/db";

function toPlainData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default async function page() {
  const session = await auth();
  if (!session) {
    return null;
  }

  const role = session?.user?.role;
  const id = session?.user?.id;
  const canViewAllProducts = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(String(role));

  const [hsnCodesResult, categoriesData, subCategoriesData, brandsData, farmersData] = await Promise.all([
    getHsnCodes({ status: "ACTIVE", sortBy: "code", sortOrder: "asc" }),
    db.category.findMany({ where: { isActive: true }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.subCategory.findMany({ where: { isActive: true }, select: { id: true, title: true, categoryId: true }, orderBy: { title: "asc" } }),
    db.brand.findMany({ where: { isActive: true }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.user.findMany({
      where: { role: { in: ["FARMER", "SELLER", "ADMIN", "MODERATOR"] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const hsnCodeOptions = hsnCodesResult.success
    ? hsnCodesResult.data.rows.map((hsn) => ({ id: hsn.id, code: hsn.code, description: hsn.description }))
    : [];

  const categories = categoriesData.map((c) => ({ id: c.id, title: c.title }));
  const subCategories = subCategoriesData.map((sc) => ({ id: sc.id, title: sc.title, categoryId: sc.categoryId }));
  const brands = brandsData.map((b) => ({ id: b.id, title: b.title }));
  const farmers = farmersData.map((f) => ({ id: f.id, title: f.name || f.email || f.id }));

  const statusFilter = { status: { not: "ARCHIVED" as const } };

  const products = await db.product.findMany({
    where: canViewAllProducts ? statusFilter : { userId: id, ...statusFilter },
    include: {
      category: { include: { hsnCode: true } },
      subCategory: { include: { hsnCode: true } },
      hsnCode: true,
      attributes: {
        include: { values: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tableProducts = toPlainData(
    products.map((product) => {
      const prices = product.variants.map((variant) => Number(variant.price)).filter(Number.isFinite);
      const totalStock =
        product.productType === "VARIABLE"
          ? product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
          : product.productStock || 0;

      return {
        ...product,
        variantCount: product.variants.length,
        totalStock,
        minVariantPrice: prices.length ? Math.min(...prices) : null,
        maxVariantPrice: prices.length ? Math.max(...prices) : null,
      };
    }),
  );

  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Products"
        actions={<ProductHeaderActions />}
      />

      <div className="py-8">
        <ProductBulkDataTable
          products={tableProducts}
          hsnCodeOptions={hsnCodeOptions}
          categories={categories}
          subCategories={subCategories}
          brands={brands}
          farmers={farmers}
        />
      </div>
    </div>
  );
}
