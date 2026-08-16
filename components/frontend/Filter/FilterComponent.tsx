import { getCatalogTheme } from "@/lib/theme/catalog-theme";
import Link from "next/link";
import React from "react";
import Breadcrumb from "./Breadcrumb";
import Sorting from "./Sorting";
import Filters from "./Filters";
import FilteredProducts from "./FilteredProducts";

export default function FilterComponent({ category, products, selectedSubCategorySlug }) {
  const { title, slug } = category;
  const productCount = products.length;
  const subCategories = category.subCategories ?? [];
  const categoryTheme = getCatalogTheme({
    departmentId: category.departmentId,
    departmentSlug: category.department?.slug ?? category.departmentSlug,
    categoryId: category.id,
    categorySlug: category.slug,
  });

  return (
    <div className={`${categoryTheme.categoryClassName} nx-catalog-theme`}>
      <div className="liquid-card nx-theme-surface space-y-6 px-4 py-8 text-slate-900">
        <Breadcrumb title={title} resultCount={productCount} />
        <Sorting isSearch={category?.isSearch} title={title} slug={slug} />

        {subCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/category/${slug}`}
              className={
                selectedSubCategorySlug
                  ? "rounded-full border border-white/60 bg-white/55 px-4 py-2 text-sm text-slate-900"
                  : "nx-theme-accent-bg rounded-full px-4 py-2 text-sm font-semibold text-white"
              }
            >
              All
            </Link>

            {subCategories.map((subCategory) => {
              const subTheme = getCatalogTheme({
                departmentId: category.departmentId,
                departmentSlug: category.department?.slug ?? category.departmentSlug,
                categoryId: category.id,
                categorySlug: category.slug,
                subCategoryId: subCategory.id,
                subCategorySlug: subCategory.slug,
              });
              const active = selectedSubCategorySlug === subCategory.slug;

              return (
                <Link
                  key={subCategory.id}
                  href={`/category/${slug}?subCategory=${subCategory.slug}`}
                  className={`${subTheme.subCategoryClassName} ${
                    active
                      ? "nx-theme-accent-bg border-transparent text-white"
                      : "nx-theme-surface text-slate-900"
                  } rounded-full border px-4 py-2 text-sm font-medium transition hover:brightness-105`}
                >
                  {subCategory.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4 py-8">
        <div className="col-span-3">
          <Filters slug={slug} isSearch={category?.isSearch} />
        </div>
        <div className="col-span-9">
          <FilteredProducts
            isSearch={category?.isSearch}
            productCount={productCount}
            products={products}
          />
        </div>
      </div>
    </div>
  );
}
