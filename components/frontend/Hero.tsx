import { GlassText } from "@/components/ui/glass-text";
import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import { CircleDollarSign, FolderSync, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import advert from "../../public/adv.gif";
import HeroCarousel from "./HeroCarousel";
import SidebarCategories from "./SidebarCategories";

export default async function Hero() {
  const bannersData = await getData("banners");
  const banners = asArray(bannersData);

  return (
    <div className="mb-8 grid grid-cols-12 gap-5">
      <SidebarCategories />
      <div className="liquid-card frontend-glass col-span-full overflow-hidden rounded-[36px] p-3 sm:col-span-7">
        <GlassText
          variant="light"
          eyebrow="Nxbazaar.in"
          title="Premium multi-vendor shopping marketplace"
          description="Discover verified sellers, fresh categories, and GST-ready shopping in one polished marketplace."
          headingAs="h1"
          headingClassName="text-3xl leading-tight sm:text-4xl lg:text-5xl"
          className="mb-3"
        />
        <HeroCarousel banners={banners} />
      </div>
      <div className="liquid-card frontend-glass col-span-2 hidden rounded-[32px] p-4 text-slate-800 sm:block">
        <GlassText variant="light" className="space-y-3 p-4">
          <Link href="#" className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 shrink-0 text-cyan-700" />
            <div className="flex flex-col">
              <h2 className="text-sm uppercase text-slate-950">Help Center</h2>
              <p className="text-[0.7rem] text-slate-700">Guide to Customer Care</p>
            </div>
          </Link>
          <Link href="#" className="flex items-center space-x-2">
            <FolderSync className="h-5 w-5 shrink-0 text-cyan-700" />
            <div className="flex flex-col">
              <h2 className="text-sm uppercase text-slate-950">Easy Return</h2>
              <p className="text-[0.7rem] text-slate-700">Quick Return</p>
            </div>
          </Link>
          <Link href="/register-farmer" className="flex items-center space-x-2">
            <CircleDollarSign className="h-5 w-5 shrink-0 text-cyan-700" />
            <div className="flex flex-col">
              <h2 className="text-sm uppercase text-slate-950">Sell on Limi</h2>
              <p className="text-[0.7rem] text-slate-700">Million of Vistors</p>
            </div>
          </Link>
        </GlassText>
        <Image
          src={advert}
          alt="advert"
          className="mt-4 w-full rounded-[24px]"
          loading="eager"
          priority
        />
      </div>
    </div>
  );
}
