"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  title?: unknown;
  link?: unknown;
  imageUrl?: unknown;
};

export default function HeroCarousel({ banners = [] }: { banners?: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 4500);

    return () => window.clearInterval(timer);
  }, [emblaApi, banners.length]);

  const slides = banners
    .map((banner) => ({
      title: String(banner.title || "Banner"),
      link: String(banner.link || "#"),
      imageUrl: String(banner.imageUrl || ""),
    }))
    .filter((banner) => banner.imageUrl.length > 0);

  if (slides.length === 0) return null;

  return (
    <div className="group relative overflow-hidden rounded-[28px]">
      <div ref={emblaRef} className="overflow-hidden rounded-[28px]">
        <div className="flex">
          {slides.map((banner, index) => (
            <Link
              key={`${banner.title}-${index}`}
              href={banner.link}
              className="min-w-0 flex-[0_0_100%]"
            >
              <Image
                width={712}
                height={384}
                src={banner.imageUrl}
                className="aspect-[89/48] w-full rounded-[28px] object-cover"
                alt={banner.title}
                priority={index === 0}
              />
            </Link>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={scrollNext}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((banner, index) => (
              <button
                key={`${banner.title}-dot-${index}`}
                type="button"
                aria-label={`Go to banner ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  selectedIndex === index ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
