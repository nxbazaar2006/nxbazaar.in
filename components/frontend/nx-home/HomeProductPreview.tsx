"use client";

import Link from "next/link";
import { Heart, Package } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { NxHomeProduct } from "./types";
import NxSafeMedia from "./NxSafeMedia";
import HomeSectionHeading from "./HomeSectionHeading";

interface Props {
  sectionKey?: string;
  eyebrow?: string;
  title?: string;
  titleKey?: string;
  eyebrowKey?: string;
  products?: NxHomeProduct[];
  unavailable?: boolean;
  emptyMessage?: string;
  emptyMessageKey?: string;
}

function formatPrice(value?: number | null) {
  if (value == null) {
    return "View price";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HomeProductPreview({
  sectionKey = "trending-products",
  eyebrow = "Marketplace",
  title = "Trending Products",
  products = [],
  unavailable = false,
  emptyMessage = "No products available yet.",
  titleKey,
  eyebrowKey,
  emptyMessageKey,
}: Props) {
  const { t } = useTranslation();
  const displayProducts = products.slice(0, 6);
  const headingId = `nx-${sectionKey}`;

  return (
    <section className="nx-products-preview" aria-labelledby={headingId}>
      <HomeSectionHeading
        sectionKey={sectionKey}
        eyebrowKey={eyebrowKey || "home.marketplace"}
        titleKey={titleKey || "home.trendingProducts"}
        href={displayProducts.length > 0 ? "/search" : undefined}
      />

      {displayProducts.length === 0 ? (
        <div className={`nx-home-state${unavailable ? " is-error" : ""}`}>
          {unavailable ? "Products are temporarily unavailable." : emptyMessageKey ? t(emptyMessageKey) : emptyMessage}
        </div>
      ) : (
        <div className="nx-preview-grid">
          {displayProducts.map((product) => {
            const price = product.salePrice ?? product.productPrice ?? null;
            const categoryName = product.categoryName || "Marketplace";

            const cardBody = (
              <>
                <div className="nx-preview-media">
                  <NxSafeMedia
                    src={product.imageUrl}
                    alt={product.title || "Product"}
                    sizes="(max-width: 430px) 80vw, (max-width: 767px) 42vw, (max-width: 1023px) 30vw, 160px"
                    className="object-contain p-1"
                    fallback={<Package />}
                  />
                </div>

                <div className="nx-preview-info">
                  <span>{categoryName}</span>
                  <strong>{product.title || "Untitled product"}</strong>
                  <b>{formatPrice(price)}</b>
                </div>
              </>
            );

            return (
              <article key={product.id || product.slug} className="nx-preview-card">
                <button
                  type="button"
                  className="nx-preview-heart"
                  aria-label={`Save ${product.title}`}
                  aria-disabled="true"
                  disabled
                >
                  <Heart />
                </button>

                {product.slug ? (
                  <Link
                    href={`/products/${product.slug}`}
                    className="nx-preview-card-body"
                  >
                    {cardBody}
                  </Link>
                ) : (
                  <div className="nx-preview-card-body">{cardBody}</div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
