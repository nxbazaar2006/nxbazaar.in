import { GlassText } from "@/components/ui/glass-text";
import Link from "next/link";
import CategoryCarousel from "./CategoryCarousel";

export default function CategoryList({
  category,
  isMarketPage = false,
}: {
  category: any;
  isMarketPage?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/25">
        <GlassText
          variant="light"
          title={category.title}
          description="Curated products from trusted Nxbazaar.in sellers."
          headingAs="h2"
          headingClassName="text-xl sm:text-2xl font-bold text-slate-900"
          className="w-full"
        />
        <Link
          className="rounded-full bg-slate-900 px-5 py-2 text-center text-xs font-bold text-white transition-all duration-300 hover:bg-slate-800 shrink-0"
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
