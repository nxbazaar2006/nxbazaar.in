import GlassLeftWing from "./GlassLeftWing";
import GlassMainFrame from "./GlassMainFrame";
import GlassRightWing from "./GlassRightWing";
import WingHinges from "./WingHinges";
import FloatingGlassFragments from "./FloatingGlassFragments";
import Navbar from "@/components/frontend/Navbar";
import type { NxHomeCategory, NxHomeProduct } from "./types";
import type { BlogItem } from "@/types/blog";
import type { HomepageBanner } from "@/types/homepage";

interface NxGlassHomeProps {
  categories?: NxHomeCategory[];
  products?: NxHomeProduct[];
  newArrivals?: NxHomeProduct[];
  flashDeals?: NxHomeProduct[];
  blogs?: BlogItem[];
  banners?: HomepageBanner[];
  categoriesUnavailable?: boolean;
  productsUnavailable?: boolean;
}

export default function NxGlassHome({
  categories = [],
  products = [],
  newArrivals = [],
  flashDeals = [],
  blogs = [],
  banners = [],
  categoriesUnavailable = false,
  productsUnavailable = false,
}: NxGlassHomeProps = {}) {
  return (
    <main className="nx-home-scene" data-nx-screen-frame>
      <div className="nx-scene-ambient" />

      <div className="nx-bottom-glow" />

      <FloatingGlassFragments />

      <section className="nx-home-stage">
        <div className="nx-device-floor" aria-hidden="true" />
        <div className="nx-device-contact-shadow" aria-hidden="true" />
        <div className="nx-device">
          <div className="nx-home-embedded-navbar">
            <Navbar embedded />
          </div>
          <GlassMainFrame
            categories={categories}
            products={products}
            newArrivals={newArrivals}
            flashDeals={flashDeals}
            blogs={blogs}
            banners={banners}
            categoriesUnavailable={categoriesUnavailable}
            productsUnavailable={productsUnavailable}
          />
          <div className="nx-wing-anchor nx-wing-anchor-left">
            <GlassLeftWing />
          </div>
          <div className="nx-wing-anchor nx-wing-anchor-right">
            <GlassRightWing />
          </div>
          <WingHinges />
        </div>
      </section>

      <div className="nx-floor-reflection" />
    </main>
  );
}
