"use client";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { LiquidGlassIconButton } from "@/components/ui/liquid-glass-icon-button";
import { useTranslation } from "@/hooks/useTranslation";
import { getSingleImageUrl } from "@/lib/image-utils";
import { addToCart } from "@/redux/slices/cartSlice";
import { BaggageClaim, Eye, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function Product({ product }: { product: any }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const initialImageUrl = getSingleImageUrl(product?.imageUrl);
  const [imgSrc, setImgSrc] = useState(initialImageUrl);
  const [hasError, setHasError] = useState(false);

  function handleAddToCart() {
    if (product.productType === "VARIABLE") {
      const variant =
        product.variants?.find((item: any) => item.isDefault && item.isActive) ||
        product.variants?.find((item: any) => item.isActive);

      if (!variant) {
        toast.error("Please open product and select a variant.");
        return false;
      }

      if (variant.stock <= 0) {
        toast.error("Selected variant is out of stock.");
        return false;
      }

      dispatch(
        addToCart({
          ...product,
          productVariantId: variant.id,
          selectedAttributes: (variant.values || []).map((entry: any) => ({
            attribute: entry.attribute?.name,
            value: entry.attributeValue?.value,
          })),
          title: `${product.title} - ${variant.title}`,
          salePrice: variant.price,
          imageUrl: variant.imageUrl || product.imageUrl,
          sku: variant.sku,
        }),
      );
      toast.success("Item added Successfully");
      return true;
    }

    dispatch(addToCart(product));
    toast.success("Item added Successfully");
    return true;
  }

  function handleBuyNow() {
    if (handleAddToCart()) {
      router.push("/checkout");
    }
  }

  return (
    <div className="liquid-card w-full h-full rounded-[24px] border border-white/25 bg-white/15 backdrop-blur-2xl p-4 sm:p-5 lg:p-6 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-[3px] hover:border-white/40 hover:bg-white/20 group relative flex flex-col justify-between overflow-hidden">
      <div className="relative overflow-hidden rounded-[20px]">
        <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-[20px]">
          {imgSrc && !hasError ? (
            <Image
              src={imgSrc}
              alt={product?.title || "Product"}
              width={556}
              height={556}
              className="h-44 sm:h-48 w-full rounded-[20px] bg-white object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => {
                setImgSrc("/vegetables.png");
                setHasError(true);
              }}
            />
          ) : (
            <div className="flex h-44 sm:h-48 w-full items-center justify-center rounded-[20px] bg-white/60 text-slate-400 font-semibold">
              No Image
            </div>
          )}
        </Link>
        <div className="absolute right-3 top-3 flex gap-2 z-10">
          <LiquidGlassIconButton
            aria-label="Wishlist"
            variant="secondary"
            onClick={() => toast.success("Added to wishlist")}
          >
            <Heart className="h-4 w-4" />
          </LiquidGlassIconButton>
          <LiquidGlassIconButton aria-label="Quick View" variant="cyan" asChild>
            <Link href={`/products/${product.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </LiquidGlassIconButton>
        </div>
      </div>

      <div className="flex flex-col flex-grow justify-between pt-3">
        <Link href={`/products/${product.slug}`}>
          <h2 className="my-2 text-center font-bold text-slate-900 line-clamp-2 text-sm sm:text-base leading-relaxed group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h2>
        </Link>

        <div className="flex items-center justify-center gap-2 py-2 text-slate-900 font-extrabold text-base sm:text-lg">
          <span>
            UGX{" "}
            {product.productType === "VARIABLE" && product.minVariantPrice
              ? product.minVariantPrice
              : product.salePrice}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <LiquidGlassButton
            onClick={handleAddToCart}
            size="sm"
            variant="success"
            leftIcon={<BaggageClaim className="h-4 w-4" />}
            className="!text-white [&_*]:!text-white [&_svg]:!stroke-white [&_svg]:!text-white text-xs"
            fullWidth
          >
            {t("common.addToCart")}
          </LiquidGlassButton>
          <LiquidGlassButton
            onClick={handleBuyNow}
            size="sm"
            variant="primary"
            leftIcon={<ShoppingBag className="h-4 w-4" />}
            className="text-xs"
            fullWidth
          >
            {t("common.buyNow")}
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  );
}
