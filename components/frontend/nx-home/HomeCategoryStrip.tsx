"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { NxHomeCategory } from "./types";
import NxSafeMedia from "./NxSafeMedia";
import HomeSectionHeading from "./HomeSectionHeading";

interface Props {
  categories?: NxHomeCategory[];
  unavailable?: boolean;
}

export default function HomeCategoryStrip({ categories = [], unavailable = false }: Props) {
  const { t } = useTranslation();
  const displayCategories = categories.slice(0, 8);

  return (
    <section className="nx-category-section" aria-labelledby="nx-popular-categories">
      <HomeSectionHeading
        sectionKey="popular-categories"
        eyebrowKey="home.marketplace"
        titleKey="home.featuredCategories"
        href={displayCategories.length > 0 ? "/search" : undefined}
      />

      {displayCategories.length === 0 ? (
        <div className={`nx-home-state${unavailable ? " is-error" : ""}`}>
          {unavailable ? "Categories are temporarily unavailable." : t("common.noData")}
        </div>
      ) : (
        <div className="nx-category-strip">
          {displayCategories.map((category) => {
            const content = (
              <>
                <span className="nx-category-icon">
                  <NxSafeMedia
                    src={category.imageUrl}
                    alt={category.title || "Category"}
                    sizes="40px"
                    className="object-cover rounded-full"
                    fallback={<Package />}
                  />
                </span>
                <span>{category.title}</span>
              </>
            );

            if (category.slug) {
              return (
                <Link
                  key={category.id || category.slug}
                  href={`/category/${category.slug}`}
                  className="nx-category-chip nx-glass-card"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={category.id || category.title}
                className="nx-category-chip nx-glass-card"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
