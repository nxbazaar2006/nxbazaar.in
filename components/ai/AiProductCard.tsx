"use client";
import Image from "next/image";
import Link from "next/link";
import { getSingleImageUrl } from "@/lib/image-utils";

export type AiProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    salePrice: number;
    productPrice: number;
    stock: number;
    category: string;
    brand: string | null;
  };
};

export default function AiProductCard({ product }: AiProductCardProps) {
  const imageUrl = product.imageUrl ? getSingleImageUrl(product.imageUrl) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="grid grid-cols-[64px_1fr] gap-3 rounded-lg border border-white/15 bg-white/10 p-2 text-left outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-cyan-200"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-white/10">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.title} fill className="object-cover" sizes="64px" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-white">{product.title}</p>
        <p className="mt-1 text-xs text-white/70">{product.brand ?? product.category}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-cyan-100">₹{product.salePrice.toLocaleString("en-IN")}</span>
          <span className="text-xs text-white/65">{product.stock > 0 ? "In stock" : "Out of stock"}</span>
        </div>
      </div>
    </Link>
  );
}
