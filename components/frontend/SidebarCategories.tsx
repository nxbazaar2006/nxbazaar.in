import { getData } from "@/lib/getData";
import { asArray } from "@/lib/normalizeApiData";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function SidebarCategories() {
  const categoriesData = await getData("categories");
  const categories = asArray(categoriesData).filter(
    (category: any) => Array.isArray(category.products) && category.products.length > 0
  );

  return (
    <aside className="liquid-card frontend-glass sticky top-24 hidden overflow-hidden rounded-[36px] text-slate-800 shadow-xl border border-white/60 lg:block lg:col-span-3">
      <h2 className="border-b border-white/55 bg-white/40 py-4 px-6 font-bold text-slate-900 text-base flex items-center justify-between">
        <span>Shop By Category</span>
        <span className="rounded-full bg-slate-900/10 px-2.5 py-0.5 text-xs font-extrabold text-slate-800">
          {categories.length}
        </span>
      </h2>
      <div className="p-4 max-h-[calc(100vh-160px)] overflow-y-auto flex flex-col gap-2.5 custom-scrollbar">
        {categories.map((category: any, i: number) => {
          const hasImage =
            typeof category.imageUrl === "string" && category.imageUrl.trim().length > 0;
          return (
            <Link
              key={category.id || i}
              href={`/category/${category.slug}`}
              className="group flex items-center gap-3.5 rounded-2xl p-2 transition-all duration-300 hover:bg-white/50 hover:shadow-md hover:-translate-y-0.5"
            >
              {hasImage ? (
                <Image
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-xl border border-white/80 bg-white object-cover shadow-sm transition group-hover:scale-105"
                  src={category.imageUrl}
                  alt={category.title || "Category"}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/70 text-xs font-bold uppercase text-slate-800 shadow-sm">
                  {category.title ? category.title.charAt(0) : "C"}
                </div>
              )}
              <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                {category.title}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
