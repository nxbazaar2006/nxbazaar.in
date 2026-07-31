"use client";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Product from "./Product";

export default function CategoryCarousel({ products, isMarketPage = false }: { products: any[]; isMarketPage?: boolean }) {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1600 },
      items: isMarketPage ? 4 : 5,
      slidesToSlide: 3,
    },
    desktop: {
      breakpoint: { max: 1600, min: 1024 },
      items: isMarketPage ? 3 : 4,
      slidesToSlide: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 640 },
      items: 2,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 640, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <Carousel
      swipeable={true}
      draggable={true}
      showDots
      responsive={responsive}
      ssr
      infinite
      autoPlay
      autoPlaySpeed={5000}
      keyBoardControl
      customTransition="all .5s ease-in-out"
      transitionDuration={500}
      containerClass="carousel-container py-2"
      removeArrowOnDeviceType={["mobile"]}
      dotListClass="custom-dot-list-style"
      itemClass="px-2 sm:px-3"
    >
      {products.map((product, i) => (
        <Product product={product} key={product.id || i} />
      ))}
    </Carousel>
  );
}
