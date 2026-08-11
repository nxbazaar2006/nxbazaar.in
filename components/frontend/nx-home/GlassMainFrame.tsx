import GlassNavigation from "./GlassNavigation";
import GlassContent from "./GlassContent";
import GlassActionRail from "./GlassActionRail";
import type { NxHomeCategory, NxHomeProduct } from "./types";
import type { BlogItem } from "@/types/blog";
import type { HomepageBanner } from "@/types/homepage";

interface Props {
  categories?: NxHomeCategory[];
  products?: NxHomeProduct[];
  newArrivals?: NxHomeProduct[];
  flashDeals?: NxHomeProduct[];
  blogs?: BlogItem[];
  banners?: HomepageBanner[];
  categoriesUnavailable?: boolean;
  productsUnavailable?: boolean;
}

export default function GlassMainFrame({
  categories = [],
  products = [],
  newArrivals = [],
  flashDeals = [],
  blogs = [],
  banners = [],
  categoriesUnavailable = false,
  productsUnavailable = false,
}: Props) {
  return (
    <section className="nx-main-glass">
      <span className="nx-edge-shine" />
      <GlassNavigation />
      <GlassContent
        categories={categories}
        products={products}
        newArrivals={newArrivals}
        flashDeals={flashDeals}
        blogs={blogs}
        banners={banners}
        categoriesUnavailable={categoriesUnavailable}
        productsUnavailable={productsUnavailable}
      />
      <GlassActionRail categoryCount={categories.length} productCount={products.length} />
    </section>
  );
}
