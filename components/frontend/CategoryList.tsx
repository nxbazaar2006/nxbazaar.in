import { GlassText } from "@/components/ui/glass-text";
import Link from "next/link";

import CategoryCarousel from "./CategoryCarousel";

export default function CategoryList({ category, isMarketPage }) {
  return (
    <div className="liquid-card frontend-glass overflow-hidden rounded-[36px] text-slate-800">
      <div className="flex flex-col gap-3 border-b border-white/55 bg-white/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <GlassText
          variant="light"
          title={category.title}
          description="Curated products from trusted Nxbazaar.in sellers."
          headingAs="h2"
          headingClassName="text-xl sm:text-2xl"
          className="w-full p-4 sm:max-w-md"
        />
        <Link
          className="rounded-full bg-white/45 px-4 py-2 text-center text-slate-800 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70"
          href={`/category/${category.slug}`}
        >
          See All
        </Link>
      </div>
      <div className="p-4">
        <CategoryCarousel isMarketPage={isMarketPage} products={category.products} />
      </div>
    </div>
  );
}
