"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function MarketsCarousel({ markets }) {
  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 6, slidesToSlide: 3 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 3, slidesToSlide: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 2, slidesToSlide: 1 },
  };

  return (
    <Carousel
      swipeable={false}
      draggable={false}
      showDots
      responsive={responsive}
      ssr
      infinite
      autoPlay
      autoPlaySpeed={5000}
      keyBoardControl
      customTransition="all .5"
      transitionDuration={1000}
      containerClass="carousel-container"
      removeArrowOnDeviceType={["tablet", "mobile"]}
      dotListClass="custom-dot-list-style"
      itemClass="px-4"
    >
      {markets.map((market, i) => {
        const hasLogo = typeof market.logoUrl === "string" && market.logoUrl.trim().length > 0;
        return (
          <Link key={i} href={`/market/${market.slug}`} className="liquid-card mr-3 block rounded-lg bg-white/60 p-2">
            {hasLogo ? (
              <Image src={market.logoUrl} alt={market.title || "Market"} width={556} height={556} className="w-full rounded-2xl bg-white object-cover" />
            ) : (
              <div className="h-36 w-full rounded-2xl bg-white/60 flex items-center justify-center text-slate-400 font-semibold">
                No Logo
              </div>
            )}
            <h2 className="mt-2 text-center text-slate-800">{market.title}</h2>
          </Link>
        );
      })}
    </Carousel>
  );
}
