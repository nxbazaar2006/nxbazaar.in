import { GlassText } from "@/components/ui/glass-text";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";

import MarketsCarousel from "./MarketsCarousel";

export default async function MarketList() {
  const marketsData = await getData("markets");
  const markets = asArray(marketsData);

  return (
    <div className="py-10 text-slate-800">
      <div className="liquid-card frontend-glass rounded-[36px] p-5">
        <GlassText
          variant="light"
          title="Shop By Market"
          description="Browse collections organized by active markets and verified local sellers."
          headingAs="h2"
          headingClassName="text-center text-2xl sm:text-3xl"
          paragraphClassName="text-center"
          className="mx-auto mb-5 max-w-2xl text-center"
        />
        <MarketsCarousel markets={markets} />
      </div>
    </div>
  );
}
