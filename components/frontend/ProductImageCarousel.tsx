"use client";

import Image from "next/image";
import React, { useState } from "react";
import type { CSSProperties } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import { getImageUrls } from "@/lib/image-utils";

export default function ProductImageCarousel({
  productImages,
  thumbnail,
  alt = "Product image",
}: {
  productImages?: string[];
  thumbnail?: string;
  alt?: string;
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const images = getImageUrls(productImages, thumbnail);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const getImageSrc = (url: string, index: number) => {
    return failedImages[index] ? "/vegetables.png" : url;
  };

  return (
    <div className="liquid-card frontend-glass col-span-12 rounded-[30px] p-3 md:col-span-5 lg:col-span-3">
      {images.length <= 1 ? (
        <Image
          src={getImageSrc(images[0], 0)}
          alt={alt}
          width={556}
          height={556}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 42vw, 280px"
          className="aspect-square w-full rounded-2xl bg-white object-cover"
          priority
          onError={() => setFailedImages((prev) => ({ ...prev, 0: true }))}
        />
      ) : (
        <>
          <Swiper
            style={
              {
                "--swiper-navigation-color": "#fff",
                "--swiper-pagination-color": "#fff",
              } as CSSProperties
            }
            spaceBetween={10}
            navigation
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper2"
          >
            {images.map((image, i) => (
              <SwiperSlide key={i}>
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={getImageSrc(image, i)}
                    alt={`${alt} ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 42vw, 280px"
                    className="object-cover"
                    priority={i === 0}
                    onError={() => setFailedImages((prev) => ({ ...prev, [i]: true }))}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode
            watchSlidesProgress
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper"
          >
            {images.map((image, i) => (
              <SwiperSlide key={i}>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
                  <Image
                    src={getImageSrc(image, i)}
                    alt={`${alt} thumbnail ${i + 1}`}
                    fill
                    sizes="72px"
                    className="object-cover"
                    onError={() => setFailedImages((prev) => ({ ...prev, [i]: true }))}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
    </div>
  );
}
