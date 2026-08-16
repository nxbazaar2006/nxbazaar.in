import { GlassText } from "@/components/ui/glass-text";
import { getCatalogTheme } from "@/lib/theme/catalog-theme";
import Link from "next/link";
import CategoryCarousel from "./CategoryCarousel";

export default function CategoryList({
  category,
  isMarketPage = false,
}: {
  category: any;
  isMarketPage?: boolean;
}) {
  const theme = getCatalogTheme({
    departmentId: category.departmentId,
    departmentSlug: category.department?.slug ?? category.departmentSlug,
    categoryId: category.id,
    categorySlug: category.slug,
  });

  return (
    <div className={`nx-theme-surface ${theme.categoryClassName} w-full rounded-[28px] border p-4 sm:p-5`}>
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/35">
        <GlassText
          variant="light"
          title={category.title}
          description="Curated products from trusted Nxbazaar.in sellers."
          headingAs="h2"
          headingClassName="text-xl sm:text-2xl font-bold text-slate-900"
          className="w-full"
        />
        <Link
          className="nx-theme-accent-bg rounded-full px-5 py-2 text-center text-xs font-bold text-white shadow-sm transition-all duration-300 hover:brightness-105 shrink-0"
          href={`/category/${category.slug}`}
        >
          See All
        </Link>
      </div>
      <div className="pt-4">
        <CategoryCarousel isMarketPage={isMarketPage} products={category.products} />
      </div>
    </div>
  );
}
