"use client";

import Image from "next/image";
import Link from "next/link";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function TrainingCarousel({ trainings }) {
  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, slidesToSlide: 1 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2, slidesToSlide: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1, slidesToSlide: 1 },
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
      autoPlaySpeed={1000}
      keyBoardControl
      customTransition="all .5"
      transitionDuration={500}
      containerClass="carousel-container"
      removeArrowOnDeviceType={["tablet", "mobile"]}
      dotListClass="custom-dot-list-style"
      itemClass="px-4"
    >
      {trainings.map((training, i) => {
        const hasImage = typeof training.imageUrl === "string" && training.imageUrl.trim().length > 0;
        return (
          <div key={i} className="liquid-card mr-3 overflow-hidden p-4">
            <Link href="#">
              {hasImage ? (
                <Image src={training.imageUrl} alt={training.title || "Training"} width={556} height={556} className="h-48 w-full object-cover" />
              ) : (
                <div className="h-48 w-full bg-slate-200 flex items-center justify-center text-slate-500 font-semibold">
                  No Image
                </div>
              )}
            </Link>
            <h2 className="my-2 line-clamp-2 text-center text-xl text-slate-800">{training.title}</h2>
            <p className="mb-2 line-clamp-3 px-4 text-slate-800">{training.description}</p>
          <div className="flex items-center justify-between px-4 py-2">
            <Link className="rounded-md bg-lime-600 px-4 py-2 text-slate-50 transition-all duration-300 hover:bg-lime-700" href="#">
              Read more
            </Link>
            <Link className="text-slate-800" href="#">
              Talk to the Consultant
            </Link>
          </div>
        </div>
        );
      })}
    </Carousel>
  );
}
