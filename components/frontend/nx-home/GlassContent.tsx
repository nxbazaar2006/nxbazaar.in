import { Sparkles } from "lucide-react";

import HomeCategoryStrip from "./HomeCategoryStrip";
import HomeProductPreview from "./HomeProductPreview";
import HomeBlogPreview from "./HomeBlogPreview";
import HomeHeroCopy from "./HomeHeroCopy";
import HomeLocalizedLabel from "./HomeLocalizedLabel";
import HeroCarousel from "@/components/frontend/HeroCarousel";
import type { BlogItem } from "@/types/blog";
import type { HomepageBanner } from "@/types/homepage";
import type { NxHomeCategory, NxHomeProduct } from "./types";

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

export default function GlassContent({
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
    <section className="nx-content-glass">

      <div className="nx-content-topbar">

        <span className="nx-content-eyebrow">
          <Sparkles />
          <HomeLocalizedLabel translationKey="home.eyebrow" />
        </span>

      </div>

      <HomeHeroCopy />

      {banners.length > 0 && <HeroCarousel banners={banners} />}

      <HomeCategoryStrip
        categories={categories}
        unavailable={categoriesUnavailable}
      />

      <HomeProductPreview
        sectionKey="trending-products"
        eyebrowKey="home.marketplace"
        titleKey="home.trendingProducts"
        products={products}
        unavailable={productsUnavailable}
      />

      <HomeProductPreview
        sectionKey="new-arrivals"
        eyebrowKey="home.justAdded"
        titleKey="home.newArrivals"
        products={newArrivals}
        unavailable={productsUnavailable}
      />

      <HomeProductPreview
        sectionKey="best-sellers"
        eyebrowKey="home.marketplace"
        titleKey="home.bestSellers"
        products={[]}
        emptyMessageKey="home.bestSellersUnavailable"
      />

      {flashDeals.length > 0 && (
        <HomeProductPreview
          sectionKey="flash-deals"
          eyebrowKey="home.priceBackedOffers"
          titleKey="home.flashDeals"
          products={flashDeals}
        />
      )}

      <HomeBlogPreview blogs={blogs} />

    </section>
  );
}
